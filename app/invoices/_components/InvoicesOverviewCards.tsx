'use client'

import type { ReactNode } from 'react'
import { FiChevronRight } from 'react-icons/fi'

export interface OverviewLink {
  /** Stable row id (e.g. API status enum) */
  rowKey: string
  /** Value passed to status filter (table) */
  status: string
  label: string
  count: number
  amount: number
  bulletColor: string
}

export interface InvoicesOverviewCardsProps {
  overviewLinks: OverviewLink[]
  statusFilter: string
  setFilterFromOverview: (status: string) => void
  formatAmount: (n: number) => string
  issuedCount: number
  issuedTotal: number
  /** From API: averageInvoiceLast30Days */
  averageInvoiceLast30Days: number
  /** True while GET /api/invoices/overview is in flight */
  overviewLoading?: boolean
}

export default function InvoicesOverviewCards({
  overviewLinks,
  statusFilter,
  setFilterFromOverview,
  formatAmount,
  issuedCount,
  issuedTotal,
  averageInvoiceLast30Days,
  overviewLoading = false,
}: InvoicesOverviewCardsProps) {
  const loadingText = (content: ReactNode) =>
    overviewLoading ? (
      <span className="inline-block min-h-[1.25em] animate-pulse rounded bg-black/10" style={{ minWidth: '3rem' }}>
        …
      </span>
    ) : (
      content
    )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {/* Card 1: Overview (by status from API) */}
      <div
        className="rounded shadow-sm border overflow-hidden transition-all hover:shadow-md"
        style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        <div className="h-0.5" style={{ backgroundColor: '#28AFB0' }} />
        <div className="p-3">
          <div className="flex justify-between items-start mb-1.5">
            <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>
              Overview
            </p>
            <FiChevronRight size={12} style={{ color: '#1F271B', opacity: 0.5 }} />
          </div>
          <p className="text-[10px] mb-1.5" style={{ color: '#1F271B', opacity: 0.6 }}>
            By invoice status
          </p>
          <div className="space-y-1.5">
            {overviewLoading && overviewLinks.length === 0 ? (
              <div className="text-[10px] py-2" style={{ color: '#6B7280' }}>
                Loading overview…
              </div>
            ) : overviewLinks.length === 0 ? (
              <div className="text-[10px] py-2" style={{ color: '#6B7280' }}>
                No status breakdown yet
              </div>
            ) : (
              overviewLinks.map(({ rowKey, status, label, count, amount, bulletColor }) => (
                <button
                  key={rowKey}
                  type="button"
                  onClick={() => setFilterFromOverview(status)}
                  className="w-full flex items-center justify-between py-0.5 px-1 -mx-1 rounded text-left hover:bg-black/5 transition-colors"
                  style={{
                    backgroundColor: statusFilter === status ? 'rgba(40, 175, 176, 0.12)' : 'transparent',
                  }}
                >
                  <span className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: bulletColor }} />
                    <span className="text-[10px] truncate" style={{ color: '#1F271B', opacity: 0.7 }}>
                      {label}
                    </span>
                  </span>
                  <span className="text-xs font-semibold shrink-0 text-right" style={{ color: '#1F271B' }}>
                    {overviewLoading ? (
                      <span className="inline-block w-16 h-3 animate-pulse rounded bg-black/10 align-middle" />
                    ) : (
                      <>
                        {count} · {formatAmount(amount)}
                      </>
                    )}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Card 2: Issued last 30 days */}
      <div
        className="rounded shadow-sm border overflow-hidden transition-all hover:shadow-md"
        style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        <div className="h-0.5" style={{ backgroundColor: '#28AFB0' }} />
        <div className="p-3">
          <div className="flex justify-between items-start mb-1.5">
            <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>
              Issued
            </p>
            <FiChevronRight size={12} style={{ color: '#1F271B', opacity: 0.5 }} />
          </div>
          <p className="text-[10px] mb-1.5" style={{ color: '#1F271B', opacity: 0.6 }}>
            Last 30 days · issued invoices
          </p>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl font-bold" style={{ color: '#1F271B' }}>
              {loadingText(issuedCount)}
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: '#1F271B', opacity: 0.8 }}>
            {loadingText(formatAmount(issuedTotal))}
          </p>
        </div>
      </div>

      {/* Card 3: Average invoice last 30 days */}
      <div
        className="rounded shadow-sm border overflow-hidden transition-all hover:shadow-md"
        style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        <div className="h-0.5" style={{ backgroundColor: '#2B50AA' }} />
        <div className="p-3">
          <div className="flex justify-between items-start mb-1.5">
            <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>
              Average invoice
            </p>
            <FiChevronRight size={12} style={{ color: '#1F271B', opacity: 0.5 }} />
          </div>
          <p className="text-[10px] mb-1.5" style={{ color: '#1F271B', opacity: 0.6 }}>
            Last 30 days · issued invoices
          </p>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl font-bold" style={{ color: '#1F271B' }}>
              {loadingText(
                issuedCount > 0 || averageInvoiceLast30Days > 0
                  ? formatAmount(averageInvoiceLast30Days)
                  : formatAmount(0),
              )}
            </span>
          </div>
          <p className="text-[10px] mt-1" style={{ color: '#1F271B', opacity: 0.6 }}>
            Average total per issued invoice
          </p>
        </div>
      </div>
    </div>
  )
}
