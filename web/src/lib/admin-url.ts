// Es una dirección de despliegue, no una ruta de la aplicación pública.
export const adminBaseUrl = (process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001').replace(/\/+$/, '');
