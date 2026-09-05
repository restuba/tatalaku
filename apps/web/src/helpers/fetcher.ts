import { ApiRequestError } from "./api-error";
import { getAccessToken, setAccessToken } from "./auth-token";
import { tokenRefreshManager } from "./token-refresh-manager";

const API_BASE = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5000/api";

export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
export type FetchResponseType = "json" | "blob" | "text" | "file";

export interface FetchConfig {
  url: string;
  method?: HttpMethod | undefined;
  body?: unknown;
  headers?: Record<string, string> | undefined;
  type?: FetchResponseType | undefined;
  cache?: RequestInit["cache"] | undefined;
  credentials?: RequestCredentials | undefined;
  /** Internal flag to avoid infinite loops during 401 retry */
  _skipRetry?: boolean | undefined;
}

interface ApiErrorPayload {
  error?:
    | {
        code?: string | undefined;
        message?: string | undefined;
        errors?: unknown[] | undefined;
      }
    | undefined;
  message?: string | undefined;
  code?: string | undefined;
  errors?: unknown[] | undefined;
}

/**
 * Executes a token refresh call deduplicated by tokenRefreshManager.
 */
export async function performTokenRefresh(): Promise<string | null> {
  return tokenRefreshManager.getToken(async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include", // send httpOnly refreshToken cookie
      });

      if (!res.ok) {
        setAccessToken(null);
        if (res.status >= 500) {
          throw new Error(`Server error during refresh: ${res.status}`);
        }
        return null;
      }

      const json = (await res.json()) as {
        success: boolean;
        data: { accessToken: string };
      };
      const token = json.data?.accessToken ?? null;
      setAccessToken(token);
      return token;
    } catch (err) {
      setAccessToken(null);
      if (
        err instanceof TypeError ||
        (err instanceof Error && err.message.includes("Server error"))
      ) {
        throw err;
      }
      return null;
    }
  });
}

/**
 * Standardized HTTP fetcher wrapper for apps/web.
 */
export async function fetcher<T>(config: FetchConfig): Promise<T> {
  const {
    url,
    method = "GET",
    body,
    headers = {},
    type = "json",
    cache,
    credentials = "include",
    _skipRetry = false,
  } = config;

  const targetUrl =
    url.startsWith("http://") || url.startsWith("https://")
      ? url
      : `${API_BASE}${url.startsWith("/") ? url : `/${url}`}`;

  const builtHeaders: Record<string, string> = { ...headers };

  if (type !== "file" && !(body instanceof FormData)) {
    builtHeaders["Content-Type"] = builtHeaders["Content-Type"] ?? "application/json";
  }

  const currentToken = getAccessToken();
  if (currentToken) {
    builtHeaders["Authorization"] = `Bearer ${currentToken}`;
  }

  const fetchInit: RequestInit = {
    method,
    headers: builtHeaders,
    credentials,
    ...(cache ? { cache } : {}),
  };

  if (body !== undefined) {
    if (body instanceof FormData) {
      fetchInit.body = body;
    } else if (type === "file") {
      fetchInit.body = body as BodyInit;
    } else {
      fetchInit.body = JSON.stringify(body);
    }
  }

  let res: Response;
  try {
    res = await fetch(targetUrl, fetchInit);
  } catch (error: unknown) {
    if (error instanceof ApiRequestError) throw error;
    throw new ApiRequestError(
      0,
      "NETWORK_ERROR",
      "Failed to connect to server. Please check your network connection.",
    );
  }

  // Auto-refresh on 401
  if (
    res.status === 401 &&
    !_skipRetry &&
    !targetUrl.includes("/auth/login") &&
    !targetUrl.includes("/auth/refresh")
  ) {
    const newToken = await performTokenRefresh();
    if (newToken) {
      return fetcher<T>({
        ...config,
        _skipRetry: true,
      });
    }
    setAccessToken(null);
  }

  if (!res.ok) {
    let errorPayload: ApiErrorPayload = {};
    try {
      errorPayload = (await res.json()) as ApiErrorPayload;
    } catch {
      // Ignore JSON parse errors for non-JSON responses
    }

    const code = errorPayload.error?.code ?? errorPayload.code ?? "UNKNOWN_ERROR";
    const message =
      errorPayload.error?.message ?? errorPayload.message ?? "An unexpected error occurred";
    const errors = errorPayload.error?.errors ?? errorPayload.errors;

    throw new ApiRequestError(res.status, code, message, errors);
  }

  if (type === "blob") {
    return (await res.blob()) as unknown as T;
  }
  if (type === "text") {
    return (await res.text()) as unknown as T;
  }

  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return (await res.json()) as T;
  }

  const text = await res.text();
  if (!text) return {} as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

export default fetcher;
