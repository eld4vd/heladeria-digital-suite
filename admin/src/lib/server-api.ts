import 'server-only';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { ApiError } from './api';
const origin = process.env.API_INTERNAL_URL ?? 'http://127.0.0.1:4000';
// React memoriza únicamente durante un renderizado del servidor. Se conserva no-store y se incluye
// la cookie en la clave: las respuestas privadas nunca se comparten entre visitantes.
// Sin este ajuste, la señal de tiempo límite desactiva la memorización automática de fetch en Next.
const request = cache(async (path: string, cookie?: string): Promise<unknown> => {
  const response = await fetch(`${origin}/api/v1${path}`, { cache: 'no-store', headers: cookie ? { Cookie: cookie } : undefined, signal: AbortSignal.timeout(8000) });
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { message?: string } | null;
    throw new ApiError(payload?.message ?? 'El servicio no está disponible en este momento.', response.status);
  }
  return response.json();
});
export function publicApi<T>(path: string) { return request(path) as Promise<T>; }
export async function privateApi<T>(path: string) { return request(path, (await cookies()).toString()) as Promise<T>; }
