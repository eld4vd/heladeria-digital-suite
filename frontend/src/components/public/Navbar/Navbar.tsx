import { useState, useEffect, memo, useMemo } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import logo from "../../../assets/images/ice-cream-logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  // Detectar scroll para cambiar estilo del navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  // Memoizar navLinks para evitar recreaciones
  const navLinks = useMemo(() => [
    { path: "/", label: "Inicio" },
    { path: "/menu", label: "Nuestros Sabores" },
    { path: "/promos", label: "Ofertas" },
    { path: "/contacto", label: "Contáctanos" },
  ], []);

  // Determinar si estamos en la página de inicio (hero con video)
  const isHomePage = location.pathname === "/";

  return (
    <header 
      className={`${isHomePage ? 'fixed' : 'sticky'} top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isHomePage && !isScrolled
          ? "bg-transparent"
          : "bg-white shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo simple y profesional con adaptación de color */}
          <NavLink to="/" className="group flex items-center gap-3 transition-opacity hover:opacity-90">
            <div className="relative">
              <img 
                src={logo} 
                alt="Delicias" 
                className="h-12 w-12 transition-transform duration-200 group-hover:scale-105" 
              />
            </div>
            
            {/* Texto de marca */}
            <div className="hidden sm:flex flex-col">
              <span className={`text-2xl font-bold tracking-tight transition-colors ${
                isHomePage && !isScrolled ? "text-white drop-shadow-md" : "text-gray-900"
              }`}>
                Delicias
              </span>
              <span className={`text-[10px] font-semibold tracking-wider uppercase transition-colors ${
                isHomePage && !isScrolled ? "text-cyan-200" : "text-cyan-600"
              }`}>
                Gelato Artesanal
              </span>
            </div>
          </NavLink>          {/* Menú de navegación */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `relative px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    isHomePage && !isScrolled
                      ? isActive
                        ? "text-white bg-white/15"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                      : isActive
                      ? "text-cyan-600 bg-cyan-50"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Botones de autenticación */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <button
                  onClick={handleGoToDashboard}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    isHomePage && !isScrolled
                      ? "text-white bg-white/15 border border-white/30 hover:bg-white/25"
                      : "text-cyan-700 bg-cyan-50 border border-cyan-200 hover:bg-cyan-100"
                  }`}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Dashboard
                </button>

                <button
                  onClick={handleLogout}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    isHomePage && !isScrolled
                      ? "text-white bg-white/10 border border-white/20 hover:bg-white/20"
                      : "text-gray-700 bg-gray-100 border border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Salir
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    isHomePage && !isScrolled
                      ? "text-white bg-white/10 border border-white/20 hover:bg-white/20"
                      : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Iniciar sesión
                </NavLink>
              </>
            )}
          </div>

          {/* Botón hamburguesa */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className={`inline-flex items-center justify-center p-2 rounded-lg transition-all duration-200 focus:outline-none ${
                isHomePage && !isScrolled
                  ? "text-white hover:bg-white/15"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              aria-label="Toggle menu"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span
                  className={`h-0.5 bg-current rounded-full transition-all duration-200 ${
                    isOpen ? "rotate-45 translate-y-2" : ""
                  }`}
                ></span>
                <span
                  className={`h-0.5 bg-current rounded-full transition-all duration-200 ${
                    isOpen ? "opacity-0" : ""
                  }`}
                ></span>
                <span
                  className={`h-0.5 bg-current rounded-full transition-all duration-200 ${
                    isOpen ? "-rotate-45 -translate-y-2" : ""
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="py-3 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "bg-cyan-50 text-cyan-600 border-l-4 border-cyan-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {/* Botones de autenticación móvil */}
            {isAuthenticated ? (
              <div className="pt-3 mt-3 border-t border-gray-200 space-y-2">
                <button
                  onClick={() => {
                    handleGoToDashboard();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-cyan-700 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Ir al Dashboard
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <div className="pt-3 mt-3 border-t border-gray-200 space-y-2">
                <NavLink
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Iniciar sesión
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default memo(Navbar);
