import { describe, it, expect, beforeEach, vi } from 'vitest'

// Clear all mocks before importing the module under test
beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('AdminService', () => {
  describe('getUsers', () => {
    it('calls GET /api/user/admin/users with Authorization header', async () => {
      const mockUsers = [
        { id: '1', name: 'User 1', email: 'u1@test.com', avatarUrl: null, tenantId: 't1' },
      ]
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockUsers),
      })
      localStorage.setItem('admin_token', 'test-admin-token')

      const adminService = (await import('../adminService')).default
      const result = await adminService.getUsers()

      expect(result).toEqual(mockUsers)
      expect(global.fetch).toHaveBeenCalledWith('/api/user/admin/users', {
        headers: { 'Authorization': 'Bearer test-admin-token' },
      })
    })

    it('throws when response is not ok', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
      })
      localStorage.setItem('admin_token', 'test-admin-token')

      const adminService = (await import('../adminService')).default
      await expect(adminService.getUsers()).rejects.toThrow('Failed to fetch users')
    })
  })

  describe('deleteUser', () => {
    it('calls DELETE /api/user/admin/:userId with Authorization header', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true })
      localStorage.setItem('admin_token', 'test-admin-token')

      const adminService = (await import('../adminService')).default
      await adminService.deleteUser('user-123')

      expect(global.fetch).toHaveBeenCalledWith('/api/user/admin/user-123', {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer test-admin-token' },
      })
    })

    it('throws when delete fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false })
      localStorage.setItem('admin_token', 'test-admin-token')

      const adminService = (await import('../adminService')).default
      await expect(adminService.deleteUser('user-123')).rejects.toThrow('Failed to delete user')
    })
  })
})
