// src/helpers/index.ts
import type { Empleado } from '../models/Empleado';
import type { AuthUser } from '../models/auth.model';

// Cache de cookie CSRF para evitar parsear document.cookie en cada llamada (rule 7.5)
let csrfCookieCache: string | null | undefined;

export function getCSRFTokenFromCookie(): string | null {
  if (csrfCookieCache !== undefined) return csrfCookieCache;

  const cookieName = import.meta.env.VITE_CSRF_COOKIE_NAME ?? 'csrf_token';
  const name = `${cookieName}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');
  
  for (const cookie of cookieArray) {
    const trimmed = cookie.trim();
    if (trimmed.indexOf(name) === 0) {
      csrfCookieCache = trimmed.substring(name.length, trimmed.length);
      return csrfCookieCache;
    }
  }
  csrfCookieCache = null;
  return null;
}

// Invalidar cache cuando cambie el documento (ej. tras login/logout)
export function invalidateCsrfCache(): void {
  csrfCookieCache = undefined;
}

export const getCsrfTokenFromCookie = getCSRFTokenFromCookie;

export const mapEmpleadoToAuthUser = (empleado: Empleado): AuthUser => ({
  id: empleado.id,
  nombre: empleado.nombre,
  email: empleado.email,
});

// RegExp hoisted a nivel de módulo para evitar recreación (rule 7.9)
const HTTP_URL_RE = /^https?:\/\//i;
const FILE_EXT_RE = /\.[a-z0-9]{2,4}$/i;

export function resolvePublicImage(
  raw?: string | null,
  options?: { folder?: string; defaultExt?: string }
) {
  const folder = options?.folder ?? 'images/productos';
  const defaultExt = options?.defaultExt ?? 'jpg';
  if (!raw) return '';
  if (HTTP_URL_RE.test(raw)) return raw; // URL absoluta
  if (raw.startsWith('/')) return raw; // ruta absoluta ya resuelta

  const hasExt = FILE_EXT_RE.test(raw);
  if (raw.startsWith('images/')) {
    return `/${raw}${hasExt ? '' : `.${defaultExt}`}`;
  }

  const base = import.meta.env.BASE_URL ?? '/';
  const baseClean = `${base}`.endsWith('/') ? `${base}`.slice(0, -1) : `${base}`;
  return `${baseClean}/${folder}/${raw}${hasExt ? '' : `.${defaultExt}`}`;
}

/*
Helpers:
1) getCSRFTokenFromCookie: Obtiene el token CSRF desde la cookie no-httpOnly (por defecto `csrf_token`, configurable vía VITE_CSRF_COOKIE_NAME). Se usa para CSRF Double Submit enviándolo en el header `X-CSRF-Token`.
2) getCsrfTokenFromCookie: alias camelCase para el helper anterior.
3) mapEmpleadoToAuthUser: Convierte un empleado completo a la estructura mínima requerida en autenticación (id, nombre, email).
4) resolvePublicImage: Construye una URL pública para imágenes, respetando rutas absolutas y `BASE_URL` de Vite.
*/
