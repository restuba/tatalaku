import type { User, Workspace, Page, PaginatedResponse } from "@tatalaku/shared";
import type { AuthResponse } from "@/types/auth.types";

import { ApiRequestError } from "@/helpers/api-error";
import { getAccessToken, setAccessToken } from "@/helpers/auth-token";
import { fetcher, performTokenRefresh } from "@/helpers/fetcher";
import type { HttpMethod } from "@/helpers/fetcher";

export { ApiRequestError, setAccessToken, getAccessToken };

interface RequestOptions {
  method?: HttpMethod | undefined;
  body?: unknown;
  headers?: Record<string, string> | undefined;
  /** Skip the 401 auto-refresh retry (used internally to avoid infinite loops) */
  _skipRetry?: boolean | undefined;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return fetcher<T>({
    url: path,
    method: options.method ?? "GET",
    body: options.body,
    headers: options.headers,
    _skipRetry: options._skipRetry,
  });
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
    refresh: () => performTokenRefresh(),
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
        content?: string | null;
        isArchived?: boolean;
      },
    ) => request<{ success: boolean; data: Page }>(`/pages/${id}`, { method: "PATCH", body }),
    archive: (id: string) =>
      request<{ success: boolean; data: Page }>(`/pages/${id}`, { method: "DELETE" }),
    restore: (id: string) =>
      request<{ success: boolean; data: Page }>(`/pages/${id}/restore`, { method: "POST" }),
  },
};
