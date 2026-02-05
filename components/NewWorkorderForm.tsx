'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FiSave, FiChevronLeft, FiPlus, FiX, FiChevronDown } from 'react-icons/fi'
import { format } from 'date-fns'
import { mockClients, mockTeamMembers, mockWorkorders } from '@/data/mockData'

interface LineItem {
  name: string
  quantity: number
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
  const clientDropdownRef = useRef<HTMLDivElement>(null)
  const teamMemberDropdownRef = useRef<HTMLDivElement>(null)

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
    assignedTeamMember: workorder?.assignedTeamMember || '',
    instructions: workorder?.instructions || '',
    lineItems: (workorder?.lineItems || []).map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })) as LineItem[],
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
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
        setIsClientDropdownOpen(false)
      }
      if (teamMemberDropdownRef.current && !teamMemberDropdownRef.current.contains(event.target as Node)) {
        setIsTeamMemberDropdownOpen(false)
      }
    }
    if (isClientDropdownOpen || isTeamMemberDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isClientDropdownOpen, isTeamMemberDropdownOpen])

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

  const handleTeamMemberSelect = (memberName: string) => {
    setFormData({
      ...formData,
      assignedTeamMember: memberName,
    })
    setIsTeamMemberDropdownOpen(false)
  }

  const addLineItem = () => {
    setFormData({
      ...formData,
      lineItems: [...formData.lineItems, { name: '', quantity: 1, unitPrice: 0 }],
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

  const calculateTotal = () => {
    return formData.lineItems.reduce((sum, item) => sum + calculateLineItemTotal(item), 0)
  }

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column */}
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
                    {isClientDropdownOpen && filteredClients.length > 0 && (
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

              {/* Right Column */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>
                    Assign Team Member
                  </label>
                  <div className="relative" ref={teamMemberDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsTeamMemberDropdownOpen(!isTeamMemberDropdownOpen)}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all flex items-center justify-between"
                      style={{ borderColor: '#EAEBED', color: '#1F271B', backgroundColor: 'white' }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#28AFB0'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#EAEBED'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <span>{formData.assignedTeamMember || 'Select team member'}</span>
                      <FiChevronDown size={14} style={{ color: '#1F271B', opacity: 0.5 }} />
                    </button>
                    {isTeamMemberDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-48 overflow-y-auto" style={{ borderColor: '#EAEBED' }}>
                        <button
                          type="button"
                          onClick={() => handleTeamMemberSelect('')}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-opacity-50 transition-colors border-b"
                          style={{ 
                            color: '#1F271B', 
                            backgroundColor: formData.assignedTeamMember === '' ? '#F3F4F6' : 'white',
                            borderBottomColor: '#EAEBED'
                          }}
                          onMouseEnter={(e) => {
                            if (formData.assignedTeamMember !== '') {
                              e.currentTarget.style.backgroundColor = '#F9FAFB'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (formData.assignedTeamMember !== '') {
                              e.currentTarget.style.backgroundColor = 'white'
                            }
                          }}
                        >
                          None
                        </button>
                        {mockTeamMembers.map((member) => (
                          <button
                            key={member.name}
                            type="button"
                            onClick={() => handleTeamMemberSelect(member.name)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-opacity-50 transition-colors border-b"
                            style={{ 
                              color: '#1F271B', 
                              backgroundColor: formData.assignedTeamMember === member.name ? '#F3F4F6' : 'white',
                              borderBottomColor: '#EAEBED'
                            }}
                            onMouseEnter={(e) => {
                              if (formData.assignedTeamMember !== member.name) {
                                e.currentTarget.style.backgroundColor = '#F9FAFB'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (formData.assignedTeamMember !== member.name) {
                                e.currentTarget.style.backgroundColor = 'white'
                              }
                            }}
                          >
                            {member.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Section */}
          <div className="bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold" style={{ color: '#1F271B' }}>Schedule</h2>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                name="scheduleLater"
                checked={formData.scheduleLater}
                onChange={handleChange}
                className="w-4 h-4 rounded focus:ring-1"
                style={{ accentColor: '#28AFB0', borderColor: '#EAEBED' }}
              />
              <label className="text-sm" style={{ color: '#1F271B' }}>
                Schedule later
              </label>
            </div>

            {!formData.scheduleLater && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B', opacity: 0.7 }}>
                    Day
                  </label>
                  <input
                    type="date"
                    name="scheduleDay"
                    value={formData.scheduleDay}
                    onChange={handleChange}
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
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B', opacity: 0.7 }}>
                    Start time
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
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
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B', opacity: 0.7 }}>
                    End time
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
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
            )}
          </div>

          {/* Instructions Section */}
          <div className="bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: '#1F271B' }}>Instructions</h2>
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

          {/* Line Items Section */}
          <div className="bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold" style={{ color: '#1F271B' }}>Line Items</h2>
              <button
                type="button"
                onClick={addLineItem}
                className="px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md"
                style={{ backgroundColor: '#28AFB0', color: 'white' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1E8A8B'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#28AFB0'
                }}
              >
                <FiPlus size={12} />
                <span>Add Item</span>
              </button>
            </div>
            {formData.lineItems.length === 0 ? (
              <div className="p-4 rounded text-center border" style={{ borderColor: '#EAEBED', backgroundColor: '#F3F4F6' }}>
                <p className="text-sm" style={{ color: '#1F271B', opacity: 0.6 }}>No line items added</p>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.lineItems.map((item, index) => (
                  <div key={index} className="p-3 border rounded" style={{ borderColor: '#EAEBED', backgroundColor: '#F9FAFB' }}>
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Item {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        className="p-1 rounded transition-colors"
                        style={{ color: '#1F271B', opacity: 0.6 }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '1'
                          e.currentTarget.style.backgroundColor = '#EAEBED'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '0.6'
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Service/Product name"
                        value={item.name}
                        onChange={(e) => updateLineItem(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 text-sm transition-all"
                        style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <input
                            type="number"
                            placeholder="Quantity"
                            value={item.quantity || ''}
                            onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 text-sm transition-all"
                            style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            placeholder="Unit Price"
                            value={item.unitPrice || ''}
                            onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 text-sm transition-all"
                            style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold" style={{ color: '#1F271B' }}>
                          Total: Rs {calculateLineItemTotal(item).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t" style={{ borderTopColor: '#EAEBED' }}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold" style={{ color: '#1F271B' }}>Grand Total:</span>
                    <span className="text-sm font-bold" style={{ color: '#1F271B' }}>Rs {calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
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
      </div>
    </div>
  )
}
