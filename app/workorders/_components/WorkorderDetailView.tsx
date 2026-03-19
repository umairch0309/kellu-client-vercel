'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { mockClients, mockWorkorders, quoteSettings, invoiceSettings } from '@/data/mockData'
import { useClientReminders } from '@/context/ClientRemindersContext'

const QUOTE_MAP: Record<string, string> = {
  NOT_SENT: 'not sent',
  AWAITING_RESPONSE: 'waiting for approval',
  APPROVED: 'approved',
  CONVERTED: 'approved',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
}
const JOB_MAP: Record<string, string> = {
  UNSCHEDULED: 'Unscheduled',
  UNASSIGNED: 'Unscheduled',
  SCHEDULED: 'Scheduled',
  ON_MY_WAY: 'In Progress',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}
const INVOICE_MAP: Record<string, string> = {
  NOT_SENT: 'not sent',
  AWAITING_PAYMENT: 'waiting for payment',
  OVERDUE: 'overdue',
  PAID: 'paid',
  BAD_DEBT: 'bad debt',
  CANCELLED: 'cancelled',
}

export interface DetailWorkorderShape {
  id: number | string
  title: string
  clientId: number | string
  clientName: string
  address: string
  schedule?: { day: string; startTime?: string; endTime?: string }
  assignedTeamMember?: string | null
  instructions?: string | null
  lineItems: { id?: string | number; itemType?: string; name: string; description?: string; quantity: number; unitPrice: number; unitCost: number; total: number }[]
  payments: { amount: number; date?: string; method?: string; reference?: string }[]
  expenses: any[]
  quoteStatus: string
  jobStatus: string
  invoiceStatus: string
  total: number
  subtotal?: number
  discount?: number
  discountType?: string
  createdAt?: string
  lastModified?: string
  quoteNumber?: string
  quoteDateSent?: string
  quoteWhatsappStatus?: string
  invoiceNumber?: string
  invoiceDateSent?: string
  invoiceWhatsappStatus?: string
  labor?: number
  [key: string]: any
}

function extractDetailWorkorder(json: unknown): Record<string, unknown> | null {
  if (json == null || typeof json !== 'object') return null
  const obj = json as Record<string, unknown>
  let data = obj.data
  if (data != null && typeof data === 'object' && !Array.isArray(data)) {
    const inner = (data as Record<string, unknown>).data
    if (inner != null && typeof inner === 'object' && !Array.isArray(inner)) return inner as Record<string, unknown>
    return data as Record<string, unknown>
  }
  return null
}

function extractExpensesList(json: unknown): Record<string, unknown>[] {
  if (json == null || typeof json !== 'object') return []
  const obj = json as Record<string, unknown>
  const data = obj.data
  if (data != null && typeof data === 'object' && !Array.isArray(data)) {
    const inner = (data as Record<string, unknown>).data
    if (Array.isArray(inner)) return inner as Record<string, unknown>[]
  }
  if (Array.isArray(data)) return data as Record<string, unknown>[]
  return []
}

function expenseRawToDisplay(raw: Record<string, unknown>): { date: string; itemName: string; details: string; total: number; amount: number; linkedWorkorder: string | number | null; invoiceNumber: string } {
  const total = typeof raw.total === 'number' ? raw.total : parseFloat(String(raw.total ?? 0)) || 0
  const workOrderId = raw.workOrderId
  const linkedWorkorder =
    workOrderId == null ? null : typeof workOrderId === 'string' || typeof workOrderId === 'number' ? workOrderId : String(workOrderId)
  return {
    date: raw.date != null ? String(raw.date).slice(0, 10) : '',
    itemName: typeof raw.itemName === 'string' ? raw.itemName : '',
    details: raw.details != null ? String(raw.details) : '',
    total,
    amount: total,
    linkedWorkorder,
    invoiceNumber: raw.invoiceNumber != null ? String(raw.invoiceNumber) : '',
  }
}

