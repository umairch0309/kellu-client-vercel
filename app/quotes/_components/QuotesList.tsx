'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { subDays } from 'date-fns'
import { usePDFDownload } from '@/hooks/pdf-download'
import SendEmailModal from '../../workorders/_components/SendEmailModal'
import AddWorkorderModal from '../../clients/_components/AddWorkorderModal'
import type { QuoteRow } from './quotesListTypes'
import QuotesListHeader from './QuotesListHeader'
import QuotesOverviewCards from './QuotesOverviewCards'
import QuotesFiltersBar from './QuotesFiltersBar'
import QuotesSelectionBar from './QuotesSelectionBar'
import QuotesTable from './QuotesTable'

function extractQuotesList(json: unknown): unknown[] {
  if (json == null || typeof json !== 'object') return []
  const obj = json as Record<string, unknown>
  const data = obj.data
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const nested = (data as Record<string, unknown>).data
    if (Array.isArray(nested)) return nested
  }
  if (Array.isArray(data)) return data
  return []
}

function mapQuoteStatus(status: string): QuoteRow['status'] {
  const map: Record<string, QuoteRow['status']> = {
    NOT_SENT: 'quote pending to send',
    AWAITING_RESPONSE: 'waiting for approval',
    APPROVED: 'approved',
    CONVERTED: 'approved',
    REJECTED: 'rejected',
    EXPIRED: 'expired',
  }
  return map[status] ?? 'draft'
}

function normalizeQuoteFromApi(raw: Record<string, unknown>): QuoteRow {
  const id = raw.id != null ? String(raw.id) : ''
  const workOrderNumber =
    raw.workOrderNumber != null && String(raw.workOrderNumber).trim() !== ''
      ? String(raw.workOrderNumber)
      : '—'
  const client = (raw.client ?? {}) as Record<string, unknown>
  const clientName = typeof client.name === 'string' ? client.name : '—'
  const total =
    typeof raw.total === 'number' ? raw.total : typeof raw.total === 'string' ? parseFloat(raw.total) || 0 : 0
  const statusRaw = typeof raw.quoteStatus === 'string' ? raw.quoteStatus : ''
  const dateSent = raw.quoteSentAt != null ? String(raw.quoteSentAt) : null
  return {
    id,
    quoteNumber: workOrderNumber,
    clientName,
    title: typeof raw.title === 'string' ? raw.title : '—',
    total,
    dateSent,
    status: mapQuoteStatus(statusRaw),
    workorderId: id,
  }
}

type QuoteOverviewApiStatus = 'NOT_SENT' | 'AWAITING_RESPONSE' | 'APPROVED' | 'CONVERTED' | 'REJECTED' | 'EXPIRED'

type QuoteOverviewApiRow = {
  status: QuoteOverviewApiStatus
  count: number
}

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'quote pending to send', label: 'Quote pending to send' },
  { value: 'draft', label: 'Draft' },
  { value: 'waiting for approval', label: 'Awaiting response' },
  { value: 'rejected', label: 'Changes requested' },
  { value: 'approved', label: 'Approved' },
  { value: 'expired', label: 'Expired' },
]

