import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import type { Empleado } from 'src/empleados/entities/empleado.entity';
import { AuthService } from './auth.service';
import { Public } from './decorators/auth-public.decorator';
import { AuthLoginDto } from './dto/auth-login.dto';
import { JwtAccessAuthGuard } from './guards/jwt-access-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import type { CookieRecord } from './interfaces/cookie-record.type';

type RequestWithUser = Request & { user?: unknown };
type RequestWithCookies = Omit<Request, 'cookies'> & { cookies?: CookieRecord };

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get('csrf')
  @HttpCode(HttpStatus.OK)
  getCsrf(@Res({ passthrough: true }) res: Response): { csrfToken: string } {
    const secure =
      (process.env.COOKIE_SECURE || 'false').toLowerCase() === 'true';
    const sameSite = (process.env.COOKIE_SAMESITE || 'lax') as
      | 'lax'
      | 'strict'
      | 'none';
    const csrfToken = randomBytes(32).toString('hex');
    res.cookie('csrf_token', csrfToken, {
      httpOnly: false,
      secure,
      sameSite,
      maxAge: 15 * 60 * 1000,
      path: '/',
    });
    return { csrfToken };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(
    @Body() authLoginDto: AuthLoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{
    success: true;
    user: Pick<Empleado, 'id' | 'nombre' | 'email'>;
  }> {
    const result = await this.authService.login(authLoginDto);

    const secure =
      (process.env.COOKIE_SECURE || 'false').toLowerCase() === 'true';
    const sameSite = (process.env.COOKIE_SAMESITE || 'lax') as
      | 'lax'
      | 'strict'
      | 'none';
    const useHostPrefix =
      (process.env.COOKIE_PREFIX_HOST || 'false').toLowerCase() === 'true';
    const refreshCookieName = useHostPrefix
      ? '__Host-refresh_token'
      : 'refresh_token';
    const accessCookieName = useHostPrefix
      ? '__Host-access_token'
      : 'access_token';

    res.cookie(refreshCookieName, result.refreshToken, {
      httpOnly: true,
      secure,
      sameSite,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.cookie(accessCookieName, result.accessToken, {
      httpOnly: true,
      secure,
      sameSite,
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    const csrfToken = randomBytes(32).toString('hex');
    res.cookie('csrf_token', csrfToken, {
      httpOnly: false,
      secure,
      sameSite,
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    return {
      success: true,
      user: result.user,
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(JwtRefreshAuthGuard)
  async refresh(
    @Req() req: RequestWithCookies,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: true }> {
    const useHostPrefix =
      (process.env.COOKIE_PREFIX_HOST || 'false').toLowerCase() === 'true';
    const refreshCookieName = useHostPrefix
      ? '__Host-refresh_token'
      : 'refresh_token';
    const accessCookieName = useHostPrefix
      ? '__Host-access_token'
      : 'access_token';
    const refreshToken = req.cookies?.[refreshCookieName];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token no encontrado');
    }

    const result = await this.authService.refresh(refreshToken);

    const csrfToken = randomBytes(32).toString('hex');
    const secure =
      (process.env.COOKIE_SECURE || 'false').toLowerCase() === 'true';
    const sameSite = (process.env.COOKIE_SAMESITE || 'lax') as
      | 'lax'
      | 'strict'
      | 'none';
    res.cookie('csrf_token', csrfToken, {
      httpOnly: false,
      secure,
      sameSite,
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    res.cookie(accessCookieName, result.accessToken, {
      httpOnly: true,
      secure,
      sameSite,
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    return {
      success: true,
    };
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response): { success: boolean } {
    const secure =
      (process.env.COOKIE_SECURE || 'false').toLowerCase() === 'true';
    const sameSite = (process.env.COOKIE_SAMESITE || 'lax') as
      | 'lax'
      | 'strict'
      | 'none';
    const useHostPrefix =
      (process.env.COOKIE_PREFIX_HOST || 'false').toLowerCase() === 'true';
    const refreshCookieName = useHostPrefix
      ? '__Host-refresh_token'
      : 'refresh_token';
    const accessCookieName = useHostPrefix
      ? '__Host-access_token'
      : 'access_token';

    res.clearCookie(refreshCookieName, {
      httpOnly: true,
      secure,
      sameSite,
      path: '/',
    });

    res.clearCookie(accessCookieName, {
      httpOnly: true,
      secure,
      sameSite,
      path: '/',
    });

    res.clearCookie('csrf_token', {
      httpOnly: false,
      secure,
      sameSite,
      path: '/',
    });

    return { success: true };
  }

  @UseGuards(JwtAccessAuthGuard)
  @Get('me')
  getProfile(@Req() req: RequestWithUser): { user: Empleado } {
    const user = req.user as Empleado;
    return { user };
  }
}
