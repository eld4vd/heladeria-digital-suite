// src/components/Layout/EmpleadoLayout.tsx
import type { ReactNode } from 'react';

interface EmpleadoLayoutProps {
  children: ReactNode;
}

const EmpleadoLayout = ({ children }: EmpleadoLayoutProps) => {
  return (
    <div className="empleado-layout">
      {/* Solo el contenido, sin Navbar ni Footer */}
      <main>{children}</main>
    </div>
  );
};

export default EmpleadoLayout;


/*
Este codigo define un componente de diseño para la sección de empleados o dashboard de la aplicación.
*/