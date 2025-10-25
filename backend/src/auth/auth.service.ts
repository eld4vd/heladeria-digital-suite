// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EmpleadosService } from 'src/empleados/empleados.service';
import { Empleado } from 'src/empleados/entities/empleado.entity';
import { AuthLoginDto } from './dto/auth-login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private empleadosService: EmpleadosService,
    private jwtService: JwtService,
  ) {}

  async login(authLoginDto: AuthLoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: Pick<Empleado, 'id' | 'nombre' | 'email'>;
  }> {
    const { email, password } = authLoginDto;
    const empleadoOk = await this.empleadosService.validate(email, password);

    if (!empleadoOk) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    const payload: JwtPayload = {
      sub: empleadoOk.id,
    };

    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      user: {
        id: empleadoOk.id,
        nombre: empleadoOk.nombre,
        email: empleadoOk.email,
      },
    };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Verificar el refresh token
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: process.env.JWT_REFRESH_SECRET,
        },
      );

      // Verificar que el usuario aún existe
      const empleado = await this.empleadosService.findOne(payload.sub);
      if (!empleado) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Generar nuevo access token
      const newPayload: JwtPayload = { sub: payload.sub };
      const accessToken = await this.generateAccessToken(newPayload);

      return { accessToken };
    } catch (error: unknown) {
      throw new UnauthorizedException('Refresh token inválido o expirado', {
        cause: error,
      });
    }
  }

  private async generateAccessToken(payload: JwtPayload): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m', // 15 minutos
    });
  }

  private async generateRefreshToken(payload: JwtPayload): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d', // 7 días
    });
  }

  async verifyAccessToken(token: string): Promise<Empleado> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      const empleado = await this.empleadosService.findOne(payload.sub);
      if (!empleado) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      return empleado;
    } catch (error: unknown) {
      throw new UnauthorizedException('Access token inválido o expirado', {
        cause: error,
      });
    }
  }

  async verifyPayload(payload: JwtPayload): Promise<Empleado> {
    let empleado: Empleado;
    try {
      empleado = await this.empleadosService.findOne(payload.sub);
    } catch (error: unknown) {
      throw new UnauthorizedException(`Usuario inválido: ${payload.sub}`, {
        cause: error,
      });
    }
    return empleado;
  }
}
