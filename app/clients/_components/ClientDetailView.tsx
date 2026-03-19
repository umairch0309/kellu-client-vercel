'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { FiEdit, FiMoreVertical, FiPlus, FiChevronLeft, FiMail, FiUser, FiFileText, FiUpload, FiTrash2 } from 'react-icons/fi'
import { mockClients, mockWorkorders } from '@/data/mockData'
import { formatUsd } from '@/lib/formatCurrency'
import { useClientReminders } from '@/context/ClientRemindersContext'
import AddWorkorderModal from './AddWorkorderModal'
import SendMessageModal from './SendMessageModal'
import SetCustomerReminderModal from './SetCustomerReminderModal'

interface ClientDetailViewProps {
  clientId: number
}

export default function ClientDetailView({ clientId }: ClientDetailViewProps) {
  const router = useRouter()
  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState(false)
  const [isAddWorkorderOpen, setIsAddWorkorderOpen] = useState(false)
  const [isSendMessageOpen, setIsSendMessageOpen] = useState(false)
  const [selectedOverviewTab, setSelectedOverviewTab] = useState('Active Work')
  const [internalNote, setInternalNote] = useState('')
  const [isSetReminderOpen, setIsSetReminderOpen] = useState(false)
  const [editingReminder, setEditingReminder] = useState(false)

  const { getReminder, setReminder, deleteReminder, isReminderDue } = useClientReminders()
  const client = mockClients.find(c => c.id === clientId)
  const reminder = client ? getReminder(client.id) : null
  const reminderDue = reminder ? isReminderDue(reminder) : false
  const clientWorkorders = mockWorkorders.filter(wo => wo.clientId === clientId)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.more-actions-menu') && !target.closest('.more-actions-button')) {
        setIsMoreActionsOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  if (!client) {
    return (
      <div className="p-8">
        <p style={{ color: '#1F271B' }}>Client not found</p>
      </div>
    )
  }

  const overviewTabs = ['Active Work', 'Quotes', 'Jobs', 'Invoices']

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/clients')}
            className="p-1.5 hover:bg-opacity-50 rounded transition-colors"
            style={{ backgroundColor: '#EAEBED' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <FiChevronLeft size={18} style={{ color: '#1F271B' }} />
          </button>
          <div className="flex items-center gap-2">
            <FiUser size={20} style={{ color: '#1F271B', opacity: 0.7 }} />
            <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#1F271B' }}>{client.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSendMessageOpen(true)}
            className="px-3 py-1.5 rounded border text-xs font-medium flex items-center gap-1.5 transition-all"
            style={{ 
              backgroundColor: 'white',
              borderColor: '#EAEBED',
              color: '#1F271B'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F9FAFB'
              e.currentTarget.style.borderColor = '#D1D5DB'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white'
              e.currentTarget.style.borderColor = '#EAEBED'
            }}
          >
            <FiMail size={14} />
            <span>Send Message</span>
          </button>
          <button
            onClick={() => router.push(`/clients/${clientId}/edit`)}
            className="px-3 py-1.5 rounded border text-xs font-medium flex items-center gap-1.5 transition-all"
            style={{ 
              backgroundColor: 'white',
              borderColor: '#EAEBED',
              color: '#1F271B'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F9FAFB'
              e.currentTarget.style.borderColor = '#D1D5DB'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white'
              e.currentTarget.style.borderColor = '#EAEBED'
            }}
          >
            <FiEdit size={14} />
            <span>Edit</span>
          </button>
          <div className="relative">
            <button
              onClick={() => setIsMoreActionsOpen(!isMoreActionsOpen)}
              className="more-actions-button px-3 py-1.5 rounded border text-xs font-medium flex items-center gap-1.5 transition-all"
              style={{ 
                backgroundColor: 'white',
                borderColor: '#EAEBED',
                color: '#1F271B'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F9FAFB'
                e.currentTarget.style.borderColor = '#D1D5DB'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white'
                e.currentTarget.style.borderColor = '#EAEBED'
              }}
            >
              <FiMoreVertical size={14} />
              <span>More Actions</span>
            </button>
            {isMoreActionsOpen && (
              <div className="more-actions-menu absolute right-0 mt-2 bg-white rounded border shadow-lg z-10 min-w-[180px]" style={{ borderColor: '#EAEBED' }}>
                <button
                  onClick={() => {
                    setIsAddWorkorderOpen(true)
                    setIsMoreActionsOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-opacity-50 transition-colors"
                  style={{ color: '#1F271B' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  Create Workorder
                </button>
                <button
                  onClick={() => {
                    setIsAddWorkorderOpen(true)
                    setIsMoreActionsOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-opacity-50 transition-colors border-t"
                  style={{ color: '#1F271B', borderTopColor: '#EAEBED' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  Create Task
                </button>
                <button
                  onClick={() => {
                    setIsMoreActionsOpen(false)
                    alert('Create Quote (Static UI – not implemented)')
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-opacity-50 transition-colors border-t"
                  style={{ color: '#1F271B', borderTopColor: '#EAEBED' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  Create Quote
                </button>
                <button
                  onClick={() => {
                    setIsMoreActionsOpen(false)
                    alert('Create Invoice (Static UI – not implemented)')
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-opacity-50 transition-colors border-t"
                  style={{ color: '#1F271B', borderTopColor: '#EAEBED' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  Create Invoice
                </button>
                <button
                  onClick={() => {
                    setIsMoreActionsOpen(false)
                    alert('Archive client (Static UI – not implemented)')
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-opacity-50 transition-colors border-t"
                  style={{ color: '#1F271B', borderTopColor: '#EAEBED' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  Archived
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Left Column - Main Content */}
        <div className="flex-1 space-y-3">
          {/* Overview Section */}
          <div className="bg-white rounded shadow-sm border p-3" style={{ borderColor: '#EAEBED' }}>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-lg font-bold" style={{ color: '#1F271B' }}>Overview</h2>
              <button
                className="px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md"
                style={{ backgroundColor: '#28AFB0', color: 'white' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1E8A8B'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#28AFB0'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <FiPlus size={12} />
                <span>New</span>
              </button>
            </div>
            {/* Tabs */}
            <div className="flex gap-4 mb-3 border-b" style={{ borderBottomColor: '#EAEBED' }}>
              {overviewTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedOverviewTab(tab)}
                  className={`pb-1 text-xs font-medium transition-colors ${
                    selectedOverviewTab === tab
                      ? 'border-b-2'
                      : 'text-opacity-60'
                  }`}
                  style={selectedOverviewTab === tab
                    ? { color: '#1F271B', borderBottomColor: '#28AFB0' }
                    : { color: '#1F271B', opacity: 0.6 }
                  }
                >
                  {tab}
                </button>
              ))}
            </div>
            {/* Tab Content */}
            <div style={{ minHeight: '60px' }}>
              <div style={{ display: selectedOverviewTab === 'Active Work' ? 'block' : 'none' }}>
                {clientWorkorders.length > 0 ? (
                  <div className="space-y-2">
                    {clientWorkorders.slice(0, 1).map((wo) => (
                      <div key={wo.id} className="p-2 rounded" style={{ backgroundColor: '#F3F4F6' }}>
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-xs font-medium" style={{ color: '#1F271B' }}>Job #{wo.id} - {wo.title}</p>
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium" style={{ backgroundColor: '#28AFB0', color: 'white' }}>
                            Today
                          </span>
                        </div>
                        <p className="text-[10px] mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>SCHEDULED FOR {wo.schedule.day}</p>
                        <p className="text-[10px] mb-0.5" style={{ color: '#1F271B', opacity: 0.8 }}>{wo.address}</p>
                        <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>{formatUsd(Number(wo.total) || 0)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs py-2" style={{ color: '#1F271B', opacity: 0.6 }}>No active work</p>
                )}
              </div>
              <div style={{ display: selectedOverviewTab === 'Quotes' ? 'block' : 'none' }}>
                <p className="text-xs py-2" style={{ color: '#1F271B', opacity: 0.6 }}>No quotes</p>
              </div>
              <div style={{ display: selectedOverviewTab === 'Jobs' ? 'block' : 'none' }}>
                {clientWorkorders.length > 0 ? (
                  <div className="space-y-2">
                    {clientWorkorders.map((wo) => (
                      <div key={wo.id} className="p-2 rounded" style={{ backgroundColor: '#F3F4F6' }}>
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-xs font-medium" style={{ color: '#1F271B' }}>Job #{wo.id} - {wo.title}</p>
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium" style={{ backgroundColor: '#28AFB0', color: 'white' }}>
                            {wo.jobStatus}
                          </span>
                        </div>
                        <p className="text-[10px] mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>SCHEDULED FOR {wo.schedule.day}</p>
                        <p className="text-[10px] mb-0.5" style={{ color: '#1F271B', opacity: 0.8 }}>{wo.address}</p>
                        <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>{formatUsd(Number(wo.total) || 0)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs py-2" style={{ color: '#1F271B', opacity: 0.6 }}>No jobs</p>
                )}
              </div>
              <div style={{ display: selectedOverviewTab === 'Invoices' ? 'block' : 'none' }}>
                <p className="text-xs py-2" style={{ color: '#1F271B', opacity: 0.6 }}>No invoices</p>
              </div>
            </div>
          </div>

          {/* Schedule Section */}
          <div className="bg-white rounded shadow-sm border p-3" style={{ borderColor: '#EAEBED' }}>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-lg font-bold" style={{ color: '#1F271B' }}>Schedule</h2>
              <button
                className="px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md"
                style={{ backgroundColor: '#28AFB0', color: 'white' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1E8A8B'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#28AFB0'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <FiPlus size={12} />
                <span>New</span>
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>All day / Any time</p>
              {clientWorkorders.length > 0 && (
                <div className="flex items-start gap-2">
                  <input type="checkbox" className="mt-0.5" style={{ accentColor: '#28AFB0' }} />
                  <div className="flex-1">
                    <p className="text-xs" style={{ color: '#1F271B' }}>
                      Job #{clientWorkorders[0].id} - {clientWorkorders[0].title} re: {client.name}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: '#1F271B', opacity: 0.7 }}>
                      {clientWorkorders[0].schedule.day} • Assigned to {clientWorkorders[0].assignedTeamMember}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:w-72 space-y-3">
          {/* Contact Info */}
          <div className="bg-white rounded shadow-sm border p-3" style={{ borderColor: '#EAEBED' }}>
            <h2 className="text-base font-bold mb-2.5" style={{ color: '#1F271B' }}>Contact info</h2>
            <div className="space-y-1.5">
              <div>
                <p className="text-[10px] font-medium mb-0.5" style={{ color: '#1F271B', opacity: 0.7 }}>Phone</p>
                <p className="text-xs" style={{ color: '#1F271B' }}>{client.phone}</p>
              </div>
              {client.email && (
                <div>
                  <p className="text-[10px] font-medium mb-0.5" style={{ color: '#1F271B', opacity: 0.7 }}>Email</p>
                  <p className="text-xs" style={{ color: '#1F271B' }}>{client.email}</p>
                </div>
              )}
              {client.leadSource && (
                <div>
                  <p className="text-[10px] font-medium mb-0.5" style={{ color: '#1F271B', opacity: 0.7 }}>Lead Source</p>
                  <p className="text-xs" style={{ color: '#1F271B' }}>{client.leadSource}</p>
                </div>
              )}
            </div>
          </div>

          {/* Last Client Communication */}
          <div className="bg-white rounded shadow-sm border p-3" style={{ borderColor: '#EAEBED' }}>
            <h2 className="text-base font-bold mb-2.5" style={{ color: '#1F271B' }}>Last client communication</h2>
            <p className="text-xs" style={{ color: '#1F271B', opacity: 0.6 }}>You haven't sent any client communications yet</p>
          </div>

          {/* Customer reminder */}
          <div className="bg-white rounded shadow-sm border p-3" style={{ borderColor: '#EAEBED' }}>
            <h2 className="text-base font-bold mb-0.5" style={{ color: '#1F271B' }}>Customer reminder</h2>
            <p className="text-xs mb-2.5" style={{ color: '#1F271B', opacity: 0.7 }}>Remind me to follow up on this client in future date</p>
            {!reminder ? (
              <button
                type="button"
                onClick={() => { setEditingReminder(false); setIsSetReminderOpen(true) }}
                className="w-full px-3 py-2 border border-dashed rounded text-xs font-medium transition-colors"
                style={{ borderColor: '#EAEBED', color: '#1F271B', backgroundColor: 'white' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB'; e.currentTarget.style.borderColor = '#28AFB0' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.borderColor = '#EAEBED' }}
              >
                Set customer reminder
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs" style={{ color: reminderDue ? '#DC2626' : '#1F271B' }}>
                  {format(new Date(reminder.date + (reminder.time ? `T${reminder.time}` : '')), 'MMM d, yyyy · HH:mm')}
                  {reminder.note && ` · ${reminder.note}`}
                </p>
                {reminderDue && (
                  <p className="text-xs font-medium" style={{ color: '#DC2626' }}>Status: Follow up</p>
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setEditingReminder(true); setIsSetReminderOpen(true) }}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors"
                    style={{ color: '#1F271B', border: '1px solid #EAEBED' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                  >
                    <FiEdit size={10} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteReminder(clientId)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors"
                    style={{ color: '#DC2626', border: '1px solid #EAEBED' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FEF2F2' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                  >
                    <FiTrash2 size={10} />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Internal Notes */}
          <div className="bg-white rounded shadow-sm border p-3" style={{ borderColor: '#EAEBED' }}>
            <h2 className="text-base font-bold mb-1" style={{ color: '#1F271B' }}>Internal notes</h2>
            <p className="text-[10px] mb-2.5" style={{ color: '#1F271B', opacity: 0.7 }}>Internal notes will only be seen by your team</p>
            <textarea
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="Note details"
              rows={3}
              className="w-full px-2.5 py-1.5 border rounded text-xs transition-all resize-none mb-2"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#28AFB0'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#EAEBED'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
            <div className="border-2 border-dashed rounded p-3 text-center" style={{ borderColor: '#EAEBED' }}>
              <FiUpload size={16} className="mx-auto mb-1" style={{ color: '#1F271B', opacity: 0.5 }} />
              <p className="text-[10px]" style={{ color: '#1F271B', opacity: 0.6 }}>Drag your files here or Select a File</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddWorkorderModal
        isOpen={isAddWorkorderOpen}
        onClose={() => setIsAddWorkorderOpen(false)}
        initialClientId={clientId}
      />
      <SendMessageModal
        isOpen={isSendMessageOpen}
        onClose={() => setIsSendMessageOpen(false)}
        clientIds={[clientId]}
      />
      <SetCustomerReminderModal
        isOpen={isSetReminderOpen}
        onClose={() => { setIsSetReminderOpen(false); setEditingReminder(false) }}
        clientId={clientId}
        initialReminder={editingReminder ? reminder : null}
        onSave={(r) => { setReminder(clientId, r); setIsSetReminderOpen(false); setEditingReminder(false) }}
      />
    </div>
  )
}
