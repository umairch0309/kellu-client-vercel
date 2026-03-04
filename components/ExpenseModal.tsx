'use client'

import { useState, useRef, useEffect } from 'react'
import { FiX, FiSave, FiUpload } from 'react-icons/fi'
import { format } from 'date-fns'
import { mockWorkorders } from '@/data/mockData'

export type ExpenseFormData = {
  date: string
  itemName: string
  details: string
  total: number
  linkedWorkorder: number | null
  invoiceNumber: string
  attachment: File | null
}

type ExpenseRecord = {
  id: number
  date: string
  itemName: string
  details: string
  total: number
  linkedWorkorder: number | null
  invoiceNumber: string
  attachment?: string | File | null
}

interface ExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  /** When set, form is pre-filled and we're editing */
  expense?: ExpenseRecord | null
  onSave: (data: ExpenseFormData) => void
}

const inputFocusStyle = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = '#28AFB0'
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)'
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = '#EAEBED'
    e.currentTarget.style.boxShadow = 'none'
  },
}

export default function ExpenseModal({ isOpen, onClose, expense, onSave }: ExpenseModalProps) {
  const [workorderSearchTerm, setWorkorderSearchTerm] = useState('')
  const [isWorkorderDropdownOpen, setIsWorkorderDropdownOpen] = useState(false)
  const workorderDropdownRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState<ExpenseFormData>({
    date: format(new Date(), 'yyyy-MM-dd'),
    itemName: '',
    details: '',
    total: 0,
    linkedWorkorder: null,
    invoiceNumber: '',
    attachment: null,
  })

  useEffect(() => {
    if (!isOpen) return
    if (expense) {
      setFormData({
        date: expense.date,
        itemName: expense.itemName,
        details: expense.details || '',
        total: expense.total,
        linkedWorkorder: expense.linkedWorkorder ?? null,
        invoiceNumber: expense.invoiceNumber || '',
        attachment: null,
      })
      setWorkorderSearchTerm('')
    } else {
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        itemName: '',
        details: '',
        total: 0,
        linkedWorkorder: null,
        invoiceNumber: '',
        attachment: null,
      })
      setWorkorderSearchTerm('')
    }
  }, [isOpen, expense])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (workorderDropdownRef.current && !workorderDropdownRef.current.contains(event.target as Node)) {
        setIsWorkorderDropdownOpen(false)
      }
    }
    if (isWorkorderDropdownOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isWorkorderDropdownOpen])

  const linkedWorkorder = formData.linkedWorkorder ? mockWorkorders.find(wo => wo.id === formData.linkedWorkorder) : null
  const filteredWorkorders = mockWorkorders.filter(wo =>
    wo.title.toLowerCase().includes(workorderSearchTerm.toLowerCase()) ||
    wo.clientName.toLowerCase().includes(workorderSearchTerm.toLowerCase()) ||
    `#${wo.id}`.includes(workorderSearchTerm)
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  const handleWorkorderSelect = (woId: number) => {
    setFormData(prev => ({ ...prev, linkedWorkorder: woId }))
    setIsWorkorderDropdownOpen(false)
    setWorkorderSearchTerm('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col" style={{ border: '1px solid #EAEBED' }}>
        <div className="flex justify-between items-center px-4 py-3 border-b shrink-0" style={{ borderColor: '#EAEBED' }}>
          <h2 className="text-base font-semibold" style={{ color: '#1F271B' }}>{expense ? 'Edit Expense' : 'New Expense'}</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded hover:bg-gray-100" style={{ color: '#1F271B' }}>
            <FiX size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border rounded text-sm"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              required
              {...inputFocusStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Item name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.itemName}
              onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
              placeholder="Enter item name"
              className="w-full px-3 py-2 border rounded text-sm"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              required
              {...inputFocusStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Details</label>
            <textarea
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              placeholder="Enter expense details"
              rows={2}
              className="w-full px-3 py-2 border rounded text-sm resize-none"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              {...inputFocusStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Total <span className="text-red-500">*</span></label>
            <input
              type="number"
              value={formData.total || ''}
              onChange={(e) => setFormData({ ...formData, total: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              min={0}
              step={0.01}
              className="w-full px-3 py-2 border rounded text-sm"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              required
              {...inputFocusStyle}
            />
          </div>
          <div className="relative" ref={workorderDropdownRef}>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Linked Work order</label>
            <input
              type="text"
              value={workorderSearchTerm || (linkedWorkorder ? `WO #${linkedWorkorder.id} - ${linkedWorkorder.title}` : '')}
              onChange={(e) => { setWorkorderSearchTerm(e.target.value); setIsWorkorderDropdownOpen(true) }}
              onFocus={() => setIsWorkorderDropdownOpen(true)}
              placeholder="Search workorder..."
              className="w-full px-3 py-2 border rounded text-sm"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
            />
            {isWorkorderDropdownOpen && filteredWorkorders.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-40 overflow-y-auto" style={{ borderColor: '#EAEBED' }}>
                <button
                  type="button"
                  onClick={() => { setFormData(prev => ({ ...prev, linkedWorkorder: null })); setWorkorderSearchTerm(''); setIsWorkorderDropdownOpen(false) }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-b"
                  style={{ borderColor: '#EAEBED' }}
                >
                  None (Global Expense)
                </button>
                {filteredWorkorders.map(wo => (
                  <button
                    key={wo.id}
                    type="button"
                    onClick={() => handleWorkorderSelect(wo.id)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-b"
                    style={{ borderColor: '#EAEBED', backgroundColor: formData.linkedWorkorder === wo.id ? '#F3F4F6' : 'white' }}
                  >
                    WO #{wo.id} - {wo.title} ({wo.clientName})
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Invoice number</label>
            <input
              type="text"
              value={formData.invoiceNumber}
              onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
              placeholder="Enter invoice number"
              className="w-full px-3 py-2 border rounded text-sm"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              {...inputFocusStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Attachment (invoice)</label>
            <label className="flex items-center gap-2 px-3 py-2 border rounded cursor-pointer text-sm" style={{ borderColor: '#EAEBED', color: '#1F271B' }}>
              <FiUpload size={16} />
              <span>{formData.attachment ? formData.attachment.name : 'Upload file'}</span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => setFormData({ ...formData, attachment: e.target.files?.[0] || null })}
              />
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: '#EAEBED' }}>
            <button type="button" onClick={onClose} className="px-3 py-1.5 border rounded text-sm font-medium" style={{ borderColor: '#EAEBED', color: '#1F271B' }}>
              Cancel
            </button>
            <button type="submit" className="px-3 py-1.5 rounded text-sm font-medium text-white flex items-center gap-1.5" style={{ backgroundColor: '#28AFB0' }}>
              <FiSave size={14} />
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
