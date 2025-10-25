// src/context/AuthContext.tsx
import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/auth.service";
import { getCSRFTokenFromCookie, mapEmpleadoToAuthUser } from "../helpers";
import type { AuthUser } from "../models/auth.model";
import type { Empleado } from "../models/Empleado";
import type { AuthContextType } from "./AuthContext.types";
import { AuthContext } from "./AuthContext.shared";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [empleado, setEmpleado] = useState<Empleado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [returnUrl, setReturnUrl] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const hasRunRef = useRef(false);

  // Verificar sesión al montar la app
  useEffect(() => {
    const checkAuth = async () => {
      if (hasRunRef.current) return; // evitar doble ejecución en StrictMode
      hasRunRef.current = true;
      // Si el usuario acaba de cerrar sesión, no intentamos auto-login
      if (sessionStorage.getItem('skipAutoSignIn') === '1') {
        setIsAuthenticated(false);
        setUser(null);
        setEmpleado(null);
        setLoading(false);
        return;
      }
      try {
        // Verificar sesión usando el servicio dedicado (maneja refresh automáticamente)
        const profile = await authService.verifySession();
        if (profile) {
          setEmpleado(profile.user);
          setUser(mapEmpleadoToAuthUser(profile.user));
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setEmpleado(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.warn('Error al verificar la sesión', error);
        setUser(null);
        setEmpleado(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);
  
  useEffect(() => {
    const handleAuthError = (event: Event) => {
      const { detail } = event as CustomEvent<{ message?: string; status?: number }>;
      const message = detail?.message ?? "Tu sesión expiró. Vuelve a iniciar sesión.";
      setError(message);
      setUser(null);
      setEmpleado(null);
      setIsAuthenticated(false);
      setLoading(false);
      sessionStorage.setItem('skipAutoSignIn', '1');
      authService.logout().catch((logoutError) => {
        console.warn('Error cerrando sesión tras auth-error', logoutError);
      });
      navigate('/login', { replace: true });
    };

    window.addEventListener('auth-error', handleAuthError as EventListener);
    return () => {
      window.removeEventListener('auth-error', handleAuthError as EventListener);
    };
  }, [navigate]);


  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError("");
      
      // Asegurar CSRF antes del login
      const csrf = getCSRFTokenFromCookie();
      if (!csrf) {
        try {
          await authService.getCsrfToken();
        } catch (csrfError) {
          console.warn('No se pudo obtener el token CSRF antes del login', csrfError);
        }
      }
      
      // Realizar login
      const response = await authService.login({ email, password });
      setUser(response.user);
      
      // Obtener perfil completo del empleado
      try {
        const profile = await authService.getProfile();
        setEmpleado(profile.user);
        setUser(mapEmpleadoToAuthUser(profile.user));
      } catch (profileError) {
        console.warn('No se pudo obtener el perfil después del login', profileError);
        setEmpleado(null);
      }
      
      setIsAuthenticated(true);
      sessionStorage.removeItem('skipAutoSignIn');
      navigate(returnUrl || "/dashboard");
      setReturnUrl("");
    } catch (error) {
      setError("Usuario y/o contraseña incorrectos");
      setUser(null);
      setEmpleado(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Limpia estado y redirige a login
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (err) {
      // Incluso si el logout falla en el servidor, limpiar el estado local
      console.warn('Error al cerrar sesión:', err);
    } finally {
      setUser(null);
      setEmpleado(null);
      setIsAuthenticated(false);
      setError("");
      setReturnUrl("");
      // Evitar re-autenticación automática si la refresh cookie quedó viva
      sessionStorage.setItem('skipAutoSignIn', '1');
      navigate("/login");
    }
  };

  // Valor del contexto
  const value: AuthContextType = {
    user,
    empleado,
    loading,
    error,
    returnUrl,
    login,
    logout,
    isAuthenticated,
    setReturnUrl,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;

/*
- Este código define un contexto de autenticación para una aplicación React.
*/