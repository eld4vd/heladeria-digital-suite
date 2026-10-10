import { expect, test, type Page } from '@playwright/test';

async function selectProduct(page: Page, slug = 'cucurucho-artesanal') {
  await page.goto(`/producto/${slug}`);
  await expect(page.getByRole('button', { name: 'Añadir al carrito' })).toBeEnabled();
  await page.getByRole('checkbox', { name: 'Vainilla de Madagascar', exact: true }).check();
}

async function delivery(page: Page, name = 'Cliente de prueba', address = 'Calle de prueba 123, zona centro') {
  await page.getByLabel('Nombre completo').fill(name);
  await page.getByLabel('Correo electrónico', { exact: true }).fill('compra@example.test');
  await page.getByLabel('Teléfono', { exact: true }).fill('77123456');
  await page.getByLabel('Dirección completa').fill(address);
  await page.getByLabel('Ciudad', { exact: true }).fill('Sucre');
  await page.getByRole('button', { name: 'Revisar total y continuar' }).click();
  await expect(page.getByRole('heading', { name: 'Todo listo para confirmar.' })).toBeVisible();
}

test('invitado: carrito, rechazo, reintento y pedido privado', async ({ page, browser }) => {
  await selectProduct(page);
  await page.getByRole('button', { name: 'Añadir al carrito' }).click();
  await expect(page.getByLabel('Carrito, 1 productos')).toBeVisible();
  await page.goto('/carrito');
  await page.getByRole('button', { name: 'Aumentar cantidad de Cucurucho artesanal' }).click();
  await page.reload();
  await expect(page.getByLabel('Carrito, 2 productos')).toBeVisible();
  await page.getByRole('link', { name: 'Continuar con mi pedido' }).click();
  await delivery(page);
  await expect(page.locator('input[autocomplete="cc-number"], input[autocomplete="cc-csc"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Simular rechazo' }).click();
  await expect(page.getByText(/Pago rechazado de demostración/)).toBeVisible();
  await page.getByRole('button', { name: /Simular pago aprobado/ }).click();
  await expect(page).toHaveURL(/\/pedidos\/[^/?]+$/);
  await expect(page.getByRole('heading', { name: '¡Recibimos tu pedido!' })).toBeVisible();
  const orderURL = page.url();
  const otherContext = await browser.newContext();
  try {
    const other = await otherContext.newPage();
    await other.goto(orderURL);
    await expect(other.getByRole('heading', { name: 'No podemos abrir este pedido.' })).toBeVisible();
    await expect(other.getByText('Calle de prueba 123, zona centro')).toHaveCount(0);
  } finally { await otherContext.close(); }
  await page.goto('/carrito');
  await expect(page.getByRole('heading', { name: 'Aquí cabe un poco de felicidad.' })).toBeVisible();
});

test('comprar ahora paga por QR sin borrar el carrito habitual', async ({ page }) => {
  await selectProduct(page);
  await page.getByRole('button', { name: 'Añadir al carrito' }).click();
  await expect(page.getByLabel('Carrito, 1 productos')).toBeVisible();
  await selectProduct(page, 'copa-pistacho');
  await page.getByRole('button', { name: 'Comprar ahora' }).click();
  await expect(page).toHaveURL(/mode=direct/);
  await expect(page.getByText('Compra directa: tu carrito habitual se mantiene intacto.')).toBeVisible();
  await delivery(page);
  await page.getByRole('button', { name: 'QR de demostración' }).click();
  await page.getByRole('button', { name: /Simular pago aprobado/ }).click();
  await expect(page).toHaveURL(/\/pedidos\/[^/?]+$/);
  await page.goto('/carrito');
  await expect(page.getByRole('heading', { name: 'Cucurucho artesanal', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Copa de pistacho', exact: true })).toHaveCount(0);
});

test('cuenta opcional: registro, dirección guardada e historial', async ({ page }) => {
  await page.goto('/registro');
  await page.getByLabel('Tu nombre').fill('Cliente registrado');
  await page.getByLabel('Correo electrónico', { exact: true }).fill(`cliente-${Date.now()}@example.test`);
  await page.getByLabel('Contraseña', { exact: true }).fill('PruebaSegura2026!');
  await page.getByRole('button', { name: /Crear mi cuenta/ }).click();
  await expect(page).toHaveURL(/\/cuenta$/);
  await page.goto('/cuenta/direcciones');
  await page.getByRole('button', { name: '+ Agregar dirección', exact: true }).click();
  await page.getByLabel('Nombre de la dirección').fill('Casa de prueba');
  await page.getByLabel('Dirección completa').fill('Calle guardada 456, centro');
  await page.getByLabel('Ciudad', { exact: true }).fill('Sucre');
  await page.getByRole('button', { name: 'Guardar dirección', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Casa de prueba' })).toBeVisible();
  await selectProduct(page, 'copa-chocolate');
  await page.getByRole('button', { name: 'Comprar ahora' }).click();
  await expect(page.getByLabel('Nombre completo')).toHaveValue('Cliente registrado');
  await page.getByLabel('Usar una dirección guardada').selectOption({ label: 'Casa de prueba · Calle guardada 456, centro' });
  await expect(page.getByLabel('Dirección completa')).toHaveValue('Calle guardada 456, centro');
  await delivery(page, 'Cliente registrado', 'Calle guardada 456, centro');
  const pendingId = new URL(page.url()).searchParams.get('order');
  expect(pendingId).toBeTruthy();
  await page.goto(`/cuenta/pedidos/${pendingId}`);
  await page.getByRole('link', { name: 'Continuar al pago simulado →' }).click();
  await expect(page.getByRole('heading', { name: 'Todo listo para confirmar.' })).toBeVisible();
  await page.getByRole('button', { name: /Simular pago aprobado/ }).click();
  await expect(page).toHaveURL(/\/pedidos\/[^/?]+$/);
  await page.goto('/cuenta/pedidos');
  await expect(page.getByText('Chocolate sublime', { exact: false }).first()).toBeVisible();
});

test('catálogo: búsqueda, categorías y ordenamiento', async ({ page }) => {
  await page.goto('/catalogo');
  await page.getByLabel('Buscar helados y sabores').fill('pistacho');
  await expect(page.getByRole('link', { name: /Copa de pistacho/ }).first()).toBeVisible();
  await page.getByLabel('Buscar helados y sabores').fill('producto-que-no-existe');
  await expect(page.getByRole('heading', { name: 'Ese antojo aún no está aquí.' })).toBeVisible();
  await page.getByRole('button', { name: 'Ver todos los helados' }).click();
  await page.getByRole('button', { name: 'Para compartir', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('2 delicias para ti');
  await page.getByLabel('Ordenar productos').selectOption('price-asc');
});

test('responsive, teclado y SEO público/privado', async ({ page }, testInfo) => {
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'La vida sabe más dulce.' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(overflow, `La landing desborda a ${width}px`).toBe(false);
    await page.screenshot({ path: testInfo.outputPath(`landing-${width}.png`), fullPage: true, scale: 'css' });
    await page.goto('/catalogo');
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1), `El catálogo desborda a ${width}px`).toBe(false);
    await page.screenshot({ path: testInfo.outputPath(`catalogo-${width}.png`), fullPage: true, scale: 'css' });
  }
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Saltar al contenido' })).toBeFocused();
  await page.keyboard.press('Enter');
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  expect(new URL(canonical!).toString()).toBe(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || process.env.E2E_BASE_URL || 'http://localhost:3000').toString());
  await expect(page.locator('script[type="application/ld+json"]')).not.toHaveCount(0);
  await page.goto('/checkout');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});
