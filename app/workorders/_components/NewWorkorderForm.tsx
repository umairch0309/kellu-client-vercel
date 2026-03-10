'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FiSave, FiChevronLeft, FiPlus, FiX, FiChevronDown, FiTrash2, FiCheckCircle, FiUpload, FiCheck } from 'react-icons/fi'
import { format } from 'date-fns'
import { mockClients, mockTeamMembers, mockWorkorders, mockMaterialsList, companyTaxRatePercent } from '@/data/mockData'
import AddProductServiceModal, { type NewProductServiceData } from './AddProductServiceModal'
import AddClientModal from '../../clients/_components/AddClientModal'

interface LineItem {
  name: string
  description: string
  quantity: number
  unitCost: number
  unitPrice: number
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
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
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
      unitCost: item.unitCost ?? 0,
      unitPrice: item.unitPrice ?? item.unitCost ?? 0,
    })) as LineItem[],
    discountPercent: 0,
    notes: workorder?.notes || '',
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
    ...mockTeamMembers.filter((m) => m.active).map(m => ({ value: m.name, label: m.name })),
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
      lineItems: [...formData.lineItems, { name: '', description: '', quantity: 1, unitCost: 0, unitPrice: 0 }],
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
  const totalCost = formData.lineItems.reduce((sum, item) => sum + item.quantity * (item.unitCost ?? 0), 0)
  const discountAmount = (subtotal * (formData.discountPercent || 0)) / 100
  const afterDiscount = subtotal - discountAmount
  const taxAmount = (afterDiscount * companyTaxRatePercent) / 100
  const grandTotal = afterDiscount + taxAmount
  const estimatedMargin = grandTotal - totalCost
  const estimatedMarginPercent = grandTotal > 0 ? (estimatedMargin / grandTotal) * 100 : 0

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
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg flex flex-col" style={{ borderColor: '#EAEBED', maxHeight: '12rem' }}>
                        <div className="overflow-y-auto flex-1 min-h-0">
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
                        </div>
                        <button
                          type="button"
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors flex-shrink-0 border-t"
                          style={{ color: '#28AFB0', borderColor: '#EAEBED' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white' }}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setIsClientDropdownOpen(false)
                            setIsAddClientOpen(true)
                          }}
                        >
                          <FiPlus size={14} />
                          <span>Create a new client</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>
                    Address
                  </label>
                  <p className="text-[10px] mb-1" style={{ color: '#1F271B', opacity: 0.6 }}>Fetched from last registered workorder or task of selected client</p>
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

            {/* Date and time selection: Start date | Start time + Anytime below it | End time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
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
                <label className="flex items-center gap-2 cursor-pointer mt-2">
                  <input
                    type="checkbox"
                    name="scheduleLater"
                    checked={formData.scheduleLater}
                    onChange={handleChange}
                    className="w-4 h-4 rounded focus:ring-1"
                    style={{ accentColor: '#28AFB0', borderColor: '#EAEBED' }}
                  />
                  <span className="text-sm" style={{ color: '#1F271B' }}>Schedule later</span>
                </label>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B', opacity: 0.7 }}>
                  Start time
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  disabled={formData.scheduleLater || formData.anytime}
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
                <label className="flex items-center gap-2 cursor-pointer mt-2">
                  <input
                    type="checkbox"
                    name="anytime"
                    checked={formData.anytime}
                    onChange={handleChange}
                    className="w-4 h-4 rounded focus:ring-1"
                    style={{ accentColor: '#28AFB0', borderColor: '#EAEBED' }}
                  />
                  <span className="text-sm" style={{ color: '#1F271B' }}>Anytime</span>
                </label>
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
                  disabled={formData.scheduleLater || formData.anytime}
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
                      <span className="text-sm font-medium" style={{ color: '#1F271B' }}>Select</span>
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

          {/* Product / Service - Line items, then Add Line Item, then Summary */}
          <div ref={lineItemsSectionRef} className="bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: '#1F271B' }}>Product / Service</h2>
            {formData.lineItems.length === 0 ? (
              <div className="p-4 rounded text-center border mb-3" style={{ borderColor: '#EAEBED', backgroundColor: '#F3F4F6' }}>
                <p className="text-sm" style={{ color: '#1F271B', opacity: 0.6 }}>No line items added</p>
              </div>
            ) : (
              <div className="space-y-4 mb-3">
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
                                    <div className="flex justify-between items-start gap-2">
                                      <span className="font-medium">{m.name}</span>
                                      <span className="text-xs font-medium flex-shrink-0" style={{ opacity: 0.9 }}>Rs{(m.unitPrice ?? 0).toFixed(2)}</span>
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
                            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.8 }}>Unit cost</label>
                            <input
                              type="number"
                              value={item.unitCost ?? ''}
                              onChange={(e) => updateLineItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
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
                <div className="flex justify-between text-sm pt-1" style={{ color: '#1F271B' }}>
                  <span>Costs</span>
                  <span>Rs {totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium pt-1" style={{ color: '#1F271B' }}>
                  <span>Estimated margin</span>
                  <span>Rs {estimatedMargin.toFixed(2)} ({estimatedMarginPercent.toFixed(0)}%)</span>
                </div>
              </div>
            </div>
          </div>

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
                unitCost: data.unitCost ?? next[addProductModalLineIndex].unitCost ?? 0,
                unitPrice: data.unitPrice,
              }
              return { ...prev, lineItems: next }
            })
          }
          setIsAddProductModalOpen(false)
          setAddProductModalLineIndex(null)
        }}
      />
      <AddClientModal
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
        mode="new"
        onSuccess={(data) => {
          setFormData(prev => ({
            ...prev,
            clientName: data.name,
            clientId: -1,
          }))
          setClientSearchTerm('')
          setIsAddClientOpen(false)
        }}
      />
      </div>
    </div>
  )
}
