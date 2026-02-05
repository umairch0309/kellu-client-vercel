'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiSave, FiChevronLeft, FiUpload, FiX } from 'react-icons/fi'
import { format } from 'date-fns'
import { mockWorkorders, mockClients } from '@/data/mockData'

interface NewExpenseFormProps {
  workorderId?: number
}

export default function NewExpenseForm({ workorderId }: NewExpenseFormProps = {}) {
  const router = useRouter()
  const [workorderSearchTerm, setWorkorderSearchTerm] = useState('')
  const [isWorkorderDropdownOpen, setIsWorkorderDropdownOpen] = useState(false)
  const workorderDropdownRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    itemName: '',
    details: '',
    total: 0,
    linkedWorkorder: workorderId || null as number | null,
    invoiceNumber: '',
    attachment: null as File | null,
  })

  // Get workorder data if linked
  const linkedWorkorder = formData.linkedWorkorder ? mockWorkorders.find(wo => wo.id === formData.linkedWorkorder) : null

  // Filter workorders based on search
  const filteredWorkorders = mockWorkorders.filter(wo =>
    wo.title.toLowerCase().includes(workorderSearchTerm.toLowerCase()) ||
    wo.clientName.toLowerCase().includes(workorderSearchTerm.toLowerCase()) ||
    `#${wo.id}`.includes(workorderSearchTerm)
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (workorderDropdownRef.current && !workorderDropdownRef.current.contains(event.target as Node)) {
        setIsWorkorderDropdownOpen(false)
      }
    }
    if (isWorkorderDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isWorkorderDropdownOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Expense added successfully! (Static UI)')
    router.push('/expenses')
  }

  const handleCancel = () => {
    router.push('/expenses')
  }

  const handleWorkorderSelect = (woId: number) => {
    setFormData({ ...formData, linkedWorkorder: woId })
    setIsWorkorderDropdownOpen(false)
    setWorkorderSearchTerm('')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b" style={{ borderColor: '#EAEBED' }}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="p-1.5 rounded transition-colors hover:bg-gray-100"
              style={{ color: '#1F271B' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F3F4F6'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <FiChevronLeft size={20} />
            </button>
            <div className="h-1 w-8 rounded-full" style={{ backgroundColor: '#28AFB0' }}></div>
            <h1 className="text-xl font-bold" style={{ color: '#1F271B' }}>New Expense</h1>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Expense Details Section */}
          <div className="bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: '#1F271B' }}>Expense Details</h2>
            <div className="space-y-3">
              {/* Date */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all"
                  style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                  required
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#28AFB0'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#EAEBED'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>

              {/* Item Name */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>
                  Item name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  placeholder="Enter item name"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all"
                  style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                  required
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#28AFB0'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#EAEBED'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>

              {/* Details */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>
                  Details
                </label>
                <textarea
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  placeholder="Enter expense details"
                  rows={3}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all resize-none"
                  style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#28AFB0'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#EAEBED'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>

              {/* Total */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>
                  Total <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.total || ''}
                  onChange={(e) => setFormData({ ...formData, total: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all"
                  style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                  required
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#28AFB0'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#EAEBED'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>

              {/* Linked Workorder */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>
                  Linked Work order (when applies)
                </label>
                <div className="relative" ref={workorderDropdownRef}>
                  <input
                    type="text"
                    value={workorderSearchTerm || (linkedWorkorder ? `WO #${linkedWorkorder.id} - ${linkedWorkorder.title}` : '')}
                    onChange={(e) => {
                      setWorkorderSearchTerm(e.target.value)
                      setIsWorkorderDropdownOpen(true)
                    }}
                    placeholder="Search workorder..."
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all"
                    style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                    onFocus={() => setIsWorkorderDropdownOpen(true)}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#EAEBED'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                  {isWorkorderDropdownOpen && filteredWorkorders.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-48 overflow-y-auto" style={{ borderColor: '#EAEBED' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, linkedWorkorder: null })
                          setWorkorderSearchTerm('')
                          setIsWorkorderDropdownOpen(false)
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-opacity-50 transition-colors border-b"
                        style={{ color: '#1F271B', backgroundColor: formData.linkedWorkorder === null ? '#F3F4F6' : 'white', borderBottomColor: '#EAEBED' }}
                      >
                        None (Global Expense)
                      </button>
                      {filteredWorkorders.map((wo) => (
                        <button
                          key={wo.id}
                          type="button"
                          onClick={() => handleWorkorderSelect(wo.id)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-opacity-50 transition-colors border-b"
                          style={{ 
                            color: '#1F271B', 
                            backgroundColor: formData.linkedWorkorder === wo.id ? '#F3F4F6' : 'white',
                            borderBottomColor: '#EAEBED'
                          }}
                        >
                          <div className="font-medium">WO #{wo.id} - {wo.title}</div>
                          <div className="text-[10px]" style={{ color: '#1F271B', opacity: 0.6 }}>{wo.clientName}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {linkedWorkorder && (
                  <p className="text-xs mt-1" style={{ color: '#1F271B', opacity: 0.7 }}>
                    Linked to: {linkedWorkorder.title} ({linkedWorkorder.clientName})
                  </p>
                )}
              </div>

              {/* Invoice Number */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>
                  Invoice number
                </label>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  placeholder="Enter invoice number"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all"
                  style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#28AFB0'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#EAEBED'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>

              {/* Attachment */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>
                  Attachment (invoice)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 px-3 py-2 border rounded cursor-pointer flex items-center justify-center gap-2 text-sm transition-all hover:bg-gray-50"
                    style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#28AFB0'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#EAEBED'
                    }}
                  >
                    <FiUpload size={16} />
                    <span className="truncate">{formData.attachment ? formData.attachment.name : 'Upload file'}</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setFormData({ ...formData, attachment: file })
                        }
                      }}
                    />
                  </label>
                  {formData.attachment && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, attachment: null })}
                      className="px-3 py-2 border rounded text-sm transition-all"
                      style={{ borderColor: '#DC2626', color: '#DC2626', backgroundColor: 'white' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#FEE2E2'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white'
                      }}
                    >
                      <FiX size={16} />
                    </button>
                  )}
                </div>
                {formData.attachment && (
                  <p className="text-xs mt-1" style={{ color: '#1F271B', opacity: 0.7 }}>
                    {formData.attachment.name} ({(formData.attachment.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Form Footer */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border rounded transition-all text-sm font-medium"
              style={{ borderColor: '#EAEBED', color: '#1F271B', backgroundColor: 'white' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F3F4F6'
                e.currentTarget.style.borderColor = '#D1D5DB'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white'
                e.currentTarget.style.borderColor = '#EAEBED'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded transition-all flex items-center gap-2 text-sm text-white font-medium shadow-sm hover:shadow-md"
              style={{ backgroundColor: '#28AFB0' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1E8A8B'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#28AFB0'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <FiSave size={16} />
              <span>Save Expense</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
