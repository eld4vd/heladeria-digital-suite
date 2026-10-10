import { SettingsScreen } from '@/components/admin/SettingsScreen';
import RequireAdmin from '@/components/admin/RequireAdmin';
export default function Page() { return <RequireAdmin><SettingsScreen /></RequireAdmin>; }
