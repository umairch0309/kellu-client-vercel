'use client'

import { FiPlus } from 'react-icons/fi'
import { format } from 'date-fns'
import { formatUsd } from '@/lib/formatCurrency'

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  CASH: 'Cash',
  CARD: 'Card',
  TRANSFER: 'Transfer',
  MERCADOPAGO: 'Mercado Pago',
  TRANSBANK: 'Transbank',
  OTHER: 'Other',
}

function paymentMethodDisplay(method: string | undefined): string {
  if (!method) return '—'
  return PAYMENT_METHOD_LABEL[method] ?? method
}

export interface PaymentsSectionProps {
  editedPayments: any[]
  totalPayments: number
  isInvoicePaid: boolean
  invoiceTotal: number
  onAddPayment: () => void
  onEditPayment: (index: number, payment: any) => void
  onDeletePayment: (index: number) => void
}

export default function PaymentsSection({
  editedPayments,
  totalPayments,
  isInvoicePaid,
  invoiceTotal,
  onAddPayment,
  onEditPayment,
  onDeletePayment,
}: PaymentsSectionProps) {
  return (
    <div id="payments" className="bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold" style={{ color: '#1F271B' }}>Payments</h2>
        <button
          onClick={onAddPayment}
          className="px-3 py-1.5 border rounded text-xs font-medium flex items-center gap-1.5 transition-all"
          style={{ borderColor: '#28AFB0', color: '#28AFB0', backgroundColor: 'white' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F0FDFA' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white' }}
        >
          <FiPlus size={12} />
          <span>Add Payment</span>
        </button>
      </div>
      {editedPayments.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderBottomColor: '#EAEBED' }}>
                  <th className="text-left py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>DATE</th>
                  <th className="text-left py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>AMOUNT</th>
                  <th className="text-left py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>METHOD</th>
                  <th className="text-left py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>REFERENCE</th>
                  <th className="text-left py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>NOTES</th>
                  <th className="text-right py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {editedPayments.map((payment: any, index: number) => (
                  <tr key={index} className="border-b" style={{ borderBottomColor: '#EAEBED' }}>
                    <td className="py-2 px-2" style={{ color: '#1F271B' }}>{format(new Date(payment.date), 'MMM dd, yyyy')}</td>
                    <td className="py-2 px-2" style={{ color: '#1F271B' }}>{formatUsd(payment.amount)}</td>
                    <td className="py-2 px-2" style={{ color: '#1F271B' }}>{paymentMethodDisplay(payment.method)}</td>
                    <td className="py-2 px-2" style={{ color: '#1F271B' }}>{payment.reference || '—'}</td>
                    <td className="py-2 px-2" style={{ color: '#1F271B' }}>{payment.notes || '—'}</td>
                    <td className="py-2 px-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => onEditPayment(index, payment)} className="text-xs px-2 py-1 rounded transition-all" style={{ color: '#28AFB0', backgroundColor: 'transparent' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F0FDFA' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}>Edit</button>
                        <button onClick={() => onDeletePayment(index)} className="text-xs px-2 py-1 rounded transition-all" style={{ color: '#DC2626', backgroundColor: 'transparent' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FEE2E2' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 pt-3 border-t flex justify-between items-center" style={{ borderTopColor: '#EAEBED' }}>
              <span className="text-sm font-semibold" style={{ color: '#1F271B' }}>Total Paid:</span>
              <span className="text-sm font-bold" style={{ color: '#1F271B' }}>{formatUsd(totalPayments)}</span>
            </div>
            {isInvoicePaid && (
              <div className="mt-2 p-2 rounded text-xs text-center" style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>Invoice fully paid</div>
            )}
          </div>
        </>
      ) : (
        <p className="text-sm py-4 text-center" style={{ color: '#1F271B', opacity: 0.6 }}>No payments recorded. Click &quot;Add Payment&quot; to record a payment.</p>
      )}
    </div>
  )
}
