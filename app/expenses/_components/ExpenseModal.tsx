'use client'

import { useState, useRef, useEffect } from 'react'
import { FiX, FiSave, FiUpload } from 'react-icons/fi'
import { format } from 'date-fns'
import type { WorkorderRow } from '@/app/workorders/_components/WorkordersTable'
import { fetchWorkordersList, formatWorkorderOptionLabel } from '@/lib/workordersListApi'
import { extractCreatedExpenseFromResponse } from '../_lib/expensesListApi'

export type ExpenseFormData = {
  date: string
  itemName: string
  details: string
  total: number
  linkedWorkorder: string | number | null
  invoiceNumber: string
  attachment: File | null
}

export type ExpenseRecord = {
  id: string | number
  date: string
  itemName: string
  details: string
  total: number
  linkedWorkorder: string | number | null
  invoiceNumber: string
  attachment?: string | File | null
  attachmentUrl?: string | null
  /** Shown when linked work order is not in the fetched list (e.g. stale id) */
  linkedWorkorderDisplay?: string
}

interface ExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  /** When set, form is pre-filled and we're editing */
  expense?: ExpenseRecord | null
  /** Called after successful PATCH /api/expenses/{id}. */
  onExpenseUpdated?: () => void
  /** Called after successful POST /api/expenses (new expense). */
  onExpenseCreated?: () => void
}

const inputFocusStyle = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = '#28AFB0'
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)'
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = '#EAEBED'
    e.currentTarget.style.boxShadow = 'none'
  },
}

