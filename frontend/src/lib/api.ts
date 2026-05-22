/** Backend base URL — set VITE_API_URL in frontend/.env (e.g. http://localhost:3001) */
export const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "http://localhost:3001";

export function apiPath(path: string) {
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
