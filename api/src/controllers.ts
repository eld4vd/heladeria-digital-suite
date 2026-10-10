import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query, Req, Res, BadRequestException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { CatalogService } from './catalog.service';
import { OrdersService, publicOrder } from './orders.service';
import { AdminService } from './admin.service';
import { Authenticated, Public, Roles, SessionRequest, SessionService } from './security';
import { configuracionApi, estadoPagoApi, medioPagoApi, OrderStatus } from './contracts';
import { AddressDto, CategoryDto, CreateOrderDto, ExtraDto, FlavorDto, InventoryDto, LoginDto, PaymentDto, PresentationDto, ProductDto, ProfileDto, RegisterDto, SettingsDto, StaffDto, StatusDto, UpdateAddressDto, UpdateCategoryDto, UpdateExtraDto, UpdateFlavorDto, UpdatePresentationDto, UpdateProductDto, UpdateStaffDto } from './dto';

@Public() @Throttle({ default: { limit: 600, ttl: 60000 } }) @Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}
  @Get('health') health() { return { status: 'ok', payments: 'simulated' }; }
  @Get('catalog') list() { return this.catalog.catalog(); }
  @Get('catalog/:slug') product(@Param('slug') slug: string) { return this.catalog.product(slug); }
  @Get('settings') async settings() { return configuracionApi(await this.catalog.settings()); }
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly sessions: SessionService) {}
  @Public() @Get('session') async session(@Req() req: SessionRequest, @Res({ passthrough: true }) res: Response) { return this.sessions.payload(req.sessionContext ?? await this.sessions.create(res)); }
  @Public() @Post('register') @Throttle({ default: { limit: 8, ttl: 60000 } }) register(@Body() dto: RegisterDto, @Req() req: SessionRequest, @Res({ passthrough: true }) res: Response) { return this.auth.register(dto, req.sessionContext!, res); }
  @Public() @Post('login') @Throttle({ default: { limit: 8, ttl: 60000 } }) login(@Body() dto: LoginDto, @Req() req: SessionRequest, @Res({ passthrough: true }) res: Response) { return this.auth.login(dto, req.sessionContext!, res); }
  @Post('logout') async logout(@Req() req: SessionRequest, @Res({ passthrough: true }) res: Response) { return this.sessions.payload(await this.sessions.create(res, undefined, req.sessionContext)); }
  @Authenticated() @Patch('profile') profile(@Req() req: SessionRequest, @Body() dto: ProfileDto) { return this.auth.profile(req.sessionContext!.usuarioId!, dto); }
}

@Authenticated() @Controller('account')
export class AccountController {
  constructor(private readonly auth: AuthService, private readonly orders: OrdersService) {}
  @Get('addresses') addresses(@Req() req: SessionRequest) { return this.auth.addresses(req.sessionContext!.usuarioId!); }
  @Post('addresses') createAddress(@Req() req: SessionRequest, @Body() dto: AddressDto) { return this.auth.createAddress(req.sessionContext!.usuarioId!, dto); }
  @Patch('addresses/:id') updateAddress(@Req() req: SessionRequest, @Param('id') id: string, @Body() dto: UpdateAddressDto) { return this.auth.updateAddress(req.sessionContext!.usuarioId!, id, dto); }
  @Delete('addresses/:id') deleteAddress(@Req() req: SessionRequest, @Param('id') id: string) { return this.auth.deleteAddress(req.sessionContext!.usuarioId!, id); }
  @Get('orders') async ordersList(@Req() req: SessionRequest) { return (await this.orders.account(req.sessionContext!.usuarioId!)).map(publicOrder); }
}

@Authenticated() @Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}
  @Roles('CLIENTE') @Post() async create(@Body() dto: CreateOrderDto, @Req() req: SessionRequest, @Headers('idempotency-key') key?: string) { return publicOrder(await this.orders.create(dto, req.sessionContext!, key)); }
  @Get(':id') async get(@Param('id') id: string, @Req() req: SessionRequest) { return publicOrder(await this.orders.get(id, req.sessionContext!)); }
  @Roles('CLIENTE') @Post(':id/payments') async pay(@Param('id') id: string, @Body() dto: PaymentDto, @Req() req: SessionRequest, @Headers('idempotency-key') key?: string) { return publicOrder(await this.orders.pay(id, dto, req.sessionContext!, key)); }
}

