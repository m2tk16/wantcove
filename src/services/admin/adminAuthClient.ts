import { confirmSignIn, fetchAuthSession, getCurrentUser, signIn, signOut } from 'aws-amplify/auth'
import type { AdminAuthGateway, AdminAuthStep, AdminSession } from '../../features/admin/types'
import { hasAmplifyConfiguration } from '../amplify/configureAmplify'

function readGroups(value: unknown) {
  if (Array.isArray(value)) return value.filter((group): group is string => typeof group === 'string')
  if (typeof value === 'string') return value.replace(/^\[|\]$/g, '').split(',').map((group) => group.trim())
  return []
}

async function currentSession(): Promise<AdminSession | null> {
  try {
    const [user, session] = await Promise.all([getCurrentUser(), fetchAuthSession()])
    const payload = session.tokens?.idToken?.payload
    const groups = readGroups(payload?.['cognito:groups'])
    const email = typeof payload?.email === 'string'
      ? payload.email
      : user.signInDetails?.loginId ?? user.username
    return { email, isAdmin: groups.includes('ADMINS') }
  } catch {
    return null
  }
}

type SignInOutput = Awaited<ReturnType<typeof signIn>>

async function toAdminStep(result: SignInOutput): Promise<AdminAuthStep> {
  if (result.isSignedIn) {
    const session = await currentSession()
    if (!session) return { kind: 'unsupported', message: 'The authenticated session could not be verified.' }
    return { kind: 'signedIn', session }
  }

  switch (result.nextStep.signInStep) {
    case 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED':
      return { kind: 'newPassword' }
    case 'CONTINUE_SIGN_IN_WITH_TOTP_SETUP':
      return {
        kind: 'totpSetup',
        sharedSecret: result.nextStep.totpSetupDetails.sharedSecret,
        setupUri: result.nextStep.totpSetupDetails.getSetupUri('WantCove Admin').toString(),
      }
    case 'CONFIRM_SIGN_IN_WITH_TOTP_CODE':
      return { kind: 'totpCode' }
    default:
      return { kind: 'unsupported', message: `Unsupported sign-in step: ${result.nextStep.signInStep}` }
  }
}

export const adminAuthClient: AdminAuthGateway = {
  isAvailable: hasAmplifyConfiguration,
  current: currentSession,
  async signIn(email, password) {
    return toAdminStep(await signIn({ username: email.trim(), password }))
  },
  async confirm(challengeResponse) {
    return toAdminStep(await confirmSignIn({ challengeResponse }))
  },
  async signOut() {
    await signOut()
  },
}
