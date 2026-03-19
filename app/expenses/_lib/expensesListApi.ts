import type { ExpenseListRow, ExpensesPagination } from '../_components/expensesListTypes'

export type ApiExpenseRaw = {
  id?: string
  date?: string | null
  itemName?: string
  details?: string | null
  total?: number | string
  invoiceNumber?: string | null
  attachmentUrl?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  businessId?: string
  workOrderId?: string | null
  workOrder?: {
    id?: string
    workOrderNumber?: string | null
    title?: string
    clientId?: string
    client?: { id?: string; name?: string; email?: string | null } | null
  } | null
}

function num(v: unknown): number {
  if (typeof v === 'number' && !Number.isNaN(v)) return v
  if (typeof v === 'string') {
    const n = parseFloat(v)
    return Number.isNaN(n) ? 0 : n
  }
  return 0
}

function dateSlice(v: string | null | undefined): string {
  if (v == null || String(v).trim() === '') return ''
  return String(v).slice(0, 10)
}

/**
 * Parse GET /api/expenses body:
 * { message, success, data: { data: [...], pagination } }
 */
export function extractExpensesResponse(
  json: unknown,
): { items: ApiExpenseRaw[]; pagination: ExpensesPagination } | null {
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
    items: list as ApiExpenseRaw[],
    pagination: {
      page: Number(p.page) || 1,
      limit: Number(p.limit) || 20,
      total: Number(p.total) || 0,
      totalPages: Number(p.totalPages) || 1,
    },
  }
}

export function apiExpenseToRow(raw: ApiExpenseRaw, rowIndex = 0): ExpenseListRow {
  const id = raw.id != null && String(raw.id).trim() !== '' ? String(raw.id) : `expense-${rowIndex}`
  const wo = raw.workOrder ?? null
  const woId = raw.workOrderId != null && String(raw.workOrderId).trim() !== '' ? String(raw.workOrderId) : null
  const resolvedWoId = wo?.id != null ? String(wo.id) : woId
  const woNum = wo?.workOrderNumber != null && String(wo.workOrderNumber).trim() !== '' ? String(wo.workOrderNumber) : null
  const woTitle = typeof wo?.title === 'string' ? wo.title : ''
  const workOrderLabel =
    resolvedWoId != null
      ? woNum != null
        ? `WO #${woNum}`
        : woTitle.trim() !== ''
          ? woTitle
          : `WO #${resolvedWoId}`
      : '—'
  const clientName =
    wo?.client != null && typeof wo.client.name === 'string' && wo.client.name.trim() !== ''
      ? wo.client.name
      : null

  const date = dateSlice(raw.date ?? null) || dateSlice(raw.createdAt ?? null)

  return {
    id,
    date,
    itemName: typeof raw.itemName === 'string' ? raw.itemName : '—',
    details: typeof raw.details === 'string' ? raw.details : '',
    total: num(raw.total),
    invoiceNumber:
      raw.invoiceNumber != null && String(raw.invoiceNumber).trim() !== '' ? String(raw.invoiceNumber) : '',
    attachmentUrl:
      raw.attachmentUrl != null && String(raw.attachmentUrl).trim() !== '' ? String(raw.attachmentUrl) : null,
    workOrderId: resolvedWoId,
    linkedWorkorder: resolvedWoId,
    workOrderLabel,
    clientName,
  }
}

/** POST /api/expenses — `data` is the created expense (not nested list). */
export function extractCreatedExpenseFromResponse(json: unknown): ApiExpenseRaw | null {
  if (json == null || typeof json !== 'object') return null
  const root = json as Record<string, unknown>
  const data = root.data
  if (data == null || typeof data !== 'object' || Array.isArray(data)) return null
  return data as ApiExpenseRaw
}
