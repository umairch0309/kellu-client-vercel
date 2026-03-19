'use client'

import { companyTaxRatePercent } from '@/data/mockData'
import { formatUsd } from '@/lib/formatCurrency'

export interface SummaryCardProps {
  workorder: any
  editedLineItems: any[]
  totalLabor: number
  totalExpenses: number
  totalPayments: number
}

export default function SummaryCard({ workorder, editedLineItems, totalLabor, totalExpenses, totalPayments }: SummaryCardProps) {
  const subtotal = editedLineItems.reduce((sum: number, item: any) => sum + item.total, 0)
  const disc = workorder.discount > 0 ? (workorder.discountType === 'percentage' ? (subtotal * workorder.discount / 100) : workorder.discount) : 0
  const afterDisc = subtotal - disc
  const tax = (afterDisc * companyTaxRatePercent / 100)
  const cost = editedLineItems.reduce((s: number, i: any) => s + (i.unitCost * i.quantity), 0) + totalLabor + totalExpenses
  const margin = workorder.total - cost

  return (
    <div className="rounded-lg border p-4 bg-white" style={{ borderColor: '#EAEBED' }}>
      <h2 className="text-sm font-semibold mb-4" style={{ color: '#1F271B' }}>Summary</h2>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span style={{ color: '#1F271B', opacity: 0.8 }}>Subtotal</span>
          <span className="tabular-nums" style={{ color: '#1F271B' }}>{formatUsd(subtotal)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span style={{ color: '#1F271B', opacity: 0.8 }}>Discount{workorder.discount > 0 ? (workorder.discountType === 'percentage' ? ` (${workorder.discount}%)` : ' (Amount)') : ''}</span>
          <span className="tabular-nums" style={{ color: '#1F271B' }}>{workorder.discount > 0 ? formatUsd(-disc) : '—'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span style={{ color: '#1F271B', opacity: 0.8 }}>Tax ({companyTaxRatePercent}%)</span>
          <span className="tabular-nums" style={{ color: '#1F271B' }}>{formatUsd(tax)}</span>
        </div>
        <div className="flex justify-between items-center font-semibold">
          <span style={{ color: '#1F271B' }}>Total</span>
          <span className="tabular-nums" style={{ color: '#1F271B' }}>{formatUsd(workorder.total)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span style={{ color: '#1F271B', opacity: 0.8 }}>Cost</span>
          <span className="tabular-nums" style={{ color: '#1F271B' }}>{formatUsd(cost)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span style={{ color: '#1F271B', opacity: 0.8 }}>Expenses</span>
          <span className="tabular-nums" style={{ color: '#1F271B' }}>{formatUsd(totalExpenses)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span style={{ color: '#1F271B', opacity: 0.8 }}>Estimated Margin</span>
          <span className="tabular-nums" style={{ color: margin < 0 ? '#DC2626' : '#059669' }}>{formatUsd(margin)}</span>
        </div>
        <div className="my-4" style={{ borderTop: '2px dashed rgba(31, 39, 27, 0.4)' }} />
        {totalPayments > 0 && (
          <div className="pl-4 space-y-2">
            <div className="flex justify-between items-center">
              <span style={{ color: '#1F271B', opacity: 0.8 }}>Payments</span>
              <span className="tabular-nums" style={{ color: '#1F271B' }}>{formatUsd(totalPayments)}</span>
            </div>
          </div>
        )}
        <div className="flex justify-between items-center font-bold pt-2">
          <span style={{ color: '#1F271B' }}>Balance</span>
          <span className="tabular-nums" style={{ color: '#1F271B' }}>{formatUsd(workorder.total - totalPayments)}</span>
        </div>
      </div>
    </div>
  )
}
