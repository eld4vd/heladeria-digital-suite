import { redirect } from 'next/navigation';
import { privateApi, publicApi } from '@/lib/server-api';
import type { SessionData, ShopSettings } from '@/lib/types';
import AdminShell from '@/components/admin/AdminShell';
export const dynamic = 'force-dynamic';
export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const [sessionResult, settingsResult] = await Promise.allSettled([privateApi<SessionData>('/auth/session'), publicApi<ShopSettings & { timezone?: string }>('/settings')]);
  const session = sessionResult.status === 'fulfilled' ? sessionResult.value : null;
  if (!session?.user || !session.user.active || session.user.role !== 'ADMIN') redirect('/login');
  return <AdminShell user={session.user} initialSettings={settingsResult.status === 'fulfilled' ? settingsResult.value : undefined}>{children}</AdminShell>;
}
