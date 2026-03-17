'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { addDays, format as formatDate, subDays } from 'date-fns'
import { mockWorkorders } from '@/data/mockData'
import SendEmailModal from '../../workorders/_components/SendEmailModal'
import AddWorkorderModal from '../../clients/_components/AddWorkorderModal'
import type { InvoiceRow } from './invoicesListTypes'
import InvoicesListHeader from './InvoicesListHeader'
import InvoicesOverviewCards from './InvoicesOverviewCards'
import InvoicesFiltersBar from './InvoicesFiltersBar'
import InvoicesTable from './InvoicesTable'

function buildInvoiceRows(): InvoiceRow[] {
  const rows: InvoiceRow[] = []
  const today = formatDate(new Date(), 'yyyy-MM-dd')

  mockWorkorders.forEach((wo: {
    id: number
    invoiceStatus?: string
    invoiceDateSent?: string
    invoiceNumber?: string
    clientName: string
    title: string
    total?: number
    subtotal?: number
    jobStatus?: string
    payments?: { amount: number }[]
  }) => {
    const sent = wo.invoiceStatus !== 'not sent'
    const paid = (wo.payments?.reduce((sum, p) => sum + p.amount, 0) ?? 0)
    const total = wo.total ?? 0
    const balance = total - paid
    const subtotal = wo.subtotal ?? total
    const jobCompleted = wo.jobStatus === 'Completed'

    if (sent && wo.invoiceDateSent) {
      const dueDate = formatDate(addDays(new Date(wo.invoiceDateSent), 30), 'yyyy-MM-dd')
      const isPastDue = dueDate < today
      const rowStatus: InvoiceRow['status'] =
        wo.invoiceStatus === 'paid' ? 'paid'
          : wo.invoiceStatus === 'bad debt' ? 'bad debt'
            : isPastDue ? 'past due' : 'sent but not due'
      rows.push({
        id: wo.id,
        workorderId: wo.id,
        invoiceNumber: wo.invoiceNumber || '—',
        clientName: wo.clientName,
        title: wo.title,
        subtotal,
        total,
        balance,
        dueDate,
        dateSent: wo.invoiceDateSent,
        status: rowStatus,
      })
      return
    }
    if (jobCompleted) {
      rows.push({
        id: wo.id,
        workorderId: wo.id,
        invoiceNumber: '—',
        clientName: wo.clientName,
        title: wo.title,
        subtotal,
        total,
        balance: total,
        dueDate: null,
        dateSent: null,
        status: 'invoice pending to send',
      })
    }
  })

  return rows
}

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'past due', label: 'Past due' },
  { value: 'sent but not due', label: 'Sent but not due' },
  { value: 'invoice pending to send', label: 'Invoice pending to send' },
  { value: 'waiting for payment', label: 'Waiting Payment' },
  { value: 'paid', label: 'Paid' },
  { value: 'bad debt', label: 'Bad Debt' },
]

