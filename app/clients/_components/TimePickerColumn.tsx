'use client'

interface TimePickerColumnProps {
  options: readonly string[]
  selected: string
  onSelect: (value: string) => void
}

export default function TimePickerColumn({ options, selected, onSelect }: TimePickerColumnProps) {
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
