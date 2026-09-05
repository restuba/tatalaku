/**
 * Singleton manager to deduplicate concurrent refresh token requests.
 */
class TokenRefreshManager {
  private static instance: TokenRefreshManager;
  private refreshPromise: Promise<string | null> | null = null;
  private pendingRequests: Array<{
    resolve: (token: string | null) => void;
    reject: (error: unknown) => void;
  }> = [];

  private constructor() {}

  static getInstance(): TokenRefreshManager {
    if (!TokenRefreshManager.instance) {
      TokenRefreshManager.instance = new TokenRefreshManager();
    }
    return TokenRefreshManager.instance;
  }

  async getToken(refreshFn: () => Promise<string | null>): Promise<string | null> {
    if (this.refreshPromise) {
      return new Promise<string | null>((resolve, reject) => {
        this.pendingRequests.push({ resolve, reject });
      });
    }

    this.refreshPromise = refreshFn()
      .then((token) => {
        this.pendingRequests.forEach((req) => req.resolve(token));
        this.pendingRequests = [];
        return token;
      })
      .catch((error: unknown) => {
        this.pendingRequests.forEach((req) => req.reject(error));
        this.pendingRequests = [];
        throw error;
      })
      .finally(() => {
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }

  clear(): void {
    this.refreshPromise = null;
    this.pendingRequests = [];
  }
}

export const tokenRefreshManager = TokenRefreshManager.getInstance();
export default tokenRefreshManager;