@Roles('ADMINISTRADOR') @Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService, private readonly orders: OrdersService, private readonly catalog: CatalogService) {}
  @Get('overview') async overview() { const result = await this.admin.overview(); return { ...result, recentOrders: result.recentOrders.map(publicOrder) }; }
  @Get('orders') async orderList(@Query('status') status?: string, @Query('q') q?: string) { if (status && !Object.values(OrderStatus).includes(status as OrderStatus)) throw new BadRequestException('Estado inválido.'); return (await this.orders.list(status as OrderStatus | undefined, q?.slice(0, 100))).map(publicOrder); }
  @Get('orders/:id') async order(@Param('id') id: string, @Req() req: SessionRequest) { return publicOrder(await this.orders.get(id, req.sessionContext!)); }
  @Patch('orders/:id/status') async status(@Param('id') id: string, @Body() dto: StatusDto, @Req() req: SessionRequest) { return publicOrder(await this.orders.status(id, dto, req.sessionContext!.usuarioId!)); }
  @Get('products') products() { return this.admin.products(); }
  @Roles('ADMINISTRADOR') @Post('products') createProduct(@Body() dto: ProductDto, @Req() req: SessionRequest) { return this.admin.createProduct(dto, req.sessionContext!.usuarioId!); }
  @Roles('ADMINISTRADOR') @Patch('products/:id') updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto, @Req() req: SessionRequest) { return this.admin.updateProduct(id, dto, req.sessionContext!.usuarioId!); }
  @Roles('ADMINISTRADOR') @Delete('products/:id') deleteProduct(@Param('id') id: string) { return this.admin.deleteProduct(id); }
  @Get('categories') categories() { return this.admin.categories(); }
  @Roles('ADMINISTRADOR') @Post('categories') createCategory(@Body() dto: CategoryDto) { return this.admin.createCategory(dto); }
  @Roles('ADMINISTRADOR') @Patch('categories/:id') updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) { return this.admin.updateCategory(id, dto); }
  @Roles('ADMINISTRADOR') @Delete('categories/:id') deleteCategory(@Param('id') id: string) { return this.admin.deleteCategory(id); }
  @Get('flavors') flavors() { return this.admin.flavors(); }
  @Roles('ADMINISTRADOR') @Post('flavors') createFlavor(@Body() dto: FlavorDto) { return this.admin.createFlavor(dto); }
  @Roles('ADMINISTRADOR') @Patch('flavors/:id') updateFlavor(@Param('id') id: string, @Body() dto: UpdateFlavorDto) { return this.admin.updateFlavor(id, dto); }
  @Roles('ADMINISTRADOR') @Delete('flavors/:id') deleteFlavor(@Param('id') id: string) { return this.admin.deleteFlavor(id); }
  @Get('extras') extras() { return this.admin.extras(); }
  @Roles('ADMINISTRADOR') @Post('extras') createExtra(@Body() dto: ExtraDto) { return this.admin.createExtra(dto); }
  @Roles('ADMINISTRADOR') @Patch('extras/:id') updateExtra(@Param('id') id: string, @Body() dto: UpdateExtraDto) { return this.admin.updateExtra(id, dto); }
  @Roles('ADMINISTRADOR') @Delete('extras/:id') deleteExtra(@Param('id') id: string) { return this.admin.deleteExtra(id); }
  @Get('presentations') presentations() { return this.admin.presentations(); }
  @Roles('ADMINISTRADOR') @Post('presentations') createPresentation(@Body() dto: PresentationDto, @Req() req: SessionRequest) { return this.admin.createPresentation(dto, req.sessionContext!.usuarioId!); }
  @Roles('ADMINISTRADOR') @Patch('presentations/:id') updatePresentation(@Param('id') id: string, @Body() dto: UpdatePresentationDto) { return this.admin.updatePresentation(id, dto); }
  @Roles('ADMINISTRADOR') @Delete('presentations/:id') deletePresentation(@Param('id') id: string) { return this.admin.deletePresentation(id); }
  @Roles('ADMINISTRADOR') @Get('stock-movements') movements() { return this.admin.movements(); }
  @Roles('ADMINISTRADOR') @Post('inventory/adjust') inventory(@Body() dto: InventoryDto, @Req() req: SessionRequest) { return this.admin.adjust(dto, req.sessionContext!.usuarioId!); }
  @Roles('ADMINISTRADOR') @Get('customers') async customers() { return (await this.admin.customers()).map((c) => ({ ...c, orders: c.orders.map(publicOrder) })); }
  @Roles('ADMINISTRADOR') @Get('payments') async payments() { return (await this.admin.payments()).map((p) => ({ id: p.id, method: medioPagoApi(p.medio), status: estadoPagoApi(p.estado), amountMinor: p.importeUnidadesMenores, createdAt: p.creadoEn, order: publicOrder(p.pedido) })); }
  @Roles('ADMINISTRADOR') @Get('reports') reports(@Query('from') from?: string, @Query('to') to?: string) { return this.admin.reports(from, to); }
  @Roles('ADMINISTRADOR') @Get('reports/export') async export(@Query('from') from: string | undefined, @Query('to') to: string | undefined, @Res() response: Response) { response.type('text/csv; charset=utf-8').attachment('delicias-ventas-simuladas.csv').send(await this.admin.csv(from, to)); }
  @Roles('ADMINISTRADOR') @Get('staff') staff() { return this.admin.staff(); }
  @Roles('ADMINISTRADOR') @Post('staff') createStaff(@Body() dto: StaffDto) { return this.admin.createStaff(dto); }
  @Roles('ADMINISTRADOR') @Patch('staff/:id') updateStaff(@Param('id') id: string, @Body() dto: UpdateStaffDto, @Req() req: SessionRequest) { return this.admin.updateStaff(id, dto, req.sessionContext!.usuarioId!); }
  @Roles('ADMINISTRADOR') @Delete('staff/:id') deleteStaff(@Param('id') id: string, @Req() req: SessionRequest) { return this.admin.updateStaff(id, { active: false }, req.sessionContext!.usuarioId!); }
  @Roles('ADMINISTRADOR') @Get('settings') async settings() { return configuracionApi(await this.catalog.settings()); }
  @Roles('ADMINISTRADOR') @Patch('settings') updateSettings(@Body() dto: SettingsDto) { return this.admin.settings(dto); }
}
