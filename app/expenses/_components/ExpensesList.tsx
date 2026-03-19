'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { format, parseISO, isValid } from 'date-fns'
import { formatUsd } from '@/lib/formatCurrency'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import ExpenseModal from './ExpenseModal'
import type { ExpenseListRow } from './expensesListTypes'
import { extractExpensesResponse, apiExpenseToRow } from '../_lib/expensesListApi'

const DEFAULT_PAGE_LIMIT = 25

function formatRowDate(dateStr: string) {
  if (!dateStr) return '—'
  try {
    const d = parseISO(dateStr)
    return isValid(d) ? format(d, 'MMM dd, yyyy') : '—'
  } catch {
    return '—'
  }
}

export default function ExpensesList() {
  const [expenses, setExpenses] = useState<ExpenseListRow[]>([])
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_PAGE_LIMIT,
    total: 0,
    totalPages: 1,
  })
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [startDateFilter, setStartDateFilter] = useState('')
  const [endDateFilter, setEndDateFilter] = useState('')
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<ExpenseListRow | null>(null)
  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseListRow | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
      const qs = new URLSearchParams({ page: String(page), limit: String(DEFAULT_PAGE_LIMIT) })
      const res = await fetch(`${baseUrl}/api/expenses?${qs.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = (json as { message?: string }).message ?? `Failed to load expenses (${res.status})`
        setFetchError(msg)
        setExpenses([])
        return
      }
      const parsed = extractExpensesResponse(json)
      if (!parsed) {
        setFetchError('Invalid expenses response')
        setExpenses([])
        return
      }
      setExpenses(parsed.items.map((raw, i) => apiExpenseToRow(raw, i)))
      setPagination(parsed.pagination)
    } catch {
      setFetchError('Failed to load expenses')
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    void fetchExpenses()
  }, [fetchExpenses])

  const openNewExpense = () => {
    setEditingExpense(null)
    setIsExpenseModalOpen(true)
  }

  const openEditExpense = (expense: ExpenseListRow) => {
    setEditingExpense(expense)
    setIsExpenseModalOpen(true)
  }

  const closeExpenseModal = () => {
    setIsExpenseModalOpen(false)
    setEditingExpense(null)
  }

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const term = searchTerm.toLowerCase().trim()
      const matchesSearch =
        !term ||
        expense.itemName.toLowerCase().includes(term) ||
        (expense.details && expense.details.toLowerCase().includes(term)) ||
        (expense.invoiceNumber && expense.invoiceNumber.toLowerCase().includes(term)) ||
        (expense.workOrderLabel && expense.workOrderLabel.toLowerCase().includes(term)) ||
        (expense.clientName && expense.clientName.toLowerCase().includes(term)) ||
        (expense.workOrderId && expense.workOrderId.toLowerCase().includes(term))

      const matchesDateRange =
        (!startDateFilter || !expense.date || expense.date >= startDateFilter) &&
        (!endDateFilter || !expense.date || expense.date <= endDateFilter)

      return matchesSearch && matchesDateRange
    })
  }, [expenses, searchTerm, startDateFilter, endDateFilter])

  const handleDeleteExpenseConfirm = async () => {
    if (!expenseToDelete) return
    const id = String(expenseToDelete.id).trim()
    if (!id) return
    setDeleteLoading(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
      const res = await fetch(`${baseUrl}/api/expenses/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
      if (res.status === 204) {
        setExpenseToDelete(null)
        void fetchExpenses()
        return
      }
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg =
          (json as { message?: string }).message ??
          (json as { errors?: { message?: string }[] })?.errors?.[0]?.message ??
          `Failed to delete expense (${res.status})`
        alert(msg)
        return
      }
      if ((json as { success?: boolean }).success === false) {
        alert((json as { message?: string }).message ?? 'Delete failed.')
        return
      }
      setExpenseToDelete(null)
      void fetchExpenses()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete expense')
    } finally {
      setDeleteLoading(false)
    }
  }

  const modalExpense = useMemo(() => {
    if (!editingExpense) return null
    return {
      id: editingExpense.id,
      date: editingExpense.date || format(new Date(), 'yyyy-MM-dd'),
      itemName: editingExpense.itemName,
      details: editingExpense.details,
      total: editingExpense.total,
      linkedWorkorder: editingExpense.linkedWorkorder,
      invoiceNumber: editingExpense.invoiceNumber,
      attachmentUrl: editingExpense.attachmentUrl,
      linkedWorkorderDisplay:
        editingExpense.workOrderId != null
          ? `${editingExpense.workOrderLabel}${
              editingExpense.clientName ? ` — ${editingExpense.clientName}` : ''
            }`
          : undefined,
    }
  }, [editingExpense])

  return (
    <div className="space-y-3" style={{ backgroundColor: 'white', minHeight: '100vh', padding: '1rem 0' }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#1F271B' }}>
          Expenses
        </h1>
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

      <div className="bg-white rounded shadow-sm border overflow-hidden" style={{ borderColor: '#EAEBED' }}>
        <div
          className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 p-3 border-b"
          style={{ borderBottomColor: '#EAEBED' }}
        >
          <div>
            <h2 className="text-base font-bold" style={{ color: '#1F271B' }}>
              All expenses ({filteredExpenses.length} result{filteredExpenses.length !== 1 ? 's' : ''})
            </h2>
            {!loading && pagination.total > 0 && (
              <p className="text-xs mt-0.5" style={{ color: '#1F271B', opacity: 0.6 }}>
                Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
              </p>
            )}
          </div>
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
              <FiSearch
                className="absolute left-2.5 top-1/2 transform -translate-y-1/2"
                size={14}
                style={{ color: '#1F271B', opacity: 0.5 }}
              />
              <input
                type="text"
                placeholder="Search by item, details, invoice #, work order, or client..."
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

        {fetchError && (
          <div className="mx-3 mt-3 p-3 rounded text-sm" style={{ backgroundColor: '#FEF2F2', color: '#B91C1C' }}>
            {fetchError}
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center">
            <p className="text-sm" style={{ color: '#1F271B', opacity: 0.7 }}>
              Loading expenses…
            </p>
          </div>
        ) : filteredExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <TooltipProvider delayDuration={200}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderBottomColor: '#EAEBED' }}>
                    <th className="text-left py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>
                      NAME
                    </th>
                    <th className="text-left py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>
                      DETAILS
                    </th>
                    <th className="text-left py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>
                      DATE
                    </th>
                    <th className="text-left py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>
                      LINKED WORKORDER
                    </th>
                    <th className="text-right py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>
                      TOTAL
                    </th>
                    <th className="text-right py-2 px-2 font-medium text-xs w-24" style={{ color: '#1F271B', opacity: 0.7 }}>
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => (
                    <tr
                      key={expense.id}
                      onClick={() => openEditExpense(expense)}
                      className="border-b transition-colors cursor-pointer hover:bg-gray-50"
                      style={{ borderBottomColor: '#EAEBED' }}
                    >
                      <td className="py-2 px-2">
                        <p className="text-xs font-medium" style={{ color: '#1F271B' }}>
                          {expense.itemName}
                        </p>
                      </td>
                      <td className="py-2 px-2 text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>
                        {expense.details || '—'}
                      </td>
                      <td className="py-2 px-2 text-xs" style={{ color: '#1F271B' }}>
                        {formatRowDate(expense.date)}
                      </td>
                      <td className="py-2 px-2">
                        {expense.workOrderId ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-medium" style={{ color: '#28AFB0' }}>
                              {expense.workOrderLabel}
                            </span>
                            {expense.clientName && (
                              <span className="text-[10px]" style={{ color: '#1F271B', opacity: 0.6 }}>
                                {expense.clientName}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: '#1F271B', opacity: 0.5 }}>
                            —
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-right">
                        <span className="text-xs font-semibold" style={{ color: '#1F271B' }}>
                          {formatUsd(expense.total)}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={() => openEditExpense(expense)}
                                className="p-1.5 rounded transition-colors hover:opacity-90"
                                style={{ color: '#28AFB0' }}
                                aria-label="Update expense"
                              >
                                <FiEdit2 size={16} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="z-[100]">
                              Update expense
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={() => setExpenseToDelete(expense)}
                                className="p-1.5 rounded hover:bg-red-50 transition-colors"
                                style={{ color: '#B91C1C' }}
                                aria-label="Delete expense"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="z-[100]">
                              Delete expense
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TooltipProvider>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm" style={{ color: '#1F271B', opacity: 0.6 }}>
              No expenses found. Click &quot;New Expense&quot; to add one.
            </p>
          </div>
        )}

        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-end gap-2 p-3 border-t" style={{ borderColor: '#EAEBED' }}>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded text-xs font-medium border disabled:opacity-40"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded text-xs font-medium border disabled:opacity-40"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={closeExpenseModal}
        expense={modalExpense}
        onExpenseCreated={() => void fetchExpenses()}
        onExpenseUpdated={() => void fetchExpenses()}
      />

      <Dialog
        open={!!expenseToDelete}
        onOpenChange={(open) => {
          if (!open) setExpenseToDelete(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete expense</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{expenseToDelete?.itemName ?? 'this expense'}&quot;? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setExpenseToDelete(null)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={() => void handleDeleteExpenseConfirm()} disabled={deleteLoading}>
              {deleteLoading ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
