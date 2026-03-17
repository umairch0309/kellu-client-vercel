'use client'

import { createPortal } from 'react-dom'
import { FiCalendar, FiChevronLeft, FiChevronRight, FiX, FiCheck } from 'react-icons/fi'
import { format, startOfMonth, endOfMonth, startOfWeek, addDays, eachDayOfInterval, isSameMonth, isToday, isSameDay, subMonths, addMonths } from 'date-fns'
import type { ScheduleItem } from './scheduleTypes'

export type ViewMode = 'day' | 'week' | 'month'

export type TypeOption = { value: string; label: string; circleColor: string }
export type TeamOption = { value: string; label: string }

export interface CalendarControlsProps {
  currentDate: Date
  setCurrentDate: (d: Date) => void
  view: ViewMode
  setView: (v: ViewMode) => void
  datePickerMonth: Date
  setDatePickerMonth: (d: Date) => void
  isDatePickerOpen: boolean
  setIsDatePickerOpen: (open: boolean) => void
  datePickerRef: React.RefObject<HTMLDivElement>
  handleDateChange: (direction: 'prev' | 'next' | 'today') => void
  selectedTypes: Set<string>
  typeOptions: TypeOption[]
  filteredTypeOptions: TypeOption[]
  typeSearchTerm: string
  setTypeSearchTerm: (s: string) => void
  isTypeDropdownOpen: boolean
  setIsTypeDropdownOpen: (open: boolean) => void
  typeDropdownRef: React.RefObject<HTMLDivElement>
  toggleTypeSelection: (type: string) => void
  clearTypeSelection: () => void
  setSelectedTypes: (s: Set<string> | ((prev: Set<string>) => Set<string>)) => void
  selectedTeams: Set<string>
  teamOptions: TeamOption[]
  filteredTeamOptions: TeamOption[]
  teamSearchTerm: string
  setTeamSearchTerm: (s: string) => void
  isTeamDropdownOpen: boolean
  setIsTeamDropdownOpen: (open: boolean) => void
  teamDropdownRef: React.RefObject<HTMLDivElement>
  toggleTeamSelection: (value: string) => void
  clearTeamSelection: () => void
  selectAllTeams: () => void
  showUnscheduled: boolean
  setShowUnscheduled: (show: boolean) => void
  unscheduleButtonRef: React.RefObject<HTMLButtonElement>
  showUnscheduledTooltip: boolean
  setShowUnscheduledTooltip: (show: boolean) => void
  unscheduleTooltipStyle: { top: number; left: number; above: boolean } | null
  scheduledItems: ScheduleItem[]
}

