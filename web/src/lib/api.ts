import type { SessionData } from './types';
export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); this.name = 'ApiError'; }
}
interface ApiOptions { method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'; body?: unknown; idempotencyKey?: string; signal?: AbortSignal }
let sessionPromise: Promise<SessionData> | null = null;
let csrfToken: string | null = null;
async function readError(response: Response) {
  const data = await response.json().catch(() => null) as { message?: string | string[] } | null;
  return Array.isArray(data?.message) ? data.message.join('. ') : data?.message ?? 'No pudimos completar la solicitud. Inténtalo de nuevo.';
}
export async function getSession(): Promise<SessionData> {
  if (!sessionPromise) {
    sessionPromise = fetch('/api/v1/auth/session', { credentials: 'same-origin', cache: 'no-store' })
      .then(async response => { if (!response.ok) throw new ApiError(await readError(response), response.status); return response.json() as Promise<SessionData>; })
      .then(data => { csrfToken = data.csrfToken; return data; })
      .finally(() => { sessionPromise = null; });
  }
  return sessionPromise;
}
export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const method = options.method ?? 'GET';
  // Comparte las solicitudes de inicialización para que dos componentes montados no creen dos sesiones
  // de invitado ni dejen en el navegador una cookie y un token de sesiones diferentes.
  if (method === 'GET' && path === '/auth/session') return getSession() as Promise<T>;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (method !== 'GET') {
    if (!csrfToken) await getSession();
    headers['X-CSRF-Token'] = csrfToken!;
    headers['Content-Type'] = 'application/json';
  }
  if (options.idempotencyKey) headers['Idempotency-Key'] = options.idempotencyKey;
  const response = await fetch(`/api/v1${path}`, { method, headers, body: options.body === undefined ? undefined : JSON.stringify(options.body), credentials: 'same-origin', cache: 'no-store', signal: options.signal });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) csrfToken = null;
    throw new ApiError(await readError(response), response.status);
  }
  if (response.status === 204) return undefined as T;
  const result = await response.json() as T;
  if (result && typeof result === 'object' && 'csrfToken' in result) csrfToken = String(result.csrfToken);
  if (path === '/auth/logout') csrfToken = null;
  return result;
}
