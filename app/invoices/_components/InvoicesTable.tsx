'use client'

import { format } from 'date-fns'
import { FiSend, FiFileText } from 'react-icons/fi'
import { formatUsd } from '@/lib/formatCurrency'
import type { InvoiceRow } from './invoicesListTypes'

export interface InvoicesTableProps {
  invoices: InvoiceRow[]
  onRowClick: (workorderId: string | number) => void
  /** POST /api/invoices/{invoiceId}/send — use invoice id, not work order id */
  onSendInvoice: (invoiceId: string | number) => void
  /** Opens print/PDF preview via usePDFDownload with invoice row data */
  onReviewInvoice: (inv: InvoiceRow) => void
  /** When set, send button shows busy state for that invoice id */
  sendingInvoiceId?: string | number | null
}

function getStatusColor(status: string) {
  if (status === 'paid') return { bg: 'rgba(40, 175, 176, 0.2)', text: '#1E8A8B' }
  if (status === 'waiting for payment') return { bg: 'rgba(245, 158, 11, 0.2)', text: '#B45309' }
  if (status === 'past due') return { bg: 'rgba(239, 68, 68, 0.15)', text: '#DC2626' }
  if (status === 'sent but not due') return { bg: 'rgba(59, 130, 246, 0.2)', text: '#2563EB' }
  if (status === 'invoice pending to send') return { bg: 'rgba(245, 158, 11, 0.2)', text: '#B45309' }
  if (status === 'bad debt') return { bg: 'rgba(239, 68, 68, 0.15)', text: '#DC2626' }
  return { bg: '#F3F4F6', text: '#1F271B' }
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    'past due': 'Past due',
    'sent but not due': 'Sent but not due',
    'invoice pending to send': 'Invoice pending to send',
    'waiting for payment': 'Waiting Payment',
    'paid': 'Paid',
    'bad debt': 'Bad Debt',
    cancelled: 'Cancelled',
  }
  return labels[status] ?? status
}

export default function InvoicesTable({
  invoices,
  onRowClick,
  onSendInvoice,
  onReviewInvoice,
  sendingInvoiceId = null,
}: InvoicesTableProps) {
  if (invoices.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm" style={{ color: '#1F271B', opacity: 0.6 }}>No invoices found.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b" style={{ borderBottomColor: '#EAEBED' }}>
            <th className="text-left py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>CLIENT</th>
            <th className="text-left py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>INVOICE # / TITLE</th>
            <th className="text-left py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>DUE DATE</th>
            <th className="text-left py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>STATUS</th>
            <th className="text-right py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>TOTAL</th>
            <th className="text-right py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>BALANCE</th>
            <th className="text-right py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => {
            const statusColors = getStatusColor(inv.status)
            return (
              <tr
                key={inv.id}
                onClick={() => onRowClick(inv.workorderId)}
                className="border-b cursor-pointer transition-colors hover:bg-gray-50"
                style={{ borderBottomColor: '#EAEBED' }}
              >
                <td className="py-2 px-2 text-xs" style={{ color: '#1F271B' }}>{inv.clientName}</td>
                <td className="py-2 px-2">
                  <p className="text-xs font-medium" style={{ color: '#1F271B' }}>{inv.invoiceNumber}{inv.title ? ` ${inv.title}` : ''}</p>
                </td>
                <td className="py-2 px-2 text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>
                  {inv.dueDate ? format(new Date(inv.dueDate), 'MMM dd, yyyy') : '—'}
                </td>
                <td className="py-2 px-2">
                  <span
                    className="inline-block px-2 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: statusColors.bg, color: statusColors.text }}
                  >
                    {getStatusLabel(inv.status)}
                  </span>
                </td>
                <td className="py-2 px-2 text-right">
                  <span className="text-xs font-semibold" style={{ color: '#1F271B' }}>{formatUsd(inv.total)}</span>
                </td>
                <td className="py-2 px-2 text-right">
                  <span className={`text-xs font-semibold ${inv.balance === 0 ? 'text-secondary' : 'text-tertiary'}`}>
                    {formatUsd(inv.balance)}
                  </span>
                </td>
                <td className="py-2 px-2 text-right">
                  <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    {(inv.status === 'invoice pending to send' || (inv.dateSent && inv.status !== 'cancelled')) && (
                      <button
                        type="button"
                        disabled={sendingInvoiceId != null && String(sendingInvoiceId) === String(inv.id)}
                        onClick={() => onSendInvoice(inv.id)}
                        className="p-1.5 rounded transition-all disabled:opacity-40 disabled:pointer-events-none"
                        style={{ color: '#28AFB0', backgroundColor: 'transparent' }}
                        onMouseEnter={(e) => {
                          if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#F0FDFA'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                        title={inv.dateSent ? 'Resend Invoice' : 'Send Invoice'}
                      >
                        <FiSend size={14} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onReviewInvoice(inv)}
                      className="p-1.5 rounded transition-all"
                      style={{ color: '#1F271B', backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F3F4F6'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                      title="Review generated document"
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
