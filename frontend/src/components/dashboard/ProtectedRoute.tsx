// ========================= PROTECTED ROUTE COMPONENT =========================
// src/components/ProtectedRoute.tsx
import { useEffect } from "react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, setReturnUrl, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Guardar la URL actual para redirigir después del login
      setReturnUrl(location.pathname + location.search);
    }
  }, [loading, isAuthenticated, location, setReturnUrl]);

  // Esperar la verificación inicial antes de decidir
  if (loading) {
    return null; // O un spinner si deseas
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

// -Este código es un componente de ruta protegida que redirige a los usuarios no autenticados a la página de inicio de sesión.
// -useLocation se utiliza para obtener la URL actual y guardarla para redirigir después del inicio de sesión, esto sirve para 
//    mejorar la experiencia del usuario al llevarlo de vuelta a la página que intentaba acceder originalmente.
