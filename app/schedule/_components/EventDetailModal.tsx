'use client'

import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { FiX, FiPlus, FiCheck, FiEdit } from 'react-icons/fi'
import { format } from 'date-fns'
import type { ScheduleItem } from './scheduleTypes'
import type { MockTeamMember } from '@/data/mockData'

export type EventDetailModalProps = {
  selectedItem: ScheduleItem | null
  onClose: () => void
  updateWorkOrder: (id: number, updates: Partial<ScheduleItem>) => void
  eventDetailAssignedList: string[]
  isEventDetailAssignOpen: boolean
  setIsEventDetailAssignOpen: (v: boolean | ((prev: boolean) => boolean)) => void
  eventDetailAssignSearchTerm: string
  setEventDetailAssignSearchTerm: (v: string) => void
  eventDetailAssignToggle: (name: string) => void
  eventDetailAssignClear: () => void
  eventDetailAssignSelectAll: () => void
  activeTeamMembers: MockTeamMember[]
  filteredEventDetailTeam: MockTeamMember[]
}

export default function EventDetailModal({
  selectedItem,
  onClose,
  updateWorkOrder,
  eventDetailAssignedList,
  isEventDetailAssignOpen,
  setIsEventDetailAssignOpen,
  eventDetailAssignSearchTerm,
  setEventDetailAssignSearchTerm,
  eventDetailAssignToggle,
  eventDetailAssignClear,
  eventDetailAssignSelectAll,
  activeTeamMembers,
  filteredEventDetailTeam,
}: EventDetailModalProps) {
  const router = useRouter()

  if (!selectedItem || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" aria-modal="true">
      <div className="absolute inset-0 bg-black/25" onClick={onClose} />
      <div
        className="relative bg-white rounded-lg shadow-2xl border w-full max-w-[320px] max-h-[85vh] overflow-hidden flex flex-col min-w-[280px]"
        style={{ borderColor: '#EAEBED' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-2.5 border-b flex-shrink-0" style={{ borderColor: '#EAEBED' }}>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold mb-0.5 truncate" style={{ color: '#1F271B' }}>{selectedItem.title}</h2>
            <span className="inline-block px-1 py-0.5 text-xs rounded" style={{ backgroundColor: '#F3F4F6', color: '#1F271B', opacity: 0.7 }}>
              {(selectedItem as any).type === 'tasks' ? 'Task' : 'Workorder'}
            </span>
          </div>
          <button onClick={onClose} className="p-0.5 rounded transition-colors" style={{ color: '#1F271B' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}>
            <FiX size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <input type="checkbox" id="event-detail-completed" className="w-3 h-3 rounded focus:ring-1" style={{ borderColor: '#EAEBED', accentColor: '#2B50AA' }} />
            <label htmlFor="event-detail-completed" className="text-xs cursor-pointer" style={{ color: '#1F271B' }}>Completed</label>
          </div>
          {selectedItem.schedule?.day && (
            <div className="flex justify-end mb-1.5">
              <div className="text-right">
                <p className="text-sm font-medium" style={{ color: '#1F271B' }}>
                  {format(new Date(selectedItem.schedule.day), 'MMM d, yyyy')}
                  {selectedItem.schedule.startTime && ` ${selectedItem.schedule.startTime}`}
                </p>
                <p className="text-sm font-medium mt-0.5" style={{ color: '#1F271B' }}>
                  {eventDetailAssignedList.length > 0 ? `Assigned to ${eventDetailAssignedList.join(', ')}` : (selectedItem as any).assignedTeamMember ? `Assigned to ${(selectedItem as any).assignedTeamMember}` : 'Not assigned'}
                </p>
              </div>
            </div>
          )}
          {selectedItem.clientName && (
            <div className="mb-1.5">
              <p className="text-xs" style={{ color: '#1F271B' }}>
                {(selectedItem as any).type === 'tasks' ? (
                  <button
                    type="button"
                    onClick={() => { onClose(); router.push(`/clients/${(selectedItem as any).clientId}`) }}
                    className="underline hover:opacity-80 text-left"
                    style={{ color: '#2B50AA' }}
                  >
                    {selectedItem.clientName}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => { onClose(); router.push(`/clients/${(selectedItem as any).clientId}`) }}
                      className="underline hover:opacity-80"
                      style={{ color: '#2B50AA' }}
                    >
                      {selectedItem.clientName}
                    </button>
                    {' / '}
                    <button
                      type="button"
                      onClick={() => { onClose(); router.push(`/workorders/${(selectedItem as any).id}`) }}
                      className="underline hover:opacity-80"
                      style={{ color: '#2B50AA' }}
                    >
                      #{selectedItem.id}
                    </button>
                  </>
                )}
              </p>
            </div>
          )}
          <div className="mb-1.5 relative">
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-xs font-semibold" style={{ color: '#1F271B' }}>Team</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsEventDetailAssignOpen(prev => !prev) }}
                className="w-3.5 h-3.5 rounded-full text-white flex items-center justify-center transition-colors flex-shrink-0"
                style={{ backgroundColor: '#28AFB0' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E8A8B' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#28AFB0' }}
              >
                <FiPlus size={10} />
              </button>
            </div>
            <div className="flex flex-wrap gap-0.5">
              {eventDetailAssignedList.length > 0 ? (
                eventDetailAssignedList.map((name: string) => (
                  <span key={name} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs rounded-full" style={{ backgroundColor: '#F3F4F6', color: '#1F271B' }}>
                    {name}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); updateWorkOrder(selectedItem.id, { assignedTeamMember: eventDetailAssignedList.filter((n: string) => n !== name).join(', ') }) }}
                      className="hover:opacity-70"
                      aria-label={`Remove ${name}`}
                    >
                      <FiX size={8} />
                    </button>
                  </span>
                ))
              ) : (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs rounded-full" style={{ backgroundColor: '#F3F4F6', color: '#1F271B' }}>
                  All team members
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); eventDetailAssignClear() }}
                    className="hover:opacity-70"
                    aria-label="Clear"
                  >
                    <FiX size={8} />
                  </button>
                </span>
              )}
            </div>
            {isEventDetailAssignOpen && (
              <div
                className="absolute left-0 top-full mt-1 z-[101] bg-white border rounded shadow-xl min-w-[200px] max-w-[280px]"
                style={{ borderColor: '#EAEBED' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-1.5 border-b" style={{ borderColor: '#EAEBED' }}>
                  <input
                    type="text"
                    placeholder="Search team"
                    value={eventDetailAssignSearchTerm}
                    onChange={(e) => setEventDetailAssignSearchTerm(e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1"
                    style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                  />
                </div>
                <div className="px-2 py-1.5 border-b flex items-center justify-between" style={{ borderColor: '#EAEBED' }}>
                  <span className="text-xs font-medium" style={{ color: '#1F271B' }}>{eventDetailAssignedList.length} selected</span>
                  <button
                    type="button"
                    onClick={() => eventDetailAssignedList.length === activeTeamMembers.length ? eventDetailAssignClear() : eventDetailAssignSelectAll()}
                    className="text-xs font-medium underline"
                    style={{ color: '#28AFB0' }}
                  >
                    {eventDetailAssignedList.length === activeTeamMembers.length ? 'Clear' : 'Select all'}
                  </button>
                </div>
                <div className="max-h-40 overflow-y-auto">
                  {filteredEventDetailTeam.map((member) => {
                    const isSelected = eventDetailAssignedList.includes(member.name)
                    return (
                      <div
                        key={member.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => eventDetailAssignToggle(member.name)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); eventDetailAssignToggle(member.name) } }}
                        className="px-2 py-1.5 cursor-pointer flex items-center gap-2 transition-colors"
                        style={{ backgroundColor: 'transparent' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                      >
                        <span className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium flex-shrink-0" style={{ backgroundColor: '#E5E7EB', color: '#1F271B' }}>
                          {member.name.split(/\s+/).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                        <span className="text-sm font-medium flex-1 min-w-0" style={{ color: '#1F271B' }}>{member.name}</span>
                        {isSelected && <FiCheck className="flex-shrink-0" size={16} style={{ color: '#28AFB0' }} strokeWidth={3} />}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="mb-1.5">
            <p className="text-xs font-semibold mb-0.5" style={{ color: '#1F271B' }}>Address</p>
            <p className="text-xs" style={{ color: '#1F271B', opacity: 0.9 }}>{(selectedItem as any).address || '—'}</p>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mb-1.5">
            <div>
              <p className="text-xs mb-0.5" style={{ color: '#1F271B', opacity: 0.7 }}>Start</p>
              <p className="text-xs font-medium" style={{ color: '#1F271B' }}>{format(new Date(selectedItem.schedule!.day), 'MMM d, yyyy')}</p>
              <p className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>{selectedItem.schedule!.startTime}</p>
            </div>
            <div>
              <p className="text-xs mb-0.5" style={{ color: '#1F271B', opacity: 0.7 }}>End</p>
              <p className="text-xs font-medium" style={{ color: '#1F271B' }}>{format(new Date(selectedItem.schedule!.day), 'MMM d, yyyy')}</p>
              <p className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>{selectedItem.schedule!.endTime}</p>
            </div>
          </div>
          <div className="flex gap-1.5 pt-1.5 border-t flex-shrink-0" style={{ borderColor: '#EAEBED' }}>
            <button onClick={() => { const id = selectedItem.id; onClose(); router.push(`/workorders/${id}/edit`) }} className="flex-1 px-2 py-1.5 bg-white border rounded transition-colors text-xs font-medium flex items-center justify-center gap-1 whitespace-nowrap" style={{ borderColor: '#EAEBED', color: '#1F271B' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white' }}>
              <FiEdit size={10} />
              Edit
            </button>
            <button onClick={() => { const id = selectedItem.id; onClose(); router.push(`/workorders/${id}`) }} className="flex-1 px-2 py-1.5 rounded transition-colors text-xs font-medium text-white shadow-sm hover:shadow-md whitespace-nowrap flex items-center justify-center gap-1" style={{ backgroundColor: '#28AFB0' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E8A8B'; e.currentTarget.style.transform = 'translateY(-1px)' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#28AFB0'; e.currentTarget.style.transform = 'translateY(0)' }}>
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
