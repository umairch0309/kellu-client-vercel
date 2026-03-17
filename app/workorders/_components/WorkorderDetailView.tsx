'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { mockClients, mockWorkorders, quoteSettings, invoiceSettings } from '@/data/mockData'
import { useClientReminders } from '@/context/ClientRemindersContext'
import AddProductServiceModal, { type NewProductServiceData } from './AddProductServiceModal'
import SendEmailModal, { type SendEmailModalType } from './SendEmailModal'
import CreateJobReportModal from './CreateJobReportModal'
import SetCustomerReminderModal from '../../clients/_components/SetCustomerReminderModal'
import WorkorderDetailHeader from './WorkorderDetailHeader'
import JobDetailsCard from './JobDetailsCard'
import ProfitabilityCard from './ProfitabilityCard'
import LineItemsSection from './LineItemsSection'
import ExpensesSection from './ExpensesSection'
import PaymentsSection from './PaymentsSection'
import SummaryCard from './SummaryCard'
import QuoteSection from './QuoteSection'
import InvoiceSection from './InvoiceSection'
import AttachmentsSection from './AttachmentsSection'
import InternalNotesSection from './InternalNotesSection'
import WorkorderDetailsSidebar from './WorkorderDetailsSidebar'
import BookingConfirmationModal from './BookingConfirmationModal'
import AddExpenseModal from './AddExpenseModal'
import AddPaymentModal from './AddPaymentModal'
import type { LineItemForm, ExpenseForm, PaymentForm } from './workorderDetailTypes'

interface WorkorderDetailViewProps {
  workorderId: number
}

const emptyExpense: ExpenseForm = { date: new Date().toISOString().split('T')[0], itemName: '', details: '', total: 0, linkedWorkorder: null, invoiceNumber: '', attachment: null }
const emptyPayment: PaymentForm = { date: new Date().toISOString().split('T')[0], amount: 0, method: 'Cash', reference: '', notes: '' }

