import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { ContactSubmissionGateway } from '../types'
import { ContactPage } from './ContactPage'

function fillForm() {
  fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Martin' } })
  fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Tulala' } })
  fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'martin@example.com' } })
  fireEvent.change(screen.getByLabelText(/^phone/i), { target: { value: '+1 615 555 0100' } })
  fireEvent.change(screen.getByLabelText(/^message/i), { target: { value: 'Please contact me about a product.' } })
}

describe('ContactPage', () => {
  it('submits through the website and clears the form only after success', async () => {
    const submit = vi.fn().mockResolvedValue(undefined)
    const contact: ContactSubmissionGateway = { isAvailable: true, submit }
    render(<ContactPage contact={contact} />)
    fillForm()
    fireEvent.click(screen.getByRole('button', { name: /send message/i }))
    expect(await screen.findByRole('status')).toHaveTextContent(/message received/i)
    expect(submit).toHaveBeenCalledWith(expect.objectContaining({ email: 'martin@example.com', phone: '+1 615 555 0100' }))
    expect(screen.getByLabelText(/first name/i)).toHaveValue('')
  })

  it('preserves every entry when the backend rejects the submission', async () => {
    const contact: ContactSubmissionGateway = { isAvailable: true, submit: vi.fn().mockRejectedValue(new Error('Too many contact requests.')) }
    render(<ContactPage contact={contact} />)
    fillForm()
    fireEvent.click(screen.getByRole('button', { name: /send message/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/entries have been preserved/i)
    expect(screen.getByLabelText(/first name/i)).toHaveValue('Martin')
    expect(screen.getByLabelText(/last name/i)).toHaveValue('Tulala')
    expect(screen.getByLabelText(/email address/i)).toHaveValue('martin@example.com')
    expect(screen.getByLabelText(/^phone/i)).toHaveValue('+1 615 555 0100')
    expect(screen.getByLabelText(/^message/i)).toHaveValue('Please contact me about a product.')
  })
})
