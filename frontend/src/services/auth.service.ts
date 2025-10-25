// src/services/auth.service.ts
import apiService from './api.service';
import type { 
  LoginRequest, 
  LoginResponse, 
  ProfileResponse, 
  CsrfResponse,
  RefreshResponse,
  LogoutResponse 
} from '../models/auth.model';

// Servicio de Autenticación
// Implementa autenticación con:
// - JWT doble cookie (access_token + refresh_token, ambas httpOnly)
// - CSRF Double Submit Cookie (csrf_token no-httpOnly + X-CSRF-Token header)
// 
// Flujo de seguridad:
// 1. GET /auth/csrf → Obtiene token CSRF inicial (cookie no-httpOnly + JSON response)
// 2. POST /auth/login → Login con credentials + CSRF header
//    - Backend valida CSRF (cookie vs header)
//    - Backend setea cookies httpOnly: access_token, refresh_token
//    - Backend rota CSRF token (nueva cookie csrf_token)
// 3. GET /auth/me → Obtiene perfil con access_token
//    - Si 401, ApiService automáticamente hace POST /auth/refresh
//    - Refresh usa refresh_token cookie + CSRF header
//    - Backend emite nuevo access_token (cookie httpOnly)
// 4. POST /auth/logout → Limpia todas las cookies
class AuthService {
  // Obtiene el token CSRF del servidor
  // El backend devuelve el token en JSON y setea cookie no-httpOnly
  async getCsrfToken(): Promise<CsrfResponse> {
    return apiService.get<CsrfResponse>('/auth/csrf');
  }

  // Inicia sesión con email y contraseña
  // El backend valida CSRF y setea cookies JWT (httpOnly)
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiService.login(credentials);
  }

  // Obtiene el perfil del usuario autenticado
  // Usa access_token cookie automáticamente
  async getProfile(): Promise<ProfileResponse> {
    return apiService.getProfile();
  }

  // Refresca el access_token usando refresh_token
  // El backend lee la cookie httpOnly refresh_token y emite nuevo access_token
  async refresh(): Promise<RefreshResponse> {
    await apiService.refreshSession();
    return { success: true };
  }

  // Cierra sesión y limpia cookies en el backend
  async logout(): Promise<LogoutResponse> {
    await apiService.logout();
    return { success: true };
  }

  // Verifica si el usuario está autenticado
  // Intenta obtener el perfil; si falla, intenta refresh
  async verifySession(): Promise<ProfileResponse | null> {
    try {
      return await this.getProfile();
    } catch (error) {
      // Si falla, intentar refresh y reintentar
      try {
        await this.refresh();
        return await this.getProfile();
      } catch (refreshError) {
        console.warn('Sesión expirada o inválida', refreshError);
        return null;
      }
    }
  }
}

export const authService = new AuthService();
export default authService;

/*
🔐 Arquitectura de Seguridad - Doble Cookie JWT + CSRF Double Submit

┌─────────────────────────────────────────────────────────────────┐
│                     COOKIES (httpOnly, Secure)                  │
├─────────────────────────────────────────────────────────────────┤
│ 1. access_token  → JWT corta duración (15min)                  │
│    - httpOnly: true (no accesible vía JS)                       │
│    - Secure: true (solo HTTPS en producción)                    │
│    - SameSite: Strict                                           │
│    - Usado en cada petición autenticada                         │
│                                                                  │
│ 2. refresh_token → JWT larga duración (7 días)                 │
│    - httpOnly: true (protegido contra XSS)                      │
│    - Secure: true                                               │
│    - SameSite: Strict                                           │
│    - Usado solo en POST /auth/refresh                           │
│                                                                  │
│ 3. csrf_token    → Token CSRF rotativo                          │
│    - httpOnly: false (accesible para leer y enviar en header)  │
│    - Secure: true                                               │
│    - SameSite: Strict                                           │
│    - Se envía en header X-CSRF-Token en mutaciones             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE AUTENTICACIÓN                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ 1. Inicio de sesión:                                            │
│    GET /auth/csrf → Obtiene CSRF inicial                       │
│    POST /auth/login (email, password) + X-CSRF-Token header    │
│    ↓                                                             │
│    Backend valida CSRF (cookie vs header)                       │
│    Backend setea: access_token, refresh_token, csrf_token       │
│    ↓                                                             │
│    Frontend recibe usuario en response JSON                     │
│                                                                  │
│ 2. Peticiones autenticadas:                                     │
│    GET /api/endpoint                                            │
│    ↓                                                             │
│    Browser envía automáticamente cookies (access_token)         │
│    Backend valida JWT y responde                                │
│                                                                  │
│ 3. Token expirado (401):                                        │
│    POST /auth/refresh + X-CSRF-Token                           │
│    ↓                                                             │
│    Backend lee refresh_token cookie                             │
│    Backend valida CSRF                                          │
│    Backend emite nuevo access_token (cookie)                    │
│    Backend rota CSRF token                                      │
│    ↓                                                             │
│    ApiService reintenta petición original automáticamente       │
│                                                                  │
│ 4. Cierre de sesión:                                            │
│    POST /auth/logout + X-CSRF-Token                            │
│    ↓                                                             │
│    Backend limpia todas las cookies                             │
│    Frontend limpia estado local                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  PROTECCIÓN CONTRA ATAQUES                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ✅ XSS (Cross-Site Scripting):                                 │
│    • Tokens JWT en cookies httpOnly (no accesibles vía JS)     │
│    • Sanitización de inputs en frontend y backend              │
│                                                                  │
│ ✅ CSRF (Cross-Site Request Forgery):                          │
│    • CSRF Double Submit Cookie pattern                          │
│    • Token CSRF rotativo en cada operación sensible            │
│    • Validación en backend: cookie csrf_token === header       │
│                                                                  │
│ ✅ Token Theft:                                                 │
│    • Access token corta duración (15 min)                       │
│    • Refresh token larga duración (7 días) solo para refresh   │
│    • Cookies con SameSite=Strict                                │
│    • Secure flag en producción (HTTPS only)                     │
│                                                                  │
│ ✅ Session Fixation:                                            │
│    • Nuevas cookies en cada login                               │
│    • CSRF token rotado en operaciones críticas                 │
│                                                                  │
│ ✅ Man-in-the-Middle:                                           │
│    • HTTPS obligatorio en producción                            │
│    • Secure flag en todas las cookies                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

📝 NOTAS IMPORTANTES:
- Las cookies se setean automáticamente por el backend
- El frontend NUNCA maneja tokens directamente en localStorage/sessionStorage
- La cookie csrf_token es la única accesible vía document.cookie
- El refresh es transparente para el usuario (ApiService lo maneja)
- El logout limpia TODAS las cookies en el backend
*/
