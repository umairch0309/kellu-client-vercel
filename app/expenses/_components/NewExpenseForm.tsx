'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { FiSave, FiChevronLeft, FiUpload, FiX } from 'react-icons/fi'
import { format } from 'date-fns'
import type { WorkorderRow } from '@/app/workorders/_components/WorkordersTable'
import { fetchWorkordersList, formatWorkorderOptionLabel } from '@/lib/workordersListApi'

interface NewExpenseFormProps {
  workorderId?: string | number
}

export default function NewExpenseForm({ workorderId }: NewExpenseFormProps = {}) {
  const router = useRouter()
  const [workorderSearchTerm, setWorkorderSearchTerm] = useState('')
  const [isWorkorderDropdownOpen, setIsWorkorderDropdownOpen] = useState(false)
  const workorderDropdownRef = useRef<HTMLDivElement>(null)

  const [apiWorkorders, setApiWorkorders] = useState<WorkorderRow[]>([])
  const [workordersLoading, setWorkordersLoading] = useState(true)
  const [workordersError, setWorkordersError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    itemName: '',
    details: '',
    total: 0,
    linkedWorkorder: (workorderId ?? null) as string | number | null,
    invoiceNumber: '',
    attachment: null as File | null,
  })

  useEffect(() => {
    let cancelled = false
    setWorkordersLoading(true)
    setWorkordersError(null)
    fetchWorkordersList({ limit: 500 })
      .then((list) => {
        if (!cancelled) setApiWorkorders(list)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setWorkordersError(err instanceof Error ? err.message : 'Failed to load work orders')
          setApiWorkorders([])
        }
      })
      .finally(() => {
        if (!cancelled) setWorkordersLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const linkedWorkorderRow = useMemo(() => {
    if (formData.linkedWorkorder == null) return null
    return apiWorkorders.find((wo) => String(wo.id) === String(formData.linkedWorkorder)) ?? null
  }, [formData.linkedWorkorder, apiWorkorders])

  const searchLower = workorderSearchTerm.toLowerCase().trim()
  const filteredWorkorders = useMemo(() => {
    return apiWorkorders.filter((wo) => {
      if (!searchLower) return true
      return (
        wo.title.toLowerCase().includes(searchLower) ||
        wo.clientName.toLowerCase().includes(searchLower) ||
        String(wo.id).toLowerCase().includes(searchLower) ||
        (wo.workOrderNumber != null && String(wo.workOrderNumber).toLowerCase().includes(searchLower))
      )
    })
  }, [apiWorkorders, searchLower])

  const workorderFieldDisplay =
    workorderSearchTerm ||
    (linkedWorkorderRow ? formatWorkorderOptionLabel(linkedWorkorderRow) : '')

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

  const handleWorkorderSelect = (wo: WorkorderRow) => {
    setFormData((prev) => ({ ...prev, linkedWorkorder: wo.id }))
    setIsWorkorderDropdownOpen(false)
    setWorkorderSearchTerm('')
  }

  return (
    <div className="min-h-screen bg-white">
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
              New Expense
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: '#1F271B' }}>
              Expense Details
            </h2>
            <div className="space-y-3">
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

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>
                  Linked work order <span style={{ color: '#6B7280', fontWeight: 400 }}>(optional)</span>
                </label>
                <div className="relative" ref={workorderDropdownRef}>
                  <input
                    type="text"
                    value={workorderFieldDisplay}
                    onChange={(e) => {
                      setWorkorderSearchTerm(e.target.value)
                      setIsWorkorderDropdownOpen(true)
                    }}
                    placeholder="Search work order…"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all"
                    style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                    onFocus={() => setIsWorkorderDropdownOpen(true)}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#EAEBED'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                  {isWorkorderDropdownOpen && (
                    <div
                      className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-48 overflow-y-auto"
                      style={{ borderColor: '#EAEBED' }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, linkedWorkorder: null }))
                          setWorkorderSearchTerm('')
                          setIsWorkorderDropdownOpen(false)
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-b transition-colors"
                        style={{ color: '#1F271B', borderBottomColor: '#EAEBED' }}
                      >
                        None (global expense)
                      </button>
                      {workordersLoading && (
                        <div className="px-3 py-2 text-xs" style={{ color: '#6B7280' }}>
                          Loading work orders…
                        </div>
                      )}
                      {workordersError && !workordersLoading && (
                        <div className="px-3 py-2 text-xs" style={{ color: '#B91C1C' }}>
                          {workordersError}
                        </div>
                      )}
                      {!workordersLoading &&
                        !workordersError &&
                        filteredWorkorders.length === 0 && (
                          <div className="px-3 py-2 text-xs" style={{ color: '#6B7280' }}>
                            No work orders match your search.
                          </div>
                        )}
                      {!workordersLoading &&
                        !workordersError &&
                        filteredWorkorders.map((wo) => (
                          <button
                            key={String(wo.id)}
                            type="button"
                            onClick={() => handleWorkorderSelect(wo)}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-b transition-colors"
                            style={{
                              color: '#1F271B',
                              borderBottomColor: '#EAEBED',
                              backgroundColor:
                                String(formData.linkedWorkorder) === String(wo.id) ? '#F3F4F6' : 'white',
                            }}
                          >
                            {formatWorkorderOptionLabel(wo)}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
                {linkedWorkorderRow && (
                  <p className="text-xs mt-1" style={{ color: '#1F271B', opacity: 0.7 }}>
                    Linked to: {linkedWorkorderRow.title} ({linkedWorkorderRow.clientName})
                  </p>
                )}
              </div>

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

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>
                  Attachment (invoice)
                </label>
                <div className="flex items-center gap-3">
                  <label
                    className="flex-1 px-3 py-2 border rounded cursor-pointer flex items-center justify-center gap-2 text-sm transition-all hover:bg-gray-50"
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
