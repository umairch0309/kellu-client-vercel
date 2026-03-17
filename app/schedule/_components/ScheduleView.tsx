'use client'

import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  FiX,
  FiCheckCircle,
  FiCheckSquare,
  FiUsers,
  FiPlus,
  FiEdit
} from 'react-icons/fi'
import { format, startOfWeek, addDays, isToday, isSameDay, startOfDay, getHours, getMinutes, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, getDay, subMonths, addMonths } from 'date-fns'
import { mockWorkorders, mockTeamMembers } from '@/data/mockData'
import AddWorkorderModal from '../../clients/_components/AddWorkorderModal'
import type { ScheduleItem } from './scheduleTypes'
import EventDetailModal from './EventDetailModal'
import UnscheduledSidebar from './UnscheduledSidebar'
import CalendarControls from './CalendarControls'
import AppSidebar from '../../../components/common/Sidebar'
import Header from '../../../components/common/Header'

export default function ScheduleView() {
  const router = useRouter()
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
    setWorkOrders(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w) as ScheduleItem[])
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
    const matchesType = selectedTypes.size === 0 || selectedTypes.size === 2 || ((item as any).type && selectedTypes.has((item as any).type))
    
    let matchesTeam = true
    if (selectedTeams.size > 0) {
      matchesTeam = (selectedTeams.has('unassigned') && (!item.assignedTeamMember || item.assignedTeamMember === '')) ||
        !!(item.assignedTeamMember && selectedTeams.has(item.assignedTeamMember))
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
    if (newSelected.size === 0) {
      setTypeFilter('all')
    } else if (newSelected.size === 2) {
      setTypeFilter('all')
    } else {
      const firstSelected = Array.from(newSelected)[0]
      setTypeFilter(firstSelected as 'visits' | 'tasks')
    }
  }

  const clearTypeSelection = () => {
    setSelectedTypes(new Set())
    setTypeFilter('all')
  }

  const typeOptions = [
    { value: 'visits', label: 'Workorders', circleColor: 'bg-green-500' },
    { value: 'tasks', label: 'Tasks', circleColor: 'bg-neutral-700' },
  ]

  const filteredTypeOptions = typeOptions.filter(option =>
    option.label.toLowerCase().includes(typeSearchTerm.toLowerCase())
  )

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const allTeamMembers = [...mockTeamMembers]

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

  const formatTime = (time: string) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const toScheduleTime = (hour: number, minute: number) =>
    `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`

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

  const unscheduledItems = scheduledItems.filter(item => !item.schedule?.day || !item.schedule?.startTime)

  const getItemsForSlot = (day: Date, hour: number) => {
    return scheduledItems.filter(item => {
      if (!item.schedule?.day || !item.schedule?.startTime) return false
      const itemDate = new Date(item.schedule.day)
      const itemHour = parseInt(item.schedule.startTime.split(':')[0])
      return isSameDay(itemDate, day) && itemHour === hour
    })
  }

  const getBlockHeight = (startTime: string, endTime: string) => {
    const start = startTime.split(':').map(Number)
    const end = endTime.split(':').map(Number)
    const startMinutes = start[0] * 60 + start[1]
    const endMinutes = end[0] * 60 + end[1]
    const duration = endMinutes - startMinutes
    return (duration / 60) * 60
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
  const activeTeamMembers = mockTeamMembers.filter((m) => m.active)
  const eventDetailAssignSelectAll = () => {
    if (!selectedItem) return
    updateWorkOrder(selectedItem.id, { assignedTeamMember: activeTeamMembers.map(m => m.name).join(', ') })
  }
  const filteredEventDetailTeam = activeTeamMembers.filter(m => m.name.toLowerCase().includes(eventDetailAssignSearchTerm.toLowerCase()))

  const eventDetailOnClose = () => {
    setSelectedItem(null)
    setSelectedItemPosition(undefined)
    setIsEventDetailAssignOpen(false)
    setEventDetailAssignSearchTerm('')
  }

  return (
    <>
    <div className="flex h-screen bg-white overflow-hidden w-full">
      {/* AppSidebar manages its own open/collapsed state via useSidebar context */}
      <AppSidebar />

      <div className="flex-1 flex flex-col overflow-hidden bg-white w-full min-w-0 pl-4 lg:pl-6">
        {/* Header manages its own menu click via SidebarTrigger internally */}
        <Header />

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

      <CalendarControls
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        view={view}
        setView={setView}
        datePickerMonth={datePickerMonth}
        setDatePickerMonth={setDatePickerMonth}
        isDatePickerOpen={isDatePickerOpen}
        setIsDatePickerOpen={setIsDatePickerOpen}
        datePickerRef={datePickerRef}
        handleDateChange={handleDateChange}
        selectedTypes={selectedTypes}
        typeOptions={typeOptions}
        filteredTypeOptions={filteredTypeOptions}
        typeSearchTerm={typeSearchTerm}
        setTypeSearchTerm={setTypeSearchTerm}
        isTypeDropdownOpen={isTypeDropdownOpen}
        setIsTypeDropdownOpen={setIsTypeDropdownOpen}
        typeDropdownRef={typeDropdownRef}
        toggleTypeSelection={toggleTypeSelection}
        clearTypeSelection={clearTypeSelection}
        setSelectedTypes={setSelectedTypes}
        selectedTeams={selectedTeams}
        teamOptions={teamOptions}
        filteredTeamOptions={filteredTeamOptions}
        teamSearchTerm={teamSearchTerm}
        setTeamSearchTerm={setTeamSearchTerm}
        isTeamDropdownOpen={isTeamDropdownOpen}
        setIsTeamDropdownOpen={setIsTeamDropdownOpen}
        teamDropdownRef={teamDropdownRef}
        toggleTeamSelection={toggleTeamSelection}
        clearTeamSelection={clearTeamSelection}
        selectAllTeams={selectAllTeams}
        showUnscheduled={showUnscheduled}
        setShowUnscheduled={setShowUnscheduled}
        unscheduleButtonRef={unscheduleButtonRef}
        showUnscheduledTooltip={showUnscheduledTooltip}
        setShowUnscheduledTooltip={setShowUnscheduledTooltip}
        unscheduleTooltipStyle={unscheduleTooltipStyle}
        scheduledItems={scheduledItems}
      />
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
              {/* Day Header */}
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
                  {/* Horizontal Time Labels Row */}
                  <div className="flex sticky top-0 bg-white border-b z-15 min-h-[40px] shrink-0" style={{ borderColor: '#EAEBED' }}>
                    <div className="w-48 flex-shrink-0 border-r" style={{ borderColor: '#EAEBED' }}></div>
                    <div className={`flex-shrink-0 border-r flex items-center justify-center ${dayViewAnytimeExpanded ? 'w-64' : 'w-12'}`} style={{ borderColor: '#EAEBED', backgroundColor: '#FAFAF9' }}>
                      <span className="text-[13px] font-medium" style={{ color: '#1F271B' }}>Anytime</span>
                    </div>
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
                  {/* Team Members Column */}
                  {(() => {
                    const dayViewRowCount = 1 + allTeamMembers.length
                    const dayViewRowHeightPx = (hours.length * 60) / dayViewRowCount
                    return (
                  <div className="w-48 flex-shrink-0 border-r bg-white flex flex-col" style={{ borderColor: '#EAEBED' }}>
                    <div className="px-2 py-2 flex items-center border-b flex-shrink-0" style={{ borderColor: '#EAEBED', minHeight: `${dayViewRowHeightPx}px` }}>
                      <div className="flex items-center gap-2">
                        <FiUsers size={14} style={{ color: '#1F271B', opacity: 0.7 }} />
                        <span className="text-sm" style={{ color: '#1F271B' }}>Unassigned</span>
                      </div>
                    </div>
                    {allTeamMembers.map((member) => {
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

                  {/* Anytime column */}
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

                  {/* Main grid */}
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
                    {/* Current time line */}
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
                    {/* Event blocks */}
                    <div className="absolute inset-0 pointer-events-none p-0.5" style={{ zIndex: 10 }}>
                      {(() => {
                        const dayItems = scheduledItems
                          .filter(item => item.schedule?.day && item.schedule?.startTime && isSameDay(new Date(item.schedule.day), currentDate))
                          .sort((a, b) => {
                            const aMin = parseInt(a.schedule!.startTime.split(':')[0]) * 60 + parseInt(a.schedule!.startTime.split(':')[1])
                            const bMin = parseInt(b.schedule!.startTime.split(':')[0]) * 60 + parseInt(b.schedule!.startTime.split(':')[1])
                            return aMin - bMin
                          })
                        const totalMinutesInDay = hours.length * 60
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
              <div className="grid border-b sticky top-0 bg-white z-20 w-full shrink-0" style={{ gridTemplateColumns: '60px repeat(7, minmax(0, 1fr))', borderColor: '#EAEBED' }}>
                <div className="p-1.5 border-r flex items-center justify-center" style={{ borderColor: '#EAEBED' }}></div>
            {weekDays.map((day) => (
              <div
                key={day.toString()}
                    className="p-1.5 text-center border-r last:border-r-0 flex items-center justify-center"
                    style={{ borderColor: '#EAEBED' }}
                  >
                    {isToday(day) ? (
                      <div className="rounded px-2 py-1 inline-flex items-center justify-center gap-0.5" style={{ backgroundColor: '#B084CC' }}>
                        <span className="text-xs text-white font-medium">{format(day, 'EEE')}</span>
                        <span className="text-sm font-semibold text-white">{format(day, 'd')}</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs mb-0.5" style={{ color: '#1F271B', opacity: 0.7 }}>{format(day, 'EEE')}</p>
                        <p className="text-sm font-semibold" style={{ color: '#1F271B' }}>{format(day, 'd')}</p>
                      </>
                    )}
              </div>
            ))}
          </div>

              <div className="flex-1 overflow-y-auto overflow-x-auto bg-white">
                <div className="grid w-full min-w-0" style={{ gridTemplateColumns: '60px repeat(7, minmax(0, 1fr))' }}>
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
                      {showCurrentTimeWeek(day) && (
                        <div
                          className="absolute left-0 right-0 z-20 flex items-center gap-0.5 pointer-events-none"
                          style={{ top: `${currentTimeTopWeek}px` }}
                        >
                          <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[6px] border-l-red-500 shrink-0" />
                          <div className="h-0.5 flex-1 bg-red-500" />
                          <span className="text-[10px] font-medium text-red-600 bg-white/90 px-1 py-0.5 rounded shrink-0">Now</span>
                        </div>
                      )}
                      <div className="absolute inset-0 pointer-events-none flex flex-col">
                        {hours.map((hour) => (
                          <div key={hour} className="border-b" style={{ minHeight: '48px', borderColor: '#EAEBED' }} />
                        ))}
                      </div>
                      {(() => {
                        const dayItems = scheduledItems.filter(item => {
                          if (!item.schedule?.day || !item.schedule?.startTime) return false
                          return isSameDay(new Date(item.schedule.day), day)
                        })
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
                          const topPosition = ((visibleStart - gridStartMinutes) / 60) * 48
                          const height = (visibleDurationMinutes / 60) * 48
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
        <div className="bg-white rounded shadow-sm border overflow-hidden" style={{ borderColor: '#EAEBED' }}>
                <div className="grid grid-cols-7 border-b bg-white shrink-0" style={{ borderColor: '#EAEBED' }}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                    const today = new Date()
                    const currentDayOfWeek = getDay(today)
                    const isCurrentDay = (currentDayOfWeek + 6) % 7 === index
                    const isViewingCurrentMonth = isSameMonth(currentDate, today)
                    const highlightDay = isCurrentDay && isViewingCurrentMonth
                    return (
                      <div
                        key={day}
                        className={`p-2 text-center border-r last:border-r-0 ${highlightDay ? 'rounded-t' : ''}`}
                        style={{ borderColor: '#EAEBED', backgroundColor: highlightDay ? '#B084CC' : 'white' }}
                      >
                        <span className="text-xs font-medium" style={!highlightDay ? { color: '#1F271B' } : { color: 'white' }}>
                          {day}
                        </span>
                      </div>
                    )
                  })}
                </div>

                <div className="grid grid-cols-7" style={{ borderColor: '#EAEBED' }}>
                  {(() => {
                    const monthStart = startOfMonth(currentDate)
                    const monthEnd = endOfMonth(currentDate)
                    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
                    const calendarEnd = addDays(startOfWeek(monthEnd, { weekStartsOn: 1 }), 6)
                    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

                    return calendarDays.map((day) => {
                      const isCurrentMonth = isSameMonth(day, currentDate)
                      const isCurrentDate = isToday(day)
                      const dayNumber = format(day, 'd')
                      
                      const dayEvents = scheduledItems.filter(item => {
                        if (!item.schedule?.day) return false
                        return isSameDay(new Date(item.schedule.day), day)
                      })

                      return (
                        <div
                          key={day.toString()}
                          className={`min-h-[80px] border-r border-b last:border-r-0 p-1.5 cursor-pointer ${isCurrentMonth ? 'bg-white' : 'bg-[#F9FAFB]'}`}
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
                              updateWorkOrder(id, { schedule: { ...item.schedule, day: dayStr } })
                            } else {
                              updateWorkOrder(id, { schedule: { day: dayStr, startTime: '09:00', endTime: '10:00' } })
                            }
                          }}
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span
                              className={`text-xs font-medium ${isCurrentDate ? 'w-5 h-5 rounded-full border-2 flex items-center justify-center' : ''}`}
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
                          
                          <div className="space-y-0.5 mt-0.5">
                            {dayEvents.slice(0, 3).map((item) => {
                              const itemType = (item as any).type
                              let bgColor = 'bg-blue-100'
                              let borderColor = '#2B50AA'
                              if (itemType === 'visits') { bgColor = 'bg-blue-100'; borderColor = '#2B50AA' }
                              else if (itemType === 'tasks') { bgColor = 'bg-purple-100'; borderColor = '#B084CC' }
                              else if (itemType === 'events') { bgColor = 'bg-yellow-100'; borderColor = '#F59E0B' }

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
        <UnscheduledSidebar
          showUnscheduled={showUnscheduled}
          onClose={() => setShowUnscheduled(false)}
          unscheduledItems={unscheduledItems}
        />
      </div>

      </div>
    </div>
    <EventDetailModal
      selectedItem={selectedItem}
      onClose={eventDetailOnClose}
      updateWorkOrder={updateWorkOrder}
      eventDetailAssignedList={eventDetailAssignedList}
      isEventDetailAssignOpen={isEventDetailAssignOpen}
      setIsEventDetailAssignOpen={setIsEventDetailAssignOpen}
      eventDetailAssignSearchTerm={eventDetailAssignSearchTerm}
      setEventDetailAssignSearchTerm={setEventDetailAssignSearchTerm}
      eventDetailAssignToggle={eventDetailAssignToggle}
      eventDetailAssignClear={eventDetailAssignClear}
      eventDetailAssignSelectAll={eventDetailAssignSelectAll}
      activeTeamMembers={activeTeamMembers}
      filteredEventDetailTeam={filteredEventDetailTeam}
    />
    </>
  )
}