'use client'

import { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { usePDFDownload } from '@/hooks/pdf-download'
import AddWorkorderModal from '../../clients/_components/AddWorkorderModal'
import { formatUsdCompact } from '@/lib/formatCurrency'
import type { InvoiceRow } from './invoicesListTypes'
import InvoicesListHeader from './InvoicesListHeader'
import InvoicesOverviewCards from './InvoicesOverviewCards'
import InvoicesFiltersBar from './InvoicesFiltersBar'
import InvoicesTable from './InvoicesTable'
import { extractInvoicesResponse, apiInvoiceToRow, type InvoicesPagination } from '../_lib/invoiceListApi'
import {
  parseInvoiceOverviewResponse,
  sortByStatusRows,
  apiOverviewStatusToFilter,
  labelForApiOverviewStatus,
  bulletColorForApiOverviewStatus,
  type InvoiceOverviewData,
} from '../_lib/invoiceOverviewApi'

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'past due', label: 'Past due' },
  { value: 'sent but not due', label: 'Sent but not due' },
  { value: 'invoice pending to send', label: 'Invoice pending to send' },
  { value: 'waiting for payment', label: 'Waiting Payment' },
  { value: 'paid', label: 'Paid' },
  { value: 'bad debt', label: 'Bad Debt' },
  { value: 'cancelled', label: 'Cancelled' },
]

const DEFAULT_PAGE_LIMIT = 25

