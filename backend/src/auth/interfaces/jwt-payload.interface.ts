// src/auth/interfaces/jwt-payload.interface.ts
export interface JwtPayload {
  sub: number;
  iat?: number;
  exp?: number;
}
