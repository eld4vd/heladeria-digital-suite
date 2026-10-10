import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

describe('cliente API', () => {
  it('comparte el bootstrap de sesión de componentes concurrentes', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ user: null, csrfToken: 'token-demo' }), { status: 200 }));
    vi.stubGlobal('fetch', fetch);
    const { api, getSession } = await import('@/lib/api');
    await Promise.all([getSession(), api('/auth/session'), api('/auth/session')]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('envía CSRF e idempotencia pero no acepta totales implícitos', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ user: null, csrfToken: 'csrf-demo' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'pedido' }), { status: 201 }));
    vi.stubGlobal('fetch', fetch);
    const { api } = await import('@/lib/api');
    await api('/orders', { method: 'POST', idempotencyKey: 'demo-key-123', body: { items: [] } });
    expect(fetch.mock.calls[1][1]).toMatchObject({ credentials: 'same-origin', cache: 'no-store', headers: { 'X-CSRF-Token': 'csrf-demo', 'Idempotency-Key': 'demo-key-123' } });
  });

  it('expone errores de validación sin anunciar un éxito', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: ['Sin stock', 'Presentación desactivada'] }), { status: 409 })));
    const { api } = await import('@/lib/api');
    await expect(api('/catalog')).rejects.toMatchObject({ status: 409, message: 'Sin stock. Presentación desactivada' });
  });
});
