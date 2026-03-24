'use client'

import { useState } from 'react'
import { FiX } from 'react-icons/fi'

export interface BookingConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  workorder: any
  client: any
  bookingSubject: string
  setBookingSubject: (s: string) => void
  bookingMessage: string
  setBookingMessage: (s: string) => void
  bookingSendMeCopy: boolean
  setBookingSendMeCopy: (v: boolean) => void
  bookingSendWhatsApp: boolean
  setBookingSendWhatsApp: (v: boolean) => void
  bookingIncludeTeamPictures: boolean
  setBookingIncludeTeamPictures: (v: boolean) => void
  onSend: () => void | Promise<void>
  isResend: boolean
}

export default function BookingConfirmationModal({
  isOpen,
  onClose,
  workorder,
  client,
  bookingSubject,
  setBookingSubject,
  bookingMessage,
  setBookingMessage,
  bookingSendMeCopy,
  setBookingSendMeCopy,
  bookingSendWhatsApp,
  setBookingSendWhatsApp,
  bookingIncludeTeamPictures,
  setBookingIncludeTeamPictures,
  onSend,
  isResend,
}: BookingConfirmationModalProps) {
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  if (!isOpen || !workorder || !client) return null
  const handleSend = async () => {
    setSendError(null)
    setSending(true)
    try {
      await onSend()
    } catch (e) {
      setSendError(e instanceof Error ? e.message : 'Failed to send')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col" style={{ borderColor: '#EAEBED' }}>
        <div className="flex items-center justify-between p-3 border-b" style={{ borderBottomColor: '#EAEBED' }}>
          <h2 className="text-base font-semibold" style={{ color: '#1F271B' }}>{isResend ? 'Resend booking confirmation' : 'Booking confirmation'}</h2>
          <button onClick={onClose} className="p-1 rounded transition-colors" style={{ color: '#1F271B', opacity: 0.6 }} onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.backgroundColor = '#F3F4F6' }} onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.backgroundColor = 'transparent' }}><FiX size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>To</label>
            <input type="email" value={client.email || ''} disabled className="w-full px-2.5 py-1.5 border rounded text-sm bg-gray-100" style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Subject</label>
            <input type="text" value={bookingSubject} onChange={(e) => setBookingSubject(e.target.value)} className="w-full px-2.5 py-1.5 border rounded text-sm" style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Message</label>
            <textarea value={bookingMessage} onChange={(e) => setBookingMessage(e.target.value)} rows={8} className="w-full px-2.5 py-1.5 border rounded text-sm resize-y" style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div className="space-y-2 pt-1 border-t" style={{ borderColor: '#EAEBED' }}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={bookingIncludeTeamPictures} onChange={(e) => setBookingIncludeTeamPictures(e.target.checked)} className="rounded" />
              <span className="text-sm" style={{ color: '#1F271B' }}>Include team pictures</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={bookingSendMeCopy} onChange={(e) => setBookingSendMeCopy(e.target.checked)} className="rounded" />
              <span className="text-sm" style={{ color: '#1F271B' }}>Send me a copy</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={bookingSendWhatsApp} onChange={(e) => setBookingSendWhatsApp(e.target.checked)} className="rounded" />
              <span className="text-sm" style={{ color: '#1F271B' }}>Send via WhatsApp</span>
            </label>
          </div>
        </div>
        {sendError && (
          <div className="px-3 pb-2">
            <p className="text-sm" style={{ color: '#B91C1C' }}>{sendError}</p>
          </div>
        )}
        <div className="flex items-center justify-end gap-2 p-3 border-t" style={{ borderColor: '#EAEBED' }}>
          <button type="button" onClick={onClose} disabled={sending} className="px-3 py-1.5 rounded text-sm font-medium border disabled:opacity-50" style={{ borderColor: '#EAEBED', color: '#1F271B' }}>Cancel</button>
          <button type="button" onClick={handleSend} disabled={sending} className="px-3 py-1.5 rounded text-sm font-medium text-white disabled:opacity-50" style={{ backgroundColor: '#28AFB0' }}>{sending ? 'Sending…' : 'Send'}</button>
        </div>
      </div>
    </div>
  )
}
