'use client'

import { format } from 'date-fns'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatUsd } from '@/lib/formatCurrency'

export interface WorkorderRow {
  id: number | string
  workOrderNumber?: string | null
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
  onRowClick: (workorderId: number | string) => void
  loading?: boolean
  onUpdateWorkorder?: (workorder: WorkorderRow) => void
  onDeleteWorkorder?: (workorder: WorkorderRow) => void
}

/** Normalize status for matching: "NOT_SENT" -> "not sent", "In Progress" -> "in progress" */
function normalizeStatusKey(status: string): string {
  return status.replace(/_/g, ' ').toLowerCase().trim()
}

function getStatusColor(status: string, type: 'quote' | 'job' | 'invoice') {
  const teal = { bg: 'rgba(40, 175, 176, 0.2)', text: '#1E8A8B' }
  const purple = { bg: 'rgba(176, 132, 204, 0.2)', text: '#8B6AA3' }
  const blue = { bg: 'rgba(43, 80, 170, 0.2)', text: '#1F3A7A' }
  const red = { bg: 'rgba(239, 68, 68, 0.15)', text: '#DC2626' }
  const amber = { bg: 'rgba(245, 158, 11, 0.2)', text: '#B45309' }
  const gray = { bg: '#F3F4F6', text: '#6B7280' }
  const s = normalizeStatusKey(status)
  if (type === 'quote') {
    if (s === 'approved' || s === 'converted') return teal
    if (s === 'waiting for approval' || s === 'awaiting response') return purple
    if (s === 'rejected' || s === 'expired') return red
    return gray
  }
  if (type === 'job') {
    if (s === 'completed' || s === 'in progress' || s === 'on my way') return teal
    if (s === 'scheduled') return blue
    return gray
  }
  if (type === 'invoice') {
    if (s === 'paid') return teal
    if (s === 'waiting for payment' || s === 'awaiting payment') return purple
    if (s === 'overdue') return amber
    if (s === 'bad debt' || s === 'cancelled') return red
    return gray
  }
  return gray
}

export default function WorkordersTable({ workorders, onRowClick, loading, onUpdateWorkorder, onDeleteWorkorder }: WorkordersTableProps) {
  return (
    <div className="rounded overflow-hidden border" style={{ borderColor: '#EAEBED' }}>
      <TooltipProvider delayDuration={200}>
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
            <th className="px-3 py-2 text-left text-[10px] font-semibold w-24" style={{ color: '#1F271B' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={11} className="px-3 py-6 text-center text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>
                Loading workorders…
              </td>
            </tr>
          ) : workorders.length === 0 ? (
            <tr>
              <td colSpan={11} className="px-3 py-4 text-center text-xs" style={{ color: '#1F271B', opacity: 0.6 }}>
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
                    <p className="text-xs" style={{ color: '#1F271B' }}>
                      {[workorder.workOrderNumber, workorder.title].filter(Boolean).join(' · ') || '—'}
                    </p>
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
                    <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>{formatUsd(Number(workorder.total))}</p>
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
                  <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      {onUpdateWorkorder && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => onUpdateWorkorder(workorder)}
                              className="p-1.5 rounded transition-colors hover:opacity-90"
                              style={{ color: '#28AFB0' }}
                              aria-label="Edit workorder"
                            >
                              <FiEdit2 size={16} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="z-[100]">Edit workorder</TooltipContent>
                        </Tooltip>
                      )}
                      {onDeleteWorkorder && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => onDeleteWorkorder(workorder)}
                              className="p-1.5 rounded hover:bg-red-50 transition-colors"
                              style={{ color: '#B91C1C' }}
                              aria-label="Delete workorder"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="z-[100]">Delete workorder</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
      </TooltipProvider>
    </div>
  )
}
