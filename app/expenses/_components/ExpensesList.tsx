'use client'

import { useState } from 'react'
import { FiPlus, FiSearch } from 'react-icons/fi'
import { format } from 'date-fns'
import { mockExpenses, mockWorkorders, mockClients } from '@/data/mockData'
import ExpenseModal, { type ExpenseFormData } from './ExpenseModal'

type ExpenseRecord = typeof mockExpenses[0]

export default function ExpensesList() {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => [...mockExpenses])
  const [searchTerm, setSearchTerm] = useState('')
  const [startDateFilter, setStartDateFilter] = useState('')
  const [endDateFilter, setEndDateFilter] = useState('')
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null)

  const openNewExpense = () => {
    setEditingExpense(null)
    setIsExpenseModalOpen(true)
  }
  const openEditExpense = (expense: ExpenseRecord) => {
    setEditingExpense(expense)
    setIsExpenseModalOpen(true)
  }
  const closeExpenseModal = () => {
    setIsExpenseModalOpen(false)
    setEditingExpense(null)
  }

  const filteredExpenses = expenses.filter(expense => {
    const term = searchTerm.toLowerCase().trim()
      const workorder = expense.linkedWorkorder ? mockWorkorders.find(wo => wo.id === expense.linkedWorkorder) : null
    const client = workorder ? mockClients.find(c => c.id === workorder.clientId) : null

    const matchesSearch = !term ||
      expense.itemName.toLowerCase().includes(term) ||
      (expense.details && expense.details.toLowerCase().includes(term)) ||
      (expense.invoiceNumber && expense.invoiceNumber.toLowerCase().includes(term)) ||
      (workorder && (`wo #${workorder.id}`.includes(term) || workorder.title.toLowerCase().includes(term))) ||
      (client && client.name.toLowerCase().includes(term))

    const matchesDateRange = (!startDateFilter || expense.date >= startDateFilter) &&
      (!endDateFilter || expense.date <= endDateFilter)

    return matchesSearch && matchesDateRange
  })

  const handleSaveExpense = (data: ExpenseFormData) => {
    if (editingExpense) {
      const updated = {
        ...editingExpense,
        date: data.date,
        itemName: data.itemName,
        details: data.details,
        total: data.total,
        linkedWorkorder: data.linkedWorkorder,
        invoiceNumber: data.invoiceNumber,
      }
      setExpenses(prev => prev.map(e => e.id === editingExpense.id ? updated : e))
      const idx = mockExpenses.findIndex(e => e.id === editingExpense.id)
      if (idx >= 0) Object.assign(mockExpenses[idx], updated)
    } else {
      const newId = expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1
      const newExpense: ExpenseRecord = {
        id: newId,
        date: data.date,
        itemName: data.itemName,
        details: data.details,
        total: data.total,
        linkedWorkorder: data.linkedWorkorder,
        invoiceNumber: data.invoiceNumber,
        attachment: '',
      }
      setExpenses(prev => [...prev, newExpense])
      mockExpenses.push(newExpense)
    }
    closeExpenseModal()
  }

  return (
    <div className="space-y-3" style={{ backgroundColor: 'white', minHeight: '100vh', padding: '1rem 0' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#1F271B' }}>Expenses</h1>
        <button
          onClick={openNewExpense}
          className="px-3 py-1.5 rounded text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md"
          style={{ backgroundColor: '#28AFB0' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1E8A8B'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#28AFB0'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <FiPlus size={14} />
          <span>New Expense</span>
        </button>
      </div>

      {/* Expenses Table - title + date filter + search in one line (consistent with Workorders) */}
      <div className="bg-white rounded shadow-sm border overflow-hidden" style={{ borderColor: '#EAEBED' }}>
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 p-3 border-b" style={{ borderBottomColor: '#EAEBED' }}>
          <h2 className="text-base font-bold" style={{ color: '#1F271B' }}>
            All expenses ({filteredExpenses.length} result{filteredExpenses.length !== 1 ? 's' : ''})
          </h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 sm:flex-initial justify-end">
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="px-2.5 py-1.5 border rounded text-xs transition-all"
                style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              />
              <span style={{ color: '#1F271B', opacity: 0.5 }}>to</span>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="px-2.5 py-1.5 border rounded text-xs transition-all"
                style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              />
            </div>
            <div className="relative flex-1 sm:flex-initial sm:min-w-[200px]">
              <FiSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2" size={14} style={{ color: '#1F271B', opacity: 0.5 }} />
            <input
              type="text"
                placeholder="Search by item, details, invoice #, workorder, or client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border rounded text-xs transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
                style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#28AFB0'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#EAEBED'
                  e.currentTarget.style.boxShadow = 'none'
                }}
            />
          </div>
        </div>
        </div>
        {filteredExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderBottomColor: '#EAEBED' }}>
                  <th className="text-left py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>NAME</th>
                  <th className="text-left py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>DETAILS</th>
                  <th className="text-left py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>DATE</th>
                  <th className="text-left py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>LINKED WORKORDER</th>
                  <th className="text-right py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => {
                  const workorder = expense.linkedWorkorder ? mockWorkorders.find(wo => wo.id === expense.linkedWorkorder) : null
                  const client = workorder ? mockClients.find(c => c.id === workorder.clientId) : null
                  return (
                    <tr
                      key={expense.id}
                      onClick={() => openEditExpense(expense)}
                      className="border-b transition-colors cursor-pointer hover:bg-gray-50"
                      style={{ borderBottomColor: '#EAEBED' }}
                    >
                      <td className="py-2 px-2">
                        <p className="text-xs font-medium" style={{ color: '#1F271B' }}>{expense.itemName}</p>
                      </td>
                      <td className="py-2 px-2 text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>
                        {expense.details || '—'}
                      </td>
                      <td className="py-2 px-2 text-xs" style={{ color: '#1F271B' }}>
                        {format(new Date(expense.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="py-2 px-2">
                        {expense.linkedWorkorder ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-medium" style={{ color: '#28AFB0' }}>
                              WO #{expense.linkedWorkorder}
                            </span>
                            {client && (
                              <span className="text-[10px]" style={{ color: '#1F271B', opacity: 0.6 }}>
                                {client.name}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: '#1F271B', opacity: 0.5 }}>—</span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-right">
                        <span className="text-xs font-semibold" style={{ color: '#1F271B' }}>
                          Rs{expense.total.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm" style={{ color: '#1F271B', opacity: 0.6 }}>
              No expenses found. Click "New Expense" to add one.
            </p>
          </div>
        )}
      </div>

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={closeExpenseModal}
        expense={editingExpense}
        onSave={handleSaveExpense}
      />
    </div>
  )
}
