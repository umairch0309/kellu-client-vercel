'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiSearch, FiFileText, FiSend, FiChevronDown, FiChevronRight, FiTrendingUp, FiPlus } from 'react-icons/fi'
import { format, subDays, addDays } from 'date-fns'
import { mockWorkorders } from '@/data/mockData'
import SendEmailModal from '../../workorders/_components/SendEmailModal'
import AddWorkorderModal from '../../clients/_components/AddWorkorderModal'

type InvoiceRowStatus = 'past due' | 'sent but not due' | 'invoice pending to send' | 'waiting for payment' | 'paid' | 'bad debt'

function buildInvoiceRows() {
  const rows: Array<{
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
  }> = []
  const today = format(new Date(), 'yyyy-MM-dd')

  mockWorkorders.forEach(wo => {
    const sent = wo.invoiceStatus !== 'not sent'
    const paid = (wo.payments?.reduce((sum, p) => sum + p.amount, 0) ?? 0)
    const total = wo.total ?? 0
    const balance = total - paid
    const subtotal = (wo as { subtotal?: number }).subtotal ?? total
    const jobCompleted = wo.jobStatus === 'Completed'

    if (sent && wo.invoiceDateSent) {
      const dueDate = format(addDays(new Date(wo.invoiceDateSent), 30), 'yyyy-MM-dd')
      const isPastDue = dueDate < today
      const rowStatus: InvoiceRowStatus = wo.invoiceStatus === 'paid' ? 'paid' : wo.invoiceStatus === 'bad debt' ? 'bad debt' : isPastDue ? 'past due' : 'sent but not due'
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
    // Not sent: only include "Invoice pending to send" (job completed, invoice not sent)
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

export default function InvoicesList() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const [sendInvoiceWorkorderId, setSendInvoiceWorkorderId] = useState<number | null>(null)
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false)
  const statusDropdownRef = useRef<HTMLDivElement>(null)

  const allInvoiceRows = useMemo(() => buildInvoiceRows(), [isNewInvoiceModalOpen])

  const statusFilterOptions: { value: string; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'past due', label: 'Past due' },
    { value: 'sent but not due', label: 'Sent but not due' },
    { value: 'invoice pending to send', label: 'Invoice pending to send' },
    { value: 'waiting for payment', label: 'Waiting Payment' },
    { value: 'paid', label: 'Paid' },
    { value: 'bad debt', label: 'Bad Debt' },
  ]

  const filteredInvoices = allInvoiceRows.filter(inv => {
    const matchesSearch = inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (inv.invoiceNumber !== '—' && inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const now = new Date()
  const thirtyDaysAgo = subDays(now, 30)

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
    return allInvoiceRows.filter(i =>
      i.dateSent && new Date(i.dateSent) >= thirtyDaysAgo && i.status !== 'invoice pending to send'
    )
  }, [allInvoiceRows])

  const issuedCount = issuedPast30.length
  const issuedTotal = issuedPast30.reduce((s, i) => s + i.total, 0)
  const issuedSubtotal = issuedPast30.reduce((s, i) => s + i.subtotal, 0)
  const averageBeforeTax = issuedCount > 0 ? issuedSubtotal / issuedCount : 0

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false)
      }
    }
    if (isStatusDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isStatusDropdownOpen])

  const handleRowClick = (workorderId: number) => {
    router.push(`/workorders/${workorderId}`)
  }

  const getStatusColor = (status: string) => {
    if (status === 'paid') return { bg: 'rgba(40, 175, 176, 0.2)', text: '#1E8A8B' }
    if (status === 'waiting for payment') return { bg: 'rgba(245, 158, 11, 0.2)', text: '#B45309' }
    if (status === 'past due') return { bg: 'rgba(239, 68, 68, 0.15)', text: '#DC2626' }
    if (status === 'sent but not due') return { bg: 'rgba(59, 130, 246, 0.2)', text: '#2563EB' }
    if (status === 'invoice pending to send') return { bg: 'rgba(245, 158, 11, 0.2)', text: '#B45309' }
    if (status === 'bad debt') return { bg: 'rgba(239, 68, 68, 0.15)', text: '#DC2626' }
    return { bg: '#F3F4F6', text: '#1F271B' }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'past due': 'Past due',
      'sent but not due': 'Sent but not due',
      'invoice pending to send': 'Invoice pending to send',
      'waiting for payment': 'Waiting Payment',
      'paid': 'Paid',
      'bad debt': 'Bad Debt',
    }
    return labels[status] ?? status
  }

  const overviewLinks: { status: string; label: string; count: number; amount: number; bulletColor: string }[] = [
    { status: 'past due', label: 'Past due', count: overviewCounts.pastDue, amount: overviewCounts.pastDueAmount, bulletColor: '#DC2626' },
    { status: 'sent but not due', label: 'Sent but not due', count: overviewCounts.sentNotDue, amount: overviewCounts.sentNotDueAmount, bulletColor: '#D97706' },
    { status: 'invoice pending to send', label: 'Invoice pending to send', count: overviewCounts.pendingToSend, amount: overviewCounts.pendingToSendAmount, bulletColor: '#2B50AA' },
  ]

  const setFilterFromOverview = (status: string) => {
    const map: Record<string, string> = {
      'past due': 'past due',
      'sent but not due': 'sent but not due',
      'invoice pending to send': 'invoice pending to send',
    }
    const filter = map[status] ?? status
    setStatusFilter(prev => prev === filter ? 'all' : filter)
  }

  const formatAmount = (n: number) => {
    if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`
    return `$${n.toLocaleString()}`
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#1F271B' }}>Invoices</h1>
        <button
          type="button"
          onClick={() => setIsNewInvoiceModalOpen(true)}
          className="px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1.5 transition-all shrink-0"
          style={{ backgroundColor: '#28AFB0', color: 'white' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E8A8B' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#28AFB0' }}
        >
          <FiPlus size={16} />
          <span>New Invoice</span>
        </button>
      </div>

      {/* Top section: Overview, Issued, Average invoice (match Workorders layout: colored top bar, chevron, shadow) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Card 1: Overview */}
        <div
          className="rounded shadow-sm border overflow-hidden transition-all hover:shadow-md"
          style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <div className="h-0.5" style={{ backgroundColor: '#28AFB0' }} />
          <div className="p-3">
            <div className="flex justify-between items-start mb-1.5">
              <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Overview</p>
              <FiChevronRight size={12} style={{ color: '#1F271B', opacity: 0.5 }} />
            </div>
            <div className="space-y-1.5">
              {overviewLinks.map(({ status, label, count, amount, bulletColor }) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFilterFromOverview(status)}
                  className="w-full flex items-center justify-between py-0.5 px-1 -mx-1 rounded text-left hover:bg-black/5 transition-colors"
                  style={{ backgroundColor: statusFilter === status ? 'rgba(40, 175, 176, 0.12)' : 'transparent' }}
                >
                  <span className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: bulletColor }} />
                    <span className="text-[10px] truncate" style={{ color: '#1F271B', opacity: 0.7 }}>{label}</span>
                  </span>
                  <span className="text-xs font-semibold shrink-0 text-right" style={{ color: '#1F271B' }}>{count} · {formatAmount(amount)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Issued */}
        <div
          className="rounded shadow-sm border overflow-hidden transition-all hover:shadow-md"
          style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <div className="h-0.5" style={{ backgroundColor: '#28AFB0' }} />
          <div className="p-3">
            <div className="flex justify-between items-start mb-1.5">
              <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Issued</p>
              <FiChevronRight size={12} style={{ color: '#1F271B', opacity: 0.5 }} />
            </div>
            <p className="text-[10px] mb-1.5" style={{ color: '#1F271B', opacity: 0.6 }}>Past 30 days</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-bold" style={{ color: '#1F271B' }}>{issuedCount}</span>
              {issuedCount > 0 && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#15803D' }}>
                  <FiTrendingUp size={12} /> +100%
                </span>
              )}
            </div>
            <p className="text-xs mt-1" style={{ color: '#1F271B', opacity: 0.8 }}>{formatAmount(issuedTotal)}</p>
          </div>
        </div>

        {/* Card 3: Average invoice */}
        <div
          className="rounded shadow-sm border overflow-hidden transition-all hover:shadow-md"
          style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <div className="h-0.5" style={{ backgroundColor: '#2B50AA' }} />
          <div className="p-3">
            <div className="flex justify-between items-start mb-1.5">
              <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Average invoice</p>
              <FiChevronRight size={12} style={{ color: '#1F271B', opacity: 0.5 }} />
            </div>
            <p className="text-[10px] mb-1.5" style={{ color: '#1F271B', opacity: 0.6 }}>Past 30 days</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-bold" style={{ color: '#1F271B' }}>{issuedCount > 0 ? formatAmount(averageBeforeTax) : '$0'}</span>
              {issuedCount > 0 && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#15803D' }}>
                  <FiTrendingUp size={12} /> +100%
                </span>
              )}
            </div>
            <p className="text-[10px] mt-1" style={{ color: '#1F271B', opacity: 0.6 }}>Before taxes</p>
          </div>
        </div>
      </div>

      {/* Table section */}
      <div className="bg-white rounded shadow-sm border p-3" style={{ borderColor: '#EAEBED', marginTop: '2rem' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
          <h2 className="text-base font-bold" style={{ color: '#1F271B' }}>All invoices ({filteredInvoices.length} result{filteredInvoices.length !== 1 ? 's' : ''})</h2>
          <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end flex-wrap">
            <div className="relative">
              <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2" size={14} style={{ color: '#1F271B', opacity: 0.5 }} />
              <input
                type="text"
                placeholder="Search by client, title, or invoice #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 pr-3 py-1.5 border rounded text-xs transition-all"
                style={{ borderColor: '#EAEBED', color: '#1F271B', minWidth: '200px' }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#28AFB0'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#EAEBED'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>
            <div className="relative" ref={statusDropdownRef}>
              <button
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="px-2.5 py-1.5 rounded border text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md"
                style={{
                  backgroundColor: statusFilter === 'all' ? '#F3F4F6' : 'white',
                  borderColor: '#EAEBED',
                  color: '#1F271B',
                }}
              >
                <span className="font-semibold" style={{ color: '#1F271B' }}>Status</span>
                <span style={{ color: '#1F271B', opacity: 0.5 }}>|</span>
                <span style={{ color: '#1F271B', opacity: 0.8 }}>
                  {statusFilterOptions.find(o => o.value === statusFilter)?.label ?? statusFilter}
                </span>
                <FiChevronDown size={12} className={`transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} style={{ color: '#1F271B', opacity: 0.6 }} />
              </button>
              {isStatusDropdownOpen && (
                <div className="absolute right-0 mt-1 bg-white rounded shadow-lg border z-10 min-w-[200px] py-1" style={{ borderColor: '#EAEBED' }}>
                  {statusFilterOptions.map((opt, idx) => (
                    <span key={opt.value}>
                      {idx > 0 && <div className="mx-2 border-t" style={{ borderStyle: 'dashed', borderColor: '#EAEBED' }} />}
                      <button
                        onClick={() => {
                          setStatusFilter(opt.value)
                          setIsStatusDropdownOpen(false)
                        }}
                        className="w-full text-left px-2 py-1.5 text-xs transition-colors"
                        style={{ color: '#1F271B', backgroundColor: statusFilter === opt.value ? '#F3F4F6' : 'white' }}
                      >
                        {opt.label}
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {filteredInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderBottomColor: '#EAEBED' }}>
                  <th className="text-left py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>CLIENT</th>
                  <th className="text-left py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>INVOICE # / TITLE</th>
                  <th className="text-left py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>DUE DATE</th>
                  <th className="text-left py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>STATUS</th>
                  <th className="text-right py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>TOTAL</th>
                  <th className="text-right py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>BALANCE</th>
                  <th className="text-right py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => {
                  const statusColors = getStatusColor(inv.status)
                  return (
                    <tr
                      key={inv.id}
                      onClick={() => handleRowClick(inv.workorderId)}
                      className="border-b cursor-pointer transition-colors hover:bg-gray-50"
                      style={{ borderBottomColor: '#EAEBED' }}
                    >
                      <td className="py-2 px-2 text-xs" style={{ color: '#1F271B' }}>{inv.clientName}</td>
                      <td className="py-2 px-2">
                        <p className="text-xs font-medium" style={{ color: '#1F271B' }}>{inv.invoiceNumber}{inv.title ? ` ${inv.title}` : ''}</p>
                      </td>
                      <td className="py-2 px-2 text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>
                        {inv.dueDate ? format(new Date(inv.dueDate), 'MMM dd, yyyy') : '—'}
                      </td>
                      <td className="py-2 px-2">
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: statusColors.bg, color: statusColors.text }}>
                          {getStatusLabel(inv.status)}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right">
                        <span className="text-xs font-semibold" style={{ color: '#1F271B' }}>${inv.total.toLocaleString()}</span>
                      </td>
                      <td className="py-2 px-2 text-right">
                        <span className={`text-xs font-semibold ${inv.balance === 0 ? 'text-secondary' : 'text-tertiary'}`}>
                          ${inv.balance.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          {(inv.status === 'invoice pending to send' || inv.dateSent) && (
                            <button
                              onClick={() => setSendInvoiceWorkorderId(inv.workorderId)}
                              className="p-1.5 rounded transition-all"
                              style={{ color: '#28AFB0', backgroundColor: 'transparent' }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F0FDFA' }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                              title={inv.dateSent ? 'Resend Invoice' : 'Send Invoice'}
                            >
                              <FiSend size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => alert('Review generated documents / PDF would open here')}
                            className="p-1.5 rounded transition-all"
                            style={{ color: '#1F271B', backgroundColor: 'transparent' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                            title="Review generated documents"
                          >
                            <FiFileText size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm" style={{ color: '#1F271B', opacity: 0.6 }}>No invoices found.</p>
          </div>
        )}
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
