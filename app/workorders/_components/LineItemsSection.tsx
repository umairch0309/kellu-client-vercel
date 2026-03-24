'use client'

import { useState } from 'react'
import { FiPlus, FiInfo, FiCheckCircle, FiTrash2 } from 'react-icons/fi'
import { companyTaxRatePercent } from '@/data/mockData'
import { formatUsd } from '@/lib/formatCurrency'
import AddLineItemForm from './AddLineItemForm'
import type { LineItemForm } from './workorderDetailTypes'

export interface LineItemsSectionProps {
  workorder: any
  editedLineItems: any[]
  setEditedLineItems: (items: any[] | ((prev: any[]) => any[])) => void
  isAddLineItemOpen: boolean
  setIsAddLineItemOpen: (open: boolean) => void
  newLineItem: LineItemForm
  setNewLineItem: (item: LineItemForm | ((prev: LineItemForm) => LineItemForm)) => void
  lineItemError: string
  setLineItemError: (s: string) => void
  editingLineItemIndex: number | null
  setEditingLineItemIndex: (i: number | null) => void
  editingLineItemForm: { name: string; description: string; quantity: number; unitCost: number; unitPrice: number } | null
  setEditingLineItemForm: (f: { name: string; description: string; quantity: number; unitCost: number; unitPrice: number } | null) => void
  lineItemNameDropdownRef: React.RefObject<HTMLDivElement>
  onOpenAddProductModal: () => void
  /** Saves the new line item to the work order and POSTs add-to-price-list (master list in Settings). */
  onSaveNewLineItem: (item: LineItemForm) => Promise<void>
}

const emptyLineItem: LineItemForm = { name: '', description: '', quantity: 1, unitPrice: 0, unitCost: 0 }

