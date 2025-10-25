import type { Empleado } from './Empleado';

// DTO para login
export interface LoginRequest {
  email: string;
  password: string;
}

// Usuario simplificado devuelto por /auth/login
export interface AuthUser {
  id: number;
  nombre: string;
  email: string;
}

// Respuesta del endpoint POST /auth/login
export interface LoginResponse {
  success: boolean;
  user: AuthUser;
}

// Payload del JWT decodificado
export interface JwtPayload {
  sub: number;
  iat?: number;
  exp?: number;
}

// Respuesta del endpoint GET /auth/me
export interface ProfileResponse {
  user: Empleado;
}

// Respuesta del endpoint GET /auth/csrf
export interface CsrfResponse {
  csrfToken: string;
}

// Respuesta del endpoint POST /auth/refresh
export interface RefreshResponse {
  success: boolean;
}

// Respuesta del endpoint POST /auth/logout
export interface LogoutResponse {
  success: boolean;
}

// Errores de autenticación enviados por el backend
export interface AuthError {
  message: string;
  statusCode: number;
  error?: string;
}

// Estado de autenticación global
export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  empleado: Empleado | null;
  isLoading: boolean;
  error: string | null;
  csrfToken: string | null;
  returnUrl?: string;
}