import { redirect } from 'next/navigation';
import { publicApi, sessionUser } from '@/lib/server-api';
import { adminBaseUrl } from '@/lib/admin-url';
import type { ShopSettings, User } from '@/lib/types';
import { OrderTracking } from '@/components/shop/OrderTracking';
import { Unavailable } from '@/components/shop/Unavailable';
import styles from '@/components/shop/Shop.module.css';

export const metadata = { title: 'Sigue tu pedido', robots: { index: false, follow: false } };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const returnHref = `/pedidos/${encodeURIComponent(id)}`;
  let customer: User | null;
  try {
    customer = await sessionUser();
  } catch {
    return <Unavailable retryHref={returnHref} />;
  }
  if (!customer?.active) redirect(`/login?next=${encodeURIComponent(returnHref)}`);
  if (customer.role !== 'CUSTOMER') redirect(adminBaseUrl);
  let settings: ShopSettings;
  try {
    settings = await publicApi<ShopSettings>('/settings');
  } catch {
    return <Unavailable retryHref={returnHref} />;
  }
  return <div className={`container ${styles.orderFlow}`}><OrderTracking id={id} settings={settings} /></div>;
}
