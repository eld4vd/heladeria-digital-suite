import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { BRAND_NAME } from '@/lib/brand';

export async function socialImage({ brand, title, subtitle }: { brand: string; title: string; subtitle: string }) {
  // ImageResponse no dispone del CSS del documento: estos colores reflejan el @theme oficial
  // de app/globals.css, sin introducir otra paleta para las tarjetas de redes sociales.
  // Lee un PNG local pequeño: sin solicitudes al propio servidor, servidor remoto de imágenes ni SVG incrustado.
  const logo = await readFile(join(process.cwd(), 'public', 'brand', 'logo-icono-social.png'));
  const logoUrl = 'data:image/png;base64,' + logo.toString('base64');
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#ffdce8', color: '#321622', padding: '64px 72px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#9d1749', fontSize: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}><img src={logoUrl} alt="" width={72} height={72} /><span>{(brand || BRAND_NAME).slice(0, 45)}</span></div>
        <span style={{ fontSize: 18 }}>Tienda de demostración</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div style={{ fontSize: title.length > 52 ? 58 : 76, fontWeight: 700, lineHeight: 1.1 }}>{title.slice(0, 95)}</div>
        <div style={{ fontSize: 28, lineHeight: 1.4, color: '#704655' }}>{subtitle.slice(0, 135)}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, color: '#9d1749', fontSize: 24 }}>
        <div style={{ display: 'flex', width: 52, height: 12, borderRadius: 6, background: '#9d1749' }} />
        <span>Helados, sabores y buenos momentos. Pagos simulados.</span>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
