import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiDownload, FiTrash2, FiMail, FiAlertTriangle } from 'react-icons/fi'
import toast from 'react-hot-toast'
import adminService from '../../services/adminService'

export default function CustomerList() {
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await adminService.getUsers()
      setCustomers(data.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        avatarUrl: u.avatarUrl,
        trips: 0,
        joined: '',
        status: 'Active',
      })))
    } catch {
      toast.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await adminService.deleteUser(deleteTarget.id)
      toast.success(`${deleteTarget.name} deleted`)
      setDeleteTarget(null)
      fetchUsers()
    } catch (err) {
      toast.error(err.message || 'Failed to delete user')
    } finally {
      setDeleting(false)
    }
  }

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-gray-400 mt-1">Manage your agency's customers</p>
        </div>
        <button className="btn-ghost">
          <FiDownload className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 w-full"
            placeholder="Search customers..."
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="text-left text-sm text-gray-400 font-medium px-4 py-3">Name</th>
                <th className="text-left text-sm text-gray-400 font-medium px-4 py-3">Email</th>
                <th className="text-left text-sm text-gray-400 font-medium px-4 py-3">Status</th>
                <th className="text-right text-sm text-gray-400 font-medium px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-gray-500">
                    {search ? 'No customers match your search' : 'No customers yet'}
                  </td>
                </tr>
              ) : (
                filtered.map((customer, i) => (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-surface-border/50 hover:bg-surface-border/20 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium">{customer.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{customer.email}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="btn-ghost p-1.5" title="Send email">
                          <FiMail className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(customer)}
                          className="btn-ghost p-1.5 text-red-400 hover:bg-red-500/10"
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card max-w-sm w-full p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <FiAlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Delete Customer</h3>
                <p className="text-sm text-gray-400">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-6">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong> ({deleteTarget.email})? All their data will be permanently removed.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="btn-ghost px-4 py-2 text-sm"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm hover:bg-red-500/30 transition-colors flex items-center gap-2"
              >
                {deleting ? (
                  <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                ) : (
                  <FiTrash2 className="w-4 h-4" />
                )}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}