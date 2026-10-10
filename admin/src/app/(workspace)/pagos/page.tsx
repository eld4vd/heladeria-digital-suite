import { PaymentsScreen } from '@/components/admin/OperationsScreen';
import RequireAdmin from '@/components/admin/RequireAdmin';
export default function Page() { return <RequireAdmin><PaymentsScreen /></RequireAdmin>; }