export default function LineItemsSection({
  workorder,
  editedLineItems,
  setEditedLineItems,
  isAddLineItemOpen,
  setIsAddLineItemOpen,
  newLineItem,
  setNewLineItem,
  lineItemError,
  setLineItemError,
  editingLineItemIndex,
  setEditingLineItemIndex,
  editingLineItemForm,
  setEditingLineItemForm,
  lineItemNameDropdownRef,
  onOpenAddProductModal,
  onSaveNewLineItem,
}: LineItemsSectionProps) {
  const [savingNewLine, setSavingNewLine] = useState(false)
  const handleCancelAdd = () => {
    setIsAddLineItemOpen(false)
    setNewLineItem(emptyLineItem)
    setLineItemError('')
  }
  const handleSaveAdd = async () => {
    if (!newLineItem.name.trim()) { setLineItemError('Enter a line item name'); return }
    setLineItemError('')
    setSavingNewLine(true)
    try {
      await onSaveNewLineItem(newLineItem)
      setIsAddLineItemOpen(false)
      setNewLineItem(emptyLineItem)
    } catch (e) {
      setLineItemError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSavingNewLine(false)
    }
  }
  const handleOpenAdd = () => {
    const opening = !isAddLineItemOpen
    setIsAddLineItemOpen(!isAddLineItemOpen)
    if (opening) { setEditingLineItemIndex(null); setEditingLineItemForm(null) }
    else { setNewLineItem(emptyLineItem); setLineItemError('') }
  }

  return (
    <div className="rounded-lg border p-4 bg-white" style={{ borderColor: '#EAEBED' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold" style={{ color: '#1F271B' }}>Line Items</h2>
        <button
          onClick={handleOpenAdd}
          className="px-3 py-1.5 border rounded text-xs font-medium flex items-center gap-1.5 transition-all"
          style={{ borderColor: '#28AFB0', color: '#28AFB0', backgroundColor: 'white' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F0FDFA' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white' }}
        >
          <FiPlus size={12} />
          <span>New Line Item</span>
        </button>
      </div>
      {isAddLineItemOpen && (
        <AddLineItemForm
          newLineItem={newLineItem}
          setNewLineItem={setNewLineItem}
          lineItemError={lineItemError}
          setLineItemError={setLineItemError}
          onCancel={handleCancelAdd}
          onSave={handleSaveAdd}
          saving={savingNewLine}
          onOpenCreateProduct={onOpenAddProductModal}
          lineItemNameDropdownRef={lineItemNameDropdownRef}
        />
      )}
      {editedLineItems.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderBottomColor: '#EAEBED' }}>
                  <th className="text-left py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>PRODUCT / SERVICE</th>
                  <th className="text-right py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>QUANTITY</th>
                  <th className="text-right py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>COST <FiInfo size={10} className="inline ml-0.5 opacity-70" title="Line item cost" /></th>
                  <th className="text-right py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>PRICE <FiInfo size={10} className="inline ml-0.5 opacity-70" title="Unit price" /></th>
                  <th className="text-right py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>TOTAL</th>
                  <th className="w-10 py-2 px-2" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {editedLineItems.map((item: any, index: number) => (
                  editingLineItemIndex === index && editingLineItemForm ? (
                    <tr key={index} className="border-b" style={{ borderBottomColor: '#EAEBED' }}>
                      <td colSpan={6} className="p-0 align-top">
                        <div className="p-4 border rounded-lg" style={{ borderColor: '#EAEBED', backgroundColor: '#F9FAFB' }} onClick={(e) => e.stopPropagation()}>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>Name <span className="text-red-500">*</span></label>
                              <input type="text" value={editingLineItemForm.name} onChange={(e) => setEditingLineItemForm({ ...editingLineItemForm, name: e.target.value })} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm" style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>Description</label>
                              <textarea value={editingLineItemForm.description} onChange={(e) => setEditingLineItemForm({ ...editingLineItemForm, description: e.target.value })} placeholder="Enter description" rows={3} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm resize-none" style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                              <div><label className="block text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Quantity</label><input type="number" value={editingLineItemForm.quantity} onChange={(e) => setEditingLineItemForm({ ...editingLineItemForm, quantity: parseFloat(e.target.value) || 0 })} min={0} step={0.01} className="w-full px-2 py-2 border rounded text-sm text-center" style={{ borderColor: '#EAEBED', color: '#1F271B' }} /></div>
                              <div><label className="block text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Unit cost</label><input type="number" value={editingLineItemForm.unitCost} onChange={(e) => setEditingLineItemForm({ ...editingLineItemForm, unitCost: parseFloat(e.target.value) || 0 })} min={0} step={0.01} className="w-full px-2 py-2 border rounded text-sm text-center" style={{ borderColor: '#EAEBED', color: '#1F271B' }} /></div>
                              <div><label className="block text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Unit price</label><input type="number" value={editingLineItemForm.unitPrice} onChange={(e) => setEditingLineItemForm({ ...editingLineItemForm, unitPrice: parseFloat(e.target.value) || 0 })} min={0} step={0.01} className="w-full px-2 py-2 border rounded text-sm text-center" style={{ borderColor: '#EAEBED', color: '#1F271B' }} /></div>
                              <div><label className="block text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Total</label><div className="px-2 py-2 border rounded text-sm text-center font-semibold" style={{ borderColor: '#EAEBED', backgroundColor: '#F3F4F6', color: '#1F271B' }}>{formatUsd(editingLineItemForm.quantity * editingLineItemForm.unitPrice)}</div></div>
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-3 border-t" style={{ borderTopColor: '#EAEBED' }}>
                              <button type="button" onClick={() => { setEditedLineItems(editedLineItems.filter((_, i) => i !== index)); setEditingLineItemIndex(null); setEditingLineItemForm(null) }} className="px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5" style={{ backgroundColor: '#DC2626', color: 'white' }}><FiTrash2 size={14} />Delete</button>
                              <button type="button" onClick={() => { if (!editingLineItemForm.name.trim()) return; const total = editingLineItemForm.quantity * editingLineItemForm.unitPrice; setEditedLineItems(editedLineItems.map((li, i) => i === index ? { ...li, ...editingLineItemForm, total } : li)); setEditingLineItemIndex(null); setEditingLineItemForm(null) }} className="px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5" style={{ backgroundColor: '#28AFB0', color: 'white' }}><FiCheckCircle size={14} />Save</button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={index} className="border-b align-top cursor-pointer transition-colors" style={{ borderBottomColor: '#EAEBED' }} onClick={() => { setIsAddLineItemOpen(false); setEditingLineItemIndex(index); setEditingLineItemForm({ name: item.name, description: item.description || '', quantity: item.quantity, unitCost: item.unitCost, unitPrice: item.unitPrice }) }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}>
                      <td className="py-2 px-2" style={{ color: '#1F271B' }}><p className="font-semibold" style={{ color: '#28AFB0' }}>{item.name}</p>{item.description && <p className="text-xs mt-0.5" style={{ color: '#1F271B', opacity: 0.7 }}>{item.description}</p>}</td>
                      <td className="py-2 px-2 text-right tabular-nums" style={{ color: '#1F271B' }}>{item.quantity}</td>
                      <td className="py-2 px-2 text-right tabular-nums" style={{ color: '#1F271B' }}>{formatUsd(item.unitCost * item.quantity)}</td>
                      <td className="py-2 px-2 text-right tabular-nums" style={{ color: '#1F271B' }}>{formatUsd(item.unitPrice)}</td>
                      <td className="py-2 px-2 text-right tabular-nums" style={{ color: '#1F271B' }}>{formatUsd(item.total)}</td>
                      <td className="py-2 px-2" onClick={(e) => e.stopPropagation()}><button type="button" onClick={() => setEditedLineItems(editedLineItems.filter((_, i) => i !== index))} className="p-1.5 rounded transition-colors" style={{ color: '#1F271B', opacity: 0.7 }} onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.backgroundColor = '#FEE2E2' }} onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.backgroundColor = 'transparent' }} title="Delete line"><FiTrash2 size={16} /></button></td>
                    </tr>
                  )
                ))}
                <tr className="font-semibold border-t" style={{ borderTopColor: '#EAEBED' }}><td colSpan={3} className="py-2 px-2" style={{ color: '#1F271B' }}>Subtotal</td><td className="py-2 px-2 text-right tabular-nums" style={{ color: '#1F271B' }}>{formatUsd(editedLineItems.reduce((s: number, i: any) => s + (i.unitCost * i.quantity), 0))}</td><td className="py-2 px-2 text-right tabular-nums" style={{ color: '#1F271B' }}>{formatUsd(editedLineItems.reduce((s: number, i: any) => s + i.total, 0))}</td><td className="py-2 px-2" /></tr>
                <tr><td colSpan={3} className="py-2 px-2" style={{ color: '#1F271B' }}>Discount{workorder.discount > 0 ? ` (${workorder.discountType === 'percentage' ? `${workorder.discount}%` : 'Amount'})` : ''}</td><td className="py-2 px-2 text-right" style={{ color: '#1F271B' }}>—</td><td className="py-2 px-2 text-right" style={{ color: '#1F271B' }}>{workorder.discount > 0 ? formatUsd(-(workorder.discountType === 'percentage' ? (editedLineItems.reduce((s: number, i: any) => s + i.total, 0) * workorder.discount / 100) : workorder.discount)) : '—'}</td><td className="py-2 px-2" /></tr>
                <tr><td colSpan={3} className="py-2 px-2" style={{ color: '#1F271B' }}>Tax ({companyTaxRatePercent}%)</td><td className="py-2 px-2 text-right" style={{ color: '#1F271B' }}>—</td><td className="py-2 px-2 text-right tabular-nums" style={{ color: '#1F271B' }}>{(() => { const st = editedLineItems.reduce((s: number, i: any) => s + i.total, 0); const disc = workorder.discount > 0 ? (workorder.discountType === 'percentage' ? (st * workorder.discount / 100) : workorder.discount) : 0; return formatUsd((st - disc) * companyTaxRatePercent / 100) })()}</td><td className="py-2 px-2" /></tr>
                <tr className="font-bold border-t-2" style={{ borderTopColor: '#EAEBED' }}><td colSpan={3} className="py-2.5 px-2" style={{ color: '#1F271B' }}>Total</td><td className="py-2.5 px-2 text-right tabular-nums" style={{ color: '#1F271B' }}>{formatUsd(editedLineItems.reduce((s: number, i: any) => s + (i.unitCost * i.quantity), 0))}</td><td className="py-2.5 px-2 text-right tabular-nums" style={{ color: '#1F271B' }}>{formatUsd(workorder.total)}</td><td className="py-2.5 px-2" /></tr>
              </tbody>
            </table>
          </div>
        </>
      ) : !isAddLineItemOpen ? (
        <p className="text-sm py-4 text-center" style={{ color: '#1F271B', opacity: 0.6 }}>No line items</p>
      ) : null}
    </div>
  )
}

