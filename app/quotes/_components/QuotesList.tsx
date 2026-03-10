'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { FiSearch, FiFileText, FiSend, FiChevronDown, FiChevronRight, FiTrendingUp, FiPlus } from 'react-icons/fi'
import { format, subDays } from 'date-fns'
import { mockWorkorders } from '@/data/mockData'
import SendEmailModal from '../../workorders/_components/SendEmailModal'
import AddWorkorderModal from '../../clients/_components/AddWorkorderModal'

type QuoteRowStatus = 'quote pending to send' | 'draft' | 'waiting for approval' | 'rejected' | 'expired' | 'approved'

function buildQuoteRows() {
  const rows: Array<{
    id: number
    quoteNumber: string
    clientName: string
    title: string
    total: number
    dateSent: string | null
    status: QuoteRowStatus
    whatsappStatus?: string
    workorderId: number
  }> = []
  const now = new Date()
  const thirtyDaysAgo = subDays(now, 30)

  mockWorkorders.forEach(wo => {
    const quoteRequired = (wo as any).quoteRequired === true
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
        status: (wo.quoteStatus as QuoteRowStatus) || 'waiting for approval',
        whatsappStatus: wo.quoteWhatsappStatus,
        workorderId: wo.id,
      })
    }
  })

  return rows
}

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

  const statusFilterOptions: { value: string; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'quote pending to send', label: 'Quote pending to send' },
    { value: 'draft', label: 'Draft' },
    { value: 'waiting for approval', label: 'Awaiting response' },
    { value: 'rejected', label: 'Changes requested' },
    { value: 'approved', label: 'Approved' },
    { value: 'expired', label: 'Expired' },
  ]

  const filteredQuotes = allQuoteRows.filter(quote => {
    const matchesSearch = quote.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (quote.quoteNumber && quote.quoteNumber !== '—' && quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
  }), [])

  const sentPast30 = useMemo(() => {
    return allQuoteRows.filter(q => q.dateSent && new Date(q.dateSent) >= thirtyDaysAgo && q.status !== 'quote pending to send' && q.status !== 'draft')
  }, [])

  const convertedPast30 = useMemo(() => {
    return allQuoteRows.filter(q => q.status === 'approved' && q.dateSent && new Date(q.dateSent) >= thirtyDaysAgo)
  }, [])

  const conversionRate = sentPast30.length > 0 ? Math.round((convertedPast30.length / sentPast30.length) * 100) : 0
  const sentTotalValue = sentPast30.reduce((sum, q) => sum + q.total, 0)
  const convertedTotalValue = convertedPast30.reduce((sum, q) => sum + q.total, 0)

  useEffect(() => {
    const el = selectAllCheckboxRef.current
    if (!el) return
    const n = filteredQuotes.length
    const selected = selectedQuoteIds.size
    ;(el as HTMLInputElement & { indeterminate: boolean }).indeterminate = n > 0 && selected > 0 && selected < n
  }, [filteredQuotes.length, selectedQuoteIds.size])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false)
      }
    }
    if (isStatusDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isStatusDropdownOpen])

  const handleRowClick = (workorderId: number) => {
    router.push(`/workorders/${workorderId}`)
  }

  const getStatusColor = (status: string) => {
    if (status === 'approved') return { bg: 'rgba(40, 175, 176, 0.2)', text: '#1E8A8B' }
    if (status === 'waiting for approval') return { bg: 'rgba(176, 132, 204, 0.2)', text: '#8B6AA3' }
    if (status === 'rejected' || status === 'expired') return { bg: 'rgba(239, 68, 68, 0.15)', text: '#DC2626' }
    if (status === 'quote pending to send') return { bg: 'rgba(245, 158, 11, 0.2)', text: '#B45309' }
    if (status === 'draft') return { bg: '#F3F4F6', text: '#1F271B' }
    return { bg: '#F3F4F6', text: '#1F271B' }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'approved': 'Approved',
      'waiting for approval': 'Awaiting response',
      'rejected': 'Changes requested',
      'expired': 'Expired',
      'quote pending to send': 'Quote pending to send',
      'draft': 'Draft',
    }
    return labels[status] ?? status
  }

  const overviewLinks: { status: string; label: string; count: number; bulletColor: string }[] = [
    { status: 'draft', label: 'Draft', count: overviewCounts.draft, bulletColor: '#2B50AA' },
    { status: 'awaiting response', label: 'Awaiting response', count: overviewCounts['awaiting response'], bulletColor: '#D97706' },
    { status: 'changes requested', label: 'Changes requested', count: overviewCounts['changes requested'], bulletColor: '#DC2626' },
    { status: 'approved', label: 'Approved', count: overviewCounts.approved, bulletColor: '#059669' },
    { status: 'quote pending to send', label: 'Quote pending to send', count: overviewCounts['quote pending to send'], bulletColor: '#7C3AED' },
  ]

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#1F271B' }}>Quotes</h1>
        <button
          type="button"
          onClick={() => setIsNewQuoteModalOpen(true)}
          className="px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1.5 transition-all shrink-0"
          style={{ backgroundColor: '#28AFB0', color: 'white' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E8A8B' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#28AFB0' }}
        >
          <FiPlus size={16} />
          <span>Add New Quote</span>
        </button>
      </div>

      {/* Top section: 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Overview */}
        <div
          className="rounded shadow-sm border overflow-hidden transition-all hover:shadow-md"
          style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <div className="h-0.5" style={{ backgroundColor: '#B084CC' }} />
          <div className="p-3">
            <div className="flex justify-between items-start mb-1.5">
              <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Overview</p>
              <FiChevronRight size={12} style={{ color: '#1F271B', opacity: 0.5 }} />
            </div>
            <div className="space-y-1.5">
              {overviewLinks.map(({ status, label, count, bulletColor }) => {
                const filterValue = status === 'awaiting response' ? 'waiting for approval' : status === 'changes requested' ? 'rejected' : status
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFilterFromOverview(status)}
                    className="w-full flex items-center justify-between py-0.5 px-1 -mx-1 rounded text-left hover:bg-black/5 transition-colors"
                    style={{ backgroundColor: statusFilter === filterValue ? 'rgba(176, 132, 204, 0.15)' : 'transparent' }}
                  >
                    <span className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: bulletColor }} />
                      <span className="text-[10px]" style={{ color: '#1F271B', opacity: 0.7 }}>{label}</span>
                    </span>
                    <span className="text-xs font-semibold shrink-0" style={{ color: '#1F271B' }}>{count}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Card 2: Conversion rate */}
        <div
          className="rounded shadow-sm border overflow-hidden transition-all hover:shadow-md"
          style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <div className="h-0.5" style={{ backgroundColor: '#2B50AA' }} />
          <div className="p-3">
            <div className="flex justify-between items-start mb-1.5">
              <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Conversion rate</p>
              <FiChevronRight size={12} style={{ color: '#1F271B', opacity: 0.5 }} />
            </div>
            <p className="text-[10px] mb-1.5" style={{ color: '#1F271B', opacity: 0.6 }}>Past 30 days</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold" style={{ color: '#1F271B' }}>{conversionRate}%</span>
              <span className="text-sm" style={{ color: '#1F271B', opacity: 0.6 }}>{conversionRate}%</span>
            </div>
          </div>
        </div>

        {/* Card 3: Sent */}
        <div
          className="rounded shadow-sm border overflow-hidden transition-all hover:shadow-md"
          style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <div className="h-0.5" style={{ backgroundColor: '#28AFB0' }} />
          <div className="p-3">
            <div className="flex justify-between items-start mb-1.5">
              <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Sent</p>
              <FiChevronRight size={12} style={{ color: '#1F271B', opacity: 0.5 }} />
            </div>
            <p className="text-[10px] mb-1.5" style={{ color: '#1F271B', opacity: 0.6 }}>Past 30 days</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-bold" style={{ color: '#1F271B' }}>{sentPast30.length}</span>
              {sentPast30.length > 0 && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#15803D' }}>
                  <FiTrendingUp size={12} /> +100%
                </span>
              )}
            </div>
            <p className="text-xs mt-1" style={{ color: '#1F271B', opacity: 0.8 }}>Rs{sentTotalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          </div>
        </div>

        {/* Card 4: Converted */}
        <div
          className="rounded shadow-sm border overflow-hidden transition-all hover:shadow-md"
          style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <div className="h-0.5" style={{ backgroundColor: '#28AFB0' }} />
          <div className="p-3">
            <div className="flex justify-between items-start mb-1.5">
              <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Converted</p>
              <FiChevronRight size={12} style={{ color: '#1F271B', opacity: 0.5 }} />
            </div>
            <p className="text-[10px] mb-1.5" style={{ color: '#1F271B', opacity: 0.6 }}>Past 30 days</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold" style={{ color: '#1F271B' }}>{convertedPast30.length}</span>
              <span className="text-sm" style={{ color: '#1F271B', opacity: 0.6 }}>{convertedPast30.length > 0 ? '0%' : ''}</span>
            </div>
            <p className="text-xs mt-1" style={{ color: '#1F271B', opacity: 0.8 }}>Rs{convertedTotalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          </div>
        </div>
      </div>

      {/* All Quotes Section */}
      <div className="bg-white rounded shadow-sm border p-3" style={{ borderColor: '#EAEBED', marginTop: '2rem' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
          <h2 className="text-base font-bold" style={{ color: '#1F271B' }}>All quotes ({filteredQuotes.length} result{filteredQuotes.length !== 1 ? 's' : ''})</h2>
          <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end flex-wrap">
            {/* Search Bar */}
            <div className="relative">
              <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2" size={14} style={{ color: '#1F271B', opacity: 0.5 }} />
              <input
                type="text"
                placeholder="Search by client, title, or quote #..."
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

            {/* Status Filter */}
            <div className="relative" ref={statusDropdownRef}>
              <button
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="px-2.5 py-1.5 rounded border text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md"
                style={{ 
                  backgroundColor: statusFilter === 'all' ? '#F3F4F6' : 'white',
                  borderColor: '#EAEBED',
                  color: '#1F271B'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#D1D5DB'
                  if (statusFilter !== 'all') {
                    e.currentTarget.style.backgroundColor = '#F9FAFB'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#EAEBED'
                  if (statusFilter !== 'all') {
                    e.currentTarget.style.backgroundColor = 'white'
                  }
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
                        style={{ 
                          color: '#1F271B', 
                          backgroundColor: statusFilter === opt.value ? '#F3F4F6' : 'white'
                        }}
                        onMouseEnter={(e) => {
                          if (statusFilter !== opt.value) {
                            e.currentTarget.style.backgroundColor = '#F9FAFB'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (statusFilter !== opt.value) {
                            e.currentTarget.style.backgroundColor = 'white'
                          }
                        }}
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

        {/* Selection bar: show when at least one quote is selected */}
        {selectedQuoteIds.size > 0 && (
          <div
            className="flex items-center gap-3 px-3 py-2 border-b flex-wrap"
            style={{ backgroundColor: '#F0FDFA', borderColor: '#EAEBED' }}
          >
            <span className="text-xs font-medium" style={{ color: '#28AFB0' }}>
              {selectedQuoteIds.size} selected
            </span>
            <button
              type="button"
              onClick={handleDeselectAllQuotes}
              className="text-xs font-medium hover:underline"
              style={{ color: '#28AFB0' }}
            >
              Deselect All
            </button>
            <div className="flex items-center gap-2 ml-2">
              <button
                type="button"
                onClick={() => {
                  if (selectedQuoteIds.size > 0) {
                    setSendQuoteBulkWorkorderIds(Array.from(selectedQuoteIds))
                  }
                }}
                className="p-1.5 rounded hover:bg-black/5 transition-colors"
                title="Bulk Send Quotes"
                style={{ color: '#1F271B' }}
              >
                <FiSend size={16} />
              </button>
            </div>
          </div>
        )}

        {filteredQuotes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderBottomColor: '#EAEBED' }}>
                  <th className="text-left py-2 px-2 w-10" style={{ borderColor: '#EAEBED' }}>
                    <input
                      type="checkbox"
                      ref={selectAllCheckboxRef}
                      checked={allFilteredSelected}
                      onChange={toggleSelectAll}
                      onClick={(e) => e.stopPropagation()}
                      className="w-3.5 h-3.5 rounded cursor-pointer"
                      style={{ accentColor: '#28AFB0' }}
                    />
                  </th>
                  <th className="text-left py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>CLIENT</th>
                  <th className="text-left py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>QUOTE # / TITLE</th>
                  <th className="text-left py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>DATE SENT</th>
                  <th className="text-left py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>STATUS</th>
                  <th className="text-right py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>TOTAL</th>
                  <th className="text-right py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotes.map((quote) => {
                  const statusColors = getStatusColor(quote.status)
                  return (
                    <tr
                      key={quote.id}
                      onClick={() => handleRowClick(quote.workorderId)}
                      className="border-b cursor-pointer transition-colors hover:bg-gray-50"
                      style={{ borderBottomColor: '#EAEBED' }}
                    >
                      <td className="py-2 px-2 w-10" style={{ borderColor: '#EAEBED' }} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedQuoteIds.has(quote.id)}
                          onChange={() => {}}
                          onClick={(e) => toggleQuoteSelection(e, quote.id)}
                          className="w-3.5 h-3.5 rounded cursor-pointer"
                          style={{ accentColor: '#28AFB0' }}
                        />
                      </td>
                      <td className="py-2 px-2 text-xs" style={{ color: '#1F271B' }}>{quote.clientName}</td>
                      <td className="py-2 px-2">
                        <p className="text-xs font-medium" style={{ color: '#1F271B' }}>{quote.quoteNumber}{quote.title ? ` ${quote.title}` : ''}</p>
                      </td>
                      <td className="py-2 px-2 text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>
                        {quote.dateSent ? format(new Date(quote.dateSent), 'MMM dd, yyyy') : '—'}
                      </td>
                      <td className="py-2 px-2">
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium" style={{ 
                          backgroundColor: statusColors.bg,
                          color: statusColors.text
                        }}>
                          {getStatusLabel(quote.status)}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right">
                        <span className="text-xs font-semibold" style={{ color: '#1F271B' }}>
                          Rs{quote.total.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          {(quote.status === 'quote pending to send' || quote.status === 'draft' || quote.dateSent) && (
                          <button
                            onClick={() => setSendQuoteWorkorderId(quote.workorderId)}
                            className="p-1.5 rounded transition-all"
                            style={{ color: '#28AFB0', backgroundColor: 'transparent' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#F0FDFA'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent'
                            }}
                            title={quote.dateSent ? 'Resend Quote' : 'Send Quote'}
                          >
                            <FiSend size={14} />
                          </button>
                          )}
                          <button
                            onClick={() => {
                              // Open PDF in new window (placeholder)
                              alert('PDF preview would open here')
                            }}
                            className="p-1.5 rounded transition-all"
                            style={{ color: '#1F271B', backgroundColor: 'transparent' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#F3F4F6'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent'
                            }}
                            title="View PDF"
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
            <p className="text-sm" style={{ color: '#1F271B', opacity: 0.6 }}>
              No quotes found.
            </p>
          </div>
        )}
      </div>

      {/* Send Quote modal – single (same as Workorder Send Quote pop-up) */}
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

      {/* New Quote modal – same as New Workorder but quote-only (no schedule, assign, instructions; quote required) */}
      {isNewQuoteModalOpen && (
        <AddWorkorderModal
          isOpen={true}
          onClose={() => setIsNewQuoteModalOpen(false)}
          mode="quote-only"
        />
      )}

      {/* Bulk Send Quote modal – To = all selected clients; each PDF goes to its client only */}
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
