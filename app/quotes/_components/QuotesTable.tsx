'use client'

import { format } from 'date-fns'
import { FiSend, FiFileText } from 'react-icons/fi'
import type { QuoteRow } from './quotesListTypes'

export interface QuotesTableProps {
  quotes: QuoteRow[]
  selectedQuoteIds: Set<number>
  allFilteredSelected: boolean
  selectAllCheckboxRef: React.RefObject<HTMLInputElement>
  onToggleSelectAll: () => void
  onToggleQuoteSelection: (e: React.MouseEvent, quoteId: number) => void
  onRowClick: (workorderId: number) => void
  onSendQuote: (workorderId: number) => void
}

function getStatusColor(status: string) {
  if (status === 'approved') return { bg: 'rgba(40, 175, 176, 0.2)', text: '#1E8A8B' }
  if (status === 'waiting for approval') return { bg: 'rgba(176, 132, 204, 0.2)', text: '#8B6AA3' }
  if (status === 'rejected' || status === 'expired') return { bg: 'rgba(239, 68, 68, 0.15)', text: '#DC2626' }
  if (status === 'quote pending to send') return { bg: 'rgba(245, 158, 11, 0.2)', text: '#B45309' }
  if (status === 'draft') return { bg: '#F3F4F6', text: '#1F271B' }
  return { bg: '#F3F4F6', text: '#1F271B' }
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    'approved': 'Approved',
    'waiting for approval': 'Awaiting response',
    'rejected': 'Changes requested',
    'expired': 'Expired',
    'quote pending to send': 'Quote pending to send',
    'draft': 'Draft',
  }
  return labels[status] ?? status
}

export default function QuotesTable({
  quotes,
  selectedQuoteIds,
  allFilteredSelected,
  selectAllCheckboxRef,
  onToggleSelectAll,
  onToggleQuoteSelection,
  onRowClick,
  onSendQuote,
}: QuotesTableProps) {
  if (quotes.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm" style={{ color: '#1F271B', opacity: 0.6 }}>
          No quotes found.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b" style={{ borderBottomColor: '#EAEBED' }}>
            <th className="text-left py-2 px-2 w-10" style={{ borderColor: '#EAEBED' }}>
              <input
                type="checkbox"
                ref={selectAllCheckboxRef}
                checked={allFilteredSelected}
                onChange={onToggleSelectAll}
                onClick={(e) => e.stopPropagation()}
                className="w-3.5 h-3.5 rounded cursor-pointer"
                style={{ accentColor: '#28AFB0' }}
              />
            </th>
            <th className="text-left py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>CLIENT</th>
            <th className="text-left py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>QUOTE # / TITLE</th>
            <th className="text-left py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>DATE SENT</th>
            <th className="text-left py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>STATUS</th>
            <th className="text-right py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>TOTAL</th>
            <th className="text-right py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((quote) => {
            const statusColors = getStatusColor(quote.status)
            return (
              <tr
                key={quote.id}
                onClick={() => onRowClick(quote.workorderId)}
                className="border-b cursor-pointer transition-colors hover:bg-gray-50"
                style={{ borderBottomColor: '#EAEBED' }}
              >
                <td className="py-2 px-2 w-10" style={{ borderColor: '#EAEBED' }} onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedQuoteIds.has(quote.id)}
                    onChange={() => {}}
                    onClick={(e) => onToggleQuoteSelection(e, quote.id)}
                    className="w-3.5 h-3.5 rounded cursor-pointer"
                    style={{ accentColor: '#28AFB0' }}
                  />
                </td>
                <td className="py-2 px-2 text-xs" style={{ color: '#1F271B' }}>{quote.clientName}</td>
                <td className="py-2 px-2">
                  <p className="text-xs font-medium" style={{ color: '#1F271B' }}>{quote.quoteNumber}{quote.title ? ` ${quote.title}` : ''}</p>
                </td>
                <td className="py-2 px-2 text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>
                  {quote.dateSent ? format(new Date(quote.dateSent), 'MMM dd, yyyy') : '—'}
                </td>
                <td className="py-2 px-2">
                  <span
                    className="inline-block px-2 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: statusColors.bg, color: statusColors.text }}
                  >
                    {getStatusLabel(quote.status)}
                  </span>
                </td>
                <td className="py-2 px-2 text-right">
                  <span className="text-xs font-semibold" style={{ color: '#1F271B' }}>
                    Rs{quote.total.toFixed(2)}
                  </span>
                </td>
                <td className="py-2 px-2 text-right">
                  <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    {(quote.status === 'quote pending to send' || quote.status === 'draft' || quote.dateSent) && (
                      <button
                        type="button"
                        onClick={() => onSendQuote(quote.workorderId)}
                        className="p-1.5 rounded transition-all"
                        style={{ color: '#28AFB0', backgroundColor: 'transparent' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F0FDFA' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                        title={quote.dateSent ? 'Resend Quote' : 'Send Quote'}
                      >
                        <FiSend size={14} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => alert('PDF preview would open here')}
                      className="p-1.5 rounded transition-all"
                      style={{ color: '#1F271B', backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                      title="View PDF"
                    >
                      <FiFileText size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