function normalizeDetailWorkorder(raw: Record<string, unknown>, workorderId: number | string): DetailWorkorderShape {
  const id = raw.id ?? workorderId
  const client = (raw.client ?? {}) as Record<string, unknown>
  const clientId = client.id ?? raw.clientId ?? ''
  const clientName = typeof client.name === 'string' ? client.name : (typeof raw.clientName === 'string' ? raw.clientName : '—')
  const clientPhone = client.phone ?? client.phone_no
  const clientEmail = client.email
  const assignedTo = (raw.assignedTo ?? {}) as Record<string, unknown>
  const user = (assignedTo.user ?? {}) as Record<string, unknown>
  const assignedTeamMember = typeof user.name === 'string' ? user.name : (user.email != null ? String(user.email) : null)
  const scheduledAt = raw.scheduledAt ?? raw.scheduled_at
  const startTime = raw.startTime ?? raw.start_time
  const endTime = raw.endTime ?? raw.end_time
  const schedule =
    scheduledAt != null && String(scheduledAt).trim() !== ''
      ? {
          day: String(scheduledAt).slice(0, 10),
          startTime: startTime != null ? String(startTime) : undefined,
          endTime: endTime != null ? String(endTime) : undefined,
        }
      : undefined
  const quoteRaw = (raw.quoteStatus ?? raw.quote_status) as string
  const jobRaw = (raw.jobStatus ?? raw.job_status) as string
  const invoiceRaw = (raw.invoiceStatus ?? raw.invoice_status) as string
  const quoteStatus = QUOTE_MAP[quoteRaw ?? ''] ?? quoteRaw ?? 'not sent'
  const jobStatus = JOB_MAP[jobRaw ?? ''] ?? jobRaw ?? 'Unscheduled'
  const invoiceStatus = INVOICE_MAP[invoiceRaw ?? ''] ?? invoiceRaw ?? 'not sent'
  const total = typeof raw.total === 'number' ? raw.total : typeof raw.total === 'string' ? parseFloat(raw.total) || 0 : 0
  const subtotal = typeof raw.subtotal === 'number' ? raw.subtotal : typeof raw.subtotal === 'string' ? parseFloat(raw.subtotal) || 0 : undefined
  const discount = typeof raw.discount === 'number' ? raw.discount : typeof raw.discount === 'string' ? parseFloat(raw.discount) || 0 : 0
  const discountType = (raw.discountType ?? raw.discount_type) as string
  const lineItemsRaw = Array.isArray(raw.lineItems) ? raw.lineItems : []
  const lineItems = lineItemsRaw.map((li: any) => {
    const qty = typeof li.quantity === 'number' ? li.quantity : parseInt(String(li.quantity), 10) || 1
    const price = typeof li.price === 'number' ? li.price : parseFloat(String(li.price ?? 0)) || 0
    const cost = typeof li.cost === 'number' ? li.cost : parseFloat(String(li.cost ?? 0)) || 0
    const itemTypeRaw = typeof li.itemType === 'string' ? li.itemType.toUpperCase() : 'SERVICE'
    return {
      id: li.id != null ? (typeof li.id === 'string' || typeof li.id === 'number' ? li.id : String(li.id)) : undefined,
      itemType: itemTypeRaw === 'PRODUCT' ? 'PRODUCT' : 'SERVICE',
      name: typeof li.name === 'string' ? li.name : '—',
      description: typeof li.description === 'string' ? li.description : undefined,
      quantity: qty,
      unitPrice: price,
      unitCost: cost,
      total: qty * price,
    }
  })
  const paymentsRaw = Array.isArray(raw.payments) ? raw.payments : []
  const payments = paymentsRaw.map((p: any) => ({
    amount: typeof p.amount === 'number' ? p.amount : parseFloat(String(p.amount ?? 0)) || 0,
    date: p.paymentDate != null ? String(p.paymentDate).slice(0, 10) : p.date,
    method: p.paymentMethod ?? p.method,
    reference: p.referenceNumber ?? p.reference,
  }))
  const expenses = Array.isArray(raw.expenses) ? raw.expenses : []
  return {
    id: typeof id === 'string' ? id : typeof id === 'number' ? id : String(id),
    title: typeof raw.title === 'string' ? raw.title : '—',
    clientId: typeof clientId === 'string' ? clientId : typeof clientId === 'number' ? clientId : String(clientId),
    clientName,
    address: typeof raw.address === 'string' ? raw.address : '—',
    schedule,
    assignedTeamMember: assignedTeamMember ?? undefined,
    instructions: raw.instructions != null ? String(raw.instructions) : undefined,
    lineItems,
    payments,
    expenses,
    quoteStatus,
    jobStatus,
    invoiceStatus,
    total,
    subtotal,
    discount: discount ?? 0,
    discountType: discountType != null ? String(discountType).toLowerCase() : 'amount',
    createdAt: raw.createdAt != null ? String(raw.createdAt) : undefined,
    lastModified: raw.updatedAt != null ? String(raw.updatedAt) : undefined,
    quoteNumber: raw.quoteNumber != null ? String(raw.quoteNumber) : undefined,
    quoteDateSent: raw.quoteDateSent != null ? String(raw.quoteDateSent) : undefined,
    quoteWhatsappStatus: raw.quoteWhatsappStatus != null ? String(raw.quoteWhatsappStatus) : undefined,
    invoiceNumber: raw.invoiceNumber != null ? String(raw.invoiceNumber) : undefined,
    invoiceDateSent: raw.invoiceDateSent != null ? String(raw.invoiceDateSent) : undefined,
    invoiceWhatsappStatus: raw.invoiceWhatsappStatus != null ? String(raw.invoiceWhatsappStatus) : undefined,
    labor: typeof raw.labor === 'number' ? raw.labor : undefined,
    clientPhone: clientPhone != null ? String(clientPhone) : undefined,
    clientEmail: clientEmail != null ? String(clientEmail) : undefined,
  }
}
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
import { PRICE_LIST_UPDATED_EVENT } from '@/lib/priceListEvents'

