export type QuoteRowStatus = 'quote pending to send' | 'draft' | 'waiting for approval' | 'rejected' | 'expired' | 'approved'

export interface QuoteRow {
  id: string
  quoteNumber: string
  clientName: string
  title: string
  total: number
  dateSent: string | null
  status: QuoteRowStatus
  whatsappStatus?: string
  workorderId: string
}
