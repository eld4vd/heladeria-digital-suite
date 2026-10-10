import type { ShopSettings } from '@/lib/types';
import { publicApi } from '@/lib/server-api';
import { CartView } from '@/components/shop/CartView';
import { Unavailable } from '@/components/shop/Unavailable';
import styles from '@/components/shop/Shop.module.css';

export const metadata = { title: 'Tu carrito', robots: { index: false, follow: false } };

export default async function CartPage() {
  let settings: ShopSettings;
  try {
    settings = await publicApi<ShopSettings>('/settings');
  } catch {
    return <Unavailable retryHref="/carrito" />;
  }
  return <div className={`container ${styles.orderFlow}`}><div className={styles.pageIntro}><h1>Tu carrito.</h1><p>Revisa las cantidades y continúa con tu pedido.</p></div><CartView settings={settings} /></div>;
}