export default function ExpenseModal({
  isOpen,
  onClose,
  expense,
  onExpenseUpdated,
  onExpenseCreated,
}: ExpenseModalProps) {
  const [workorderSearchTerm, setWorkorderSearchTerm] = useState('')
  const [isWorkorderDropdownOpen, setIsWorkorderDropdownOpen] = useState(false)
  const workorderDropdownRef = useRef<HTMLDivElement>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [apiWorkorders, setApiWorkorders] = useState<WorkorderRow[]>([])
  const [workordersLoading, setWorkordersLoading] = useState(false)
  const [workordersError, setWorkordersError] = useState<string | null>(null)

  const [formData, setFormData] = useState<ExpenseFormData>({
    date: format(new Date(), 'yyyy-MM-dd'),
    itemName: '',
    details: '',
    total: 0,
    linkedWorkorder: null,
    invoiceNumber: '',
    attachment: null,
  })

  useEffect(() => {
    if (!isOpen) return
    setSaveError(null)
    if (expense) {
      setFormData({
        date: expense.date,
        itemName: expense.itemName,
        details: expense.details || '',
        total: expense.total,
        linkedWorkorder: expense.linkedWorkorder ?? null,
        invoiceNumber: expense.invoiceNumber || '',
        attachment: null,
      })
      setWorkorderSearchTerm('')
    } else {
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        itemName: '',
        details: '',
        total: 0,
        linkedWorkorder: null,
        invoiceNumber: '',
        attachment: null,
      })
      setWorkorderSearchTerm('')
    }
  }, [isOpen, expense])

  useEffect(() => {
    if (!isOpen) return
    let cancelled = false
    setWorkordersLoading(true)
    setWorkordersError(null)
    fetchWorkordersList({ limit: 500 })
      .then((list) => {
        if (!cancelled) setApiWorkorders(list)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setWorkordersError(err instanceof Error ? err.message : 'Failed to load work orders')
          setApiWorkorders([])
        }
      })
      .finally(() => {
        if (!cancelled) setWorkordersLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (workorderDropdownRef.current && !workorderDropdownRef.current.contains(event.target as Node)) {
        setIsWorkorderDropdownOpen(false)
      }
    }
    if (isWorkorderDropdownOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isWorkorderDropdownOpen])

  const linkedWorkorderRow =
    formData.linkedWorkorder != null
      ? apiWorkorders.find((wo) => String(wo.id) === String(formData.linkedWorkorder))
      : null

  const searchLower = workorderSearchTerm.toLowerCase().trim()
  const filteredWorkorders = apiWorkorders.filter((wo) => {
    if (!searchLower) return true
    return (
      wo.title.toLowerCase().includes(searchLower) ||
      wo.clientName.toLowerCase().includes(searchLower) ||
      String(wo.id).toLowerCase().includes(searchLower) ||
      (wo.workOrderNumber != null &&
        String(wo.workOrderNumber).toLowerCase().includes(searchLower))
    )
  })

  const workorderFieldDisplay =
    workorderSearchTerm ||
    expense?.linkedWorkorderDisplay ||
    (linkedWorkorderRow ? formatWorkorderOptionLabel(linkedWorkorderRow) : '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError(null)

    const date = (formData.date || '').trim()
    const itemName = (formData.itemName || '').trim()
    const totalNum = Number(formData.total)

    if (!date) {
      setSaveError('Date is required.')
      return
    }
    if (!itemName) {
      setSaveError('Item name is required.')
      return
    }
    if (!Number.isFinite(totalNum) || totalNum < 0) {
      setSaveError('Total is required and must be a number (0 or greater).')
      return
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    const detailsTrim = (formData.details || '').trim()
    const invoiceTrim = (formData.invoiceNumber || '').trim()
    const workOrderId =
      formData.linkedWorkorder != null && String(formData.linkedWorkorder).trim() !== ''
        ? String(formData.linkedWorkorder)
        : null

    const isEdit = Boolean(expense)
    const expenseId = expense ? String(expense.id).trim() : ''
    if (isEdit && !expenseId) {
      setSaveError('Missing expense id.')
      return
    }

    const url = isEdit
      ? `${baseUrl}/api/expenses/${encodeURIComponent(expenseId)}`
      : `${baseUrl}/api/expenses`
    const method = isEdit ? 'PATCH' : 'POST'

    setSaving(true)
    try {
      let res: Response
      if (formData.attachment) {
        const fd = new FormData()
        fd.append('date', date)
        fd.append('itemName', itemName)
        fd.append('total', String(totalNum))
        if (detailsTrim) fd.append('details', detailsTrim)
        if (invoiceTrim) fd.append('invoiceNumber', invoiceTrim)
        if (workOrderId) fd.append('workOrderId', workOrderId)
        fd.append('attachment', formData.attachment)
        res = await fetch(url, { method, credentials: 'include', body: fd })
      } else {
        const body: Record<string, unknown> = {
          date,
          itemName,
          total: totalNum,
        }
        if (detailsTrim) body.details = detailsTrim
        if (invoiceTrim) body.invoiceNumber = invoiceTrim
        if (workOrderId) body.workOrderId = workOrderId
        res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        })
      }

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        const msg =
          (json as { message?: string }).message ??
          (json as { errors?: { message?: string }[] })?.errors?.[0]?.message ??
          `Failed to ${isEdit ? 'update' : 'create'} expense (${res.status})`
        setSaveError(msg)
        return
      }

      if (res.status === 204) {
        if (isEdit) onExpenseUpdated?.()
        else onExpenseCreated?.()
        onClose()
        return
      }

      const json = await res.json().catch(() => ({}))
      if ((json as { success?: boolean }).success === false) {
        setSaveError((json as { message?: string }).message ?? 'Request was not successful.')
        return
      }
      if (!extractCreatedExpenseFromResponse(json)) {
        setSaveError('Invalid response from server.')
        return
      }

      if (isEdit) {
        onExpenseUpdated?.()
      } else {
        onExpenseCreated?.()
      }
      onClose()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : `Failed to ${isEdit ? 'update' : 'create'} expense`)
    } finally {
      setSaving(false)
    }
  }

  const handleWorkorderSelect = (wo: WorkorderRow) => {
    setFormData((prev) => ({ ...prev, linkedWorkorder: wo.id }))
    setIsWorkorderDropdownOpen(false)
    setWorkorderSearchTerm('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col" style={{ border: '1px solid #EAEBED' }}>
        <div className="flex justify-between items-center px-4 py-3 border-b shrink-0" style={{ borderColor: '#EAEBED' }}>
          <h2 className="text-base font-semibold" style={{ color: '#1F271B' }}>{expense ? 'Edit Expense' : 'New Expense'}</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded hover:bg-gray-100" style={{ color: '#1F271B' }}>
            <FiX size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border rounded text-sm"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              required
              {...inputFocusStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Item name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.itemName}
              onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
              placeholder="Enter item name"
              className="w-full px-3 py-2 border rounded text-sm"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              required
              {...inputFocusStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>
              Details <span style={{ color: '#6B7280', fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              placeholder="Enter expense details (optional)"
              rows={2}
              className="w-full px-3 py-2 border rounded text-sm resize-none"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              {...inputFocusStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Total <span className="text-red-500">*</span></label>
            <input
              type="number"
              value={formData.total || ''}
              onChange={(e) => setFormData({ ...formData, total: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              min={0}
              step={0.01}
              className="w-full px-3 py-2 border rounded text-sm"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              required
              {...inputFocusStyle}
            />
          </div>
          <div className="relative" ref={workorderDropdownRef}>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>
              Linked work order <span style={{ color: '#6B7280', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="text"
              value={workorderFieldDisplay}
              onChange={(e) => {
                setWorkorderSearchTerm(e.target.value)
                setIsWorkorderDropdownOpen(true)
              }}
              onFocus={() => setIsWorkorderDropdownOpen(true)}
              placeholder="Search work order (optional)…"
              className="w-full px-3 py-2 border rounded text-sm"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
            />
            {isWorkorderDropdownOpen && (
              <div
                className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-48 overflow-y-auto"
                style={{ borderColor: '#EAEBED' }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, linkedWorkorder: null }))
                    setWorkorderSearchTerm('')
                    setIsWorkorderDropdownOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-b"
                  style={{ borderColor: '#EAEBED' }}
                >
                  None (global expense)
                </button>
                {workordersLoading && (
                  <div className="px-3 py-2 text-xs" style={{ color: '#6B7280' }}>
                    Loading work orders…
                  </div>
                )}
                {workordersError && !workordersLoading && (
                  <div className="px-3 py-2 text-xs" style={{ color: '#B91C1C' }}>
                    {workordersError}
                  </div>
                )}
                {!workordersLoading &&
                  !workordersError &&
                  filteredWorkorders.length === 0 && (
                    <div className="px-3 py-2 text-xs" style={{ color: '#6B7280' }}>
                      No work orders match your search.
                    </div>
                  )}
                {!workordersLoading &&
                  !workordersError &&
                  filteredWorkorders.map((wo) => (
                    <button
                      key={String(wo.id)}
                      type="button"
                      onClick={() => handleWorkorderSelect(wo)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-b"
                      style={{
                        borderColor: '#EAEBED',
                        backgroundColor:
                          String(formData.linkedWorkorder) === String(wo.id) ? '#F3F4F6' : 'white',
                      }}
                    >
                      {formatWorkorderOptionLabel(wo)}
                    </button>
                  ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>
              Invoice number <span style={{ color: '#6B7280', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="text"
              value={formData.invoiceNumber}
              onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
              placeholder="Invoice number (optional)"
              className="w-full px-3 py-2 border rounded text-sm"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              {...inputFocusStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>
              Attachment (invoice){' '}
              <span style={{ color: '#6B7280', fontWeight: 400 }}>(optional)</span>
            </label>
            <label className="flex items-center gap-2 px-3 py-2 border rounded cursor-pointer text-sm" style={{ borderColor: '#EAEBED', color: '#1F271B' }}>
              <FiUpload size={16} />
              <span>{formData.attachment ? formData.attachment.name : 'Upload file'}</span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => setFormData({ ...formData, attachment: e.target.files?.[0] || null })}
              />
            </label>
          </div>
          {saveError && (
            <div className="p-2.5 rounded text-xs" style={{ backgroundColor: '#FEF2F2', color: '#B91C1C' }}>
              {saveError}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: '#EAEBED' }}>
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="px-3 py-1.5 border rounded text-sm font-medium disabled:opacity-50"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-3 py-1.5 rounded text-sm font-medium text-white flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none"
              style={{ backgroundColor: '#28AFB0' }}
            >
              <FiSave size={14} />
              {saving ? 'Saving…' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
