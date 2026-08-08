import { confirmResetPassword, resetPassword } from 'aws-amplify/auth'
import type { AdminPasswordRecoveryGateway } from '../../features/admin/types'
import { hasAmplifyConfiguration } from '../amplify/configureAmplify'

export const adminPasswordRecoveryClient: AdminPasswordRecoveryGateway = {
  isAvailable: hasAmplifyConfiguration,
  async request(email) {
    await resetPassword({ username: email.trim() })
  },
  async confirm(email, confirmationCode, newPassword) {
    await confirmResetPassword({
      username: email.trim(),
      confirmationCode: confirmationCode.trim(),
      newPassword,
    })
  },
}