export default function CalendarControls({
  currentDate,
  setCurrentDate,
  view,
  setView,
  datePickerMonth,
  setDatePickerMonth,
  isDatePickerOpen,
  setIsDatePickerOpen,
  datePickerRef,
  handleDateChange,
  selectedTypes,
  typeOptions,
  filteredTypeOptions,
  typeSearchTerm,
  setTypeSearchTerm,
  isTypeDropdownOpen,
  setIsTypeDropdownOpen,
  typeDropdownRef,
  toggleTypeSelection,
  clearTypeSelection,
  setSelectedTypes,
  selectedTeams,
  teamOptions,
  filteredTeamOptions,
  teamSearchTerm,
  setTeamSearchTerm,
  isTeamDropdownOpen,
  setIsTeamDropdownOpen,
  teamDropdownRef,
  toggleTeamSelection,
  clearTeamSelection,
  selectAllTeams,
  showUnscheduled,
  setShowUnscheduled,
  unscheduleButtonRef,
  showUnscheduledTooltip,
  setShowUnscheduledTooltip,
  unscheduleTooltipStyle,
  scheduledItems,
}: CalendarControlsProps) {
  return (
    <div className="bg-white border-b px-2 sm:px-3 py-2" style={{ borderColor: '#EAEBED' }}>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 lg:gap-3">
        {/* Left Side - Navigation */}
        <div className="flex items-center gap-3 flex-wrap">
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

            {isDatePickerOpen && (
              <div
                className="fixed bg-white border border-neutral-light rounded-lg shadow-xl z-[100] w-[240px] p-2"
                style={(() => {
                  if (typeof window === 'undefined') return {}
                  const button = datePickerRef.current?.querySelector('button')
                  if (!button) return {}
                  const rect = button.getBoundingClientRect()
                  const pickerHeight = 260
                  const pickerWidth = 240
                  const padding = 10
                  let top = rect.top - pickerHeight - padding
                  let left = rect.left
                  if (top < padding) top = rect.bottom + padding
                  if (left + pickerWidth > window.innerWidth - padding) left = window.innerWidth - pickerWidth - padding
                  if (left < padding) left = padding
                  return { top: `${top}px`, left: `${left}px` }
                })()}
              >
                <div className="flex items-center justify-between mb-2">
                  <button onClick={() => setDatePickerMonth(subMonths(datePickerMonth, 1))} className="p-0.5 hover:bg-neutral-light rounded">
                    <FiChevronLeft size={14} className="text-neutral-dark" />
                  </button>
                  <span className="text-sm font-semibold text-neutral-dark">{format(datePickerMonth, 'MMMM yyyy')}</span>
                  <button onClick={() => setDatePickerMonth(addMonths(datePickerMonth, 1))} className="p-0.5 hover:bg-neutral-light rounded">
                    <FiChevronRight size={14} className="text-neutral-dark" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-0.5 mb-1.5">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-neutral-dark/70 py-0.5">{day}</div>
                  ))}
                </div>
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
                      const hasEvents = scheduledItems.some((item) => {
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
                            ${isSelected ? 'bg-secondary text-white font-semibold' : isCurrentDate ? 'font-semibold text-white' : hasEvents && !isSelected ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-neutral-light'}
                          `}
                          style={isCurrentDate && !isSelected ? { backgroundColor: '#B084CC' } : undefined}
                        >
                          {dayNumber}
                          {isSelected && <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-0.5 h-0.5 bg-white rounded-full" />}
                        </button>
                      )
                    })
                  })()}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-0">
            <button onClick={() => handleDateChange('prev')} className="p-1 rounded transition-colors" style={{ color: '#1F271B' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}>
              <FiChevronLeft size={14} />
            </button>
            <button onClick={() => handleDateChange('next')} className="p-1 rounded transition-colors" style={{ color: '#1F271B' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}>
              <FiChevronRight size={14} />
            </button>
          </div>
          <button onClick={() => handleDateChange('today')} className="px-2 py-1 text-sm font-medium rounded transition-colors" style={{ color: '#1F271B' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}>
            Today
          </button>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center border rounded overflow-hidden" style={{ borderColor: '#EAEBED' }}>
            <button
              onClick={() => setView('month')}
              className={`px-2 py-1 text-sm font-medium transition-colors ${view === 'month' ? 'text-white' : 'hover:bg-opacity-50'}`}
              style={view === 'month' ? { backgroundColor: '#2B50AA' } : { color: '#1F271B', opacity: 0.7, backgroundColor: 'transparent' }}
              onMouseEnter={(e) => { if (view !== 'month') e.currentTarget.style.backgroundColor = '#F3F4F6' }}
              onMouseLeave={(e) => { if (view !== 'month') e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-2 py-1 text-sm font-medium transition-colors border-l ${view === 'week' ? 'text-white' : 'hover:bg-opacity-50'}`}
              style={view === 'week' ? { backgroundColor: '#2B50AA', borderLeftColor: '#EAEBED' } : { color: '#1F271B', opacity: 0.7, backgroundColor: 'transparent', borderLeftColor: '#EAEBED' }}
              onMouseEnter={(e) => { if (view !== 'week') e.currentTarget.style.backgroundColor = '#F3F4F6' }}
              onMouseLeave={(e) => { if (view !== 'week') e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              Week
            </button>
            <button
              onClick={() => setView('day')}
              className={`px-2 py-1 text-sm font-medium transition-colors border-l ${view === 'day' ? 'text-white' : 'hover:bg-opacity-50'}`}
              style={view === 'day' ? { backgroundColor: '#2B50AA', borderLeftColor: '#EAEBED' } : { color: '#1F271B', opacity: 0.7, backgroundColor: 'transparent', borderLeftColor: '#EAEBED' }}
              onMouseEnter={(e) => { if (view !== 'day') e.currentTarget.style.backgroundColor = '#F3F4F6' }}
              onMouseLeave={(e) => { if (view !== 'day') e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              Day
            </button>
          </div>
          <div className="relative flex items-center ml-1">
            <button
              ref={unscheduleButtonRef}
              onClick={() => setShowUnscheduled(!showUnscheduled)}
              className="px-2 py-1 rounded flex items-center justify-center flex-shrink-0 transition-colors text-sm"
              style={{ backgroundColor: '#28AFB0', minHeight: '28px' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E8A8B'; setShowUnscheduledTooltip(true) }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#28AFB0'; setShowUnscheduledTooltip(false) }}
              title="Unscheduled"
            >
              <span className="relative inline-flex items-center justify-center">
                <FiCalendar size={14} className="text-white" />
                <FiX size={8} className="text-white absolute -top-0.5 -right-0.5" strokeWidth={3} />
              </span>
            </button>
            {showUnscheduledTooltip && unscheduleTooltipStyle && typeof document !== 'undefined' && createPortal(
              <div className="fixed z-[200] px-2 py-1.5 rounded text-sm font-medium text-white whitespace-nowrap shadow-md pointer-events-none" style={{ backgroundColor: '#1F271B', left: unscheduleTooltipStyle.left, top: unscheduleTooltipStyle.top, transform: 'translate(-50%, 0)' }}>
                Unscheduled
                {unscheduleTooltipStyle.above ? (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px]" style={{ borderTopColor: '#1F271B' }} />
                ) : (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px]" style={{ borderBottomColor: '#1F271B' }} />
                )}
              </div>,
              document.body
            )}
          </div>
          <button onClick={() => setShowUnscheduled(!showUnscheduled)} className="lg:hidden px-2 py-1 text-sm font-medium border rounded transition-colors" style={{ borderColor: '#EAEBED', color: '#1F271B' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}>
            Unscheduled
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 mt-2">
        <div ref={typeDropdownRef} className="relative flex items-center border rounded overflow-visible" style={{ borderColor: '#EAEBED' }}>
          <span className="px-2 py-1 text-sm font-medium bg-opacity-50" style={{ backgroundColor: '#F3F4F6', color: '#1F271B', opacity: 0.7 }}>Type</span>
          <button
            onClick={(e) => { e.stopPropagation(); setIsTypeDropdownOpen(!isTypeDropdownOpen) }}
            className={`px-2 py-1 text-sm font-medium flex items-center gap-1 transition-colors ${selectedTypes.size === 2 ? 'bg-white border-l' : 'hover:bg-opacity-50'}`}
            style={selectedTypes.size === 2 ? { color: '#1F271B', borderLeftColor: '#EAEBED', backgroundColor: 'white' } : { color: '#1F271B', opacity: 0.7, backgroundColor: 'transparent' }}
            onMouseEnter={(e) => { if (selectedTypes.size !== 2) e.currentTarget.style.backgroundColor = '#F3F4F6' }}
            onMouseLeave={(e) => { if (selectedTypes.size !== 2) e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            {selectedTypes.size === 2 ? 'All' : `${selectedTypes.size} selected`}
            <FiChevronRight size={10} className={`transform transition-transform ${isTypeDropdownOpen ? 'rotate-90' : ''}`} />
          </button>
          {isTypeDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-xl z-[100] min-w-[180px]" style={{ borderColor: '#EAEBED' }}>
              <div className="p-1.5 border-b" style={{ borderColor: '#EAEBED' }}>
                <input type="text" placeholder="Search types..." value={typeSearchTerm} onChange={(e) => setTypeSearchTerm(e.target.value)} className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1" style={{ borderColor: '#EAEBED', color: '#1F271B' }} onClick={(e) => e.stopPropagation()} />
              </div>
              <div className="px-2 py-1.5 border-b flex items-center justify-between" style={{ borderColor: '#EAEBED' }}>
                <span className="text-sm font-medium" style={{ color: '#1F271B' }}>{selectedTypes.size} selected</span>
                <button onClick={() => selectedTypes.size === typeOptions.length ? clearTypeSelection() : setSelectedTypes(new Set(typeOptions.map((o) => o.value)))} className="text-sm font-medium underline" style={{ color: '#28AFB0' }}>
                  {selectedTypes.size === typeOptions.length ? 'Clear' : 'Select all'}
                </button>
              </div>
              <div className="max-h-40 overflow-y-auto">
                {filteredTypeOptions.map((option) => {
                  const isSelected = selectedTypes.has(option.value)
                  return (
                    <div key={option.value} onClick={() => toggleTypeSelection(option.value)} className="px-2 py-1.5 cursor-pointer flex items-center gap-2 transition-colors" style={{ backgroundColor: 'transparent' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}>
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
        <div ref={teamDropdownRef} className="relative flex items-center border rounded overflow-visible" style={{ borderColor: '#EAEBED' }}>
          <span className="px-2 py-1 text-sm font-medium bg-opacity-50" style={{ backgroundColor: '#F3F4F6', color: '#1F271B', opacity: 0.7 }}>Team</span>
          <button
            onClick={(e) => { e.stopPropagation(); setIsTeamDropdownOpen(!isTeamDropdownOpen) }}
            className={`px-2 py-1 text-sm font-medium flex items-center gap-1 transition-colors ${selectedTeams.size === 0 || selectedTeams.size === teamOptions.length ? 'bg-white border-l' : 'hover:bg-opacity-50'}`}
            style={selectedTeams.size === 0 || selectedTeams.size === teamOptions.length ? { color: '#1F271B', borderLeftColor: '#EAEBED', backgroundColor: 'white' } : { color: '#1F271B', opacity: 0.7, backgroundColor: 'transparent' }}
            onMouseEnter={(e) => { if (selectedTeams.size > 0 && selectedTeams.size !== teamOptions.length) e.currentTarget.style.backgroundColor = '#F3F4F6' }}
            onMouseLeave={(e) => { if (selectedTeams.size > 0 && selectedTeams.size !== teamOptions.length) e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            {selectedTeams.size === 0 || selectedTeams.size === teamOptions.length ? 'All' : `${selectedTeams.size} selected`}
            <FiChevronRight size={10} className={`transform transition-transform ${isTeamDropdownOpen ? 'rotate-90' : ''}`} />
          </button>
          {isTeamDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-xl z-[100] min-w-[180px]" style={{ borderColor: '#EAEBED' }}>
              <div className="p-1.5 border-b" style={{ borderColor: '#EAEBED' }}>
                <input type="text" placeholder="Search team..." value={teamSearchTerm} onChange={(e) => setTeamSearchTerm(e.target.value)} className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1" style={{ borderColor: '#EAEBED', color: '#1F271B' }} onClick={(e) => e.stopPropagation()} />
              </div>
              <div className="px-2 py-1.5 border-b flex items-center justify-between" style={{ borderColor: '#EAEBED' }}>
                <span className="text-sm font-medium" style={{ color: '#1F271B' }}>{selectedTeams.size} selected</span>
                <button onClick={() => selectedTeams.size === teamOptions.length ? clearTeamSelection() : selectAllTeams()} className="text-sm font-medium underline" style={{ color: '#28AFB0' }}>
                  {selectedTeams.size === teamOptions.length ? 'Clear' : 'Select all'}
                </button>
              </div>
              <div className="max-h-40 overflow-y-auto">
                {filteredTeamOptions.map((option) => {
                  const isSelected = selectedTeams.has(option.value)
                  return (
                    <div key={option.value} onClick={() => toggleTeamSelection(option.value)} className="px-2 py-1.5 cursor-pointer flex items-center gap-2 transition-colors" style={{ backgroundColor: 'transparent' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}>
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
  )
}
