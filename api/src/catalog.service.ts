import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { categoriaApi, extraApi, productoApi, saborApi } from './contracts';

export const productInclude = { categoria: true, sabor: true, presentaciones: { orderBy: { precioUnidadesMenores: 'asc' as const } } };
// Se devuelve cuando el administrador aún no ha guardado la configuración; GET y el seed nunca la almacenan.
export const emptyShopSettings = {
  nombre: '', descripcion: '', direccion: '', ciudad: '', telefono: '', correo: '', horarios: '', descripcionCobertura: '',
  moneda: 'BOB', idioma: 'es-BO', zonaHoraria: 'America/La_Paz', costoEnvioUnidadesMenores: 0, envioHabilitado: false,
};
const publicProductInclude = { categoria: true, sabor: true, presentaciones: { where: { activo: true }, orderBy: { precioUnidadesMenores: 'asc' as const } } };

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}
  async catalog() {
    const [products, categories, flavors, extras] = await Promise.all([
      this.prisma.producto.findMany({ where: { activo: true, categoria: { activo: true } }, include: publicProductInclude, orderBy: [{ destacado: 'desc' }, { nombre: 'asc' }] }),
      this.prisma.categoria.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } }),
      this.prisma.sabor.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } }),
      this.prisma.extra.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } }),
    ]);
    return { products: products.map(product => productoApi(product, extras)), categories: categories.map(categoriaApi), flavors: flavors.map(saborApi), extras: extras.map(extraApi) };
  }
  async product(slug: string) {
    const [product, extras] = await Promise.all([
      this.prisma.producto.findFirst({ where: { identificadorUrl: slug, activo: true, categoria: { activo: true } }, include: publicProductInclude }),
      this.prisma.extra.findMany({ where: { activo: true }, orderBy: { nombre: 'asc' } }),
    ]);
    if (!product) throw new NotFoundException('Este helado no está disponible.');
    return productoApi(product, extras);
  }
  async settings() {
    const settings = await this.prisma.configuracionNegocio.findUnique({ where: { id: 'shop' } });
    return settings ?? { id: 'shop', ...emptyShopSettings, actualizadoEn: null };
  }
}