export default function QuotesList() {
  const router = useRouter()
  const { downloadPDF } = usePDFDownload({ title: 'Quote', filename: 'quote' })
  const [isNewQuoteModalOpen, setIsNewQuoteModalOpen] = useState(false)
  const [allQuoteRows, setAllQuoteRows] = useState<QuoteRow[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [overviewRows, setOverviewRows] = useState<QuoteOverviewApiRow[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const [sendingQuoteIds, setSendingQuoteIds] = useState<Set<string>>(new Set())
  const [sendQuoteBulkWorkorderIds, setSendQuoteBulkWorkorderIds] = useState<string[] | null>(null)
  const [selectedQuoteIds, setSelectedQuoteIds] = useState<Set<string>>(new Set())
  const statusDropdownRef = useRef<HTMLDivElement>(null)
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null)

  const fetchQuotes = async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
      const res = await fetch(`${baseUrl}/api/quotes`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || (json as { success?: boolean }).success === false) {
        const msg = (json as { message?: string }).message ?? `Failed to load quotes (${res.status})`
        throw new Error(msg)
      }
      const rows = extractQuotesList(json)
        .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
        .map((item) => normalizeQuoteFromApi(item))
      setAllQuoteRows(rows)
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : 'Failed to load quotes')
      setAllQuoteRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchQuotes()
  }, [isNewQuoteModalOpen])

  const fetchOverview = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
      const res = await fetch(`${baseUrl}/api/quotes/overview`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || (json as { success?: boolean }).success === false) {
        setOverviewRows([])
        return
      }
      const data = (json as { data?: unknown }).data
      if (!Array.isArray(data)) {
        setOverviewRows([])
        return
      }
      const rows = data
        .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
        .map((item) => ({
          status: String(item.status) as QuoteOverviewApiStatus,
          count: Number(item.count) || 0,
        }))
      setOverviewRows(rows)
    } catch {
      setOverviewRows([])
    }
  }

  useEffect(() => {
    void fetchOverview()
  }, [isNewQuoteModalOpen])

  const filteredQuotes = useMemo(() => {
    return allQuoteRows.filter(quote => {
      const matchesSearch = quote.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (quote.quoteNumber && quote.quoteNumber !== '—' && quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesStatus = statusFilter === 'all' || quote.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [allQuoteRows, searchTerm, statusFilter])

  const allFilteredSelected = filteredQuotes.length > 0 && filteredQuotes.every(q => selectedQuoteIds.has(q.id))
  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedQuoteIds(prev => {
        const next = new Set(prev)
        filteredQuotes.forEach(q => next.delete(q.id))
        return next
      })
    } else {
      setSelectedQuoteIds(prev => {
        const next = new Set(prev)
        filteredQuotes.forEach(q => next.add(q.id))
        return next
      })
    }
  }
  const toggleQuoteSelection = (e: React.MouseEvent, quoteId: string) => {
    e.stopPropagation()
    setSelectedQuoteIds(prev => {
      const next = new Set(prev)
      if (next.has(quoteId)) next.delete(quoteId)
      else next.add(quoteId)
      return next
    })
  }
  const handleDeselectAllQuotes = () => setSelectedQuoteIds(new Set())

  const now = new Date()
  const thirtyDaysAgo = subDays(now, 30)

  const overviewCounts = useMemo(() => {
    const byStatus: Record<string, number> = {}
    overviewRows.forEach((row) => {
      byStatus[row.status] = (byStatus[row.status] ?? 0) + row.count
    })
    const hasOverviewApi = overviewRows.length > 0
    if (hasOverviewApi) {
      return {
        draft: 0,
        'awaiting response': byStatus.AWAITING_RESPONSE ?? 0,
        'changes requested': byStatus.REJECTED ?? 0,
        approved: (byStatus.APPROVED ?? 0) + (byStatus.CONVERTED ?? 0),
        'quote pending to send': byStatus.NOT_SENT ?? 0,
        sentCount: (byStatus.AWAITING_RESPONSE ?? 0) + (byStatus.APPROVED ?? 0) + (byStatus.CONVERTED ?? 0) + (byStatus.REJECTED ?? 0) + (byStatus.EXPIRED ?? 0),
        convertedCount: (byStatus.APPROVED ?? 0) + (byStatus.CONVERTED ?? 0),
        hasOverviewApi,
      }
    }
    return {
      draft: allQuoteRows.filter(q => q.status === 'draft').length,
      'awaiting response': allQuoteRows.filter(q => q.status === 'waiting for approval').length,
      'changes requested': allQuoteRows.filter(q => q.status === 'rejected').length,
      approved: allQuoteRows.filter(q => q.status === 'approved').length,
      'quote pending to send': allQuoteRows.filter(q => q.status === 'quote pending to send').length,
      sentCount: allQuoteRows.filter(q => q.status !== 'quote pending to send' && q.status !== 'draft').length,
      convertedCount: allQuoteRows.filter(q => q.status === 'approved').length,
      hasOverviewApi,
    }
  }, [overviewRows, allQuoteRows])

  const sentPast30 = useMemo(() => {
    return allQuoteRows.filter(q => q.dateSent && new Date(q.dateSent) >= thirtyDaysAgo && q.status !== 'quote pending to send' && q.status !== 'draft')
  }, [allQuoteRows])

  const convertedPast30 = useMemo(() => {
    return allQuoteRows.filter(q => q.status === 'approved' && q.dateSent && new Date(q.dateSent) >= thirtyDaysAgo)
  }, [allQuoteRows])

  const conversionRate =
    overviewCounts.sentCount > 0
      ? Math.round((overviewCounts.convertedCount / overviewCounts.sentCount) * 100)
      : sentPast30.length > 0
        ? Math.round((convertedPast30.length / sentPast30.length) * 100)
        : 0
  const sentTotalValue = sentPast30.reduce((sum, q) => sum + q.total, 0)
  const convertedTotalValue = convertedPast30.reduce((sum, q) => sum + q.total, 0)

  const overviewLinks = useMemo(() => [
    { status: 'draft', label: 'Draft', count: overviewCounts.draft, bulletColor: '#2B50AA' },
    { status: 'awaiting response', label: 'Awaiting response', count: overviewCounts['awaiting response'], bulletColor: '#D97706' },
    { status: 'changes requested', label: 'Changes requested', count: overviewCounts['changes requested'], bulletColor: '#DC2626' },
    { status: 'approved', label: 'Approved', count: overviewCounts.approved, bulletColor: '#059669' },
    { status: 'quote pending to send', label: 'Quote pending to send', count: overviewCounts['quote pending to send'], bulletColor: '#7C3AED' },
  ], [overviewCounts])

  const setFilterFromOverview = (status: string) => {
    const map: Record<string, string> = {
      'draft': 'draft',
      'awaiting response': 'waiting for approval',
      'changes requested': 'rejected',
      'approved': 'approved',
      'quote pending to send': 'quote pending to send',
    }
    const filter = map[status] ?? status
    setStatusFilter(prev => prev === filter ? 'all' : filter)
  }

  useEffect(() => {
    const el = selectAllCheckboxRef.current
    if (!el) return
    const n = filteredQuotes.length
    const selected = selectedQuoteIds.size
    ;(el as HTMLInputElement & { indeterminate: boolean }).indeterminate = n > 0 && selected > 0 && selected < n
  }, [filteredQuotes.length, selectedQuoteIds.size])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false)
      }
    }
    if (isStatusDropdownOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isStatusDropdownOpen])

  const handleRowClick = (workorderId: string) => {
    router.push(`/workorders/${workorderId}`)
  }

  const handleSendQuote = async (quoteId: string) => {
    if (!quoteId || sendingQuoteIds.has(quoteId)) return
    setSendingQuoteIds((prev) => new Set(prev).add(quoteId))
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
      const res = await fetch(`${baseUrl}/api/quotes/${encodeURIComponent(quoteId)}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ observations: null }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || (json as { success?: boolean }).success === false) {
        const msg =
          (json as { message?: string }).message ??
          (json as { errors?: { message?: string }[] })?.errors?.[0]?.message ??
          `Failed to send quote (${res.status})`
        alert(msg)
        return
      }
      alert((json as { message?: string }).message ?? 'Quote sent successfully.')
      await Promise.all([fetchQuotes(), fetchOverview()])
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to send quote')
    } finally {
      setSendingQuoteIds((prev) => {
        const next = new Set(prev)
        next.delete(quoteId)
        return next
      })
    }
  }

  // Approval actions temporarily disabled (manual approve/reject)

  const handleReviewQuotePdf = (quote: QuoteRow) => {
    downloadPDF(
      [
        {
          Client: quote.clientName,
          'Quote #': quote.quoteNumber,
          Title: quote.title,
          Status: quote.status,
          'Date sent': quote.dateSent ?? '—',
          Total: quote.total,
        },
      ],
      {
        filename: `quote-${quote.id}`,
        title: 'Quote',
        subtitle: quote.quoteNumber !== '—' ? `${quote.quoteNumber} — ${quote.title}` : quote.title,
      },
    )
  }

  return (
    <div className="space-y-4">
      <QuotesListHeader onAddNewQuote={() => setIsNewQuoteModalOpen(true)} />

      <QuotesOverviewCards
        overviewLinks={overviewLinks}
        statusFilter={statusFilter}
        setFilterFromOverview={setFilterFromOverview}
        conversionRate={conversionRate}
        sentPast30Count={overviewCounts.sentCount}
        sentTotalValue={sentTotalValue}
        convertedPast30Count={overviewCounts.convertedCount}
        convertedTotalValue={convertedTotalValue}
      />

      <div className="bg-white rounded shadow-sm border p-3" style={{ borderColor: '#EAEBED', marginTop: '2rem' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
          <h2 className="text-base font-bold" style={{ color: '#1F271B' }}>
            All quotes ({filteredQuotes.length} result{filteredQuotes.length !== 1 ? 's' : ''})
          </h2>
          <QuotesFiltersBar
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
          <div className="mb-3 rounded border px-3 py-2 text-xs" style={{ borderColor: '#FCA5A5', color: '#B91C1C', backgroundColor: '#FEF2F2' }}>
            {fetchError}
          </div>
        )}

        {selectedQuoteIds.size > 0 && (
          <QuotesSelectionBar
            selectedCount={selectedQuoteIds.size}
            onDeselectAll={handleDeselectAllQuotes}
            onBulkSend={() => {
              if (selectedQuoteIds.size > 0) setSendQuoteBulkWorkorderIds(Array.from(selectedQuoteIds))
            }}
          />
        )}

        <QuotesTable
          quotes={filteredQuotes}
          selectedQuoteIds={selectedQuoteIds}
          allFilteredSelected={allFilteredSelected}
          selectAllCheckboxRef={selectAllCheckboxRef}
          onToggleSelectAll={toggleSelectAll}
          onToggleQuoteSelection={toggleQuoteSelection}
          onRowClick={handleRowClick}
          onSendQuote={handleSendQuote}
          onReviewQuote={handleReviewQuotePdf}
          sendingQuoteIds={sendingQuoteIds}
        />

        {loading && (
          <p className="text-xs mt-2" style={{ color: '#1F271B', opacity: 0.6 }}>
            Loading quotes...
          </p>
        )}
      </div>

      {isNewQuoteModalOpen && (
        <AddWorkorderModal
          isOpen={true}
          onClose={() => setIsNewQuoteModalOpen(false)}
          mode="quote-only"
        />
      )}

      {sendQuoteBulkWorkorderIds !== null && sendQuoteBulkWorkorderIds.length > 0 && (
        <SendEmailModal
          isOpen={true}
          onClose={() => { setSendQuoteBulkWorkorderIds(null); setSelectedQuoteIds(new Set()) }}
          type="quote"
          workorderId={sendQuoteBulkWorkorderIds[0]}
          workorderIds={sendQuoteBulkWorkorderIds}
          workorderAttachments={[]}
          onAddWorkorderAttachment={() => {}}
          onSend={(selectedIds) => {
            const count = selectedIds?.length ?? sendQuoteBulkWorkorderIds.length
            setSendQuoteBulkWorkorderIds(null)
            setSelectedQuoteIds(new Set())
            alert(`Quote${count !== 1 ? 's' : ''} sent successfully (${count} email${count !== 1 ? 's' : ''} – each to its recipient only).`)
          }}
        />
      )}
    </div>
  )
}
