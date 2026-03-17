'use client'

import { FiChevronRight, FiTrendingUp } from 'react-icons/fi'

export interface OverviewLink {
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
  averageBeforeTax: number
}

export default function InvoicesOverviewCards({
  overviewLinks,
  statusFilter,
  setFilterFromOverview,
  formatAmount,
  issuedCount,
  issuedTotal,
  averageBeforeTax,
}: InvoicesOverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {/* Card 1: Overview */}
      <div
        className="rounded shadow-sm border overflow-hidden transition-all hover:shadow-md"
        style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
      >
        <div className="h-0.5" style={{ backgroundColor: '#28AFB0' }} />
        <div className="p-3">
          <div className="flex justify-between items-start mb-1.5">
            <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Overview</p>
            <FiChevronRight size={12} style={{ color: '#1F271B', opacity: 0.5 }} />
          </div>
          <div className="space-y-1.5">
            {overviewLinks.map(({ status, label, count, amount, bulletColor }) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterFromOverview(status)}
                className="w-full flex items-center justify-between py-0.5 px-1 -mx-1 rounded text-left hover:bg-black/5 transition-colors"
                style={{ backgroundColor: statusFilter === status ? 'rgba(40, 175, 176, 0.12)' : 'transparent' }}
              >
                <span className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: bulletColor }} />
                  <span className="text-[10px] truncate" style={{ color: '#1F271B', opacity: 0.7 }}>{label}</span>
                </span>
                <span className="text-xs font-semibold shrink-0 text-right" style={{ color: '#1F271B' }}>{count} · {formatAmount(amount)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Card 2: Issued */}
      <div
        className="rounded shadow-sm border overflow-hidden transition-all hover:shadow-md"
        style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
      >
        <div className="h-0.5" style={{ backgroundColor: '#28AFB0' }} />
        <div className="p-3">
          <div className="flex justify-between items-start mb-1.5">
            <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Issued</p>
            <FiChevronRight size={12} style={{ color: '#1F271B', opacity: 0.5 }} />
          </div>
          <p className="text-[10px] mb-1.5" style={{ color: '#1F271B', opacity: 0.6 }}>Past 30 days</p>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl font-bold" style={{ color: '#1F271B' }}>{issuedCount}</span>
            {issuedCount > 0 && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#15803D' }}>
                <FiTrendingUp size={12} /> +100%
              </span>
            )}
          </div>
          <p className="text-xs mt-1" style={{ color: '#1F271B', opacity: 0.8 }}>{formatAmount(issuedTotal)}</p>
        </div>
      </div>

      {/* Card 3: Average invoice */}
      <div
        className="rounded shadow-sm border overflow-hidden transition-all hover:shadow-md"
        style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
      >
        <div className="h-0.5" style={{ backgroundColor: '#2B50AA' }} />
        <div className="p-3">
          <div className="flex justify-between items-start mb-1.5">
            <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Average invoice</p>
            <FiChevronRight size={12} style={{ color: '#1F271B', opacity: 0.5 }} />
          </div>
          <p className="text-[10px] mb-1.5" style={{ color: '#1F271B', opacity: 0.6 }}>Past 30 days</p>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl font-bold" style={{ color: '#1F271B' }}>{issuedCount > 0 ? formatAmount(averageBeforeTax) : '$0'}</span>
            {issuedCount > 0 && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#15803D' }}>
                <FiTrendingUp size={12} /> +100%
              </span>
            )}
          </div>
          <p className="text-[10px] mt-1" style={{ color: '#1F271B', opacity: 0.6 }}>Before taxes</p>
        </div>
      </div>
    </div>
  )
}
