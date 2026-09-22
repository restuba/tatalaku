/**
 * Client-side session marker cookie.
 *
 * The real refresh token is an httpOnly cookie owned by the API domain
 * (tatalaku-services.up.railway.app). Because the web app runs on a different
 * site (tatalaku.up.railway.app) and `up.railway.app` is on the Public Suffix
 * List, that cookie can never be shared with the web domain — so the Next.js
 * proxy/middleware cannot read it to gate protected routes.
 *
 * To let the proxy know a session exists, we set this NON-sensitive marker
 * cookie on the web domain right after a successful auth. It carries no token,
 * only the fact that the user signed in. The API remains the source of truth:
 * a stale marker just triggers a refresh attempt that the API rejects with 401.
 */
const SESSION_FLAG_COOKIE = "tatalaku_session";
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // mirror refresh token lifetime

export function setSessionFlag(): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${SESSION_FLAG_COOKIE}=1; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

export function clearSessionFlag(): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${SESSION_FLAG_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

export { SESSION_FLAG_COOKIE };
