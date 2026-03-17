'use client'

import { useState } from 'react'
import { FiSliders, FiX } from 'react-icons/fi'
import { mockTeamMembers } from '@/data/mockData'
import { inputClass, labelClass } from './settingsTypes'

const CALENDAR_COLOR_PALETTE = [
  '#DC2626', '#EA580C', '#F97316', '#78716C', '#D6D3D1',
  '#FACC15', '#2563EB', '#3B82F6', '#60A5FA', '#22D3EE',
  '#15803D', '#22C55E', '#4ADE80', '#7C3AED', '#C026D3',
  '#EC4899', '#1F271B', '#6B7280', '#9CA3AF',
]

type CalendarColorAssignment = { id: string; color: string; assignedTo: string }

const DEFAULT_CALENDAR_ASSIGNMENTS: CalendarColorAssignment[] = [
  { id: '1', color: '#3B82F6', assignedTo: 'Tom Wilson' },
]

export default function ScheduleSettings() {
  const [assignments, setAssignments] = useState<CalendarColorAssignment[]>(() => [...DEFAULT_CALENDAR_ASSIGNMENTS])
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [assignColor, setAssignColor] = useState(CALENDAR_COLOR_PALETTE[2])
  const [assignPerson, setAssignPerson] = useState('')

  const teamMemberOptions = mockTeamMembers.filter((m) => m.active).map((m) => ({ value: m.name, label: m.name }))

  const handleSaveAssignment = () => {
    if (!assignPerson.trim()) return
    setAssignments((prev) => {
      const existing = prev.find((a) => a.assignedTo === assignPerson.trim())
      const next = existing
        ? prev.map((a) => (a.assignedTo === assignPerson.trim() ? { ...a, color: assignColor } : a))
        : [...prev, { id: String(Date.now()), color: assignColor, assignedTo: assignPerson.trim() }]
      return next
    })
    setAssignModalOpen(false)
    setAssignPerson('')
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold" style={{ color: '#1F271B' }}>Calendar colors</h1>
        <button
          type="button"
          onClick={() => setAssignModalOpen(true)}
          className="px-4 py-2 rounded text-sm font-medium flex items-center gap-2 text-white shrink-0"
          style={{ backgroundColor: '#28AFB0' }}
        >
          Assign a Color
        </button>
      </div>
      <p className="text-sm" style={{ color: '#1F271B', opacity: 0.7 }}>
        Assign colors to team members. Calendar blocks will use the color of the assigned person. If multiple colors apply to an item, the last applicable color will be used.
      </p>

      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <div className="space-y-3">
          {assignments.length === 0 ? (
            <p className="text-sm py-4" style={{ color: '#1F271B', opacity: 0.6 }}>No color assignments yet. Click &quot;Assign a Color&quot; to add one.</p>
          ) : (
            assignments.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 py-2 px-3 rounded-lg border"
                style={{ borderColor: '#EAEBED', backgroundColor: '#FAFAFA' }}
              >
                <FiSliders size={16} style={{ color: '#1F271B', opacity: 0.6 }} className="shrink-0" />
                <div
                  className="w-5 h-5 rounded shrink-0 border"
                  style={{ backgroundColor: a.color, borderColor: '#EAEBED' }}
                />
                <span className="text-sm font-medium" style={{ color: '#28AFB0' }}>
                  Assigned to {a.assignedTo}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" style={{ borderColor: '#EAEBED', border: '1px solid #EAEBED' }}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold" style={{ color: '#1F271B' }}>Assign a color</h3>
              <button
                type="button"
                onClick={() => { setAssignModalOpen(false); setAssignPerson('') }}
                className="p-1.5 rounded hover:bg-gray-100"
                style={{ color: '#1F271B' }}
                aria-label="Close"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="mb-5">
              <label className={labelClass} style={{ color: '#1F271B' }}>Choose a color</label>
              <div className="flex flex-wrap gap-1.5">
                {CALENDAR_COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAssignColor(c)}
                    className="w-8 h-8 rounded border-2 shrink-0 flex items-center justify-center transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c,
                      borderColor: assignColor === c ? '#1F271B' : '#EAEBED',
                      boxShadow: assignColor === c ? 'inset 0 0 0 1px rgba(0,0,0,0.2)' : 'none',
                    }}
                    aria-label={`Color ${c}`}
                  >
                    {assignColor === c && <FiX size={14} className="text-white drop-shadow" strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className={labelClass} style={{ color: '#1F271B' }}>Apply color</label>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                <div className="flex-1">
                  <span className="text-xs block mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>when assigned to</span>
                  <select
                    value={assignPerson}
                    onChange={(e) => setAssignPerson(e.target.value)}
                    className={inputClass}
                    style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                  >
                    <option value="">Select team member</option>
                    {teamMemberOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 sm:min-w-[140px]">
                  <span className="text-xs block mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>team member</span>
                  <select
                    value={assignPerson}
                    onChange={(e) => setAssignPerson(e.target.value)}
                    className={inputClass}
                    style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                  >
                    <option value="">—</option>
                    {teamMemberOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-lg p-3 mb-5" style={{ backgroundColor: '#F3F4F6', color: '#1F271B' }}>
              <p className="text-xs" style={{ opacity: 0.85 }}>
                If multiple colors apply to an item, the last applicable color will be used.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setAssignModalOpen(false); setAssignPerson('') }}
                className="px-4 py-2 border rounded text-sm font-medium"
                style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAssignment}
                className="px-4 py-2 rounded text-sm font-medium text-white"
                style={{ backgroundColor: '#28AFB0' }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
