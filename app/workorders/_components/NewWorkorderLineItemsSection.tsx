'use client'

import { FiPlus, FiTrash2 } from 'react-icons/fi'
import { formatUsd } from '@/lib/formatCurrency'
import type { LineItem } from './newWorkorderFormTypes'

export interface MaterialOption {
  id: number | string
  name: string
  description?: string
  unitPrice: number
}

export interface NewWorkorderLineItemsSectionProps {
  lineItems: LineItem[]
  addLineItem: () => void
  removeLineItem: (index: number) => void
  updateLineItem: (index: number, field: keyof LineItem, value: string | number) => void
  lineItemNameDropdownIndex: number | null
  setLineItemNameDropdownIndex: (v: number | null) => void
  lineItemsSectionRef: React.RefObject<HTMLDivElement>
  discountPercent: number
  onFieldChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  subtotal: number
  discountAmount: number
  taxAmount: number
  grandTotal: number
  totalCost: number
  estimatedMargin: number
  estimatedMarginPercent: number
  taxRatePercent: number
  materialsList: MaterialOption[]
  customMaterials: MaterialOption[]
  onOpenAddProduct: (lineIndex: number, initialName: string) => void
}

function calculateLineItemTotal(item: LineItem) {
  return item.quantity * item.unitPrice
}