function editedLineItemToApiPayload(item: {
  id?: string | number
  itemType?: string
  name: string
  description?: string
  quantity: number
  unitPrice: number
  unitCost: number
}): Record<string, unknown> {
  const nameTrim = (item.name || '').trim() || '—'
  const itemType = item.itemType === 'PRODUCT' ? 'PRODUCT' : 'SERVICE'
  const payload: Record<string, unknown> = {
    name: nameTrim,
    itemType,
    description: item.description != null && String(item.description).trim() !== '' ? String(item.description).trim() : null,
    quantity: Number(item.quantity) || 0,
    price: Number(item.unitPrice) || 0,
    cost: Number(item.unitCost) || 0,
  }
  if (item.id != null && item.id !== '') payload.id = item.id
  return payload
}

function extractWorkOrderFromAddPriceListResponse(json: unknown): Record<string, unknown> | null {
  if (json == null || typeof json !== 'object') return null
  const obj = json as Record<string, unknown>
  const data = obj.data
  if (data != null && typeof data === 'object' && !Array.isArray(data)) {
    const wo = (data as Record<string, unknown>).workOrder
    if (wo != null && typeof wo === 'object' && !Array.isArray(wo)) return wo as Record<string, unknown>
  }
  return extractDetailWorkorder(json)
}

interface WorkorderDetailViewProps {
  workorderId: number | string
}

const emptyExpense: ExpenseForm = { date: new Date().toISOString().split('T')[0], itemName: '', details: '', total: 0, linkedWorkorder: null, invoiceNumber: '', attachment: null }
const emptyPayment: PaymentForm = { date: new Date().toISOString().split('T')[0], amount: 0, method: 'CASH', reference: '', notes: '' }

