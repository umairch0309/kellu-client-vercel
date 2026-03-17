'use client'

import { FiChevronRight } from 'react-icons/fi'

export type QuoteStats = Record<string, number>
export type JobStats = Record<string, number>
export type InvoiceStats = Record<string, number>

export interface WorkordersOverviewCardsProps {
  quoteStats: QuoteStats
  jobStats: JobStats
  invoiceStats: InvoiceStats
  quoteStatusFilter: string
  setQuoteStatusFilter: (v: string) => void
  jobStatusFilter: string
  setJobStatusFilter: (v: string) => void
  invoiceStatusFilter: string
  setInvoiceStatusFilter: (v: string) => void
}

const QUOTE_LABELS: Record<string, string> = {
  'not sent': 'Not Sent',
  'waiting for approval': 'Waiting for Approval',
  'approved': 'Approved',
}
const INVOICE_LABELS: Record<string, string> = {
  'not sent': 'Not Sent',
  'waiting for payment': 'Waiting for Payment',
  'paid': 'Paid',
}

export default function WorkordersOverviewCards({
  quoteStats,
  jobStats,
  invoiceStats,
  quoteStatusFilter,
  setQuoteStatusFilter,
  jobStatusFilter,
  setJobStatusFilter,
  invoiceStatusFilter,
  setInvoiceStatusFilter,
}: WorkordersOverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* Quote Status Block */}
      <div
        className="rounded shadow-sm border overflow-hidden transition-all hover:shadow-md"
        style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
      >
        <div className="h-0.5" style={{ backgroundColor: '#B084CC' }} />
        <div className="p-3">
          <div className="flex justify-between items-start mb-1.5">
            <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Quote Status</p>
            <FiChevronRight size={12} style={{ color: '#1F271B', opacity: 0.5 }} />
          </div>
          <div className="space-y-1.5">
            {(['not sent', 'waiting for approval', 'approved'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={(e) => { e.stopPropagation(); setQuoteStatusFilter(quoteStatusFilter === status ? 'all' : status) }}
                className="w-full flex items-center justify-between py-0.5 px-1 -mx-1 rounded text-left hover:bg-black/5 transition-colors"
                style={{ backgroundColor: quoteStatusFilter === status ? 'rgba(176, 132, 204, 0.15)' : 'transparent' }}
              >
                <span className="text-[10px]" style={{ color: '#1F271B', opacity: 0.7 }}>{QUOTE_LABELS[status] ?? status}</span>
                <span className="text-xs font-semibold" style={{ color: '#1F271B' }}>{quoteStats[status] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Job Status Block */}
      <div
        className="rounded shadow-sm border overflow-hidden transition-all hover:shadow-md"
        style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
      >
        <div className="h-0.5" style={{ backgroundColor: '#2B50AA' }} />
        <div className="p-3">
          <div className="flex justify-between items-start mb-1.5">
            <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Job Status</p>
            <FiChevronRight size={12} style={{ color: '#1F271B', opacity: 0.5 }} />
          </div>
          <div className="space-y-1.5">
            {(['Unscheduled', 'Scheduled', 'In Progress', 'Completed'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={(e) => { e.stopPropagation(); setJobStatusFilter(jobStatusFilter === status ? 'all' : status) }}
                className="w-full flex items-center justify-between py-0.5 px-1 -mx-1 rounded text-left hover:bg-black/5 transition-colors"
                style={{ backgroundColor: jobStatusFilter === status ? 'rgba(43, 80, 170, 0.12)' : 'transparent' }}
              >
                <span className="text-[10px]" style={{ color: '#1F271B', opacity: 0.7 }}>{status}</span>
                <span className="text-xs font-semibold" style={{ color: '#1F271B' }}>{jobStats[status] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Invoice Status Block */}
      <div
        className="rounded shadow-sm border overflow-hidden transition-all hover:shadow-md"
        style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
      >
        <div className="h-0.5" style={{ backgroundColor: '#28AFB0' }} />
        <div className="p-3">
          <div className="flex justify-between items-start mb-1.5">
            <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Invoice Status</p>
            <FiChevronRight size={12} style={{ color: '#1F271B', opacity: 0.5 }} />
          </div>
          <div className="space-y-1.5">
            {(['not sent', 'waiting for payment', 'paid'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={(e) => { e.stopPropagation(); setInvoiceStatusFilter(invoiceStatusFilter === status ? 'all' : status) }}
                className="w-full flex items-center justify-between py-0.5 px-1 -mx-1 rounded text-left hover:bg-black/5 transition-colors"
                style={{ backgroundColor: invoiceStatusFilter === status ? 'rgba(40, 175, 176, 0.12)' : 'transparent' }}
              >
                <span className="text-[10px]" style={{ color: '#1F271B', opacity: 0.7 }}>{INVOICE_LABELS[status] ?? status}</span>
                <span className="text-xs font-semibold" style={{ color: '#1F271B' }}>{invoiceStats[status] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
