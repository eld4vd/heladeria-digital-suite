import type { Metadata } from 'next';
import AuthForm from '@/components/account/AuthForm';
export const metadata: Metadata = { title: 'Iniciar sesión', robots: { index: false, follow: false } };
export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) { const { next } = await searchParams; return <AuthForm next={Array.isArray(next) ? next[0] : next} />; }
