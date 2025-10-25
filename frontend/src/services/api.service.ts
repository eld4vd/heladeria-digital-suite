// src/services/Api.ts
import type { LoginRequest, LoginResponse, ProfileResponse } from '../models/auth.model';
import { getCsrfTokenFromCookie } from '../helpers';

const API_BASE_URL = (import.meta.env.VITE_BASE_URL_ENDPOINT || 'http://localhost:3000/api').replace(/\/$/, '');
const CSRF_ENDPOINT = import.meta.env.VITE_CSRF_ENDPOINT || '/auth/csrf';

export interface ApiErrorResponse extends Error {
  status?: number;
  json?: Record<string, unknown> | null;
  body?: string;
}

export const isApiErrorResponse = (error: unknown): error is ApiErrorResponse => {
  if (typeof error !== 'object' || error === null) return false;
  return 'message' in error && typeof (error as { message?: unknown }).message === 'string';
};

class ApiService {
  private refreshPromise: Promise<void> | null = null;

  // Refresco de sesión basado en cookies httpOnly (no devuelve token)
  private async refreshAccessToken(): Promise<void> {
    if (this.refreshPromise) return this.refreshPromise;
    this.refreshPromise = (async () => {
      const csrf = getCsrfTokenFromCookie();
      const resp = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          ...(csrf ? { 'X-CSRF-Token': csrf } : {}),
        },
      });
      if (!resp.ok) throw new Error('Unable to refresh session');
      // No esperamos body; el backend setea cookies
    })();
    try {
      await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  // Garantiza que exista un token CSRF en cookie; intenta obtenerlo si falta
  private async ensureCsrfToken(): Promise<string | null> {
    let csrf = getCsrfTokenFromCookie();
    if (csrf) return csrf;
    try {
      const resp = await fetch(`${API_BASE_URL}${CSRF_ENDPOINT}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Cache-Control': 'no-cache' },
      });
      // Priorizar token del JSON si el backend lo envía
      try {
        const data = await resp.clone().json();
        if (data?.csrfToken) return String(data.csrfToken);
      } catch (error) {
        console.warn('No se pudo parsear respuesta CSRF', error);
      }
    } catch (error) {
      console.warn('No se pudo obtener token CSRF del servidor', error);
    }
    csrf = getCsrfTokenFromCookie();
    return csrf;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const method = (options.method || 'GET').toString().toUpperCase();
    let csrf = getCsrfTokenFromCookie();
    // Para métodos que modifican estado, garantizar CSRF si se exige en el backend
    if (!csrf && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      csrf = await this.ensureCsrfToken();
    }

    // Construir headers respetando FormData
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };
    const isFormData = options.body instanceof FormData;
    const hasBody = typeof options.body !== 'undefined' && options.body !== null;
    if (hasBody && !headers['Content-Type'] && !isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    if (csrf) headers['X-CSRF-Token'] = csrf;

    const config: RequestInit = {
      ...options,
      credentials: 'include', // Enviar cookies httpOnly
      headers,
    };

    let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Si obtenemos 401, intentar refrescar la sesión basada en cookies y reintentar
    if (response.status === 401) {
      try {
        await this.refreshAccessToken();
        // Reintentar la petición original (cookies ya actualizadas por el backend)
        response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      } catch (error) {
        // Si el refresh falla, lanzar error para que el contexto maneje el logout
        console.warn('Fallo al refrescar la sesión', error);
        throw new Error('Session expired');
      }
    }

    if (!response.ok) {
      // Ante 403, intentar recuperar CSRF y reintentar una sola vez
      if (response.status === 403 && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
        const newCsrf = await this.ensureCsrfToken();
        if (newCsrf) {
          const retryConfig: RequestInit = {
            ...config,
            headers: {
              ...(config.headers as Record<string, string>),
              'X-CSRF-Token': newCsrf,
            },
          };
          const retry = await fetch(`${API_BASE_URL}${endpoint}`, retryConfig);
          if (retry.ok) {
            // manejar 204 o json/text como abajo
            if (retry.status === 204) return undefined as unknown as T;
            const ct = retry.headers.get('content-type') || '';
            if (ct.includes('application/json')) {
              return retry.json() as Promise<T>;
            }
            const txt = await retry.text();
            return txt as unknown as T;
          }
          response = retry; // continuar flujo de error con respuesta de reintento
        }
      }
      const err: ApiErrorResponse = new Error(`HTTP error! status: ${response.status}`);
      err.status = response.status;
      try {
        const ct = response.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          err.json = await response.json();
        } else {
          err.body = await response.text();
        }
      } catch (parseError) {
        console.warn('No se pudo parsear el cuerpo de error', parseError);
      }
      throw err;
    }

    // Manejar 204 No Content
    if (response.status === 204) {
      return undefined as unknown as T;
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return response.json() as Promise<T>;
    }

    // Fallback: devolver texto si no es JSON
    const text = await response.text();
    return text as unknown as T;
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Subida de archivos (multipart/form-data)
  async upload<T>(endpoint: string, formData: FormData, method: 'POST' | 'PUT' = 'POST'): Promise<T> {
    return this.request<T>(endpoint, { method, body: formData });
  }

  // Método específico para login (cookies set por el backend)
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Método para logout
  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
  }

  // Método para verificar autenticación
  async getProfile(): Promise<ProfileResponse> {
    return this.get<ProfileResponse>('/auth/me');
  }

  // Método público para refrescar la sesión (para flujos "refresh primero")
  async refreshSession(): Promise<void> {
    await this.refreshAccessToken();
  }
}

export default new ApiService();


/*
⚙️ ApiService (Api.ts)
👉 Capa baja de comunicación con el backend.
Responsabilidades:
• Construir la petición fetch (headers, body, etc.) con credentials: 'include' para enviar cookies httpOnly.
• Asegurar CSRF Double Submit: lee csrfToken (JSON de GET /api/v1/auth/csrf) o la cookie no-httpOnly `csrf_token` y lo envía en `X-CSRF-Token` en mutaciones.
• Manejar 401: hace POST /api/v1/auth/refresh con `X-CSRF-Token` y reintenta la petición original. No guarda tokens; el backend setea cookies (access_token/refresh_token).
• Devolver el resultado final (JSON, texto o nada).
*/