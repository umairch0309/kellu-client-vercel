'use client'

import { useState, useEffect, useRef } from 'react'
import { FiX, FiChevronDown, FiPlus, FiCheckCircle, FiTrash2 } from 'react-icons/fi'
import { format } from 'date-fns'
import { mockClients, mockTeamMembers, mockMaterialsList, companyTaxRatePercent } from '@/data/mockData'
import AddClientModal from './AddClientModal'
import AddProductServiceModal, { type NewProductServiceData } from './AddProductServiceModal'

interface AddWorkorderModalProps {
  isOpen: boolean
  onClose: () => void
  initialDate?: Date
  initialTime?: string
  position?: { x: number; y: number }
  initialClientId?: number
}

export default function AddWorkorderModal({ isOpen, onClose, initialDate, initialTime, position, initialClientId }: AddWorkorderModalProps) {
  const [taskType, setTaskType] = useState<'workorder' | 'task'>('workorder')
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [showAssign, setShowAssign] = useState(false)
  const [anytime, setAnytime] = useState(false)
  const [lineItemNameDropdownIndex, setLineItemNameDropdownIndex] = useState<number | null>(null)
  const typeDropdownRef = useRef<HTMLDivElement>(null)
  const lineItemsSectionRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(target)) {
        setIsTypeDropdownOpen(false)
      }
      if (lineItemNameDropdownIndex !== null && lineItemsSectionRef.current && !lineItemsSectionRef.current.contains(target)) {
        setLineItemNameDropdownIndex(null)
      }
    }
      document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isTypeDropdownOpen, lineItemNameDropdownIndex])
  const [formData, setFormData] = useState({
    client: '',
    address: '',
    title: '',
    instructions: '',
    assignedTeamMember: '',
    assignedTo: 'team', // 'team' or 'owner'
    startDate: format(new Date(), 'MMM d, yyyy'),
    startTime: '03:15 AM',
    endTime: '04:15 AM',
    lineItems: [] as Array<{ name: string; description: string; quantity: number; unitPrice: number }>,
    discountPercent: 0,
  })
  const [showLineItems, setShowLineItems] = useState(false)
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false)
  const [addProductModalLineIndex, setAddProductModalLineIndex] = useState<number | null>(null)
  const [addProductModalInitialName, setAddProductModalInitialName] = useState('')
  const [customMaterials, setCustomMaterials] = useState<Array<{ id: number; name: string; description: string; unitPrice: number }>>([])

  // Update form data when initialDate, initialTime, or initialClientId changes
  useEffect(() => {
    if (isOpen) {
      const client = initialClientId ? mockClients.find(c => c.id === initialClientId) : null
      setFormData(prev => ({
        ...prev,
        client: client ? client.name : '',
        address: client ? (client.address || '') : '',
        startDate: initialDate ? format(initialDate, 'MMM d, yyyy') : format(new Date(), 'MMM d, yyyy'),
        startTime: initialTime || '03:15 AM',
        endTime: initialTime ? (() => {
          // Calculate end time (1 hour after start)
          const [time, period] = initialTime.split(' ')
          const [hours, minutes] = time.split(':')
          let hour = parseInt(hours)
          if (period === 'PM' && hour !== 12) hour += 12
          if (period === 'AM' && hour === 12) hour = 0
          const endHour = (hour + 1) % 24
          const endHour12 = endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour
          const endAmpm = endHour >= 12 ? 'PM' : 'AM'
          return `${endHour12}:${minutes} ${endAmpm}`
        })() : '04:15 AM',
      }))
    }
  }, [isOpen, initialDate, initialTime, initialClientId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Static form submission - just show success and close
    alert(`${taskType === 'workorder' ? 'Workorder' : 'Task'} created successfully! (Static UI)`)
    onClose()
    // Reset form
    setFormData({
      client: '',
      address: '',
      title: '',
      instructions: '',
      assignedTeamMember: '',
      assignedTo: 'team',
      startDate: format(new Date(), 'MMM d, yyyy'),
      startTime: '03:15 AM',
      endTime: '04:15 AM',
      lineItems: [],
      discountPercent: 0,
    })
    setShowInstructions(false)
    setShowAssign(false)
    setShowLineItems(false)
    setAnytime(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const removeTime = () => {
    setFormData({
      ...formData,
      endTime: '',
    })
  }

  if (!isOpen) return null

  // Calculate position - position near click but keep it compact
  const getModalStyle = () => {
    if (!position || typeof window === 'undefined') {
      return {
        position: 'fixed' as const,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }
    }
    const modalWidth = 320 // smaller width
    const modalHeight = 500 // approximate height
    const padding = 8 // smaller padding
    
    // Position modal with offset: down and to the right
    let left = position.x + 31 // Move more to the right
    let top = position.y + 61 // Move more down
    
    // Ensure modal stays within viewport
    if (left + modalWidth > window.innerWidth - padding) {
      left = position.x - modalWidth - 10 // Show to the left of click if no room on right
    }
    if (left < padding) {
      left = padding
    }
    
    if (top + modalHeight > window.innerHeight - padding) {
      top = position.y - modalHeight - 10 // Show above click if no room below
    }
    if (top < padding) {
      top = padding
    }
    
    return {
      position: 'fixed' as const,
      left: `${left}px`,
      top: `${top}px`,
      transform: 'none',
    }
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-neutral-dark bg-opacity-20 pointer-events-auto"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative bg-white rounded-lg shadow-2xl w-[320px] max-h-[500px] overflow-hidden flex flex-col pointer-events-auto border border-neutral-light"
        style={getModalStyle()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-2.5 border-b border-neutral-light">
          <div className="relative" ref={typeDropdownRef}>
            <button
              onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
              className="flex items-center gap-1.5 text-base font-semibold text-neutral-dark hover:text-neutral-dark/80 transition-colors"
            >
              <span>{taskType === 'task' ? 'New Task' : 'New Workorder'}</span>
              <FiChevronDown size={12} className={`text-neutral-dark/70 transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isTypeDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-neutral-light rounded shadow-lg z-10 min-w-[160px]">
                <button
                  onClick={() => {
                    setTaskType('workorder')
                    setIsTypeDropdownOpen(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-neutral-dark hover:bg-neutral-light flex items-center gap-2"
                >
                  {taskType === 'workorder' && <FiCheckCircle size={14} className="text-neutral-dark" />}
                  {taskType !== 'workorder' && <div className="w-[14px]" />}
                  <span>New Workorder</span>
                </button>
                <button
                  onClick={() => {
                    setTaskType('task')
                    setIsTypeDropdownOpen(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-neutral-dark hover:bg-neutral-light flex items-center gap-2"
                >
                  {taskType === 'task' && <FiCheckCircle size={14} className="text-neutral-dark" />}
                  {taskType !== 'task' && <div className="w-[14px]" />}
                  <span>New Task</span>
                </button>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-0.5 hover:bg-neutral-light rounded text-neutral-dark transition-colors"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2.5">
          <form onSubmit={handleSubmit} className="space-y-2.5">
            {/* Client / Address - search or create */}
            <div className="space-y-1.5">
              <input
                type="text"
                name="client"
                value={formData.client}
                onChange={handleChange}
                placeholder="Search client or address"
                className="w-full px-2 py-1.5 border border-neutral-light rounded focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                style={{ borderColor: '#EAEBED' }}
              />
              <button
                type="button"
                onClick={() => setIsAddClientOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 border rounded text-sm font-medium transition-colors"
                style={{
                  borderColor: '#EAEBED',
                  backgroundColor: 'white',
                  color: '#28AFB0',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F3F4F6'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white'
                }}
              >
                <FiPlus size={14} />
                <span>Create client or address</span>
              </button>
            </div>
            {/* Address */}
            <div>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
                className="w-full px-2 py-1.5 border border-neutral-light rounded focus:outline-none focus:ring-1 focus:ring-primary text-sm"
              />
            </div>

            {/* Title */}
            <div>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Title"
                className="w-full px-2 py-1.5 border border-neutral-light rounded focus:outline-none focus:ring-1 focus:ring-primary text-sm"
              />
            </div>

            {/* Add Instructions */}
            {!showInstructions ? (
              <button
                type="button"
                onClick={() => setShowInstructions(true)}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary-dark transition-colors"
              >
                <FiPlus size={12} />
                <span>Add Instructions</span>
              </button>
            ) : (
              <div>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  placeholder="Add instructions..."
                  rows={2}
                  className="w-full px-2 py-1.5 border border-neutral-light rounded focus:outline-none focus:ring-1 focus:ring-primary text-sm resize-none"
                />
              </div>
            )}

            {/* Assign */}
            {!showAssign ? (
              <button
                type="button"
                onClick={() => setShowAssign(true)}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary-dark transition-colors"
              >
                <FiPlus size={12} />
                <span>Assign</span>
              </button>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="assign-team"
                    name="assignedTo"
                    value="team"
                    checked={formData.assignedTo === 'team'}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value as 'team' | 'owner' })}
                    className="w-3 h-3 text-primary"
                  />
                  <label htmlFor="assign-team" className="text-sm text-neutral-dark cursor-pointer">Team members</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="assign-owner"
                    name="assignedTo"
                    value="owner"
                    checked={formData.assignedTo === 'owner'}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value as 'team' | 'owner' })}
                    className="w-3 h-3 text-primary"
                  />
                  <label htmlFor="assign-owner" className="text-sm text-neutral-dark cursor-pointer">The business owner themselves</label>
                </div>
                {formData.assignedTo === 'team' && (
                  <select
                    name="assignedTeamMember"
                    value={formData.assignedTeamMember}
                    onChange={(e) => setFormData({ ...formData, assignedTeamMember: e.target.value })}
                    className="w-full px-2 py-1.5 border border-neutral-light rounded focus:outline-none focus:ring-1 focus:ring-primary text-sm mt-1"
                  >
                    <option value="">Select team member</option>
                    {mockTeamMembers.map((member) => (
                      <option key={member.id} value={member.name}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Product / Service - Line Items (Jobber-style), only for Workorder */}
            {taskType === 'workorder' && (
              <>
                {!showLineItems ? (
                  <button
                    type="button"
                    onClick={() => setShowLineItems(true)}
                    className="flex items-center gap-1 text-sm text-primary hover:text-primary-dark transition-colors"
                  >
                    <FiPlus size={12} />
                    <span>Line items</span>
                  </button>
                ) : (
                  <div ref={lineItemsSectionRef} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-neutral-dark">Product / Service</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, lineItems: [...formData.lineItems, { name: '', description: '', quantity: 1, unitPrice: 0 }] })}
                        className="text-sm text-primary hover:text-primary-dark flex items-center gap-1"
                      >
                        <FiPlus size={12} />
                        <span>Add Line Item</span>
                      </button>
                    </div>
                    {formData.lineItems.length === 0 ? (
                      <p className="text-xs text-neutral-dark/60">No line items. Click &quot;Add Line Item&quot; to add.</p>
                    ) : (
                      <>
                        {formData.lineItems.map((item, index) => {
                          const allMaterials = [...mockMaterialsList, ...customMaterials]
                          const filteredMaterials = allMaterials.filter(m => m.name.toLowerCase().includes((item.name || '').toLowerCase()))
                          const hasExactMatch = filteredMaterials.some(m => m.name.toLowerCase() === (item.name || '').trim().toLowerCase())
                          const showCreateNew = (item.name || '').trim() !== '' && (filteredMaterials.length === 0 || !hasExactMatch)
                          const showDropdown = lineItemNameDropdownIndex === index && (filteredMaterials.length > 0 || showCreateNew)
                          const lineTotal = (item.quantity || 0) * (item.unitPrice || 0)
                          return (
                            <div key={index} className="p-2 border border-neutral-light rounded space-y-2 bg-white">
                              <div className="relative">
                                <label className="block text-xs font-medium text-neutral-dark/80 mb-0.5">Name</label>
                        <input
                          type="text"
                                  placeholder="Type to search..."
                          value={item.name}
                          onChange={(e) => {
                            const newItems = [...formData.lineItems]
                                    newItems[index] = { ...newItems[index], name: e.target.value }
                                    setFormData({ ...formData, lineItems: newItems })
                                  }}
                                  onFocus={() => setLineItemNameDropdownIndex(index)}
                                  className="w-full px-2 py-1.5 border border-neutral-light rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                {showDropdown && (
                                  <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-neutral-light rounded shadow-lg max-h-40 overflow-y-auto">
                                    {filteredMaterials.slice(0, 6).map((m) => (
                                      <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => {
                                          const newItems = [...formData.lineItems]
                                          newItems[index] = { ...newItems[index], name: m.name, description: m.description || '', unitPrice: m.unitPrice }
                                          setFormData({ ...formData, lineItems: newItems })
                                          setLineItemNameDropdownIndex(null)
                                        }}
                                        className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-50 border-b border-neutral-light last:border-b-0"
                                      >
                                        {m.name} {m.unitPrice > 0 && `Rs${m.unitPrice}`}
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
                                        className="w-full text-left px-2 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 font-medium border-t border-neutral-light"
                                        style={{ color: '#28AFB0' }}
                                      >
                                        <FiPlus size={14} />
                                        Create new item
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-neutral-dark/80 mb-0.5">Description</label>
                                <textarea
                                  placeholder="Description"
                                  value={item.description || ''}
                                  onChange={(e) => {
                                    const newItems = [...formData.lineItems]
                                    newItems[index] = { ...newItems[index], description: e.target.value }
                            setFormData({ ...formData, lineItems: newItems })
                          }}
                                  rows={1}
                                  className="w-full px-2 py-1 border border-neutral-light rounded text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                        <input
                          type="number"
                          placeholder="Qty"
                                  value={item.quantity || ''}
                          onChange={(e) => {
                            const newItems = [...formData.lineItems]
                                    newItems[index] = { ...newItems[index], quantity: parseFloat(e.target.value) || 0 }
                            setFormData({ ...formData, lineItems: newItems })
                          }}
                                  min="0"
                                  step="0.01"
                                  className="w-14 px-2 py-1 border border-neutral-light rounded text-sm"
                        />
                        <input
                          type="number"
                                  placeholder="Unit price"
                                  value={item.unitPrice || ''}
                          onChange={(e) => {
                            const newItems = [...formData.lineItems]
                                    newItems[index] = { ...newItems[index], unitPrice: parseFloat(e.target.value) || 0 }
                            setFormData({ ...formData, lineItems: newItems })
                          }}
                                  min="0"
                                  step="0.01"
                                  className="w-20 px-2 py-1 border border-neutral-light rounded text-sm"
                        />
                                <span className="text-xs font-semibold text-neutral-dark">Rs{lineTotal.toFixed(2)}</span>
                        <button
                          type="button"
                                  onClick={() => setFormData({ ...formData, lineItems: formData.lineItems.filter((_, i) => i !== index) })}
                                  className="p-1 text-neutral-dark/60 hover:text-red-600 ml-auto"
                                  title="Delete line"
                                >
                                  <FiTrash2 size={14} />
                        </button>
                      </div>
                            </div>
                          )
                        })}
                        {(() => {
                          const subtotal = formData.lineItems.reduce((s, i) => s + (i.quantity || 0) * (i.unitPrice || 0), 0)
                          const discountAmt = (subtotal * (formData.discountPercent || 0)) / 100
                          const afterDisc = subtotal - discountAmt
                          const taxAmt = (afterDisc * companyTaxRatePercent) / 100
                          const total = afterDisc + taxAmt
                          return (
                            <div className="pt-2 border-t border-neutral-light space-y-1 text-sm">
                              <div className="flex justify-between"><span className="text-neutral-dark/80">Subtotal</span><span>Rs{subtotal.toFixed(2)}</span></div>
                              <div className="flex justify-between items-center gap-2">
                                <span className="text-neutral-dark/80">Discount (%)</span>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.5"
                                  value={formData.discountPercent ?? ''}
                                  onChange={(e) => setFormData({ ...formData, discountPercent: parseFloat(e.target.value) || 0 })}
                                  className="w-14 px-1 py-0.5 border border-neutral-light rounded text-right text-xs"
                                />
                                <span className="w-16 text-right">Rs{discountAmt.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between"><span className="text-neutral-dark/80">Tax ({companyTaxRatePercent}%)</span><span>Rs{taxAmt.toFixed(2)}</span></div>
                              <div className="flex justify-between font-semibold pt-1"><span>Total</span><span>Rs{total.toFixed(2)}</span></div>
                            </div>
                          )
                        })()}
                      </>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Scheduling Section */}
            <div className="space-y-1.5 pt-0.5">
              {/* Start Date */}
              <div>
                <label className="block text-xs font-medium text-neutral-dark/70 mb-0.5">Start Date</label>
                <input
                  type="text"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-2 py-1 border border-neutral-light rounded focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                />
              </div>

              {/* Time Row */}
              <div className="flex items-end gap-1.5">
                {/* Start Time */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-neutral-dark/70 mb-0.5">Start</label>
                  <input
                    type="text"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    placeholder="03:15 AM"
                    className="w-full px-2 py-1 border border-neutral-light rounded focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                  />
                </div>

                {/* End Time */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-neutral-dark/70 mb-0.5">End</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      placeholder="04:15 AM"
                      className="w-full px-2 py-1 border border-neutral-light rounded focus:outline-none focus:ring-1 focus:ring-primary text-sm pr-6"
                    />
                    {formData.endTime && (
                      <button
                        type="button"
                        onClick={removeTime}
                        className="absolute right-1 top-1/2 -translate-y-1/2 text-neutral-dark/50 hover:text-neutral-dark"
                      >
                        <FiX size={10} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Anytime Checkbox */}
              <div className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  id="anytime"
                  checked={anytime}
                  onChange={(e) => setAnytime(e.target.checked)}
                  className="w-3 h-3 text-primary border-neutral-light rounded focus:ring-primary"
                />
                <label htmlFor="anytime" className="text-xs text-neutral-dark cursor-pointer">
                  Anytime
                </label>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-1.5 pt-2 border-t border-neutral-light">
              <button
                type="button"
                onClick={onClose}
                className="px-2.5 py-1 bg-white border border-neutral-light rounded text-neutral-dark hover:bg-neutral-light transition-colors text-xs font-medium"
              >
                More Options
              </button>
              <button
                type="submit"
                className="px-2.5 py-1 bg-secondary text-white rounded hover:bg-secondary-dark transition-colors text-xs font-medium"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Add Client modal - same fields as Add Client flow in portal */}
      <AddClientModal
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
        mode="new"
        onSuccess={(data) => {
          setFormData(prev => ({
            ...prev,
            client: data.name,
            address: data.address || prev.address,
          }))
        }}
      />

      <AddProductServiceModal
        isOpen={isAddProductModalOpen}
        onClose={() => {
          setIsAddProductModalOpen(false)
          setAddProductModalLineIndex(null)
        }}
        initialName={addProductModalInitialName}
        onSave={(data: NewProductServiceData) => {
          setCustomMaterials((prev) => [
            ...prev,
            {
              id: 10000 + prev.length,
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
  )
}
