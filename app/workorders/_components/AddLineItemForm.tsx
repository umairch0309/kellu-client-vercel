'use client'

import { FiPlus, FiInfo, FiCheckCircle } from 'react-icons/fi'
import { mockMaterialsList } from '@/data/mockData'
import { formatUsd } from '@/lib/formatCurrency'
import type { LineItemForm } from './workorderDetailTypes'

export interface AddLineItemFormProps {
  newLineItem: LineItemForm
  setNewLineItem: (item: LineItemForm | ((prev: LineItemForm) => LineItemForm)) => void
  lineItemError: string
  setLineItemError: (s: string) => void
  onCancel: () => void
  onSave: () => void | Promise<void>
  saving?: boolean
  onOpenCreateProduct: () => void
  lineItemNameDropdownRef: React.RefObject<HTMLDivElement>
}

export default function AddLineItemForm({
  newLineItem,
  setNewLineItem,
  lineItemError,
  setLineItemError,
  onCancel,
  onSave,
  saving = false,
  onOpenCreateProduct,
  lineItemNameDropdownRef,
}: AddLineItemFormProps) {
  const filtered = mockMaterialsList.filter(m => m.name.toLowerCase().includes((newLineItem.name || '').toLowerCase()))
  const hasExactMatch = filtered.some(m => m.name.toLowerCase() === (newLineItem.name || '').trim().toLowerCase())
  const showCreateNew = (newLineItem.name || '').trim() !== '' && (filtered.length === 0 || !hasExactMatch)
  const showDropdown = filtered.length > 0 || showCreateNew

  return (
    <div ref={lineItemNameDropdownRef} className="mb-4 p-4 border rounded-lg" style={{ borderColor: '#EAEBED', backgroundColor: '#F9FAFB' }}>
      <div className="space-y-3">
        <div className="relative">
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={newLineItem.name}
            onChange={(e) => { setNewLineItem({ ...newLineItem, name: e.target.value }); setLineItemError('') }}
            placeholder="Type to search materials..."
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all ${lineItemError ? 'border-red-500' : ''}`}
            style={{ borderColor: lineItemError ? '#DC2626' : '#EAEBED', color: '#1F271B' }}
            onFocus={(e) => {
              if (!lineItemError) { e.currentTarget.style.borderColor = '#28AFB0'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)' }
            }}
            onBlur={(e) => {
              if (!lineItemError) { e.currentTarget.style.borderColor = '#EAEBED'; e.currentTarget.style.boxShadow = 'none' }
            }}
          />
          {lineItemError && (
            <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#DC2626' }}><FiInfo size={12} />{lineItemError}</p>
          )}
          {showDropdown && (newLineItem.name || '').trim() !== '' && (
            <div className="absolute z-10 left-0 right-0 mt-1 bg-white border rounded shadow-lg max-h-48 overflow-y-auto" style={{ borderColor: '#EAEBED' }}>
              {filtered.slice(0, 8).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setNewLineItem({ ...newLineItem, name: m.name, description: m.description || '', unitPrice: m.unitPrice ?? 0 })
                    setLineItemError('')
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
                  onClick={onOpenCreateProduct}
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
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>Description</label>
          <textarea
            value={newLineItem.description}
            onChange={(e) => setNewLineItem({ ...newLineItem, description: e.target.value })}
            placeholder="Enter description"
            rows={3}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all resize-none"
            style={{ borderColor: '#EAEBED', color: '#1F271B' }}
          />
        </div>
        <div className="grid grid-cols-4 gap-2">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Quantity</label>
            <input
              type="number"
              value={newLineItem.quantity}
              onChange={(e) => setNewLineItem({ ...newLineItem, quantity: parseFloat(e.target.value) || 0 })}
              min={0}
              step={0.01}
              className="w-full px-2 py-2 border rounded text-sm text-center"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Unit cost</label>
            <input
              type="number"
              value={newLineItem.unitCost}
              onChange={(e) => setNewLineItem({ ...newLineItem, unitCost: parseFloat(e.target.value) || 0 })}
              min={0}
              step={0.01}
              className="w-full px-2 py-2 border rounded text-sm text-center"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Unit price</label>
            <input
              type="number"
              value={newLineItem.unitPrice}
              onChange={(e) => setNewLineItem({ ...newLineItem, unitPrice: parseFloat(e.target.value) || 0 })}
              min={0}
              step={0.01}
              className="w-full px-2 py-2 border rounded text-sm text-center"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Total</label>
            <div className="px-2 py-2 border rounded text-sm text-center font-semibold" style={{ borderColor: '#EAEBED', backgroundColor: '#F3F4F6', color: '#1F271B' }}>
              {formatUsd(newLineItem.quantity * newLineItem.unitPrice)}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t" style={{ borderTopColor: '#EAEBED' }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-3 py-1.5 border rounded text-xs font-medium transition-all disabled:opacity-50"
          style={{ borderColor: '#EAEBED', color: '#1F271B', backgroundColor: 'white' }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void onSave()}
          disabled={saving}
          className="px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5 disabled:opacity-50"
          style={{ backgroundColor: '#28AFB0', color: 'white' }}
        >
          <FiCheckCircle size={14} />
          <span>{saving ? 'Saving…' : 'Save'}</span>
        </button>
      </div>
    </div>
  )
}
