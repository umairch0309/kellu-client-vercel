export type InvoiceRowStatus =
  | 'past due'
  | 'sent but not due'
  | 'invoice pending to send'
  | 'waiting for payment'
  | 'paid'
  | 'bad debt'
  | 'cancelled'

export interface InvoiceRow {
  id: string | number
  workorderId: string | number
  invoiceNumber: string
  clientName: string
  title: string
  subtotal: number
  total: number
  balance: number
  dueDate: string | null
  /** When set, invoice was issued (enables resend in UI). */
  dateSent: string | null
  status: InvoiceRowStatus
}
