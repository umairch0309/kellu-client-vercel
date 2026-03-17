'use client'

import { FiChevronUp } from 'react-icons/fi'

export interface ProfitabilityCardProps {
  showProfitability: boolean
  setShowProfitability: (show: boolean) => void
  totalLineItemPrice: number
  totalLineItemCost: number
  totalLabor: number
  totalExpenses: number
  profit: number
  profitMargin: string
  legendSquareStyle: React.CSSProperties
}

export default function ProfitabilityCard({
  showProfitability,
  setShowProfitability,
  totalLineItemPrice,
  totalLineItemCost,
  totalLabor,
  totalExpenses,
  profit,
  profitMargin,
  legendSquareStyle,
}: ProfitabilityCardProps) {
  if (!showProfitability) return null
  return (
    <div className="rounded-lg border p-4 bg-white" style={{ borderColor: '#EAEBED' }}>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setShowProfitability(false)}
          className="text-xs font-medium flex items-center gap-1 transition-colors"
          style={{ color: '#1F271B', opacity: 0.7 }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7' }}
        >
          Hide Profitability
          <FiChevronUp size={12} />
        </button>
      </div>
      <div className="border-b pb-4 mb-4" style={{ borderColor: '#EAEBED' }} />
      <div className="flex flex-wrap items-center gap-6 md:gap-8">
        <div>
          <p className="text-2xl font-bold mb-1" style={{ color: profit < 0 ? '#DC2626' : '#059669' }}>
            {profit < 0 ? '-' : ''}{profitMargin}%
          </p>
          <p className="text-sm font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Profit margin</p>
        </div>
        <div className="flex flex-wrap items-start gap-6 md:gap-8">
          <div className="min-w-[90px] text-right">
            <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Total price</p>
            <p className="text-sm font-bold tabular-nums" style={{ color: '#1F271B' }}>Rs{totalLineItemPrice.toFixed(2)}</p>
          </div>
          <div className="min-w-[90px] text-right">
            <div className="flex items-center justify-end gap-1.5 mb-1">
              <span className="shrink-0 rounded-sm" style={legendSquareStyle} />
              <p className="text-xs font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Line Item Cost</p>
            </div>
            <p className="text-sm font-bold tabular-nums" style={{ color: '#1F271B' }}>- Rs{totalLineItemCost.toFixed(2)}</p>
          </div>
          <div className="min-w-[90px] text-right">
            <div className="flex items-center justify-end gap-1.5 mb-1">
              <span className="shrink-0 rounded-sm" style={legendSquareStyle} />
              <p className="text-xs font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Labor</p>
            </div>
            <p className="text-sm font-bold tabular-nums" style={{ color: '#1F271B' }}>- Rs{totalLabor.toFixed(2)}</p>
          </div>
          <div className="min-w-[90px] text-right">
            <div className="flex items-center justify-end gap-1.5 mb-1">
              <span className="shrink-0 rounded-sm" style={legendSquareStyle} />
              <p className="text-xs font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Expenses</p>
            </div>
            <p className="text-sm font-bold tabular-nums" style={{ color: '#1F271B' }}>- Rs{totalExpenses.toFixed(2)}</p>
          </div>
          <div className="min-w-[90px] text-right">
            <div className="flex items-center justify-end gap-1.5 mb-1">
              <span className="shrink-0 rounded-sm" style={{ width: 8, height: 8, backgroundColor: '#059669', borderRadius: 1 }} />
              <p className="text-xs font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Profit</p>
            </div>
            <p className="text-sm font-bold tabular-nums px-2 py-1 rounded" style={{ color: profit < 0 ? '#DC2626' : '#059669', backgroundColor: '#E0F2F1' }}>= Rs{profit.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
