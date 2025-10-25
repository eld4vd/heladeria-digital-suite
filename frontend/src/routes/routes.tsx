// src/routes/routes.tsx
import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "../components/public/Layout/Layout";
import EmpleadoLayout from "../components/dashboard/EmpleadoLayout";
import ProtectedRoute from "../components/dashboard/ProtectedRoute";
const Home = lazy(() => import("../pages/Home"));
const Menu = lazy(() => import("../pages/Menu"));
const Contacto = lazy(() => import("../pages/Contacto"));
const Error404 = lazy(() => import("../pages/Error/index"));
const Detalle = lazy(() => import("../pages/Detalle"));
const Promociones = lazy(() => import("../pages/Promos"));
const Login = lazy(() => import("../pages/Login"));
const DashboardHome = lazy(() => import("../pages/Dashboard/DashboardHome"));
const DashboardOverview = lazy(
  () => import("../pages/Dashboard/DashboardOverview")
);
const Categorias = lazy(
  () => import("../components/dashboard/layout/Categorias/index")
);
const Productos = lazy(() => import("../components/dashboard/layout/Productos"));
const Ventas = lazy(() => import("../components/dashboard/layout/Ventas"));
const Reportes = lazy(() => import("../components/dashboard/layout/Reportes"));

const MyRoutes = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-6 text-sm text-gray-500">
          Cargando…
        </div>
      }
    >
      <Routes>
        {/* Ruta pública de login */}
        <Route path="/login" element={<Login />} />

        {/* Rutas PÚBLICAS con Layout normal (con Navbar/Footer) */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="menu" element={<Menu />} />
          <Route path="contacto" element={<Contacto />} />
          <Route path="detalle/:id" element={<Detalle />} />
          <Route path="promos" element={<Promociones />} />
        </Route>

        {/* Ruta PROTEGIDA para el dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <EmpleadoLayout>
                <DashboardHome />
              </EmpleadoLayout>
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardOverview />} />{" "}
          {/* Página inicial del dashboard */}
          <Route path="categorias" element={<Categorias />} />{" "}
          {/* Tabla de categorías */}
          <Route path="productos" element={<Productos />} />{" "}
          {/* Tabla de productos */}
          <Route path="ventas" element={<Ventas />} /> {/* Tabla de ventas */}
          <Route path="reportes" element={<Reportes />} />{" "}
          {/* Reportes (calendario y día) */}
          {/* Puedes añadir más subrutas aquí */}
        </Route>

        {/* Ruta para errores 404 */}
        <Route path="*" element={<Error404 />} />
      </Routes>
    </Suspense>
  );
};

export default MyRoutes;

/*  
   -Se uso Lazy() para cargar los componentes de las páginas de forma diferida, ejemplo logico seria
    cargar la página de login solo cuando el usuario navega a /login, esto ayuda a reducir el tamaño 
    del bundle inicial y mejora los tiempos de carga.
    -Se uso Suspense que es un componente de React para mostrar un fallback (un mensaje de "Cargando...") mientras se cargan los componentes.
    -Se uso el componente ProtectedRoute para proteger las rutas que requieren autenticación.
    -Routes maneja la configuración de las rutas de la aplicación. y Route define cada ruta individual.
*/
