import { redirect } from 'next/navigation';
import AuthForm from '@/components/account/AuthForm';
import { privateApi } from '@/lib/server-api';
import type { SessionData } from '@/lib/types';

export default async function Page() {
  let session: SessionData | null = null;
  try { session = await privateApi<SessionData>('/auth/session'); } catch { /* El acceso permanece disponible aunque la API no responda. */ }
  if (session?.user?.active && session.user.role === 'ADMIN') redirect('/');
  return <AuthForm />;
}
