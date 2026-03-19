import type { WorkorderRow } from '@/app/workorders/_components/WorkordersTable'

/** Extract list array from GET /api/workorders (and similar) response shapes */
export function extractWorkordersList(json: unknown): unknown[] {
  if (json == null || typeof json !== 'object') return []
  const obj = json as Record<string, unknown>
  const data = obj.data
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const inner = (data as Record<string, unknown>).data
    if (Array.isArray(inner)) return inner
  }
  if (Array.isArray(data)) return data
  return []
}

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

export function normalizeWorkorderFromApi(raw: Record<string, unknown>): WorkorderRow {
  const id = raw.id ?? ''
  const workOrderNumber =
    raw.workOrderNumber != null && String(raw.workOrderNumber).trim() !== ''
      ? String(raw.workOrderNumber)
      : undefined
  const client = (raw.client ?? {}) as Record<string, unknown>
  const clientName = typeof client.name === 'string' ? client.name : '—'
  const address = typeof raw.address === 'string' ? raw.address : undefined
  const scheduledAt = raw.scheduledAt ?? raw.scheduled_at
  const startTime = raw.startTime ?? raw.start_time
  const endTime = raw.endTime ?? raw.end_time
  const schedule =
    scheduledAt != null && String(scheduledAt) !== ''
      ? {
          day: String(scheduledAt),
          startTime: startTime != null ? String(startTime) : undefined,
          endTime: endTime != null ? String(endTime) : undefined,
        }
      : undefined
  const quoteRaw = typeof raw.quoteStatus === 'string' ? raw.quoteStatus : (raw.quote_status as string)
  const jobRaw = typeof raw.jobStatus === 'string' ? raw.jobStatus : (raw.job_status as string)
  const invoiceRaw = typeof raw.invoiceStatus === 'string' ? raw.invoiceStatus : (raw.invoice_status as string)
  const quoteStatus = QUOTE_MAP[quoteRaw ?? ''] ?? quoteRaw ?? 'not sent'
  const jobStatus = JOB_MAP[jobRaw ?? ''] ?? jobRaw ?? 'Unscheduled'
  const invoiceStatus = INVOICE_MAP[invoiceRaw ?? ''] ?? invoiceRaw ?? 'not sent'
  const total =
    typeof raw.total === 'number' ? raw.total : typeof raw.total === 'string' ? parseFloat(raw.total) || 0 : 0
  const createdAt = raw.createdAt ?? raw.created_at
  const updatedAt = raw.updatedAt ?? raw.updated_at
  return {
    id: typeof id === 'string' ? id : typeof id === 'number' ? id : String(id),
    workOrderNumber: workOrderNumber ?? null,
    title: typeof raw.title === 'string' ? raw.title : '—',
    clientName,
    address,
    schedule,
    quoteStatus,
    jobStatus,
    invoiceStatus,
    total,
    createdAt: createdAt != null ? String(createdAt) : undefined,
    lastModified: updatedAt != null ? String(updatedAt) : undefined,
  }
}

export type FetchWorkordersListOptions = {
  /** When the API paginates, ask for more rows for dropdowns (ignored if backend has no limit param). */
  limit?: number
  page?: number
}

/** GET /api/workorders — same list as Workorders page / table */
export async function fetchWorkordersList(options?: FetchWorkordersListOptions): Promise<WorkorderRow[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
  const params = new URLSearchParams()
  if (options?.limit != null) params.set('limit', String(options.limit))
  if (options?.page != null) params.set('page', String(options.page))
  const qs = params.toString()
  const url = `${baseUrl}/api/workorders${qs ? `?${qs}` : ''}`
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg =
      (json as { message?: string }).message ?? `Failed to load work orders (${res.status})`
    throw new Error(msg)
  }
  const rawList = extractWorkordersList(json)
  return rawList
    .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
    .map((item) => normalizeWorkorderFromApi(item))
}

export function formatWorkorderOptionLabel(wo: WorkorderRow): string {
  const num =
    wo.workOrderNumber != null && String(wo.workOrderNumber).trim() !== ''
      ? wo.workOrderNumber
      : String(wo.id)
  return `WO #${num} - ${wo.title} (${wo.clientName})`
}
