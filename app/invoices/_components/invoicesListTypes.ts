export type InvoiceRowStatus = 'past due' | 'sent but not due' | 'invoice pending to send' | 'waiting for payment' | 'paid' | 'bad debt'

export interface InvoiceRow {
  id: number
  workorderId: number
  invoiceNumber: string
  clientName: string
  title: string
  subtotal: number
  total: number
  balance: number
  dueDate: string | null
  dateSent: string | null
  status: InvoiceRowStatus
}
