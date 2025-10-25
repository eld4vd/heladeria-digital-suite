import { NextFunction, Request, Response } from 'express';

// Middleware CSRF simple (Double Submit Cookie)
// Requiere que el header 'X-CSRF-Token' coincida con la cookie 'csrf_token'
// Se aplica a métodos mutadores. Se excluyen rutas típicas de autenticación inicial.
export function csrfMiddleware() {
  const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
  const EXCLUDE_PATHS: RegExp[] = [
    /\/api\/v\d+\/auth\/login\/?$/,
    /\/api\/v\d+\/auth\/refresh\/?$/,
    /\/api\/v\d+\/auth\/csrf\/?$/,
    /\/apidoc\/?/, // excluir swagger
  ];

  return (req: Request, res: Response, next: NextFunction) => {
    // Permitir preflight y métodos no mutadores
    if (req.method === 'OPTIONS' || !MUTATING_METHODS.has(req.method)) {
      return next();
    }

    // Normaliza URL sin querystring para el match
    const raw = req.originalUrl || req.url || '';
    const path = raw.split('?')[0];
    if (EXCLUDE_PATHS.some((rx) => rx.test(path))) {
      return next();
    }

    const headerToken = (req.headers['x-csrf-token'] as string) || '';
    const cookieToken = (req.cookies?.['csrf_token'] as string) || '';

    if (!headerToken || !cookieToken || headerToken !== cookieToken) {
      return res.status(403).json({ message: 'CSRF token inválido o ausente' });
    }

    return next();
  };
}

// src/common/middlewares/csrf.middleware.ts

// Este codigo implementa un middleware CSRF simple utilizando la técnica de Double Submit Cookie.
// que en simples palabras significa que el token CSRF se envía tanto en una cookie como en un header HTTP.
