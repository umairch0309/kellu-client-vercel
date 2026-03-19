import type { InvoiceRowStatus } from '../_components/invoicesListTypes'

/** API enum from GET /api/invoices/overview → data.byStatus[].status */
export type ApiInvoiceOverviewStatus =
  | 'NOT_SENT'
  | 'AWAITING_PAYMENT'
  | 'OVERDUE'
  | 'PAID'
  | 'BAD_DEBT'
  | 'CANCELLED'

export type InvoiceOverviewByStatusRow = {
  status: ApiInvoiceOverviewStatus
  count: number
  total: number
}

export type InvoiceOverviewData = {
  byStatus: InvoiceOverviewByStatusRow[]
  issuedLast30Days: { count: number; total: number }
  averageInvoiceLast30Days: number
}

const API_STATUSES: ApiInvoiceOverviewStatus[] = [
  'NOT_SENT',
  'AWAITING_PAYMENT',
  'OVERDUE',
  'PAID',
  'BAD_DEBT',
  'CANCELLED',
]

function num(v: unknown): number {
  if (typeof v === 'number' && !Number.isNaN(v)) return v
  if (typeof v === 'string') {
    const n = parseFloat(v)
    return Number.isNaN(n) ? 0 : n
  }
  return 0
}

function int(v: unknown): number {
  const n = num(v)
  return Number.isFinite(n) ? Math.trunc(n) : 0
}

function parseStatus(s: unknown): ApiInvoiceOverviewStatus | null {
  if (typeof s !== 'string') return null
  const up = s.toUpperCase()
  return API_STATUSES.includes(up as ApiInvoiceOverviewStatus) ? (up as ApiInvoiceOverviewStatus) : null
}

function normalizeByStatusRow(raw: unknown): InvoiceOverviewByStatusRow | null {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return null
  const o = raw as Record<string, unknown>
  const status = parseStatus(o.status)
  if (!status) return null
  return {
    status,
    count: int(o.count),
    total: num(o.total),
  }
}

/**
 * Parse GET /api/invoices/overview body:
 * { message, success, data: { byStatus, issuedLast30Days, averageInvoiceLast30Days } }
 */
export function parseInvoiceOverviewResponse(json: unknown): InvoiceOverviewData | null {
  if (json == null || typeof json !== 'object') return null
  const root = json as Record<string, unknown>
  const data = root.data
  if (data == null || typeof data !== 'object' || Array.isArray(data)) return null
  const d = data as Record<string, unknown>

  const byStatusRaw = d.byStatus
  if (!Array.isArray(byStatusRaw)) return null

  const byStatus = byStatusRaw.map(normalizeByStatusRow).filter((r): r is InvoiceOverviewByStatusRow => r != null)

  const issued = d.issuedLast30Days
  if (issued == null || typeof issued !== 'object' || Array.isArray(issued)) return null
  const issuedObj = issued as Record<string, unknown>
  const issuedLast30Days = {
    count: int(issuedObj.count),
    total: num(issuedObj.total),
  }

  const averageInvoiceLast30Days = num(d.averageInvoiceLast30Days)

  return {
    byStatus,
    issuedLast30Days,
    averageInvoiceLast30Days,
  }
}

/** Map API overview status → table filter value (STATUS_FILTER_OPTIONS) */
export function apiOverviewStatusToFilter(status: ApiInvoiceOverviewStatus): InvoiceRowStatus | 'all' {
  switch (status) {
    case 'NOT_SENT':
      return 'invoice pending to send'
    case 'AWAITING_PAYMENT':
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
      return 'all'
  }
}

export function labelForApiOverviewStatus(status: ApiInvoiceOverviewStatus): string {
  switch (status) {
    case 'NOT_SENT':
      return 'Not sent'
    case 'AWAITING_PAYMENT':
      return 'Awaiting payment'
    case 'OVERDUE':
      return 'Overdue'
    case 'PAID':
      return 'Paid'
    case 'BAD_DEBT':
      return 'Bad debt'
    case 'CANCELLED':
      return 'Cancelled'
    default:
      return status
  }
}

export function bulletColorForApiOverviewStatus(status: ApiInvoiceOverviewStatus): string {
  switch (status) {
    case 'NOT_SENT':
      return '#2B50AA'
    case 'AWAITING_PAYMENT':
      return '#D97706'
    case 'OVERDUE':
      return '#DC2626'
    case 'PAID':
      return '#15803D'
    case 'BAD_DEBT':
      return '#6B7280'
    case 'CANCELLED':
      return '#9CA3AF'
    default:
      return '#28AFB0'
  }
}

/** Preferred display order for overview rows */
const STATUS_ORDER: ApiInvoiceOverviewStatus[] = [
  'NOT_SENT',
  'OVERDUE',
  'AWAITING_PAYMENT',
  'PAID',
  'BAD_DEBT',
  'CANCELLED',
]

export function sortByStatusRows(rows: InvoiceOverviewByStatusRow[]): InvoiceOverviewByStatusRow[] {
  const idx = (s: ApiInvoiceOverviewStatus) => {
    const i = STATUS_ORDER.indexOf(s)
    return i === -1 ? 999 : i
  }
  return [...rows].sort((a, b) => idx(a.status) - idx(b.status))
}