export default function InvoicesList() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const [sendingInvoiceId, setSendingInvoiceId] = useState<string | number | null>(null)
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false)
  const { downloadPDF } = usePDFDownload({ title: 'Invoice', filename: 'invoice' })
  const statusDropdownRef = useRef<HTMLDivElement>(null)

  const [allInvoiceRows, setAllInvoiceRows] = useState<InvoiceRow[]>([])
  const [pagination, setPagination] = useState<InvoicesPagination>({
    page: 1,
    limit: DEFAULT_PAGE_LIMIT,
    total: 0,
    totalPages: 1,
  })
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const [invoiceOverview, setInvoiceOverview] = useState<InvoiceOverviewData | null>(null)
  const [overviewLoading, setOverviewLoading] = useState(true)
  const [overviewError, setOverviewError] = useState<string | null>(null)

  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
      const qs = new URLSearchParams({ page: String(page), limit: String(DEFAULT_PAGE_LIMIT) })
      const res = await fetch(`${baseUrl}/api/invoices?${qs.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = (json as { message?: string }).message ?? `Failed to load invoices (${res.status})`
        setFetchError(msg)
        setAllInvoiceRows([])
        return
      }
      const parsed = extractInvoicesResponse(json)
      if (!parsed) {
        setFetchError('Invalid invoices response')
        setAllInvoiceRows([])
        return
      }
      setAllInvoiceRows(parsed.items.map((raw) => apiInvoiceToRow(raw)))
      setPagination(parsed.pagination)
    } catch {
      setFetchError('Failed to load invoices')
      setAllInvoiceRows([])
    } finally {
      setLoading(false)
    }
  }, [page])

  const fetchInvoiceOverview = useCallback(async () => {
    setOverviewLoading(true)
    setOverviewError(null)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
      const res = await fetch(`${baseUrl}/api/invoices/overview`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg =
          (json as { message?: string }).message ?? `Failed to load invoice overview (${res.status})`
        setOverviewError(msg)
        setInvoiceOverview(null)
        return
      }
      const parsed = parseInvoiceOverviewResponse(json)
      if (!parsed) {
        setOverviewError('Invalid invoice overview response')
        setInvoiceOverview(null)
        return
      }
      setInvoiceOverview(parsed)
    } catch {
      setOverviewError('Failed to load invoice overview')
      setInvoiceOverview(null)
    } finally {
      setOverviewLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  useEffect(() => {
    void fetchInvoiceOverview()
  }, [fetchInvoiceOverview])

  const filteredInvoices = useMemo(() => {
    return allInvoiceRows.filter((inv) => {
      const matchesSearch =
        inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.invoiceNumber !== '—' && inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [allInvoiceRows, searchTerm, statusFilter])

  const overviewLinks = useMemo(() => {
    if (!invoiceOverview) return []
    return sortByStatusRows(invoiceOverview.byStatus).map((row) => ({
      rowKey: row.status,
      status: apiOverviewStatusToFilter(row.status),
      label: labelForApiOverviewStatus(row.status),
      count: row.count,
      amount: row.total,
      bulletColor: bulletColorForApiOverviewStatus(row.status),
    }))
  }, [invoiceOverview])

  const issuedCount = invoiceOverview?.issuedLast30Days.count ?? 0
  const issuedTotal = invoiceOverview?.issuedLast30Days.total ?? 0
  const averageInvoiceLast30Days = invoiceOverview?.averageInvoiceLast30Days ?? 0

  const formatAmount = (n: number) => formatUsdCompact(n)

  const setFilterFromOverview = useCallback((status: string) => {
    setStatusFilter((prev) => (prev === status ? 'all' : status))
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false)
      }
    }
    if (isStatusDropdownOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isStatusDropdownOpen])

  const handleRowClick = (workorderId: string | number) => {
    router.push(`/workorders/${workorderId}`)
  }

  const handleSendInvoice = useCallback(
    async (invoiceId: string | number) => {
      const idStr = String(invoiceId ?? '').trim()
      if (!idStr) {
        alert('Missing invoice id.')
        return
      }
      setSendingInvoiceId(invoiceId)
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
        const res = await fetch(`${baseUrl}/api/invoices/${encodeURIComponent(idStr)}/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({}),
        })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) {
          const msg =
            (json as { message?: string }).message ??
            (json as { errors?: { message?: string }[] })?.errors?.[0]?.message ??
            `Failed to send invoice (${res.status})`
          alert(msg)
          return
        }
        const msg = (json as { message?: string }).message ?? 'Invoice sent successfully.'
        alert(msg)
        void fetchInvoices()
        void fetchInvoiceOverview()
      } catch (e) {
        alert(e instanceof Error ? e.message : 'Failed to send invoice')
      } finally {
        setSendingInvoiceId(null)
      }
    },
    [fetchInvoices, fetchInvoiceOverview],
  )

  const handleReviewInvoicePdf = useCallback(
    (inv: InvoiceRow) => {
      downloadPDF(
        [
          {
            Client: inv.clientName,
            'Invoice #': inv.invoiceNumber,
            Title: inv.title,
            'Due date': inv.dueDate ?? '—',
            Status: inv.status,
            Total: inv.total,
            Balance: inv.balance,
          },
        ],
        {
          filename: `invoice-${inv.id}`,
          title: 'Invoice',
          subtitle:
            inv.invoiceNumber !== '—' ? `${inv.invoiceNumber} — ${inv.title}` : inv.title,
        },
      )
    },
    [downloadPDF],
  )

  return (
    <div className="space-y-4">
      <InvoicesListHeader onNewInvoice={() => setIsNewInvoiceModalOpen(true)} />

      {overviewError && (
        <div className="p-3 rounded text-sm" style={{ backgroundColor: '#FEF2F2', color: '#B91C1C' }}>
          {overviewError}
        </div>
      )}

      <InvoicesOverviewCards
        overviewLinks={overviewLinks}
        statusFilter={statusFilter}
        setFilterFromOverview={setFilterFromOverview}
        formatAmount={formatAmount}
        issuedCount={issuedCount}
        issuedTotal={issuedTotal}
        averageInvoiceLast30Days={averageInvoiceLast30Days}
        overviewLoading={overviewLoading}
      />

      <div className="bg-white rounded shadow-sm border p-3" style={{ borderColor: '#EAEBED', marginTop: '2rem' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
          <div>
            <h2 className="text-base font-bold" style={{ color: '#1F271B' }}>
              All invoices ({filteredInvoices.length} result{filteredInvoices.length !== 1 ? 's' : ''})
            </h2>
            {!loading && pagination.total > 0 && (
              <p className="text-xs mt-0.5" style={{ color: '#1F271B', opacity: 0.6 }}>
                Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
              </p>
            )}
          </div>
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

        {fetchError && (
          <div className="mb-3 p-3 rounded text-sm" style={{ backgroundColor: '#FEF2F2', color: '#B91C1C' }}>
            {fetchError}
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center">
            <p className="text-sm" style={{ color: '#1F271B', opacity: 0.7 }}>
              Loading invoices…
            </p>
          </div>
        ) : (
          <InvoicesTable
            invoices={filteredInvoices}
            onRowClick={handleRowClick}
            onSendInvoice={handleSendInvoice}
            onReviewInvoice={handleReviewInvoicePdf}
            sendingInvoiceId={sendingInvoiceId}
          />
        )}

        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t" style={{ borderColor: '#EAEBED' }}>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded text-xs font-medium border disabled:opacity-40"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded text-xs font-medium border disabled:opacity-40"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {isNewInvoiceModalOpen && (
        <AddWorkorderModal
          isOpen={true}
          onClose={() => {
            setIsNewInvoiceModalOpen(false)
            void fetchInvoices()
            void fetchInvoiceOverview()
          }}
          mode="invoice-only"
        />
      )}
    </div>
  )
}
