import { Outlet, useLocation } from "react-router-dom";
import Footer from "../Footer/Footer";
import Navbar from "../Navbar/Navbar";
import ScrollToTop from "../../../hooks/ScrollToTop";
import FloatingCartButton from "../../Cart/FloatingCartButton";

const Layout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Navbar /> {/* Aqui se pone la barra de navegación  para que todas las páginas tengan la misma estructura */}
      <main className={`flex-grow ${isHomePage ? '' : 'bg-white'}`}>
        <Outlet /> {/* Aquí se renderizan las páginas */}
      </main>
      <Footer /> {/* Aquí se pone el pie de página para que todas las páginas tengan la misma estructura */}
      <FloatingCartButton /> { /* ← Carrito de compras flotante */ }
    </div>
  );
};

export default Layout;


// layout en español es disposición
// Este layout se encarga de la estructura general de la aplicación, incluyendo la barra de navegación y el pie de página
// útil para mantener una consistencia en el diseño y la navegación de la aplicación

// Outlet es un componente de react-router-dom que se usa para renderizar componentes hijos en rutas anidadas
// Footer es un componente que se espera que contenga el pie de página de la aplicación