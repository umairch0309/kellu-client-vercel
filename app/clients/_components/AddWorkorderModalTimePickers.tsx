'use client'

import TimePickerColumn from './TimePickerColumn'

const TIME_HOURS = ['12', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11']
const TIME_MINUTES = ['00', '15', '30', '45']
const TIME_PERIODS = ['AM', 'PM'] as const

export interface TimeParsed {
  hour: number
  minute: number
  period: 'AM' | 'PM'
}

export interface AddWorkorderModalTimePickersProps {
  type: 'start' | 'end'
  parsed: TimeParsed
  onSelect: (hour: number, minute: number, period: 'AM' | 'PM') => void
}

export default function AddWorkorderModalTimePickers({ type, parsed, onSelect }: AddWorkorderModalTimePickersProps) {
  return (
    <div className="p-2 flex gap-1 w-[180px]">
      <TimePickerColumn
        options={TIME_HOURS}
        selected={parsed.hour.toString().padStart(2, '0')}
        onSelect={(v) => onSelect(parseInt(v, 10), parsed.minute, parsed.period)}
      />
      <TimePickerColumn
        options={TIME_MINUTES}
        selected={parsed.minute.toString().padStart(2, '0')}
        onSelect={(v) => onSelect(parsed.hour, parseInt(v, 10), parsed.period)}
      />
      <TimePickerColumn
        options={TIME_PERIODS}
        selected={parsed.period}
        onSelect={(v) => onSelect(parsed.hour, parsed.minute, v as 'AM' | 'PM')}
      />
    </div>
  )
}
