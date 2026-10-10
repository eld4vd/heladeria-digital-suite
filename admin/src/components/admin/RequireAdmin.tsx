import { redirect } from 'next/navigation';
import { privateApi } from '@/lib/server-api';
import type { SessionData } from '@/lib/types';
export default async function RequireAdmin({ children }: { children: React.ReactNode }) { const session = await privateApi<SessionData>('/auth/session'); if (!session.user?.active || session.user.role !== 'ADMIN') redirect('/login'); return children; }