export default function WorkorderDetailView({ workorderId }: WorkorderDetailViewProps) {
  const router = useRouter()
  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState(false)
  const [isAddLineItemOpen, setIsAddLineItemOpen] = useState(false)
  const [internalNote, setInternalNote] = useState('')
  const [showProfitability, setShowProfitability] = useState(true)
  const [newLineItem, setNewLineItem] = useState<LineItemForm>({ name: '', description: '', quantity: 1, unitPrice: 0, unitCost: 0 })
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
  const [newExpense, setNewExpense] = useState<ExpenseForm>(emptyExpense)
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false)
  const [editingPaymentIndex, setEditingPaymentIndex] = useState<number | null>(null)
  const [editedPayments, setEditedPayments] = useState<any[]>([])
  const [newPayment, setNewPayment] = useState<PaymentForm>(emptyPayment)
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (quoteMarkAsRef.current && !quoteMarkAsRef.current.contains(e.target as Node)) setQuoteMarkAsOpen(false)
    }
    if (quoteMarkAsOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [quoteMarkAsOpen])

  useEffect(() => {
    setAttachmentFiles([new File([], 'Quote.pdf', { type: 'application/pdf' }), new File([], 'Invoice.pdf', { type: 'application/pdf' }), new File([], 'Work order summary.pdf', { type: 'application/pdf' })])
  }, [workorderId])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreActionsRef.current && !moreActionsRef.current.contains(e.target as Node)) setIsMoreActionsOpen(false)
    }
    if (isMoreActionsOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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
  const totalExpenses = editedExpenses.length > 0 ? editedExpenses.reduce((sum: number, exp: any) => sum + (exp.total ?? exp.amount ?? 0), 0) : 0
  const totalLabor = (workorder as any).labor ?? 0
  const profit = totalLineItemPrice - totalLineItemCost - totalLabor - totalExpenses
  const profitMargin = totalLineItemPrice > 0 ? ((profit / totalLineItemPrice) * 100).toFixed(0) : '0'
  const legendSquareStyle = { width: 8, height: 8, backgroundColor: '#7DD3FC', borderRadius: 1 }
  const totalPayments = editedPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
  const invoiceTotal = workorder.total || totalLineItemPrice
  const isInvoicePaid = totalPayments >= invoiceTotal && invoiceTotal > 0

  const handleQuoteStatusChange = (status: string) => {
    const wo = mockWorkorders.find(w => w.id === workorderId) as any
    if (wo) wo.quoteStatus = status
  }
  const handleQuoteSave = () => {
    if (applyToAllFutureQuotes) {
      quoteSettings.termsAndConditions = quoteTermsAndConditions
      quoteSettings.clientMessage = quoteClientMessage
    }
    alert(applyToAllFutureQuotes ? 'Quote section saved. Defaults in Settings have been updated for all future quotes.' : 'Quote section saved for this workorder.')
  }
  const handleInvoiceSave = () => {
    if (applyToAllFutureInvoices) {
      invoiceSettings.termsAndConditions = invoiceTermsAndConditions
      invoiceSettings.clientMessage = invoiceClientMessage
    }
    const wo = mockWorkorders.find(w => w.id === workorderId)
    if (wo) {
      (wo as any).internalNote = internalNote
      ;(wo as any).invoiceInternalNote = invoiceInternalNote
    }
    alert(applyToAllFutureInvoices ? 'Invoice section saved. Defaults in Settings have been updated for all future invoices.' : 'Invoice section saved for this workorder.')
  }
  const resetExpenseForm = () => {
    setNewExpense(emptyExpense)
    setEditingExpenseIndex(null)
    setIsAddExpenseOpen(false)
  }
  const resetPaymentForm = () => {
    setNewPayment(emptyPayment)
    setEditingPaymentIndex(null)
    setIsAddPaymentOpen(false)
  }

  return (
    <div className="space-y-4" style={{ backgroundColor: 'white', minHeight: '100vh', padding: '1rem 0' }}>
      <WorkorderDetailHeader
        workorderId={workorderId}
        workorder={workorder}
        onBookingConfirmation={() => setIsBookingConfirmationModalOpen(true)}
        onEdit={() => router.push(`/workorders/${workorderId}/edit`)}
        onSendQuote={() => { setSendEmailModalType('quote'); setIsMoreActionsOpen(false) }}
        onSendInvoice={() => { setSendEmailModalType('invoice'); setIsMoreActionsOpen(false) }}
        onSendJobFollow={() => { setSendEmailModalType('job-follow'); setIsMoreActionsOpen(false) }}
        isMoreActionsOpen={isMoreActionsOpen}
        setIsMoreActionsOpen={setIsMoreActionsOpen}
        moreActionsRef={moreActionsRef}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <JobDetailsCard workorder={workorder} client={client!} editedQuoteStatus={editedQuoteStatus} setEditedQuoteStatus={setEditedQuoteStatus} quoteMarkAsOpen={quoteMarkAsOpen} setQuoteMarkAsOpen={setQuoteMarkAsOpen} quoteMarkAsRef={quoteMarkAsRef} onQuoteStatusChange={handleQuoteStatusChange} isInvoicePaid={isInvoicePaid} />

          <div className="rounded-lg border p-4 space-y-4" style={{ borderColor: '#EAEBED', backgroundColor: '#F3F4F6' }}>
            <ProfitabilityCard showProfitability={showProfitability} setShowProfitability={setShowProfitability} totalLineItemPrice={totalLineItemPrice} totalLineItemCost={totalLineItemCost} totalLabor={totalLabor} totalExpenses={totalExpenses} profit={profit} profitMargin={profitMargin} legendSquareStyle={legendSquareStyle} />
            <LineItemsSection workorder={workorder} editedLineItems={editedLineItems} setEditedLineItems={setEditedLineItems} isAddLineItemOpen={isAddLineItemOpen} setIsAddLineItemOpen={setIsAddLineItemOpen} newLineItem={newLineItem} setNewLineItem={setNewLineItem} lineItemError={lineItemError} setLineItemError={setLineItemError} editingLineItemIndex={editingLineItemIndex} setEditingLineItemIndex={setEditingLineItemIndex} editingLineItemForm={editingLineItemForm} setEditingLineItemForm={setEditingLineItemForm} lineItemNameDropdownRef={lineItemNameDropdownRef} onOpenAddProductModal={() => setIsAddProductModalOpen(true)} />
            <ExpensesSection workorderId={workorderId} editedExpenses={editedExpenses} onAddExpense={() => { setEditingExpenseIndex(null); setNewExpense({ ...emptyExpense, linkedWorkorder: workorderId || null }); setIsAddExpenseOpen(true) }} onEditExpense={(index, exp) => { setEditingExpenseIndex(index); setNewExpense({ date: (exp.date || new Date().toISOString().split('T')[0]).toString().slice(0, 10), itemName: exp.itemName || '', details: exp.details || '', total: exp.total ?? exp.amount ?? 0, linkedWorkorder: workorderId || (exp.linkedWorkorder ?? null), invoiceNumber: exp.invoiceNumber || '', attachment: null }); setIsAddExpenseOpen(true) }} />
          </div>

          <PaymentsSection editedPayments={editedPayments} totalPayments={totalPayments} isInvoicePaid={isInvoicePaid} invoiceTotal={invoiceTotal} onAddPayment={() => { setNewPayment(emptyPayment); setEditingPaymentIndex(null); setIsAddPaymentOpen(true) }} onEditPayment={(index, payment) => { setNewPayment({ ...payment }); setEditingPaymentIndex(index); setIsAddPaymentOpen(true) }} onDeletePayment={(index) => setEditedPayments(editedPayments.filter((_, i) => i !== index))} />

          <SummaryCard workorder={workorder} editedLineItems={editedLineItems} totalLabor={totalLabor} totalExpenses={totalExpenses} totalPayments={totalPayments} />

          <QuoteSection quoteClientMessage={quoteClientMessage} setQuoteClientMessage={setQuoteClientMessage} quoteTermsAndConditions={quoteTermsAndConditions} setQuoteTermsAndConditions={setQuoteTermsAndConditions} quoteRequired={quoteRequired} setQuoteRequired={setQuoteRequired} applyToAllFutureQuotes={applyToAllFutureQuotes} setApplyToAllFutureQuotes={setApplyToAllFutureQuotes} onSave={handleQuoteSave} />
          <InvoiceSection workorderId={workorderId} invoiceClientMessage={invoiceClientMessage} setInvoiceClientMessage={setInvoiceClientMessage} invoiceTermsAndConditions={invoiceTermsAndConditions} setInvoiceTermsAndConditions={setInvoiceTermsAndConditions} applyToAllFutureInvoices={applyToAllFutureInvoices} setApplyToAllFutureInvoices={setApplyToAllFutureInvoices} onSave={handleInvoiceSave} />
          <AttachmentsSection attachmentFiles={attachmentFiles} setAttachmentFiles={setAttachmentFiles} attachmentInputRef={attachmentInputRef} />
          <InternalNotesSection internalNote={internalNote} setInternalNote={setInternalNote} />
        </div>

        <div className="lg:col-span-1">
          <WorkorderDetailsSidebar workorder={workorder} jobReportPdfUrl={jobReportPdfUrl} jobReportSentAt={jobReportSentAt} tallyWorkReportSentAt={tallyWorkReportSentAt} getReminder={getReminder} isReminderDue={isReminderDue} onSetReminderOpen={() => { setEditingReminder(false); setIsSetReminderOpen(true) }} onEditReminder={() => { setEditingReminder(true); setIsSetReminderOpen(true) }} deleteReminder={deleteReminder} />
        </div>
      </div>

      <BookingConfirmationModal isOpen={isBookingConfirmationModalOpen} onClose={() => setIsBookingConfirmationModalOpen(false)} workorder={workorder} client={client!} bookingSubject={bookingSubject} setBookingSubject={setBookingSubject} bookingMessage={bookingMessage} setBookingMessage={setBookingMessage} bookingSendMeCopy={bookingSendMeCopy} setBookingSendMeCopy={setBookingSendMeCopy} bookingSendWhatsApp={bookingSendWhatsApp} setBookingSendWhatsApp={setBookingSendWhatsApp} bookingIncludeTeamPictures={bookingIncludeTeamPictures} setBookingIncludeTeamPictures={setBookingIncludeTeamPictures} onSend={() => { (workorder as any).bookingConfirmationSent = true; setBookingConfirmationSent(true); setIsBookingConfirmationModalOpen(false) }} isResend={bookingConfirmationSent || !!(workorder as any).bookingConfirmationSent} />

      <AddExpenseModal isOpen={isAddExpenseOpen} onClose={() => setIsAddExpenseOpen(false)} workorderId={workorderId} editingExpenseIndex={editingExpenseIndex} newExpense={newExpense} setNewExpense={setNewExpense} onSave={(payload) => { if (editingExpenseIndex !== null) setEditedExpenses(editedExpenses.map((e, i) => i === editingExpenseIndex ? payload : e)); else setEditedExpenses([...editedExpenses, payload]); resetExpenseForm() }} onDelete={() => { setEditedExpenses(editedExpenses.filter((_, i) => i !== editingExpenseIndex)); resetExpenseForm() }} resetForm={resetExpenseForm} />
      <AddPaymentModal isOpen={isAddPaymentOpen} onClose={() => setIsAddPaymentOpen(false)} editingPaymentIndex={editingPaymentIndex} newPayment={newPayment} setNewPayment={setNewPayment} onSave={(payment) => { if (editingPaymentIndex !== null) { const next = [...editedPayments]; next[editingPaymentIndex] = payment; setEditedPayments(next) } else setEditedPayments([...editedPayments, payment]); resetPaymentForm() }} resetForm={resetPaymentForm} />

      <AddProductServiceModal isOpen={isAddProductModalOpen} onClose={() => setIsAddProductModalOpen(false)} initialName={(newLineItem.name || '').trim()} onSave={(data: NewProductServiceData) => { setNewLineItem(prev => ({ ...prev, name: data.name, description: data.description, unitPrice: data.unitPrice })); setLineItemError(''); setIsAddProductModalOpen(false) }} />
      {sendEmailModalType !== null && (
        <SendEmailModal isOpen={true} onClose={() => { setSendEmailModalType(null); setSendingTallyWorkReport(false) }} type={sendEmailModalType} workorderId={workorderId} workorderAttachments={attachmentFiles} onAddWorkorderAttachment={(file) => setAttachmentFiles(prev => [...prev, file].slice(0, 10))} onSend={() => { if (sendEmailModalType === 'work-order-report') { const sentAt = new Date().toISOString(); const wo = mockWorkorders.find(w => w.id === workorderId); if (sendingTallyWorkReport) { setTallyWorkReportSentAt(sentAt); if (wo) (wo as any).tallyWorkReportSentAt = sentAt; setSendingTallyWorkReport(false); alert('Work report (from Tally) sent successfully!') } else { setJobReportSentAt(sentAt); if (wo) (wo as any).jobReportSentAt = sentAt; alert('Work order report sent successfully!') }; setSendEmailModalType(null) } else if (sendEmailModalType === 'job-follow') { const sentAt = new Date().toISOString(); const wo = mockWorkorders.find(w => w.id === workorderId); if (wo) (wo as any).jobFollowSentAt = sentAt; setSendEmailModalType(null); alert('Job follow-up sent successfully!') } else { alert(sendEmailModalType === 'quote' ? 'Quote sent successfully!' : 'Invoice sent successfully!') } }} />
      )}
      {isCreateJobReportModalOpen && <CreateJobReportModal isOpen={isCreateJobReportModalOpen} onClose={() => setIsCreateJobReportModalOpen(false)} workorderTitle={workorder?.title} onSave={(report) => { const url = `/reports/job-${workorderId}.pdf`; setJobReportPdfUrl(url); const wo = mockWorkorders.find(w => w.id === workorderId); if (wo) (wo as any).jobReportPdfUrl = url; setIsCreateJobReportModalOpen(false) }} />}
      {workorder && <SetCustomerReminderModal isOpen={isSetReminderOpen} onClose={() => { setIsSetReminderOpen(false); setEditingReminder(false) }} clientId={workorder.clientId} initialReminder={editingReminder ? getReminder(workorder.clientId) : null} onSave={(r) => { setReminder(workorder.clientId, r); setIsSetReminderOpen(false); setEditingReminder(false) }} />}
    </div>
  )
}
