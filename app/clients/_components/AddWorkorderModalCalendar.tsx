'use client'

import { format, parse, startOfMonth, endOfMonth, startOfWeek, eachDayOfInterval, addDays, isSameMonth, isToday, isSameDay, subMonths, addMonths } from 'date-fns'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export interface AddWorkorderModalCalendarProps {
  currentMonth: Date
  setCurrentMonth: (d: Date) => void
  selectedDateStr: string
  onSelectDate: (date: Date) => void
  onClose: () => void
}

export default function AddWorkorderModalCalendar({
  currentMonth,
  setCurrentMonth,
  selectedDateStr,
  onSelectDate,
  onClose,
}: AddWorkorderModalCalendarProps) {
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = addDays(startOfWeek(monthEnd, { weekStartsOn: 0 }), 6)
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  let selectedDate: Date | null = null
  try {
    selectedDate = parse(selectedDateStr, 'MMM d, yyyy', new Date())
    if (isNaN(selectedDate.getTime())) selectedDate = null
  } catch {
    selectedDate = null
  }

  return (
    <div className="p-3 w-[240px]">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
          style={{ color: '#1F271B' }}
        >
          <FiChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold" style={{ color: '#1F271B' }}>
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button
          type="button"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
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
        {calendarDays.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
          const isTodayDate = isToday(day)
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => {
                onSelectDate(day)
                onClose()
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
        })}
      </div>
    </div>
  )
}
