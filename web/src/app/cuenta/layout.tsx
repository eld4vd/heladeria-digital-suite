import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { privateApi, publicApi } from '@/lib/server-api';
import type { SessionData, ShopSettings } from '@/lib/types';
import AccountShell from '@/components/account/AccountShell';
import { adminBaseUrl } from '@/lib/admin-url';
import '@/components/account/shared.css';
import '@/components/account/account.css';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Mi cuenta', robots: { index: false, follow: false } };
export default async function Layout({ children }: { children: React.ReactNode }) {
  const [sessionResult, settingsResult] = await Promise.allSettled([privateApi<SessionData>('/auth/session'), publicApi<ShopSettings & { timezone?: string }>('/settings')]);
  const session = sessionResult.status === 'fulfilled' ? sessionResult.value : null;
  if (!session?.user || !session.user.active) redirect('/login?next=/cuenta');
  if (session.user.role !== 'CUSTOMER') redirect(adminBaseUrl);
  return <AccountShell user={session.user} initialSettings={settingsResult.status === 'fulfilled' ? settingsResult.value : undefined}>{children}</AccountShell>;
}
