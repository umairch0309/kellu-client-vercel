'use client'

import { FiX, FiCheckCircle } from 'react-icons/fi'
import type { PaymentForm } from './workorderDetailTypes'

export interface AddPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  editingPaymentIndex: number | null
  newPayment: PaymentForm
  setNewPayment: (p: PaymentForm | ((prev: PaymentForm) => PaymentForm)) => void
  onSave: (payment: PaymentForm) => void
  resetForm: () => void
}

export default function AddPaymentModal({
  isOpen,
  onClose,
  editingPaymentIndex,
  newPayment,
  setNewPayment,
  onSave,
  resetForm,
}: AddPaymentModalProps) {
  if (!isOpen) return null
  const handleSave = () => {
    if (newPayment.amount > 0 && newPayment.date) {
      onSave({ ...newPayment })
      resetForm()
    }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col" style={{ borderColor: '#EAEBED' }}>
        <div className="flex items-center justify-between p-3 border-b" style={{ borderBottomColor: '#EAEBED' }}>
          <h2 className="text-base font-semibold" style={{ color: '#1F271B' }}>{editingPaymentIndex !== null ? 'Edit Payment' : 'Add Payment'}</h2>
          <button onClick={() => { onClose(); resetForm() }} className="p-1 rounded transition-colors" style={{ color: '#1F271B', opacity: 0.6 }} onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.backgroundColor = '#F3F4F6' }} onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.backgroundColor = 'transparent' }}><FiX size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Payment date <span className="text-red-500">*</span></label>
            <input type="date" value={newPayment.date} onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })} className="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-2 text-xs transition-all" style={{ borderColor: '#EAEBED', color: '#1F271B' }} required onFocus={(e) => { e.currentTarget.style.borderColor = '#28AFB0'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)' }} onBlur={(e) => { e.currentTarget.style.borderColor = '#EAEBED'; e.currentTarget.style.boxShadow = 'none' }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Payment amount <span className="text-red-500">*</span></label>
            <input type="number" value={newPayment.amount || ''} onChange={(e) => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) || 0 })} placeholder="0.00" min={0} step={0.01} className="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-2 text-xs transition-all" style={{ borderColor: '#EAEBED', color: '#1F271B' }} required onFocus={(e) => { e.currentTarget.style.borderColor = '#28AFB0'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)' }} onBlur={(e) => { e.currentTarget.style.borderColor = '#EAEBED'; e.currentTarget.style.boxShadow = 'none' }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Payment Method <span className="text-red-500">*</span></label>
            <select value={newPayment.method} onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value })} className="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-2 text-xs transition-all" style={{ borderColor: '#EAEBED', color: '#1F271B' }} required onFocus={(e) => { e.currentTarget.style.borderColor = '#28AFB0'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)' }} onBlur={(e) => { e.currentTarget.style.borderColor = '#EAEBED'; e.currentTarget.style.boxShadow = 'none' }}>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Check">Check</option>
              <option value="Online Payment">Online Payment</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Payment reference number</label>
            <input type="text" value={newPayment.reference} onChange={(e) => setNewPayment({ ...newPayment, reference: e.target.value })} placeholder="Enter reference number" className="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-2 text-xs transition-all" style={{ borderColor: '#EAEBED', color: '#1F271B' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#28AFB0'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)' }} onBlur={(e) => { e.currentTarget.style.borderColor = '#EAEBED'; e.currentTarget.style.boxShadow = 'none' }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Payment note / details</label>
            <textarea value={newPayment.notes} onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })} placeholder="Enter payment notes or details" rows={2} className="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-2 text-xs transition-all resize-none" style={{ borderColor: '#EAEBED', color: '#1F271B' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#28AFB0'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)' }} onBlur={(e) => { e.currentTarget.style.borderColor = '#EAEBED'; e.currentTarget.style.boxShadow = 'none' }} />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 p-3 border-t" style={{ borderTopColor: '#EAEBED' }}>
          <button onClick={() => { onClose(); resetForm() }} className="px-3 py-1.5 border rounded text-xs font-medium transition-all" style={{ borderColor: '#EAEBED', color: '#1F271B', backgroundColor: 'white' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white' }}>Cancel</button>
          <button onClick={handleSave} className="px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5" style={{ backgroundColor: '#28AFB0', color: 'white' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E8A8B' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#28AFB0' }}><FiCheckCircle size={14} /><span>{editingPaymentIndex !== null ? 'Update Payment' : 'Save Payment'}</span></button>
        </div>
      </div>
    </div>
  )
}
