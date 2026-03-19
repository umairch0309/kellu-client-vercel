'use client'

import { FiPlus } from 'react-icons/fi'
import { format } from 'date-fns'
import { formatUsd } from '@/lib/formatCurrency'
import type { ExpenseForm } from './workorderDetailTypes'

export interface ExpensesSectionProps {
  workorderId: number | string
  editedExpenses: any[]
  onAddExpense: () => void
  onEditExpense: (index: number, exp: any) => void
}

export default function ExpensesSection({ workorderId, editedExpenses, onAddExpense, onEditExpense }: ExpensesSectionProps) {
  return (
    <div className="rounded-lg border p-4 bg-white" style={{ borderColor: '#EAEBED' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold" style={{ color: '#1F271B' }}>Expenses</h2>
        <button
          onClick={onAddExpense}
          className="px-3 py-1.5 border rounded text-xs font-medium flex items-center gap-1.5 transition-all"
          style={{ borderColor: '#28AFB0', color: '#28AFB0', backgroundColor: 'white' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F0FDFA' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white' }}
        >
          <FiPlus size={12} />
          <span>New Expense</span>
        </button>
      </div>
      <p className="text-sm mb-3" style={{ color: '#1F271B', opacity: 0.6 }}>
        Get an accurate picture of various job costs by recording expenses
      </p>
      {editedExpenses.length > 0 ? (
        <div className="border rounded-lg overflow-hidden" style={{ borderColor: '#EAEBED' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left" style={{ borderColor: '#EAEBED', backgroundColor: '#F9FAFB' }}>
                <th className="py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Date</th>
                <th className="py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Item</th>
                <th className="py-2 px-2 font-medium text-right" style={{ color: '#1F271B', opacity: 0.7 }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {editedExpenses.map((exp: any, index: number) => (
                <tr
                  key={index}
                  className="border-b cursor-pointer transition-colors"
                  style={{ borderColor: '#EAEBED' }}
                  onClick={() => onEditExpense(index, exp)}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}
                >
                  <td className="py-2 px-2" style={{ color: '#1F271B' }}>{exp.date ? format(new Date(exp.date), 'MMM d, yyyy') : '—'}</td>
                  <td className="py-2 px-2" style={{ color: '#1F271B' }}>{exp.itemName || '—'}</td>
                  <td className="py-2 px-2 text-right tabular-nums" style={{ color: '#1F271B' }}>{formatUsd(Number(exp.total) || Number(exp.amount) || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
