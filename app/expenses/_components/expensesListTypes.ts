/** Row shape for /expenses table (from GET /api/expenses) */
export interface ExpenseListRow {
  id: string
  /** yyyy-MM-dd for filters/display; may be empty if API sends null dates */
  date: string
  itemName: string
  details: string
  total: number
  invoiceNumber: string
  attachmentUrl: string | null
  workOrderId: string | null
  /** Work order id for modal / links (string from API) */
  linkedWorkorder: string | null
  /** e.g. WO #123 or work order number from API */
  workOrderLabel: string
  clientName: string | null
}       

export type ExpensesPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}
