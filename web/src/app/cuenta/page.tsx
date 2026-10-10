import { redirect } from 'next/navigation';
import { privateApi } from '@/lib/server-api';
import type { SessionData } from '@/lib/types';
import { ProfilePanel } from '@/components/account/AccountPanels';
export default async function Page() { const session = await privateApi<SessionData>('/auth/session'); if (!session.user) redirect('/login?next=/cuenta'); return <ProfilePanel user={session.user} />; }
