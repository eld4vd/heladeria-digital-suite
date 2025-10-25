// src/components/Layout/DashboardHeader.tsx
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import { MdHome } from "react-icons/md";

interface HeaderProps {
  onToggleSidebar?: () => void; // móvil
  onToggleSidebarDesktop?: () => void; // escritorio
  isSidebarDesktopHidden?: boolean;
}

const Header = ({ onToggleSidebar, onToggleSidebarDesktop, isSidebarDesktopHidden }: HeaderProps) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-5 sm:px-6 lg:px-10 xl:px-16">
        <div className="h-[72px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleSidebar}
              className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
              aria-label="Abrir menú"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5h14a1 1 0 100-2H3a1 1 0 000 2zm14 4H3a1 1 0 000 2h14a1 1 0 100-2zm0 6H3a1 1 0 000 2h14a1 1 0 100-2z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onToggleSidebarDesktop}
              className="hidden md:inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
              aria-label={isSidebarDesktopHidden ? "Mostrar barra lateral" : "Ocultar barra lateral"}
              title={isSidebarDesktopHidden ? "Mostrar barra lateral" : "Ocultar barra lateral"}
            >
              {isSidebarDesktopHidden ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M4 5a2 2 0 00-2 2v10a2 2 0 002 2h9a2 2 0 002-2V7a2 2 0 00-2-2H4zm9 2v10H4V7h9z" />
                  <path d="M20 6a1 1 0 10-2 0v12a1 1 0 102 0V6z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M4 5a2 2 0 00-2 2v10a2 2 0 002 2h9a2 2 0 002-2V7a2 2 0 00-2-2H4z" />
                  <path d="M18 6a1 1 0 10-2 0v12a1 1 0 102 0V6z" />
                </svg>
              )}
            </button>
            <div className="hidden sm:block">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 leading-none">Panel</p>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight mt-0.5">Centro de Operaciones</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm">
              <span className="text-base" aria-hidden>👤</span>
              <span className="max-w-[120px] truncate">{user?.nombre || "Usuario"}</span>
            </span>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-200 hover:bg-cyan-700 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
              title="Ir al inicio"
            >
              <MdHome className="h-5 w-5" />
              <span className="hidden sm:inline">Inicio</span>
            </Link>
            <button
              onClick={logout}
              className="inline-flex items-center justify-center rounded-xl bg-slate-700 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-200 hover:bg-slate-800 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;