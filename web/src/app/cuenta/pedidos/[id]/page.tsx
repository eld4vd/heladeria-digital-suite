import { OrderDetailScreen } from '@/components/account/OrderDetailScreen';
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <OrderDetailScreen id={id} />; }
