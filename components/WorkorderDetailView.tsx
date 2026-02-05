'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  FiEdit, 
  FiMoreVertical, 
  FiMail, 
  FiMapPin, 
  FiPhone, 
  FiPlus, 
  FiX, 
  FiChevronUp,
  FiUpload,
  FiFileText,
  FiCalendar,
  FiUser,
  FiInfo,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiLink,
  FiCreditCard,
  FiTool,
  FiCopy,
  FiSend,
  FiPrinter,
  FiDownload
} from 'react-icons/fi'
import { format } from 'date-fns'
import { mockClients, mockWorkorders } from '@/data/mockData'

interface WorkorderDetailViewProps {
  workorderId: number
}

export default function WorkorderDetailView({ workorderId }: WorkorderDetailViewProps) {
  const router = useRouter()
  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState(false)
  const [isAddLineItemOpen, setIsAddLineItemOpen] = useState(false)
  const [selectedInvoiceTab, setSelectedInvoiceTab] = useState('Billing')
  const [internalNote, setInternalNote] = useState('')
  const [showProfitability, setShowProfitability] = useState(true)
  const [newLineItem, setNewLineItem] = useState({
    name: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    unitCost: 0,
  })
  const [lineItemError, setLineItemError] = useState('')
  const [editingLineItemIndex, setEditingLineItemIndex] = useState<number | null>(null)
  const [editedLineItems, setEditedLineItems] = useState<any[]>([])
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    itemName: '',
    details: '',
    total: 0,
    linkedWorkorder: null as number | null,
    invoiceNumber: '',
    attachment: null as File | null,
  })
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false)
  const [editingPaymentIndex, setEditingPaymentIndex] = useState<number | null>(null)
  const [editedPayments, setEditedPayments] = useState<any[]>([])
  const [newPayment, setNewPayment] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    method: 'Cash',
    reference: '',
    notes: '',
  })
  const moreActionsRef = useRef<HTMLDivElement>(null)

  // Mock master price list / services
  const masterServices = [
    { id: 1, name: 'Free Assessment', description: 'Our experts will come to assess your needs and discuss solutions', unitPrice: 0, unitCost: 0 },
    { id: 2, name: 'Exterior Window Cleaning', description: 'Includes cleaning of all exterior windows, frames, and sills.', unitPrice: 0, unitCost: 0 },
    { id: 3, name: 'Interior Window Cleaning', description: 'Cleaning of all interior windows including frames and sills by hand washing.', unitPrice: 0, unitCost: 0 },
    { id: 4, name: 'Plumbing Repair', description: 'General plumbing repair and maintenance services', unitPrice: 150, unitCost: 50 },
    { id: 5, name: 'HVAC Maintenance', description: 'Annual HVAC system maintenance and inspection', unitPrice: 320, unitCost: 100 },
  ]

  const workorder = mockWorkorders.find(wo => wo.id === workorderId)
  const client = workorder ? mockClients.find(c => c.id === workorder.clientId) : null

  useEffect(() => {
    if (workorder) {
      setEditedLineItems([...workorder.lineItems])
      setEditedPayments(workorder.payments && Array.isArray(workorder.payments) ? [...workorder.payments] : [])
    }
  }, [workorder])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreActionsRef.current && !moreActionsRef.current.contains(e.target as Node)) {
        setIsMoreActionsOpen(false)
      }
    }
    if (isMoreActionsOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMoreActionsOpen])

  if (!workorder) {
    return (
      <div className="p-8">
        <p style={{ color: '#1F271B' }}>Workorder not found</p>
      </div>
    )
  }

  const totalLineItemCost = workorder.lineItems.reduce((sum, item) => sum + (item.unitCost * item.quantity), 0)
  const totalLineItemPrice = workorder.lineItems.reduce((sum, item) => sum + item.total, 0)
  const totalExpenses = Array.isArray(workorder.expenses) && workorder.expenses.length > 0 
    ? (workorder.expenses as any[]).reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0) 
    : 0
  const totalCost = totalLineItemCost + totalExpenses
  const profit = totalLineItemPrice - totalCost
  const profitMargin = totalLineItemPrice > 0 ? ((profit / totalLineItemPrice) * 100).toFixed(0) : '0'
  
  // Calculate total payments
  const totalPayments = editedPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
  
  // Determine invoice status based on payments
  const invoiceTotal = workorder.total || totalLineItemPrice
  const isInvoicePaid = totalPayments >= invoiceTotal && invoiceTotal > 0

  return (
    <div className="space-y-4" style={{ backgroundColor: 'white', minHeight: '100vh', padding: '1rem 0' }}>
      {/* Top Header Bar */}
      <div className="flex items-center justify-end p-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/workorders/${workorderId}/send-booking-confirmation`)}
            className="px-2.5 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-all"
            style={{ backgroundColor: '#28AFB0', color: 'white' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1E8A8B'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#28AFB0'
            }}
          >
            <FiMail size={12} />
            <span>Email Booking Confirmation</span>
          </button>
          <button
            onClick={() => router.push(`/workorders/${workorderId}/edit`)}
            className="px-2.5 py-1.5 border rounded text-xs font-medium flex items-center gap-1.5 transition-all"
            style={{ borderColor: '#EAEBED', color: '#1F271B', backgroundColor: 'white' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F3F4F6'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white'
            }}
          >
            <FiEdit size={12} />
            <span>Edit</span>
          </button>
          <div className="relative" ref={moreActionsRef}>
            <button
              onClick={() => setIsMoreActionsOpen(!isMoreActionsOpen)}
              className="px-2.5 py-1.5 border rounded text-xs font-medium flex items-center gap-1.5 transition-all more-actions-button"
              style={{ borderColor: '#EAEBED', color: '#1F271B', backgroundColor: 'white' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F3F4F6'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white'
              }}
            >
              <FiMoreVertical size={12} />
            </button>
            {isMoreActionsOpen && (
              <div className="absolute right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 min-w-[240px]" style={{ borderColor: '#EAEBED' }}>
                <button 
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3" 
                  style={{ color: '#1F271B' }}
                >
                  <FiTool size={16} style={{ color: '#28AFB0', flexShrink: 0 }} />
                  <span>Close Job</span>
                </button>
                <button 
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3" 
                  style={{ color: '#1F271B' }}
                >
                  <FiCopy size={16} style={{ color: '#1F271B', flexShrink: 0 }} />
                  <span>Create Similar Job</span>
                </button>
                <button 
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3" 
                  style={{ color: '#1F271B' }}
                >
                  <FiSend size={16} style={{ color: '#1F271B', flexShrink: 0 }} />
                  <span>Send Job Follow-up Email</span>
                </button>
                <button 
                  onClick={() => {
                    router.push(`/workorders/${workorderId}/send-invoice`)
                    setIsMoreActionsOpen(false)
                  }}
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3" 
                  style={{ color: '#1F271B' }}
                >
                  <FiDollarSign size={16} style={{ color: '#2B50AA', flexShrink: 0 }} />
                  <span>Create Invoice</span>
                </button>
                <button 
                  onClick={() => {
                    router.push(`/workorders/${workorderId}/send-quote`)
                    setIsMoreActionsOpen(false)
                  }}
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3" 
                  style={{ color: '#1F271B' }}
                >
                  <FiSend size={16} style={{ color: '#1F271B', flexShrink: 0 }} />
                  <span>Send Quote</span>
                </button>
                <button 
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3" 
                  style={{ color: '#1F271B' }}
                >
                  <FiEdit size={16} style={{ color: '#1F271B', flexShrink: 0 }} />
                  <span>Collect Signature</span>
                </button>
                <button 
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3" 
                  style={{ color: '#1F271B' }}
                >
                  <FiFileText size={16} style={{ color: '#28AFB0', flexShrink: 0 }} />
                  <span>Email Job Costs CSV</span>
                </button>
                <button 
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3" 
                  style={{ color: '#1F271B' }}
                >
                  <FiFileText size={16} style={{ color: '#DC2626', flexShrink: 0 }} />
                  <span>Download PDF</span>
                </button>
                <button 
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3" 
                  style={{ color: '#1F271B' }}
                >
                  <FiPrinter size={16} style={{ color: '#1F271B', flexShrink: 0 }} />
                  <span>Print</span>
                </button>
                <div className="border-t my-1" style={{ borderTopColor: '#EAEBED' }}></div>
                <button className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors" style={{ color: '#1F271B' }}>
                  Archive
                </button>
                <button className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors" style={{ color: '#1F271B' }}>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main Work Order Details Section */}
          <div className="bg-white rounded-lg shadow-md border overflow-hidden" style={{ borderColor: '#EAEBED' }}>
            {/* Title Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderBottomColor: '#EAEBED' }}>
              <h2 className="text-base font-semibold" style={{ color: '#1F271B' }}>Job Details</h2>
              <span className="text-sm font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Job #{workorder.id}</span>
            </div>

            <div className="p-4">
              {/* Client Information */}
              <div className="mb-4">
                <button
                  onClick={() => router.push(`/clients/${workorder.clientId}`)}
                  className="text-xl font-bold mb-1 flex items-center gap-2 hover:underline transition-all"
                  style={{ color: '#1F271B' }}
                >
                  {workorder.clientName}
                  <FiLink size={14} style={{ color: '#1F271B', opacity: 0.6 }} />
                </button>
                <p className="text-sm mb-3" style={{ color: '#1F271B', opacity: 0.7 }}>{workorder.title}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Property Address */}
                  <div>
                    <div className="flex items-start gap-2 mb-2">
                      <FiMapPin size={16} style={{ color: '#1F271B', opacity: 0.7, marginTop: '2px' }} />
                      <div>
                        <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Property address</p>
                        <p className="text-sm" style={{ color: '#1F271B' }}>{workorder.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div>
                    <p className="text-xs font-medium mb-2" style={{ color: '#1F271B', opacity: 0.7 }}>Contact details</p>
                    {client?.phone && (
                      <div className="flex items-center gap-2 mb-1">
                        <FiPhone size={14} style={{ color: '#1F271B', opacity: 0.6 }} />
                        <span className="text-sm" style={{ color: '#1F271B' }}>{client.phone}</span>
                      </div>
                    )}
                    {client?.email && (
                      <div className="flex items-center gap-2">
                        <FiMail size={14} style={{ color: '#1F271B', opacity: 0.6 }} />
                        <span className="text-sm" style={{ color: '#1F271B' }}>{client.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quote, Job, Invoice Status */}
              <div className="grid grid-cols-3 gap-3 mb-4 pt-4 border-t" style={{ borderTopColor: '#EAEBED' }}>
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Quote Status</p>
                  <span className="inline-block px-2 py-1 rounded text-xs font-medium" style={{ 
                    backgroundColor: workorder.quoteStatus === 'approved' ? '#D1FAE5' : workorder.quoteStatus === 'waiting for approval' ? '#FEF3C7' : '#F3F4F6',
                    color: workorder.quoteStatus === 'approved' ? '#065F46' : workorder.quoteStatus === 'waiting for approval' ? '#92400E' : '#1F271B'
                  }}>
                    {workorder.quoteStatus}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Job Status</p>
                  <span className="inline-block px-2 py-1 rounded text-xs font-medium" style={{ 
                    backgroundColor: workorder.jobStatus === 'Completed' ? '#D1FAE5' : workorder.jobStatus === 'In Progress' ? '#DBEAFE' : '#F3F4F6',
                    color: workorder.jobStatus === 'Completed' ? '#065F46' : workorder.jobStatus === 'In Progress' ? '#1E40AF' : '#1F271B'
                  }}>
                    {workorder.jobStatus}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Invoice Status</p>
                  <span className="inline-block px-2 py-1 rounded text-xs font-medium" style={{ 
                    backgroundColor: isInvoicePaid ? '#D1FAE5' : workorder.invoiceStatus === 'waiting for payment' ? '#FEF3C7' : '#F3F4F6',
                    color: isInvoicePaid ? '#065F46' : workorder.invoiceStatus === 'waiting for payment' ? '#92400E' : '#1F271B'
                  }}>
                    {isInvoicePaid ? 'paid' : workorder.invoiceStatus}
                  </span>
                </div>
              </div>

              {/* Payment Summary */}
              {editedPayments.length > 0 && (
                <div className="mb-4 pt-4 border-t" style={{ borderTopColor: '#EAEBED' }}>
                  <p className="text-xs font-medium mb-2" style={{ color: '#1F271B', opacity: 0.7 }}>Payment Summary</p>
                  <div className="space-y-1">
                    {editedPayments.map((payment: any, index: number) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span style={{ color: '#1F271B', opacity: 0.8 }}>
                          {format(new Date(payment.date), 'MMM dd, yyyy')} - {payment.method}
                        </span>
                        <span className="font-medium" style={{ color: '#1F271B' }}>
                          Rs{payment.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between text-xs font-semibold pt-1 mt-1 border-t" style={{ borderTopColor: '#EAEBED' }}>
                      <span style={{ color: '#1F271B' }}>Total Paid:</span>
                      <span style={{ color: '#1F271B' }}>Rs{totalPayments.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule Details */}
              <div className="pt-4 border-t" style={{ borderTopColor: '#EAEBED' }}>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Schedule:</p>
                    <p className="text-sm" style={{ color: '#1F271B' }}>
                      {format(new Date(workorder.schedule.day), 'MMM dd, yyyy')} • {workorder.schedule.startTime} - {workorder.schedule.endTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Assigned Team Member:</p>
                    <p className="text-sm" style={{ color: '#1F271B' }}>{workorder.assignedTeamMember || '—'}</p>
                  </div>
                </div>
                {workorder.instructions && (
                  <div className="mb-3">
                    <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Instructions:</p>
                    <p className="text-sm" style={{ color: '#1F271B' }}>{workorder.instructions}</p>
                  </div>
                )}
              </div>

              {/* Job Details */}
              <div className="pt-4 border-t" style={{ borderTopColor: '#EAEBED' }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Job type:</p>
                    <p className="text-sm" style={{ color: '#1F271B' }}>One-off job</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Starts on:</p>
                    <p className="text-sm" style={{ color: '#1F271B' }}>{format(new Date(workorder.schedule.day), 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Ends on:</p>
                    <p className="text-sm" style={{ color: '#1F271B' }}>{format(new Date(workorder.schedule.day), 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Billing frequency:</p>
                    <p className="text-sm" style={{ color: '#1F271B' }}>Upon job completion</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Salesperson:</p>
                    <p className="text-sm" style={{ color: '#1F271B' }}>—</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Created at:</p>
                    <p className="text-sm" style={{ color: '#1F271B' }}>{format(new Date(workorder.createdAt), 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Last modified:</p>
                    <p className="text-sm" style={{ color: '#1F271B' }}>{format(new Date(workorder.lastModified), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profitability Summary Section */}
          {showProfitability && (
            <div className="bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED', backgroundColor: '#F3F4F6' }}>
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setShowProfitability(false)}
                  className="text-xs font-medium flex items-center gap-1 transition-colors"
                  style={{ color: '#1F271B', opacity: 0.7 }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.7'
                  }}
                >
                  Hide Profitability
                  <FiChevronUp size={12} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold mb-1" style={{ color: profit < 0 ? '#DC2626' : '#059669' }}>
                    {profit < 0 ? '-' : ''}{profitMargin}%
                  </p>
                  <p className="text-sm font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Profit margin</p>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#1F271B', opacity: 0.7 }}>Total price:</span>
                    <span className="font-medium" style={{ color: '#1F271B' }}>Rs{totalLineItemPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#1F271B', opacity: 0.7 }}>Line Item Cost:</span>
                    <span className="font-medium" style={{ color: '#1F271B' }}>Rs{totalLineItemCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#1F271B', opacity: 0.7 }}>Expenses:</span>
                    <span className="font-medium" style={{ color: '#1F271B' }}>Rs{totalExpenses.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-1 border-t" style={{ borderTopColor: '#EAEBED' }}>
                    <span className="font-medium" style={{ color: '#1F271B' }}>Profit:</span>
                    <span className="font-bold" style={{ color: profit < 0 ? '#DC2626' : '#059669' }}>
                      = {profit < 0 ? '-' : ''}Rs{Math.abs(profit).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Line Items Section */}
          <div className="bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold" style={{ color: '#1F271B' }}>Line Items</h2>
              <button
                onClick={() => {
                  setIsAddLineItemOpen(!isAddLineItemOpen)
                  if (isAddLineItemOpen) {
                    setNewLineItem({ name: '', description: '', quantity: 1, unitPrice: 0, unitCost: 0 })
                    setLineItemError('')
                  }
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
                <span>New Line Item</span>
              </button>
            </div>

            {/* Add New Line Item Form - Inline */}
            {isAddLineItemOpen && (
              <div className="mb-4 p-4 border rounded-lg" style={{ borderColor: '#EAEBED', backgroundColor: '#F9FAFB' }}>
                {/* Top Row - Name Field and Quantity/Price Fields */}
                <div className="mb-3">
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newLineItem.name}
                    onChange={(e) => {
                      setNewLineItem({ ...newLineItem, name: e.target.value })
                      setLineItemError('')
                    }}
                    placeholder="Enter line item name"
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all ${
                      lineItemError ? 'border-red-500' : ''
                    }`}
                    style={{ 
                      borderColor: lineItemError ? '#DC2626' : '#EAEBED', 
                      color: '#1F271B' 
                    }}
                    required
                    onFocus={(e) => {
                      if (!lineItemError) {
                        e.currentTarget.style.borderColor = '#28AFB0'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)'
                      }
                    }}
                    onBlur={(e) => {
                      if (!lineItemError) {
                        e.currentTarget.style.borderColor = '#EAEBED'
                        e.currentTarget.style.boxShadow = 'none'
                      }
                    }}
                  />
                  {lineItemError && (
                    <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#DC2626' }}>
                      <FiInfo size={12} />
                      {lineItemError}
                    </p>
                  )}
                </div>

                {/* Quantity, Unit Cost, Unit Price, Total */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B', opacity: 0.7 }}>Quantity</label>
                    <input
                      type="number"
                      value={newLineItem.quantity}
                      onChange={(e) => {
                        const qty = parseFloat(e.target.value) || 0
                        setNewLineItem({ ...newLineItem, quantity: qty })
                      }}
                      min="0"
                      step="0.01"
                      className="w-full px-2 py-2 border rounded text-sm text-center"
                      style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B', opacity: 0.7 }}>Unit cost</label>
                    <input
                      type="number"
                      value={newLineItem.unitCost}
                      onChange={(e) => {
                        const cost = parseFloat(e.target.value) || 0
                        setNewLineItem({ ...newLineItem, unitCost: cost })
                      }}
                      min="0"
                      step="0.01"
                      className="w-full px-2 py-2 border rounded text-sm text-center"
                      style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B', opacity: 0.7 }}>Unit price</label>
                    <input
                      type="number"
                      value={newLineItem.unitPrice}
                      onChange={(e) => {
                        const price = parseFloat(e.target.value) || 0
                        setNewLineItem({ ...newLineItem, unitPrice: price })
                      }}
                      min="0"
                      step="0.01"
                      className="w-full px-2 py-2 border rounded text-sm text-center"
                      style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B', opacity: 0.7 }}>Total</label>
                    <div className="px-2 py-2 border rounded text-sm text-center font-semibold" style={{ borderColor: '#EAEBED', backgroundColor: '#F3F4F6', color: '#1F271B' }}>
                      Rs{(newLineItem.quantity * newLineItem.unitPrice).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Bottom Row - Service List and Description */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left Column - Service List */}
                  <div>
                    <h3 className="text-xs font-semibold mb-2" style={{ color: '#1F271B' }}>SERVICE</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {masterServices.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => {
                            setNewLineItem({
                              name: service.name,
                              description: service.description,
                              quantity: 1,
                              unitPrice: service.unitPrice,
                              unitCost: service.unitCost,
                            })
                            setLineItemError('')
                          }}
                          className="w-full text-left p-2 rounded border transition-all"
                          style={{ 
                            borderColor: '#EAEBED',
                            backgroundColor: newLineItem.name === service.name ? '#FEF3C7' : 'white'
                          }}
                          onMouseEnter={(e) => {
                            if (newLineItem.name !== service.name) {
                              e.currentTarget.style.backgroundColor = '#F3F4F6'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (newLineItem.name !== service.name) {
                              e.currentTarget.style.backgroundColor = 'white'
                            }
                          }}
                        >
                          <p className="text-xs font-medium mb-1" style={{ color: '#1F271B' }}>{service.name}</p>
                          <p className="text-[10px] mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>{service.description}</p>
                          <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Rs{service.unitPrice.toFixed(2)}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right Column - Description */}
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>Description</label>
                    <textarea
                      value={newLineItem.description}
                      onChange={(e) => setNewLineItem({ ...newLineItem, description: e.target.value })}
                      placeholder="Enter description"
                      rows={8}
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
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t" style={{ borderTopColor: '#EAEBED' }}>
                  <button
                    onClick={() => {
                      setIsAddLineItemOpen(false)
                      setNewLineItem({ name: '', description: '', quantity: 1, unitPrice: 0, unitCost: 0 })
                      setLineItemError('')
                    }}
                    className="px-3 py-1.5 border rounded text-xs font-medium transition-all"
                    style={{ borderColor: '#EAEBED', color: '#1F271B', backgroundColor: 'white' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!newLineItem.name.trim()) {
                        setLineItemError('Enter a line item name')
                        return
                      }
                      // In a real app, this would save to the database
                      alert('Line item added successfully! (Static UI)')
                      setIsAddLineItemOpen(false)
                      setNewLineItem({ name: '', description: '', quantity: 1, unitPrice: 0, unitCost: 0 })
                      setLineItemError('')
                    }}
                    className="px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5"
                    style={{ backgroundColor: '#28AFB0', color: 'white' }}
                  >
                    <FiCheckCircle size={14} />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            )}

            {/* Existing Line Items */}
            {editedLineItems.length > 0 ? (
              <div className="space-y-3">
                {editedLineItems.map((item: any, index: number) => (
                  <div key={index} className="p-3 border rounded" style={{ borderColor: '#EAEBED', backgroundColor: '#F9FAFB' }}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1" style={{ color: '#1F271B' }}>{item.name}</p>
                        {item.description && (
                          <p className="text-xs mb-2" style={{ color: '#1F271B', opacity: 0.7 }}>{item.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs">
                          <span style={{ color: '#1F271B', opacity: 0.7 }}>Unit cost: <span className="font-medium">Rs{item.unitCost.toFixed(2)}</span></span>
                          <span style={{ color: '#1F271B', opacity: 0.7 }}>Total: <span className="font-semibold">Rs{item.total.toFixed(2)}</span></span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="text-xs underline transition-colors"
                          style={{ color: '#DC2626' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '0.8'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1'
                          }}
                        >
                          Delete
                        </button>
                        <button
                          className="px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all"
                          style={{ backgroundColor: '#28AFB0', color: 'white' }}
                        >
                          <FiCheckCircle size={12} />
                          <span>Save</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : !isAddLineItemOpen && (
              <p className="text-sm py-4 text-center" style={{ color: '#1F271B', opacity: 0.6 }}>No line items</p>
            )}

            {/* Summary Table */}
            {editedLineItems.length > 0 && (
              <div className="mt-4 pt-4 border-t" style={{ borderTopColor: '#EAEBED' }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b" style={{ borderBottomColor: '#EAEBED' }}>
                        <th className="text-left py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>PRODUCT / SERVICE</th>
                        <th className="text-left py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>QUANTITY</th>
                        <th className="text-left py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>COST</th>
                        <th className="text-left py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>PRICE</th>
                        <th className="text-right py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editedLineItems.map((item: any, index: number) => (
                        <tr key={index} className="border-b" style={{ borderBottomColor: '#EAEBED' }}>
                          <td className="py-2 px-2" style={{ color: '#1F271B' }}>{item.name}</td>
                          <td className="py-2 px-2" style={{ color: '#1F271B' }}>{item.quantity}</td>
                          <td className="py-2 px-2" style={{ color: '#1F271B' }}>Rs{(item.unitCost * item.quantity).toFixed(2)}</td>
                          <td className="py-2 px-2" style={{ color: '#1F271B' }}>Rs{item.unitPrice.toFixed(2)}</td>
                          <td className="py-2 px-2 text-right" style={{ color: '#1F271B' }}>Rs{item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="font-semibold border-t" style={{ borderTopColor: '#EAEBED' }}>
                        <td colSpan={3} className="py-2 px-2" style={{ color: '#1F271B' }}>Subtotal</td>
                        <td className="py-2 px-2 text-right" style={{ color: '#1F271B' }}>Rs{editedLineItems.reduce((sum: number, item: any) => sum + (item.unitCost * item.quantity), 0).toFixed(2)}</td>
                        <td className="py-2 px-2 text-right" style={{ color: '#1F271B' }}>Rs{editedLineItems.reduce((sum: number, item: any) => sum + item.total, 0).toFixed(2)}</td>
                      </tr>
                      {workorder.discount > 0 && (
                        <tr>
                          <td colSpan={3} className="py-2 px-2" style={{ color: '#1F271B' }}>
                            Discount ({workorder.discountType === 'percentage' ? `${workorder.discount}%` : 'Amount'})
                          </td>
                          <td className="py-2 px-2 text-right" style={{ color: '#1F271B' }}>—</td>
                          <td className="py-2 px-2 text-right" style={{ color: '#1F271B' }}>
                            -Rs{workorder.discountType === 'percentage' 
                              ? ((editedLineItems.reduce((sum: number, item: any) => sum + item.total, 0) * workorder.discount / 100)).toFixed(2)
                              : workorder.discount.toFixed(2)}
                          </td>
                        </tr>
                      )}
                      {workorder.tax > 0 && (
                        <tr>
                          <td colSpan={3} className="py-2 px-2" style={{ color: '#1F271B' }}>Tax</td>
                          <td className="py-2 px-2 text-right" style={{ color: '#1F271B' }}>—</td>
                          <td className="py-2 px-2 text-right" style={{ color: '#1F271B' }}>Rs{workorder.tax.toFixed(2)}</td>
                        </tr>
                      )}
                      <tr className="font-bold border-t" style={{ borderTopColor: '#EAEBED' }}>
                        <td colSpan={3} className="py-2 px-2" style={{ color: '#1F271B' }}>Total</td>
                        <td className="py-2 px-2 text-right" style={{ color: '#1F271B' }}>Rs{editedLineItems.reduce((sum: number, item: any) => sum + (item.unitCost * item.quantity), 0).toFixed(2)}</td>
                        <td className="py-2 px-2 text-right" style={{ color: '#1F271B' }}>Rs{workorder.total.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Expenses Section */}
          <div className="bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold" style={{ color: '#1F271B' }}>Expenses</h2>
              <button
                onClick={() => {
                  setNewExpense({
                    date: new Date().toISOString().split('T')[0],
                    itemName: '',
                    details: '',
                    total: 0,
                    linkedWorkorder: workorderId || null,
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
            <p className="text-sm" style={{ color: '#1F271B', opacity: 0.6 }}>
              Get an accurate picture of various job costs by recording expenses
            </p>
          </div>

          {/* Visits Section */}
          <div className="bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold" style={{ color: '#1F271B' }}>Visits</h2>
              <button
                className="px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-all"
                style={{ backgroundColor: '#28AFB0', color: 'white' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1E8A8B'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#28AFB0'
                }}
              >
                <FiPlus size={12} />
                <span>New Visit</span>
              </button>
            </div>
            <p className="text-xs mb-2" style={{ color: '#F97316' }}>All day / Any time</p>
            <div className="flex items-start gap-2 p-2 rounded" style={{ backgroundColor: '#F3F4F6' }}>
              <input type="checkbox" className="mt-0.5" style={{ accentColor: '#28AFB0' }} />
              <div>
                <p className="text-xs" style={{ color: '#1F271B' }}>
                  {format(new Date(workorder.schedule.day), 'MMM dd, yyyy')}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#1F271B', opacity: 0.7 }}>
                  Assigned to {workorder.assignedTeamMember || '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Invoices Section */}
          <div className="bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: '#1F271B' }}>Invoices</h2>
            <div className="flex gap-4 mb-3 border-b" style={{ borderBottomColor: '#EAEBED' }}>
              <button
                onClick={() => setSelectedInvoiceTab('Billing')}
                className="pb-2 text-xs font-medium transition-colors"
                style={{ 
                  color: selectedInvoiceTab === 'Billing' ? '#28AFB0' : '#1F271B',
                  opacity: selectedInvoiceTab === 'Billing' ? 1 : 0.7,
                  borderBottom: selectedInvoiceTab === 'Billing' ? '2px solid #28AFB0' : '2px solid transparent',
                  marginBottom: '-2px'
                }}
              >
                Billing
              </button>
              <button
                onClick={() => setSelectedInvoiceTab('Reminders')}
                className="pb-2 text-xs font-medium transition-colors"
                style={{ 
                  color: selectedInvoiceTab === 'Reminders' ? '#28AFB0' : '#1F271B',
                  opacity: selectedInvoiceTab === 'Reminders' ? 1 : 0.7,
                  borderBottom: selectedInvoiceTab === 'Reminders' ? '2px solid #28AFB0' : '2px solid transparent',
                  marginBottom: '-2px'
                }}
              >
                Reminders
              </button>
            </div>
            {selectedInvoiceTab === 'Billing' && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <input type="checkbox" id="split-invoices" className="w-4 h-4" style={{ accentColor: '#28AFB0' }} />
                  <label htmlFor="split-invoices" className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>
                    Split into multiple invoices with a payment schedule
                  </label>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b" style={{ borderBottomColor: '#EAEBED' }}>
                        <th className="text-left py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>INVOICE</th>
                        <th className="text-left py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>DUE DATE</th>
                        <th className="text-left py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>STATUS</th>
                        <th className="text-left py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>SUBJECT</th>
                        <th className="text-right py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>BALANCE</th>
                        <th className="text-right py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-2 px-2">
                          <button
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{ backgroundColor: '#28AFB0', color: 'white' }}
                          >
                            Create
                          </button>
                        </td>
                        <td className="py-2 px-2" style={{ color: '#1F271B' }}>—</td>
                        <td className="py-2 px-2">
                          <span className="inline-flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#60A5FA' }}></span>
                            <span className="text-xs" style={{ color: '#1F271B' }}>Upcoming</span>
                          </span>
                        </td>
                        <td className="py-2 px-2" style={{ color: '#1F271B' }}>For Services Rendered</td>
                        <td className="py-2 px-2 text-right" style={{ color: '#1F271B' }}>Rs{totalLineItemPrice.toFixed(2)}</td>
                        <td className="py-2 px-2 text-right" style={{ color: '#1F271B' }}>Rs{totalLineItemPrice.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {selectedInvoiceTab === 'Reminders' && (
              <div>
                <p className="text-sm py-4 text-center" style={{ color: '#1F271B', opacity: 0.6 }}>
                  Reminder tracking will be displayed here
                </p>
              </div>
            )}
          </div>

          {/* Payments Section */}
          <div className="bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold" style={{ color: '#1F271B' }}>Payments</h2>
              <button
                onClick={() => {
                  setNewPayment({
                    date: new Date().toISOString().split('T')[0],
                    amount: 0,
                    method: 'Cash',
                    reference: '',
                    notes: '',
                  })
                  setEditingPaymentIndex(null)
                  setIsAddPaymentOpen(true)
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
                <span>Add Payment</span>
              </button>
            </div>
            {editedPayments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderBottomColor: '#EAEBED' }}>
                      <th className="text-left py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>DATE</th>
                      <th className="text-left py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>AMOUNT</th>
                      <th className="text-left py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>METHOD</th>
                      <th className="text-left py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>REFERENCE</th>
                      <th className="text-left py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>NOTES</th>
                      <th className="text-right py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editedPayments.map((payment: any, index: number) => (
                      <tr key={index} className="border-b" style={{ borderBottomColor: '#EAEBED' }}>
                        <td className="py-2 px-2" style={{ color: '#1F271B' }}>{format(new Date(payment.date), 'MMM dd, yyyy')}</td>
                        <td className="py-2 px-2" style={{ color: '#1F271B' }}>Rs{payment.amount.toFixed(2)}</td>
                        <td className="py-2 px-2" style={{ color: '#1F271B' }}>{payment.method}</td>
                        <td className="py-2 px-2" style={{ color: '#1F271B' }}>{payment.reference || '—'}</td>
                        <td className="py-2 px-2" style={{ color: '#1F271B' }}>{payment.notes || '—'}</td>
                        <td className="py-2 px-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setNewPayment({ ...payment })
                                setEditingPaymentIndex(index)
                                setIsAddPaymentOpen(true)
                              }}
                              className="text-xs px-2 py-1 rounded transition-all"
                              style={{ color: '#28AFB0', backgroundColor: 'transparent' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#F0FDFA'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent'
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                const updatedPayments = editedPayments.filter((_, i) => i !== index)
                                setEditedPayments(updatedPayments)
                              }}
                              className="text-xs px-2 py-1 rounded transition-all"
                              style={{ color: '#DC2626', backgroundColor: 'transparent' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#FEE2E2'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-3 pt-3 border-t flex justify-between items-center" style={{ borderTopColor: '#EAEBED' }}>
                  <span className="text-sm font-semibold" style={{ color: '#1F271B' }}>Total Paid:</span>
                  <span className="text-sm font-bold" style={{ color: '#1F271B' }}>
                    Rs{totalPayments.toFixed(2)}
                  </span>
                </div>
                {isInvoicePaid && (
                  <div className="mt-2 p-2 rounded text-xs text-center" style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>
                    Invoice fully paid
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm py-4 text-center" style={{ color: '#1F271B', opacity: 0.6 }}>
                No payments recorded. Click "Add Payment" to record a payment.
              </p>
            )}
          </div>

          {/* Internal Notes Section */}
          <div className="bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
            <h2 className="text-sm font-semibold mb-1" style={{ color: '#1F271B' }}>Internal notes</h2>
            <p className="text-xs mb-3" style={{ color: '#1F271B', opacity: 0.6 }}>
              Internal notes will only be seen by your team
            </p>
            <textarea
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="Note details"
              rows={4}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all resize-none mb-3"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
            />
            <div className="border-2 border-dashed rounded p-4 text-center" style={{ borderColor: '#EAEBED' }}>
              <p className="text-sm mb-2" style={{ color: '#1F271B', opacity: 0.6 }}>
                Drag your files here or{' '}
                <button className="text-sm font-medium" style={{ color: '#28AFB0' }}>
                  Select a File
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Work Order Detailed Section */}
          <div className="bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: '#1F271B' }}>Work Order Details</h2>
            <div className="space-y-3">
              {workorder.quoteNumber && (
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Last Quote</p>
                  <a href="#" className="text-xs flex items-center gap-1 text-blue-600 hover:underline">
                    <FiFileText size={12} />
                    <span>{workorder.quoteNumber}.pdf</span>
                  </a>
                </div>
              )}
              {workorder.invoiceNumber && (
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Last Invoice</p>
                  <a href="#" className="text-xs flex items-center gap-1 text-blue-600 hover:underline">
                    <FiFileText size={12} />
                    <span>{workorder.invoiceNumber}.pdf</span>
                  </a>
                </div>
              )}
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Quote sent</p>
                <div className="flex items-center gap-2">
                  {workorder.quoteDateSent ? (
                    <>
                      <FiCheckCircle size={12} style={{ color: '#059669' }} />
                      <span className="text-xs" style={{ color: '#1F271B' }}>
                        {format(new Date(workorder.quoteDateSent), 'MMM dd, yyyy')}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs" style={{ color: '#1F271B', opacity: 0.6 }}>Not sent</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Quote WhatsApp status</p>
                <span className="inline-block px-2 py-1 rounded text-xs" style={{ 
                  backgroundColor: workorder.quoteWhatsappStatus === 'sent' ? '#D1FAE5' : '#F3F4F6',
                  color: workorder.quoteWhatsappStatus === 'sent' ? '#065F46' : '#1F271B'
                }}>
                  {workorder.quoteWhatsappStatus || 'Not sent'}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Invoice sent</p>
                <div className="flex items-center gap-2">
                  {workorder.invoiceDateSent ? (
                    <>
                      <FiCheckCircle size={12} style={{ color: '#059669' }} />
                      <span className="text-xs" style={{ color: '#1F271B' }}>
                        {format(new Date(workorder.invoiceDateSent), 'MMM dd, yyyy')}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs" style={{ color: '#1F271B', opacity: 0.6 }}>Not sent</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Invoice WhatsApp status</p>
                <span className="inline-block px-2 py-1 rounded text-xs" style={{ 
                  backgroundColor: workorder.invoiceWhatsappStatus === 'sent' ? '#D1FAE5' : '#F3F4F6',
                  color: workorder.invoiceWhatsappStatus === 'sent' ? '#065F46' : '#1F271B'
                }}>
                  {workorder.invoiceWhatsappStatus || 'Not sent'}
                </span>
              </div>
              {(workorder as any).quoteObservations && (
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Quote Observations</p>
                  <p className="text-xs" style={{ color: '#1F271B' }}>{(workorder as any).quoteObservations}</p>
                </div>
              )}
              {(workorder as any).quoteTermsAndConditions && (
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Quote T&C</p>
                  <p className="text-xs" style={{ color: '#1F271B' }}>{(workorder as any).quoteTermsAndConditions}</p>
                </div>
              )}
              {(workorder as any).invoiceObservations && (
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Invoice Observations</p>
                  <p className="text-xs" style={{ color: '#1F271B' }}>{(workorder as any).invoiceObservations}</p>
                </div>
              )}
              {(workorder as any).invoiceTermsAndConditions && (
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Invoice T&C</p>
                  <p className="text-xs" style={{ color: '#1F271B' }}>{(workorder as any).invoiceTermsAndConditions}</p>
                </div>
              )}
            </div>
          </div>

          {/* Reminder Tracking Section */}
          <div className="bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: '#1F271B' }}>Reminders</h2>
            <div className="space-y-2">
              {workorder.quoteDateSent && (
                <div className="p-2 rounded" style={{ backgroundColor: '#F3F4F6' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium" style={{ color: '#1F271B' }}>Quote Reminder</span>
                    <FiCheckCircle size={12} style={{ color: '#059669' }} />
                  </div>
                  <p className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>
                    Sent on {format(new Date(workorder.quoteDateSent), 'MMM dd, yyyy')}
                  </p>
                </div>
              )}
              {workorder.invoiceDateSent && (
                <div className="p-2 rounded" style={{ backgroundColor: '#F3F4F6' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium" style={{ color: '#1F271B' }}>Invoice Reminder</span>
                    <FiCheckCircle size={12} style={{ color: '#059669' }} />
                  </div>
                  <p className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>
                    Sent on {format(new Date(workorder.invoiceDateSent), 'MMM dd, yyyy')}
                  </p>
                </div>
              )}
              {!workorder.quoteDateSent && !workorder.invoiceDateSent && (
                <p className="text-xs text-center py-2" style={{ color: '#1F271B', opacity: 0.6 }}>
                  No reminders sent
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col" style={{ borderColor: '#EAEBED' }}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b" style={{ borderBottomColor: '#EAEBED' }}>
              <h2 className="text-base font-semibold" style={{ color: '#1F271B' }}>Add Expense</h2>
              <button
                onClick={() => {
                  setIsAddExpenseOpen(false)
                  setNewExpense({
                    date: new Date().toISOString().split('T')[0],
                    itemName: '',
                    details: '',
                    total: 0,
                    linkedWorkorder: workorderId || null,
                    invoiceNumber: '',
                    attachment: null,
                  })
                }}
                className="p-1 rounded transition-colors"
                style={{ color: '#1F271B', opacity: 0.6 }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1'
                  e.currentTarget.style.backgroundColor = '#F3F4F6'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.6'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* Date */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-2 text-xs transition-all"
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
                <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>
                  Item name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newExpense.itemName}
                  onChange={(e) => setNewExpense({ ...newExpense, itemName: e.target.value })}
                  placeholder="Enter item name"
                  className="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-2 text-xs transition-all"
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
                <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>
                  Details
                </label>
                <textarea
                  value={newExpense.details}
                  onChange={(e) => setNewExpense({ ...newExpense, details: e.target.value })}
                  placeholder="Enter expense details"
                  rows={2}
                  className="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-2 text-xs transition-all resize-none"
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
                <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>
                  Total <span className="text-red-500">*</span>
                </label>
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
                <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>
                  Linked Work order (when applies)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={newExpense.linkedWorkorder || ''}
                    onChange={(e) => setNewExpense({ ...newExpense, linkedWorkorder: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="Work order ID"
                    min="1"
                    className="flex-1 px-2.5 py-1.5 border rounded focus:outline-none focus:ring-2 text-xs transition-all"
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
                  {workorder && (
                    <span className="text-xs px-2 py-1 rounded whitespace-nowrap" style={{ backgroundColor: '#F3F4F6', color: '#1F271B' }}>
                      Current: #{workorder.id}
                    </span>
                  )}
                </div>
              </div>

              {/* Invoice Number */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>
                  Invoice number
                </label>
                <input
                  type="text"
                  value={newExpense.invoiceNumber}
                  onChange={(e) => setNewExpense({ ...newExpense, invoiceNumber: e.target.value })}
                  placeholder="Enter invoice number"
                  className="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-2 text-xs transition-all"
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
                <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>
                  Attachment (invoice)
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 px-2.5 py-1.5 border rounded cursor-pointer flex items-center justify-center gap-1.5 text-xs transition-all hover:bg-gray-50"
                    style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#28AFB0'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#EAEBED'
                    }}
                  >
                    <FiUpload size={14} />
                    <span className="truncate">{newExpense.attachment ? newExpense.attachment.name : 'Upload file'}</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setNewExpense({ ...newExpense, attachment: file })
                        }
                      }}
                    />
                  </label>
                  {newExpense.attachment && (
                    <button
                      onClick={() => setNewExpense({ ...newExpense, attachment: null })}
                      className="px-2 py-1.5 border rounded text-xs transition-all"
                      style={{ borderColor: '#DC2626', color: '#DC2626', backgroundColor: 'white' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#FEE2E2'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white'
                      }}
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

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 p-3 border-t" style={{ borderTopColor: '#EAEBED' }}>
              <button
                onClick={() => {
                  setIsAddExpenseOpen(false)
                  setNewExpense({
                    date: new Date().toISOString().split('T')[0],
                    itemName: '',
                    details: '',
                    total: 0,
                    linkedWorkorder: workorderId || null,
                    invoiceNumber: '',
                    attachment: null,
                  })
                }}
                className="px-3 py-1.5 border rounded text-xs font-medium transition-all"
                style={{ borderColor: '#EAEBED', color: '#1F271B', backgroundColor: 'white' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F3F4F6'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newExpense.itemName && newExpense.total > 0) {
                    // In a real app, this would save to the database
                    alert('Expense added successfully! (Static UI)')
                    setIsAddExpenseOpen(false)
                    setNewExpense({
                      date: new Date().toISOString().split('T')[0],
                      itemName: '',
                      details: '',
                      total: 0,
                      linkedWorkorder: workorderId || null,
                      invoiceNumber: '',
                      attachment: null,
                    })
                  }
                }}
                className="px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5"
                style={{ backgroundColor: '#28AFB0', color: 'white' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1E8A8B'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#28AFB0'
                }}
              >
                <FiCheckCircle size={14} />
                <span>Save Expense</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Payment Modal */}
      {isAddPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col" style={{ borderColor: '#EAEBED' }}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b" style={{ borderBottomColor: '#EAEBED' }}>
              <h2 className="text-base font-semibold" style={{ color: '#1F271B' }}>
                {editingPaymentIndex !== null ? 'Edit Payment' : 'Add Payment'}
              </h2>
              <button
                onClick={() => {
                  setIsAddPaymentOpen(false)
                  setNewPayment({
                    date: new Date().toISOString().split('T')[0],
                    amount: 0,
                    method: 'Cash',
                    reference: '',
                    notes: '',
                  })
                  setEditingPaymentIndex(null)
                }}
                className="p-1 rounded transition-colors"
                style={{ color: '#1F271B', opacity: 0.6 }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1'
                  e.currentTarget.style.backgroundColor = '#F3F4F6'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.6'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* Payment Date */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>
                  Payment date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={newPayment.date}
                  onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-2 text-xs transition-all"
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

              {/* Payment Amount */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>
                  Payment amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={newPayment.amount || ''}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-2 text-xs transition-all"
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

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  value={newPayment.method}
                  onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value })}
                  className="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-2 text-xs transition-all"
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
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Check">Check</option>
                  <option value="Online Payment">Online Payment</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Payment Reference Number */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>
                  Payment reference number
                </label>
                <input
                  type="text"
                  value={newPayment.reference}
                  onChange={(e) => setNewPayment({ ...newPayment, reference: e.target.value })}
                  placeholder="Enter reference number"
                  className="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-2 text-xs transition-all"
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

              {/* Payment Note / Details */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>
                  Payment note / details
                </label>
                <textarea
                  value={newPayment.notes}
                  onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                  placeholder="Enter payment notes or details"
                  rows={2}
                  className="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:ring-2 text-xs transition-all resize-none"
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

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 p-3 border-t" style={{ borderTopColor: '#EAEBED' }}>
              <button
                onClick={() => {
                  setIsAddPaymentOpen(false)
                  setNewPayment({
                    date: new Date().toISOString().split('T')[0],
                    amount: 0,
                    method: 'Cash',
                    reference: '',
                    notes: '',
                  })
                  setEditingPaymentIndex(null)
                }}
                className="px-3 py-1.5 border rounded text-xs font-medium transition-all"
                style={{ borderColor: '#EAEBED', color: '#1F271B', backgroundColor: 'white' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F3F4F6'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newPayment.amount > 0 && newPayment.date) {
                    if (editingPaymentIndex !== null) {
                      // Edit existing payment
                      const updatedPayments = [...editedPayments]
                      updatedPayments[editingPaymentIndex] = { ...newPayment }
                      setEditedPayments(updatedPayments)
                    } else {
                      // Add new payment
                      setEditedPayments([...editedPayments, { ...newPayment }])
                    }
                    setIsAddPaymentOpen(false)
                    setNewPayment({
                      date: new Date().toISOString().split('T')[0],
                      amount: 0,
                      method: 'Cash',
                      reference: '',
                      notes: '',
                    })
                    setEditingPaymentIndex(null)
                  }
                }}
                className="px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5"
                style={{ backgroundColor: '#28AFB0', color: 'white' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1E8A8B'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#28AFB0'
                }}
              >
                <FiCheckCircle size={14} />
                <span>{editingPaymentIndex !== null ? 'Update Payment' : 'Save Payment'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
