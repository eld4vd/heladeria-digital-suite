import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { PrismaService } from './prisma.service';
import { RolUsuario, Sesion, Usuario } from './generated/prisma/client';
import { rolApi } from './contracts';

export const Public = () => SetMetadata('public', true);
export const Roles = (...roles: RolUsuario[]) => SetMetadata('roles', roles);
export const Authenticated = () => SetMetadata('authenticated', true);
export type SessionContext = Sesion & { usuario: Usuario | null };
export type SessionRequest = Request & { sessionContext: SessionContext | null };
export const cookieName = 'delicias_session';
export const hash = (value: string) => createHash('sha256').update(value).digest('hex');
export function safeUser(user: Usuario | null) {
  if (!user) return null;
  return { id: user.id, name: user.nombre, email: user.correo, phone: user.telefono, role: rolApi(user.rol), active: user.activo, createdAt: user.creadoEn };
}

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {}
  async find(token: unknown): Promise<SessionContext | null> {
    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) return null;
    const session = await this.prisma.sesion.findUnique({ where: { huellaToken: hash(token) }, include: { usuario: true } });
    // OPERADOR permanece por compatibilidad historica, pero no permite acceso.
    if (!session || session.expiraEn <= new Date() || (session.usuario && (!session.usuario.activo || session.usuario.rol === 'OPERADOR'))) return null;
    return session;
  }
  async create(response: Response, userId?: string, previous?: SessionContext | null): Promise<SessionContext> {
    const token = randomBytes(32).toString('hex');
    const days = this.config.get<number>('SESSION_DAYS', 7);
    const expiresAt = new Date(Date.now() + days * 86400000);
    const session = await this.prisma.$transaction(async (tx) => {
      const created = await tx.sesion.create({ data: { huellaToken: hash(token), tokenCsrf: randomBytes(32).toString('hex'), expiraEn: expiresAt, usuarioId: userId }, include: { usuario: true } });
      if (previous) {
        // Solo pueden asociarse los pedidos de invitado de este navegador, nunca por coincidencia de correo.
        if (!previous.usuarioId && userId) await tx.pedido.updateMany({ where: { sesionId: previous.id, usuarioId: null }, data: { sesionId: created.id, usuarioId: userId } });
        await tx.sesion.update({ where: { id: previous.id }, data: { expiraEn: new Date(0) } });
      }
      return created;
    });
    response.cookie(cookieName, token, { httpOnly: true, secure: this.config.get('NODE_ENV') === 'production', sameSite: 'lax', path: '/', expires: expiresAt });
    return session;
  }
  payload(session: SessionContext) { return { user: safeUser(session.usuario), csrfToken: session.tokenCsrf }; }
}

@Injectable()
export class SecurityGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly sessions: SessionService, private readonly config: ConfigService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<SessionRequest>();
    request.sessionContext = await this.sessions.find(request.cookies?.[cookieName]);
    const isPublic = this.reflector.getAllAndOverride<boolean>('public', [context.getHandler(), context.getClass()]);
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      const allowed = new Set([
        new URL(this.config.getOrThrow<string>('FRONTEND_ORIGIN')).origin,
        new URL(this.config.get<string>('ADMIN_ORIGIN', 'http://localhost:3001')).origin,
      ]);
      if (request.headers.origin && !allowed.has(request.headers.origin)) throw new ForbiddenException('Origen no permitido.');
      const token = request.header('x-csrf-token');
      const expected = request.sessionContext?.tokenCsrf;
      if (!token || !expected || !/^[a-f0-9]{64}$/.test(token) || !/^[a-f0-9]{64}$/.test(expected) || !timingSafeEqual(Buffer.from(token, 'hex'), Buffer.from(expected, 'hex'))) throw new ForbiddenException('Sesión o protección CSRF inválida. Actualiza la página.');
    }
    if (!isPublic && !request.sessionContext) throw new UnauthorizedException('Inicia una sesión para continuar.');
    if (this.reflector.getAllAndOverride<boolean>('authenticated', [context.getHandler(), context.getClass()]) && !request.sessionContext?.usuario) throw new UnauthorizedException('Inicia sesión en tu cuenta.');
    const roles = this.reflector.getAllAndOverride<RolUsuario[]>('roles', [context.getHandler(), context.getClass()]);
    if (roles && (!request.sessionContext?.usuario || !roles.includes(request.sessionContext.usuario.rol))) throw new ForbiddenException('No tienes permisos para esta operación.');
    return true;
  }
}
