import { adminPasswordRecoveryClient } from '../../../services/admin/adminPasswordRecoveryClient'
import { AdminPasswordRecoveryPanel } from '../components/AdminPasswordRecoveryPanel'
import type { AdminPasswordRecoveryGateway } from '../types'
import '../admin.css'

export function AdminPasswordRecoveryPage({ recovery = adminPasswordRecoveryClient }: { recovery?: AdminPasswordRecoveryGateway }) {
  return <div className="admin-page">
    <header className="admin-page-header"><div><span className="kicker">Private workspace</span><h1>Administrator recovery</h1><p>Recover a restricted WantCove administrator password without weakening MFA or catalog authorization.</p></div></header>
    <AdminPasswordRecoveryPanel recovery={recovery} />
  </div>
}
