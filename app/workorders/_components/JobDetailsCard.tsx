'use client'

import { useRouter } from 'next/navigation'
import { FiLink, FiMapPin, FiPhone, FiMail, FiSend, FiCheckCircle, FiX } from 'react-icons/fi'
import { format } from 'date-fns'

export interface JobDetailsCardProps {
  workorder: any
  client: any
  editedQuoteStatus: string | null
  setEditedQuoteStatus: (s: string | null) => void
  quoteMarkAsOpen: boolean
  setQuoteMarkAsOpen: (open: boolean) => void
  quoteMarkAsRef: React.RefObject<HTMLDivElement>
  onQuoteStatusChange: (status: string) => void
  isInvoicePaid: boolean
}

export default function JobDetailsCard({
  workorder,
  client,
  editedQuoteStatus,
  setEditedQuoteStatus,
  quoteMarkAsOpen,
  setQuoteMarkAsOpen,
  quoteMarkAsRef,
  onQuoteStatusChange,
  isInvoicePaid,
}: JobDetailsCardProps) {
  const router = useRouter()
  const displayStatus = editedQuoteStatus ?? workorder.quoteStatus
  const statusBg = displayStatus === 'approved' ? 'rgba(40, 175, 176, 0.2)' : displayStatus === 'waiting for approval' ? 'rgba(176, 132, 204, 0.2)' : displayStatus === 'rejected' || displayStatus === 'expired' ? 'rgba(239, 68, 68, 0.15)' : '#F3F4F6'
  const statusColor = displayStatus === 'approved' ? '#1E8A8B' : displayStatus === 'waiting for approval' ? '#8B6AA3' : displayStatus === 'rejected' || displayStatus === 'expired' ? '#DC2626' : '#1F271B'
  const markAsOptions: { value: string; label: string; icon: React.ReactNode }[] = []
  if (displayStatus === 'not sent' || displayStatus === 'rejected') {
    markAsOptions.push({ value: 'waiting for approval', label: 'Awaiting response', icon: <FiSend size={14} style={{ color: '#1F271B', flexShrink: 0 }} /> })
    markAsOptions.push({ value: 'approved', label: 'Approved Quote', icon: <FiCheckCircle size={14} style={{ color: '#059669', flexShrink: 0 }} /> })
  } else if (displayStatus === 'approved') {
    markAsOptions.push({ value: 'approved', label: 'Approved Quote', icon: <FiCheckCircle size={14} style={{ color: '#059669', flexShrink: 0 }} /> })
    markAsOptions.push({ value: 'rejected', label: 'Rejected Quote', icon: <FiX size={14} style={{ color: '#1F271B', flexShrink: 0 }} /> })
  } else {
    markAsOptions.push({ value: 'waiting for approval', label: 'Awaiting response', icon: <FiSend size={14} style={{ color: '#1F271B', flexShrink: 0 }} /> })
    markAsOptions.push({ value: 'rejected', label: 'Rejected Quote', icon: <FiX size={14} style={{ color: '#1F271B', flexShrink: 0 }} /> })
  }

  return (
    <div className="bg-white rounded-lg shadow-md border overflow-hidden" style={{ borderColor: '#EAEBED' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderBottomColor: '#EAEBED' }}>
        <h2 className="text-base font-semibold" style={{ color: '#1F271B' }}>Job Details</h2>
        <span className="text-sm font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Job #{workorder.id}</span>
      </div>
      <div className="p-4">
        <div className="mb-4">
          <button
            onClick={() => router.push(`/clients/${workorder.clientId}`)}
            className="text-xl font-bold mb-1 flex items-center gap-2 hover:underline transition-all"
            style={{ color: '#1F271B' }}
          >
            {workorder.clientName}
            <FiLink size={14} style={{ color: '#1F271B', opacity: 0.6 }} />
          </button>
          <p className="text-sm mb-3" style={{ color: '#1F271B', opacity: 0.7 }}>{workorder.title}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-start gap-2 mb-2">
                <FiMapPin size={16} style={{ color: '#1F271B', opacity: 0.7, marginTop: '2px' }} />
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Property address</p>
                  <p className="text-sm" style={{ color: '#1F271B' }}>{workorder.address}</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: '#1F271B', opacity: 0.7 }}>Contact details</p>
              {client?.phone && (
                <div className="flex items-center gap-2 mb-1">
                  <FiPhone size={14} style={{ color: '#1F271B', opacity: 0.6 }} />
                  <span className="text-sm" style={{ color: '#1F271B' }}>{client.phone}</span>
                </div>
              )}
              {client?.email && (
                <div className="flex items-center gap-2">
                  <FiMail size={14} style={{ color: '#1F271B', opacity: 0.6 }} />
                  <span className="text-sm" style={{ color: '#1F271B' }}>{client.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4 pt-4 border-t" style={{ borderTopColor: '#EAEBED' }}>
          <div ref={quoteMarkAsRef} className="relative">
            <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Quote Status</p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setQuoteMarkAsOpen(!quoteMarkAsOpen) }}
              className="inline-block px-2 py-1 rounded-full text-xs font-medium text-left transition-colors"
              style={{ backgroundColor: statusBg, color: statusColor }}
            >
              {displayStatus === 'waiting for approval' ? 'Awaiting response' : displayStatus === 'not sent' ? 'Not sent' : displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
            </button>
            {quoteMarkAsOpen && (
              <div className="absolute left-0 top-full mt-1 z-50 bg-white border rounded-lg shadow-lg py-1 min-w-[180px]" style={{ borderColor: '#EAEBED' }}>
                <p className="px-3 py-2 text-xs font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Mark as...</p>
                <div className="mx-2 border-t" style={{ borderStyle: 'dashed', borderColor: '#EAEBED' }} />
                {markAsOptions.map((opt, i) => (
                  <span key={opt.value}>
                    {i > 0 && <div className="mx-2 border-t" style={{ borderStyle: 'dashed', borderColor: '#EAEBED' }} />}
                    <button
                      type="button"
                      onClick={() => {
                        setEditedQuoteStatus(opt.value)
                        onQuoteStatusChange(opt.value)
                        setQuoteMarkAsOpen(false)
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-3"
                      style={{ color: '#1F271B' }}
                    >
                      {opt.icon}
                      <span>{opt.label}</span>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Job Status</p>
            <span
              className="inline-block px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: workorder.jobStatus === 'Completed' || workorder.jobStatus === 'In Progress' ? 'rgba(40, 175, 176, 0.2)' : workorder.jobStatus === 'Scheduled' ? 'rgba(43, 80, 170, 0.2)' : '#F3F4F6',
                color: workorder.jobStatus === 'Completed' || workorder.jobStatus === 'In Progress' ? '#1E8A8B' : workorder.jobStatus === 'Scheduled' ? '#1F3A7A' : '#1F271B',
              }}
            >
              {workorder.jobStatus}
            </span>
          </div>
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Invoice Status</p>
            <span
              className="inline-block px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: isInvoicePaid ? 'rgba(40, 175, 176, 0.2)' : workorder.invoiceStatus === 'waiting for payment' ? 'rgba(176, 132, 204, 0.2)' : '#F3F4F6',
                color: isInvoicePaid ? '#1E8A8B' : workorder.invoiceStatus === 'waiting for payment' ? '#8B6AA3' : '#1F271B',
              }}
            >
              {isInvoicePaid ? 'paid' : workorder.invoiceStatus}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t" style={{ borderTopColor: '#EAEBED' }}>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Schedule:</p>
              <p className="text-sm" style={{ color: '#1F271B' }}>
                {format(new Date(workorder.schedule.day), 'MMM dd, yyyy')} • {workorder.schedule.startTime} - {workorder.schedule.endTime}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Assigned Team Member:</p>
              <p className="text-sm" style={{ color: '#1F271B' }}>{workorder.assignedTeamMember || '—'}</p>
            </div>
          </div>
          {workorder.instructions && (
            <div className="mb-3">
              <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Instructions:</p>
              <p className="text-sm" style={{ color: '#1F271B' }}>{workorder.instructions}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
