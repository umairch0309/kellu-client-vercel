'use client'

import { useState, useEffect } from 'react'
import Modal from '../../clients/_components/Modal'

export type ProductServiceItemType = 'Service' | 'Product'

export interface NewProductServiceData {
  itemType: ProductServiceItemType
  name: string
  description: string
  unitCost: number
  markupPercent: number
  unitPrice: number
}

interface AddProductServiceModalProps {
  isOpen: boolean
  onClose: () => void
  initialName?: string
  onSave: (data: NewProductServiceData) => void
}

export default function AddProductServiceModal({
  isOpen,
  onClose,
  initialName = '',
  onSave,
}: AddProductServiceModalProps) {
  const [formData, setFormData] = useState<NewProductServiceData>({
    itemType: 'Service',
    name: '',
    description: '',
    unitCost: 0,
    markupPercent: 0,
    unitPrice: 0,
  })

  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        name: initialName,
      }))
    }
  }, [isOpen, initialName])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    if (
      name === 'unitCost' ||
      name === 'markupPercent' ||
      name === 'unitPrice'
    ) {
      const num = parseFloat(String(value)) || 0
      setFormData((prev) => {
        const next = { ...prev, [name]: num }
        const cost = name === 'unitCost' ? num : prev.unitCost
        const markup = name === 'markupPercent' ? num : prev.markupPercent
        const price = name === 'unitPrice' ? num : prev.unitPrice
        if (name === 'unitCost' || name === 'markupPercent') {
          next.unitPrice = cost * (1 + markup / 100)
        } else {
          if (cost > 0) next.markupPercent = (price / cost - 1) * 100
        }
        return next
      })
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
    setFormData({
      itemType: 'Service',
      name: '',
      description: '',
      unitCost: 0,
      markupPercent: 0,
      unitPrice: 0,
    })
  }

  const inputBase =
    'w-full px-3.5 py-2.5 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-0'
  const inputStyle = { borderColor: '#EAEBED', color: '#1F271B' }
  const focusRing = 'focus:ring-[#28AFB0] focus:border-[#28AFB0]'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Product / Service"
      size="md"
      maxHeight="85vh"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: '#1F271B', opacity: 0.85 }}
          >
            Item Type
          </label>
          <select
            name="itemType"
            value={formData.itemType}
            onChange={handleChange}
            className={`${inputBase} ${focusRing}`}
            style={inputStyle}
          >
            <option value="Service">Service</option>
            <option value="Product">Product</option>
          </select>
        </div>

        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: '#1F271B', opacity: 0.85 }}
          >
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Water Cooler"
            className={`${inputBase} ${focusRing}`}
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: '#1F271B', opacity: 0.85 }}
          >
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter description"
            rows={3}
            className={`${inputBase} resize-none ${focusRing}`}
            style={inputStyle}
          />
        </div>

        <div>
          <p className="text-xs mb-2" style={{ color: '#1F271B', opacity: 0.7 }}>
            Unit price = Unit cost × (1 + Markup % ÷ 100). Changing cost or markup updates price; changing price updates markup.
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: '#1F271B', opacity: 0.85 }}
              >
                Unit cost
              </label>
              <input
                type="number"
                name="unitCost"
                value={formData.unitCost || ''}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0"
                className={`${inputBase} ${focusRing}`}
                style={inputStyle}
              />
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: '#1F271B', opacity: 0.85 }}
              >
                Markup (%)
              </label>
              <input
                type="number"
                name="markupPercent"
                value={formData.markupPercent || ''}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0"
                className={`${inputBase} ${focusRing}`}
                style={inputStyle}
              />
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: '#1F271B', opacity: 0.85 }}
              >
                Unit price
              </label>
              <input
                type="number"
                name="unitPrice"
                value={formData.unitPrice || ''}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0"
                className={`${inputBase} ${focusRing}`}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        <div
          className="flex justify-end gap-3 pt-2 border-t"
          style={{ borderColor: '#EAEBED' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border rounded-lg text-sm font-medium transition-colors"
            style={{
              borderColor: '#EAEBED',
              color: '#1F271B',
              backgroundColor: 'white',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#28AFB0' }}
          >
            Create
          </button>
        </div>
      </form>
    </Modal>
  )
}