export default function WorkorderDetailView({ workorderId }: WorkorderDetailViewProps) {
  const router = useRouter()
  const [detailWorkorder, setDetailWorkorder] = useState<DetailWorkorderShape | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
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

  const numericId = typeof workorderId === 'string' && /^\d+$/.test(workorderId) ? parseInt(workorderId, 10) : null
  const mockWorkorder = numericId != null ? mockWorkorders.find(wo => wo.id === numericId) : null
  const workorder: DetailWorkorderShape | undefined = detailWorkorder ?? (mockWorkorder as DetailWorkorderShape | undefined)
  const client = workorder
    ? detailWorkorder
      ? { id: workorder.clientId, name: workorder.clientName, phone: (workorder as any).clientPhone, email: (workorder as any).clientEmail }
      : mockClients.find(c => String(c.id) === String(workorder.clientId)) ?? null
    : null

  const fetchWorkorder = useCallback(async () => {
    if (workorderId == null || workorderId === '') {
      setLoading(false)
      setDetailWorkorder(null)
      return
    }
    setLoading(true)
    setFetchError(null)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
      const res = await fetch(`${baseUrl}/api/workorders/${workorderId}`, { credentials: 'include' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setFetchError(typeof json?.message === 'string' ? json.message : 'Failed to load workorder')
        setDetailWorkorder(null)
        return
      }
      const data = extractDetailWorkorder(json)
      if (data) {
        setDetailWorkorder(normalizeDetailWorkorder(data, workorderId))
      } else {
        setDetailWorkorder(null)
        setFetchError('Invalid response')
      }
    } catch {
      setFetchError('Failed to load workorder')
      setDetailWorkorder(null)
    } finally {
      setLoading(false)
    }
  }, [workorderId])

  const fetchExpenses = useCallback(async () => {
    if (workorderId == null || workorderId === '') return
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
      const res = await fetch(`${baseUrl}/api/workorders/${workorderId}/expenses`, { credentials: 'include' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) return
      const list = extractExpensesList(json)
      setEditedExpenses(list.map(expenseRawToDisplay))
    } catch {
      // keep existing editedExpenses on error
    }
  }, [workorderId])

  const saveNewLineItemToPriceList = useCallback(
    async (lineItem: LineItemForm) => {
      const nameTrim = (lineItem.name || '').trim()
      if (!nameTrim) throw new Error('Enter a line item name')
      if (workorderId == null || workorderId === '') throw new Error('Missing work order')
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
      const prevIds = new Set(
        editedLineItems.map((i: { id?: string | number }) => (i.id != null ? String(i.id) : '')).filter(Boolean),
      )
      const lineItemsPayload = [
        ...editedLineItems.map((i: any) => editedLineItemToApiPayload(i)),
        editedLineItemToApiPayload({ ...lineItem, name: nameTrim, itemType: 'SERVICE' }),
      ]
      const patchBody = JSON.stringify({ lineItems: lineItemsPayload })
      let patchRes = await fetch(`${baseUrl}/api/workorders/${workorderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: patchBody,
      })
      let patchJson = await patchRes.json().catch(() => ({}))
      if (workorderId && patchRes.status === 404) {
        patchRes = await fetch(`${baseUrl}/api/workorders/${workorderId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: patchBody,
        })
        patchJson = await patchRes.json().catch(() => ({}))
      }
      if (!patchRes.ok) {
        const msg = (patchJson as { message?: string }).message ?? `Failed to save line item (${patchRes.status})`
        throw new Error(msg)
      }
      let woRaw = extractDetailWorkorder(patchJson)
      if (!woRaw) {
        const getRes = await fetch(`${baseUrl}/api/workorders/${workorderId}`, { credentials: 'include' })
        const getJson = await getRes.json().catch(() => ({}))
        woRaw = extractDetailWorkorder(getJson)
      }
      if (!woRaw) throw new Error('Invalid response when saving line item')
      const lineItemsFromApi = Array.isArray(woRaw.lineItems) ? (woRaw.lineItems as Record<string, unknown>[]) : []
      const qty = Number(lineItem.quantity) || 0
      const price = Number(lineItem.unitPrice) || 0
      const cost = Number(lineItem.unitCost) || 0
      const candidates = lineItemsFromApi.filter((li) => {
        const id = li.id != null ? String(li.id) : ''
        return id !== '' && !prevIds.has(id)
      })
      let match = candidates.find(
        (li) =>
          String(li.name ?? '').trim() === nameTrim &&
          Number(li.quantity) === qty &&
          Number(li.price) === price &&
          Number(li.cost) === cost,
      )
      if (!match && candidates.length === 1) match = candidates[0]
      if (!match) match = candidates.find((li) => String(li.name ?? '').trim() === nameTrim)
      const lineItemId = match?.id
      if (lineItemId == null) {
        await fetchWorkorder()
        throw new Error('Could not determine the new line item. Please refresh and try again.')
      }
      const addBody: Record<string, unknown> = { name: nameTrim, itemType: 'SERVICE' }
      if (lineItem.description?.trim()) addBody.description = lineItem.description.trim()
      addBody.quantity = qty
      addBody.price = price
      addBody.cost = cost
      const addRes = await fetch(
        `${baseUrl}/api/workorders/${workorderId}/line-items/${encodeURIComponent(String(lineItemId))}/add-to-price-list`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(addBody),
        },
      )
      const addJson = await addRes.json().catch(() => ({}))
      if (!addRes.ok) {
        await fetchWorkorder()
        const msg = (addJson as { message?: string }).message ?? `Failed to add to price list (${addRes.status})`
        throw new Error(msg)
      }
      const finalWo = extractWorkOrderFromAddPriceListResponse(addJson)
      if (finalWo) {
        setDetailWorkorder(normalizeDetailWorkorder(finalWo, workorderId))
      } else {
        await fetchWorkorder()
      }
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(PRICE_LIST_UPDATED_EVENT))
    },
    [workorderId, editedLineItems, fetchWorkorder],
  )

  const handleSendBookingConfirmation = useCallback(async () => {
    if (workorderId == null || workorderId === '') return
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    const res = await fetch(`${baseUrl}/api/workorders/${workorderId}/send-booking-confirmation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        subject: bookingSubject,
        message: bookingMessage,
        sendMeCopy: bookingSendMeCopy,
        sendWhatsApp: bookingSendWhatsApp,
        includeTeamPictures: bookingIncludeTeamPictures,
      }),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      const msg = (json as { message?: string }).message ?? `Request failed (${res.status})`
      throw new Error(msg)
    }
    if (detailWorkorder) setDetailWorkorder(prev => (prev ? { ...prev, bookingConfirmationSent: true } as DetailWorkorderShape : null))
    setBookingConfirmationSent(true)
    setIsBookingConfirmationModalOpen(false)
  }, [workorderId, bookingSubject, bookingMessage, bookingSendMeCopy, bookingSendWhatsApp, bookingIncludeTeamPictures, detailWorkorder])

  useEffect(() => {
    fetchWorkorder()
  }, [fetchWorkorder])

  useEffect(() => {
    if (detailWorkorder && workorderId) {
      fetchExpenses()
    }
  }, [detailWorkorder, workorderId, fetchExpenses])

  useEffect(() => {
    if (!workorder) return
    setEditedLineItems([...workorder.lineItems])
    setEditedPayments(workorder.payments && Array.isArray(workorder.payments) ? [...workorder.payments] : [])
    if (!detailWorkorder) setEditedExpenses(Array.isArray(workorder.expenses) ? [...(workorder.expenses as any[])] : [])
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
    const scheduleBlock = workorder.schedule
      ? `Schedule Details:\nDate: ${format(new Date(workorder.schedule.day), 'MMMM dd, yyyy')}\nTime: ${workorder.schedule.startTime ?? '—'} - ${workorder.schedule.endTime ?? '—'}\n`
      : ''
    setBookingMessage(`Dear ${client.name || 'Client'},

Your booking has been confirmed for ${workorder.title || 'your job'}.

${scheduleBlock}${workorder.assignedTeamMember ? `Assigned Team Member: ${workorder.assignedTeamMember}\n\n` : ''}Address:
${workorder.address}

We look forward to serving you!

Best regards`)
    setBookingSubject(`Booking Confirmation - ${workorder.title || 'Job'}${workorder.schedule ? ` - ${format(new Date(workorder.schedule.day), 'MMM dd, yyyy')}` : ''}`)
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

  if (loading) {
    return (
      <div className="p-8">
        <p style={{ color: '#1F271B' }}>Loading workorder…</p>
      </div>
    )
  }

  if (!workorder) {
    return (
      <div className="p-8">
        {fetchError && <p className="mb-2" style={{ color: '#B91C1C' }}>{fetchError}</p>}
        <p style={{ color: '#1F271B' }}>Workorder not found</p>
      </div>
    )
  }

  const totalLineItemCost = workorder.lineItems.reduce((sum, item) => sum + (Number(item.unitCost) || 0) * (Number(item.quantity) || 0), 0)
  const totalLineItemPrice = workorder.lineItems.reduce((sum, item) => sum + (Number(item.total) || 0), 0)
  const totalExpenses = editedExpenses.length > 0 ? editedExpenses.reduce((sum: number, exp: any) => sum + (Number(exp.total) || Number(exp.amount) || 0), 0) : 0
  const totalLabor = Number((workorder as any).labor) || 0
  const profit = totalLineItemPrice - totalLineItemCost - totalLabor - totalExpenses
  const profitMargin = totalLineItemPrice > 0 ? ((profit / totalLineItemPrice) * 100).toFixed(0) : '0'
  const legendSquareStyle = { width: 8, height: 8, backgroundColor: '#7DD3FC', borderRadius: 1 }
  const totalPayments = editedPayments.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0)
  const invoiceTotal = Number(workorder.total) || totalLineItemPrice
  const isInvoicePaid = totalPayments >= invoiceTotal && invoiceTotal > 0

  const handleQuoteStatusChange = (status: string) => {
    if (detailWorkorder) setDetailWorkorder(prev => prev ? { ...prev, quoteStatus: status } : null)
    else {
      const wo = mockWorkorders.find(w => String(w.id) === String(workorderId)) as any
      if (wo) wo.quoteStatus = status
    }
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
            <LineItemsSection workorder={workorder} editedLineItems={editedLineItems} setEditedLineItems={setEditedLineItems} isAddLineItemOpen={isAddLineItemOpen} setIsAddLineItemOpen={setIsAddLineItemOpen} newLineItem={newLineItem} setNewLineItem={setNewLineItem} lineItemError={lineItemError} setLineItemError={setLineItemError} editingLineItemIndex={editingLineItemIndex} setEditingLineItemIndex={setEditingLineItemIndex} editingLineItemForm={editingLineItemForm} setEditingLineItemForm={setEditingLineItemForm} lineItemNameDropdownRef={lineItemNameDropdownRef} onOpenAddProductModal={() => setIsAddProductModalOpen(true)} onSaveNewLineItem={saveNewLineItemToPriceList} />
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

      <BookingConfirmationModal isOpen={isBookingConfirmationModalOpen} onClose={() => setIsBookingConfirmationModalOpen(false)} workorder={workorder} client={client!} bookingSubject={bookingSubject} setBookingSubject={setBookingSubject} bookingMessage={bookingMessage} setBookingMessage={setBookingMessage} bookingSendMeCopy={bookingSendMeCopy} setBookingSendMeCopy={setBookingSendMeCopy} bookingSendWhatsApp={bookingSendWhatsApp} setBookingSendWhatsApp={setBookingSendWhatsApp} bookingIncludeTeamPictures={bookingIncludeTeamPictures} setBookingIncludeTeamPictures={setBookingIncludeTeamPictures} onSend={handleSendBookingConfirmation} isResend={bookingConfirmationSent || !!(workorder as any).bookingConfirmationSent} />

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        workorderId={workorderId}
        editingExpenseIndex={editingExpenseIndex}
        newExpense={newExpense}
        setNewExpense={setNewExpense}
        onExpenseCreated={(expense) => {
          setEditedExpenses([...editedExpenses, expense])
          resetExpenseForm()
          setIsAddExpenseOpen(false)
        }}
        onSave={(payload) => {
          if (editingExpenseIndex !== null) setEditedExpenses(editedExpenses.map((e, i) => i === editingExpenseIndex ? payload : e))
          else setEditedExpenses([...editedExpenses, payload])
          resetExpenseForm()
          setIsAddExpenseOpen(false)
        }}
        onDelete={() => { setEditedExpenses(editedExpenses.filter((_, i) => i !== editingExpenseIndex)); resetExpenseForm() }}
        resetForm={resetExpenseForm}
      />
      <AddPaymentModal
        isOpen={isAddPaymentOpen}
        onClose={() => setIsAddPaymentOpen(false)}
        editingPaymentIndex={editingPaymentIndex}
        newPayment={newPayment}
        setNewPayment={setNewPayment}
        workorderId={workorderId}
        onPaymentsUpdated={(payments) => {
          setEditedPayments(payments)
          resetPaymentForm()
          setIsAddPaymentOpen(false)
        }}
        onSave={(payment) => {
          if (editingPaymentIndex !== null) {
            const next = [...editedPayments]
            next[editingPaymentIndex] = payment
            setEditedPayments(next)
          } else {
            setEditedPayments([...editedPayments, payment])
          }
          resetPaymentForm()
          setIsAddPaymentOpen(false)
        }}
        resetForm={resetPaymentForm}
      />

      <AddProductServiceModal isOpen={isAddProductModalOpen} onClose={() => setIsAddProductModalOpen(false)} initialName={(newLineItem.name || '').trim()} onSave={(data: NewProductServiceData) => { setNewLineItem(prev => ({ ...prev, name: data.name, description: data.description, unitPrice: data.unitPrice })); setLineItemError(''); setIsAddProductModalOpen(false) }} />
      {sendEmailModalType !== null && (
        <SendEmailModal isOpen={true} onClose={() => { setSendEmailModalType(null); setSendingTallyWorkReport(false) }} type={sendEmailModalType} workorderId={workorderId} workorderAttachments={attachmentFiles} onAddWorkorderAttachment={(file) => setAttachmentFiles(prev => [...prev, file].slice(0, 10))} workorder={workorder} client={client ?? undefined} onSend={() => { if (sendEmailModalType === 'work-order-report') { const sentAt = new Date().toISOString(); const wo = detailWorkorder ?? mockWorkorders.find(w => String(w.id) === String(workorderId)); if (sendingTallyWorkReport) { setTallyWorkReportSentAt(sentAt); if (wo) (wo as any).tallyWorkReportSentAt = sentAt; setSendingTallyWorkReport(false); alert('Work report (from Tally) sent successfully!') } else { setJobReportSentAt(sentAt); if (wo) (wo as any).jobReportSentAt = sentAt; alert('Work order report sent successfully!') }; setSendEmailModalType(null) } else if (sendEmailModalType === 'job-follow') { const sentAt = new Date().toISOString(); const wo = detailWorkorder ?? mockWorkorders.find(w => String(w.id) === String(workorderId)); if (wo) (wo as any).jobFollowSentAt = sentAt; setSendEmailModalType(null); alert('Job follow-up sent successfully!') } else { alert(sendEmailModalType === 'quote' ? 'Quote sent successfully!' : 'Invoice sent successfully!') } }} />
      )}
      {isCreateJobReportModalOpen && <CreateJobReportModal isOpen={isCreateJobReportModalOpen} onClose={() => setIsCreateJobReportModalOpen(false)} workorderTitle={workorder?.title} onSave={(report) => { const url = `/reports/job-${workorderId}.pdf`; setJobReportPdfUrl(url); const wo = mockWorkorders.find(w => String(w.id) === String(workorderId)); if (wo) (wo as any).jobReportPdfUrl = url; setIsCreateJobReportModalOpen(false) }} />}
      {workorder && <SetCustomerReminderModal isOpen={isSetReminderOpen} onClose={() => { setIsSetReminderOpen(false); setEditingReminder(false) }} clientId={workorder.clientId} initialReminder={editingReminder ? getReminder(workorder.clientId) : null} onSave={(r) => { setReminder(workorder.clientId, r); setIsSetReminderOpen(false); setEditingReminder(false) }} />}
    </div>
  )
}
