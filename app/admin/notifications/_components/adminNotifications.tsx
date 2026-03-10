'use client'

import { useState } from 'react'
import { FiPlus, FiEdit2 } from 'react-icons/fi'

type NotificationStatus = 'active' | 'inactive'

const mockNotifications = [
  { id: '1', name: 'New Business Registration', trigger: 'On new business signup', status: 'active' as NotificationStatus },
  { id: '2', name: 'Payment Received', trigger: 'When invoice is paid', status: 'active' as NotificationStatus },
  { id: '3', name: 'Job Completed', trigger: 'When job status changes to completed', status: 'active' as NotificationStatus },
  { id: '4', name: 'User Invitation', trigger: 'When new user is invited', status: 'inactive' as NotificationStatus },
  { id: '5', name: 'Failed Login Alert', trigger: 'After 5 failed login attempts', status: 'active' as NotificationStatus },
]

const getStatusColor = (status: NotificationStatus) => {
  if (status === 'active') return { bg: 'rgba(40, 175, 176, 0.2)', text: '#1E8A8B' }
  return { bg: '#F3F4F6', text: '#1F271B' }
}

export function AdminNotifications() {
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(mockNotifications.map(n => [n.id, n.status === 'active']))
  )

  const toggle = (id: string) => setToggles(prev => ({ ...prev, [id]: !prev[id] }))

  const activeCount = mockNotifications.filter(n => n.status === 'active').length
  const inactiveCount = mockNotifications.filter(n => n.status === 'inactive').length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#1F271B' }}>Notifications & System Events</h1>
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all shadow-sm hover:shadow-md"
          style={{ backgroundColor: '#28AFB0', color: 'white' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E8A8B' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#28AFB0' }}
        >
          <FiPlus size={13} />
          Create Notification
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded shadow-sm border p-3" style={{ borderColor: '#EAEBED', marginTop: '2rem' }}>
        {/* Table header row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
          <h2 className="text-base font-bold" style={{ color: '#1F271B' }}>
            Notifications ({mockNotifications.length} total)
          </h2>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ backgroundColor: 'rgba(40, 175, 176, 0.2)', color: '#1E8A8B' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {activeCount} Active
            </span>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ backgroundColor: '#F3F4F6', color: '#1F271B' }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#9CA3AF' }} />
              {inactiveCount} Inactive
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="rounded overflow-hidden border" style={{ borderColor: '#EAEBED' }}>
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#F3F4F6' }}>
                <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Event Name</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Trigger</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Status</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Active</th>
                <th className="px-3 py-2 text-right text-[10px] font-semibold" style={{ color: '#1F271B' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockNotifications.map((n) => {
                const statusColor = getStatusColor(n.status)
                return (
                  <tr
                    key={n.id}
                    className="border-t transition-colors"
                    style={{ borderColor: '#EAEBED' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white' }}
                  >
                    <td className="px-3 py-2">
                      <p className="text-xs font-medium" style={{ color: '#1F271B' }}>{n.name}</p>
                    </td>
                    <td className="px-3 py-2">
                      <p className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>{n.trigger}</p>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium"
                        style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                      >
                        {n.status.charAt(0).toUpperCase() + n.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => toggle(n.id)}
                        className="relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors"
                        style={{ backgroundColor: toggles[n.id] ? '#28AFB0' : '#D1D5DB' }}
                      >
                        <span
                          className="inline-block h-3 w-3 rounded-full bg-white shadow transition-transform"
                          style={{ transform: toggles[n.id] ? 'translateX(14px)' : 'translateX(2px)' }}
                        />
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end">
                        <button
                          className="p-1.5 rounded transition-all"
                          style={{ color: '#1F271B', backgroundColor: 'transparent' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                          title="Edit"
                        >
                          <FiEdit2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}