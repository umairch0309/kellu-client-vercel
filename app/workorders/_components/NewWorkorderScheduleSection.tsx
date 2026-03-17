'use client'

export interface NewWorkorderScheduleSectionProps {
  scheduleDay: string
  startTime: string
  endTime: string
  scheduleLater: boolean
  anytime: boolean
  onFieldChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
}

const inputFocusStyles = {
  onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#28AFB0'
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)'
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#EAEBED'
    e.currentTarget.style.boxShadow = 'none'
  },
}

export default function NewWorkorderScheduleSection({
  scheduleDay,
  startTime,
  endTime,
  scheduleLater,
  anytime,
  onFieldChange,
}: NewWorkorderScheduleSectionProps) {
  return (
    <div className="lg:col-span-2 bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold" style={{ color: '#1F271B' }}>Schedule</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B', opacity: 0.7 }}>Start date</label>
          <input
            type="date"
            name="scheduleDay"
            value={scheduleDay}
            onChange={onFieldChange}
            disabled={scheduleLater}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all disabled:opacity-60 disabled:bg-gray-50"
            style={{ borderColor: '#EAEBED', color: '#1F271B' }}
            {...inputFocusStyles}
          />
          <label className="flex items-center gap-2 cursor-pointer mt-2">
            <input
              type="checkbox"
              name="scheduleLater"
              checked={scheduleLater}
              onChange={onFieldChange}
              className="w-4 h-4 rounded focus:ring-1"
              style={{ accentColor: '#28AFB0', borderColor: '#EAEBED' }}
            />
            <span className="text-sm" style={{ color: '#1F271B' }}>Schedule later</span>
          </label>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B', opacity: 0.7 }}>Start time</label>
          <input
            type="time"
            name="startTime"
            value={startTime}
            onChange={onFieldChange}
            disabled={scheduleLater || anytime}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all disabled:opacity-60 disabled:bg-gray-50"
            style={{ borderColor: '#EAEBED', color: '#1F271B' }}
            {...inputFocusStyles}
          />
          <label className="flex items-center gap-2 cursor-pointer mt-2">
            <input
              type="checkbox"
              name="anytime"
              checked={anytime}
              onChange={onFieldChange}
              className="w-4 h-4 rounded focus:ring-1"
              style={{ accentColor: '#28AFB0', borderColor: '#EAEBED' }}
            />
            <span className="text-sm" style={{ color: '#1F271B' }}>Anytime</span>
          </label>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B', opacity: 0.7 }}>End time</label>
          <input
            type="time"
            name="endTime"
            value={endTime}
            onChange={onFieldChange}
            disabled={scheduleLater || anytime}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all disabled:opacity-60 disabled:bg-gray-50"
            style={{ borderColor: '#EAEBED', color: '#1F271B' }}
            {...inputFocusStyles}
          />
        </div>
      </div>
    </div>
  )
}
