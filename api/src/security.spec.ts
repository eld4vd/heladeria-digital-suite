import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { SecurityGuard, SessionContext, SessionService } from './security';

describe('Protección CSRF y permisos', () => {
  const token = 'a'.repeat(64);
  const session = { id: 'session-test', tokenCsrf: token, usuario: null } as SessionContext;
  const sessions = { find: jest.fn().mockResolvedValue(session) };
  function context(value: string, origin = 'http://localhost:3000') {
    return { switchToHttp: () => ({ getRequest: () => ({ method: 'POST', cookies: {}, headers: { origin }, header: () => value }) }), getHandler: () => ({}), getClass: () => ({}) } as unknown as ExecutionContext;
  }
  const guard = new SecurityGuard(new Reflector(), sessions as unknown as SessionService, new ConfigService({ FRONTEND_ORIGIN: 'http://localhost:3000' }));
  it('acepta únicamente el token hexadecimal exacto de la sesión', async () => { await expect(guard.canActivate(context(token))).resolves.toBe(true); });
  it('rechaza unicode y longitudes manipuladas con 403, no RangeError', async () => {
    await expect(guard.canActivate(context('é'.repeat(64)))).rejects.toMatchObject({ status: 403 });
    await expect(guard.canActivate(context('b'.repeat(64)))).rejects.toMatchObject({ status: 403 });
    await expect(guard.canActivate(context(token.slice(1)))).rejects.toMatchObject({ status: 403 });
  });
  it('rechaza un origen distinto aunque conozca el CSRF', async () => { await expect(guard.canActivate(context(token, 'https://other.example'))).rejects.toMatchObject({ status: 403 }); });
});