export default function NewWorkorderLineItemsSection({
  lineItems,
  addLineItem,
  removeLineItem,
  updateLineItem,
  lineItemNameDropdownIndex,
  setLineItemNameDropdownIndex,
  lineItemsSectionRef,
  discountPercent,
  onFieldChange,
  subtotal,
  discountAmount,
  taxAmount,
  grandTotal,
  totalCost,
  estimatedMargin,
  estimatedMarginPercent,
  taxRatePercent,
  materialsList,
  customMaterials,
  onOpenAddProduct,
}: NewWorkorderLineItemsSectionProps) {
  const allMaterials = [...materialsList, ...customMaterials]

  return (
    <div ref={lineItemsSectionRef} className="bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
      <h2 className="text-sm font-semibold mb-3" style={{ color: '#1F271B' }}>Product / Service <span style={{ opacity: 0.6, fontWeight: 400 }}>(Optional)</span></h2>
      {lineItems.length === 0 ? (
        <div className="p-4 rounded text-center border mb-3" style={{ borderColor: '#EAEBED', backgroundColor: '#F3F4F6' }}>
          <p className="text-sm" style={{ color: '#1F271B', opacity: 0.6 }}>No line items added</p>
        </div>
      ) : (
        <div className="space-y-4 mb-3">
          {lineItems.map((item, index) => {
            const filteredMaterials = allMaterials.filter(m =>
              m.name.toLowerCase().includes(item.name.toLowerCase())
            )
            const hasExactMatch = filteredMaterials.some(m => m.name.toLowerCase() === (item.name || '').trim().toLowerCase())
            const showCreateNew = (item.name || '').trim() !== '' && (filteredMaterials.length === 0 || !hasExactMatch)
            const showDropdown = lineItemNameDropdownIndex === index && (filteredMaterials.length > 0 || showCreateNew)
            return (
              <div key={index} className="p-3 border rounded" style={{ borderColor: '#EAEBED', backgroundColor: '#F9FAFB' }}>
                <div className="flex gap-3">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="relative">
                      <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.8 }}>Name</label>
                      <input
                        type="text"
                        placeholder="Type to search materials..."
                        value={item.name}
                        onChange={(e) => updateLineItem(index, 'name', e.target.value)}
                        onFocus={() => setLineItemNameDropdownIndex(index)}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all"
                        style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                      />
                      {showDropdown && (
                        <div className="absolute z-10 left-0 right-0 mt-1 bg-white border rounded shadow-lg max-h-48 overflow-y-auto" style={{ borderColor: '#EAEBED' }}>
                          {filteredMaterials.slice(0, 8).map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                updateLineItem(index, 'name', m.name)
                                updateLineItem(index, 'description', m.description || '')
                                updateLineItem(index, 'unitPrice', m.unitPrice)
                                setLineItemNameDropdownIndex(null)
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b last:border-b-0"
                              style={{ color: '#1F271B', borderColor: '#EAEBED' }}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <span className="font-medium">{m.name}</span>
                                <span className="text-xs font-medium flex-shrink-0" style={{ opacity: 0.9 }}>{formatUsd(m.unitPrice ?? 0)}</span>
                              </div>
                              {m.description && (
                                <div className="text-xs mt-0.5 truncate" style={{ color: '#1F271B', opacity: 0.7 }}>{m.description}</div>
                              )}
                            </button>
                          ))}
                          {showCreateNew && (
                            <button
                              type="button"
                              onClick={() => {
                                onOpenAddProduct(index, (item.name || '').trim())
                                setLineItemNameDropdownIndex(null)
                              }}
                              className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 font-medium border-t"
                              style={{ color: '#28AFB0', borderColor: '#EAEBED' }}
                            >
                              <FiPlus size={16} style={{ color: '#28AFB0' }} />
                              Create new item
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.8 }}>Description</label>
                      <textarea
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all resize-none"
                        style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                      />
                    </div>
                  </div>
                  <div className="flex items-start gap-2 flex-shrink-0">
                    <div className="w-20">
                      <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.8 }}>Quantity</label>
                      <input
                        type="number"
                        value={item.quantity || ''}
                        onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        min={0}
                        step="0.01"
                        className="w-full px-2 py-2 border rounded text-sm text-center"
                        style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.8 }}>Unit cost</label>
                      <input
                        type="number"
                        value={item.unitCost ?? ''}
                        onChange={(e) => updateLineItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
                        min={0}
                        step="0.01"
                        className="w-full px-2 py-2 border rounded text-sm text-center"
                        style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.8 }}>Unit price</label>
                      <input
                        type="number"
                        value={item.unitPrice || ''}
                        onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        min={0}
                        step="0.01"
                        className="w-full px-2 py-2 border rounded text-sm text-center"
                        style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                      />
                    </div>
                    <div className="w-24 flex flex-col justify-end pb-0.5">
                      <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.8 }}>Total</label>
                      <div className="px-2 py-2 border rounded text-sm text-center font-semibold" style={{ borderColor: '#EAEBED', backgroundColor: '#F3F4F6', color: '#1F271B' }}>
                        {formatUsd(calculateLineItemTotal(item))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      className="p-2 rounded transition-colors self-end"
                      style={{ color: '#1F271B', opacity: 0.7 }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.backgroundColor = '#FEE2E2' }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.backgroundColor = 'transparent' }}
                      title="Delete line"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      <div className="pt-3 border-t" style={{ borderTopColor: '#EAEBED' }}>
        <button
          type="button"
          onClick={addLineItem}
          className="w-full py-2 rounded text-sm font-medium flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow-md mb-3"
          style={{ backgroundColor: '#28AFB0', color: 'white' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E8A8B' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#28AFB0' }}
        >
          <FiPlus size={12} />
          <span>Add Line Item</span>
        </button>
        <div className="space-y-1">
          <div className="flex justify-between text-sm" style={{ color: '#1F271B' }}>
            <span>Subtotal</span>
            <span>{formatUsd(subtotal)}</span>
          </div>
          <div className="flex justify-between items-center text-sm gap-2">
            <span style={{ color: '#1F271B' }}>Discount (%)</span>
            <input
              type="number"
              name="discountPercent"
              value={discountPercent ?? ''}
              onChange={onFieldChange}
              min={0}
              max={100}
              step="0.5"
              className="w-20 px-2 py-1 border rounded text-right text-sm"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
            />
            <span className="w-20 text-right">{formatUsd(discountAmount)}</span>
          </div>
          <div className="flex justify-between text-sm" style={{ color: '#1F271B' }}>
            <span>Tax ({taxRatePercent}%)</span>
            <span>{formatUsd(taxAmount)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold pt-1" style={{ color: '#1F271B' }}>
            <span>Total</span>
            <span>{formatUsd(grandTotal)}</span>
          </div>
          <div className="flex justify-between text-sm pt-1" style={{ color: '#1F271B' }}>
            <span>Costs</span>
            <span>{formatUsd(totalCost)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium pt-1" style={{ color: '#1F271B' }}>
            <span>Estimated margin</span>
            <span>{formatUsd(estimatedMargin)} ({estimatedMarginPercent.toFixed(0)}%)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
