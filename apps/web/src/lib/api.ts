import type { User, Workspace, Page, Block, BlockType, PaginatedResponse } from "@tatalaku/shared";
import type { AuthResponse, RefreshResponse } from "@/features/auth/auth.types";

const API_BASE = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5000/api";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  /** Skip the 401 auto-refresh retry (used internally to avoid infinite loops) */
  _skipRetry?: boolean;
}

interface ApiError {
  code: string;
  message: string;
}

export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

// In-memory access token — not persisted in localStorage/cookies (XSS safe)
let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

async function doRefresh(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include", // send httpOnly refreshToken cookie
    });

    if (!res.ok) {
      accessToken = null;
      return null;
    }

    const json = (await res.json()) as RefreshResponse;
    accessToken = json.data.accessToken;
    return accessToken;
  } catch {
    accessToken = null;
    return null;
  }
}

/** Deduplicate concurrent refresh calls into a single in-flight request */
async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {}, _skipRetry = false } = options;

  const builtHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (accessToken) {
    builtHeaders["Authorization"] = `Bearer ${accessToken}`;
  }

  const fetchInit: RequestInit = {
    method,
    headers: builtHeaders,
    credentials: "include",
  };

  // Only set body if defined — avoids exactOptionalPropertyTypes violation
  if (body !== undefined) {
    fetchInit.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${path}`, fetchInit);

  // ── Auto-refresh on 401 ───────────────────────────────────────────────────────
  if (res.status === 401 && !_skipRetry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return request<T>(path, { ...options, _skipRetry: true });
    }
    // Refresh failed — clear token (user will be redirected by middleware/store)
    accessToken = null;
  }

  if (!res.ok) {
    let errorBody: { error?: ApiError } = {};
    try {
      errorBody = (await res.json()) as { error?: ApiError };
    } catch {
      // ignore parse errors
    }
    throw new ApiRequestError(
      res.status,
      errorBody.error?.code ?? "UNKNOWN",
      errorBody.error?.message ?? "An unexpected error occurred",
    );
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, headers?: Record<string, string>) =>
    request<T>(path, { method: "GET", ...(headers ? { headers } : {}) }),

  post: <T>(path: string, body?: unknown, headers?: Record<string, string>) =>
    request<T>(path, { method: "POST", body, ...(headers ? { headers } : {}) }),

  patch: <T>(path: string, body?: unknown, headers?: Record<string, string>) =>
    request<T>(path, { method: "PATCH", body, ...(headers ? { headers } : {}) }),

  put: <T>(path: string, body?: unknown, headers?: Record<string, string>) =>
    request<T>(path, { method: "PUT", body, ...(headers ? { headers } : {}) }),

  delete: <T>(path: string, headers?: Record<string, string>) =>
    request<T>(path, { method: "DELETE", ...(headers ? { headers } : {}) }),

  auth: {
    register: (body: { name: string; email: string; password: string }) =>
      request<AuthResponse>("/auth/register", { method: "POST", body }),
    login: (body: { email: string; password: string }) =>
      request<AuthResponse>("/auth/login", { method: "POST", body }),
    refresh: () => refreshAccessToken(),
    logout: () => request<{ success: boolean; data: null }>("/auth/logout", { method: "POST" }),
    me: () =>
      request<{
        success: boolean;
        data: { user: User };
      }>("/auth/me"),
  },

  workspaces: {
    list: (params?: { page?: number; limit?: number }) => {
      const sp = new URLSearchParams();
      if (params?.page) sp.set("page", params.page.toString());
      if (params?.limit) sp.set("limit", params.limit.toString());
      return request<{
        success: boolean;
        data: Workspace[];
        meta: PaginatedResponse<Workspace>["meta"];
      }>(`/workspaces?${sp.toString()}`);
    },
    create: (body: { name: string }) =>
      request<{ success: boolean; data: Workspace }>("/workspaces", { method: "POST", body }),
    get: (id: string) => request<{ success: boolean; data: Workspace }>(`/workspaces/${id}`),
    update: (id: string, body: { name: string }) =>
      request<{ success: boolean; data: Workspace }>(`/workspaces/${id}`, {
        method: "PATCH",
        body,
      }),
    delete: (id: string) =>
      request<{ success: boolean; data: null }>(`/workspaces/${id}`, { method: "DELETE" }),
    inviteMember: (workspaceId: string, email: string) =>
      request<{ success: boolean; data: null; message: string }>(
        `/workspaces/${workspaceId}/invites`,
        {
          method: "POST",
          body: { email },
        },
      ),
    acceptInvite: (workspaceId: string, token: string) =>
      request<{ success: boolean; data: null; message: string }>(
        `/workspaces/${workspaceId}/invites/accept`,
        {
          method: "POST",
          body: { token },
        },
      ),
    removeMember: (workspaceId: string, userId: string) =>
      request<{ success: boolean; data: null; message: string }>(
        `/workspaces/${workspaceId}/members/${userId}`,
        {
          method: "DELETE",
        },
      ),
    getMembers: (workspaceId: string) =>
      request<{
        success: boolean;
        data: Array<{
          id: string;
          name: string;
          email: string;
          avatarUrl: string | null;
          role: "owner" | "member";
        }>;
      }>(`/workspaces/${workspaceId}/members`),
  },

  pages: {
    list: (params: {
      workspaceId: string;
      parentPageId?: string | null;
      includeArchived?: boolean;
      page?: number;
      limit?: number;
    }) => {
      const sp = new URLSearchParams();
      sp.set("workspaceId", params.workspaceId);
      if (params.parentPageId !== undefined && params.parentPageId !== null) {
        sp.set("parentPageId", params.parentPageId);
      }
      if (params.includeArchived) {
        sp.set("includeArchived", "true");
      }
      if (params.page) sp.set("page", params.page.toString());
      if (params.limit) sp.set("limit", params.limit.toString());
      return request<{ success: boolean; data: Page[]; meta: PaginatedResponse<Page>["meta"] }>(
        `/pages?${sp.toString()}`,
      );
    },
    getChildren: (pageId: string) =>
      request<{ success: boolean; data: Page[] }>(`/pages/${pageId}/children`),
    get: (id: string) => request<{ success: boolean; data: Page }>(`/pages/${id}`),
    create: (body: {
      workspaceId: string;
      parentPageId?: string | null;
      title?: string;
      icon?: string | null;
    }) => request<{ success: boolean; data: Page }>("/pages", { method: "POST", body }),
    update: (
      id: string,
      body: {
        title?: string;
        icon?: string | null;
        coverImage?: string | null;
        parentPageId?: string | null;
        isArchived?: boolean;
      },
    ) => request<{ success: boolean; data: Page }>(`/pages/${id}`, { method: "PATCH", body }),
    archive: (id: string) =>
      request<{ success: boolean; data: Page }>(`/pages/${id}`, { method: "DELETE" }),
    restore: (id: string) =>
      request<{ success: boolean; data: Page }>(`/pages/${id}/restore`, { method: "POST" }),
    syncBlocks: (
      pageId: string,
      blocks: Array<{
        id?: string;
        type: BlockType;
        content?: unknown;
        order: number;
        parentBlockId?: string | null;
      }>,
    ) =>
      request<{ success: boolean; data: Block[] }>(`/pages/${pageId}/blocks`, {
        method: "PATCH",
        body: { blocks },
      }),
  },

  blocks: {
    listByPage: (pageId: string) =>
      request<{ success: boolean; data: Block[] }>(`/blocks/page/${pageId}`),
    create: (body: {
      pageId: string;
      type: BlockType;
      content?: unknown;
      order: number;
      parentBlockId?: string | null;
    }) => request<{ success: boolean; data: Block }>("/blocks", { method: "POST", body }),
    update: (
      id: string,
      body: {
        type?: BlockType;
        content?: unknown;
        order?: number;
        parentBlockId?: string | null;
      },
    ) => request<{ success: boolean; data: Block }>(`/blocks/${id}`, { method: "PATCH", body }),
    delete: (id: string) =>
      request<{ success: boolean; data: null }>(`/blocks/${id}`, { method: "DELETE" }),
    reorder: (pageId: string, blocks: Array<{ id: string; order: number }>) =>
      request<{ success: boolean; data: Block[] }>("/blocks/reorder", {
        method: "PATCH",
        body: { pageId, blocks },
      }),
    sync: (
      pageId: string,
      blocks: Array<{
        id?: string;
        type: BlockType;
        content?: unknown;
        order: number;
        parentBlockId?: string | null;
      }>,
    ) =>
      request<{ success: boolean; data: Block[] }>(`/pages/${pageId}/blocks`, {
        method: "PATCH",
        body: { blocks },
      }),
  },
};
