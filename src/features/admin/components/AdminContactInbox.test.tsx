import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { AdminContactGateway } from '../types'
import { AdminContactInbox } from './AdminContactInbox'

describe('AdminContactInbox', () => {
  it('lists restricted messages and requires confirmation before deletion', async () => {
    const remove = vi.fn().mockResolvedValue(undefined)
    const contacts: AdminContactGateway = {
      isAvailable: true,
      list: vi.fn().mockResolvedValue([{ id: 'message-1', firstName: 'Avery', lastName: 'Stone', email: 'avery@example.com', message: 'I found a broken retailer link.', createdAt: '2026-08-08T12:00:00.000Z' }]),
      remove,
    }
    render(<AdminContactInbox contacts={contacts} />)
    expect(await screen.findByRole('heading', { name: 'Avery Stone' })).toBeInTheDocument()
    expect(screen.getByText(/broken retailer link/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(remove).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Confirm delete' }))
    expect(remove).toHaveBeenCalledWith('message-1')
  })
})
