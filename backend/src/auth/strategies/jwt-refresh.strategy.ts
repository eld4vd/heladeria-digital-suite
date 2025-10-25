// src/auth/strategies/jwt-refresh.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Empleado } from 'src/empleados/entities/empleado.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

type CookieBag = Record<string, unknown>;

const isCookieBag = (cookies: unknown): cookies is CookieBag =>
  typeof cookies === 'object' && cookies !== null;

const getCookieValue = (cookies: CookieBag | undefined, name: string) => {
  const raw = cookies?.[name];
  return typeof raw === 'string' ? raw : null;
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly authService: AuthService) {
    const jwtSecret = process.env.JWT_REFRESH_SECRET;
    if (!jwtSecret) {
      throw new Error(
        'JWT_REFRESH_SECRET no está definido en las variables de entorno',
      );
    }
    const useHostPrefix =
      (process.env.COOKIE_PREFIX_HOST || 'false').toLowerCase() === 'true';
    const refreshCookieName = useHostPrefix
      ? '__Host-refresh_token'
      : 'refresh_token';
    super({
      // Extraer refresh token de la cookie
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const cookies = isCookieBag(request?.cookies)
            ? request.cookies
            : undefined;
          return (
            getCookieValue(cookies, refreshCookieName) ??
            getCookieValue(cookies, 'refresh_token')
          );
        },
      ]),
      secretOrKey: jwtSecret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload): Promise<Empleado> {
    try {
      return await this.authService.verifyPayload(payload);
    } catch (error: unknown) {
      throw new UnauthorizedException('Refresh token inválido o expirado', {
        cause: error,
      });
    }
  }
}
