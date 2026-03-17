'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { subDays } from 'date-fns'
import { mockWorkorders } from '@/data/mockData'
import SendEmailModal from '../../workorders/_components/SendEmailModal'
import AddWorkorderModal from '../../clients/_components/AddWorkorderModal'
import type { QuoteRow } from './quotesListTypes'
import QuotesListHeader from './QuotesListHeader'
import QuotesOverviewCards from './QuotesOverviewCards'
import QuotesFiltersBar from './QuotesFiltersBar'
import QuotesSelectionBar from './QuotesSelectionBar'
import QuotesTable from './QuotesTable'

function buildQuoteRows(): QuoteRow[] {
  const rows: QuoteRow[] = []
  mockWorkorders.forEach((wo: { id: number; quoteStatus?: string; quoteRequired?: boolean; quoteNumber?: string; clientName: string; title: string; total?: number; quoteDateSent?: string; quoteWhatsappStatus?: string }) => {
    const quoteRequired = (wo as { quoteRequired?: boolean }).quoteRequired === true
    const notSent = wo.quoteStatus === 'not sent'

    if (notSent) {
      if (quoteRequired) {
        rows.push({
          id: wo.id,
          quoteNumber: '—',
          clientName: wo.clientName,
          title: wo.title,
          total: wo.total ?? 0,
          dateSent: null,
          status: 'quote pending to send',
          workorderId: wo.id,
        })
      } else {
        rows.push({
          id: wo.id,
          quoteNumber: '—',
          clientName: wo.clientName,
          title: wo.title,
          total: wo.total ?? 0,
          dateSent: null,
          status: 'draft',
          workorderId: wo.id,
        })
      }
      return
    }
    if (wo.quoteNumber) {
      rows.push({
        id: wo.id,
        quoteNumber: wo.quoteNumber,
        clientName: wo.clientName,
        title: wo.title,
        total: wo.total ?? 0,
        dateSent: wo.quoteDateSent || null,
        status: (wo.quoteStatus as QuoteRow['status']) || 'waiting for approval',
        whatsappStatus: wo.quoteWhatsappStatus,
        workorderId: wo.id,
      })
    }
  })
  return rows
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
  const [isNewQuoteModalOpen, setIsNewQuoteModalOpen] = useState(false)
  const allQuoteRows = useMemo(() => buildQuoteRows(), [isNewQuoteModalOpen])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const [sendQuoteWorkorderId, setSendQuoteWorkorderId] = useState<number | null>(null)
  const [sendQuoteBulkWorkorderIds, setSendQuoteBulkWorkorderIds] = useState<number[] | null>(null)
  const [selectedQuoteIds, setSelectedQuoteIds] = useState<Set<number>>(new Set())
  const statusDropdownRef = useRef<HTMLDivElement>(null)
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null)

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
  const toggleQuoteSelection = (e: React.MouseEvent, quoteId: number) => {
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

  const overviewCounts = useMemo(() => ({
    draft: allQuoteRows.filter(q => q.status === 'draft').length,
    'awaiting response': allQuoteRows.filter(q => q.status === 'waiting for approval').length,
    'changes requested': allQuoteRows.filter(q => q.status === 'rejected').length,
    approved: allQuoteRows.filter(q => q.status === 'approved').length,
    'quote pending to send': allQuoteRows.filter(q => q.status === 'quote pending to send').length,
  }), [allQuoteRows])

  const sentPast30 = useMemo(() => {
    return allQuoteRows.filter(q => q.dateSent && new Date(q.dateSent) >= thirtyDaysAgo && q.status !== 'quote pending to send' && q.status !== 'draft')
  }, [allQuoteRows])

  const convertedPast30 = useMemo(() => {
    return allQuoteRows.filter(q => q.status === 'approved' && q.dateSent && new Date(q.dateSent) >= thirtyDaysAgo)
  }, [allQuoteRows])

  const conversionRate = sentPast30.length > 0 ? Math.round((convertedPast30.length / sentPast30.length) * 100) : 0
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

  const handleRowClick = (workorderId: number) => {
    router.push(`/workorders/${workorderId}`)
  }

  return (
    <div className="space-y-4">
      <QuotesListHeader onAddNewQuote={() => setIsNewQuoteModalOpen(true)} />

      <QuotesOverviewCards
        overviewLinks={overviewLinks}
        statusFilter={statusFilter}
        setFilterFromOverview={setFilterFromOverview}
        conversionRate={conversionRate}
        sentPast30Count={sentPast30.length}
        sentTotalValue={sentTotalValue}
        convertedPast30Count={convertedPast30.length}
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
          onSendQuote={setSendQuoteWorkorderId}
        />
      </div>

      {sendQuoteWorkorderId !== null && sendQuoteBulkWorkorderIds === null && (
        <SendEmailModal
          isOpen={true}
          onClose={() => setSendQuoteWorkorderId(null)}
          type="quote"
          workorderId={sendQuoteWorkorderId}
          workorderAttachments={[]}
          onAddWorkorderAttachment={() => {}}
          onSend={() => {
            setSendQuoteWorkorderId(null)
            alert('Quote sent successfully!')
          }}
        />
      )}

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
