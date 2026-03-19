import { format } from 'date-fns'
import type { InvoiceRow, InvoiceRowStatus } from '../_components/invoicesListTypes'

export type InvoicesPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

/** Raw invoice item from GET /api/invoices */
export type ApiInvoiceRaw = {
  id?: string
  invoiceNumber?: string | null
  title?: string
  address?: string | null
  dueAt?: string | null
  status?: string
  total?: number | string
  balance?: number | string
  amountPaid?: number | string
  client?: { id?: string; name?: string; email?: string | null; phone?: string | null }
  workOrderId?: string | number | null
  workorderId?: string | number | null
}

export function extractInvoicesResponse(json: unknown): { items: ApiInvoiceRaw[]; pagination: InvoicesPagination } | null {
  if (json == null || typeof json !== 'object') return null
  const root = json as Record<string, unknown>
  const data = root.data
  if (data == null || typeof data !== 'object' || Array.isArray(data)) return null
  const inner = data as Record<string, unknown>
  const list = inner.data
  const paginationRaw = inner.pagination
  if (!Array.isArray(list) || paginationRaw == null || typeof paginationRaw !== 'object') return null
  const p = paginationRaw as Record<string, unknown>
  return {
    items: list as ApiInvoiceRaw[],
    pagination: {
      page: Number(p.page) || 1,
      limit: Number(p.limit) || 20,
      total: Number(p.total) || 0,
      totalPages: Number(p.totalPages) || 1,
    },
  }
}

export function mapApiInvoiceStatus(apiStatus: string, dueAt: string | null): InvoiceRowStatus {
  const today = format(new Date(), 'yyyy-MM-dd')
  const due = dueAt != null && dueAt !== '' ? String(dueAt).slice(0, 10) : null

  switch (apiStatus) {
    case 'NOT_SENT':
      return 'invoice pending to send'
    case 'AWAITING_PAYMENT':
      if (due != null && due < today) return 'past due'
      if (due != null && due >= today) return 'sent but not due'
      return 'waiting for payment'
    case 'OVERDUE':
      return 'past due'
    case 'PAID':
      return 'paid'
    case 'BAD_DEBT':
      return 'bad debt'
    case 'CANCELLED':
      return 'cancelled'
    default:
      return 'waiting for payment'
  }
}

function num(v: unknown): number {
  if (typeof v === 'number' && !Number.isNaN(v)) return v
  if (typeof v === 'string') {
    const n = parseFloat(v)
    return Number.isNaN(n) ? 0 : n
  }
  return 0
}

export function apiInvoiceToRow(raw: ApiInvoiceRaw): InvoiceRow {
  const client = raw.client ?? {}
  const dueSlice = raw.dueAt != null && String(raw.dueAt).trim() !== '' ? String(raw.dueAt).slice(0, 10) : null
  const status = mapApiInvoiceStatus(String(raw.status ?? ''), dueSlice)
  const total = num(raw.total)
  const balance = num(raw.balance)
  const id = raw.id != null ? String(raw.id) : ''
  const workOrderId = raw.workOrderId ?? raw.workorderId ?? id

  return {
    id,
    workorderId: workOrderId as string | number,
    invoiceNumber: raw.invoiceNumber != null && String(raw.invoiceNumber).trim() !== '' ? String(raw.invoiceNumber) : '—',
    clientName: typeof client.name === 'string' && client.name.trim() !== '' ? client.name : '—',
    title: typeof raw.title === 'string' ? raw.title : '—',
    subtotal: total,
    total,
    balance,
    dueDate: dueSlice,
    dateSent: raw.status != null && raw.status !== 'NOT_SENT' && raw.status !== 'CANCELLED' ? 'sent' : null,
    status,
  }
}
