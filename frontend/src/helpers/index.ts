// src/helpers/index.ts
import type { Empleado } from '../models/Empleado';
import type { AuthUser } from '../models/auth.model';

export function getCSRFTokenFromCookie(): string | null {
  const cookieName = import.meta.env.VITE_CSRF_COOKIE_NAME ?? 'csrf_token';
  const name = `${cookieName}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');
  
  for (const cookie of cookieArray) {
    const trimmed = cookie.trim();
    if (trimmed.indexOf(name) === 0) {
      return trimmed.substring(name.length, trimmed.length);
    }
  }
  return null;
}

export const getCsrfTokenFromCookie = getCSRFTokenFromCookie;

export const mapEmpleadoToAuthUser = (empleado: Empleado): AuthUser => ({
  id: empleado.id,
  nombre: empleado.nombre,
  email: empleado.email,
});

export function resolvePublicImage(
  raw?: string | null,
  options?: { folder?: string; defaultExt?: string }
) {
  const folder = options?.folder ?? 'images/productos';
  const defaultExt = options?.defaultExt ?? 'jpg';
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw; // URL absoluta
  if (raw.startsWith('/')) return raw; // ruta absoluta ya resuelta

  const hasExt = /\.[a-z0-9]{2,4}$/i.test(raw);
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
