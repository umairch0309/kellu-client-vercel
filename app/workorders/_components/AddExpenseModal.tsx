'use client'

import { useState } from 'react'
import { FiX, FiUpload, FiCheckCircle, FiTrash2 } from 'react-icons/fi'
import type { ExpenseForm } from './workorderDetailTypes'

export type ExpenseDisplay = { date?: string; itemName?: string; details?: string; total?: number; amount?: number; linkedWorkorder?: number | string | null; invoiceNumber?: string }

export interface AddExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  workorderId: number | string
  editingExpenseIndex: number | null
  newExpense: ExpenseForm
  setNewExpense: (e: ExpenseForm | ((prev: ExpenseForm) => ExpenseForm)) => void
  onSave: (payload: { date: string; itemName: string; details: string; total: number; amount: number; linkedWorkorder: number | string | null; invoiceNumber: string }) => void
  onDelete: () => void
  resetForm: () => void
  /** When set and adding (not editing), saving will POST to /api/workorders/{workorderId}/expenses. On success, called with the created expense to append to the list. */
  onExpenseCreated?: (expense: ExpenseDisplay) => void
}

const emptyExpense: ExpenseForm = {
  date: new Date().toISOString().split('T')[0],
  itemName: '',
  details: '',
  total: 0,
  linkedWorkorder: null,
  invoiceNumber: '',
  attachment: null,
}

function expenseApiToDisplay(raw: Record<string, unknown>): ExpenseDisplay {
  const total = typeof raw.total === 'number' ? raw.total : parseFloat(String(raw.total ?? 0)) || 0
  const workOrderId = raw.workOrderId
  const linkedWorkorder =
    workOrderId == null ? null : typeof workOrderId === 'string' || typeof workOrderId === 'number' ? workOrderId : String(workOrderId)
  return {
    date: raw.date != null ? String(raw.date).slice(0, 10) : '',
    itemName: typeof raw.itemName === 'string' ? raw.itemName : '',
    details: raw.details != null ? String(raw.details) : '',
    total,
    amount: total,
    linkedWorkorder,
    invoiceNumber: raw.invoiceNumber != null ? String(raw.invoiceNumber) : '',
  }
}

function extractExpenseFromResponse(json: unknown): Record<string, unknown> | null {
  if (json == null || typeof json !== 'object') return null
  const obj = json as Record<string, unknown>
  let data = obj.data
  if (data != null && typeof data === 'object' && !Array.isArray(data)) {
    const inner = (data as Record<string, unknown>).data
    if (inner != null && typeof inner === 'object' && !Array.isArray(inner)) data = inner
  }
  return data != null && typeof data === 'object' && !Array.isArray(data) ? (data as Record<string, unknown>) : null
}

