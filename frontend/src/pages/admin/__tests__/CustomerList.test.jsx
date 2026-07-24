import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const { mockGetUsers, mockDeleteUser } = vi.hoisted(() => ({
  mockGetUsers: vi.fn(),
  mockDeleteUser: vi.fn(),
}))

vi.mock('../../../services/adminService', () => ({
  default: {
    getUsers: mockGetUsers,
    deleteUser: mockDeleteUser,
  },
}))

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}))

import CustomerList from '../CustomerList'

describe('CustomerList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading then renders users', async () => {
    mockGetUsers.mockResolvedValue([
      { id: 'u1', name: 'Alice', email: 'alice@test.com', avatarUrl: null, tenantId: 't1' },
      { id: 'u2', name: 'Bob', email: 'bob@test.com', avatarUrl: null, tenantId: 't1' },
    ])

    render(<CustomerList />)

    expect(screen.getByText('Loading...')).toBeTruthy()

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeTruthy()
    })
    expect(screen.getByText('Bob')).toBeTruthy()
    expect(screen.getByText('alice@test.com')).toBeTruthy()
    expect(screen.getByText('bob@test.com')).toBeTruthy()
  })

  it('shows empty state when no users', async () => {
    mockGetUsers.mockResolvedValue([])

    render(<CustomerList />)

    await waitFor(() => {
      expect(screen.getByText('No customers yet')).toBeTruthy()
    })
  })

  it('filters users by search input', async () => {
    mockGetUsers.mockResolvedValue([
      { id: 'u1', name: 'Alice', email: 'alice@test.com', avatarUrl: null, tenantId: 't1' },
      { id: 'u2', name: 'Bob', email: 'bob@test.com', avatarUrl: null, tenantId: 't1' },
    ])

    render(<CustomerList />)

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeTruthy()
    })

    const searchInput = screen.getByPlaceholderText('Search customers...')
    await userEvent.type(searchInput, 'Bob')

    expect(screen.queryByText('Alice')).toBeNull()
    expect(screen.getByText('Bob')).toBeTruthy()
  })

  it('shows delete confirmation modal and deletes on confirm', async () => {
    mockGetUsers.mockResolvedValue([
      { id: 'u1', name: 'Alice', email: 'alice@test.com', avatarUrl: null, tenantId: 't1' },
    ])
    mockDeleteUser.mockResolvedValue()

    render(<CustomerList />)

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeTruthy()
    })

    const deleteButtons = screen.getAllByTitle('Delete')
    await userEvent.click(deleteButtons[0])

    expect(screen.getByText('Delete Customer')).toBeTruthy()

    const confirmButton = screen.getByText('Delete')
    await userEvent.click(confirmButton)

    await waitFor(() => {
      expect(mockDeleteUser).toHaveBeenCalledWith('u1')
    })
  })

  it('cancels delete when Cancel button is clicked', async () => {
    mockGetUsers.mockResolvedValue([
      { id: 'u1', name: 'Alice', email: 'alice@test.com', avatarUrl: null, tenantId: 't1' },
    ])

    render(<CustomerList />)

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeTruthy()
    })

    const deleteButtons = screen.getAllByTitle('Delete')
    await userEvent.click(deleteButtons[0])

    expect(screen.getByText('Delete Customer')).toBeTruthy()

    const cancelButton = screen.getByText('Cancel')
    await userEvent.click(cancelButton)

    expect(screen.queryByText('Delete Customer')).toBeNull()
  })
})
