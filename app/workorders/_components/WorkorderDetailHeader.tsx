'use client'

import { FiEdit, FiMoreVertical, FiMail, FiSend, FiDollarSign, FiExternalLink } from 'react-icons/fi'

const TALLY_WORK_REPORT_BASE_URL = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_TALLY_WORK_REPORT_URL
  ? process.env.NEXT_PUBLIC_TALLY_WORK_REPORT_URL
  : 'https://tally.so'

export interface WorkorderDetailHeaderProps {
  workorderId: number | string
  workorder: any
  onBookingConfirmation: () => void
  onEdit: () => void
  onSendQuote: () => void
  onSendInvoice: () => void
  onSendJobFollow: () => void
  isMoreActionsOpen: boolean
  setIsMoreActionsOpen: (open: boolean) => void
  moreActionsRef: React.RefObject<HTMLDivElement>
}

export default function WorkorderDetailHeader({
  workorderId,
  workorder,
  onBookingConfirmation,
  onEdit,
  onSendQuote,
  onSendInvoice,
  onSendJobFollow,
  isMoreActionsOpen,
  setIsMoreActionsOpen,
  moreActionsRef,
}: WorkorderDetailHeaderProps) {
  const bookingSent = (workorder as any)?.bookingConfirmationSent
  return (
    <div className="flex items-center justify-end p-3">
      <div className="flex items-center gap-2">
        <button
          onClick={onBookingConfirmation}
          className="px-2.5 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-all"
          style={{ backgroundColor: '#28AFB0', color: 'white' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E8A8B' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#28AFB0' }}
        >
          <FiMail size={12} />
          <span>{bookingSent ? 'Resend booking confirmation' : 'Booking confirmation'}</span>
        </button>
        <button
          onClick={onEdit}
          className="px-2.5 py-1.5 border rounded text-xs font-medium flex items-center gap-1.5 transition-all"
          style={{ borderColor: '#EAEBED', color: '#1F271B', backgroundColor: 'white' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white' }}
        >
          <FiEdit size={12} />
          <span>Edit</span>
        </button>
        <div className="relative" ref={moreActionsRef}>
          <button
            onClick={() => setIsMoreActionsOpen(!isMoreActionsOpen)}
            className="px-2.5 py-1.5 border rounded text-xs font-medium flex items-center gap-1.5 transition-all more-actions-button"
            style={{ borderColor: '#EAEBED', color: '#1F271B', backgroundColor: 'white' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white' }}
          >
            <FiMoreVertical size={12} />
          </button>
          {isMoreActionsOpen && (
            <div className="absolute right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 min-w-[220px] py-1" style={{ borderColor: '#EAEBED' }}>
              <button
                onClick={() => { onSendQuote(); setIsMoreActionsOpen(false) }}
                className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3"
                style={{ color: '#1F271B' }}
              >
                <FiSend size={16} style={{ color: '#1F271B', flexShrink: 0 }} />
                <span>{(workorder.quoteDateSent || workorder.quoteStatus !== 'not sent') ? 'Resend Quote' : 'Send Quote'}</span>
              </button>
              <div className="border-t mx-2" style={{ borderStyle: 'dashed', borderColor: '#EAEBED' }} />
              <button
                onClick={() => { onSendInvoice(); setIsMoreActionsOpen(false) }}
                className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3"
                style={{ color: '#1F271B' }}
              >
                <FiDollarSign size={16} style={{ color: '#2B50AA', flexShrink: 0 }} />
                <span>Send Invoice</span>
              </button>
              <div className="border-t mx-2" style={{ borderStyle: 'dashed', borderColor: '#EAEBED' }} />
              <button
                onClick={() => { onSendJobFollow(); setIsMoreActionsOpen(false) }}
                className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3"
                style={{ color: '#1F271B' }}
              >
                <FiMail size={16} style={{ color: '#28AFB0', flexShrink: 0 }} />
                <span>Send Job Follow</span>
              </button>
              <div className="border-t mx-2" style={{ borderStyle: 'dashed', borderColor: '#EAEBED' }} />
              <button
                onClick={() => {
                  const url = `${TALLY_WORK_REPORT_BASE_URL}${TALLY_WORK_REPORT_BASE_URL.includes('?') ? '&' : '?'}workorder=${workorderId}`
                  window.open(url, '_blank', 'noopener,noreferrer')
                  setIsMoreActionsOpen(false)
                }}
                className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3"
                style={{ color: '#1F271B' }}
              >
                <FiExternalLink size={16} style={{ color: '#28AFB0', flexShrink: 0 }} />
                <span>Create Job report</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

