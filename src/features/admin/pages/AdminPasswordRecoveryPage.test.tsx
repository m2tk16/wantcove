import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { AdminPasswordRecoveryGateway } from '../types'
import { AdminPasswordRecoveryPage } from './AdminPasswordRecoveryPage'

function recoveryGateway(overrides: Partial<AdminPasswordRecoveryGateway> = {}): AdminPasswordRecoveryGateway {
  return {
    isAvailable: true,
    request: vi.fn().mockResolvedValue(undefined),
    confirm: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

async function requestRecovery(recovery: AdminPasswordRecoveryGateway) {
  render(<AdminPasswordRecoveryPage recovery={recovery} />)
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'admin@example.com' } })
  fireEvent.click(screen.getByRole('button', { name: 'Send recovery code' }))
  expect(await screen.findByRole('heading', { name: 'Enter recovery code' })).toBeInTheDocument()
}

describe('AdminPasswordRecoveryPage', () => {
  it('returns the same account-neutral response when the recovery request is rejected', async () => {
    const request = vi.fn().mockRejectedValue(new Error('UserNotFoundException'))
    await requestRecovery(recoveryGateway({ request }))

    expect(screen.getByRole('status')).toHaveTextContent('If an eligible administrator account exists')
    expect(screen.queryByText(/UserNotFoundException/)).not.toBeInTheDocument()
    expect(request).toHaveBeenCalledWith('admin@example.com')
  })

  it('confirms a matching password and clears the recovery form', async () => {
    const confirm = vi.fn().mockResolvedValue(undefined)
    await requestRecovery(recoveryGateway({ confirm }))

    fireEvent.change(screen.getByLabelText('Recovery code'), { target: { value: '123456' } })
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'A-secure-password-123' } })
    fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: 'A-secure-password-123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Update password' }))

    expect(await screen.findByRole('heading', { name: 'Recovery complete' })).toBeInTheDocument()
    expect(screen.getByText(/authenticator and ADMINS authorization are still required/i)).toBeInTheDocument()
    expect(confirm).toHaveBeenCalledWith('admin@example.com', '123456', 'A-secure-password-123')
    expect(screen.queryByLabelText('Recovery code')).not.toBeInTheDocument()
  })

  it('rejects mismatched passwords before calling Cognito', async () => {
    const confirm = vi.fn()
    await requestRecovery(recoveryGateway({ confirm }))

    fireEvent.change(screen.getByLabelText('Recovery code'), { target: { value: '123456' } })
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'A-secure-password-123' } })
    fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: 'A-different-password-456' } })
    fireEvent.click(screen.getByRole('button', { name: 'Update password' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('New passwords do not match.')
    await waitFor(() => expect(confirm).not.toHaveBeenCalled())
  })
})
