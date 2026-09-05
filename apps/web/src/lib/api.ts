import { ApiRequestError } from "@/helpers/api-error";
import { getAccessToken, setAccessToken } from "@/helpers/auth-token";
import { fetcher } from "@/helpers/fetcher";
import type { HttpMethod } from "@/helpers/fetcher";

// Auth services
import { getMe } from "@/services/auth/get-me";
import { login } from "@/services/auth/login";
import { logout } from "@/services/auth/logout";
import { refreshToken } from "@/services/auth/refresh-token";
import { register } from "@/services/auth/register";

// Workspace services
import { acceptInvite } from "@/services/workspace/accept-invite";
import { createWorkspace } from "@/services/workspace/create-workspace";
import { deleteWorkspace } from "@/services/workspace/delete-workspace";
import { getListWorkspaces } from "@/services/workspace/get-list-workspaces";
import { getMembers } from "@/services/workspace/get-members";
import { getWorkspace } from "@/services/workspace/get-workspace";
import { inviteMember } from "@/services/workspace/invite-member";
import { removeMember } from "@/services/workspace/remove-member";
import { updateWorkspace } from "@/services/workspace/update-workspace";

// Page services
import { archivePage } from "@/services/page/archive-page";
import { createPage } from "@/services/page/create-page";
import { getChildrenPages } from "@/services/page/get-children-pages";
import { getListPages } from "@/services/page/get-list-pages";
import { getPage } from "@/services/page/get-page";
import { restorePage } from "@/services/page/restore-page";
import { updatePage } from "@/services/page/update-page";

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

/**
 * Backward-compatible api object delegating to granular action services.
 */
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
    register,
    login,
    refresh: refreshToken,
    logout,
    me: getMe,
  },

  workspaces: {
    list: getListWorkspaces,
    create: createWorkspace,
    get: getWorkspace,
    update: updateWorkspace,
    delete: deleteWorkspace,
    inviteMember,
    acceptInvite,
    removeMember,
    getMembers,
  },

  pages: {
    list: getListPages,
    getChildren: getChildrenPages,
    get: getPage,
    create: createPage,
    update: updatePage,
    archive: archivePage,
    restore: restorePage,
  },
};
