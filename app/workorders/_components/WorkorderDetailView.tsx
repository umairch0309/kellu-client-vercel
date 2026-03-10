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
  FiSend,
  FiTrash2,
  FiExternalLink
} from 'react-icons/fi'

const TALLY_WORK_REPORT_BASE_URL = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_TALLY_WORK_REPORT_URL
  ? process.env.NEXT_PUBLIC_TALLY_WORK_REPORT_URL
  : 'https://tally.so'
import { format } from 'date-fns'
import { mockClients, mockWorkorders, mockMaterialsList, companyTaxRatePercent, quoteSettings, invoiceSettings } from '@/data/mockData'
import { useClientReminders } from '@/context/ClientRemindersContext'
import AddProductServiceModal, { type NewProductServiceData } from './AddProductServiceModal'
import SendEmailModal, { type SendEmailModalType } from './SendEmailModal'
import CreateJobReportModal from './CreateJobReportModal'
import SetCustomerReminderModal from '../../clients/_components/SetCustomerReminderModal'

interface WorkorderDetailViewProps {
  workorderId: number
}

export default function WorkorderDetailView({ workorderId }: WorkorderDetailViewProps) {
  const router = useRouter()
  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState(false)
  const [isAddLineItemOpen, setIsAddLineItemOpen] = useState(false)
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
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false)
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([])
  const attachmentInputRef = useRef<HTMLInputElement>(null)
  const [editingLineItemIndex, setEditingLineItemIndex] = useState<number | null>(null)
  const [editingLineItemForm, setEditingLineItemForm] = useState<{ name: string; description: string; quantity: number; unitCost: number; unitPrice: number } | null>(null)
  const [editedLineItems, setEditedLineItems] = useState<any[]>([])
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [editingExpenseIndex, setEditingExpenseIndex] = useState<number | null>(null)
  const [editedExpenses, setEditedExpenses] = useState<any[]>([])
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
  const [quoteClientMessage, setQuoteClientMessage] = useState(() => quoteSettings?.clientMessage ?? '')
  const [quoteTermsAndConditions, setQuoteTermsAndConditions] = useState(() => quoteSettings?.termsAndConditions ?? '')
  const [quoteRequired, setQuoteRequired] = useState(false)
  const [applyToAllFutureQuotes, setApplyToAllFutureQuotes] = useState(false)
  const [invoiceClientMessage, setInvoiceClientMessage] = useState(() => invoiceSettings?.clientMessage ?? '')
  const [invoiceTermsAndConditions, setInvoiceTermsAndConditions] = useState(() => invoiceSettings?.termsAndConditions ?? '')
  const [applyToAllFutureInvoices, setApplyToAllFutureInvoices] = useState(false)
  const [invoiceInternalNote, setInvoiceInternalNote] = useState('')
  const [sendEmailModalType, setSendEmailModalType] = useState<SendEmailModalType | null>(null)
  const [jobReportPdfUrl, setJobReportPdfUrl] = useState<string | null>(null)
  const [jobReportSentAt, setJobReportSentAt] = useState<string | null>(null)
  const [isCreateJobReportModalOpen, setIsCreateJobReportModalOpen] = useState(false)
  const [isFetchingTallyWorkReport, setIsFetchingTallyWorkReport] = useState(false)
  const [tallyWorkReportSentAt, setTallyWorkReportSentAt] = useState<string | null>(null)
  const [sendingTallyWorkReport, setSendingTallyWorkReport] = useState(false)
  const [isSetReminderOpen, setIsSetReminderOpen] = useState(false)
  const [editingReminder, setEditingReminder] = useState(false)
  const { getReminder, setReminder, deleteReminder, isReminderDue } = useClientReminders()
  const moreActionsRef = useRef<HTMLDivElement>(null)
  const lineItemNameDropdownRef = useRef<HTMLDivElement>(null)
  const [quoteMarkAsOpen, setQuoteMarkAsOpen] = useState(false)
  const [editedQuoteStatus, setEditedQuoteStatus] = useState<string | null>(null)
  const quoteMarkAsRef = useRef<HTMLDivElement>(null)
  const [isBookingConfirmationModalOpen, setIsBookingConfirmationModalOpen] = useState(false)
  const [bookingConfirmationSent, setBookingConfirmationSent] = useState(false)
  const [bookingSubject, setBookingSubject] = useState('')
  const [bookingMessage, setBookingMessage] = useState('')
  const [bookingSendMeCopy, setBookingSendMeCopy] = useState(false)
  const [bookingSendWhatsApp, setBookingSendWhatsApp] = useState(false)
  const [bookingIncludeTeamPictures, setBookingIncludeTeamPictures] = useState(false)

  const workorder = mockWorkorders.find(wo => wo.id === workorderId)
  const client = workorder ? mockClients.find(c => c.id === workorder.clientId) : null

  useEffect(() => {
    if (!workorder) return
    setEditedLineItems([...workorder.lineItems])
    setEditedPayments(workorder.payments && Array.isArray(workorder.payments) ? [...workorder.payments] : [])
    setEditedExpenses(Array.isArray(workorder.expenses) ? [...(workorder.expenses as any[])] : [])
    setQuoteClientMessage((workorder as any).quoteClientMessage ?? quoteSettings?.clientMessage ?? '')
    setQuoteTermsAndConditions((workorder as any).quoteTermsAndConditions ?? quoteSettings?.termsAndConditions ?? '')
    setQuoteRequired((workorder as any).quoteRequired ?? false)
    setInvoiceClientMessage((workorder as any).invoiceClientMessage ?? invoiceSettings?.clientMessage ?? '')
    setInvoiceTermsAndConditions((workorder as any).invoiceTermsAndConditions ?? invoiceSettings?.termsAndConditions ?? '')
    setJobReportPdfUrl((workorder as any).jobReportPdfUrl ?? null)
    setJobReportSentAt((workorder as any).jobReportSentAt ?? null)
    setTallyWorkReportSentAt((workorder as any).tallyWorkReportSentAt ?? null)
    setInternalNote((workorder as any).internalNote ?? '')
    setInvoiceInternalNote((workorder as any).invoiceInternalNote ?? '')
    setEditedQuoteStatus(null)
    setBookingConfirmationSent((workorder as any).bookingConfirmationSent ?? false)
  }, [workorder])

  // When opening booking confirmation modal, init subject and message
  useEffect(() => {
    if (!isBookingConfirmationModalOpen || !workorder || !client) return
    setBookingMessage(`Dear ${client.name || 'Client'},

Your booking has been confirmed for ${workorder.title || 'your job'}.

Schedule Details:
Date: ${format(new Date(workorder.schedule.day), 'MMMM dd, yyyy')}
Time: ${workorder.schedule.startTime} - ${workorder.schedule.endTime}
${workorder.assignedTeamMember ? `Assigned Team Member: ${workorder.assignedTeamMember}` : ''}

Address:
${workorder.address}

We look forward to serving you!

Best regards`)
    setBookingSubject(`Booking Confirmation - ${workorder.title || 'Job'} - ${format(new Date(workorder.schedule.day), 'MMM dd, yyyy')}`)
  }, [isBookingConfirmationModalOpen, workorder, client])

  // Close Quote "Mark as" dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (quoteMarkAsRef.current && !quoteMarkAsRef.current.contains(e.target as Node)) setQuoteMarkAsOpen(false)
    }
    if (quoteMarkAsOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [quoteMarkAsOpen])

  // Seed 2–3 workorder attachments so the send-email modal can show opt-in/opt-out for this email
  useEffect(() => {
    setAttachmentFiles([
      new File([], 'Quote.pdf', { type: 'application/pdf' }),
      new File([], 'Invoice.pdf', { type: 'application/pdf' }),
      new File([], 'Work order summary.pdf', { type: 'application/pdf' }),
    ])
  }, [workorderId])

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
  const totalExpenses = editedExpenses.length > 0
    ? editedExpenses.reduce((sum: number, exp: any) => sum + (exp.total ?? exp.amount ?? 0), 0)
    : 0
  const totalLabor = (workorder as any).labor ?? 0
  const totalCost = totalLineItemCost + totalLabor + totalExpenses
  const profit = totalLineItemPrice - totalCost
  const profitMargin = totalLineItemPrice > 0 ? ((profit / totalLineItemPrice) * 100).toFixed(0) : '0'
  const legendSquareStyle = { width: 8, height: 8, backgroundColor: '#7DD3FC', borderRadius: 1 }
  
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
            onClick={() => setIsBookingConfirmationModalOpen(true)}
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
            <span>{bookingConfirmationSent || (workorder as any).bookingConfirmationSent ? 'Resend booking confirmation' : 'Booking confirmation'}</span>
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
              <div className="absolute right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 min-w-[220px] py-1" style={{ borderColor: '#EAEBED' }}>
                <button 
                  onClick={() => {
                    setSendEmailModalType('quote')
                    setIsMoreActionsOpen(false)
                  }}
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3" 
                  style={{ color: '#1F271B' }}
                >
                  <FiSend size={16} style={{ color: '#1F271B', flexShrink: 0 }} />
                  <span>{(workorder.quoteDateSent || workorder.quoteStatus !== 'not sent') ? 'Resend Quote' : 'Send Quote'}</span>
                </button>
                <div className="border-t mx-2" style={{ borderStyle: 'dashed', borderColor: '#EAEBED' }} />
                <button 
                  onClick={() => {
                    setSendEmailModalType('invoice')
                    setIsMoreActionsOpen(false)
                  }}
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3" 
                  style={{ color: '#1F271B' }}
                >
                  <FiDollarSign size={16} style={{ color: '#2B50AA', flexShrink: 0 }} />
                  <span>Send Invoice</span>
                </button>
                <div className="border-t mx-2" style={{ borderStyle: 'dashed', borderColor: '#EAEBED' }} />
                <button 
                  onClick={() => {
                    setSendEmailModalType('job-follow')
                    setIsMoreActionsOpen(false)
                  }}
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3" 
                  style={{ color: '#1F271B' }}
                >
                  <FiMail size={16} style={{ color: '#28AFB0', flexShrink: 0 }} />
                  <span>Send Job Follow</span>
                </button>
                <div className="border-t mx-2" style={{ borderStyle: 'dashed', borderColor: '#EAEBED' }} />
                <button 
                  onClick={() => {
                    const url = `${TALLY_WORK_REPORT_BASE_URL}${TALLY_WORK_REPORT_BASE_URL.includes('?') ? '&' : '?'}workorder=${workorderId}`
                    window.open(url, '_blank', 'noopener,noreferrer')
                    setIsMoreActionsOpen(false)
                  }}
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3" 
                  style={{ color: '#1F271B' }}
                >
                  <FiExternalLink size={16} style={{ color: '#28AFB0', flexShrink: 0 }} />
                  <span>Create Job report</span>
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
                <div ref={quoteMarkAsRef} className="relative">
                  <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Quote Status</p>
                  {(() => {
                    const displayStatus = editedQuoteStatus ?? workorder.quoteStatus
                    const statusBg = displayStatus === 'approved' ? 'rgba(40, 175, 176, 0.2)' : displayStatus === 'waiting for approval' ? 'rgba(176, 132, 204, 0.2)' : displayStatus === 'rejected' || displayStatus === 'expired' ? 'rgba(239, 68, 68, 0.15)' : '#F3F4F6'
                    const statusColor = displayStatus === 'approved' ? '#1E8A8B' : displayStatus === 'waiting for approval' ? '#8B6AA3' : displayStatus === 'rejected' || displayStatus === 'expired' ? '#DC2626' : '#1F271B'
                    const markAsOptions: { value: string; label: string; icon: React.ReactNode }[] = []
                    if (displayStatus === 'not sent' || displayStatus === 'rejected') {
                      markAsOptions.push({ value: 'waiting for approval', label: 'Awaiting response', icon: <FiSend size={14} style={{ color: '#1F271B', flexShrink: 0 }} /> })
                      markAsOptions.push({ value: 'approved', label: 'Approved Quote', icon: <FiCheckCircle size={14} style={{ color: '#059669', flexShrink: 0 }} /> })
                    } else if (displayStatus === 'approved') {
                      markAsOptions.push({ value: 'approved', label: 'Approved Quote', icon: <FiCheckCircle size={14} style={{ color: '#059669', flexShrink: 0 }} /> })
                      markAsOptions.push({ value: 'rejected', label: 'Rejected Quote', icon: <FiX size={14} style={{ color: '#1F271B', flexShrink: 0 }} /> })
                    } else {
                      markAsOptions.push({ value: 'waiting for approval', label: 'Awaiting response', icon: <FiSend size={14} style={{ color: '#1F271B', flexShrink: 0 }} /> })
                      markAsOptions.push({ value: 'rejected', label: 'Rejected Quote', icon: <FiX size={14} style={{ color: '#1F271B', flexShrink: 0 }} /> })
                    }
                    return (
                      <>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setQuoteMarkAsOpen(!quoteMarkAsOpen) }}
                          className="inline-block px-2 py-1 rounded-full text-xs font-medium text-left transition-colors"
                          style={{ backgroundColor: statusBg, color: statusColor }}
                        >
                          {displayStatus === 'waiting for approval' ? 'Awaiting response' : displayStatus === 'not sent' ? 'Not sent' : displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
                        </button>
                        {quoteMarkAsOpen && (
                          <div className="absolute left-0 top-full mt-1 z-50 bg-white border rounded-lg shadow-lg py-1 min-w-[180px]" style={{ borderColor: '#EAEBED' }}>
                            <p className="px-3 py-2 text-xs font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Mark as...</p>
                            <div className="mx-2 border-t" style={{ borderStyle: 'dashed', borderColor: '#EAEBED' }} />
                            {markAsOptions.map((opt, i) => (
                              <span key={opt.value}>
                                {i > 0 && <div className="mx-2 border-t" style={{ borderStyle: 'dashed', borderColor: '#EAEBED' }} />}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditedQuoteStatus(opt.value)
                                    const wo = mockWorkorders.find(w => w.id === workorderId) as any
                                    if (wo) wo.quoteStatus = opt.value
                                    setQuoteMarkAsOpen(false)
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-3"
                                  style={{ color: '#1F271B' }}
                                >
                                  {opt.icon}
                                  <span>{opt.label}</span>
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Job Status</p>
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-medium" style={{ 
                    backgroundColor: workorder.jobStatus === 'Completed' || workorder.jobStatus === 'In Progress' ? 'rgba(40, 175, 176, 0.2)' : workorder.jobStatus === 'Scheduled' ? 'rgba(43, 80, 170, 0.2)' : '#F3F4F6',
                    color: workorder.jobStatus === 'Completed' || workorder.jobStatus === 'In Progress' ? '#1E8A8B' : workorder.jobStatus === 'Scheduled' ? '#1F3A7A' : '#1F271B'
                  }}>
                    {workorder.jobStatus}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Invoice Status</p>
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-medium" style={{ 
                    backgroundColor: isInvoicePaid ? 'rgba(40, 175, 176, 0.2)' : workorder.invoiceStatus === 'waiting for payment' ? 'rgba(176, 132, 204, 0.2)' : '#F3F4F6',
                    color: isInvoicePaid ? '#1E8A8B' : workorder.invoiceStatus === 'waiting for payment' ? '#8B6AA3' : '#1F271B'
                  }}>
                    {isInvoicePaid ? 'paid' : workorder.invoiceStatus}
                  </span>
                </div>
              </div>

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

            </div>
          </div>

          {/* Grouped: Profitability + Line Items + Expenses — grey outer, white div per section */}
          <div className="rounded-lg border p-4 space-y-4" style={{ borderColor: '#EAEBED', backgroundColor: '#F3F4F6' }}>
            {/* Profitability Section — white card */}
          {showProfitability && (
              <div className="rounded-lg border p-4 bg-white" style={{ borderColor: '#EAEBED' }}>
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setShowProfitability(false)}
                  className="text-xs font-medium flex items-center gap-1 transition-colors"
                  style={{ color: '#1F271B', opacity: 0.7 }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7' }}
                >
                  Hide Profitability
                  <FiChevronUp size={12} />
                </button>
              </div>
                <div className="border-b pb-4 mb-4" style={{ borderColor: '#EAEBED' }} />
                <div className="flex flex-wrap items-center gap-6 md:gap-8">
                  <div>
                    <p className="text-2xl font-bold mb-1" style={{ color: profit < 0 ? '#DC2626' : '#059669' }}>
                      {profit < 0 ? '-' : ''}{profitMargin}%
                    </p>
                    <p className="text-sm font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Profit margin</p>
                  </div>
                  <div className="flex flex-wrap items-start gap-6 md:gap-8">
                    <div className="min-w-[90px] text-right">
                      <p className="text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Total price</p>
                      <p className="text-sm font-bold tabular-nums" style={{ color: '#1F271B' }}>Rs{totalLineItemPrice.toFixed(2)}</p>
                    </div>
                    <div className="min-w-[90px] text-right">
                      <div className="flex items-center justify-end gap-1.5 mb-1">
                        <span className="shrink-0 rounded-sm" style={legendSquareStyle} />
                        <p className="text-xs font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Line Item Cost</p>
                      </div>
                      <p className="text-sm font-bold tabular-nums" style={{ color: '#1F271B' }}>- Rs{totalLineItemCost.toFixed(2)}</p>
                    </div>
                    <div className="min-w-[90px] text-right">
                      <div className="flex items-center justify-end gap-1.5 mb-1">
                        <span className="shrink-0 rounded-sm" style={legendSquareStyle} />
                        <p className="text-xs font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Labor</p>
                      </div>
                      <p className="text-sm font-bold tabular-nums" style={{ color: '#1F271B' }}>- Rs{totalLabor.toFixed(2)}</p>
                    </div>
                    <div className="min-w-[90px] text-right">
                      <div className="flex items-center justify-end gap-1.5 mb-1">
                        <span className="shrink-0 rounded-sm" style={legendSquareStyle} />
                        <p className="text-xs font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Expenses</p>
                      </div>
                      <p className="text-sm font-bold tabular-nums" style={{ color: '#1F271B' }}>- Rs{totalExpenses.toFixed(2)}</p>
                    </div>
                    <div className="min-w-[90px] text-right">
                      <div className="flex items-center justify-end gap-1.5 mb-1">
                        <span className="shrink-0 rounded-sm" style={{ width: 8, height: 8, backgroundColor: '#059669', borderRadius: 1 }} />
                        <p className="text-xs font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Profit</p>
                      </div>
                      <p className="text-sm font-bold tabular-nums px-2 py-1 rounded" style={{ color: profit < 0 ? '#DC2626' : '#059669', backgroundColor: '#E0F2F1' }}>= Rs{profit.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
          )}

            {/* Line Items Section — white card */}
            <div className="rounded-lg border p-4 bg-white" style={{ borderColor: '#EAEBED' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold" style={{ color: '#1F271B' }}>Line Items</h2>
              <button
                onClick={() => {
                  const opening = !isAddLineItemOpen
                  setIsAddLineItemOpen(!isAddLineItemOpen)
                  if (opening) {
                    setEditingLineItemIndex(null)
                    setEditingLineItemForm(null)
                  } else {
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

            {/* Add New Line Item Form */}
            {isAddLineItemOpen && (
              <div ref={lineItemNameDropdownRef} className="mb-4 p-4 border rounded-lg" style={{ borderColor: '#EAEBED', backgroundColor: '#F9FAFB' }}>
                <div className="space-y-3">
                  <div className="relative">
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={newLineItem.name}
                    onChange={(e) => {
                      setNewLineItem({ ...newLineItem, name: e.target.value })
                      setLineItemError('')
                    }}
                      placeholder="Type to search materials..."
                      className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all ${lineItemError ? 'border-red-500' : ''}`}
                      style={{ borderColor: lineItemError ? '#DC2626' : '#EAEBED', color: '#1F271B' }}
                    onFocus={(e) => {
                        if (!lineItemError) { e.currentTarget.style.borderColor = '#28AFB0'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)' }
                    }}
                    onBlur={(e) => {
                        if (!lineItemError) { e.currentTarget.style.borderColor = '#EAEBED'; e.currentTarget.style.boxShadow = 'none' }
                    }}
                  />
                  {lineItemError && (
                      <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#DC2626' }}><FiInfo size={12} />{lineItemError}</p>
                    )}
                    {(() => {
                      const filtered = mockMaterialsList.filter(m => m.name.toLowerCase().includes((newLineItem.name || '').toLowerCase()))
                      const hasExactMatch = filtered.some(m => m.name.toLowerCase() === (newLineItem.name || '').trim().toLowerCase())
                      const showCreateNew = (newLineItem.name || '').trim() !== '' && (filtered.length === 0 || !hasExactMatch)
                      const showDropdown = filtered.length > 0 || showCreateNew
                      if (!showDropdown || (newLineItem.name || '').trim() === '') return null
                      return (
                        <div className="absolute z-10 left-0 right-0 mt-1 bg-white border rounded shadow-lg max-h-48 overflow-y-auto" style={{ borderColor: '#EAEBED' }}>
                          {filtered.slice(0, 8).map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                setNewLineItem({ ...newLineItem, name: m.name, description: m.description || '', unitPrice: m.unitPrice })
                                setLineItemError('')
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
                                setIsAddProductModalOpen(true)
                              }}
                              className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 font-medium border-t"
                              style={{ color: '#28AFB0', borderColor: '#EAEBED' }}
                            >
                              <FiPlus size={16} style={{ color: '#28AFB0' }} />
                              Create new item
                            </button>
                  )}
                </div>
                      )
                    })()}
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>Description</label>
                    <textarea
                      value={newLineItem.description}
                      onChange={(e) => setNewLineItem({ ...newLineItem, description: e.target.value })}
                      placeholder="Enter description"
                      rows={3}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all resize-none"
                      style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Quantity</label>
                    <input
                      type="number"
                      value={newLineItem.quantity}
                        onChange={(e) => setNewLineItem({ ...newLineItem, quantity: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                      className="w-full px-2 py-2 border rounded text-sm text-center"
                      style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                    />
                  </div>
                  <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Unit cost</label>
                    <input
                      type="number"
                      value={newLineItem.unitCost}
                        onChange={(e) => setNewLineItem({ ...newLineItem, unitCost: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                      className="w-full px-2 py-2 border rounded text-sm text-center"
                      style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                    />
                  </div>
                  <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Unit price</label>
                    <input
                      type="number"
                      value={newLineItem.unitPrice}
                        onChange={(e) => setNewLineItem({ ...newLineItem, unitPrice: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                      className="w-full px-2 py-2 border rounded text-sm text-center"
                      style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                    />
                  </div>
                  <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Total</label>
                    <div className="px-2 py-2 border rounded text-sm text-center font-semibold" style={{ borderColor: '#EAEBED', backgroundColor: '#F3F4F6', color: '#1F271B' }}>
                      Rs{(newLineItem.quantity * newLineItem.unitPrice).toFixed(2)}
                    </div>
                  </div>
                </div>
                    </div>
                <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t" style={{ borderTopColor: '#EAEBED' }}>
                  <button
                    onClick={() => { setIsAddLineItemOpen(false); setNewLineItem({ name: '', description: '', quantity: 1, unitPrice: 0, unitCost: 0 }); setLineItemError('') }}
                    className="px-3 py-1.5 border rounded text-xs font-medium transition-all"
                    style={{ borderColor: '#EAEBED', color: '#1F271B', backgroundColor: 'white' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!newLineItem.name.trim()) { setLineItemError('Enter a line item name'); return }
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

            {/* Line Items table — only table, no duplicate cards above */}
            {editedLineItems.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b" style={{ borderBottomColor: '#EAEBED' }}>
                        <th className="text-left py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>PRODUCT / SERVICE</th>
                        <th className="text-right py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>QUANTITY</th>
                        <th className="text-right py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>
                          COST <FiInfo size={10} className="inline ml-0.5 opacity-70" title="Line item cost" />
                        </th>
                        <th className="text-right py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>
                          PRICE <FiInfo size={10} className="inline ml-0.5 opacity-70" title="Unit price" />
                        </th>
                        <th className="text-right py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>TOTAL</th>
                        <th className="w-10 py-2 px-2" aria-label="Actions" />
                      </tr>
                    </thead>
                    <tbody>
                      {editedLineItems.map((item: any, index: number) => (
                        editingLineItemIndex === index && editingLineItemForm ? (
                          <tr key={index} className="border-b" style={{ borderBottomColor: '#EAEBED' }}>
                            <td colSpan={6} className="p-0 align-top">
                              <div className="p-4 border rounded-lg" style={{ borderColor: '#EAEBED', backgroundColor: '#F9FAFB' }} onClick={(e) => e.stopPropagation()}>
                                <div className="space-y-3">
                                  <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>Name <span className="text-red-500">*</span></label>
                                    <input
                                      type="text"
                                      value={editingLineItemForm.name}
                                      onChange={(e) => setEditingLineItemForm({ ...editingLineItemForm, name: e.target.value })}
                                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm"
                                      style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>Description</label>
                                    <textarea
                                      value={editingLineItemForm.description}
                                      onChange={(e) => setEditingLineItemForm({ ...editingLineItemForm, description: e.target.value })}
                                      placeholder="Enter description"
                                      rows={3}
                                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm resize-none"
                                      style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                                    />
                                  </div>
                                  <div className="grid grid-cols-4 gap-2">
                                    <div>
                                      <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Quantity</label>
                                      <input
                                        type="number"
                                        value={editingLineItemForm.quantity}
                                        onChange={(e) => setEditingLineItemForm({ ...editingLineItemForm, quantity: parseFloat(e.target.value) || 0 })}
                                        min="0"
                                        step="0.01"
                                        className="w-full px-2 py-2 border rounded text-sm text-center"
                                        style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Unit cost</label>
                                      <input
                                        type="number"
                                        value={editingLineItemForm.unitCost}
                                        onChange={(e) => setEditingLineItemForm({ ...editingLineItemForm, unitCost: parseFloat(e.target.value) || 0 })}
                                        min="0"
                                        step="0.01"
                                        className="w-full px-2 py-2 border rounded text-sm text-center"
                                        style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Unit price</label>
                                      <input
                                        type="number"
                                        value={editingLineItemForm.unitPrice}
                                        onChange={(e) => setEditingLineItemForm({ ...editingLineItemForm, unitPrice: parseFloat(e.target.value) || 0 })}
                                        min="0"
                                        step="0.01"
                                        className="w-full px-2 py-2 border rounded text-sm text-center"
                                        style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>Total</label>
                                      <div className="px-2 py-2 border rounded text-sm text-center font-semibold" style={{ borderColor: '#EAEBED', backgroundColor: '#F3F4F6', color: '#1F271B' }}>
                                        Rs{(editingLineItemForm.quantity * editingLineItemForm.unitPrice).toFixed(2)}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-end gap-2 pt-3 border-t" style={{ borderTopColor: '#EAEBED' }}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditedLineItems(editedLineItems.filter((_, i) => i !== index))
                                        setEditingLineItemIndex(null)
                                        setEditingLineItemForm(null)
                                      }}
                                      className="px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5"
                                      style={{ backgroundColor: '#DC2626', color: 'white' }}
                                    >
                                      <FiTrash2 size={14} />
                                      Delete
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!editingLineItemForm.name.trim()) return
                                        const total = editingLineItemForm.quantity * editingLineItemForm.unitPrice
                                        const next = editedLineItems.map((li, i) => i === index ? { ...li, ...editingLineItemForm, total } : li)
                                        setEditedLineItems(next)
                                        setEditingLineItemIndex(null)
                                        setEditingLineItemForm(null)
                                      }}
                                      className="px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5"
                                      style={{ backgroundColor: '#28AFB0', color: 'white' }}
                                    >
                                      <FiCheckCircle size={14} />
                                      Save
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          <tr
                            key={index}
                            className="border-b align-top cursor-pointer transition-colors"
                            style={{ borderBottomColor: '#EAEBED' }}
                            onClick={() => {
                              setIsAddLineItemOpen(false)
                              setEditingLineItemIndex(index)
                              setEditingLineItemForm({
                                name: item.name,
                                description: item.description || '',
                                quantity: item.quantity,
                                unitCost: item.unitCost,
                                unitPrice: item.unitPrice,
                              })
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#F3F4F6'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = ''
                            }}
                          >
                            <td className="py-2 px-2" style={{ color: '#1F271B' }}>
                              <p className="font-semibold" style={{ color: '#28AFB0' }}>{item.name}</p>
                              {item.description && (
                                <p className="text-xs mt-0.5" style={{ color: '#1F271B', opacity: 0.7 }}>{item.description}</p>
                              )}
                            </td>
                            <td className="py-2 px-2 text-right tabular-nums" style={{ color: '#1F271B' }}>{item.quantity}</td>
                            <td className="py-2 px-2 text-right tabular-nums" style={{ color: '#1F271B' }}>Rs{(item.unitCost * item.quantity).toFixed(2)}</td>
                            <td className="py-2 px-2 text-right tabular-nums" style={{ color: '#1F271B' }}>Rs{item.unitPrice.toFixed(2)}</td>
                            <td className="py-2 px-2 text-right tabular-nums" style={{ color: '#1F271B' }}>Rs{item.total.toFixed(2)}</td>
                            <td className="py-2 px-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => setEditedLineItems(editedLineItems.filter((_, i) => i !== index))}
                                className="p-1.5 rounded transition-colors"
                                style={{ color: '#1F271B', opacity: 0.7 }}
                                onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.backgroundColor = '#FEE2E2' }}
                                onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.backgroundColor = 'transparent' }}
                                title="Delete line"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        )
                      ))}
                      {/* Summary rows: no PRICE column — Cost and Total only */}
                      <tr className="font-semibold border-t" style={{ borderTopColor: '#EAEBED' }}>
                        <td colSpan={3} className="py-2 px-2" style={{ color: '#1F271B' }}>Subtotal</td>
                        <td className="py-2 px-2 text-right tabular-nums" style={{ color: '#1F271B' }}>Rs{editedLineItems.reduce((sum: number, item: any) => sum + (item.unitCost * item.quantity), 0).toFixed(2)}</td>
                        <td className="py-2 px-2 text-right tabular-nums" style={{ color: '#1F271B' }}>Rs{editedLineItems.reduce((sum: number, item: any) => sum + item.total, 0).toFixed(2)}</td>
                        <td className="py-2 px-2" />
                      </tr>
                        <tr>
                          <td colSpan={3} className="py-2 px-2" style={{ color: '#1F271B' }}>
                            Discount{workorder.discount > 0 ? ` (${workorder.discountType === 'percentage' ? `${workorder.discount}%` : 'Amount'})` : ''}
                          </td>
                          <td className="py-2 px-2 text-right" style={{ color: '#1F271B' }}>—</td>
                          <td className="py-2 px-2 text-right" style={{ color: '#1F271B' }}>
                            {workorder.discount > 0
                              ? `-Rs${workorder.discountType === 'percentage'
                                ? ((editedLineItems.reduce((sum: number, item: any) => sum + item.total, 0) * workorder.discount / 100)).toFixed(2)
                                : workorder.discount.toFixed(2)}`
                              : '—'}
                          </td>
                          <td className="py-2 px-2" />
                        </tr>
                        <tr>
                          <td colSpan={3} className="py-2 px-2" style={{ color: '#1F271B' }}>Tax ({companyTaxRatePercent}%)</td>
                          <td className="py-2 px-2 text-right" style={{ color: '#1F271B' }}>—</td>
                          <td className="py-2 px-2 text-right tabular-nums" style={{ color: '#1F271B' }}>
                            Rs{(() => {
                              const st = editedLineItems.reduce((sum: number, item: any) => sum + item.total, 0)
                              const disc = workorder.discount > 0 ? (workorder.discountType === 'percentage' ? (st * workorder.discount / 100) : workorder.discount) : 0
                              const afterDisc = st - disc
                              return (afterDisc * companyTaxRatePercent / 100).toFixed(2)
                            })()}
                          </td>
                          <td className="py-2 px-2" />
                        </tr>
                      <tr className="font-bold border-t-2" style={{ borderTopColor: '#EAEBED' }}>
                        <td colSpan={3} className="py-2.5 px-2" style={{ color: '#1F271B' }}>Total</td>
                        <td className="py-2.5 px-2 text-right tabular-nums" style={{ color: '#1F271B' }}>Rs{editedLineItems.reduce((sum: number, item: any) => sum + (item.unitCost * item.quantity), 0).toFixed(2)}</td>
                        <td className="py-2.5 px-2 text-right tabular-nums" style={{ color: '#1F271B' }}>Rs{workorder.total.toFixed(2)}</td>
                        <td className="py-2.5 px-2" />
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setEditingLineItemIndex(null)
                      setEditingLineItemForm(null)
                      setIsAddLineItemOpen(true)
                      setNewLineItem({ name: '', description: '', quantity: 1, unitPrice: 0, unitCost: 0 })
                      setLineItemError('')
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
              </>
            ) : !isAddLineItemOpen ? (
              <p className="text-sm py-4 text-center" style={{ color: '#1F271B', opacity: 0.6 }}>No line items</p>
            ) : null}
          </div>

            {/* Expenses Section — white card */}
            <div className="rounded-lg border p-4 bg-white" style={{ borderColor: '#EAEBED' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold" style={{ color: '#1F271B' }}>Expenses</h2>
              <button
                onClick={() => {
                  setEditingExpenseIndex(null)
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
            <p className="text-sm mb-3" style={{ color: '#1F271B', opacity: 0.6 }}>
              Get an accurate picture of various job costs by recording expenses
            </p>
            {editedExpenses.length > 0 ? (
              <div className="border rounded-lg overflow-hidden" style={{ borderColor: '#EAEBED' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left" style={{ borderColor: '#EAEBED', backgroundColor: '#F9FAFB' }}>
                      <th className="py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Date</th>
                      <th className="py-2 px-2 font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Item</th>
                      <th className="py-2 px-2 font-medium text-right" style={{ color: '#1F271B', opacity: 0.7 }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editedExpenses.map((exp: any, index: number) => (
                      <tr
                        key={index}
                        className="border-b cursor-pointer transition-colors"
                        style={{ borderColor: '#EAEBED' }}
                        onClick={() => {
                          setEditingExpenseIndex(index)
                          setNewExpense({
                            date: (exp.date || new Date().toISOString().split('T')[0]).toString().slice(0, 10),
                            itemName: exp.itemName || '',
                            details: exp.details || '',
                            total: exp.total ?? exp.amount ?? 0,
                            linkedWorkorder: workorderId || (exp.linkedWorkorder ?? null),
                            invoiceNumber: exp.invoiceNumber || '',
                            attachment: null,
                          })
                          setIsAddExpenseOpen(true)
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '' }}
                      >
                        <td className="py-2 px-2" style={{ color: '#1F271B' }}>{exp.date ? format(new Date(exp.date), 'MMM d, yyyy') : '—'}</td>
                        <td className="py-2 px-2" style={{ color: '#1F271B' }}>{exp.itemName || '—'}</td>
                        <td className="py-2 px-2 text-right tabular-nums" style={{ color: '#1F271B' }}>Rs{(exp.total ?? exp.amount ?? 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
            </div>
          </div>

          {/* Payments Section — below Expenses */}
          <div id="payments" className="bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
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
                No payments recorded. Click &quot;Add Payment&quot; to record a payment.
              </p>
            )}
          </div>

          {/* Complete Summary — single value column (no PRICE column) */}
          <div className="rounded-lg border p-4 bg-white" style={{ borderColor: '#EAEBED' }}>
            <h2 className="text-sm font-semibold mb-4" style={{ color: '#1F271B' }}>Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span style={{ color: '#1F271B', opacity: 0.8 }}>Subtotal</span>
                <span className="tabular-nums" style={{ color: '#1F271B' }}>Rs{editedLineItems.reduce((sum: number, item: any) => sum + item.total, 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: '#1F271B', opacity: 0.8 }}>Discount{workorder.discount > 0 ? (workorder.discountType === 'percentage' ? ` (${workorder.discount}%)` : ' (Amount)') : ''}</span>
                <span className="tabular-nums" style={{ color: '#1F271B' }}>
                  {workorder.discount > 0
                    ? `-Rs${workorder.discountType === 'percentage'
                      ? ((editedLineItems.reduce((sum: number, item: any) => sum + item.total, 0) * workorder.discount / 100)).toFixed(2)
                      : workorder.discount.toFixed(2)}`
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: '#1F271B', opacity: 0.8 }}>Tax ({companyTaxRatePercent}%)</span>
                <span className="tabular-nums" style={{ color: '#1F271B' }}>
                  Rs{(() => {
                    const st = editedLineItems.reduce((sum: number, item: any) => sum + item.total, 0)
                    const disc = workorder.discount > 0 ? (workorder.discountType === 'percentage' ? (st * workorder.discount / 100) : workorder.discount) : 0
                    const afterDisc = st - disc
                    return (afterDisc * companyTaxRatePercent / 100).toFixed(2)
                  })()}
                </span>
              </div>
              <div className="flex justify-between items-center font-semibold">
                <span style={{ color: '#1F271B' }}>Total</span>
                <span className="tabular-nums" style={{ color: '#1F271B' }}>Rs{workorder.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: '#1F271B', opacity: 0.8 }}>Cost</span>
                <span className="tabular-nums" style={{ color: '#1F271B' }}>Rs{(editedLineItems.reduce((s: number, i: any) => s + (i.unitCost * i.quantity), 0) + totalLabor + totalExpenses).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: '#1F271B', opacity: 0.8 }}>Expenses</span>
                <span className="tabular-nums" style={{ color: '#1F271B' }}>Rs{totalExpenses.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: '#1F271B', opacity: 0.8 }}>Estimated Margin</span>
                <span className="tabular-nums" style={{ color: (workorder.total - (editedLineItems.reduce((s: number, i: any) => s + (i.unitCost * i.quantity), 0) + totalLabor + totalExpenses)) < 0 ? '#DC2626' : '#059669' }}>
                  Rs{(workorder.total - (editedLineItems.reduce((s: number, i: any) => s + (i.unitCost * i.quantity), 0) + totalLabor + totalExpenses)).toFixed(2)}
                </span>
              </div>
              <div className="my-4" style={{ borderTop: '2px dashed rgba(31, 39, 27, 0.4)' }} />
              {editedPayments.length > 0 && (
                <div className="pl-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span style={{ color: '#1F271B', opacity: 0.8 }}>Payments</span>
                    <span className="tabular-nums" style={{ color: '#1F271B' }}>Rs{totalPayments.toFixed(2)}</span>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center font-bold pt-2">
                <span style={{ color: '#1F271B' }}>Balance</span>
                <span className="tabular-nums" style={{ color: '#1F271B' }}>Rs{(workorder.total - totalPayments).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Quote Section - grouped with grey background, main heading "Quote", above Invoices */}
          <div className="rounded-lg border p-4 space-y-4" style={{ borderColor: '#EAEBED', backgroundColor: '#F3F4F6' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold" style={{ color: '#1F271B' }}>Quote</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={quoteRequired}
                  onChange={(e) => setQuoteRequired(e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: '#28AFB0' }}
                />
                <span className="text-sm font-medium" style={{ color: '#1F271B' }}>Quote required</span>
              </label>
            </div>
            <div className="rounded-lg border p-4 bg-white" style={{ borderColor: '#EAEBED' }}>
              <h3 className="text-sm font-semibold mb-2" style={{ color: '#1F271B' }}>Client message</h3>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>Client message</label>
              <textarea
                value={quoteClientMessage}
                onChange={(e) => setQuoteClientMessage(e.target.value)}
                placeholder="Description"
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
            <div className="rounded-lg border p-4 bg-white" style={{ borderColor: '#EAEBED' }}>
              <h3 className="text-sm font-semibold mb-2" style={{ color: '#1F271B' }}>Contract / Disclaimer</h3>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>Contract / Disclaimer</label>
              <textarea
                value={quoteTermsAndConditions}
                onChange={(e) => setQuoteTermsAndConditions(e.target.value)}
                placeholder="Description"
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
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyToAllFutureQuotes}
                  onChange={(e) => setApplyToAllFutureQuotes(e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: '#28AFB0' }}
                />
                <span className="text-sm font-medium" style={{ color: '#1F271B' }}>Apply to all future quotes</span>
              </label>
              <div className="flex justify-end mt-3">
                <button
                  type="button"
                  onClick={() => {
                    if (applyToAllFutureQuotes) {
                      quoteSettings.termsAndConditions = quoteTermsAndConditions
                      quoteSettings.clientMessage = quoteClientMessage
                    }
                    alert(applyToAllFutureQuotes
                      ? 'Quote section saved. Defaults in Settings have been updated for all future quotes.'
                      : 'Quote section saved for this workorder.')
                  }}
                  className="px-4 py-2 rounded text-sm font-medium text-white transition-colors"
                  style={{ backgroundColor: '#28AFB0' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E8A8B' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#28AFB0' }}
                >
                  Save
              </button>
              </div>
            </div>
          </div>

          {/* Invoice Section - same pattern as Quote: grey background, Client message + Contract/Disclaimer, Apply to all future invoices */}
          <div className="rounded-lg border p-4 space-y-4" style={{ borderColor: '#EAEBED', backgroundColor: '#F3F4F6' }}>
            <h2 className="text-sm font-semibold" style={{ color: '#1F271B' }}>Invoice</h2>
            <div className="rounded-lg border p-4 bg-white" style={{ borderColor: '#EAEBED' }}>
              <h3 className="text-sm font-semibold mb-2" style={{ color: '#1F271B' }}>Client message</h3>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>Client message</label>
              <textarea
                value={invoiceClientMessage}
                onChange={(e) => setInvoiceClientMessage(e.target.value)}
                placeholder="Description"
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
            <div className="rounded-lg border p-4 bg-white" style={{ borderColor: '#EAEBED' }}>
              <h3 className="text-sm font-semibold mb-2" style={{ color: '#1F271B' }}>Contract / Disclaimer</h3>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>Contract / Disclaimer</label>
              <textarea
                value={invoiceTermsAndConditions}
                onChange={(e) => setInvoiceTermsAndConditions(e.target.value)}
                placeholder="Description"
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
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyToAllFutureInvoices}
                  onChange={(e) => setApplyToAllFutureInvoices(e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: '#28AFB0' }}
                />
                <span className="text-sm font-medium" style={{ color: '#1F271B' }}>Apply to all future invoices</span>
                  </label>
              <div className="flex justify-end mt-3">
                          <button
                  type="button"
                  onClick={() => {
                    if (applyToAllFutureInvoices) {
                      invoiceSettings.termsAndConditions = invoiceTermsAndConditions
                      invoiceSettings.clientMessage = invoiceClientMessage
                    }
                    const wo = mockWorkorders.find(w => w.id === workorderId)
                    if (wo) {
                      const woAny = wo as Record<string, unknown>
                      woAny.internalNote = internalNote
                      woAny.invoiceInternalNote = invoiceInternalNote
                    }
                    alert(applyToAllFutureInvoices
                      ? 'Invoice section saved. Defaults in Settings have been updated for all future invoices.'
                      : 'Invoice section saved for this workorder.')
                  }}
                  className="px-4 py-2 rounded text-sm font-medium text-white transition-colors"
                  style={{ backgroundColor: '#28AFB0' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E8A8B' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#28AFB0' }}
                >
                  Save
                          </button>
                </div>
              </div>
          </div>

          {/* Attachments Section - first */}
          <div className="bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="text-sm font-semibold" style={{ color: '#1F271B' }}>Attachments</h2>
                <p className="text-xs mt-0.5" style={{ color: '#1F271B', opacity: 0.6 }}>
                  Include all attachments for your quote in one place
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>
                  {attachmentFiles.length} of 10 uploaded
                </span>
                <button
                  type="button"
                  onClick={() => setAttachmentFiles([])}
                  className="p-1.5 rounded transition-colors"
                  style={{ color: '#1F271B', opacity: 0.7 }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.backgroundColor = '#FEE2E2' }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.backgroundColor = 'transparent' }}
                  title="Clear attachments"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
            <div
              className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 mt-3"
              style={{ borderColor: '#EAEBED', backgroundColor: '#FAFAFA' }}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#28AFB0' }}
              onDragLeave={(e) => { e.currentTarget.style.borderColor = '#EAEBED' }}
              onDrop={(e) => {
                e.preventDefault()
                e.currentTarget.style.borderColor = '#EAEBED'
                const files = Array.from(e.dataTransfer.files)
                setAttachmentFiles((prev) => [...prev, ...files].slice(0, 10))
              }}
            >
              <input
                ref={attachmentInputRef}
                type="file"
                multiple
                accept=".jpeg,.jpg,.png,.heic,.pdf,.docx,image/jpeg,image/png,image/heic,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => {
                  const files = e.target.files ? Array.from(e.target.files) : []
                  setAttachmentFiles((prev) => [...prev, ...files].slice(0, 10))
                  e.target.value = ''
                }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => attachmentInputRef.current?.click()}
                disabled={attachmentFiles.length >= 10}
                className="px-4 py-2 border rounded-lg text-sm font-medium transition-colors"
                style={{ borderColor: '#28AFB0', color: '#28AFB0', backgroundColor: 'rgba(40, 175, 176, 0.08)' }}
                onMouseEnter={(e) => { if (attachmentFiles.length < 10) { e.currentTarget.style.backgroundColor = 'rgba(40, 175, 176, 0.15)' } }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(40, 175, 176, 0.08)' }}
              >
                Select files
              </button>
              <p className="text-xs" style={{ color: '#1F271B', opacity: 0.6 }}>
                JPEG, PNG, HEIC, PDF, DOCX, up to 50MB each
              </p>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setAttachmentFiles([])}
                className="px-4 py-2 border rounded-lg text-sm font-medium transition-colors"
                style={{ borderColor: '#28AFB0', color: '#28AFB0', backgroundColor: 'white' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => alert('Attachments saved. (Static UI)')}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: '#28AFB0' }}
              >
                Save
              </button>
            </div>
          </div>

          {/* Internal Notes Section - after Attachments */}
          <div className="bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
            <h2 className="text-sm font-semibold mb-1" style={{ color: '#1F271B' }}>Internal notes</h2>
            <p className="text-xs mb-3" style={{ color: '#1F271B', opacity: 0.6 }}>
              Internal notes will only be seen by your team
            </p>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>Internal notes</label>
            <textarea
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="Note details"
              rows={4}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all resize-none"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
            />
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Work Order Details - Jobber-style table */}
          <div className="bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: '#1F271B' }}>Work Order Details</h2>
            <div className="divide-y" style={{ borderColor: '#EAEBED' }}>
              {/* Created at */}
              <div className="flex justify-between items-center py-2.5 first:pt-0">
                <span className="text-xs font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Created at</span>
                <span className="text-xs" style={{ color: '#1F271B' }}>
                  {(workorder as any).createdAt
                    ? format(new Date((workorder as any).createdAt), 'MMM dd, yyyy')
                    : '—'}
                </span>
              </div>
              {/* Last Quote */}
              <div className="flex justify-between items-center py-2.5">
                <span className="text-xs font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Last Quote</span>
                {workorder.quoteNumber ? (
                  <a href="#" className="text-xs flex items-center gap-1 text-blue-600 hover:underline">
                    <FiFileText size={12} />
                    <span>{workorder.quoteNumber}.pdf</span>
                  </a>
                ) : (
                  <span className="text-xs" style={{ color: '#1F271B', opacity: 0.6 }}>—</span>
                )}
                </div>
              {/* Quote sent */}
              <div className="flex justify-between items-center py-2.5">
                <span className="text-xs font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Quote sent</span>
                  {workorder.quoteDateSent ? (
                  <span className="text-xs flex items-center gap-1" style={{ color: '#1F271B' }}>
                      <FiCheckCircle size={12} style={{ color: '#059669' }} />
                        {format(new Date(workorder.quoteDateSent), 'MMM dd, yyyy')}
                      </span>
                  ) : (
                    <span className="text-xs" style={{ color: '#1F271B', opacity: 0.6 }}>Not sent</span>
                  )}
                </div>
              {/* Quote WhatsApp status */}
              <div className="flex justify-between items-center py-2.5">
                <span className="text-xs font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Quote WhatsApp status</span>
                <span
                  className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: workorder.quoteWhatsappStatus === 'sent' ? 'rgba(40, 175, 176, 0.2)' : '#F3F4F6',
                    color: workorder.quoteWhatsappStatus === 'sent' ? '#1E8A8B' : '#1F271B',
                  }}
                >
                  {workorder.quoteWhatsappStatus || 'Not sent'}
                </span>
              </div>
              {/* Last Invoice */}
              <div className="flex justify-between items-center py-2.5">
                <span className="text-xs font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Last Invoice</span>
                {workorder.invoiceNumber ? (
                  <a href="#" className="text-xs flex items-center gap-1 text-blue-600 hover:underline">
                    <FiFileText size={12} />
                    <span>{workorder.invoiceNumber}.pdf</span>
                  </a>
                ) : (
                  <span className="text-xs" style={{ color: '#1F271B', opacity: 0.6 }}>—</span>
                )}
              </div>
              {/* Invoice sent */}
              <div className="flex justify-between items-center py-2.5">
                <span className="text-xs font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Invoice sent</span>
                  {workorder.invoiceDateSent ? (
                  <span className="text-xs flex items-center gap-1" style={{ color: '#1F271B' }}>
                      <FiCheckCircle size={12} style={{ color: '#059669' }} />
                        {format(new Date(workorder.invoiceDateSent), 'MMM dd, yyyy')}
                      </span>
                  ) : (
                    <span className="text-xs" style={{ color: '#1F271B', opacity: 0.6 }}>Not sent</span>
                  )}
                </div>
              {/* Invoice WhatsApp status */}
              <div className="flex justify-between items-center py-2.5">
                <span className="text-xs font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Invoice WhatsApp status</span>
                <span
                  className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: workorder.invoiceWhatsappStatus === 'sent' ? 'rgba(40, 175, 176, 0.2)' : '#F3F4F6',
                    color: workorder.invoiceWhatsappStatus === 'sent' ? '#1E8A8B' : '#1F271B',
                  }}
                >
                  {workorder.invoiceWhatsappStatus || 'Not sent'}
                </span>
              </div>
              {/* Last Work REPORT */}
              <div className="flex justify-between items-center py-2.5">
                <span className="text-xs font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Last Work REPORT</span>
                {jobReportPdfUrl ? (
                  <a href={jobReportPdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1 text-blue-600 hover:underline">
                    <FiFileText size={12} />
                    <span>Job report.pdf</span>
                  </a>
                ) : (
                  <span className="text-xs" style={{ color: '#1F271B', opacity: 0.6 }}>—</span>
                )}
                </div>
              {/* Work report sent */}
              <div className="flex justify-between items-center py-2.5">
                <span className="text-xs font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Work report sent</span>
                {(() => {
                  const a = jobReportSentAt ? new Date(jobReportSentAt).getTime() : 0
                  const b = tallyWorkReportSentAt ? new Date(tallyWorkReportSentAt).getTime() : 0
                  const latest = a >= b ? jobReportSentAt : tallyWorkReportSentAt
                  return latest ? (
                    <span className="text-xs flex items-center gap-1" style={{ color: '#1F271B' }}>
                      <FiCheckCircle size={12} style={{ color: '#059669' }} />
                      {format(new Date(latest), 'MMM dd, yyyy')}
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: '#1F271B', opacity: 0.6 }}>Not sent</span>
                  )
                })()}
                </div>
              {/* Job Follow sent */}
              <div className="flex justify-between items-center py-2.5 last:pb-0">
                <span className="text-xs font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Job Follow sent</span>
                {(workorder as any).jobFollowSentAt ? (
                  <span className="text-xs flex items-center gap-1" style={{ color: '#1F271B' }}>
                    <FiCheckCircle size={12} style={{ color: '#059669' }} />
                    {format(new Date((workorder as any).jobFollowSentAt), 'MMM dd, yyyy')}
                  </span>
                ) : (
                  <span className="text-xs" style={{ color: '#1F271B', opacity: 0.6 }}>Not sent</span>
                )}
                </div>
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

          {/* Customer reminder (same as Client View – reminder is at customer level) */}
          {workorder && (
            <div className="bg-white rounded-lg shadow-md border p-4 mt-3" style={{ borderColor: '#EAEBED' }}>
              <h2 className="text-sm font-semibold mb-0.5" style={{ color: '#1F271B' }}>Customer reminder</h2>
              <p className="text-xs mb-2.5" style={{ color: '#1F271B', opacity: 0.7 }}>Remind me to follow up on this client in future date</p>
              {(() => {
                const clientId = workorder.clientId
                const reminder = getReminder(clientId)
                const reminderDue = reminder ? isReminderDue(reminder) : false
                if (!reminder) {
                  return (
                    <button
                      type="button"
                      onClick={() => { setEditingReminder(false); setIsSetReminderOpen(true) }}
                      className="w-full px-3 py-2 border border-dashed rounded text-xs font-medium transition-colors"
                      style={{ borderColor: '#EAEBED', color: '#1F271B', backgroundColor: 'white' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB'; e.currentTarget.style.borderColor = '#28AFB0' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.borderColor = '#EAEBED' }}
                    >
                      Set customer reminder
                    </button>
                  )
                }
                return (
                  <div className="space-y-2">
                    <p className="text-xs" style={{ color: reminderDue ? '#DC2626' : '#1F271B' }}>
                      {format(new Date(reminder.date + (reminder.time ? `T${reminder.time}` : '')), 'MMM d, yyyy · HH:mm')}
                      {reminder.note && ` · ${reminder.note}`}
                    </p>
                    {reminderDue && (
                      <p className="text-xs font-medium" style={{ color: '#DC2626' }}>Status: Follow up</p>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => { setEditingReminder(true); setIsSetReminderOpen(true) }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors"
                        style={{ color: '#1F271B', border: '1px solid #EAEBED' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                      >
                        <FiEdit size={10} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteReminder(clientId)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors"
                        style={{ color: '#DC2626', border: '1px solid #EAEBED' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FEF2F2' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                      >
                        <FiTrash2 size={10} />
                        Delete
                      </button>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Booking confirmation modal */}
      {isBookingConfirmationModalOpen && workorder && client && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col" style={{ borderColor: '#EAEBED' }}>
            <div className="flex items-center justify-between p-3 border-b" style={{ borderBottomColor: '#EAEBED' }}>
              <h2 className="text-base font-semibold" style={{ color: '#1F271B' }}>
                {bookingConfirmationSent || (workorder as any).bookingConfirmationSent ? 'Resend booking confirmation' : 'Booking confirmation'}
              </h2>
              <button
                onClick={() => setIsBookingConfirmationModalOpen(false)}
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
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>To</label>
                <input
                  type="email"
                  value={client.email || ''}
                  disabled
                  className="w-full px-2.5 py-1.5 border rounded text-sm bg-gray-100"
                  style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Subject</label>
                <input
                  type="text"
                  value={bookingSubject}
                  onChange={(e) => setBookingSubject(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded text-sm"
                  style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Message</label>
                <textarea
                  value={bookingMessage}
                  onChange={(e) => setBookingMessage(e.target.value)}
                  rows={8}
                  className="w-full px-2.5 py-1.5 border rounded text-sm resize-y"
                  style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                />
              </div>
              <div className="space-y-2 pt-1 border-t" style={{ borderColor: '#EAEBED' }}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={bookingIncludeTeamPictures} onChange={(e) => setBookingIncludeTeamPictures(e.target.checked)} className="rounded" />
                  <span className="text-sm" style={{ color: '#1F271B' }}>Include team pictures</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={bookingSendMeCopy} onChange={(e) => setBookingSendMeCopy(e.target.checked)} className="rounded" />
                  <span className="text-sm" style={{ color: '#1F271B' }}>Send me a copy</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={bookingSendWhatsApp} onChange={(e) => setBookingSendWhatsApp(e.target.checked)} className="rounded" />
                  <span className="text-sm" style={{ color: '#1F271B' }}>Send via WhatsApp</span>
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-3 border-t" style={{ borderColor: '#EAEBED' }}>
              <button
                onClick={() => setIsBookingConfirmationModalOpen(false)}
                className="px-3 py-1.5 rounded text-sm font-medium border"
                style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  ;(workorder as any).bookingConfirmationSent = true
                  setBookingConfirmationSent(true)
                  setIsBookingConfirmationModalOpen(false)
                }}
                className="px-3 py-1.5 rounded text-sm font-medium text-white"
                style={{ backgroundColor: '#28AFB0' }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Update Expense Modal — Linked Work order hidden when adding from work order */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col" style={{ borderColor: '#EAEBED' }}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b" style={{ borderBottomColor: '#EAEBED' }}>
              <h2 className="text-base font-semibold" style={{ color: '#1F271B' }}>
                {editingExpenseIndex !== null ? 'Update Expense' : 'Add Expense'}
              </h2>
              <button
                onClick={() => {
                  setIsAddExpenseOpen(false)
                  setEditingExpenseIndex(null)
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

              {/* Linked Work order — only when not adding from a work order (e.g. standalone expense) */}
              {!workorderId && (
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
                  </div>
                </div>
              )}

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
            <div className="flex items-center justify-between gap-2 p-3 border-t" style={{ borderTopColor: '#EAEBED' }}>
              <div className="flex items-center gap-2">
                {editingExpenseIndex !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditedExpenses(editedExpenses.filter((_, i) => i !== editingExpenseIndex))
                      setIsAddExpenseOpen(false)
                      setEditingExpenseIndex(null)
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
                    className="px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5"
                    style={{ backgroundColor: '#DC2626', color: 'white' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#B91C1C' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#DC2626' }}
                  >
                    <FiTrash2 size={14} />
                    Delete
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsAddExpenseOpen(false)
                    setEditingExpenseIndex(null)
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
                      const payload = {
                        date: newExpense.date,
                        itemName: newExpense.itemName,
                        details: newExpense.details,
                        total: newExpense.total,
                        amount: newExpense.total,
                        linkedWorkorder: workorderId || newExpense.linkedWorkorder,
                        invoiceNumber: newExpense.invoiceNumber,
                      }
                      if (editingExpenseIndex !== null) {
                        setEditedExpenses(editedExpenses.map((e, i) => i === editingExpenseIndex ? payload : e))
                      } else {
                        setEditedExpenses([...editedExpenses, payload])
                      }
                      setIsAddExpenseOpen(false)
                      setEditingExpenseIndex(null)
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
                  <span>{editingExpenseIndex !== null ? 'Save' : 'Save Expense'}</span>
                </button>
              </div>
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

      <AddProductServiceModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        initialName={(newLineItem.name || '').trim()}
        onSave={(data: NewProductServiceData) => {
          setNewLineItem((prev) => ({
            ...prev,
            name: data.name,
            description: data.description,
            unitPrice: data.unitPrice,
          }))
          setLineItemError('')
          setIsAddProductModalOpen(false)
        }}
      />

      {sendEmailModalType !== null && (
        <SendEmailModal
          isOpen={true}
          onClose={() => { setSendEmailModalType(null); setSendingTallyWorkReport(false) }}
          type={sendEmailModalType}
          workorderId={workorderId}
          workorderAttachments={attachmentFiles}
          onAddWorkorderAttachment={(file) => setAttachmentFiles(prev => [...prev, file].slice(0, 10))}
          onSend={() => {
            if (sendEmailModalType === 'work-order-report') {
              const sentAt = new Date().toISOString()
              const wo = mockWorkorders.find(w => w.id === workorderId)
              if (sendingTallyWorkReport) {
                setTallyWorkReportSentAt(sentAt)
                if (wo) (wo as any).tallyWorkReportSentAt = sentAt
                setSendingTallyWorkReport(false)
                alert('Work report (from Tally) sent successfully!')
              } else {
                setJobReportSentAt(sentAt)
                if (wo) (wo as any).jobReportSentAt = sentAt
                alert('Work order report sent successfully!')
              }
              setSendEmailModalType(null)
            } else if (sendEmailModalType === 'job-follow') {
              const sentAt = new Date().toISOString()
              const wo = mockWorkorders.find(w => w.id === workorderId)
              if (wo) (wo as Record<string, unknown>).jobFollowSentAt = sentAt
              setSendEmailModalType(null)
              alert('Job follow-up sent successfully!')
            } else {
              alert(sendEmailModalType === 'quote' ? 'Quote sent successfully!' : 'Invoice sent successfully!')
            }
          }}
        />
      )}
      {isCreateJobReportModalOpen && (
        <CreateJobReportModal
            isOpen={isCreateJobReportModalOpen}
            onClose={() => setIsCreateJobReportModalOpen(false)}
            workorderTitle={workorder?.title}
            onSave={(report) => {
              const url = `/reports/job-${workorderId}.pdf`
              setJobReportPdfUrl(url)
              const wo = mockWorkorders.find(w => w.id === workorderId)
              if (wo) (wo as any).jobReportPdfUrl = url
              setIsCreateJobReportModalOpen(false)
            }}
          />
      )}
      {workorder && (
        <SetCustomerReminderModal
          isOpen={isSetReminderOpen}
          onClose={() => { setIsSetReminderOpen(false); setEditingReminder(false) }}
          clientId={workorder.clientId}
          initialReminder={editingReminder ? getReminder(workorder.clientId) : null}
          onSave={(r) => { setReminder(workorder.clientId, r); setIsSetReminderOpen(false); setEditingReminder(false) }}
        />
      )}
    </div>
  )
}
