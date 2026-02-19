'use client'

import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { FiX, FiChevronDown, FiChevronLeft, FiChevronRight, FiPlus, FiCheckCircle, FiTrash2, FiCheck } from 'react-icons/fi'
import { format, parse, startOfMonth, endOfMonth, startOfWeek, eachDayOfInterval, addDays, isSameMonth, isToday, isSameDay, subMonths, addMonths } from 'date-fns'
import { mockClients, mockTeamMembers, mockMasterPriceList } from '@/data/mockData'
import AddClientModal from './AddClientModal'

function TimePickerColumn({ options, selected, onSelect }: { options: string[]; selected: string; onSelect: (value: string) => void }) {
  return (
    <div className="flex-1 flex flex-col max-h-28 overflow-y-auto border rounded" style={{ borderColor: '#EAEBED' }}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onSelect(opt)}
          className="px-1.5 py-1 text-xs font-medium rounded transition-colors"
          style={{
            color: selected === opt ? 'white' : '#1F271B',
            backgroundColor: selected === opt ? '#28AFB0' : 'transparent',
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

interface AddWorkorderModalProps {
  isOpen: boolean
  onClose: () => void
  initialDate?: Date
  initialTime?: string
  position?: { x: number; y: number }
  initialClientId?: number
}

export default function AddWorkorderModal({ isOpen, onClose, initialDate, initialTime, position, initialClientId }: AddWorkorderModalProps) {
  const router = useRouter()
  const [taskType, setTaskType] = useState<'workorder' | 'task'>('workorder')
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [showAssign, setShowAssign] = useState(false)
  const [anytime, setAnytime] = useState(true)
  const [isAddLineItemDropdownOpen, setIsAddLineItemDropdownOpen] = useState(false)
  const [addLineItemSearchTerm, setAddLineItemSearchTerm] = useState('')
  const [isStartDateCalendarOpen, setIsStartDateCalendarOpen] = useState(false)
  const [startDatePickerMonth, setStartDatePickerMonth] = useState(new Date())
  const [isStartTimeDropdownOpen, setIsStartTimeDropdownOpen] = useState(false)
  const [isEndTimeDropdownOpen, setIsEndTimeDropdownOpen] = useState(false)
  const [dropdownAnchor, setDropdownAnchor] = useState<{ top: number; left: number; type: 'date' | 'startTime' | 'endTime' } | null>(null)
  const typeDropdownRef = useRef<HTMLDivElement>(null)
  const lineItemsSectionRef = useRef<HTMLDivElement>(null)
  const addLineItemDropdownRef = useRef<HTMLDivElement>(null)
  const startDateCalendarRef = useRef<HTMLDivElement>(null)
  const startTimeDropdownRef = useRef<HTMLDivElement>(null)
  const endTimeDropdownRef = useRef<HTMLDivElement>(null)
  const clientDropdownRef = useRef<HTMLDivElement>(null)
  const assignDropdownRef = useRef<HTMLDivElement>(null)
  const dropdownPortalRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return
    const pad = 8
    const dateHeight = 280
    const timeHeight = 120
    if (isStartDateCalendarOpen && startDateCalendarRef.current) {
      const rect = startDateCalendarRef.current.getBoundingClientRect()
      let top = rect.bottom + 4
      if (top + dateHeight > window.innerHeight - pad) top = rect.top - dateHeight - 4
      const left = Math.max(pad, Math.min(rect.left, window.innerWidth - 240 - pad))
      setDropdownAnchor({ top, left, type: 'date' })
    } else if (isStartTimeDropdownOpen && startTimeDropdownRef.current) {
      const rect = startTimeDropdownRef.current.getBoundingClientRect()
      let top = rect.bottom + 4
      if (top + timeHeight > window.innerHeight - pad) top = rect.top - timeHeight - 4
      const left = Math.max(pad, Math.min(rect.left, window.innerWidth - 180 - pad))
      setDropdownAnchor({ top, left, type: 'startTime' })
    } else if (isEndTimeDropdownOpen && endTimeDropdownRef.current) {
      const rect = endTimeDropdownRef.current.getBoundingClientRect()
      let top = rect.bottom + 4
      if (top + timeHeight > window.innerHeight - pad) top = rect.top - timeHeight - 4
      const left = Math.max(pad, Math.min(rect.left, window.innerWidth - 180 - pad))
      setDropdownAnchor({ top, left, type: 'endTime' })
    } else {
      setDropdownAnchor(null)
    }
  }, [isStartDateCalendarOpen, isStartTimeDropdownOpen, isEndTimeDropdownOpen])
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false)
  const [isAssignDropdownOpen, setIsAssignDropdownOpen] = useState(false)
  const [assignSearchTerm, setAssignSearchTerm] = useState('')

  // Assign options: Business owner + team members (no Unavailable - same as Filter)
  const assignOptions = [
    { value: 'Business owner', label: 'Business owner' },
    ...mockTeamMembers.map(m => ({ value: m.name, label: m.name })),
  ]
  const filteredAssignOptions = assignOptions.filter(opt =>
    opt.label.toLowerCase().includes(assignSearchTerm.toLowerCase())
  )

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(target)) {
        setIsTypeDropdownOpen(false)
      }
      if (addLineItemDropdownRef.current && !addLineItemDropdownRef.current.contains(target)) {
        setIsAddLineItemDropdownOpen(false)
      }
      const insidePortal = dropdownPortalRef.current && dropdownPortalRef.current.contains(target)
      if (!insidePortal && startDateCalendarRef.current && !startDateCalendarRef.current.contains(target)) {
        setIsStartDateCalendarOpen(false)
      }
      if (!insidePortal && startTimeDropdownRef.current && !startTimeDropdownRef.current.contains(target)) {
        setIsStartTimeDropdownOpen(false)
      }
      if (!insidePortal && endTimeDropdownRef.current && !endTimeDropdownRef.current.contains(target)) {
        setIsEndTimeDropdownOpen(false)
      }
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(target)) {
        setIsClientDropdownOpen(false)
      }
      if (assignDropdownRef.current && !assignDropdownRef.current.contains(target)) {
        setIsAssignDropdownOpen(false)
      }
    }
      document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isTypeDropdownOpen, isClientDropdownOpen, isAssignDropdownOpen, isAddLineItemDropdownOpen, isStartDateCalendarOpen, isStartTimeDropdownOpen, isEndTimeDropdownOpen])
  const [formData, setFormData] = useState({
    client: '',
    address: '',
    title: '',
    instructions: '',
    assignedTeamMembers: [] as string[],
    startDate: format(new Date(), 'MMM d, yyyy'),
    startTime: '03:15 AM',
    endTime: '04:15 AM',
    lineItems: [] as Array<{ name: string; description: string; quantity: number; unitPrice: number }>,
  })
  const assignedSet = new Set(formData.assignedTeamMembers)
  const toggleAssignSelection = (value: string) => {
    const next = assignedSet.has(value)
      ? formData.assignedTeamMembers.filter(n => n !== value)
      : [...formData.assignedTeamMembers, value]
    setFormData(prev => ({ ...prev, assignedTeamMembers: next }))
  }
  const clearAssignSelection = () => setFormData(prev => ({ ...prev, assignedTeamMembers: [] }))
  const selectAllAssign = () => setFormData(prev => ({ ...prev, assignedTeamMembers: assignOptions.map(o => o.value) }))
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
  // Filter master price list by search; group by type (service / product) for dropdown
  const addLineItemFiltered = mockMasterPriceList.filter(
    item => item.name.toLowerCase().includes(addLineItemSearchTerm.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(addLineItemSearchTerm.toLowerCase())
  )
  const addLineItemServices = addLineItemFiltered.filter(i => i.type === 'service')
  const addLineItemProducts = addLineItemFiltered.filter(i => i.type === 'product')
  const addLineItemSelect = (item: { name: string; description: string; price: number }) => {
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { name: item.name, description: item.description || '', quantity: 1, unitPrice: item.price }],
    }))
    setAddLineItemSearchTerm('')
    setIsAddLineItemDropdownOpen(false)
  }

  // Time dropdown: only allow selection from predefined options; validate end > start
  const TIME_HOURS = ['12', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11']
  const TIME_MINUTES = ['00', '15', '30', '45']
  const TIME_PERIODS = ['AM', 'PM'] as const
  function parseTime(s: string): { hour: number; minute: number; period: 'AM' | 'PM' } | null {
    const m = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
    if (!m) return null
    const hour = parseInt(m[1], 10)
    const minute = parseInt(m[2], 10)
    const period = m[3].toUpperCase() as 'AM' | 'PM'
    if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return null
    return { hour, minute, period }
  }
  function timeToMinutes(t: { hour: number; minute: number; period: 'AM' | 'PM' }): number {
    let h = t.hour
    if (t.period === 'AM' && h === 12) h = 0
    else if (t.period === 'PM' && h !== 12) h += 12
    return h * 60 + t.minute
  }
  function formatTime(hour: number, minute: number, period: 'AM' | 'PM'): string {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`
  }
  const startTimeParsed = parseTime(formData.startTime)
  const endTimeParsed = formData.endTime ? parseTime(formData.endTime) : null
  const startMinutes = startTimeParsed ? timeToMinutes(startTimeParsed) : 0
  const endMinutes = endTimeParsed ? timeToMinutes(endTimeParsed) : 0
  const isEndValid = !formData.endTime || endMinutes > startMinutes
  const defaultEndFromStart = (() => {
    const m = Math.min(startMinutes + 60, 24 * 60 - 1)
    const h24 = Math.floor(m / 60)
    const min = m % 60
    const hour12 = h24 % 12 || 12
    const period: 'AM' | 'PM' = h24 < 12 ? 'AM' : 'PM'
    return { hour: hour12, minute: min, period }
  })()

  const applyStartTime = (hour: number, minute: number, period: 'AM' | 'PM') => {
    const value = formatTime(hour, minute, period)
    setFormData(prev => ({ ...prev, startTime: value }))
    setIsStartTimeDropdownOpen(false)
  }
  const applyEndTime = (hour: number, minute: number, period: 'AM' | 'PM') => {
    const mins = timeToMinutes({ hour, minute, period })
    if (mins <= startMinutes) return // do not register invalid end time
    const value = formatTime(hour, minute, period)
    setFormData(prev => ({ ...prev, endTime: value }))
    setIsEndTimeDropdownOpen(false)
  }

  const filteredClientsForModal = mockClients.filter(
    c =>
      c.name.toLowerCase().includes((formData.client || '').toLowerCase()) ||
      (c.address || '').toLowerCase().includes((formData.client || '').toLowerCase()) ||
      (c.phone || '').includes(formData.client || '')
  )

  // Update form data when initialDate, initialTime, or initialClientId changes
  useEffect(() => {
    if (isOpen) {
      const client = initialClientId ? mockClients.find(c => c.id === initialClientId) : null
      setFormData(prev => ({
        ...prev,
        client: client ? client.name : '',
        address: client ? (client.address || '') : '',
        startDate: initialDate ? format(initialDate, 'MMM d, yyyy') : format(new Date(), 'MMM d, yyyy'),
        startTime: initialTime || '03:15 AM',
        endTime: initialTime ? (() => {
          // Calculate end time (1 hour after start)
          const [time, period] = initialTime.split(' ')
          const [hours, minutes] = time.split(':')
          let hour = parseInt(hours)
          if (period === 'PM' && hour !== 12) hour += 12
          if (period === 'AM' && hour === 12) hour = 0
          const endHour = (hour + 1) % 24
          const endHour12 = endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour
          const endAmpm = endHour >= 12 ? 'PM' : 'AM'
          return `${endHour12}:${minutes} ${endAmpm}`
        })() : '04:15 AM',
      }))
      // When opening from a time slot, show time; otherwise Anytime stays checked (new visit)
      setAnytime(!initialTime)
    }
  }, [isOpen, initialDate, initialTime, initialClientId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!anytime && formData.endTime && !isEndValid) {
      alert('End time must be after start time.')
      return
    }
    // Static form submission - just show success and close
    alert(`${taskType === 'workorder' ? 'Workorder' : 'Task'} created successfully! (Static UI)`)
    onClose()
    // Reset form
    setFormData({
      client: '',
      address: '',
      title: '',
      instructions: '',
      assignedTeamMembers: [],
      startDate: format(new Date(), 'MMM d, yyyy'),
      startTime: '03:15 AM',
      endTime: '04:15 AM',
      lineItems: [],
    })
    setShowInstructions(false)
    setShowAssign(false)
    setAnytime(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const removeTime = () => {
    setFormData(prev => ({ ...prev, endTime: '' }))
  }

  if (!isOpen) return null

  // Calculate position - position near click but keep it compact
  const getModalStyle = () => {
    if (!position || typeof window === 'undefined') {
      return {
        position: 'fixed' as const,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }
    }
    const modalWidth = 320 // smaller width
    const modalHeight = 500 // approximate height
    const padding = 8 // smaller padding
    
    // Position modal with offset: down and to the right
    let left = position.x + 31 // Move more to the right
    let top = position.y + 61 // Move more down
    
    // Ensure modal stays within viewport
    if (left + modalWidth > window.innerWidth - padding) {
      left = position.x - modalWidth - 10 // Show to the left of click if no room on right
    }
    if (left < padding) {
      left = padding
    }
    
    if (top + modalHeight > window.innerHeight - padding) {
      top = position.y - modalHeight - 10 // Show above click if no room below
    }
    if (top < padding) {
      top = padding
    }
    
    return {
      position: 'fixed' as const,
      left: `${left}px`,
      top: `${top}px`,
      transform: 'none',
    }
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-neutral-dark bg-opacity-20 pointer-events-auto"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative bg-white rounded-lg shadow-2xl w-[320px] overflow-hidden flex flex-col pointer-events-auto border border-neutral-light"
        style={{ ...getModalStyle(), maxHeight: 'min(560px, 85vh)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-2.5 border-b border-neutral-light">
          <div className="relative" ref={typeDropdownRef}>
            <button
              onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
              className="flex items-center gap-1.5 text-base font-semibold text-neutral-dark hover:text-neutral-dark/80 transition-colors"
            >
              <span>{taskType === 'task' ? 'New Task' : 'New Workorder'}</span>
              <FiChevronDown size={12} className={`text-neutral-dark/70 transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isTypeDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-neutral-light rounded shadow-lg z-10 min-w-[160px]">
                <button
                  onClick={() => {
                    setTaskType('workorder')
                    setIsTypeDropdownOpen(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-neutral-dark hover:bg-neutral-light flex items-center gap-2"
                >
                  {taskType === 'workorder' && <FiCheckCircle size={14} className="text-neutral-dark" />}
                  {taskType !== 'workorder' && <div className="w-[14px]" />}
                  <span>New Workorder</span>
                </button>
                <button
                  onClick={() => {
                    setTaskType('task')
                    setIsTypeDropdownOpen(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-neutral-dark hover:bg-neutral-light flex items-center gap-2"
                >
                  {taskType === 'task' && <FiCheckCircle size={14} className="text-neutral-dark" />}
                  {taskType !== 'task' && <div className="w-[14px]" />}
                  <span>New Task</span>
                </button>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-0.5 hover:bg-neutral-light rounded text-neutral-dark transition-colors"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2.5">
          <form onSubmit={handleSubmit} className="space-y-2.5">
            {/* Client / Address - search with dropdown (results + New client) */}
            <div className="relative space-y-1.5" ref={clientDropdownRef}>
              <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Search client or address</label>
              <input
                type="text"
                name="client"
                value={formData.client}
                onChange={(e) => {
                  handleChange(e)
                  setIsClientDropdownOpen(true)
                }}
                onFocus={() => setIsClientDropdownOpen(true)}
                placeholder="Search client or address"
                className="w-full px-2 py-1.5 border border-neutral-light rounded focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                style={{ borderColor: '#EAEBED' }}
              />
              {isClientDropdownOpen && (
                <div className="absolute z-10 w-full mt-0.5 bg-white border rounded shadow-lg max-h-48 overflow-y-auto" style={{ borderColor: '#EAEBED' }}>
                  {filteredClientsForModal.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          client: client.name,
                          address: client.address || prev.address,
                        }))
                        setIsClientDropdownOpen(false)
                      }}
                      className="w-full text-left px-2 py-2 text-sm hover:bg-gray-50 border-b"
                      style={{ color: '#1F271B', borderBottomColor: '#EAEBED' }}
                    >
                      {client.address && <div className="font-medium">{client.address}</div>}
                      <div className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>
                        {client.name}{client.phone ? ` | ${client.phone}` : ''}
                      </div>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setIsClientDropdownOpen(false)
                      setIsAddClientOpen(true)
                    }}
                    className="w-full flex items-center justify-center gap-1.5 px-2 py-2 text-sm font-medium transition-colors"
                    style={{ color: '#28AFB0' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white' }}
                  >
                    <FiPlus size={14} />
                    <span>New client</span>
                  </button>
                </div>
              )}
            </div>
            {/* Address */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
                className="w-full px-2 py-1.5 border border-neutral-light rounded focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                style={{ borderColor: '#EAEBED' }}
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Title"
                className="w-full px-2 py-1.5 border border-neutral-light rounded focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                style={{ borderColor: '#EAEBED' }}
              />
            </div>

            {/* Add Instructions - button-like */}
            {!showInstructions ? (
              <button
                type="button"
                onClick={() => setShowInstructions(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors"
                style={{ borderColor: '#EAEBED', color: '#28AFB0', backgroundColor: 'white' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6'; e.currentTarget.style.borderColor = '#28AFB0' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.borderColor = '#EAEBED' }}
              >
                <FiPlus size={14} />
                <span>Add Instructions</span>
              </button>
            ) : (
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Instructions</label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  placeholder="Add instructions..."
                  rows={2}
                  className="w-full px-2 py-1.5 border border-neutral-light rounded focus:outline-none focus:ring-1 focus:ring-primary text-sm resize-none"
                  style={{ borderColor: '#EAEBED' }}
                />
              </div>
            )}

            {/* Assign - Selected members as chips; + Assign button always visible (button-like); Filter-style popup */}
            {!showAssign ? (
              <button
                type="button"
                onClick={() => setShowAssign(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors"
                style={{ borderColor: '#EAEBED', color: '#28AFB0', backgroundColor: 'white' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6'; e.currentTarget.style.borderColor = '#28AFB0' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.borderColor = '#EAEBED' }}
              >
                <FiPlus size={14} />
                <span>Assign</span>
              </button>
            ) : (
              <div ref={assignDropdownRef} className="relative space-y-2">
                {/* Selected team members as chips (avatar initials + name + remove) */}
                {formData.assignedTeamMembers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {formData.assignedTeamMembers.map((name) => (
                      <span
                        key={name}
                        className="inline-flex items-center gap-2 pl-1.5 pr-1 py-1 rounded-lg border"
                        style={{ borderColor: '#EAEBED', backgroundColor: '#F9FAFB', color: '#1F271B' }}
                      >
                        <span className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium flex-shrink-0" style={{ backgroundColor: '#E5E7EB', color: '#1F271B' }}>
                          {name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                        <span className="text-sm font-medium max-w-[120px] truncate">{name}</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, assignedTeamMembers: formData.assignedTeamMembers.filter(n => n !== name) })}
                          className="p-0.5 rounded hover:bg-gray-200 transition-colors flex-shrink-0"
                          style={{ color: '#6B7280' }}
                          aria-label={`Remove ${name}`}
                        >
                          <FiX size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {/* + Assign button (always visible) - opens dropdown */}
                <button
                  type="button"
                  onClick={() => setIsAssignDropdownOpen(!isAssignDropdownOpen)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors"
                  style={{ borderColor: '#EAEBED', color: '#28AFB0', backgroundColor: 'white' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6'; e.currentTarget.style.borderColor = '#28AFB0' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.borderColor = '#EAEBED' }}
                >
                  <FiPlus size={14} />
                  <span>Assign</span>
                  <FiChevronDown size={12} className={`flex-shrink-0 transition-transform ${isAssignDropdownOpen ? 'rotate-180' : ''}`} style={{ opacity: 0.8 }} />
                </button>
                {isAssignDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-xl z-[100] min-w-[200px]" style={{ borderColor: '#EAEBED' }}>
                    <div className="p-1.5 border-b" style={{ borderColor: '#EAEBED' }}>
                      <input
                        type="text"
                        placeholder="Search team"
                        value={assignSearchTerm}
                        onChange={(e) => setAssignSearchTerm(e.target.value)}
                        className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1"
                        style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="px-2 py-1.5 border-b flex items-center justify-between" style={{ borderColor: '#EAEBED' }}>
                      <span className="text-sm font-medium" style={{ color: '#1F271B' }}>Select team</span>
                      <button
                        type="button"
                        onClick={() => assignedSet.size === assignOptions.length ? clearAssignSelection() : selectAllAssign()}
                        className="text-sm font-medium underline"
                        style={{ color: '#28AFB0' }}
                      >
                        {assignedSet.size === assignOptions.length ? 'Clear' : 'Select all'}
                      </button>
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {filteredAssignOptions.map((option) => {
                        const isSelected = assignedSet.has(option.value)
                        return (
                          <div
                            key={option.value}
                            role="button"
                            tabIndex={0}
                            onClick={() => toggleAssignSelection(option.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleAssignSelection(option.value) } }}
                            className="px-2 py-1.5 cursor-pointer flex items-center gap-2 transition-colors"
                            style={{ backgroundColor: 'transparent' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                          >
                            <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 bg-[#2B50AA]" />
                            <span className="text-sm font-medium flex-1 min-w-0" style={{ color: '#1F271B' }}>{option.label}</span>
                            {isSelected && <FiCheck className="flex-shrink-0" size={16} style={{ color: '#28AFB0' }} strokeWidth={3} />}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Line Items - only for Workorder: select from Product/Service settings only; no summary */}
            {taskType === 'workorder' && (
              <div ref={lineItemsSectionRef} className="space-y-3">
                {/* + Add Line Item - always in same place; opens dropdown to select existing items only */}
                <div ref={addLineItemDropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsAddLineItemDropdownOpen(!isAddLineItemDropdownOpen)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors"
                    style={{ borderColor: '#EAEBED', color: '#28AFB0', backgroundColor: 'white' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6'; e.currentTarget.style.borderColor = '#28AFB0' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.borderColor = '#EAEBED' }}
                  >
                    <FiPlus size={14} />
                    <span>Add Line Item</span>
                  </button>
                  {isAddLineItemDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-xl z-[100] w-full min-w-[260px] max-w-[320px]" style={{ borderColor: '#EAEBED' }}>
                      <div className="p-2 border-b" style={{ borderColor: '#EAEBED' }}>
                        <input
                          type="text"
                          placeholder="Name"
                          value={addLineItemSearchTerm}
                          onChange={(e) => setAddLineItemSearchTerm(e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1"
                          style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="max-h-56 overflow-y-auto">
                        {addLineItemServices.length > 0 && (
                          <div className="py-1">
                            <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6B7280' }}>Service</div>
                            {addLineItemServices.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => addLineItemSelect({ name: item.name, description: item.description || '', price: item.price })}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b transition-colors"
                                style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                              >
                                <div className="font-medium">{item.name}</div>
                                <div className="text-xs truncate mt-0.5" style={{ color: '#6B7280' }}>{item.description}</div>
                                <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>${(item.price || 0).toFixed(2)}</div>
                              </button>
                            ))}
                          </div>
                        )}
                        {addLineItemProducts.length > 0 && (
                          <div className="py-1 border-t" style={{ borderColor: '#EAEBED' }}>
                            <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6B7280' }}>Product</div>
                            {addLineItemProducts.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => addLineItemSelect({ name: item.name, description: item.description || '', price: item.price })}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b transition-colors"
                                style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                              >
                                <div className="font-medium">{item.name}</div>
                                <div className="text-xs truncate mt-0.5" style={{ color: '#6B7280' }}>{item.description}</div>
                                <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>${(item.price || 0).toFixed(2)}</div>
                              </button>
                            ))}
                          </div>
                        )}
                        {addLineItemFiltered.length === 0 && (
                          <div className="px-3 py-4 text-sm" style={{ color: '#6B7280' }}>No items match your search.</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {/* Added line items - name, description, price, delete */}
                {formData.lineItems.length > 0 && (
                  <div className="space-y-2">
                    {formData.lineItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between gap-2 p-3 border rounded-lg bg-white"
                        style={{ borderColor: '#EAEBED' }}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm" style={{ color: '#1F271B' }}>{item.name}</div>
                          {item.description ? (
                            <div className="text-xs mt-0.5 truncate" style={{ color: '#6B7280' }}>{item.description}</div>
                          ) : null}
                          <div className="text-xs mt-1" style={{ color: '#6B7280' }}>${((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, lineItems: prev.lineItems.filter((_, i) => i !== index) }))}
                          className="p-1.5 rounded text-red-500 hover:bg-red-50 flex-shrink-0 transition-colors"
                          title="Remove line item"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Scheduling Section */}
            <div className="space-y-1.5 pt-0.5">
              {/* Start Date - opens calendar on press */}
              <div ref={startDateCalendarRef} className="relative">
                <label className="block text-xs font-medium text-neutral-dark/70 mb-0.5">Start Date</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsStartDateCalendarOpen(!isStartDateCalendarOpen)
                    try {
                      const parsed = parse(formData.startDate, 'MMM d, yyyy', new Date())
                      if (!isNaN(parsed.getTime())) setStartDatePickerMonth(parsed)
                    } catch {
                      setStartDatePickerMonth(new Date())
                    }
                  }}
                  className="w-full px-2 py-1 border border-neutral-light rounded text-left focus:outline-none focus:ring-1 focus:ring-primary text-sm bg-white"
                  style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                >
                  {formData.startDate}
                </button>
              </div>

              {/* Time Row - hidden when Anytime is checked; dropdown pickers only, validation: end > start */}
              {!anytime && (
                <div className="flex items-end gap-1.5">
                  {/* Start Time - dropdown with hour / minute / AM-PM */}
                  <div className="flex-1 relative" ref={startTimeDropdownRef}>
                    <label className="block text-xs font-medium text-neutral-dark/70 mb-0.5">Start time</label>
                    <button
                      type="button"
                      onClick={() => { setIsStartTimeDropdownOpen(!isStartTimeDropdownOpen); setIsEndTimeDropdownOpen(false) }}
                      className="w-full px-2 py-1 border border-neutral-light rounded text-left focus:outline-none focus:ring-1 focus:ring-primary text-sm flex items-center justify-between bg-white"
                      style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                    >
                      <span>{formData.startTime}</span>
                      <FiChevronDown size={12} className={`opacity-60 ${isStartTimeDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* End Time - dropdown; only register if end > start */}
                  <div className="flex-1 relative" ref={endTimeDropdownRef}>
                    <label className="block text-xs font-medium text-neutral-dark/70 mb-0.5">End time</label>
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => { setIsEndTimeDropdownOpen(!isEndTimeDropdownOpen); setIsStartTimeDropdownOpen(false) }}
                        className="flex-1 px-2 py-1 border border-neutral-light rounded text-left focus:outline-none focus:ring-1 focus:ring-primary text-sm flex items-center justify-between bg-white"
                        style={{ borderColor: isEndValid ? '#EAEBED' : '#EF4444', color: '#1F271B' }}
                      >
                        <span>{formData.endTime || 'Select time'}</span>
                        <FiChevronDown size={12} className={`opacity-60 ${isEndTimeDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {formData.endTime && (
                        <button
                          type="button"
                          onClick={removeTime}
                          className="p-1 rounded text-neutral-dark/50 hover:text-neutral-dark"
                          title="Clear end time"
                        >
                          <FiX size={12} />
                        </button>
                      )}
                    </div>
                    {!isEndValid && <p className="text-[10px] mt-0.5 text-red-500">End must be after start</p>}
                  </div>
                </div>
              )}

              {/* Anytime Checkbox */}
              <div className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  id="anytime"
                  checked={anytime}
                  onChange={(e) => setAnytime(e.target.checked)}
                  className="w-3 h-3 text-primary border-neutral-light rounded focus:ring-primary"
                />
                <label htmlFor="anytime" className="text-xs text-neutral-dark cursor-pointer">
                  Anytime
                </label>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-1.5 pt-2 border-t border-neutral-light">
              <button
                type="button"
                onClick={() => {
                  onClose()
                  router.push('/workorders/new')
                }}
                className="px-2.5 py-1 bg-white border border-neutral-light rounded text-neutral-dark hover:bg-neutral-light transition-colors text-xs font-medium"
              >
                More Options
              </button>
              <button
                type="submit"
                className="px-2.5 py-1 bg-secondary text-white rounded hover:bg-secondary-dark transition-colors text-xs font-medium"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Calendar and time dropdowns portaled so they are not clipped by modal overflow */}
      {dropdownAnchor && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropdownPortalRef}
          className="bg-white border rounded-lg shadow-xl z-[10000]"
          style={{
            position: 'fixed',
            top: dropdownAnchor.top,
            left: dropdownAnchor.left,
            borderColor: '#EAEBED',
          }}
        >
          {dropdownAnchor.type === 'date' && (
            <div className="p-3 w-[240px]">
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => setStartDatePickerMonth(prev => subMonths(prev, 1))}
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                  style={{ color: '#1F271B' }}
                >
                  <FiChevronLeft size={16} />
                </button>
                <span className="text-sm font-semibold" style={{ color: '#1F271B' }}>
                  {format(startDatePickerMonth, 'MMMM yyyy')}
                </span>
                <button
                  type="button"
                  onClick={() => setStartDatePickerMonth(prev => addMonths(prev, 1))}
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                  style={{ color: '#1F271B' }}
                >
                  <FiChevronRight size={16} />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-0.5 mb-1.5">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-xs font-medium py-0.5" style={{ color: '#6B7280' }}>{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {(() => {
                  const monthStart = startOfMonth(startDatePickerMonth)
                  const monthEnd = endOfMonth(startDatePickerMonth)
                  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
                  const calendarEnd = addDays(startOfWeek(monthEnd, { weekStartsOn: 0 }), 6)
                  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
                  let selectedDate: Date | null = null
                  try {
                    selectedDate = parse(formData.startDate, 'MMM d, yyyy', new Date())
                    if (isNaN(selectedDate.getTime())) selectedDate = null
                  } catch { selectedDate = null }
                  return calendarDays.map((day) => {
                    const isCurrentMonth = isSameMonth(day, startDatePickerMonth)
                    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
                    const isTodayDate = isToday(day)
                    return (
                      <button
                        key={day.toISOString()}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, startDate: format(day, 'MMM d, yyyy') }))
                          setStartDatePickerMonth(day)
                          setIsStartDateCalendarOpen(false)
                        }}
                        className="w-8 h-8 text-xs rounded-full flex items-center justify-center transition-colors font-medium"
                        style={{
                          color: !isCurrentMonth ? '#9CA3AF' : isSelected ? 'white' : '#1F271B',
                          backgroundColor: isSelected ? '#28AFB0' : isTodayDate && !isSelected ? 'rgba(40, 175, 176, 0.15)' : undefined,
                        }}
                      >
                        {format(day, 'd')}
                      </button>
                    )
                  })
                })()}
              </div>
            </div>
          )}
          {dropdownAnchor.type === 'startTime' && startTimeParsed && (
            <div className="p-2 flex gap-1 w-[180px]">
              <TimePickerColumn
                options={TIME_HOURS}
                selected={startTimeParsed.hour.toString().padStart(2, '0')}
                onSelect={(v) => applyStartTime(parseInt(v, 10), startTimeParsed.minute, startTimeParsed.period)}
              />
              <TimePickerColumn
                options={TIME_MINUTES}
                selected={startTimeParsed.minute.toString().padStart(2, '0')}
                onSelect={(v) => applyStartTime(startTimeParsed.hour, parseInt(v, 10), startTimeParsed.period)}
              />
              <TimePickerColumn
                options={TIME_PERIODS}
                selected={startTimeParsed.period}
                onSelect={(v) => applyStartTime(startTimeParsed.hour, startTimeParsed.minute, v as 'AM' | 'PM')}
              />
            </div>
          )}
          {dropdownAnchor.type === 'endTime' && (() => {
            const cur = endTimeParsed ?? defaultEndFromStart
            return (
              <div className="p-2 flex gap-1 w-[180px]">
                <TimePickerColumn
                  options={TIME_HOURS}
                  selected={cur.hour.toString().padStart(2, '0')}
                  onSelect={(v) => applyEndTime(parseInt(v, 10), cur.minute, cur.period)}
                />
                <TimePickerColumn
                  options={TIME_MINUTES}
                  selected={cur.minute.toString().padStart(2, '0')}
                  onSelect={(v) => applyEndTime(cur.hour, parseInt(v, 10), cur.period)}
                />
                <TimePickerColumn
                  options={TIME_PERIODS}
                  selected={cur.period}
                  onSelect={(v) => applyEndTime(cur.hour, cur.minute, v as 'AM' | 'PM')}
                />
              </div>
            )
          })()}
        </div>,
        document.body
      )}

      {/* Add Client modal - same fields as Add Client flow in portal */}
      <AddClientModal
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
        mode="new"
        onSuccess={(data) => {
          setFormData(prev => ({
            ...prev,
            client: data.name,
            address: data.address || prev.address,
          }))
        }}
      />

    </div>
  )
}