export default function InvoicesList() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const [sendInvoiceWorkorderId, setSendInvoiceWorkorderId] = useState<number | null>(null)
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false)
  const statusDropdownRef = useRef<HTMLDivElement>(null)

  const allInvoiceRows = useMemo(() => buildInvoiceRows(), [isNewInvoiceModalOpen])

  const filteredInvoices = useMemo(() => {
    return allInvoiceRows.filter(inv => {
      const matchesSearch = inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.invoiceNumber !== '—' && inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [allInvoiceRows, searchTerm, statusFilter])

  const overviewCounts = useMemo(() => {
    const pastDue = allInvoiceRows.filter(i => i.status === 'past due')
    const sentNotDue = allInvoiceRows.filter(i => i.status === 'sent but not due')
    const pendingToSend = allInvoiceRows.filter(i => i.status === 'invoice pending to send')
    return {
      pastDue: pastDue.length,
      pastDueAmount: pastDue.reduce((s, i) => s + i.total, 0),
      sentNotDue: sentNotDue.length,
      sentNotDueAmount: sentNotDue.reduce((s, i) => s + i.total, 0),
      pendingToSend: pendingToSend.length,
      pendingToSendAmount: pendingToSend.reduce((s, i) => s + i.total, 0),
    }
  }, [allInvoiceRows])

  const issuedPast30 = useMemo(() => {
    const thirtyDaysAgo = subDays(new Date(), 30)
    return allInvoiceRows.filter(i =>
      i.dateSent && new Date(i.dateSent) >= thirtyDaysAgo && i.status !== 'invoice pending to send'
    )
  }, [allInvoiceRows])

  const issuedCount = issuedPast30.length
  const issuedTotal = issuedPast30.reduce((s, i) => s + i.total, 0)
  const issuedSubtotal = issuedPast30.reduce((s, i) => s + i.subtotal, 0)
  const averageBeforeTax = issuedCount > 0 ? issuedSubtotal / issuedCount : 0

  const overviewLinks = useMemo(() => [
    { status: 'past due', label: 'Past due', count: overviewCounts.pastDue, amount: overviewCounts.pastDueAmount, bulletColor: '#DC2626' },
    { status: 'sent but not due', label: 'Sent but not due', count: overviewCounts.sentNotDue, amount: overviewCounts.sentNotDueAmount, bulletColor: '#D97706' },
    { status: 'invoice pending to send', label: 'Invoice pending to send', count: overviewCounts.pendingToSend, amount: overviewCounts.pendingToSendAmount, bulletColor: '#2B50AA' },
  ], [overviewCounts])

  const formatAmount = (n: number) => {
    if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`
    return `$${n.toLocaleString()}`
  }

  const setFilterFromOverview = (status: string) => {
    const map: Record<string, string> = {
      'past due': 'past due',
      'sent but not due': 'sent but not due',
      'invoice pending to send': 'invoice pending to send',
    }
    const filter = map[status] ?? status
    setStatusFilter(prev => prev === filter ? 'all' : filter)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false)
      }
    }
    if (isStatusDropdownOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isStatusDropdownOpen])

  const handleRowClick = (workorderId: number) => {
    router.push(`/workorders/${workorderId}`)
  }

  return (
    <div className="space-y-4">
      <InvoicesListHeader onNewInvoice={() => setIsNewInvoiceModalOpen(true)} />

      <InvoicesOverviewCards
        overviewLinks={overviewLinks}
        statusFilter={statusFilter}
        setFilterFromOverview={setFilterFromOverview}
        formatAmount={formatAmount}
        issuedCount={issuedCount}
        issuedTotal={issuedTotal}
        averageBeforeTax={averageBeforeTax}
      />

      <div className="bg-white rounded shadow-sm border p-3" style={{ borderColor: '#EAEBED', marginTop: '2rem' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
          <h2 className="text-base font-bold" style={{ color: '#1F271B' }}>
            All invoices ({filteredInvoices.length} result{filteredInvoices.length !== 1 ? 's' : ''})
          </h2>
          <InvoicesFiltersBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            statusFilterOptions={STATUS_FILTER_OPTIONS}
            isStatusDropdownOpen={isStatusDropdownOpen}
            setIsStatusDropdownOpen={setIsStatusDropdownOpen}
            statusDropdownRef={statusDropdownRef}
          />
        </div>

        <InvoicesTable
          invoices={filteredInvoices}
          onRowClick={handleRowClick}
          onSendInvoice={setSendInvoiceWorkorderId}
        />
      </div>

      {sendInvoiceWorkorderId !== null && (
        <SendEmailModal
          isOpen={true}
          onClose={() => setSendInvoiceWorkorderId(null)}
          type="invoice"
          workorderId={sendInvoiceWorkorderId}
          workorderAttachments={[]}
          onAddWorkorderAttachment={() => {}}
          onSend={() => {
            setSendInvoiceWorkorderId(null)
            alert('Invoice sent successfully!')
          }}
        />
      )}

      {isNewInvoiceModalOpen && (
        <AddWorkorderModal
          isOpen={true}
          onClose={() => setIsNewInvoiceModalOpen(false)}
          mode="invoice-only"
        />
      )}
    </div>
  )
}
