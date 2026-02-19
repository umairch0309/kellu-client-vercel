'use client'

import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { 
  FiCalendar, 
  FiChevronLeft, 
  FiChevronRight, 
  FiX,
  FiCheck,
  FiCheckCircle,
  FiUsers,
  FiPlus,
  FiEdit
} from 'react-icons/fi'
import { format, startOfWeek, addDays, isToday, isSameDay, startOfDay, getHours, getMinutes, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, getDay, subMonths, addMonths } from 'date-fns'
import { mockWorkorders, mockTeamMembers } from '@/data/mockData'
import AddWorkorderModal from './AddWorkorderModal'

type ScheduleItem = typeof mockWorkorders[0]
import Sidebar from './Sidebar'
import Header from './Header'

export default function ScheduleView() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'day' | 'week' | 'month'>('day')
  const [isAddWorkorderOpen, setIsAddWorkorderOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [selectedItemPosition, setSelectedItemPosition] = useState<{ x: number; y: number } | undefined>(undefined)
  const [modalInitialDate, setModalInitialDate] = useState<Date | undefined>(undefined)
  const [modalInitialTime, setModalInitialTime] = useState<string | undefined>(undefined)
  const [modalPosition, setModalPosition] = useState<{ x: number; y: number } | undefined>(undefined)
  const [typeFilter, setTypeFilter] = useState<'all' | 'visits' | 'tasks'>('all')
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set(['visits', 'tasks']))
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false)
  const [typeSearchTerm, setTypeSearchTerm] = useState('')
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set())
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false)
  const [teamSearchTerm, setTeamSearchTerm] = useState('')
  const [isEventDetailAssignOpen, setIsEventDetailAssignOpen] = useState(false)
  const [eventDetailAssignSearchTerm, setEventDetailAssignSearchTerm] = useState('')
  const [showUnscheduled, setShowUnscheduled] = useState(true)
  const [showUnscheduledTooltip, setShowUnscheduledTooltip] = useState(false)
  const [dayViewAnytimeExpanded, setDayViewAnytimeExpanded] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [datePickerMonth, setDatePickerMonth] = useState(new Date())
  const datePickerRef = useRef<HTMLDivElement>(null)
  const unscheduleButtonRef = useRef<HTMLButtonElement>(null)
  const [unscheduleTooltipStyle, setUnscheduleTooltipStyle] = useState<{ top: number; left: number; above: boolean } | null>(null)

  // Editable work orders for drag/resize (initialized from mock)
  const [workOrders, setWorkOrders] = useState<ScheduleItem[]>(() => JSON.parse(JSON.stringify(mockWorkorders)))
  const updateWorkOrder = (id: number, updates: Partial<ScheduleItem>) => {
    setWorkOrders(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w))
  }

  // Resize state: which item and which edge (for duration change)
  const [resizeState, setResizeState] = useState<{
    itemId: number
    edge: 'top' | 'bottom'
    startY: number
    startEndMinutes: number
    startStartMinutes: number
    scheduleDay: string
    pixelsPerHour: number
  } | null>(null)

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }) // Monday start
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Full 24-hour range: 0:00 to 23:00
  const hours = Array.from({ length: 24 }, (_, i) => i)

  // Live "now" for current-time indicator (updates every minute)
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60 * 1000)
    return () => clearInterval(t)
  }, [])

  // Unscheduled tooltip: position in viewport so it's never clipped (portal + fixed)
  const TOOLTIP_GAP = 6
  const TOOLTIP_EST_HEIGHT = 36
  const TOOLTIP_EST_WIDTH = 100
  useLayoutEffect(() => {
    if (!showUnscheduledTooltip || !unscheduleButtonRef.current || typeof window === 'undefined') {
      setUnscheduleTooltipStyle(null)
      return
    }
    const rect = unscheduleButtonRef.current.getBoundingClientRect()
    const viewportPadding = 8
    const spaceAbove = rect.top
    const showAbove = spaceAbove >= TOOLTIP_EST_HEIGHT + TOOLTIP_GAP + viewportPadding
    let left = rect.left + rect.width / 2
    left = Math.max(viewportPadding + TOOLTIP_EST_WIDTH / 2, Math.min(window.innerWidth - viewportPadding - TOOLTIP_EST_WIDTH / 2, left))
    const above = showAbove
    let top = above
      ? rect.top - TOOLTIP_EST_HEIGHT - TOOLTIP_GAP
      : rect.bottom + TOOLTIP_GAP
    if (above) {
      top = Math.max(viewportPadding, top)
    } else {
      top = Math.min(window.innerHeight - viewportPadding - TOOLTIP_EST_HEIGHT, top)
    }
    setUnscheduleTooltipStyle({ top, left, above })
  }, [showUnscheduledTooltip])

  const currentHour = getHours(now)
  const currentMinute = getMinutes(now)
  const currentTimeTopDay = currentHour * 60 + (currentMinute / 60) * 60 // px per hour = 60 in day view (0:00 = 0)
  const currentTimeTopWeek = currentHour * 48 + (currentMinute / 60) * 48 // px per hour = 48 in week view
  const showCurrentTimeDay = isToday(currentDate)
  const showCurrentTimeWeek = (day: Date) => isToday(day)

  // Get scheduled items from editable work orders
  const scheduledItems = workOrders.filter(item => {
    // Type filter: check if item type matches any of the selected types
    // If all types are selected (size === 2) or none selected (size === 0), show all items
    const matchesType = selectedTypes.size === 0 || selectedTypes.size === 2 || ((item as any).type && selectedTypes.has((item as any).type))
    
    // Team filter (multiselect: none selected = all; otherwise match any selected)
    let matchesTeam = true
    if (selectedTeams.size > 0) {
      matchesTeam = (selectedTeams.has('unassigned') && (!item.assignedTeamMember || item.assignedTeamMember === '')) ||
        (item.assignedTeamMember && selectedTeams.has(item.assignedTeamMember))
    }
    return matchesType && matchesTeam
  })

  const toggleTypeSelection = (type: string) => {
    const newSelected = new Set(selectedTypes)
    if (newSelected.has(type)) {
      newSelected.delete(type)
    } else {
      newSelected.add(type)
    }
    setSelectedTypes(newSelected)
    // Update typeFilter based on selection
    if (newSelected.size === 0) {
      setTypeFilter('all')
    } else if (newSelected.size === 2) {
      setTypeFilter('all')
    } else {
      // Set to first selected type (or keep current if it's still selected)
      const firstSelected = Array.from(newSelected)[0]
      setTypeFilter(firstSelected as 'visits' | 'tasks')
    }
  }

  const clearTypeSelection = () => {
    setSelectedTypes(new Set())
    setTypeFilter('all')
  }

  // Filter options based on search (full color circle; selection = checkmark overlay)
  const typeOptions = [
    { value: 'visits', label: 'Workorders', circleColor: 'bg-green-500' },
    { value: 'tasks', label: 'Tasks', circleColor: 'bg-neutral-700' },
  ]

  const filteredTypeOptions = typeOptions.filter(option =>
    option.label.toLowerCase().includes(typeSearchTerm.toLowerCase())
  )

  // Close dropdown when clicking outside
  const typeDropdownRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setIsTypeDropdownOpen(false)
        setTypeSearchTerm('')
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false)
      }
    }
    if (isTypeDropdownOpen || isDatePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isTypeDropdownOpen, isDatePickerOpen])

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Get all team members
  const allTeamMembers = [...mockTeamMembers]

  // Team dropdown ref and click outside handler
  const teamDropdownRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (teamDropdownRef.current && !teamDropdownRef.current.contains(event.target as Node)) {
        setIsTeamDropdownOpen(false)
        setTeamSearchTerm('')
      }
    }
    if (isTeamDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isTeamDropdownOpen])

  // Team filter options (multiselect; no 'all' in list - use Select all / Clear)
  const teamOptions = [
    { value: 'unassigned', label: 'Unassigned' },
    ...allTeamMembers.map(member => ({ value: member.name, label: member.name }))
  ]

  const filteredTeamOptions = teamOptions.filter(option =>
    option.label.toLowerCase().includes(teamSearchTerm.toLowerCase())
  )

  const toggleTeamSelection = (value: string) => {
    const next = new Set(selectedTeams)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    setSelectedTeams(next)
  }

  const clearTeamSelection = () => setSelectedTeams(new Set())
  const selectAllTeams = () => setSelectedTeams(new Set(teamOptions.map(o => o.value)))

  // Format time for display (convert 24h to 12h format)
  const formatTime = (time: string) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Format 24h hour + minute to "HH:mm" for schedule
  const toScheduleTime = (hour: number, minute: number) =>
    `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`

  // Parse Y offset in a column (pixelsPerHour) to hour + minute snapped to 15
  const parseYToTime = (offsetY: number, pixelsPerHour: number, startHour = 0) => {
    const totalMins = (offsetY / pixelsPerHour) * 60
    let hour = startHour + Math.floor(totalMins / 60)
    let minute = Math.floor(totalMins % 60)
    minute = Math.ceil(minute / 15) * 15
    if (minute >= 60) {
      minute = 0
      hour += 1
    }
    return { hour, minute }
  }

  // Resize: apply mouse move/up to update end or start time (uses only resizeState for initial values)
  useEffect(() => {
    if (!resizeState) return
    const pxPerHour = resizeState.pixelsPerHour
    const onMove = (e: MouseEvent) => {
      const deltaY = e.clientY - resizeState.startY
      const deltaMinutes = Math.round((deltaY / pxPerHour) * 60)
      const minDuration = 15
      const s = resizeState
      if (s.edge === 'bottom') {
        let newEnd = s.startEndMinutes + deltaMinutes
        newEnd = Math.max(s.startStartMinutes + minDuration, Math.min(24 * 60, newEnd))
        newEnd = Math.ceil(newEnd / 15) * 15
        updateWorkOrder(s.itemId, {
          schedule: {
            day: s.scheduleDay,
            startTime: toScheduleTime(Math.floor(s.startStartMinutes / 60), s.startStartMinutes % 60),
            endTime: toScheduleTime(Math.floor(newEnd / 60), newEnd % 60),
          },
        })
      } else {
        let newStart = s.startStartMinutes + deltaMinutes
        newStart = Math.min(s.startEndMinutes - minDuration, Math.max(0, newStart))
        newStart = Math.floor(newStart / 15) * 15
        updateWorkOrder(s.itemId, {
          schedule: {
            day: s.scheduleDay,
            startTime: toScheduleTime(Math.floor(newStart / 60), newStart % 60),
            endTime: toScheduleTime(Math.floor(s.startEndMinutes / 60), s.startEndMinutes % 60),
          },
        })
      }
    }
    const onUp = () => setResizeState(null)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [resizeState])

  // Round up to next 15-minute block and format for modal (e.g. 10:10 → "10:15 AM")
  const getTimeFromClick = (offsetY: number, pixelsPerHour: number, startHour = 0, endHour = 24) => {
    const totalMinutesFromStart = (offsetY / pixelsPerHour) * 60
    let hour = startHour + Math.floor(totalMinutesFromStart / 60)
    let minute = Math.floor(totalMinutesFromStart % 60)
    minute = Math.ceil(minute / 15) * 15
    if (minute >= 60) {
      minute = 0
      hour += 1
    }
    if (hour >= endHour) {
      hour = endHour - 1
      minute = 45
    }
    const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    const ampm = hour >= 12 ? 'PM' : 'AM'
    return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`
  }

  // Get unscheduled items
  const unscheduledItems = scheduledItems.filter(item => !item.schedule?.day || !item.schedule?.startTime)

  // Get items for a specific day and time
  const getItemsForSlot = (day: Date, hour: number) => {
    return scheduledItems.filter(item => {
      if (!item.schedule?.day || !item.schedule?.startTime) return false
      const itemDate = new Date(item.schedule.day)
      const itemHour = parseInt(item.schedule.startTime.split(':')[0])
      return isSameDay(itemDate, day) && itemHour === hour
    })
  }

  // Calculate block height based on duration
  const getBlockHeight = (startTime: string, endTime: string) => {
    const start = startTime.split(':').map(Number)
    const end = endTime.split(':').map(Number)
    const startMinutes = start[0] * 60 + start[1]
    const endMinutes = end[0] * 60 + end[1]
    const duration = endMinutes - startMinutes
    return (duration / 60) * 60 // 60px per hour
  }

  const handleDateChange = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      setCurrentDate(new Date())
    } else if (direction === 'prev') {
      if (view === 'day') {
        setCurrentDate(addDays(currentDate, -1))
      } else if (view === 'week') {
        setCurrentDate(addDays(currentDate, -7))
      } else {
        setCurrentDate(addDays(currentDate, -30))
      }
    } else {
      if (view === 'day') {
        setCurrentDate(addDays(currentDate, 1))
      } else if (view === 'week') {
        setCurrentDate(addDays(currentDate, 7))
      } else {
        setCurrentDate(addDays(currentDate, 30))
      }
    }
  }

  // Current workorder from live state so inline team edits are reflected
  const eventDetailWorkorder = selectedItem ? (workOrders.find(w => w.id === selectedItem.id) ?? selectedItem) : null
  const eventDetailAssignedList = eventDetailWorkorder ? (eventDetailWorkorder.assignedTeamMember || '').split(',').map((s: string) => s.trim()).filter(Boolean) : []
  const eventDetailAssignToggle = (name: string) => {
    if (!selectedItem) return
    const next = eventDetailAssignedList.includes(name) ? eventDetailAssignedList.filter((n: string) => n !== name) : [...eventDetailAssignedList, name]
    updateWorkOrder(selectedItem.id, { assignedTeamMember: next.join(', ') })
  }
  const eventDetailAssignClear = () => {
    if (!selectedItem) return
    updateWorkOrder(selectedItem.id, { assignedTeamMember: '' })
  }
  const eventDetailAssignSelectAll = () => {
    if (!selectedItem) return
    updateWorkOrder(selectedItem.id, { assignedTeamMember: mockTeamMembers.map(m => m.name).join(', ') })
  }
  const filteredEventDetailTeam = mockTeamMembers.filter(m => m.name.toLowerCase().includes(eventDetailAssignSearchTerm.toLowerCase()))

  const eventDetailModal = selectedItem && typeof document !== 'undefined' && createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" aria-modal="true">
      <div className="absolute inset-0 bg-black/25" onClick={() => { setSelectedItem(null); setSelectedItemPosition(undefined); setIsEventDetailAssignOpen(false); setEventDetailAssignSearchTerm('') }} />
      <div
        className="relative bg-white rounded-lg shadow-2xl border w-full max-w-[320px] max-h-[85vh] overflow-hidden flex flex-col min-w-[280px]"
        style={{ borderColor: '#EAEBED' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-2.5 border-b flex-shrink-0" style={{ borderColor: '#EAEBED' }}>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold mb-0.5 truncate" style={{ color: '#1F271B' }}>{selectedItem!.title}</h2>
            <span className="inline-block px-1 py-0.5 text-xs rounded" style={{ backgroundColor: '#F3F4F6', color: '#1F271B', opacity: 0.7 }}>
              {(selectedItem as any).type === 'tasks' ? 'Task' : 'Workorder'}
            </span>
          </div>
          <button onClick={() => { setSelectedItem(null); setSelectedItemPosition(undefined); setIsEventDetailAssignOpen(false); setEventDetailAssignSearchTerm('') }} className="p-0.5 rounded transition-colors" style={{ color: '#1F271B' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}>
            <FiX size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <input type="checkbox" id="event-detail-completed" className="w-3 h-3 rounded focus:ring-1" style={{ borderColor: '#EAEBED', accentColor: '#2B50AA' }} />
            <label htmlFor="event-detail-completed" className="text-xs cursor-pointer" style={{ color: '#1F271B' }}>Completed</label>
          </div>
          {/* Date, time and assignation on the right - larger text */}
          {selectedItem!.schedule?.day && (
            <div className="flex justify-end mb-1.5">
              <div className="text-right">
                <p className="text-sm font-medium" style={{ color: '#1F271B' }}>
                  {format(new Date(selectedItem!.schedule.day), 'MMM d, yyyy')}
                  {selectedItem!.schedule.startTime && ` ${selectedItem!.schedule.startTime}`}
                </p>
                <p className="text-sm font-medium mt-0.5" style={{ color: '#1F271B' }}>
                  {eventDetailAssignedList.length > 0 ? `Assigned to ${eventDetailAssignedList.join(', ')}` : (selectedItem as any).assignedTeamMember ? `Assigned to ${(selectedItem as any).assignedTeamMember}` : 'Not assigned'}
                </p>
              </div>
            </div>
          )}
          {selectedItem!.clientName && (
            <div className="mb-1.5">
              <p className="text-xs" style={{ color: '#1F271B' }}>
                {(selectedItem as any).type === 'tasks' ? (
                  <button
                    type="button"
                    onClick={() => { setSelectedItem(null); setSelectedItemPosition(undefined); router.push(`/clients/${(selectedItem as any).clientId}`) }}
                    className="underline hover:opacity-80 text-left"
                    style={{ color: '#2B50AA' }}
                  >
                    {selectedItem!.clientName}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => { setSelectedItem(null); setSelectedItemPosition(undefined); router.push(`/clients/${(selectedItem as any).clientId}`) }}
                      className="underline hover:opacity-80"
                      style={{ color: '#2B50AA' }}
                    >
                      {selectedItem!.clientName}
                    </button>
                    {' / '}
                    <button
                      type="button"
                      onClick={() => { setSelectedItem(null); setSelectedItemPosition(undefined); router.push(`/workorders/${(selectedItem as any).id}`) }}
                      className="underline hover:opacity-80"
                      style={{ color: '#2B50AA' }}
                    >
                      #{selectedItem!.id}
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
                      onClick={(e) => { e.stopPropagation(); updateWorkOrder(selectedItem!.id, { assignedTeamMember: eventDetailAssignedList.filter((n: string) => n !== name).join(', ') }) }}
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
                    onClick={() => eventDetailAssignedList.length === mockTeamMembers.length ? eventDetailAssignClear() : eventDetailAssignSelectAll()}
                    className="text-xs font-medium underline"
                    style={{ color: '#28AFB0' }}
                  >
                    {eventDetailAssignedList.length === mockTeamMembers.length ? 'Clear' : 'Select all'}
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
              <p className="text-xs font-medium" style={{ color: '#1F271B' }}>{format(new Date(selectedItem!.schedule!.day), 'MMM d, yyyy')}</p>
              <p className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>{selectedItem!.schedule!.startTime}</p>
            </div>
            <div>
              <p className="text-xs mb-0.5" style={{ color: '#1F271B', opacity: 0.7 }}>End</p>
              <p className="text-xs font-medium" style={{ color: '#1F271B' }}>{format(new Date(selectedItem!.schedule!.day), 'MMM d, yyyy')}</p>
              <p className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>{selectedItem!.schedule!.endTime}</p>
            </div>
          </div>
          <div className="flex gap-1.5 pt-1.5 border-t flex-shrink-0" style={{ borderColor: '#EAEBED' }}>
            <button onClick={() => { const id = selectedItem!.id; setSelectedItem(null); setSelectedItemPosition(undefined); setIsEventDetailAssignOpen(false); setEventDetailAssignSearchTerm(''); router.push(`/workorders/${id}/edit`) }} className="flex-1 px-2 py-1.5 bg-white border rounded transition-colors text-xs font-medium flex items-center justify-center gap-1 whitespace-nowrap" style={{ borderColor: '#EAEBED', color: '#1F271B' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white' }}>
              <FiEdit size={10} />
              Edit
            </button>
            <button onClick={() => { const id = selectedItem!.id; setSelectedItem(null); setSelectedItemPosition(undefined); setIsEventDetailAssignOpen(false); setEventDetailAssignSearchTerm(''); router.push(`/workorders/${id}`) }} className="flex-1 px-2 py-1.5 rounded transition-colors text-xs font-medium text-white shadow-sm hover:shadow-md whitespace-nowrap flex items-center justify-center gap-1" style={{ backgroundColor: '#28AFB0' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E8A8B'; e.currentTarget.style.transform = 'translateY(-1px)' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#28AFB0'; e.currentTarget.style.transform = 'translateY(0)' }}>
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )

  return (
    <>
    <div className="flex h-screen bg-white overflow-hidden w-full">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col overflow-hidden bg-white w-full min-w-0 pl-4 lg:pl-6">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <AddWorkorderModal 
        isOpen={isAddWorkorderOpen} 
          onClose={() => {
            setIsAddWorkorderOpen(false)
            setModalInitialDate(undefined)
            setModalInitialTime(undefined)
            setModalPosition(undefined)
          }}
          initialDate={modalInitialDate}
          initialTime={modalInitialTime}
          position={modalPosition}
      />

      {/* Calendar Controls */}
      <div className="bg-white border-b px-2 sm:px-3 py-2" style={{ borderColor: '#EAEBED' }}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 lg:gap-3">
          {/* Left Side - Navigation */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Date Picker - First */}
            <div className="flex items-center gap-1 relative" ref={datePickerRef}>
              <button 
                onClick={() => {
                  setIsDatePickerOpen(!isDatePickerOpen)
                  setDatePickerMonth(currentDate)
                }}
                className="px-2 py-1.5 text-base font-medium rounded flex items-center gap-1 transition-colors"
                style={{ color: '#1F271B' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                {format(currentDate, 'MMMM yyyy')}
                <FiChevronRight size={12} className={`rotate-90 transition-transform ${isDatePickerOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Date Picker Pop-up */}
              {isDatePickerOpen && (
                <div className="fixed bg-white border border-neutral-light rounded-lg shadow-xl z-[100] w-[240px] p-2"
                  style={(() => {
                    if (typeof window === 'undefined') return {}
                    const button = datePickerRef.current?.querySelector('button')
                    if (!button) return {}
                    const rect = button.getBoundingClientRect()
                    const pickerHeight = 260 // approximate height
                    const pickerWidth = 240
                    const padding = 10
                    
                    let top = rect.top - pickerHeight - padding
                    let left = rect.left
                    
                    // Ensure it stays on screen
                    if (top < padding) {
                      top = rect.bottom + padding // Show below if no room above
                    }
                    if (left + pickerWidth > window.innerWidth - padding) {
                      left = window.innerWidth - pickerWidth - padding
                    }
                    if (left < padding) {
                      left = padding
                    }
                    
                    return {
                      top: `${top}px`,
                      left: `${left}px`,
                    }
                  })()}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={() => setDatePickerMonth(subMonths(datePickerMonth, 1))}
                      className="p-0.5 hover:bg-neutral-light rounded"
                    >
                      <FiChevronLeft size={14} className="text-neutral-dark" />
                    </button>
                    <span className="text-sm font-semibold text-neutral-dark">
                      {format(datePickerMonth, 'MMMM yyyy')}
                    </span>
                    <button
                      onClick={() => setDatePickerMonth(addMonths(datePickerMonth, 1))}
                      className="p-0.5 hover:bg-neutral-light rounded"
                    >
                      <FiChevronRight size={14} className="text-neutral-dark" />
                    </button>
                  </div>

                  {/* Days of Week - Mon to Sun */}
                  <div className="grid grid-cols-7 gap-0.5 mb-1.5">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                      <div key={day} className="text-center text-xs font-medium text-neutral-dark/70 py-0.5">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-0.5">
                    {(() => {
                      const monthStart = startOfMonth(datePickerMonth)
                      const monthEnd = endOfMonth(datePickerMonth)
                      const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
                      const calendarEnd = addDays(startOfWeek(monthEnd, { weekStartsOn: 1 }), 6)
                      const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

                      return calendarDays.map((day) => {
                        const isCurrentMonth = isSameMonth(day, datePickerMonth)
                        const isCurrentDate = isToday(day)
                        const isSelected = isSameDay(day, currentDate)
                        const dayNumber = format(day, 'd')
                        
                        // Check if this day has events
                        const hasEvents = scheduledItems.some(item => {
                          if (!item.schedule?.day) return false
                          const itemDate = new Date(item.schedule.day)
                          return isSameDay(itemDate, day)
                        })

                        return (
                          <button
                            key={day.toString()}
                            onClick={() => {
                              setCurrentDate(day)
                              setIsDatePickerOpen(false)
                            }}
                            className={`
                              w-7 h-7 text-xs rounded-full flex items-center justify-center relative transition-colors font-medium
                              ${!isCurrentMonth ? 'text-neutral-dark/30' : 'text-neutral-dark'}
                              ${isSelected 
                                ? 'bg-secondary text-white font-semibold' 
                                : isCurrentDate 
                                ? 'font-semibold text-white' 
                                : hasEvents && !isSelected
                                ? 'bg-amber-50 hover:bg-amber-100'
                                : 'hover:bg-neutral-light'
                              }
                            `}
                            style={isCurrentDate && !isSelected ? { backgroundColor: '#B084CC' } : undefined}
                          >
                            {dayNumber}
                            {isSelected && (
                              <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-0.5 h-0.5 bg-white rounded-full" />
                            )}
                          </button>
                        )
                      })
                    })()}
                  </div>
                </div>
              )}
            </div>
            {/* Two Arrows Together - After Date */}
            <div className="flex items-center gap-0">
              <button
                onClick={() => handleDateChange('prev')}
                className="p-1 rounded transition-colors"
                style={{ color: '#1F271B' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <FiChevronLeft size={14} />
              </button>
              <button
                onClick={() => handleDateChange('next')}
                className="p-1 rounded transition-colors"
                style={{ color: '#1F271B' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <FiChevronRight size={14} />
              </button>
            </div>
            {/* Today Button - After Arrows */}
            <button
              onClick={() => handleDateChange('today')}
              className="px-2 py-1 text-sm font-medium rounded transition-colors"
              style={{ color: '#1F271B' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              Today
            </button>
          </div>

          {/* Right Side - View Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* View Tabs */}
            <div className="flex items-center border rounded overflow-hidden" style={{ borderColor: '#EAEBED' }}>
            <button
                onClick={() => setView('month')}
                className={`px-2 py-1 text-sm font-medium transition-colors ${
                  view === 'month' 
                    ? 'text-white' 
                    : 'hover:bg-opacity-50'
                }`}
                style={view === 'month' 
                  ? { backgroundColor: '#2B50AA' }
                  : { color: '#1F271B', opacity: 0.7, backgroundColor: 'transparent' }
                }
                onMouseEnter={(e) => {
                  if (view !== 'month') {
                    e.currentTarget.style.backgroundColor = '#F3F4F6'
                  }
                }}
                onMouseLeave={(e) => {
                  if (view !== 'month') {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                Month
            </button>
            <button
              onClick={() => setView('week')}
                className={`px-2 py-1 text-sm font-medium transition-colors border-l ${
                  view === 'week' 
                    ? 'text-white' 
                    : 'hover:bg-opacity-50'
              }`}
              style={view === 'week' 
                ? { backgroundColor: '#2B50AA', borderLeftColor: '#EAEBED' }
                : { color: '#1F271B', opacity: 0.7, backgroundColor: 'transparent', borderLeftColor: '#EAEBED' }
              }
              onMouseEnter={(e) => {
                if (view !== 'week') {
                  e.currentTarget.style.backgroundColor = '#F3F4F6'
                }
              }}
              onMouseLeave={(e) => {
                if (view !== 'week') {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              Week
            </button>
            <button
                onClick={() => setView('day')}
                className={`px-2 py-1 text-sm font-medium transition-colors border-l ${
                  view === 'day' 
                    ? 'text-white' 
                    : 'hover:bg-opacity-50'
                }`}
                style={view === 'day' 
                  ? { backgroundColor: '#2B50AA', borderLeftColor: '#EAEBED' }
                  : { color: '#1F271B', opacity: 0.7, backgroundColor: 'transparent', borderLeftColor: '#EAEBED' }
                }
                onMouseEnter={(e) => {
                  if (view !== 'day') {
                    e.currentTarget.style.backgroundColor = '#F3F4F6'
                  }
                }}
                onMouseLeave={(e) => {
                  if (view !== 'day') {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                Day
              </button>
            </div>
            {/* Unscheduled - same size/height as Day/Week/Month; tooltip via portal so it stays on screen */}
            <div className="relative flex items-center ml-1">
              <button
                ref={unscheduleButtonRef}
                onClick={() => setShowUnscheduled(!showUnscheduled)}
                className="px-2 py-1 rounded flex items-center justify-center flex-shrink-0 transition-colors text-sm"
                style={{ backgroundColor: '#28AFB0', minHeight: '28px' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1E8A8B'
                  setShowUnscheduledTooltip(true)
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#28AFB0'
                  setShowUnscheduledTooltip(false)
                }}
                title="Unscheduled"
              >
                <span className="relative inline-flex items-center justify-center">
                  <FiCalendar size={14} className="text-white" />
                  <FiX size={8} className="text-white absolute -top-0.5 -right-0.5" strokeWidth={3} />
                </span>
              </button>
              {showUnscheduledTooltip && unscheduleTooltipStyle && typeof document !== 'undefined' && createPortal(
                <div
                  className="fixed z-[200] px-2 py-1.5 rounded text-sm font-medium text-white whitespace-nowrap shadow-md pointer-events-none"
                  style={{
                    backgroundColor: '#1F271B',
                    left: unscheduleTooltipStyle.left,
                    top: unscheduleTooltipStyle.top,
                    transform: 'translate(-50%, 0)',
                  }}
                >
                  Unscheduled
                  {unscheduleTooltipStyle.above ? (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px]"
                      style={{ borderTopColor: '#1F271B' }}
                    />
                  ) : (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 bottom-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px]"
                      style={{ borderBottomColor: '#1F271B' }}
                    />
                  )}
                </div>,
                document.body
              )}
            </div>
            {/* Mobile Unscheduled Toggle - text fallback */}
            <button
              onClick={() => setShowUnscheduled(!showUnscheduled)}
              className="lg:hidden px-2 py-1 text-sm font-medium border rounded transition-colors"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              Unscheduled
            </button>
          </div>
        </div>

        {/* Filters Row - Below Find a Time */}
        <div className="flex items-center gap-1 mt-2">
          {/* Type Filter Dropdown */}
          <div ref={typeDropdownRef} className="relative flex items-center border rounded overflow-visible" style={{ borderColor: '#EAEBED' }}>
                <span className="px-2 py-1 text-sm font-medium bg-opacity-50" style={{ backgroundColor: '#F3F4F6', color: '#1F271B', opacity: 0.7 }}>Type</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsTypeDropdownOpen(!isTypeDropdownOpen)
                  }}
                  className={`px-2 py-1 text-sm font-medium flex items-center gap-1 transition-colors ${
                    selectedTypes.size === 2 
                      ? 'bg-white border-l' 
                      : 'hover:bg-opacity-50'
                  }`}
                  style={selectedTypes.size === 2 
                    ? { color: '#1F271B', borderLeftColor: '#EAEBED', backgroundColor: 'white' }
                    : { color: '#1F271B', opacity: 0.7, backgroundColor: 'transparent' }
                  }
                  onMouseEnter={(e) => {
                    if (selectedTypes.size !== 2) {
                      e.currentTarget.style.backgroundColor = '#F3F4F6'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedTypes.size !== 2) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  {selectedTypes.size === 2 ? 'All' : `${selectedTypes.size} selected`}
                  <FiChevronRight size={10} className={`transform transition-transform ${isTypeDropdownOpen ? 'rotate-90' : ''}`} />
                </button>
                {isTypeDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-xl z-[100] min-w-[180px]" style={{ borderColor: '#EAEBED' }}>
                    {/* Search Bar */}
                    <div className="p-1.5 border-b" style={{ borderColor: '#EAEBED' }}>
                      <input
                        type="text"
                        placeholder="Search types..."
                        value={typeSearchTerm}
                        onChange={(e) => setTypeSearchTerm(e.target.value)}
                        className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1"
                        style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    {/* Select all when not all selected; Clear only when all selected */}
                    <div className="px-2 py-1.5 border-b flex items-center justify-between" style={{ borderColor: '#EAEBED' }}>
                      <span className="text-sm font-medium" style={{ color: '#1F271B' }}>{selectedTypes.size} selected</span>
                      <button
                        onClick={() => selectedTypes.size === typeOptions.length ? clearTypeSelection() : setSelectedTypes(new Set(typeOptions.map(o => o.value)))}
                        className="text-sm font-medium underline"
                        style={{ color: '#28AFB0' }}
                      >
                        {selectedTypes.size === typeOptions.length ? 'Clear' : 'Select all'}
                      </button>
                    </div>
                    {/* Options: full-color circle (unchanged when selected) + selection marker on the right */}
                    <div className="max-h-40 overflow-y-auto">
                      {filteredTypeOptions.map((option) => {
                        const isSelected = selectedTypes.has(option.value)
                        return (
                          <div
                            key={option.value}
                            onClick={() => toggleTypeSelection(option.value)}
                            className="px-2 py-1.5 cursor-pointer flex items-center gap-2 transition-colors"
                            style={{ backgroundColor: 'transparent' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                          >
                            <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${option.circleColor}`} />
                            <span className="text-sm font-medium flex-1 min-w-0" style={{ color: '#1F271B' }}>{option.label}</span>
                            {isSelected && <FiCheck className="flex-shrink-0" size={16} style={{ color: '#28AFB0' }} strokeWidth={3} />}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
          {/* Team Filter Dropdown - same implementation as Type */}
          <div ref={teamDropdownRef} className="relative flex items-center border rounded overflow-visible" style={{ borderColor: '#EAEBED' }}>
            <span className="px-2 py-1 text-sm font-medium bg-opacity-50" style={{ backgroundColor: '#F3F4F6', color: '#1F271B', opacity: 0.7 }}>Team</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsTeamDropdownOpen(!isTeamDropdownOpen)
              }}
              className={`px-2 py-1 text-sm font-medium flex items-center gap-1 transition-colors ${
                selectedTeams.size === 0 || selectedTeams.size === teamOptions.length
                  ? 'bg-white border-l'
                  : 'hover:bg-opacity-50'
              }`}
              style={selectedTeams.size === 0 || selectedTeams.size === teamOptions.length
                ? { color: '#1F271B', borderLeftColor: '#EAEBED', backgroundColor: 'white' }
                : { color: '#1F271B', opacity: 0.7, backgroundColor: 'transparent' }
              }
              onMouseEnter={(e) => {
                if (selectedTeams.size > 0 && selectedTeams.size !== teamOptions.length) {
                  e.currentTarget.style.backgroundColor = '#F3F4F6'
                }
              }}
              onMouseLeave={(e) => {
                if (selectedTeams.size > 0 && selectedTeams.size !== teamOptions.length) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              {selectedTeams.size === 0 || selectedTeams.size === teamOptions.length ? 'All' : `${selectedTeams.size} selected`}
              <FiChevronRight size={10} className={`transform transition-transform ${isTeamDropdownOpen ? 'rotate-90' : ''}`} />
            </button>
            {isTeamDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-xl z-[100] min-w-[180px]" style={{ borderColor: '#EAEBED' }}>
                <div className="p-1.5 border-b" style={{ borderColor: '#EAEBED' }}>
                  <input
                    type="text"
                    placeholder="Search team..."
                    value={teamSearchTerm}
                    onChange={(e) => setTeamSearchTerm(e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1"
                    style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                {/* Select all when not all selected; Clear only when all selected */}
                <div className="px-2 py-1.5 border-b flex items-center justify-between" style={{ borderColor: '#EAEBED' }}>
                  <span className="text-sm font-medium" style={{ color: '#1F271B' }}>{selectedTeams.size} selected</span>
                  <button
                    onClick={() => selectedTeams.size === teamOptions.length ? clearTeamSelection() : selectAllTeams()}
                    className="text-sm font-medium underline"
                    style={{ color: '#28AFB0' }}
                  >
                    {selectedTeams.size === teamOptions.length ? 'Clear' : 'Select all'}
                  </button>
                </div>
                {/* Options: full-color circle + selection marker on the right; multiselect supported */}
                <div className="max-h-40 overflow-y-auto">
                  {filteredTeamOptions.map((option) => {
                    const isSelected = selectedTeams.has(option.value)
                    return (
                      <div
                        key={option.value}
                        onClick={() => toggleTeamSelection(option.value)}
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
        </div>
      </div>

      {/* Main Calendar Area */}
      <div className="flex-1 flex overflow-hidden relative w-full min-w-0">
        {/* Mobile Overlay */}
        {showUnscheduled && (
          <div 
            className="lg:hidden fixed inset-0 bg-neutral-dark/50 z-20"
            onClick={() => setShowUnscheduled(false)}
          />
        )}
        
        {/* Calendar Grid */}
        <div 
          className="flex-1 overflow-auto bg-white min-w-0 w-full relative"
          onClick={() => {
            if (selectedItem) {
              setSelectedItem(null)
              setSelectedItemPosition(undefined)
            }
          }}
        >
          {view === 'day' && (
            <div className="h-full flex flex-col" style={{ backgroundColor: '#F3F4F6' }}>
              {/* Day Header - fixed height so space below does not move when day changes */}
              <div className="sticky top-0 bg-white border-b z-20 px-3 py-2 flex items-center justify-between min-h-[44px]" style={{ borderColor: '#EAEBED' }}>
                {isToday(currentDate) ? (
                  <span className="inline-flex items-center rounded px-2 py-1 text-base font-medium text-white" style={{ backgroundColor: '#B084CC' }}>
                    {format(currentDate, 'EEE d')}
                  </span>
                ) : (
                  <h2 className="text-base font-medium" style={{ color: '#1F271B' }}>
                    {format(currentDate, 'EEE d')}
                  </h2>
                )}
              </div>

              {/* Timeline Grid */}
              <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col">
                  {/* Horizontal Time Labels Row - team spacer + Anytime column (frozen) + 00:00 to 23:00 */}
                  <div className="flex sticky top-0 bg-white border-b z-15 min-h-[40px] shrink-0" style={{ borderColor: '#EAEBED' }}>
                    <div className="w-48 flex-shrink-0 border-r" style={{ borderColor: '#EAEBED' }}></div>
                    {/* Anytime column header (frozen next to team); width matches body below */}
                    <div className={`flex-shrink-0 border-r flex items-center justify-center ${dayViewAnytimeExpanded ? 'w-64' : 'w-12'}`} style={{ borderColor: '#EAEBED', backgroundColor: '#FAFAF9' }}>
                      <span className="text-[13px] font-medium" style={{ color: '#1F271B' }}>Anytime</span>
                    </div>
                    {/* Time labels: 00:00 to 23:00 - 24 equal columns to match grid */}
                    <div className="flex-1 flex flex-nowrap items-stretch min-w-0">
                      {hours.map((hour) => (
                        <div
                          key={hour}
                          className="flex-1 min-w-0 border-r last:border-r-0 px-1.5 py-1 flex items-center justify-center shrink-0"
                          style={{ borderColor: '#EAEBED', minWidth: '2.75rem' }}
                        >
                          <span className="text-[13px] font-medium whitespace-nowrap" style={{ color: '#1F271B' }}>
                            {hour.toString().padStart(2, '0')}:00
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex">
                  {/* Team Members Column - Unassigned first, then members */}
                  {(() => {
                    const dayViewRowCount = 1 + allTeamMembers.length
                    const dayViewRowHeightPx = (hours.length * 60) / dayViewRowCount
                    return (
                  <div className="w-48 flex-shrink-0 border-r bg-white flex flex-col" style={{ borderColor: '#EAEBED' }}>
                    {/* Unassigned */}
                    <div className="px-2 py-2 flex items-center border-b flex-shrink-0" style={{ borderColor: '#EAEBED', minHeight: `${dayViewRowHeightPx}px` }}>
                      <div className="flex items-center gap-2">
                        <FiUsers size={14} style={{ color: '#1F271B', opacity: 0.7 }} />
                        <span className="text-sm" style={{ color: '#1F271B' }}>Unassigned</span>
                      </div>
                    </div>
                    {/* Each Team Member - no count */}
                    {allTeamMembers.map((member) => {
                      const memberItems = scheduledItems.filter(item =>
                        item.assignedTeamMember === member.name &&
                        item.schedule?.day &&
                        isSameDay(new Date(item.schedule.day), currentDate)
                      )
                      return (
                        <div
                          key={member.id}
                          className="px-2 py-2 flex items-center border-b last:border-b-0 flex-shrink-0"
                          style={{ borderColor: '#EAEBED', minHeight: `${dayViewRowHeightPx}px` }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F3F4F6' }}>
                              <span className="text-sm font-medium" style={{ color: '#1F271B' }}>{getInitials(member.name)}</span>
                            </div>
                            <span className="text-sm" style={{ color: '#1F271B' }}>{member.name}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                    )
                  })()}

                  {/* Anytime column (frozen): counts per row; click expands to show unscheduled list */}
                  {(() => {
                    const dayViewRowCount = 1 + allTeamMembers.length
                    const dayViewRowHeightPx = (hours.length * 60) / dayViewRowCount
                    const unassignedAnytimeCount = unscheduledItems.filter(i => !i.assignedTeamMember).length
                    if (dayViewAnytimeExpanded) {
                      return (
                        <div className="w-64 flex-shrink-0 border-r bg-white flex flex-col overflow-hidden" style={{ borderColor: '#EAEBED', backgroundColor: '#FAFAF9' }}>
                          <div className="flex items-center justify-between px-2 py-2 border-b flex-shrink-0" style={{ borderColor: '#EAEBED' }}>
                            <span className="text-sm font-semibold" style={{ color: '#1F271B' }}>Anytime</span>
                            <button type="button" onClick={() => setDayViewAnytimeExpanded(false)} className="p-0.5 rounded hover:bg-gray-200/80" style={{ color: '#1F271B' }} aria-label="Close">
                              <FiX size={16} />
                            </button>
                          </div>
                          <div className="flex-1 overflow-y-auto p-2 min-h-0">
                            {unscheduledItems.length === 0 ? (
                              <p className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>No unscheduled items</p>
                            ) : (
                              <div className="space-y-1.5">
                                {unscheduledItems.map((item) => (
                                  <div
                                    key={item.id}
                                    draggable
                                    onDragStart={(e) => {
                                      e.stopPropagation()
                                      e.dataTransfer.setData('application/x-schedule-item', JSON.stringify({ id: item.id }))
                                      e.dataTransfer.effectAllowed = 'move'
                                      e.dataTransfer.setDragImage(e.currentTarget, 0, 0)
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedItem(item)
                                      setSelectedItemPosition({ x: e.clientX, y: e.clientY })
                                    }}
                                    className="flex items-center gap-2 rounded p-2 cursor-grab active:cursor-grabbing hover:shadow-sm transition-all border-l-2 bg-blue-50"
                                    style={{ borderLeftColor: '#2B50AA' }}
                                  >
                                    {item.clientName && (
                                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium" style={{ backgroundColor: '#E5E7EB', color: '#1F271B' }}>
                                        {getInitials(item.clientName)}
                                      </div>
                                    )}
                                    <span className="text-xs font-medium truncate flex-1 min-w-0" style={{ color: '#1F271B' }}>
                                      {[item.clientName, item.title].filter(Boolean).join(' – ')}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    }
                    return (
                      <div
                        className="w-12 flex-shrink-0 border-r flex flex-col cursor-pointer hover:bg-gray-100/80 transition-colors"
                        style={{ borderColor: '#EAEBED', backgroundColor: '#FAFAF9' }}
                        onClick={() => setDayViewAnytimeExpanded(true)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setDayViewAnytimeExpanded(true) } }}
                      >
                        <div className="flex items-center justify-center border-b flex-shrink-0" style={{ borderColor: '#EAEBED', minHeight: `${dayViewRowHeightPx}px` }}>
                          <span className="text-sm font-semibold" style={{ color: '#28AFB0' }}>{unassignedAnytimeCount}</span>
                        </div>
                        {allTeamMembers.map((member) => {
                          const count = unscheduledItems.filter(i => i.assignedTeamMember === member.name).length
                          return (
                            <div
                              key={member.id}
                              className="flex items-center justify-center border-b last:border-b-0 flex-shrink-0"
                              style={{ borderColor: '#EAEBED', minHeight: `${dayViewRowHeightPx}px` }}
                            >
                              <span className="text-sm font-semibold" style={{ color: '#28AFB0' }}>{count}</span>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}

                  {/* Main grid: 24 cols (00:00 to 23:00), rows = Unassigned + team members - aligns with time row above */}
                  {(() => {
                    const dayViewRowCount = 1 + allTeamMembers.length
                    const dayViewRowHeightPx = (hours.length * 60) / dayViewRowCount
                    const totalGridHeight = dayViewRowCount * dayViewRowHeightPx
                    const totalCols = hours.length
                    return (
                  <div className="flex-1 relative min-w-0" style={{ minHeight: `${totalGridHeight}px` }}>
                    <div
                      className="absolute inset-0 grid bg-white"
                      style={{
                        gridTemplateColumns: `repeat(${totalCols}, minmax(0, 1fr))`,
                        gridTemplateRows: `repeat(${dayViewRowCount}, ${dayViewRowHeightPx}px)`,
                        borderLeft: '1px solid #EAEBED',
                      }}
                    >
                      {[...Array(dayViewRowCount * totalCols)].map((_, i) => {
                        const rowIndex = Math.floor(i / totalCols)
                        const colIndex = i % totalCols
                        return (
                          <div
                            key={i}
                            className={`cursor-pointer hover:bg-gray-50/80 transition-colors ${colIndex === 0 ? 'border-l' : ''} ${rowIndex === 0 ? 'border-t' : ''} border-r border-b`}
                            style={{ borderColor: '#EAEBED' }}
                            onClick={(e) => {
                              e.stopPropagation()
                              const rect = e.currentTarget.getBoundingClientRect()
                              const offsetYInCell = e.clientY - rect.top
                              const cellHeight = rect.height
                              let minute = Math.floor((offsetYInCell / cellHeight) * 60)
                              minute = Math.ceil(minute / 15) * 15
                              if (minute >= 60) minute = 0
                              const hour = hours[colIndex]
                              const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
                              const ampm = hour >= 12 ? 'PM' : 'AM'
                              const formattedTime = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`
                              setModalInitialDate(new Date(currentDate))
                              setModalInitialTime(formattedTime)
                              setModalPosition(undefined)
                              setIsAddWorkorderOpen(true)
                            }}
                            onDragOver={(e) => {
                              e.preventDefault()
                              e.dataTransfer.dropEffect = 'move'
                            }}
                            onDrop={(e) => {
                              e.preventDefault()
                              const json = e.dataTransfer.getData('application/x-schedule-item')
                              if (!json) return
                              const { id } = JSON.parse(json) as { id: number }
                              const item = workOrders.find(w => w.id === id)
                              if (!item) return
                              const rect = e.currentTarget.getBoundingClientRect()
                              const offsetYInCell = e.clientY - rect.top
                              const cellHeight = rect.height
                              let minute = Math.floor((offsetYInCell / cellHeight) * 60)
                              minute = Math.ceil(minute / 15) * 15
                              if (minute >= 60) minute = 0
                              const hour = hours[colIndex]
                              const newStart = toScheduleTime(hour, minute)
                              const dayStr = format(currentDate, 'yyyy-MM-dd')
                              const assignee = rowIndex === 0 ? '' : allTeamMembers[rowIndex - 1]?.name ?? item.assignedTeamMember
                              if (item.schedule?.day && item.schedule?.startTime && item.schedule?.endTime) {
                                const oldStartM = parseInt(item.schedule.startTime.split(':')[0]) * 60 + parseInt(item.schedule.startTime.split(':')[1])
                                const oldEndM = parseInt(item.schedule.endTime.split(':')[0]) * 60 + parseInt(item.schedule.endTime.split(':')[1])
                                const durationM = oldEndM - oldStartM
                                const newEndM = hour * 60 + minute + durationM
                                const newEnd = toScheduleTime(Math.floor(newEndM / 60), newEndM % 60)
                                updateWorkOrder(id, {
                                  assignedTeamMember: assignee || undefined,
                                  schedule: { ...item.schedule, day: dayStr, startTime: newStart, endTime: newEnd },
                                })
                              } else {
                                const endM = hour * 60 + minute + 60
                                const newEnd = toScheduleTime(Math.min(23, Math.floor(endM / 60)), endM % 60)
                                updateWorkOrder(id, {
                                  assignedTeamMember: assignee || undefined,
                                  schedule: { day: dayStr, startTime: newStart, endTime: newEnd },
                                })
                              }
                            }}
                          />
                        )
                      })}
                    </div>
                    {/* Current time line - vertical line at current time */}
                    {showCurrentTimeDay && (
                      <div
                        className="absolute top-0 bottom-0 z-20 flex items-center pointer-events-none"
                        style={{
                          left: `${((currentHour * 60 + currentMinute) / (hours.length * 60)) * 100}%`,
                          width: 0,
                        }}
                      >
                        <div className="w-0.5 h-full bg-red-500" />
                        <span className="absolute left-1 top-1 text-xs font-medium text-red-600 bg-white/90 px-1.5 py-0.5 rounded whitespace-nowrap">
                          Now {format(now, 'HH:mm')}
                        </span>
                      </div>
                    )}
                    {/* Event blocks - one per resource row, positioned by time; lines align with grid */}
                    <div className="absolute inset-0 pointer-events-none p-0.5" style={{ zIndex: 10 }}>
                      {(() => {
                        const dayItems = scheduledItems
                          .filter(item => item.schedule?.day && item.schedule?.startTime && isSameDay(new Date(item.schedule.day), currentDate))
                          .sort((a, b) => {
                            const aMin = parseInt(a.schedule!.startTime.split(':')[0]) * 60 + parseInt(a.schedule!.startTime.split(':')[1])
                            const bMin = parseInt(b.schedule!.startTime.split(':')[0]) * 60 + parseInt(b.schedule!.startTime.split(':')[1])
                            return aMin - bMin
                          })
                        const totalMinutesInDay = hours.length * 60 // 24 * 60
                        const gridStartMinutes = 0
                        const gridEndMinutes = 24 * 60
                        return dayItems.map((item, index) => {
                          const startMinutes = parseInt(item.schedule!.startTime.split(':')[0]) * 60 + parseInt(item.schedule!.startTime.split(':')[1])
                          const endMinutes = parseInt(item.schedule!.endTime.split(':')[0]) * 60 + parseInt(item.schedule!.endTime.split(':')[1])
                          const visibleStart = Math.max(gridStartMinutes, startMinutes)
                          const visibleEnd = Math.min(gridEndMinutes, endMinutes)
                          const visibleDuration = Math.max(15, visibleEnd - visibleStart)
                          const rowIndex = !item.assignedTeamMember ? 0 : (1 + allTeamMembers.findIndex(m => m.name === item.assignedTeamMember))
                          const safeRowIndex = rowIndex < 0 ? 0 : rowIndex
                          const topPx = safeRowIndex * dayViewRowHeightPx
                          const heightPx = dayViewRowHeightPx
                          const timeFrac = (visibleStart - gridStartMinutes) / totalMinutesInDay
                          const widthTimeFrac = visibleDuration / totalMinutesInDay
                          const leftPct = timeFrac * 100
                          const widthPct = widthTimeFrac * 100
                          let bgColor = 'bg-blue-50'
                          let borderLeftColor = '#2B50AA'
                          const itemType = (item as any).type
                          if (itemType === 'visits') {
                            bgColor = 'bg-blue-50'
                            borderLeftColor = '#2B50AA'
                          } else if (itemType === 'tasks') {
                            bgColor = 'bg-purple-100'
                            borderLeftColor = '#B084CC'
                          } else if (itemType === 'events') {
                            bgColor = 'bg-yellow-50'
                            borderLeftColor = '#F59E0B'
                          }
                          return (
                            <div
                              key={item.id}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('application/x-schedule-item', JSON.stringify({ id: item.id }))
                                e.dataTransfer.effectAllowed = 'move'
                                e.dataTransfer.setDragImage(e.currentTarget, 0, 0)
                              }}
                              className={`absolute rounded overflow-hidden ${bgColor} cursor-grab active:cursor-grabbing hover:shadow-md transition-all pointer-events-auto`}
                              style={{
                                borderLeft: `3px solid ${borderLeftColor}`,
                                top: `${topPx}px`,
                                left: `${leftPct}%`,
                                width: `${widthPct}%`,
                                height: `${heightPx}px`,
                                zIndex: 10 + index,
                              }}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedItem(item)
                                setSelectedItemPosition({ x: e.clientX, y: e.clientY })
                              }}
                            >
                              <div className="flex flex-col justify-center gap-0.5 h-full px-2 py-1.5 min-w-0 pointer-events-none">
                                <span className="text-xs font-semibold truncate min-w-0" style={{ color: '#1F271B' }} title={item.clientName}>{item.clientName || ''}</span>
                                {item.title && (
                                  <span className="text-xs truncate min-w-0" style={{ color: '#1F271B', opacity: 0.9 }} title={item.title}>{item.title}</span>
                                )}
                                {item.schedule?.startTime && (
                                  <span className="text-xs truncate min-w-0" style={{ color: '#1F271B', opacity: 0.85 }}>{formatTime(item.schedule.startTime)}</span>
                                )}
                              </div>
                              {/* Resize handle - top edge (change start time) */}
                              <div
                                className="absolute top-0 left-0 right-0 h-1.5 cursor-ns-resize hover:bg-black/10 rounded-t pointer-events-auto"
                                onMouseDown={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setResizeState({
                                    itemId: item.id,
                                    edge: 'top',
                                    startY: e.clientY,
                                    startEndMinutes: endMinutes,
                                    startStartMinutes: startMinutes,
                                    scheduleDay: item.schedule!.day,
                                    pixelsPerHour: 60,
                                  })
                                }}
                              />
                              {/* Resize handle - bottom edge (change end time) */}
                              <div
                                className="absolute bottom-0 left-0 right-0 h-1.5 cursor-ns-resize hover:bg-black/10 rounded-b pointer-events-auto"
                                onMouseDown={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setResizeState({
                                    itemId: item.id,
                                    edge: 'bottom',
                                    startY: e.clientY,
                                    startEndMinutes: endMinutes,
                                    startStartMinutes: startMinutes,
                                    scheduleDay: item.schedule!.day,
                                    pixelsPerHour: 60,
                                  })
                                }}
                              />
                            </div>
                          )
                        })
                      })()}
                    </div>
                  </div>
                    )
                  })()}
                </div>
              </div>
            </div>
          </div>
          )}

      {view === 'week' && (
            <div className="h-full flex flex-col">
              {/* Week Header - same column widths as time grid below for aligned vertical lines */}
              <div className="grid border-b sticky top-0 bg-white z-20 w-full shrink-0" style={{ gridTemplateColumns: '60px repeat(7, minmax(0, 1fr))', borderColor: '#EAEBED' }}>
                <div className="p-1.5 border-r flex items-center justify-center" style={{ borderColor: '#EAEBED' }}></div>
            {weekDays.map((day) => (
              <div
                key={day.toString()}
                    className={`p-1.5 text-center border-r last:border-r-0 flex items-center justify-center ${
                      isToday(day) ? '' : ''
                    }`}
                    style={{ borderColor: '#EAEBED' }}
                  >
                    {isToday(day) ? (
                      <div className="rounded px-2 py-1 inline-flex items-center justify-center gap-0.5" style={{ backgroundColor: '#B084CC' }}>
                        <span className="text-xs text-white font-medium">{format(day, 'EEE')}</span>
                        <span className="text-sm font-semibold text-white">
                          {format(day, 'd')}
                        </span>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs mb-0.5" style={{ color: '#1F271B', opacity: 0.7 }}>{format(day, 'EEE')}</p>
                        <p className="text-sm font-semibold" style={{ color: '#1F271B' }}>
                  {format(day, 'd')}
                </p>
                      </>
                    )}
              </div>
            ))}
          </div>

              {/* Time Grid - same gridTemplateColumns as header so vertical lines align */}
              <div className="flex-1 overflow-y-auto overflow-x-auto bg-white">
                <div className="grid w-full min-w-0" style={{ gridTemplateColumns: '60px repeat(7, minmax(0, 1fr))' }}>
                  {/* Time Column */}
                  <div className="border-r flex-shrink-0 bg-[#FAFAFA]" style={{ borderColor: '#EAEBED' }}>
                    <div className="p-1.5 text-sm font-medium border-b" style={{ color: '#1F271B', opacity: 0.7, borderColor: '#EAEBED' }}>↓ Anytime</div>
            {hours.map((hour) => (
                      <div
                        key={hour}
                        className="border-b relative"
                        style={{ minHeight: '48px', borderColor: '#EAEBED' }}
                      >
                        <div className="absolute top-1 left-1.5 text-[13px] whitespace-nowrap" style={{ color: '#1F271B', opacity: 0.65 }}>
                          {hour.toString().padStart(2, '0')}:00
                </div>
                        {/* Current time indicator */}
                        {isToday(currentDate) && hour === currentHour && (
                          <div 
                            className="absolute left-0 right-0 border-t-2 border-red-500 z-20"
                            style={{ top: `${(currentMinute / 60) * 48}px` }}
                          >
                            <div className="absolute -left-1 -top-1 w-0 h-0 border-l-[5px] border-l-red-500 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Day Columns */}
                  {weekDays.map((day) => (
                    <div
                      key={day.toString()}
                      className="border-r last:border-r-0 relative overflow-hidden bg-white"
                      style={{ minHeight: `${hours.length * 48}px`, borderColor: '#EAEBED' }}
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.dataTransfer.dropEffect = 'move'
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        const json = e.dataTransfer.getData('application/x-schedule-item')
                        if (!json) return
                        const { id } = JSON.parse(json) as { id: number }
                        const item = workOrders.find(w => w.id === id)
                        if (!item) return
                        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
                        const offsetY = e.clientY - rect.top
                        const { hour, minute } = parseYToTime(Math.max(0, offsetY), 48)
                        const newStart = toScheduleTime(hour, minute)
                        const dayStr = format(day, 'yyyy-MM-dd')
                        if (item.schedule?.day && item.schedule?.startTime && item.schedule?.endTime) {
                          const oldStartM = parseInt(item.schedule.startTime.split(':')[0]) * 60 + parseInt(item.schedule.startTime.split(':')[1])
                          const oldEndM = parseInt(item.schedule.endTime.split(':')[0]) * 60 + parseInt(item.schedule.endTime.split(':')[1])
                          const durationM = oldEndM - oldStartM
                          const newEndM = hour * 60 + minute + durationM
                          const newEnd = toScheduleTime(Math.floor(newEndM / 60), newEndM % 60)
                          updateWorkOrder(id, {
                            schedule: { ...item.schedule, day: dayStr, startTime: newStart, endTime: newEnd },
                          })
                        } else {
                          const endM = hour * 60 + minute + 60
                          const newEnd = toScheduleTime(Math.min(23, Math.floor(endM / 60)), endM % 60)
                          updateWorkOrder(id, {
                            schedule: { day: dayStr, startTime: newStart, endTime: newEnd },
                          })
                        }
                      }}
                    >
                      {/* Clickable time grid: click to open add modal with time snapped to 15 min */}
                      <div
                        className="absolute inset-0 z-0 cursor-pointer"
                        style={{ height: `${hours.length * 48}px` }}
                        onClick={(e) => {
                          e.stopPropagation()
                          const rect = e.currentTarget.getBoundingClientRect()
                          const offsetY = e.clientY - rect.top
                          const formattedTime = getTimeFromClick(Math.max(0, offsetY), 48)
                          setModalInitialDate(new Date(day))
                          setModalInitialTime(formattedTime)
                          setModalPosition(undefined)
                          setIsAddWorkorderOpen(true)
                        }}
                      />
                      {/* Current time line - week view (when viewing today) */}
                      {showCurrentTimeWeek(day) && (
                        <div
                          className="absolute left-0 right-0 z-20 flex items-center gap-0.5 pointer-events-none"
                          style={{ top: `${currentTimeTopWeek}px` }}
                        >
                          <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[6px] border-l-red-500 shrink-0" />
                          <div className="h-0.5 flex-1 bg-red-500" />
                          <span className="text-[10px] font-medium text-red-600 bg-white/90 px-1 py-0.5 rounded shrink-0">
                            Now
                          </span>
                        </div>
                      )}
                      {/* Internal horizontal lines - one per hour; same color as day view for alignment */}
                      <div className="absolute inset-0 pointer-events-none flex flex-col">
                        {hours.map((hour) => (
                          <div key={hour} className="border-b" style={{ minHeight: '48px', borderColor: '#EAEBED' }} />
                        ))}
                      </div>
                      {/* Render all events for this day positioned absolutely */}
                      {(() => {
                        const dayItems = scheduledItems.filter(item => {
                          if (!item.schedule?.day || !item.schedule?.startTime) return false
                          const itemDate = new Date(item.schedule.day)
                          return isSameDay(itemDate, day)
                        })

                        // Sort items by start time to ensure proper rendering order
                        const sortedItems = [...dayItems].sort((a, b) => {
                          const aTime = parseInt(a.schedule.startTime.split(':')[0]) * 60 + parseInt(a.schedule.startTime.split(':')[1])
                          const bTime = parseInt(b.schedule.startTime.split(':')[0]) * 60 + parseInt(b.schedule.startTime.split(':')[1])
                          return aTime - bTime
                        })

                        const gridStartMinutes = 0
                        const gridEndMinutes = 24 * 60
                        return sortedItems.map((item, index) => {
                          const startMinutes = parseInt(item.schedule.startTime.split(':')[0]) * 60 + parseInt(item.schedule.startTime.split(':')[1])
                          const endMinutes = parseInt(item.schedule.endTime.split(':')[0]) * 60 + parseInt(item.schedule.endTime.split(':')[1])
                          const visibleStart = Math.max(gridStartMinutes, startMinutes)
                          const visibleEnd = Math.min(gridEndMinutes, endMinutes)
                          const visibleDurationMinutes = Math.max(15, visibleEnd - visibleStart)
                          // Position from top of timeline (0:00 = 0), clamp to grid
                          const topPosition = ((visibleStart - gridStartMinutes) / 60) * 48
                          const height = (visibleDurationMinutes / 60) * 48

                          // Determine event color based on type or use default
                          let bgColor = 'bg-blue-50'
                          let borderLeftColor = '#2B50AA' // Sapphire for visits
                          
                          const itemType = (item as any).type
                          if (itemType === 'visits') {
                            bgColor = 'bg-blue-50' // Light blue background
                            borderLeftColor = '#2B50AA' // Darker blue left bar (Sapphire)
                          } else if (itemType === 'tasks') {
                            bgColor = 'bg-purple-100' // Darker purple background
                            borderLeftColor = '#B084CC' // Darker purple left bar (Amethyst Smoke)
                          } else if (itemType === 'events') {
                            bgColor = 'bg-yellow-50'
                            borderLeftColor = '#F59E0B' // Amber/yellow
                          }

                          return (
                            <div
                              key={item.id}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('application/x-schedule-item', JSON.stringify({ id: item.id }))
                                e.dataTransfer.effectAllowed = 'move'
                                e.dataTransfer.setDragImage(e.currentTarget, 0, 0)
                              }}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedItem(item)
                                setSelectedItemPosition({ x: e.clientX, y: e.clientY })
                              }}
                              className={`absolute rounded overflow-hidden ${bgColor} cursor-grab active:cursor-grabbing hover:shadow-md transition-all`}
                              style={{
                                left: '4px',
                                right: '4px',
                                top: `${topPosition}px`,
                                height: `${height}px`,
                                minHeight: '32px',
                                borderLeft: `3px solid ${borderLeftColor}`,
                                padding: '6px 8px',
                                zIndex: 10 + index
                              }}
                            >
                              <div className="flex flex-col justify-center gap-0.5 h-full w-full min-w-0 overflow-hidden pointer-events-none">
                                <span className="text-xs font-semibold truncate min-w-0" style={{ color: '#1F271B' }} title={item.clientName}>{item.clientName || ''}</span>
                                {item.title && (
                                  <span className="text-xs truncate min-w-0" style={{ color: '#1F271B', opacity: 0.9 }} title={item.title}>{item.title}</span>
                                )}
                                {item.schedule?.startTime && (
                                  <span className="text-xs truncate min-w-0" style={{ color: '#1F271B', opacity: 0.85 }}>{formatTime(item.schedule.startTime)}</span>
                                )}
                              </div>
                              {/* Resize - top edge */}
                              <div
                                className="absolute top-0 left-0 right-0 h-1.5 cursor-ns-resize hover:bg-black/10 rounded-t pointer-events-auto"
                                onMouseDown={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setResizeState({
                                    itemId: item.id,
                                    edge: 'top',
                                    startY: e.clientY,
                                    startEndMinutes: endMinutes,
                                    startStartMinutes: startMinutes,
                                    scheduleDay: item.schedule.day,
                                    pixelsPerHour: 48,
                                  })
                                }}
                              />
                              {/* Resize - bottom edge */}
                              <div
                                className="absolute bottom-0 left-0 right-0 h-1.5 cursor-ns-resize hover:bg-black/10 rounded-b pointer-events-auto"
                                onMouseDown={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setResizeState({
                                    itemId: item.id,
                                    edge: 'bottom',
                                    startY: e.clientY,
                                    startEndMinutes: endMinutes,
                                    startStartMinutes: startMinutes,
                                    scheduleDay: item.schedule.day,
                                    pixelsPerHour: 48,
                                  })
                                }}
                              />
                            </div>
                          )
                        })
                      })()}
              </div>
            ))}
                </div>
          </div>
        </div>
      )}

          {view === 'month' && (
            <div className="h-full flex flex-col p-3" style={{ backgroundColor: '#F3F4F6' }}>
              {/* Month Calendar Grid - header and cells use same 7-col grid for aligned lines */}
        <div className="bg-white rounded shadow-sm border overflow-hidden" style={{ borderColor: '#EAEBED' }}>
                {/* Day Headers - Mon to Sun; highlight today's column only when viewing current month */}
                <div className="grid grid-cols-7 border-b bg-white shrink-0" style={{ borderColor: '#EAEBED' }}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                    const today = new Date()
                    const currentDayOfWeek = getDay(today) // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
                    const isCurrentDay = (currentDayOfWeek + 6) % 7 === index
                    const isViewingCurrentMonth = isSameMonth(currentDate, today)
                    const highlightDay = isCurrentDay && isViewingCurrentMonth
                    return (
                      <div
                        key={day}
                        className={`p-2 text-center border-r last:border-r-0 ${
                          highlightDay ? 'rounded-t' : ''
                        }`}
                        style={{ borderColor: '#EAEBED', backgroundColor: highlightDay ? '#B084CC' : 'white' }}
                      >
                        <span className={`text-xs font-medium ${
                          highlightDay ? 'text-white' : ''
                        }`}
                        style={!highlightDay ? { color: '#1F271B' } : {}}
                        >
                          {day}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Calendar Grid - same 7 columns so vertical lines align with header */}
                <div className="grid grid-cols-7" style={{ borderColor: '#EAEBED' }}>
                  {(() => {
                    const monthStart = startOfMonth(currentDate)
                    const monthEnd = endOfMonth(currentDate)
                    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
                    const calendarEnd = addDays(startOfWeek(monthEnd, { weekStartsOn: 1 }), 6)
                    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

                    return calendarDays.map((day, index) => {
                      const isCurrentMonth = isSameMonth(day, currentDate)
                      const isCurrentDate = isToday(day)
                      const dayNumber = format(day, 'd')
                      
                      // Get events for this day
                      const dayEvents = scheduledItems.filter(item => {
                        if (!item.schedule?.day) return false
                        const itemDate = new Date(item.schedule.day)
                        return isSameDay(itemDate, day)
                      })

                      return (
                        <div
                          key={day.toString()}
                          className={`min-h-[80px] border-r border-b last:border-r-0 p-1.5 cursor-pointer ${
                            isCurrentMonth ? 'bg-white' : 'bg-[#F9FAFB]'
                          }`}
                          style={{ borderColor: '#EAEBED' }}
                          onClick={(e) => {
                            if ((e.target as HTMLElement).closest('[data-draggable-event]')) return
                            setModalInitialDate(day)
                            setModalInitialTime(undefined)
                            setModalPosition({ x: e.clientX, y: e.clientY })
                            setIsAddWorkorderOpen(true)
                          }}
                          onDragOver={(e) => {
                            e.preventDefault()
                            e.dataTransfer.dropEffect = 'move'
                          }}
                          onDrop={(e) => {
                            e.preventDefault()
                            const json = e.dataTransfer.getData('application/x-schedule-item')
                            if (!json) return
                            const { id } = JSON.parse(json) as { id: number }
                            const item = workOrders.find(w => w.id === id)
                            if (!item) return
                            const dayStr = format(day, 'yyyy-MM-dd')
                            if (item.schedule?.day && item.schedule?.startTime && item.schedule?.endTime) {
                              updateWorkOrder(id, {
                                schedule: { ...item.schedule, day: dayStr },
                              })
                            } else {
                              updateWorkOrder(id, {
                                schedule: { day: dayStr, startTime: '09:00', endTime: '10:00' },
                              })
                            }
                          }}
                        >
                          {/* Date Number */}
                          <div className="flex items-center justify-between mb-0.5">
                            <span
                              className={`text-xs font-medium ${
                                isCurrentDate
                                  ? 'w-5 h-5 rounded-full border-2 flex items-center justify-center'
                                  : ''
                              }`}
                              style={isCurrentDate 
                                ? { borderColor: '#B084CC', color: '#B084CC' }
                                : isCurrentMonth
                                ? { color: '#1F271B' }
                                : { color: '#1F271B', opacity: 0.4 }
                              }
                            >
                              {dayNumber}
                            </span>
                  </div>
                          
                          {/* Events List */}
                          <div className="space-y-0.5 mt-0.5">
                            {dayEvents.slice(0, 3).map((item) => {
                              const itemType = (item as any).type
                              let bgColor = 'bg-blue-100'
                              let borderColor = '#2B50AA'
                              
                              if (itemType === 'visits') {
                                bgColor = 'bg-blue-100'
                                borderColor = '#2B50AA'
                              } else if (itemType === 'tasks') {
                                bgColor = 'bg-purple-100'
                                borderColor = '#B084CC'
                              } else if (itemType === 'events') {
                                bgColor = 'bg-yellow-100'
                                borderColor = '#F59E0B'
                              }

                              return (
                                <div
                                  key={item.id}
                                  data-draggable-event
                                  draggable
                                  onDragStart={(e) => {
                                    e.stopPropagation()
                                    e.dataTransfer.setData('application/x-schedule-item', JSON.stringify({ id: item.id }))
                                    e.dataTransfer.effectAllowed = 'move'
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedItem(item)
                                    setSelectedItemPosition({ x: e.clientX, y: e.clientY })
                                  }}
                                  className={`text-xs px-2 py-1 rounded overflow-hidden border-l-2 ${bgColor} cursor-grab active:cursor-grabbing hover:shadow-md min-w-0`}
                                  style={{ borderLeftColor: borderColor }}
                                >
                                  <span className="block truncate font-medium" style={{ color: '#1F271B' }} title={item.clientName}>{item.clientName}</span>
                                  {item.title && <span className="block truncate max-w-full" style={{ color: '#1F271B', opacity: 0.9 }} title={item.title}>{item.title}</span>}
                                  {item.schedule?.startTime && <span className="block font-medium mt-0.5" style={{ color: '#1F271B', opacity: 0.85 }}>{formatTime(item.schedule.startTime)}</span>}
                                </div>
                              )
                            })}
                            {dayEvents.length > 3 && (
                              <div className="text-xs px-1" style={{ color: '#1F271B', opacity: 0.6 }}>
                                +{dayEvents.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>
          </div>
        </div>
      )}
        </div>

        {/* Unscheduled Sidebar */}
        {showUnscheduled && (
          <div className={`${showUnscheduled ? 'flex' : 'hidden'} lg:flex w-64 max-w-[90vw] lg:max-w-none border-l border-neutral-light bg-white flex-col flex-shrink-0 fixed lg:relative right-0 top-0 bottom-0 z-30 lg:z-auto shadow-lg lg:shadow-none h-full`}>
            <div className="p-4 border-b border-neutral-light flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-dark">Unscheduled</span>
                <span className="text-sm text-neutral-dark/70">({unscheduledItems.length})</span>
              </div>
              <button
                onClick={() => setShowUnscheduled(false)}
                className="p-1 hover:bg-neutral-light rounded"
              >
                <FiX size={18} className="text-neutral-dark/70" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {unscheduledItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-lg bg-neutral-light flex items-center justify-center mb-4">
                    <FiCalendar className="text-neutral-dark/30" size={32} />
                  </div>
                  <p className="text-sm text-neutral-dark/70 mb-1">Drag items here to unschedule them</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {unscheduledItems.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/x-schedule-item', JSON.stringify({ id: item.id }))
                        e.dataTransfer.effectAllowed = 'move'
                        e.dataTransfer.setDragImage(e.currentTarget, 0, 0)
                      }}
                      className="p-3 bg-neutral-light rounded-lg border border-neutral-light cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow"
                    >
                      <p className="text-sm font-medium text-neutral-dark">{item.clientName}</p>
                      <p className="text-xs text-neutral-dark/70 mt-1">{item.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      </div>
    </div>
    {eventDetailModal}
    </>
  )
}
