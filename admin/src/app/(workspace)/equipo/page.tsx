import { StaffScreen } from '@/components/admin/SettingsScreen';
import RequireAdmin from '@/components/admin/RequireAdmin';
export default function Page() { return <RequireAdmin><StaffScreen /></RequireAdmin>; }
