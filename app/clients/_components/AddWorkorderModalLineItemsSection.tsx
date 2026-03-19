'use client'

import { FiPlus, FiTrash2 } from 'react-icons/fi'
import { formatUsd } from '@/lib/formatCurrency'
import type { AddWorkorderFormData, LineItemForm } from './addWorkorderModalTypes'

export interface MasterPriceItem {
  id: number | string
  name: string
  description?: string
  price: number
  type: string
}

export interface AddWorkorderModalLineItemsSectionProps {
  show: boolean
  formData: AddWorkorderFormData
  setFormData: React.Dispatch<React.SetStateAction<AddWorkorderFormData>>
  lineItemsSectionRef: React.RefObject<HTMLDivElement>
  addLineItemDropdownRef: React.RefObject<HTMLDivElement>
  isAddLineItemDropdownOpen: boolean
  setIsAddLineItemDropdownOpen: (v: boolean) => void
  addLineItemSearchTerm: string
  setAddLineItemSearchTerm: (v: string) => void
  addLineItemServices: MasterPriceItem[]
  addLineItemProducts: MasterPriceItem[]
  addLineItemFiltered: MasterPriceItem[]
  onAddLineItemSelect: (item: { name: string; description: string; price: number }) => void
  /** Shown above the add button (e.g. invoice: "Line items (Optional)") */
  lineItemsSectionLabel?: string | null
  /** Footer link in the dropdown (e.g. go to Settings → products) */
  onNavigateCreatePriceItem?: () => void
  priceListLoading?: boolean
}

export default function AddWorkorderModalLineItemsSection({
  show,
  formData,
  setFormData,
  lineItemsSectionRef,
  addLineItemDropdownRef,
  isAddLineItemDropdownOpen,
  setIsAddLineItemDropdownOpen,
  addLineItemSearchTerm,
  setAddLineItemSearchTerm,
  addLineItemServices,
  addLineItemProducts,
  addLineItemFiltered,
  onAddLineItemSelect,
  lineItemsSectionLabel,
  onNavigateCreatePriceItem,
  priceListLoading = false,
}: AddWorkorderModalLineItemsSectionProps) {
  if (!show) return null

  return (
    <div ref={lineItemsSectionRef} className="space-y-3">
      {lineItemsSectionLabel ? (
        <div className="text-xs font-medium" style={{ color: '#1F271B' }}>
          {lineItemsSectionLabel}
        </div>
      ) : null}
      <div ref={addLineItemDropdownRef} className="relative">
        <button
          type="button"
          onClick={() => setIsAddLineItemDropdownOpen(!isAddLineItemDropdownOpen)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors"
          style={{ borderColor: '#EAEBED', color: '#28AFB0', backgroundColor: 'white' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6'; e.currentTarget.style.borderColor = '#28AFB0' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.borderColor = '#EAEBED' }}
        >
          <FiPlus size={14} />
          <span>Add Line Item</span>
        </button>
        {isAddLineItemDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-xl z-[100] w-full min-w-[260px] max-w-[320px]" style={{ borderColor: '#EAEBED' }}>
            <div className="p-2 border-b" style={{ borderColor: '#EAEBED' }}>
              <input
                type="text"
                placeholder="Name"
                value={addLineItemSearchTerm}
                onChange={(e) => setAddLineItemSearchTerm(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1"
                style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="max-h-56 overflow-y-auto">
              {priceListLoading && (
                <div className="px-3 py-4 text-sm" style={{ color: '#6B7280' }}>
                  Loading price list…
                </div>
              )}
              {!priceListLoading && addLineItemServices.length > 0 && (
                <div className="py-1">
                  <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6B7280' }}>Service</div>
                  {addLineItemServices.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onAddLineItemSelect({ name: item.name, description: item.description || '', price: item.price })}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b transition-colors"
                      style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-xs font-medium flex-shrink-0" style={{ color: '#6B7280' }}>{formatUsd(item.price ?? 0)}</span>
                      </div>
                      {item.description && (
                        <div className="text-xs mt-0.5 truncate" style={{ color: '#6B7280' }}>{item.description}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {!priceListLoading && addLineItemProducts.length > 0 && (
                <div className="py-1 border-t" style={{ borderColor: '#EAEBED' }}>
                  <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wide" style={{ color: '#6B7280' }}>Product</div>
                  {addLineItemProducts.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onAddLineItemSelect({ name: item.name, description: item.description || '', price: item.price })}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b transition-colors"
                      style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-xs font-medium flex-shrink-0" style={{ color: '#6B7280' }}>{formatUsd(item.price ?? 0)}</span>
                      </div>
                      {item.description && (
                        <div className="text-xs mt-0.5 truncate" style={{ color: '#6B7280' }}>{item.description}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {!priceListLoading && addLineItemFiltered.length === 0 && (
                <div className="px-3 py-4 text-sm" style={{ color: '#6B7280' }}>No items match your search.</div>
              )}
            </div>
            {onNavigateCreatePriceItem && (
              <div className="border-t p-2" style={{ borderColor: '#EAEBED' }}>
                <button
                  type="button"
                  onClick={() => {
                    onNavigateCreatePriceItem()
                  }}
                  className="w-full text-left px-2 py-2 text-xs font-medium rounded transition-colors"
                  style={{ color: '#28AFB0' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F3F4F6'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  Create new line item in Settings
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {formData.lineItems.length > 0 && (
        <div className="space-y-2">
          {formData.lineItems.map((item: LineItemForm, index: number) => (
            <div
              key={index}
              className="flex items-start justify-between gap-2 p-3 border rounded-lg bg-white"
              style={{ borderColor: '#EAEBED' }}
            >
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm" style={{ color: '#1F271B' }}>{item.name}</div>
                {item.description ? (
                  <div className="text-xs mt-0.5 truncate" style={{ color: '#6B7280' }}>{item.description}</div>
                ) : null}
                <div className="text-xs mt-1" style={{ color: '#6B7280' }}>{formatUsd((item.quantity || 0) * (item.unitPrice || 0))}</div>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, lineItems: prev.lineItems.filter((_, i) => i !== index) }))}
                className="p-1.5 rounded text-red-500 hover:bg-red-50 flex-shrink-0 transition-colors"
                title="Remove line item"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
