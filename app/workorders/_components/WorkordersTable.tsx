'use client'

import { format } from 'date-fns'

export interface WorkorderRow {
  id: number
  title: string
  clientName: string
  address?: string
  schedule?: { day: string; startTime?: string; endTime?: string }
  quoteStatus: string
  jobStatus: string
  invoiceStatus: string
  total: number
  createdAt?: string
  lastModified?: string
}

export interface WorkordersTableProps {
  workorders: WorkorderRow[]
  onRowClick: (workorderId: number) => void
}

function getStatusColor(status: string, type: 'quote' | 'job' | 'invoice') {
  const teal = { bg: 'rgba(40, 175, 176, 0.2)', text: '#1E8A8B' }
  const purple = { bg: 'rgba(176, 132, 204, 0.2)', text: '#8B6AA3' }
  const blue = { bg: 'rgba(43, 80, 170, 0.2)', text: '#1F3A7A' }
  const gray = { bg: '#F3F4F6', text: '#1F271B' }
  if (type === 'quote') {
    if (status === 'approved') return teal
    if (status === 'waiting for approval') return purple
    if (status === 'rejected' || status === 'expired') return { bg: 'rgba(239, 68, 68, 0.15)', text: '#DC2626' }
    return gray
  }
  if (type === 'job') {
    if (status === 'Completed' || status === 'In Progress') return teal
    if (status === 'Scheduled') return blue
    return gray
  }
  if (type === 'invoice') {
    if (status === 'paid') return teal
    if (status === 'waiting for payment') return purple
    return gray
  }
  return gray
}

export default function WorkordersTable({ workorders, onRowClick }: WorkordersTableProps) {
  return (
    <div className="rounded overflow-hidden border" style={{ borderColor: '#EAEBED' }}>
      <table className="w-full">
        <thead>
          <tr style={{ backgroundColor: '#F3F4F6' }}>
            <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Client Name</th>
            <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Work orders number</th>
            <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Address</th>
            <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Schedule</th>
            <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Quote status</th>
            <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Job status</th>
            <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Invoice status</th>
            <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Total</th>
            <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Created at</th>
            <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Last modified</th>
          </tr>
        </thead>
        <tbody>
          {workorders.length === 0 ? (
            <tr>
              <td colSpan={10} className="px-3 py-4 text-center text-xs" style={{ color: '#1F271B', opacity: 0.6 }}>
                No workorders found
              </td>
            </tr>
          ) : (
            workorders.map((workorder) => {
              const scheduleDate = workorder.schedule?.day ? new Date(workorder.schedule.day) : null
              const quoteColor = getStatusColor(workorder.quoteStatus, 'quote')
              const jobColor = getStatusColor(workorder.jobStatus, 'job')
              const invoiceColor = getStatusColor(workorder.invoiceStatus, 'invoice')

              return (
                <tr
                  key={workorder.id}
                  className="border-t cursor-pointer transition-colors"
                  style={{ borderColor: '#EAEBED' }}
                  onClick={() => onRowClick(workorder.id)}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white' }}
                >
                  <td className="px-3 py-2">
                    <p className="text-xs font-medium" style={{ color: '#1F271B' }}>{workorder.clientName}</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-xs" style={{ color: '#1F271B' }}>#{workorder.id} {workorder.title}</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>{workorder.address}</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>
                      {scheduleDate ? format(scheduleDate, 'MMMM d, yyyy') : 'Unscheduled'}
                    </p>
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium" style={{ backgroundColor: quoteColor.bg, color: quoteColor.text }}>
                      {workorder.quoteStatus.charAt(0).toUpperCase() + workorder.quoteStatus.slice(1)}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium" style={{ backgroundColor: jobColor.bg, color: jobColor.text }}>
                      {workorder.jobStatus}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium" style={{ backgroundColor: invoiceColor.bg, color: invoiceColor.text }}>
                      {workorder.invoiceStatus.charAt(0).toUpperCase() + workorder.invoiceStatus.slice(1)}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Rs {workorder.total.toFixed(2)}</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>
                      {workorder.createdAt ? format(new Date(workorder.createdAt), 'MMM d, yyyy') : '—'}
                    </p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>
                      {workorder.lastModified ? format(new Date(workorder.lastModified), 'MMM d, yyyy') : '—'}
                    </p>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
