'use client'

import { FiX, FiUpload, FiCheckCircle, FiTrash2 } from 'react-icons/fi'
import type { ExpenseForm } from './workorderDetailTypes'

export interface AddExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  workorderId: number
  editingExpenseIndex: number | null
  newExpense: ExpenseForm
  setNewExpense: (e: ExpenseForm | ((prev: ExpenseForm) => ExpenseForm)) => void
  onSave: (payload: { date: string; itemName: string; details: string; total: number; amount: number; linkedWorkorder: number | null; invoiceNumber: string }) => void
  onDelete: () => void
  resetForm: () => void
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
}: AddExpenseModalProps) {
  if (!isOpen) return null
  const handleSave = () => {
    if (newExpense.itemName && newExpense.total > 0) {
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
    }
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
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Details</label>
            <textarea value={newExpense.details} onChange={(e) => setNewExpense({ ...newExpense, details: e.target.value })} placeholder="Enter expense details" rows={2} className="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-2 text-xs transition-all resize-none" style={{ borderColor: '#EAEBED', color: '#1F271B' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#28AFB0'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)' }} onBlur={(e) => { e.currentTarget.style.borderColor = '#EAEBED'; e.currentTarget.style.boxShadow = 'none' }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Total <span className="text-red-500">*</span></label>
            <input type="number" value={newExpense.total || ''} onChange={(e) => setNewExpense({ ...newExpense, total: parseFloat(e.target.value) || 0 })} placeholder="0.00" min={0} step={0.01} className="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-2 text-xs transition-all" style={{ borderColor: '#EAEBED', color: '#1F271B' }} required onFocus={(e) => { e.currentTarget.style.borderColor = '#28AFB0'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)' }} onBlur={(e) => { e.currentTarget.style.borderColor = '#EAEBED'; e.currentTarget.style.boxShadow = 'none' }} />
          </div>
          {!workorderId && (
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Linked Work order (when applies)</label>
              <input type="number" value={newExpense.linkedWorkorder || ''} onChange={(e) => setNewExpense({ ...newExpense, linkedWorkorder: e.target.value ? parseInt(e.target.value) : null })} placeholder="Work order ID" min={1} className="flex-1 w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-2 text-xs transition-all" style={{ borderColor: '#EAEBED', color: '#1F271B' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#28AFB0'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)' }} onBlur={(e) => { e.currentTarget.style.borderColor = '#EAEBED'; e.currentTarget.style.boxShadow = 'none' }} />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Invoice number</label>
            <input type="text" value={newExpense.invoiceNumber} onChange={(e) => setNewExpense({ ...newExpense, invoiceNumber: e.target.value })} placeholder="Enter invoice number" className="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-2 text-xs transition-all" style={{ borderColor: '#EAEBED', color: '#1F271B' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#28AFB0'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)' }} onBlur={(e) => { e.currentTarget.style.borderColor = '#EAEBED'; e.currentTarget.style.boxShadow = 'none' }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Attachment (invoice)</label>
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
        <div className="flex items-center justify-between gap-2 p-3 border-t" style={{ borderTopColor: '#EAEBED' }}>
          <div className="flex items-center gap-2">
            {editingExpenseIndex !== null && (
              <button type="button" onClick={onDelete} className="px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5" style={{ backgroundColor: '#DC2626', color: 'white' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#B91C1C' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#DC2626' }}><FiTrash2 size={14} />Delete</button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { onClose(); resetForm() }} className="px-3 py-1.5 border rounded text-xs font-medium transition-all" style={{ borderColor: '#EAEBED', color: '#1F271B', backgroundColor: 'white' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white' }}>Cancel</button>
            <button onClick={handleSave} className="px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5" style={{ backgroundColor: '#28AFB0', color: 'white' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E8A8B' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#28AFB0' }}><FiCheckCircle size={14} /><span>{editingExpenseIndex !== null ? 'Save' : 'Save Expense'}</span></button>
          </div>
        </div>
      </div>
    </div>
  )
}
