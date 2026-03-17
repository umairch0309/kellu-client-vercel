'use client'

import { parse } from 'date-fns'
import { FiChevronDown, FiX } from 'react-icons/fi'
import type { AddWorkorderFormData } from './addWorkorderModalTypes'

export interface AddWorkorderModalScheduleSectionProps {
  documentOnly: boolean
  formData: AddWorkorderFormData
  anytime: boolean
  setAnytime: (v: boolean) => void
  isStartDateCalendarOpen: boolean
  setIsStartDateCalendarOpen: (v: boolean) => void
  setStartDatePickerMonth: (d: Date) => void
  startDateCalendarRef: React.RefObject<HTMLDivElement>
  startTimeDropdownRef: React.RefObject<HTMLDivElement>
  endTimeDropdownRef: React.RefObject<HTMLDivElement>
  isStartTimeDropdownOpen: boolean
  setIsStartTimeDropdownOpen: (v: boolean) => void
  isEndTimeDropdownOpen: boolean
  setIsEndTimeDropdownOpen: (v: boolean) => void
  isEndValid: boolean
  onRemoveEndTime: () => void
}

export default function AddWorkorderModalScheduleSection({
  documentOnly,
  formData,
  anytime,
  setAnytime,
  isStartDateCalendarOpen,
  setIsStartDateCalendarOpen,
  setStartDatePickerMonth,
  startDateCalendarRef,
  startTimeDropdownRef,
  endTimeDropdownRef,
  isStartTimeDropdownOpen,
  setIsStartTimeDropdownOpen,
  isEndTimeDropdownOpen,
  setIsEndTimeDropdownOpen,
  isEndValid,
  onRemoveEndTime,
}: AddWorkorderModalScheduleSectionProps) {
  if (documentOnly) return null

  return (
    <div className="space-y-1.5 pt-0.5">
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

      <div className="flex items-start gap-1.5">
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="relative" ref={startTimeDropdownRef}>
            <label className="block text-xs font-medium text-neutral-dark/70 mb-0.5">Start time</label>
            {!anytime ? (
              <button
                type="button"
                onClick={() => { setIsStartTimeDropdownOpen(!isStartTimeDropdownOpen); setIsEndTimeDropdownOpen(false) }}
                className="w-full px-2 py-1 border border-neutral-light rounded text-left focus:outline-none focus:ring-1 focus:ring-primary text-sm flex items-center justify-between bg-white"
                style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              >
                <span>{formData.startTime}</span>
                <FiChevronDown size={12} className={`opacity-60 ${isStartTimeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
            ) : (
              <div className="w-full px-2 py-1 border border-transparent rounded text-sm" style={{ color: '#9CA3AF' }}>—</div>
            )}
          </div>
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

        {!anytime && (
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
                  onClick={onRemoveEndTime}
                  className="p-1 rounded text-neutral-dark/50 hover:text-neutral-dark"
                  title="Clear end time"
                >
                  <FiX size={12} />
                </button>
              )}
            </div>
            {!isEndValid && <p className="text-[10px] mt-0.5 text-red-500">End must be after start</p>}
          </div>
        )}
      </div>
    </div>
  )
}
