'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FiSave, FiChevronLeft, FiPlus, FiX, FiChevronDown, FiTrash2, FiCheckCircle, FiUpload, FiCheck } from 'react-icons/fi'
import { format } from 'date-fns'
import { mockClients, mockTeamMembers, mockWorkorders, mockMaterialsList, companyTaxRatePercent } from '@/data/mockData'
import AddProductServiceModal, { type NewProductServiceData } from './AddProductServiceModal'

interface LineItem {
  name: string
  description: string
  quantity: number
  unitPrice: number
}

interface ExpenseItem {
  date: string
  itemName: string
  details: string
  total: number
  linkedWorkorder?: number | null
  invoiceNumber?: string
}

interface NewWorkorderFormProps {
  workorderId?: number
}

export default function NewWorkorderForm({ workorderId }: NewWorkorderFormProps = {}) {
  const router = useRouter()
  const [clientSearchTerm, setClientSearchTerm] = useState('')
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false)
  const [isTeamMemberDropdownOpen, setIsTeamMemberDropdownOpen] = useState(false)
  const [assignSearchTerm, setAssignSearchTerm] = useState('')
  const [lineItemNameDropdownIndex, setLineItemNameDropdownIndex] = useState<number | null>(null)
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false)
  const [addProductModalLineIndex, setAddProductModalLineIndex] = useState<number | null>(null)
  const [addProductModalInitialName, setAddProductModalInitialName] = useState('')
  const [customMaterials, setCustomMaterials] = useState<Array<{ id: number; name: string; description: string; unitPrice: number }>>([])
  const clientDropdownRef = useRef<HTMLDivElement>(null)
  const teamMemberDropdownRef = useRef<HTMLDivElement>(null)
  const lineItemsSectionRef = useRef<HTMLDivElement>(null)

  // Get workorder data if editing
  const workorder = workorderId ? mockWorkorders.find(wo => wo.id === workorderId) : null

  const [formData, setFormData] = useState({
    title: workorder?.title || '',
    clientId: workorder?.clientId || null as number | null,
    clientName: workorder?.clientName || '',
    address: workorder?.address || '',
    scheduleDay: workorder?.schedule?.day || format(new Date(), 'yyyy-MM-dd'),
    startTime: workorder?.schedule?.startTime || '09:00',
    endTime: workorder?.schedule?.endTime || '10:00',
    scheduleLater: false,
    anytime: workorder ? (workorder as { anytime?: boolean }).anytime ?? false : true,
    assignedTeamMembers: workorder?.assignedTeamMember ? [workorder.assignedTeamMember] : [] as string[],
    instructions: workorder?.instructions || '',
    lineItems: (workorder?.lineItems || []).map((item: any) => ({
      name: item.name,
      description: item.description || '',
      quantity: item.quantity,
      unitPrice: item.unitPrice ?? item.unitCost ?? 0,
    })) as LineItem[],
    discountPercent: 0,
    notes: workorder?.notes || '',
  })

  // Expenses (edit view only)
  const [editedExpenses, setEditedExpenses] = useState<ExpenseItem[]>(() => {
    if (!workorderId) return []
    const wo = mockWorkorders.find(w => w.id === workorderId)
    const ex = wo ? (wo as any).expenses : undefined
    if (!Array.isArray(ex)) return []
    return ex.map((e: any) => ({
      date: e.date || new Date().toISOString().split('T')[0],
      itemName: e.itemName || e.name || '',
      details: e.details || '',
      total: e.total ?? e.amount ?? 0,
      linkedWorkorder: e.linkedWorkorder ?? workorderId,
      invoiceNumber: e.invoiceNumber || '',
    }))
  })
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    itemName: '',
    details: '',
    total: 0,
    linkedWorkorder: workorderId ?? null as number | null,
    invoiceNumber: '',
    attachment: null as File | null,
  })

  // Get last job address for selected client
  useEffect(() => {
    if (formData.clientId) {
      const lastJob = mockWorkorders
        .filter(wo => wo.clientId === formData.clientId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
      
      if (lastJob && lastJob.address) {
        setFormData(prev => ({ ...prev, address: lastJob.address }))
      } else {
        const client = mockClients.find(c => c.id === formData.clientId)
        if (client && client.address) {
          setFormData(prev => ({ ...prev, address: client.address || '' }))
        }
      }
    }
  }, [formData.clientId])

  // Filter clients based on search
  const filteredClients = mockClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      client.phone.includes(clientSearchTerm) ||
      (client.email && client.email.toLowerCase().includes(clientSearchTerm.toLowerCase()))
    // Always include the selected client when editing
    return matchesSearch || (workorderId && client.id === formData.clientId)
  })

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(target)) {
        setIsClientDropdownOpen(false)
      }
      if (teamMemberDropdownRef.current && !teamMemberDropdownRef.current.contains(target)) {
        setIsTeamMemberDropdownOpen(false)
      }
      if (lineItemNameDropdownIndex !== null && lineItemsSectionRef.current && !lineItemsSectionRef.current.contains(target)) {
        setLineItemNameDropdownIndex(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isClientDropdownOpen, isTeamMemberDropdownOpen, lineItemNameDropdownIndex])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (workorderId) {
      alert('Workorder updated successfully! (Static UI)')
      router.push(`/workorders/${workorderId}`)
    } else {
      alert('Workorder created successfully! (Static UI)')
      router.push('/workorders')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData({
        ...formData,
        [name]: checked,
      })
    } else if (name === 'discountPercent') {
      setFormData({
        ...formData,
        [name]: parseFloat(String(value)) || 0,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleClientSelect = (clientId: number, clientName: string) => {
    setFormData({
      ...formData,
      clientId,
      clientName,
    })
    setIsClientDropdownOpen(false)
    setClientSearchTerm('')
  }

  // Assign options: Business owner + team members (no Unavailable - same as Filter)
  const assignOptions = [
    { value: 'Business owner', label: 'Business owner' },
    ...mockTeamMembers.map(m => ({ value: m.name, label: m.name })),
  ]
  const filteredAssignOptions = assignOptions.filter(opt =>
    opt.label.toLowerCase().includes(assignSearchTerm.toLowerCase())
  )
  const assignedSet = new Set(formData.assignedTeamMembers)
  const toggleAssignSelection = (value: string) => {
    const next = assignedSet.has(value)
      ? formData.assignedTeamMembers.filter(n => n !== value)
      : [...formData.assignedTeamMembers, value]
    setFormData({ ...formData, assignedTeamMembers: next })
  }
  const clearAssignSelection = () => setFormData({ ...formData, assignedTeamMembers: [] })
  const selectAllAssign = () => setFormData({ ...formData, assignedTeamMembers: assignOptions.map(o => o.value) })

  const addLineItem = () => {
    setFormData({
      ...formData,
      lineItems: [...formData.lineItems, { name: '', description: '', quantity: 1, unitPrice: 0 }],
    })
  }

  const removeLineItem = (index: number) => {
    setFormData({
      ...formData,
      lineItems: formData.lineItems.filter((_, i) => i !== index),
    })
  }

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updatedLineItems = [...formData.lineItems]
    updatedLineItems[index] = {
      ...updatedLineItems[index],
      [field]: value,
    }
    setFormData({
      ...formData,
      lineItems: updatedLineItems,
    })
  }

  const calculateLineItemTotal = (item: LineItem) => {
    return item.quantity * item.unitPrice
  }

  const subtotal = formData.lineItems.reduce((sum, item) => sum + calculateLineItemTotal(item), 0)
  const discountAmount = (subtotal * (formData.discountPercent || 0)) / 100
  const afterDiscount = subtotal - discountAmount
  const taxAmount = (afterDiscount * companyTaxRatePercent) / 100
  const grandTotal = afterDiscount + taxAmount

  const handleCancel = () => {
    if (workorderId) {
      router.push(`/workorders/${workorderId}`)
    } else {
      router.push('/workorders')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Green Bar */}
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
            <h1 className="text-xl font-bold" style={{ color: '#1F271B' }}>
              {workorderId ? 'Edit Workorder' : 'New Workorder'}
            </h1>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Job Details Section - Two Column Layout */}
          <div className="bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: '#1F271B' }}>Job Details</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter job title"
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

                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>
                    Select a client
                  </label>
                  <div className="relative" ref={clientDropdownRef}>
                    <input
                      type="text"
                      value={clientSearchTerm || formData.clientName}
                      onChange={(e) => {
                        setClientSearchTerm(e.target.value)
                        setIsClientDropdownOpen(true)
                      }}
                      placeholder="Search client..."
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all"
                      style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                      required
                      onFocus={(e) => {
                        setIsClientDropdownOpen(true)
                        e.currentTarget.style.borderColor = '#28AFB0'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#EAEBED'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    />
                    {isClientDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-48 overflow-y-auto" style={{ borderColor: '#EAEBED' }}>
                        {filteredClients.map((client) => (
                          <button
                            key={client.id}
                            type="button"
                            onClick={() => handleClientSelect(client.id, client.name)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-opacity-50 transition-colors border-b"
                            style={{ 
                              color: '#1F271B', 
                              backgroundColor: formData.clientId === client.id ? '#F3F4F6' : 'white',
                              borderBottomColor: '#EAEBED'
                            }}
                            onMouseEnter={(e) => {
                              if (formData.clientId !== client.id) {
                                e.currentTarget.style.backgroundColor = '#F9FAFB'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (formData.clientId !== client.id) {
                                e.currentTarget.style.backgroundColor = 'white'
                              }
                            }}
                          >
                            <div className="font-medium">{client.name}</div>
                            <div className="text-xs" style={{ color: '#1F271B', opacity: 0.6 }}>{client.phone}</div>
                          </button>
                        ))}
                        <button
                          type="button"
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors"
                          style={{ color: '#28AFB0' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white' }}
                          onClick={() => setIsClientDropdownOpen(false)}
                        >
                          <FiPlus size={14} />
                          <span>New client</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter property address"
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
              </div>
            </div>
          </div>

          {/* Schedule + Assign Team Member row (Schedule left, Assign right like screenshot) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Schedule Section - left, wider */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold" style={{ color: '#1F271B' }}>Schedule</h2>
            </div>

            {/* Date and time selection row first */}
            <div className={`grid gap-3 mb-4 ${formData.anytime ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B', opacity: 0.7 }}>
                  Start date
                </label>
                <input
                  type="date"
                  name="scheduleDay"
                  value={formData.scheduleDay}
                  onChange={handleChange}
                  disabled={formData.scheduleLater}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all disabled:opacity-60 disabled:bg-gray-50"
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
              {!formData.anytime && (
                <>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B', opacity: 0.7 }}>
                      Start time
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      disabled={formData.scheduleLater}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all disabled:opacity-60 disabled:bg-gray-50"
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
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B', opacity: 0.7 }}>
                      End time
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      disabled={formData.scheduleLater}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all disabled:opacity-60 disabled:bg-gray-50"
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
                </>
              )}
            </div>

            {/* Schedule later and Anytime below date/time selection */}
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="scheduleLater"
                  checked={formData.scheduleLater}
                  onChange={handleChange}
                  className="w-4 h-4 rounded focus:ring-1"
                  style={{ accentColor: '#28AFB0', borderColor: '#EAEBED' }}
                />
                <span className="text-sm" style={{ color: '#1F271B' }}>
                  Schedule later
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="anytime"
                  checked={formData.anytime}
                  onChange={handleChange}
                  className="w-4 h-4 rounded focus:ring-1"
                  style={{ accentColor: '#28AFB0', borderColor: '#EAEBED' }}
                />
                <span className="text-sm" style={{ color: '#1F271B' }}>
                  Anytime
                </span>
              </label>
            </div>
            </div>

            {/* Assign Team Member - Filter-style popup: Search team, Select all/Clear, list (incl. Business owner); no Unavailable */}
            <div className="lg:col-span-1 bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>
                Assign Team Member
              </label>
              <div className="relative" ref={teamMemberDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsTeamMemberDropdownOpen(!isTeamMemberDropdownOpen)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all flex items-center justify-between"
                  style={{ borderColor: '#EAEBED', color: formData.assignedTeamMembers.length ? '#1F271B' : '#9CA3AF', backgroundColor: 'white' }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#28AFB0'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#EAEBED'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <span className="truncate">
                    {formData.assignedTeamMembers.length === 0
                      ? 'Select team member'
                      : formData.assignedTeamMembers.length === 1
                        ? formData.assignedTeamMembers[0]
                        : `${formData.assignedTeamMembers.length} selected`}
                  </span>
                  <FiChevronDown size={14} style={{ color: '#1F271B', opacity: 0.5 }} className={`transition-transform ${isTeamMemberDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isTeamMemberDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-xl min-w-[200px]" style={{ borderColor: '#EAEBED' }}>
                    <div className="p-1.5 border-b" style={{ borderColor: '#EAEBED' }}>
                      <input
                        type="text"
                        placeholder="Search team"
                        value={assignSearchTerm}
                        onChange={(e) => setAssignSearchTerm(e.target.value)}
                        className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1"
                        style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="px-2 py-1.5 border-b flex items-center justify-between" style={{ borderColor: '#EAEBED' }}>
                      <span className="text-sm font-medium" style={{ color: '#1F271B' }}>Select team</span>
                      <button
                        type="button"
                        onClick={() => assignedSet.size === assignOptions.length ? clearAssignSelection() : selectAllAssign()}
                        className="text-sm font-medium underline"
                        style={{ color: '#28AFB0' }}
                      >
                        {assignedSet.size === assignOptions.length ? 'Clear' : 'Select all'}
                      </button>
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {filteredAssignOptions.map((option) => {
                        const isSelected = assignedSet.has(option.value)
                        return (
                          <div
                            key={option.value}
                            role="button"
                            tabIndex={0}
                            onClick={() => toggleAssignSelection(option.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleAssignSelection(option.value) } }}
                            className="px-2 py-1.5 cursor-pointer flex items-center gap-2 transition-colors"
                            style={{ backgroundColor: 'transparent' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                          >
                            <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 bg-[#2B50AA]" />
                            <span className="text-sm font-medium flex-1 min-w-0" style={{ color: '#1F271B' }}>{option.label}</span>
                            {isSelected && <FiCheck className="flex-shrink-0" size={16} style={{ color: '#28AFB0' }} strokeWidth={3} />}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Instructions Section */}
          <div className="bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: '#1F271B' }}>Instructions</h2>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>Instructions</label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              placeholder="Enter job instructions..."
              rows={4}
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

          {/* Product / Service - Jobber-style line items */}
          <div ref={lineItemsSectionRef} className="bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold" style={{ color: '#1F271B' }}>Product / Service</h2>
              <button
                type="button"
                onClick={addLineItem}
                className="px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md"
                style={{ backgroundColor: '#28AFB0', color: 'white' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E8A8B' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#28AFB0' }}
              >
                <FiPlus size={12} />
                <span>Add Line Item</span>
              </button>
            </div>
            {formData.lineItems.length === 0 ? (
              <div className="p-4 rounded text-center border" style={{ borderColor: '#EAEBED', backgroundColor: '#F3F4F6' }}>
                <p className="text-sm" style={{ color: '#1F271B', opacity: 0.6 }}>No line items added</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.lineItems.map((item, index) => {
                  const allMaterials = [...mockMaterialsList, ...customMaterials]
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
                                    <span className="font-medium">{m.name}</span>
                                    {m.unitPrice > 0 && <span className="text-xs ml-2 opacity-70">Rs{m.unitPrice.toFixed(2)}</span>}
                                  </button>
                                ))}
                                {showCreateNew && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAddProductModalInitialName((item.name || '').trim())
                                      setAddProductModalLineIndex(index)
                                      setIsAddProductModalOpen(true)
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
                              min="0"
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
                              min="0"
                              step="0.01"
                              className="w-full px-2 py-2 border rounded text-sm text-center"
                              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                            />
                          </div>
                          <div className="w-24 flex flex-col justify-end pb-0.5">
                            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.8 }}>Total</label>
                            <div className="px-2 py-2 border rounded text-sm text-center font-semibold" style={{ borderColor: '#EAEBED', backgroundColor: '#F3F4F6', color: '#1F271B' }}>
                              Rs{calculateLineItemTotal(item).toFixed(2)}
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
                <div className="pt-3 border-t space-y-1" style={{ borderTopColor: '#EAEBED' }}>
                  <div className="flex justify-between text-sm" style={{ color: '#1F271B' }}>
                    <span>Subtotal</span>
                    <span>Rs {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm gap-2">
                    <span style={{ color: '#1F271B' }}>Discount (%)</span>
                    <input
                      type="number"
                      name="discountPercent"
                      value={formData.discountPercent ?? ''}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.5"
                      className="w-20 px-2 py-1 border rounded text-right text-sm"
                      style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                    />
                    <span className="w-20 text-right">Rs {discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm" style={{ color: '#1F271B' }}>
                    <span>Tax ({companyTaxRatePercent}%)</span>
                    <span>Rs {taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-1" style={{ color: '#1F271B' }}>
                    <span>Total</span>
                    <span>Rs {grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Expenses Section (edit view only) */}
          {workorderId && (
            <div className="bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold" style={{ color: '#1F271B' }}>Expenses</h2>
                <button
                  type="button"
                  onClick={() => {
                    setNewExpense({
                      date: new Date().toISOString().split('T')[0],
                      itemName: '',
                      details: '',
                      total: 0,
                      linkedWorkorder: workorderId,
                      invoiceNumber: '',
                      attachment: null,
                    })
                    setIsAddExpenseOpen(true)
                  }}
                  className="px-3 py-1.5 border rounded text-xs font-medium flex items-center gap-1.5 transition-all"
                  style={{ borderColor: '#28AFB0', color: '#28AFB0', backgroundColor: 'white' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F0FDFA'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white'
                  }}
                >
                  <FiPlus size={12} />
                  <span>New Expense</span>
                </button>
              </div>
              <p className="text-sm mb-4" style={{ color: '#1F271B', opacity: 0.6 }}>
                Get an accurate picture of various job costs by recording expenses
              </p>
              {editedExpenses.length === 0 ? (
                <div className="p-4 rounded text-center border" style={{ borderColor: '#EAEBED', backgroundColor: '#F3F4F6' }}>
                  <p className="text-sm" style={{ color: '#1F271B', opacity: 0.6 }}>No expenses added</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {editedExpenses.map((exp, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded"
                      style={{ borderColor: '#EAEBED', backgroundColor: '#F9FAFB' }}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: '#1F271B' }}>{exp.itemName}</p>
                        <p className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>
                          {format(new Date(exp.date), 'MMM d, yyyy')} · Rs{exp.total.toFixed(2)}
                          {exp.details ? ` · ${exp.details}` : ''}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditedExpenses(prev => prev.filter((_, i) => i !== index))}
                        className="p-2 rounded transition-colors shrink-0"
                        style={{ color: '#1F271B', opacity: 0.7 }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.backgroundColor = '#FEE2E2' }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.backgroundColor = 'transparent' }}
                        title="Delete expense"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notes Section */}
          <div className="bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: '#1F271B' }}>Notes</h2>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Enter additional notes..."
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

          {/* Form Footer */}
          <div className="flex justify-end gap-3 pt-4">
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
              <span>{workorderId ? 'Update Workorder' : 'Save Workorder'}</span>
            </button>
          </div>
        </form>

      {/* Add Expense Modal (edit view only) */}
      {workorderId && isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col" style={{ borderColor: '#EAEBED' }}>
            <div className="flex items-center justify-between p-3 border-b" style={{ borderBottomColor: '#EAEBED' }}>
              <h2 className="text-base font-semibold" style={{ color: '#1F271B' }}>Add Expense</h2>
              <button
                type="button"
                onClick={() => {
                  setIsAddExpenseOpen(false)
                  setNewExpense({
                    date: new Date().toISOString().split('T')[0],
                    itemName: '',
                    details: '',
                    total: 0,
                    linkedWorkorder: workorderId,
                    invoiceNumber: '',
                    attachment: null,
                  })
                }}
                className="p-1 rounded transition-colors"
                style={{ color: '#1F271B', opacity: 0.6 }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.backgroundColor = '#F3F4F6' }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-2 text-xs transition-all"
                  style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                  required
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#28AFB0'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#EAEBED'; e.currentTarget.style.boxShadow = 'none' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Item name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newExpense.itemName}
                  onChange={(e) => setNewExpense({ ...newExpense, itemName: e.target.value })}
                  placeholder="Enter item name"
                  className="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-2 text-xs transition-all"
                  style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                  required
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#28AFB0'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#EAEBED'; e.currentTarget.style.boxShadow = 'none' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Details</label>
                <textarea
                  value={newExpense.details}
                  onChange={(e) => setNewExpense({ ...newExpense, details: e.target.value })}
                  placeholder="Enter expense details"
                  rows={2}
                  className="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-2 text-xs transition-all resize-none"
                  style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#28AFB0'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#EAEBED'; e.currentTarget.style.boxShadow = 'none' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Total <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={newExpense.total || ''}
                  onChange={(e) => setNewExpense({ ...newExpense, total: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-2 text-xs transition-all"
                  style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                  required
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#28AFB0'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#EAEBED'; e.currentTarget.style.boxShadow = 'none' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Linked Work order (when applies)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={newExpense.linkedWorkorder ?? ''}
                    onChange={(e) => setNewExpense({ ...newExpense, linkedWorkorder: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="Work order ID"
                    min="1"
                    className="flex-1 px-2.5 py-1.5 border rounded focus:outline-none focus:ring-2 text-xs transition-all"
                    style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#28AFB0'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#EAEBED'; e.currentTarget.style.boxShadow = 'none' }}
                  />
                  <span className="text-xs px-2 py-1 rounded whitespace-nowrap" style={{ backgroundColor: '#F3F4F6', color: '#1F271B' }}>
                    Current: #{workorderId}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Invoice number</label>
                <input
                  type="text"
                  value={newExpense.invoiceNumber}
                  onChange={(e) => setNewExpense({ ...newExpense, invoiceNumber: e.target.value })}
                  placeholder="Enter invoice number"
                  className="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-2 text-xs transition-all"
                  style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#28AFB0'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#EAEBED'; e.currentTarget.style.boxShadow = 'none' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Attachment (invoice)</label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 px-2.5 py-1.5 border rounded cursor-pointer flex items-center justify-center gap-1.5 text-xs transition-all hover:bg-gray-50"
                    style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#28AFB0' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#EAEBED' }}
                  >
                    <FiUpload size={14} />
                    <span className="truncate">{newExpense.attachment ? newExpense.attachment.name : 'Upload file'}</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) setNewExpense({ ...newExpense, attachment: file })
                      }}
                    />
                  </label>
                  {newExpense.attachment && (
                    <button
                      type="button"
                      onClick={() => setNewExpense({ ...newExpense, attachment: null })}
                      className="px-2 py-1.5 border rounded text-xs transition-all"
                      style={{ borderColor: '#DC2626', color: '#DC2626', backgroundColor: 'white' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FEE2E2' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white' }}
                    >
                      <FiX size={14} />
                    </button>
                  )}
                </div>
                {newExpense.attachment && (
                  <p className="text-xs mt-1" style={{ color: '#1F271B', opacity: 0.7 }}>
                    {newExpense.attachment.name} ({(newExpense.attachment.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-3 border-t" style={{ borderTopColor: '#EAEBED' }}>
              <button
                type="button"
                onClick={() => {
                  setIsAddExpenseOpen(false)
                  setNewExpense({
                    date: new Date().toISOString().split('T')[0],
                    itemName: '',
                    details: '',
                    total: 0,
                    linkedWorkorder: workorderId,
                    invoiceNumber: '',
                    attachment: null,
                  })
                }}
                className="px-3 py-1.5 border rounded text-xs font-medium transition-all"
                style={{ borderColor: '#EAEBED', color: '#1F271B', backgroundColor: 'white' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (newExpense.itemName && newExpense.total > 0) {
                    setEditedExpenses(prev => [...prev, {
                      date: newExpense.date,
                      itemName: newExpense.itemName,
                      details: newExpense.details,
                      total: newExpense.total,
                      linkedWorkorder: newExpense.linkedWorkorder ?? workorderId,
                      invoiceNumber: newExpense.invoiceNumber || undefined,
                    }])
                    setIsAddExpenseOpen(false)
                    setNewExpense({
                      date: new Date().toISOString().split('T')[0],
                      itemName: '',
                      details: '',
                      total: 0,
                      linkedWorkorder: workorderId,
                      invoiceNumber: '',
                      attachment: null,
                    })
                  }
                }}
                className="px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5"
                style={{ backgroundColor: '#28AFB0', color: 'white' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E8A8B' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#28AFB0' }}
              >
                <FiCheckCircle size={14} />
                <span>Save Expense</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <AddProductServiceModal
        isOpen={isAddProductModalOpen}
        onClose={() => {
          setIsAddProductModalOpen(false)
          setAddProductModalLineIndex(null)
        }}
        initialName={addProductModalInitialName}
        onSave={(data: NewProductServiceData) => {
          const newId = 10000 + customMaterials.length
          setCustomMaterials((prev) => [
            ...prev,
            {
              id: newId,
              name: data.name,
              description: data.description,
              unitPrice: data.unitPrice,
            },
          ])
          if (addProductModalLineIndex !== null) {
            setFormData((prev) => {
              const next = [...prev.lineItems]
              next[addProductModalLineIndex] = {
                ...next[addProductModalLineIndex],
                name: data.name,
                description: data.description,
                unitPrice: data.unitPrice,
              }
              return { ...prev, lineItems: next }
            })
          }
          setIsAddProductModalOpen(false)
          setAddProductModalLineIndex(null)
        }}
      />
      </div>
    </div>
  )
}
