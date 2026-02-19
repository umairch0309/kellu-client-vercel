'use client'

import { useState, useEffect } from 'react'
import { FiX } from 'react-icons/fi'
import type { CustomerReminder } from '@/context/ClientRemindersContext'

interface SetCustomerReminderModalProps {
  isOpen: boolean
  onClose: () => void
  clientId: number
  initialReminder?: CustomerReminder | null
  onSave: (reminder: CustomerReminder) => void
}

const defaultReminder = (): CustomerReminder => ({
  date: new Date().toISOString().slice(0, 10),
  time: '09:00',
  note: '',
})

export default function SetCustomerReminderModal({
  isOpen,
  onClose,
  initialReminder,
  onSave,
}: SetCustomerReminderModalProps) {
  const [date, setDate] = useState(defaultReminder().date)
  const [time, setTime] = useState(defaultReminder().time)
  const [note, setNote] = useState(defaultReminder().note)

  useEffect(() => {
    if (!isOpen) return
    if (initialReminder) {
      setDate(initialReminder.date)
      setTime(initialReminder.time)
      setNote(initialReminder.note)
    } else {
      setDate(defaultReminder().date)
      setTime(defaultReminder().time)
      setNote(defaultReminder().note)
    }
  }, [isOpen, initialReminder])

  const handleSave = () => {
    onSave({ date, time, note })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" aria-modal="true">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div
        className="relative bg-white rounded-lg shadow-xl border w-full max-w-md"
        style={{ borderColor: '#EAEBED' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: '#EAEBED' }}>
          <h2 className="text-base font-semibold" style={{ color: '#1F271B' }}>Set customer reminder</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
            style={{ color: '#1F271B' }}
          >
            <FiX size={18} />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#28AFB0]"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Time</label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#28AFB0]"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Note</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Optional note for this reminder"
              rows={3}
              className="w-full px-3 py-2 border rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#28AFB0]"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t" style={{ borderColor: '#EAEBED' }}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded text-sm font-medium transition-colors"
            style={{ borderColor: '#EAEBED', color: '#1F271B', backgroundColor: 'white' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded text-sm font-medium transition-colors"
            style={{ backgroundColor: '#28AFB0', color: 'white' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1E8A8B' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#28AFB0' }}
          >
            Save reminder
          </button>
        </div>
      </div>
    </div>
  )
}
