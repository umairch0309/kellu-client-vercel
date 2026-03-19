'use client'

import { useState } from 'react'
import { FiX, FiCheckCircle } from 'react-icons/fi'
import type { PaymentForm } from './workorderDetailTypes'

export type PaymentDisplay = { amount: number; date?: string; method?: string; reference?: string; notes?: string }

export interface AddPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  editingPaymentIndex: number | null
  newPayment: PaymentForm
  setNewPayment: (p: PaymentForm | ((prev: PaymentForm) => PaymentForm)) => void
  onSave: (payment: PaymentForm) => void
  resetForm: () => void
  /** When set, adding a new payment will POST to /api/workorders/{workorderId}/payments. On success, called with the full payments array from the response. */
  workorderId?: number | string
  onPaymentsUpdated?: (payments: PaymentDisplay[]) => void
}

function extractPaymentsFromResponse(json: unknown): PaymentDisplay[] {
  if (json == null || typeof json !== 'object') return []
  const obj = json as Record<string, unknown>
  let data = obj.data
  if (data != null && typeof data === 'object' && !Array.isArray(data)) {
    const inner = (data as Record<string, unknown>).data
    if (inner != null && typeof inner === 'object' && !Array.isArray(inner)) data = inner
  }
  const payments = (data as Record<string, unknown>)?.payments
  if (!Array.isArray(payments)) return []
  return payments.map((p: any) => ({
    amount: typeof p.amount === 'number' ? p.amount : parseFloat(String(p.amount ?? 0)) || 0,
    date: p.paymentDate != null ? String(p.paymentDate).slice(0, 10) : '',
    method: p.paymentMethod != null ? String(p.paymentMethod) : '',
    reference: p.referenceNumber != null ? String(p.referenceNumber) : '',
    notes: p.note != null ? String(p.note) : '',
  }))
}

export default function AddPaymentModal({
  isOpen,
  onClose,
  editingPaymentIndex,
  newPayment,
  setNewPayment,
  onSave,
  resetForm,
  workorderId,
  onPaymentsUpdated,
}: AddPaymentModalProps) {
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSave = async () => {
    const amount = Number(newPayment.amount) || 0
    const method = (newPayment.method || '').trim()
    if (amount <= 0) {
      setSaveError('Payment amount is required and must be greater than 0.')
      return
    }
    if (!method) {
      setSaveError('Payment method is required.')
      return
    }

    if (workorderId != null && workorderId !== '' && editingPaymentIndex === null && onPaymentsUpdated) {
      setSaveError(null)
      setSaving(true)
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
        const body: Record<string, unknown> = {
          amount,
          paymentMethod: method,
        }
        if (newPayment.date) body.paymentDate = newPayment.date
        if ((newPayment.reference || '').trim()) body.referenceNumber = newPayment.reference.trim()
        if ((newPayment.notes || '').trim()) body.note = newPayment.notes.trim()

        const res = await fetch(`${baseUrl}/api/workorders/${workorderId}/payments`, {
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
        const payments = extractPaymentsFromResponse(json)
        if (payments.length > 0) {
          onPaymentsUpdated(payments)
          resetForm()
          onClose()
        } else {
          onPaymentsUpdated([])
          resetForm()
          onClose()
        }
      } catch (e) {
        setSaveError(e instanceof Error ? e.message : 'Failed to save payment')
      } finally {
        setSaving(false)
      }
      return
    }

    setSaveError(null)
    if (newPayment.date) {
      onSave({ ...newPayment })
      resetForm()
      onClose()
    } else {
      setSaveError('Payment date is required.')
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
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Payment date {workorderId && editingPaymentIndex === null ? '(Optional)' : <span className="text-red-500">*</span>}</label>
            <input type="date" value={newPayment.date} onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })} className="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-2 text-xs transition-all" style={{ borderColor: '#EAEBED', color: '#1F271B' }} required={!(workorderId && editingPaymentIndex === null)} onFocus={(e) => { e.currentTarget.style.borderColor = '#28AFB0'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)' }} onBlur={(e) => { e.currentTarget.style.borderColor = '#EAEBED'; e.currentTarget.style.boxShadow = 'none' }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Payment amount <span className="text-red-500">*</span></label>
            <input type="number" value={newPayment.amount || ''} onChange={(e) => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) || 0 })} placeholder="0.00" min={0} step={0.01} className="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-2 text-xs transition-all" style={{ borderColor: '#EAEBED', color: '#1F271B' }} required onFocus={(e) => { e.currentTarget.style.borderColor = '#28AFB0'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)' }} onBlur={(e) => { e.currentTarget.style.borderColor = '#EAEBED'; e.currentTarget.style.boxShadow = 'none' }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Payment Method <span className="text-red-500">*</span></label>
            <select value={newPayment.method} onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value })} className="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-2 text-xs transition-all" style={{ borderColor: '#EAEBED', color: '#1F271B' }} required onFocus={(e) => { e.currentTarget.style.borderColor = '#28AFB0'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)' }} onBlur={(e) => { e.currentTarget.style.borderColor = '#EAEBED'; e.currentTarget.style.boxShadow = 'none' }}>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="TRANSFER">Transfer</option>
              <option value="MERCADOPAGO">Mercado Pago</option>
              <option value="TRANSBANK">Transbank</option>
              <option value="OTHER">Other</option>
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
        {saveError && (
          <div className="px-3 pb-2">
            <p className="text-xs" style={{ color: '#B91C1C' }}>{saveError}</p>
          </div>
        )}
        <div className="flex items-center justify-end gap-2 p-3 border-t" style={{ borderTopColor: '#EAEBED' }}>
          <button type="button" onClick={() => { onClose(); resetForm(); setSaveError(null) }} disabled={saving} className="px-3 py-1.5 border rounded text-xs font-medium transition-all disabled:opacity-50" style={{ borderColor: '#EAEBED', color: '#1F271B', backgroundColor: 'white' }} onMouseEnter={(e) => { if (!saving) e.currentTarget.style.backgroundColor = '#F3F4F6' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white' }}>Cancel</button>
          <button type="button" onClick={handleSave} disabled={saving} className="px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5 disabled:opacity-50" style={{ backgroundColor: '#28AFB0', color: 'white' }} onMouseEnter={(e) => { if (!saving) e.currentTarget.style.backgroundColor = '#1E8A8B' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#28AFB0' }}><FiCheckCircle size={14} /><span>{saving ? 'Saving…' : editingPaymentIndex !== null ? 'Update Payment' : 'Save Payment'}</span></button>
        </div>
      </div>
    </div>
  )
}
