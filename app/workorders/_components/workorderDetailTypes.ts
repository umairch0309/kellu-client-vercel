/** Shared types for WorkorderDetailView and its subcomponents */

export interface LineItemForm {
  name: string
  description: string
  quantity: number
  unitPrice: number
  unitCost: number
}

export interface ExpenseForm {
  date: string
  itemName: string
  details: string
  total: number
  linkedWorkorder: number | null
  invoiceNumber: string
  attachment: File | null
}

export interface PaymentForm {
  date: string
  amount: number
  method: string
  reference: string
  notes: string
}
