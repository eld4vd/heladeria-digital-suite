// src/auth/strategies/jwt-access.strategy.ts
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
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(private readonly authService: AuthService) {
    const jwtSecret = process.env.JWT_ACCESS_SECRET;
    if (!jwtSecret) {
      throw new Error(
        'JWT_ACCESS_SECRET no está definido en las variables de entorno',
      );
    }
    const useHostPrefix =
      (process.env.COOKIE_PREFIX_HOST || 'false').toLowerCase() === 'true';
    const accessCookieName = useHostPrefix
      ? '__Host-access_token'
      : 'access_token';

    super({
      // Extraer access token solo desde cookie httpOnly
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const cookies = isCookieBag(request?.cookies)
            ? request.cookies
            : undefined;
          return (
            getCookieValue(cookies, accessCookieName) ??
            getCookieValue(cookies, 'access_token')
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
      throw new UnauthorizedException('Access token inválido o expirado', {
        cause: error,
      });
    }
  }
}
