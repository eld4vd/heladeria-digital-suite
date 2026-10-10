import { redirect } from 'next/navigation';
import { publicApi, sessionUser } from '@/lib/server-api';
import { adminBaseUrl } from '@/lib/admin-url';
import type { ShopSettings, User } from '@/lib/types';
import { CheckoutView } from '@/components/shop/CheckoutView';
import { Unavailable } from '@/components/shop/Unavailable';
import styles from '@/components/shop/Shop.module.css';

export const metadata = { title: 'Completar tu pedido', robots: { index: false, follow: false } };

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ mode?: string | string[]; order?: string | string[] }> }) {
  const query = await searchParams;
  const direct = query.mode === 'direct';
  const orderId = typeof query.order === 'string' ? query.order : undefined;
  const returnQuery = new URLSearchParams();
  if (direct) returnQuery.set('mode', 'direct');
  if (orderId) returnQuery.set('order', orderId);
  const returnHref = `/checkout${returnQuery.size ? `?${returnQuery}` : ''}`;
  let customer: User | null;
  try {
    customer = await sessionUser();
  } catch {
    return <Unavailable retryHref={returnHref} />;
  }
  // Las redirecciones quedan fuera del catch: NextJS las utiliza para finalizar el renderizado.
  if (!customer?.active) redirect(`/login?next=${encodeURIComponent(returnHref)}`);
  if (customer.role !== 'CUSTOMER') redirect(adminBaseUrl);
  let settings: ShopSettings;
  try {
    settings = await publicApi<ShopSettings>('/settings');
  } catch {
    return <Unavailable retryHref={returnHref} />;
  }
  return <div className={`container ${styles.orderFlow}`}><CheckoutView key={`${customer.id}:${returnHref}`} settings={settings} customer={customer} direct={direct} existingOrderId={orderId} /></div>;
}
