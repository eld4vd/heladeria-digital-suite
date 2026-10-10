import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { compare, hash as passwordHash } from 'bcrypt';
import { Response } from 'express';
import { AddressDto, LoginDto, ProfileDto, RegisterDto, UpdateAddressDto } from './dto';
import { PrismaService } from './prisma.service';
import { SessionContext, SessionService, safeUser } from './security';
import { direccionApi } from './contracts';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly sessions: SessionService) {}
  private password(value: string) {
    if (Buffer.byteLength(value, 'utf8') > 72) throw new BadRequestException('La contraseña no puede superar 72 bytes.');
  }
  async register(dto: RegisterDto, session: SessionContext, response: Response) {
    this.password(dto.password);
    const email = dto.email.trim().toLowerCase();
    if (await this.prisma.usuario.findUnique({ where: { correo: email } })) throw new ConflictException('Ya existe una cuenta con ese correo.');
    const user = await this.prisma.usuario.create({ data: { nombre: dto.name.trim(), correo: email, huellaContrasena: await passwordHash(dto.password, 12), rol: 'CLIENTE' } });
    return this.sessions.payload(await this.sessions.create(response, user.id, session));
  }
  async login(dto: LoginDto, session: SessionContext, response: Response) {
    this.password(dto.password);
    const user = await this.prisma.usuario.findUnique({ where: { correo: dto.email.trim().toLowerCase() } });
    if (!user || !user.activo || user.rol === 'OPERADOR' || !(await compare(dto.password, user.huellaContrasena)) || (dto.internal && user.rol !== 'ADMINISTRADOR')) throw new UnauthorizedException('Correo o contraseña incorrectos.');
    return this.sessions.payload(await this.sessions.create(response, user.id, session));
  }
  async profile(userId: string, dto: ProfileDto) {
    const data = { nombre: dto.name?.trim(), telefono: dto.phone };
    return safeUser(await this.prisma.usuario.update({ where: { id: userId }, data }));
  }
  async addresses(userId: string) { return (await this.prisma.direccion.findMany({ where: { usuarioId: userId }, orderBy: { creadoEn: 'desc' } })).map(direccionApi); }
  async createAddress(userId: string, dto: AddressDto) {
    if (await this.prisma.direccion.count({ where: { usuarioId: userId } }) >= 20) throw new BadRequestException('Puedes guardar hasta 20 direcciones.');
    return direccionApi(await this.prisma.direccion.create({ data: { etiqueta: dto.label, direccion: dto.address, ciudad: dto.city, referencia: dto.reference, usuarioId: userId } }));
  }
  private async ownedAddress(userId: string, id: string) {
    const address = await this.prisma.direccion.findFirst({ where: { id, usuarioId: userId } });
    if (!address) throw new NotFoundException('Dirección no encontrada.');
    return address;
  }
  async updateAddress(userId: string, id: string, dto: UpdateAddressDto) {
    await this.ownedAddress(userId, id);
    return direccionApi(await this.prisma.direccion.update({ where: { id }, data: { etiqueta: dto.label, direccion: dto.address, ciudad: dto.city, referencia: dto.reference } }));
  }
  async deleteAddress(userId: string, id: string) {
    await this.ownedAddress(userId, id);
    await this.prisma.direccion.delete({ where: { id } });
    return { success: true };
  }
}
