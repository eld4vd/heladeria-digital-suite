import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/useAuth';
import { MdDashboard, MdShoppingCart, MdInventory, MdBarChart, MdCategory, MdLogout, MdClose, MdInfo } from 'react-icons/md';

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
  mobile?: boolean;
  open?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ className = '', collapsed = false, mobile = false, open = false, onClose }: SidebarProps) => {
  const { logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  const links = [
    { to: '/dashboard', icon: MdDashboard, label: 'Resumen', end: true },
    { to: '/dashboard/ventas', icon: MdShoppingCart, label: 'Ventas' },
    { to: '/dashboard/productos', icon: MdInventory, label: 'Productos' },
    { to: '/dashboard/categorias', icon: MdCategory, label: 'Categorías' },
    { to: '/dashboard/reportes', icon: MdBarChart, label: 'Reportes' },
  ];

  // Información de ayuda contextual para cada sección
  const helpInfo: Record<string, { title: string; description: string }> = {
    '/dashboard': {
      title: 'Panel de Control',
      description: 'Vista general de tu negocio con métricas clave, ventas del día y productos más vendidos.'
    },
    '/dashboard/ventas': {
      title: 'Gestión de Ventas',
      description: 'Registra ventas en caja, procesa pedidos, gestiona métodos de pago y consulta el historial completo.'
    },
    '/dashboard/productos': {
      title: 'Catálogo de Productos',
      description: 'Agrega nuevos helados, actualiza precios, gestiona stock y organiza tu menú de sabores.'
    },
    '/dashboard/categorias': {
      title: 'Organización',
      description: 'Crea y administra categorías para clasificar tus productos (Clásicos, Premium, Veganos, etc.).'
    },
    '/dashboard/reportes': {
      title: 'Análisis y Reportes',
      description: 'Genera reportes de ventas, analiza tendencias, exporta datos y toma decisiones informadas.'
    },
  };

  // Obtener información contextual según la ruta actual
  const currentHelp = helpInfo[location.pathname] || helpInfo['/dashboard'];

  // Sidebar móvil (drawer)
  if (mobile) {
    return (
      <>
        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity lg:hidden ${
            open ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={onClose}
        />
        
        {/* Drawer */}
        <aside
          className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-50 transform transition-transform lg:hidden ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center shadow-md">
                <span className="text-white text-xl font-bold">H</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Heladería</h2>
                <p className="text-xs text-slate-500">Panel Admin</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Cerrar menú"
            >
              <MdClose className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="w-6 h-6" />
                  <span className="font-medium">{link.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Help Section - Mobile */}
          <div className="px-4 pb-4">
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                  <MdInfo className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 mb-1">
                    {currentHelp.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {currentHelp.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-4 border-t border-slate-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <MdLogout className="w-6 h-6" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </aside>
      </>
    );
  }

  // Sidebar desktop
  return (
    <aside
      className={`hidden lg:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 sticky top-0 h-screen ${
        collapsed ? 'w-20' : 'w-64'
      } ${className}`}
    >
      {/* Header */}
      <div className={`p-6 border-b border-slate-200 ${collapsed ? 'px-4' : ''}`}>
        {collapsed ? (
          <div className="w-12 h-12 mx-auto rounded-xl bg-cyan-600 flex items-center justify-center shadow-md">
            <span className="text-white text-2xl font-bold">H</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-white text-xl font-bold">H</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Heladería</h2>
              <p className="text-xs text-slate-500">Panel Admin</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={`p-4 space-y-2 overflow-y-auto ${collapsed ? 'px-2' : ''}`}>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              title={collapsed ? link.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  collapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <Icon className="w-6 h-6 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{link.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Help Section - Desktop (solo visible cuando no está colapsado) */}
      {!collapsed && (
        <div className="px-4 pb-4">
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                <MdInfo className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  {currentHelp.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {currentHelp.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Button */}
      <div className={`p-4 border-t border-slate-200 ${collapsed ? 'px-2' : ''}`}>
        <button
          onClick={handleLogout}
          title={collapsed ? 'Cerrar Sesión' : undefined}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <MdLogout className="w-6 h-6 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
