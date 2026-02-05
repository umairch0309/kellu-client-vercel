'use client'

import { useState, useEffect, useRef } from 'react'
import { FiX, FiChevronDown, FiPlus, FiHelpCircle, FiCheckCircle } from 'react-icons/fi'
import { format } from 'date-fns'
import { mockClients, mockTeamMembers } from '@/data/mockData'

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
  const [showAvailability, setShowAvailability] = useState(true)
  const [anytime, setAnytime] = useState(false)
  const typeDropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setIsTypeDropdownOpen(false)
      }
    }
    if (isTypeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isTypeDropdownOpen])
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
    lineItems: [] as Array<{ name: string; quantity: number; unitPrice: number }>,
  })
  const [showLineItems, setShowLineItems] = useState(false)

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
            {/* Client */}
            <div>
              <input
                type="text"
                name="client"
                value={formData.client}
                onChange={handleChange}
                placeholder="Client"
                className="w-full px-2 py-1.5 border border-neutral-light rounded focus:outline-none focus:ring-1 focus:ring-primary text-xs"
              />
            </div>

            {/* Address */}
            <div>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
                className="w-full px-2 py-1.5 border border-neutral-light rounded focus:outline-none focus:ring-1 focus:ring-primary text-xs"
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
                className="w-full px-2 py-1.5 border border-neutral-light rounded focus:outline-none focus:ring-1 focus:ring-primary text-xs"
              />
            </div>

            {/* Add Instructions */}
            {!showInstructions ? (
              <button
                type="button"
                onClick={() => setShowInstructions(true)}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary-dark transition-colors"
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
                  className="w-full px-2 py-1.5 border border-neutral-light rounded focus:outline-none focus:ring-1 focus:ring-primary text-xs resize-none"
                />
              </div>
            )}

            {/* Assign */}
            {!showAssign ? (
              <button
                type="button"
                onClick={() => setShowAssign(true)}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary-dark transition-colors"
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
                  <label htmlFor="assign-team" className="text-xs text-neutral-dark cursor-pointer">Team members</label>
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
                  <label htmlFor="assign-owner" className="text-xs text-neutral-dark cursor-pointer">The business owner themselves</label>
                </div>
                {formData.assignedTo === 'team' && (
                  <select
                    name="assignedTeamMember"
                    value={formData.assignedTeamMember}
                    onChange={(e) => setFormData({ ...formData, assignedTeamMember: e.target.value })}
                    className="w-full px-2 py-1.5 border border-neutral-light rounded focus:outline-none focus:ring-1 focus:ring-primary text-xs mt-1"
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

            {/* Line Items - Only for Workorder */}
            {taskType === 'workorder' && (
              <>
                {!showLineItems ? (
                  <button
                    type="button"
                    onClick={() => setShowLineItems(true)}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary-dark transition-colors"
                  >
                    <FiPlus size={12} />
                    <span>Line items</span>
                  </button>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-neutral-dark">Line items</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, lineItems: [...formData.lineItems, { name: '', quantity: 1, unitPrice: 0 }] })
                        }}
                        className="text-xs text-primary hover:text-primary-dark"
                      >
                        <FiPlus size={12} />
                      </button>
                    </div>
                    {formData.lineItems.map((item, index) => (
                      <div key={index} className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Item name"
                          value={item.name}
                          onChange={(e) => {
                            const newItems = [...formData.lineItems]
                            newItems[index].name = e.target.value
                            setFormData({ ...formData, lineItems: newItems })
                          }}
                          className="flex-1 px-2 py-1 border border-neutral-light rounded focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                        />
                        <input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...formData.lineItems]
                            newItems[index].quantity = parseFloat(e.target.value) || 0
                            setFormData({ ...formData, lineItems: newItems })
                          }}
                          className="w-16 px-2 py-1 border border-neutral-light rounded focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                        />
                        <input
                          type="number"
                          placeholder="Price"
                          value={item.unitPrice}
                          onChange={(e) => {
                            const newItems = [...formData.lineItems]
                            newItems[index].unitPrice = parseFloat(e.target.value) || 0
                            setFormData({ ...formData, lineItems: newItems })
                          }}
                          className="w-20 px-2 py-1 border border-neutral-light rounded focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newItems = formData.lineItems.filter((_, i) => i !== index)
                            setFormData({ ...formData, lineItems: newItems })
                          }}
                          className="px-1 text-neutral-dark/50 hover:text-neutral-dark"
                        >
                          <FiX size={12} />
                        </button>
                      </div>
                    ))}
                    {formData.lineItems.length === 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, lineItems: [{ name: '', quantity: 1, unitPrice: 0 }] })
                        }}
                        className="w-full text-xs text-primary hover:text-primary-dark py-1"
                      >
                        Add line item
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Scheduling Section */}
            <div className="space-y-1.5 pt-0.5">
              {/* Start Date */}
              <div>
                <label className="block text-[10px] font-medium text-neutral-dark/70 mb-0.5">Start Date</label>
                <input
                  type="text"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-2 py-1 border border-neutral-light rounded focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                />
              </div>

              {/* Time Row */}
              <div className="flex items-end gap-1.5">
                {/* Start Time */}
                <div className="flex-1">
                  <label className="block text-[10px] font-medium text-neutral-dark/70 mb-0.5">Start</label>
                  <input
                    type="text"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    placeholder="03:15 AM"
                    className="w-full px-2 py-1 border border-neutral-light rounded focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                  />
                </div>

                {/* End Time */}
                <div className="flex-1">
                  <label className="block text-[10px] font-medium text-neutral-dark/70 mb-0.5">End</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      placeholder="04:15 AM"
                      className="w-full px-2 py-1 border border-neutral-light rounded focus:outline-none focus:ring-1 focus:ring-primary text-xs pr-6"
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
                <label htmlFor="anytime" className="text-[10px] text-neutral-dark cursor-pointer">
                  Anytime
                </label>
              </div>
            </div>

            {/* Show Availability */}
            <div className="pt-1.5 border-t border-neutral-light">
              <div className="flex items-center gap-1 mb-0.5">
                <label className="text-[10px] text-neutral-dark">Show availability</label>
                <FiHelpCircle size={10} className="text-neutral-dark/50" />
                <div className="ml-auto">
                  <button
                    type="button"
                    onClick={() => setShowAvailability(!showAvailability)}
                    className={`relative inline-flex h-3.5 w-6 items-center rounded-full transition-colors ${
                      showAvailability ? 'bg-primary' : 'bg-neutral-light'
                    }`}
                  >
                    <span
                      className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${
                        showAvailability ? 'translate-x-3' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-neutral-dark/60">
                Use Team filters to customize shown availability
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-1.5 pt-2 border-t border-neutral-light">
              <button
                type="button"
                onClick={onClose}
                className="px-2.5 py-1 bg-white border border-neutral-light rounded text-neutral-dark hover:bg-neutral-light transition-colors text-[10px] font-medium"
              >
                More Options
              </button>
              <button
                type="submit"
                className="px-2.5 py-1 bg-secondary text-white rounded hover:bg-secondary-dark transition-colors text-[10px] font-medium"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
