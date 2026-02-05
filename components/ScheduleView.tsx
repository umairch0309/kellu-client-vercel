'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { 
  FiCalendar, 
  FiChevronLeft, 
  FiChevronRight, 
  FiX,
  FiCheckCircle,
  FiUsers,
  FiPlus,
  FiEdit
} from 'react-icons/fi'
import { format, startOfWeek, addDays, isToday, isSameDay, startOfDay, getHours, getMinutes, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, getDay, subMonths, addMonths } from 'date-fns'
import { mockWorkorders, mockTeamMembers } from '@/data/mockData'
import AddWorkorderModal from './AddWorkorderModal'
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
  const [teamFilter, setTeamFilter] = useState<string>('all')
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false)
  const [teamSearchTerm, setTeamSearchTerm] = useState('')
  const [showUnscheduled, setShowUnscheduled] = useState(true)
  const [showUnscheduledTooltip, setShowUnscheduledTooltip] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [datePickerMonth, setDatePickerMonth] = useState(new Date())
  const datePickerRef = useRef<HTMLDivElement>(null)

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }) // Monday start
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Hours from 8 AM to 6 PM (to match the image)
  const hours = Array.from({ length: 11 }, (_, i) => i + 8)
  const currentHour = getHours(new Date())
  const currentMinute = getMinutes(new Date())

  // Get scheduled items
  const scheduledItems = mockWorkorders.filter(item => {
    // Type filter: check if item type matches any of the selected types
    // If all types are selected (size === 2) or none selected (size === 0), show all items
    const matchesType = selectedTypes.size === 0 || selectedTypes.size === 2 || ((item as any).type && selectedTypes.has((item as any).type))
    
    // Team filter
    let matchesTeam = true
    if (teamFilter === 'all') {
      matchesTeam = true
    } else if (teamFilter === 'unassigned') {
      matchesTeam = !item.assignedTeamMember || item.assignedTeamMember === ''
    } else {
      matchesTeam = item.assignedTeamMember === teamFilter
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

  // Filter options based on search
  const typeOptions = [
    { value: 'visits', label: 'Workorders', color: 'border-2 border-green-500 bg-transparent' },
    { value: 'tasks', label: 'Tasks', color: 'border-2 border-neutral-dark bg-transparent' },
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

  // Team filter options
  const teamOptions = [
    { value: 'all', label: 'All' },
    { value: 'unassigned', label: 'Unassigned' },
    ...allTeamMembers.map(member => ({ value: member.name, label: member.name }))
  ]

  const filteredTeamOptions = teamOptions.filter(option =>
    option.label.toLowerCase().includes(teamSearchTerm.toLowerCase())
  )

  // Format time for display (convert 24h to 12h format)
  const formatTime = (time: string) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
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

  const eventDetailModal = selectedItem && typeof document !== 'undefined' && createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" aria-modal="true">
      <div className="absolute inset-0 bg-black/25" onClick={() => { setSelectedItem(null); setSelectedItemPosition(undefined) }} />
      <div
        className="relative bg-white rounded-lg shadow-2xl border w-full max-w-[320px] max-h-[85vh] overflow-hidden flex flex-col min-w-[280px]"
        style={{ borderColor: '#EAEBED' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-2.5 border-b flex-shrink-0" style={{ borderColor: '#EAEBED' }}>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold mb-0.5 truncate" style={{ color: '#1F271B' }}>{selectedItem!.title}</h2>
            <span className="inline-block px-1 py-0.5 text-xs rounded" style={{ backgroundColor: '#F3F4F6', color: '#1F271B', opacity: 0.7 }}>
              {(selectedItem as any).type === 'tasks' ? 'Task' : (selectedItem as any).type === 'visits' ? 'Workorder' : 'Event'}
            </span>
          </div>
          <button onClick={() => { setSelectedItem(null); setSelectedItemPosition(undefined) }} className="p-0.5 rounded transition-colors" style={{ color: '#1F271B' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}>
            <FiX size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <input type="checkbox" id="event-detail-completed" className="w-3 h-3 rounded focus:ring-1" style={{ borderColor: '#EAEBED' }} />
            <label htmlFor="event-detail-completed" className="text-xs cursor-pointer" style={{ color: '#1F271B' }}>Completed</label>
          </div>
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
          <div className="mb-1.5">
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-xs font-semibold" style={{ color: '#1F271B' }}>Team</span>
              <button className="w-3.5 h-3.5 rounded-full text-white flex items-center justify-center transition-colors flex-shrink-0" style={{ backgroundColor: '#28AFB0' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E8A8B' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#28AFB0' }}>
                <FiPlus size={10} />
              </button>
            </div>
            <div className="flex flex-wrap gap-0.5">
              {selectedItem!.assignedTeamMember ? (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs rounded-full" style={{ backgroundColor: '#F3F4F6', color: '#1F271B' }}>
                  {selectedItem!.assignedTeamMember}
                  <button className="hover:opacity-70"><FiX size={8} /></button>
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs rounded-full" style={{ backgroundColor: '#F3F4F6', color: '#1F271B' }}>
                  All team members
                  <button className="hover:opacity-70"><FiX size={8} /></button>
                </span>
              )}
            </div>
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
            <button onClick={() => { setSelectedItem(null); setSelectedItemPosition(undefined) }} className="flex-1 px-2 py-1.5 bg-white border rounded transition-colors text-xs font-medium flex items-center justify-center gap-1 whitespace-nowrap" style={{ borderColor: '#EAEBED', color: '#1F271B' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white' }}>
              <FiEdit size={10} />
              Edit
            </button>
            <button onClick={() => { setSelectedItem(null); setSelectedItemPosition(undefined) }} className="flex-1 px-2 py-1.5 rounded transition-colors text-xs font-medium text-white shadow-sm hover:shadow-md whitespace-nowrap flex items-center justify-center gap-1" style={{ backgroundColor: '#28AFB0' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E8A8B'; e.currentTarget.style.transform = 'translateY(-1px)' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#28AFB0'; e.currentTarget.style.transform = 'translateY(0)' }}>
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
            {/* Unscheduled - separate div, se-green button with tooltip, same height as Day/Week/Month */}
            <div className="relative flex items-center">
              <button
                onClick={() => setShowUnscheduled(!showUnscheduled)}
                className="py-1 px-2 rounded flex items-center justify-center flex-shrink-0 transition-colors min-h-[22px] min-w-[22px]"
                style={{ backgroundColor: '#28AFB0' }}
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
              {showUnscheduledTooltip && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 z-50 px-2 py-1.5 rounded text-sm font-medium text-white whitespace-nowrap"
                  style={{ backgroundColor: '#1F271B' }}
                >
                  Unscheduled
                  <div
                    className="absolute left-1/2 -translate-x-1/2 -top-1 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px]"
                    style={{ borderBottomColor: '#1F271B' }}
                  />
                </div>
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
                        className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1"
                        style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    {/* Selected Count */}
                    <div className="px-2 py-1.5 border-b flex items-center justify-between" style={{ borderColor: '#EAEBED' }}>
                      <span className="text-xs" style={{ color: '#1F271B' }}>{selectedTypes.size} selected</span>
                      {selectedTypes.size > 0 && (
                        <button
                          onClick={() => clearTypeSelection()}
                          className="text-xs underline"
                          style={{ color: '#28AFB0' }}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    {/* Options */}
                    <div className="max-h-40 overflow-y-auto">
                      {filteredTypeOptions.map((option) => {
                        const isSelected = selectedTypes.has(option.value)
                        return (
                          <div
                            key={option.value}
                            onClick={() => toggleTypeSelection(option.value)}
                            className="px-2 py-1.5 hover:bg-opacity-50 cursor-pointer flex items-center justify-between transition-colors"
                            style={{ backgroundColor: 'transparent' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                          >
                            <div className="flex items-center gap-1.5">
                              <div className={`w-3 h-3 rounded-full ${option.color} flex items-center justify-center`}>
                                {isSelected && (
                                  <FiCheckCircle className={option.value === 'visits' ? 'text-green-500' : 'text-neutral-dark'} size={10} />
                                )}
                              </div>
                              <span className="text-xs" style={{ color: '#1F271B' }}>{option.label}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
          {/* Team Filter Dropdown */}
          <div ref={teamDropdownRef} className="relative flex items-center border rounded overflow-visible" style={{ borderColor: '#EAEBED' }}>
            <span className="px-2 py-1 text-sm font-medium bg-opacity-50" style={{ backgroundColor: '#F3F4F6', color: '#1F271B', opacity: 0.7 }}>Team</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsTeamDropdownOpen(!isTeamDropdownOpen)
              }}
              className={`px-2 py-1 text-sm font-medium flex items-center gap-1 transition-colors ${
                teamFilter === 'all' 
                  ? 'bg-white border-l' 
                  : 'hover:bg-opacity-50'
              }`}
              style={teamFilter === 'all' 
                ? { color: '#1F271B', borderLeftColor: '#EAEBED', backgroundColor: 'white' }
                : { color: '#1F271B', opacity: 0.7, backgroundColor: 'transparent' }
              }
              onMouseEnter={(e) => {
                if (teamFilter !== 'all') {
                  e.currentTarget.style.backgroundColor = '#F3F4F6'
                }
              }}
              onMouseLeave={(e) => {
                if (teamFilter !== 'all') {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              {teamFilter === 'all' ? 'All' : teamFilter === 'unassigned' ? 'Unassigned' : teamFilter}
              <FiChevronRight size={10} className={`transform transition-transform ${isTeamDropdownOpen ? 'rotate-90' : ''}`} />
            </button>
                {isTeamDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-xl z-[100] min-w-[180px] max-h-56 overflow-y-auto" style={{ borderColor: '#EAEBED' }}>
                    {/* Search Bar */}
                    <div className="p-1.5 border-b sticky top-0 bg-white" style={{ borderColor: '#EAEBED' }}>
                      <input
                        type="text"
                        placeholder="Search team..."
                        value={teamSearchTerm}
                        onChange={(e) => setTeamSearchTerm(e.target.value)}
                        className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1"
                        style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    {/* Options */}
                    <div>
                      {filteredTeamOptions.map((option) => {
                        const isSelected = teamFilter === option.value
                        return (
                          <div
                            key={option.value}
                            onClick={() => {
                              setTeamFilter(option.value)
                              setIsTeamDropdownOpen(false)
                            }}
                            className={`px-2 py-1.5 cursor-pointer flex items-center justify-between transition-colors ${
                              isSelected ? 'bg-opacity-50' : ''
                            }`}
                            style={{ backgroundColor: isSelected ? '#F3F4F6' : 'transparent' }}
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.backgroundColor = '#F3F4F6'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.backgroundColor = 'transparent'
                              }
                            }}
                          >
                            <div className="flex items-center gap-1.5">
                              {option.value !== 'all' && option.value !== 'unassigned' && (
                                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#2B50AA', opacity: 0.2 }}>
                                  <span className="text-xs font-semibold" style={{ color: '#2B50AA' }}>
                                    {getInitials(option.label)}
                                  </span>
                                </div>
                              )}
                              {option.value === 'unassigned' && (
                                <FiUsers style={{ color: '#1F271B', opacity: 0.7 }} size={12} />
                              )}
                              <span className="text-xs" style={{ color: '#1F271B' }}>{option.label}</span>
                            </div>
                            {isSelected && (
                              <FiCheckCircle className="text-green-500" size={12} />
                            )}
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
              {/* Day Header - same pink pill for today as week/month view */}
              <div className="sticky top-0 bg-white border-b z-20 px-3 py-2 flex items-center justify-between" style={{ borderColor: '#EAEBED' }}>
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
                  <div className="flex sticky top-0 bg-white border-b z-15" style={{ borderColor: '#EAEBED' }}>
                    {/* Empty space for team members column */}
                    <div className="w-48 flex-shrink-0 border-r" style={{ borderColor: '#EAEBED' }}></div>
                    {/* Anytime column (to the left of 8:00) */}
                    <div className="w-16 flex-shrink-0 border-r flex items-center justify-center px-1 py-1" style={{ borderColor: '#EAEBED' }}>
                      <span className="text-xs font-medium" style={{ color: '#1F271B' }}>Anytime</span>
                    </div>
                    {/* Time labels */}
                    <div className="flex-1 flex">
                      {hours.map((hour) => (
                        <div 
                          key={hour}
                          className="flex-1 border-r last:border-r-0 px-2 py-1 text-center"
                          style={{ borderColor: '#EAEBED' }}
                        >
                          <span className="text-sm font-medium" style={{ color: '#1F271B' }}>
                            {hour.toString().padStart(2, '0')}:00
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex">
                  {/* Team Members Column - Left Side */}
                  <div className="w-48 flex-shrink-0 border-r bg-white" style={{ borderColor: '#EAEBED' }}>
                    {/* Anytime Row */}
                    <div className="px-2 py-2 flex items-center justify-between border-b" style={{ borderColor: '#EAEBED' }}>
                      <span className="text-xs font-medium" style={{ color: '#1F271B' }}>Anytime</span>
                      <FiChevronRight size={12} className="rotate-90" style={{ color: '#1F271B', opacity: 0.5 }} />
                    </div>
                    
                    {/* Team Members List */}
                    <div className="divide-y" style={{ borderColor: '#EAEBED' }}>
                      {/* Unassigned */}
                      <div className="px-2 py-2 flex items-center justify-between" style={{ minHeight: `${hours.length * 60 / (allTeamMembers.length + 2)}px` }}>
                        <div className="flex items-center gap-2">
                          <FiUsers size={14} style={{ color: '#1F271B', opacity: 0.7 }} />
                          <span className="text-sm" style={{ color: '#1F271B' }}>Unassigned</span>
                        </div>
                        <span className="text-xs font-medium" style={{ color: '#1F271B' }}>
                          {scheduledItems.filter(item => !item.assignedTeamMember && item.schedule?.day && isSameDay(new Date(item.schedule.day), currentDate)).length}
                        </span>
                      </div>
                      
                      {/* Each Team Member */}
                      {allTeamMembers.map((member) => {
                        const memberItems = scheduledItems.filter(item => 
                          item.assignedTeamMember === member.name && 
                          item.schedule?.day && 
                          isSameDay(new Date(item.schedule.day), currentDate)
                        )
                        return (
                          <div 
                            key={member.id} 
                            className="px-2 py-2 flex items-center justify-between"
                            style={{ minHeight: `${hours.length * 60 / (allTeamMembers.length + 2)}px` }}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F3F4F6' }}>
                                <span className="text-sm font-medium" style={{ color: '#1F271B' }}>
                                  {getInitials(member.name)}
                                </span>
                              </div>
                              <span className="text-sm" style={{ color: '#1F271B' }}>{member.name}</span>
                            </div>
                            <span className="text-sm font-medium" style={{ color: '#1F271B' }}>
                              {memberItems.length}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Time Column */}
                  <div className="w-16 flex-shrink-0 border-r" style={{ borderColor: '#EAEBED', backgroundColor: '#F3F4F6' }}>
                    {/* Empty space for Anytime row */}
                    <div className="border-b sticky top-0 bg-white z-10" style={{ minHeight: '40px', borderColor: '#EAEBED' }}></div>
                    {/* Anytime column body - no time labels */}
                    {[...Array(allTeamMembers.length + 1)].map((_, rowIndex) => (
                      <div key={rowIndex} className="border-b" style={{ minHeight: `${hours.length * 60}px`, borderColor: '#EAEBED' }}>
                        {hours.map((hour, hourIndex) => (
                          <div
                            key={hour}
                            className="border-b relative"
                            style={{ minHeight: '60px', borderColor: '#EAEBED' }}
                          >
                            {/* Current time indicator */}
                            {isToday(currentDate) && hour === currentHour && hourIndex === 0 && (
                              <div 
                                className="absolute left-0 right-0 border-t-2 border-red-500 z-20"
                                style={{ top: `${(currentMinute / 60) * 60}px` }}
                              >
                                <div className="absolute -left-1 -top-1 w-0 h-0 border-l-[5px] border-l-red-500 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent"></div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Events Column - One row per team member */}
                  <div className="flex-1 relative" style={{ minHeight: `${hours.length * 60}px`, backgroundColor: '#F3F4F6' }}>
                    {/* Only 2 event blocks for the day - properly aligned */}
                    <div className="absolute inset-0 flex flex-col gap-2 pt-2 px-1.5">
                      {(() => {
                        const dayItems = scheduledItems
                          .filter(item => item.schedule?.day && item.schedule?.startTime && isSameDay(new Date(item.schedule.day), currentDate))
                          .sort((a, b) => {
                            const aMin = parseInt(a.schedule!.startTime.split(':')[0]) * 60 + parseInt(a.schedule!.startTime.split(':')[1])
                            const bMin = parseInt(b.schedule!.startTime.split(':')[0]) * 60 + parseInt(b.schedule!.startTime.split(':')[1])
                            return aMin - bMin
                          })
                          .slice(0, 1)
                        return dayItems.map((item, index) => {
                          let bgColor = 'bg-blue-50'
                          let borderLeftColor = '#2B50AA'
                          const itemType = (item as any).type
                          if (itemType === 'visits') {
                            bgColor = 'bg-blue-50'
                            borderLeftColor = '#2B50AA'
                          } else if (itemType === 'tasks') {
                            bgColor = 'bg-purple-100'
                            borderLeftColor = '#B084CC'
                          }
                          return (
                            <div
                              key={item.id}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedItem(item)
                                setSelectedItemPosition({ x: e.clientX, y: e.clientY })
                              }}
                              className={`flex items-center rounded overflow-hidden ${bgColor} cursor-pointer hover:shadow-md transition-all flex-shrink-0`}
                              style={{
                                borderLeft: `3px solid ${borderLeftColor}`,
                                minHeight: '48px',
                                padding: '10px 12px'
                              }}
                            >
                              <span className="text-sm font-medium truncate block min-w-0" style={{ color: '#1F271B' }} title={`${item.clientName} · ${item.title}`}>
                                {item.clientName} · {item.title}
                              </span>
                            </div>
                          )
                        })
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}

      {view === 'week' && (
            <div className="h-full flex flex-col">
              {/* Week Header */}
              <div className="grid border-b sticky top-0 bg-white z-20 w-full" style={{ gridTemplateColumns: 'minmax(50px, 60px) repeat(7, minmax(0, 1fr))', borderColor: '#EAEBED' }}>
                <div className="p-1 border-r flex-shrink-0" style={{ borderColor: '#EAEBED' }}></div>
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

              {/* Time Grid */}
              <div className="flex-1 overflow-y-auto overflow-x-auto bg-gray-100">
                <div className="grid w-full" style={{ gridTemplateColumns: 'minmax(60px, 80px) repeat(7, minmax(0, 1fr))' }}>
                  {/* Time Column */}
                  <div className="border-r border-neutral-dark/15 flex-shrink-0 bg-gray-100">
                    <div className="p-1.5 text-sm text-neutral-dark/50 font-medium">↓ Anytime</div>
            {hours.map((hour) => (
                      <div
                        key={hour}
                        className="border-b border-neutral-dark/15 relative"
                        style={{ minHeight: '48px' }}
                      >
                        <div className="absolute top-1 left-1.5 text-sm text-neutral-dark/50 whitespace-nowrap">
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
                    <div key={day.toString()} className="border-r last:border-r-0 relative overflow-hidden bg-white" style={{ minHeight: `${hours.length * 48}px`, borderColor: '#EAEBED' }}>
                      {/* Hour grid - visual structure so events align to column */}
                      <div className="absolute inset-0 pointer-events-none flex flex-col">
                        {hours.map((hour) => (
                          <div key={hour} style={{ minHeight: '48px' }} />
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

                        return sortedItems.map((item, index) => {
                          const startMinutes = parseInt(item.schedule.startTime.split(':')[0]) * 60 + parseInt(item.schedule.startTime.split(':')[1])
                          const endMinutes = parseInt(item.schedule.endTime.split(':')[0]) * 60 + parseInt(item.schedule.endTime.split(':')[1])
                          const durationHours = (endMinutes - startMinutes) / 60
                          const startHour = parseInt(item.schedule.startTime.split(':')[0])
                          const startMinute = parseInt(item.schedule.startTime.split(':')[1])
                          
                          // Calculate position from top of the timeline (8 AM = 0)
                          const topPosition = ((startHour - 8) * 48) + (startMinute / 60 * 48)
                          const height = Math.max(durationHours * 48, 48)

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
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedItem(item)
                                setSelectedItemPosition({ x: e.clientX, y: e.clientY })
                              }}
                              className={`absolute rounded overflow-hidden ${bgColor} cursor-pointer hover:shadow-md transition-all`}
                              style={{
                                left: '6px',
                                right: '6px',
                                top: `${topPosition}px`,
                                height: `${height}px`,
                                minHeight: '32px',
                                borderLeft: `3px solid ${borderLeftColor}`,
                                padding: '6px 8px',
                                zIndex: 10 + index
                              }}
                            >
                              <div className="flex flex-row items-center h-full w-full min-w-0 overflow-hidden">
                                <span className="text-sm font-medium truncate block min-w-0" style={{ color: '#1F271B' }} title={`${item.clientName} · ${item.title}`}>
                                  {item.clientName} · {item.title}
                                </span>
                              </div>
                            </div>
                          )
                        })
                      })()}
                      
                      {/* Hour slots - clickable for adding events */}
                      {hours.map((hour) => (
                        <div
                          key={hour}
                          className="absolute left-0 right-0 border-b cursor-pointer z-0"
                          style={{ top: `${(hour - 8) * 48}px`, height: '48px', borderColor: '#EAEBED' }}
                          onClick={() => {
                            const clickedDate = new Date(day)
                            const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
                            const ampm = hour >= 12 ? 'PM' : 'AM'
                            const formattedTime = `${hour12}:00 ${ampm}`
                            setModalInitialDate(clickedDate)
                            setModalInitialTime(formattedTime)
                            setIsAddWorkorderOpen(true)
                          }}
                        />
                      ))}
              </div>
            ))}
                </div>
          </div>
        </div>
      )}

          {view === 'month' && (
            <div className="h-full flex flex-col p-3" style={{ backgroundColor: '#F3F4F6' }}>
              {/* Month Calendar Grid */}
        <div className="bg-white rounded shadow-sm border overflow-hidden" style={{ borderColor: '#EAEBED' }}>
                {/* Day Headers - Mon to Sun */}
                <div className="grid grid-cols-7 border-b bg-white" style={{ borderColor: '#EAEBED' }}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                    const today = new Date()
                    const currentDayOfWeek = getDay(today) // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
                    const isCurrentDay = (currentDayOfWeek + 6) % 7 === index
                    
              return (
                      <div
                        key={day}
                        className={`p-2 text-center border-r last:border-r-0 ${
                          isCurrentDay ? 'rounded-t' : ''
                        }`}
                        style={{ borderColor: '#EAEBED', backgroundColor: isCurrentDay ? '#B084CC' : 'white' }}
                      >
                        <span className={`text-xs font-medium ${
                          isCurrentDay ? 'text-white' : ''
                        }`}
                        style={!isCurrentDay ? { color: '#1F271B' } : {}}
                        >
                          {day}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7">
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
                            isCurrentMonth ? 'bg-white' : ''
                          }`}
                          style={{ 
                            borderColor: '#EAEBED',
                            backgroundColor: isCurrentMonth ? 'white' : '#F9FAFB'
                          }}
                          onClick={(e) => {
                            setModalInitialDate(day)
                            setModalInitialTime(undefined)
                            setModalPosition({ x: e.clientX, y: e.clientY })
                            setIsAddWorkorderOpen(true)
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
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedItem(item)
                                    setSelectedItemPosition({ x: e.clientX, y: e.clientY })
                                  }}
                                  className={`text-xs px-1 py-0.5 rounded ${bgColor} cursor-pointer hover:opacity-80 truncate`}
                                  style={{ borderLeft: `2px solid ${borderColor}` }}
                                >
                                  {item.schedule?.startTime && (
                                    <span className="font-medium">{formatTime(item.schedule.startTime)}</span>
                                  )}{' '}
                                  <span className="truncate">{item.clientName}</span>
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
                      className="p-3 bg-neutral-light rounded-lg border border-neutral-light cursor-move hover:shadow-sm transition-shadow"
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