export default function AddExpenseModal({
  isOpen,
  onClose,
  workorderId,
  editingExpenseIndex,
  newExpense,
  setNewExpense,
  onSave,
  onDelete,
  resetForm,
  onExpenseCreated,
}: AddExpenseModalProps) {
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSave = async () => {
    const date = (newExpense.date || '').trim()
    const itemName = (newExpense.itemName || '').trim()
    const total = Number(newExpense.total) || 0

    if (!date) {
      setSaveError('Date is required.')
      return
    }
    if (!itemName) {
      setSaveError('Item name is required.')
      return
    }
    if (total <= 0) {
      setSaveError('Total is required and must be greater than 0.')
      return
    }

    if (workorderId != null && workorderId !== '' && editingExpenseIndex === null && onExpenseCreated) {
      setSaveError(null)
      setSaving(true)
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
        const body: Record<string, unknown> = {
          date,
          itemName,
          total,
        }
        if ((newExpense.details || '').trim()) body.details = newExpense.details.trim()
        if ((newExpense.invoiceNumber || '').trim()) body.invoiceNumber = newExpense.invoiceNumber.trim()

        const res = await fetch(`${baseUrl}/api/workorders/${workorderId}/expenses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) {
          const msg = (json as { message?: string }).message ?? `Request failed (${res.status})`
          setSaveError(msg)
          return
        }
        const data = extractExpenseFromResponse(json)
        if (data) {
          onExpenseCreated(expenseApiToDisplay(data))
          resetForm()
          onClose()
        } else {
          setSaveError('Invalid response.')
        }
      } catch (e) {
        setSaveError(e instanceof Error ? e.message : 'Failed to save expense')
      } finally {
        setSaving(false)
      }
      return
    }

    setSaveError(null)
    onSave({
      date: newExpense.date,
      itemName: newExpense.itemName,
      details: newExpense.details,
      total: newExpense.total,
      amount: newExpense.total,
      linkedWorkorder: workorderId || newExpense.linkedWorkorder,
      invoiceNumber: newExpense.invoiceNumber,
    })
    resetForm()
    onClose()
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col" style={{ borderColor: '#EAEBED' }}>
        <div className="flex items-center justify-between p-3 border-b" style={{ borderBottomColor: '#EAEBED' }}>
          <h2 className="text-base font-semibold" style={{ color: '#1F271B' }}>{editingExpenseIndex !== null ? 'Update Expense' : 'Add Expense'}</h2>
          <button onClick={() => { onClose(); resetForm() }} className="p-1 rounded transition-colors" style={{ color: '#1F271B', opacity: 0.6 }} onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.backgroundColor = '#F3F4F6' }} onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.backgroundColor = 'transparent' }}><FiX size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Date <span className="text-red-500">*</span></label>
            <input type="date" value={newExpense.date} onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })} className="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-2 text-xs transition-all" style={{ borderColor: '#EAEBED', color: '#1F271B' }} required onFocus={(e) => { e.currentTarget.style.borderColor = '#28AFB0'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)' }} onBlur={(e) => { e.currentTarget.style.borderColor = '#EAEBED'; e.currentTarget.style.boxShadow = 'none' }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Item name <span className="text-red-500">*</span></label>
            <input type="text" value={newExpense.itemName} onChange={(e) => setNewExpense({ ...newExpense, itemName: e.target.value })} placeholder="Enter item name" className="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-2 text-xs transition-all" style={{ borderColor: '#EAEBED', color: '#1F271B' }} required onFocus={(e) => { e.currentTarget.style.borderColor = '#28AFB0'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)' }} onBlur={(e) => { e.currentTarget.style.borderColor = '#EAEBED'; e.currentTarget.style.boxShadow = 'none' }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Details (Optional)</label>
            <textarea value={newExpense.details} onChange={(e) => setNewExpense({ ...newExpense, details: e.target.value })} placeholder="Enter expense details" rows={2} className="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-2 text-xs transition-all resize-none" style={{ borderColor: '#EAEBED', color: '#1F271B' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#28AFB0'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)' }} onBlur={(e) => { e.currentTarget.style.borderColor = '#EAEBED'; e.currentTarget.style.boxShadow = 'none' }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Total <span className="text-red-500">*</span></label>
            <input type="number" value={newExpense.total || ''} onChange={(e) => setNewExpense({ ...newExpense, total: parseFloat(e.target.value) || 0 })} placeholder="0.00" min={0} step={0.01} className="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-2 text-xs transition-all" style={{ borderColor: '#EAEBED', color: '#1F271B' }} required onFocus={(e) => { e.currentTarget.style.borderColor = '#28AFB0'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)' }} onBlur={(e) => { e.currentTarget.style.borderColor = '#EAEBED'; e.currentTarget.style.boxShadow = 'none' }} />
          </div>
          {!workorderId && (
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Linked Work order (Optional)</label>
              <input type="number" value={newExpense.linkedWorkorder || ''} onChange={(e) => setNewExpense({ ...newExpense, linkedWorkorder: e.target.value ? parseInt(e.target.value) : null })} placeholder="Work order ID" min={1} className="flex-1 w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-2 text-xs transition-all" style={{ borderColor: '#EAEBED', color: '#1F271B' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#28AFB0'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)' }} onBlur={(e) => { e.currentTarget.style.borderColor = '#EAEBED'; e.currentTarget.style.boxShadow = 'none' }} />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Invoice number (Optional)</label>
            <input type="text" value={newExpense.invoiceNumber} onChange={(e) => setNewExpense({ ...newExpense, invoiceNumber: e.target.value })} placeholder="Enter invoice number" className="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-2 text-xs transition-all" style={{ borderColor: '#EAEBED', color: '#1F271B' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#28AFB0'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)' }} onBlur={(e) => { e.currentTarget.style.borderColor = '#EAEBED'; e.currentTarget.style.boxShadow = 'none' }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Attachment / invoice (Optional)</label>
            <div className="flex items-center gap-2">
              <label className="flex-1 px-2.5 py-1.5 border rounded cursor-pointer flex items-center justify-center gap-1.5 text-xs transition-all hover:bg-gray-50" style={{ borderColor: '#EAEBED', color: '#1F271B' }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#28AFB0' }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#EAEBED' }}>
                <FiUpload size={14} />
                <span className="truncate">{newExpense.attachment ? newExpense.attachment.name : 'Upload file'}</span>
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(e) => { const file = e.target.files?.[0]; if (file) setNewExpense({ ...newExpense, attachment: file }) }} />
              </label>
              {newExpense.attachment && (
                <button onClick={() => setNewExpense({ ...newExpense, attachment: null })} className="px-2 py-1.5 border rounded text-xs transition-all" style={{ borderColor: '#DC2626', color: '#DC2626', backgroundColor: 'white' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FEE2E2' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white' }}><FiX size={14} /></button>
              )}
            </div>
            {newExpense.attachment && <p className="text-xs mt-1" style={{ color: '#1F271B', opacity: 0.7 }}>{newExpense.attachment.name} ({(newExpense.attachment.size / 1024).toFixed(2)} KB)</p>}
          </div>
        </div>
        {saveError && (
          <div className="px-3 pb-2">
            <p className="text-xs" style={{ color: '#B91C1C' }}>{saveError}</p>
          </div>
        )}
        <div className="flex items-center justify-between gap-2 p-3 border-t" style={{ borderTopColor: '#EAEBED' }}>
          <div className="flex items-center gap-2">
            {editingExpenseIndex !== null && (
              <button type="button" onClick={onDelete} disabled={saving} className="px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5 disabled:opacity-50" style={{ backgroundColor: '#DC2626', color: 'white' }} onMouseEnter={(e) => { if (!saving) e.currentTarget.style.backgroundColor = '#B91C1C' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#DC2626' }}><FiTrash2 size={14} />Delete</button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => { onClose(); resetForm(); setSaveError(null) }} disabled={saving} className="px-3 py-1.5 border rounded text-xs font-medium transition-all disabled:opacity-50" style={{ borderColor: '#EAEBED', color: '#1F271B', backgroundColor: 'white' }} onMouseEnter={(e) => { if (!saving) e.currentTarget.style.backgroundColor = '#F3F4F6' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white' }}>Cancel</button>
            <button type="button" onClick={handleSave} disabled={saving} className="px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5 disabled:opacity-50" style={{ backgroundColor: '#28AFB0', color: 'white' }} onMouseEnter={(e) => { if (!saving) e.currentTarget.style.backgroundColor = '#1E8A8B' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#28AFB0' }}><FiCheckCircle size={14} /><span>{saving ? 'Saving…' : editingExpenseIndex !== null ? 'Save' : 'Save Expense'}</span></button>
          </div>
        </div>
      </div>
    </div>
  )
}
