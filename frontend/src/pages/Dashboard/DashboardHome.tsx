// src/pages/Empleado/DashboardHome.tsx
import { Outlet } from "react-router-dom";
import { useState } from 'react';
import Sidebar from "../../components/dashboard/layout/Sidebar";
import Header from "../../components/dashboard/layout/Header";

const DashboardHome = () => {
  const [open, setOpen] = useState(false); // móvil
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // escritorio: colapsado o expandido
  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 text-slate-900 flex antialiased overflow-hidden">
      {/* Sidebar desktop - fijo y colapsable */}
      <Sidebar collapsed={sidebarCollapsed} />
      {/* Sidebar móvil (off-canvas) */}
      <Sidebar mobile open={open} onClose={() => setOpen(false)} />

      {/* Contenido principal */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        {/* Header */}
        <Header
          onToggleSidebar={() => setOpen(true)}
          onToggleSidebarDesktop={() => setSidebarCollapsed((v) => !v)}
          isSidebarDesktopHidden={sidebarCollapsed}
        />

        {/* Contenido central CON CONTENEDOR OPTIMIZADO */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-[1600px] mx-auto w-full px-5 sm:px-6 lg:px-10 xl:px-16 py-6 sm:py-8 lg:py-10">
            <Outlet /> {/* Aquí se renderizan las subrutas */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardHome;