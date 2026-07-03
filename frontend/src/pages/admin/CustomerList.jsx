import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiDownload, FiTrash2, FiMail } from 'react-icons/fi'

const mockCustomers = [
  { id: 1, name: 'Rahul Sharma', email: 'rahul@email.com', trips: 12, joined: '2024-01-15', status: 'Active' },
  { id: 2, name: 'Priya Mehta', email: 'priya@email.com', trips: 8, joined: '2024-02-20', status: 'Active' },
  { id: 3, name: 'Amit Kumar', email: 'amit@email.com', trips: 5, joined: '2024-03-10', status: 'Active' },
  { id: 4, name: 'Neha Gupta', email: 'neha@email.com', trips: 15, joined: '2024-01-05', status: 'Active' },
  { id: 5, name: 'Vikram Patel', email: 'vikram@email.com', trips: 3, joined: '2024-04-01', status: 'Inactive' },
  { id: 6, name: 'Sneha Reddy', email: 'sneha@email.com', trips: 7, joined: '2024-02-14', status: 'Active' },
  { id: 7, name: 'Arjun Singh', email: 'arjun@email.com', trips: 2, joined: '2024-05-20', status: 'Trial' },
  { id: 8, name: 'Kavita Joshi', email: 'kavita@email.com', trips: 10, joined: '2024-03-22', status: 'Active' },
]

export default function CustomerList() {
  const [search, setSearch] = useState('')

  const filtered = mockCustomers.filter(c =>
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
                <th className="text-left text-sm text-gray-400 font-medium px-4 py-3">Trips</th>
                <th className="text-left text-sm text-gray-400 font-medium px-4 py-3">Joined</th>
                <th className="text-left text-sm text-gray-400 font-medium px-4 py-3">Status</th>
                <th className="text-right text-sm text-gray-400 font-medium px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer, i) => (
                <motion.tr
                  key={customer.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-surface-border/50 hover:bg-surface-border/20 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium">{customer.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{customer.email}</td>
                  <td className="px-4 py-3 text-sm">{customer.trips}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{customer.joined}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      customer.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' :
                      customer.status === 'Trial' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-gray-500/10 text-gray-400'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="btn-ghost p-1.5" title="Send email">
                        <FiMail className="w-4 h-4" />
                      </button>
                      <button className="btn-ghost p-1.5 text-red-400 hover:bg-red-500/10" title="Delete">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
