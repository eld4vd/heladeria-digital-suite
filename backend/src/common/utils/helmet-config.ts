import helmet from 'helmet';
import type { RequestHandler } from 'express';

/**
 * Ajusta CSP, HSTS y cabeceras adicionales teniendo en cuenta el entorno.
 */
export const helmetConfig = (): RequestHandler => {
  const isProduction = process.env.NODE_ENV === 'production';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: [
          "'self'",
          'https://fonts.googleapis.com',
          ...(isProduction ? [] : ["'unsafe-inline'"]),
        ],
        scriptSrc: ["'self'", ...(isProduction ? [] : ["'unsafe-inline'"])],
        imgSrc: ["'self'", 'data:', 'blob:', frontendUrl],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        connectSrc: ["'self'", frontendUrl],
        frameSrc: ["'none'"],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
        embedSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        mediaSrc: ["'self'"],
        workerSrc: ["'self'", 'blob:'],
        manifestSrc: ["'self'"],
        ...(isProduction && { upgradeInsecureRequests: [] }),
      },
      reportOnly: isProduction,
    },
    hsts: isProduction
      ? {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        }
      : false,
    frameguard: { action: 'deny' },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: ['strict-origin-when-cross-origin'] },
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: {
      policy: isProduction ? 'same-origin' : 'cross-origin',
    },
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    hidePoweredBy: true,
    originAgentCluster: true,
    dnsPrefetchControl: { allow: false },
    ieNoOpen: true,
  });
};
