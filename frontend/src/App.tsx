// ========================= APP.TSX ACTUALIZADO =========================
// src/App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import AuthProvider from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import MyRoutes from './routes/routes';
import { Toaster } from 'react-hot-toast';
import { Suspense, useEffect, useState, type ComponentType } from 'react';
import { fetchHelados } from './services/producto.service';
import { categoriaService } from './services/categoria.service';

// Crear una instancia de QueryClient con configuraciones optimizadas
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 120_000,
      gcTime: 300_000,
      retry: 2,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});

type ReactQueryDevtoolsComponent = ComponentType<{ initialIsOpen?: boolean; buttonPosition?: string }>;

const App = () => {
  const [Devtools, setDevtools] = useState<ReactQueryDevtoolsComponent | null>(null);
  useEffect(() => {
    if (import.meta.env.DEV) {
      import('@tanstack/react-query-devtools').then((m) => {
        setDevtools(() => m.ReactQueryDevtools as ReactQueryDevtoolsComponent);
      }).catch(() => {
        // opcional: ignorar errores si no está instalada en prod
      });
    }
  }, []);

  const nodeProcess = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  const isDevEnvironment = (nodeProcess?.env?.NODE_ENV === 'development') || import.meta.env.DEV;
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Suspense fallback={<div className="p-6">Cargando…</div>}>
              <MyRoutes />
            </Suspense>
            <Toaster position="top-right" gutter={8} toastOptions={{ duration: 4000 }} />
            {isDevEnvironment && Devtools ? (
              <Devtools initialIsOpen={false} buttonPosition="bottom-left" />
            ) : null}
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Prefetch no bloqueante de datos críticos después del primer paint
if (typeof window !== 'undefined') {
  const schedule = (cb: () => void) => {
    const withIdleCallback = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
    };
    if (withIdleCallback.requestIdleCallback) {
      withIdleCallback.requestIdleCallback(() => cb(), { timeout: 2500 });
    } else {
      setTimeout(cb, 1200);
    }
  };
  schedule(() => {
    queryClient.prefetchQuery({ queryKey: ['helados'], queryFn: fetchHelados });
    queryClient.prefetchQuery({ queryKey: ['categorias'], queryFn: categoriaService.getCategorias });
  });
}

export default App;



/*
Este archivo define el componente principal de la aplicación React.
- QueryClientProvider envuelve la aplicación para proporcionar el cliente de React Query, es decir gestionar el estado de las consultas y la caché de datos.
- Se usa BrowserRouter para habilitar la navegación entre páginas.
- AuthProvider envuelve la aplicación para manejar el estado de autenticación.
- QueryClient se configura con opciones predeterminadas para optimizar el rendimiento de las consultas.
- Toaster se usa para mostrar notificaciones emergentes.
- En modo desarrollo, se carga React Query Devtools para facilitar la depuración de consultas.
- Se realiza un prefetch no bloqueante de datos críticos (helados y categorías) después del primer paint para mejorar la experiencia del usuario, 
    esto quiere decir que los datos se cargan en segundo plano sin bloquear la interfaz de usuario.
*/