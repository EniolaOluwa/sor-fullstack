/**
 * Shared with `src/proxy.ts` (which cannot import from `server-only` modules),
 * so the cookie name lives in its own dependency-free file.
 */
export const SESSION_COOKIE_NAME = "sor_session";
