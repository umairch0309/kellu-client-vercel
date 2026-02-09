'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FiPlus, FiSearch, FiChevronRight, FiChevronDown } from 'react-icons/fi'
import { format } from 'date-fns'
import { mockWorkorders } from '@/data/mockData'

export default function WorkordersList() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [quoteStatusFilter, setQuoteStatusFilter] = useState('all')
  const [jobStatusFilter, setJobStatusFilter] = useState('all')
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('all')
  const [isQuoteDropdownOpen, setIsQuoteDropdownOpen] = useState(false)
  const [isJobDropdownOpen, setIsJobDropdownOpen] = useState(false)
  const [isInvoiceDropdownOpen, setIsInvoiceDropdownOpen] = useState(false)
  const quoteDropdownRef = useRef<HTMLDivElement>(null)
  const jobDropdownRef = useRef<HTMLDivElement>(null)
  const invoiceDropdownRef = useRef<HTMLDivElement>(null)

  // Calculate stats for overview blocks
  const quoteStats = {
    'not sent': mockWorkorders.filter(w => w.quoteStatus === 'not sent').length,
    'waiting for approval': mockWorkorders.filter(w => w.quoteStatus === 'waiting for approval').length,
    'approved': mockWorkorders.filter(w => w.quoteStatus === 'approved').length,
  }

  const jobStats = {
    'Unscheduled': mockWorkorders.filter(w => w.jobStatus === 'Unscheduled').length,
    'Scheduled': mockWorkorders.filter(w => w.jobStatus === 'Scheduled').length,
    'In Progress': mockWorkorders.filter(w => w.jobStatus === 'In Progress').length,
    'Completed': mockWorkorders.filter(w => w.jobStatus === 'Completed').length,
  }

  const invoiceStats = {
    'not sent': mockWorkorders.filter(w => w.invoiceStatus === 'not sent').length,
    'waiting for payment': mockWorkorders.filter(w => w.invoiceStatus === 'waiting for payment').length,
    'paid': mockWorkorders.filter(w => w.invoiceStatus === 'paid').length,
  }

  const filteredWorkorders = mockWorkorders.filter(wo => {
    const matchesSearch = wo.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (wo.address && wo.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         `#${wo.id}`.includes(searchTerm)
    
    const matchesQuote = quoteStatusFilter === 'all' || wo.quoteStatus === quoteStatusFilter
    const matchesJob = jobStatusFilter === 'all' || wo.jobStatus === jobStatusFilter
    const matchesInvoice = invoiceStatusFilter === 'all' || wo.invoiceStatus === invoiceStatusFilter
    
    return matchesSearch && matchesQuote && matchesJob && matchesInvoice
  })

  const hasActiveFilters = searchTerm !== '' || quoteStatusFilter !== 'all' || jobStatusFilter !== 'all' || invoiceStatusFilter !== 'all'

  const clearAllFilters = () => {
    setSearchTerm('')
    setQuoteStatusFilter('all')
    setJobStatusFilter('all')
    setInvoiceStatusFilter('all')
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quoteDropdownRef.current && !quoteDropdownRef.current.contains(event.target as Node)) {
        setIsQuoteDropdownOpen(false)
      }
      if (jobDropdownRef.current && !jobDropdownRef.current.contains(event.target as Node)) {
        setIsJobDropdownOpen(false)
      }
      if (invoiceDropdownRef.current && !invoiceDropdownRef.current.contains(event.target as Node)) {
        setIsInvoiceDropdownOpen(false)
      }
    }
    if (isQuoteDropdownOpen || isJobDropdownOpen || isInvoiceDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isQuoteDropdownOpen, isJobDropdownOpen, isInvoiceDropdownOpen])

  const handleRowClick = (workorderId: number) => {
    router.push(`/workorders/${workorderId}`)
  }

  const getStatusColor = (status: string, type: 'quote' | 'job' | 'invoice') => {
    if (type === 'quote') {
      if (status === 'approved') return { bg: '#28AFB0', text: 'white' }
      if (status === 'waiting for approval') return { bg: '#B084CC', text: 'white' }
      return { bg: '#EAEBED', text: '#1F271B' }
    }
    if (type === 'job') {
      if (status === 'Completed') return { bg: '#28AFB0', text: 'white' }
      if (status === 'In Progress') return { bg: '#28AFB0', text: 'white' }
      if (status === 'Scheduled') return { bg: '#2B50AA', text: 'white' }
      return { bg: '#EAEBED', text: '#1F271B' }
    }
    if (type === 'invoice') {
      if (status === 'paid') return { bg: '#28AFB0', text: 'white' }
      if (status === 'waiting for payment') return { bg: '#B084CC', text: 'white' }
      return { bg: '#EAEBED', text: '#1F271B' }
    }
    return { bg: '#EAEBED', text: '#1F271B' }
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#1F271B' }}>Workorders</h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/workorders/new')}
            className="px-3 py-1.5 rounded text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md"
            style={{ backgroundColor: '#28AFB0' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1E8A8B'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#28AFB0'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <FiPlus size={14} />
            <span>New Workorder</span>
          </button>
        </div>
      </div>

      {/* Overview Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Quote Status Block */}
        <div 
          className="rounded shadow-sm border overflow-hidden transition-all hover:shadow-md"
          style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div className="h-0.5" style={{ backgroundColor: '#B084CC' }}></div>
          <div className="p-3">
            <div className="flex justify-between items-start mb-1.5">
              <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Quote Status</p>
              <FiChevronRight size={12} style={{ color: '#1F271B', opacity: 0.5 }} />
            </div>
            <div className="space-y-1.5">
              {(['not sent', 'waiting for approval', 'approved'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setQuoteStatusFilter(quoteStatusFilter === status ? 'all' : status) }}
                  className="w-full flex items-center justify-between py-0.5 px-1 -mx-1 rounded text-left hover:bg-black/5 transition-colors"
                  style={{ backgroundColor: quoteStatusFilter === status ? 'rgba(176, 132, 204, 0.15)' : 'transparent' }}
                >
                  <span className="text-[10px]" style={{ color: '#1F271B', opacity: 0.7 }}>
                    {status === 'not sent' ? 'Not Sent' : status === 'waiting for approval' ? 'Waiting for Approval' : 'Approved'}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: '#1F271B' }}>{quoteStats[status]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Job Status Block */}
        <div 
          className="rounded shadow-sm border overflow-hidden transition-all hover:shadow-md"
          style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div className="h-0.5" style={{ backgroundColor: '#2B50AA' }}></div>
          <div className="p-3">
            <div className="flex justify-between items-start mb-1.5">
              <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Job Status</p>
              <FiChevronRight size={12} style={{ color: '#1F271B', opacity: 0.5 }} />
            </div>
            <div className="space-y-1.5">
              {(['Unscheduled', 'Scheduled', 'In Progress', 'Completed'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setJobStatusFilter(jobStatusFilter === status ? 'all' : status) }}
                  className="w-full flex items-center justify-between py-0.5 px-1 -mx-1 rounded text-left hover:bg-black/5 transition-colors"
                  style={{ backgroundColor: jobStatusFilter === status ? 'rgba(43, 80, 170, 0.12)' : 'transparent' }}
                >
                  <span className="text-[10px]" style={{ color: '#1F271B', opacity: 0.7 }}>{status}</span>
                  <span className="text-xs font-semibold" style={{ color: '#1F271B' }}>{jobStats[status]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Invoice Status Block */}
        <div 
          className="rounded shadow-sm border overflow-hidden transition-all hover:shadow-md"
          style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div className="h-0.5" style={{ backgroundColor: '#28AFB0' }}></div>
          <div className="p-3">
            <div className="flex justify-between items-start mb-1.5">
              <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Invoice Status</p>
              <FiChevronRight size={12} style={{ color: '#1F271B', opacity: 0.5 }} />
            </div>
            <div className="space-y-1.5">
              {(['not sent', 'waiting for payment', 'paid'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setInvoiceStatusFilter(invoiceStatusFilter === status ? 'all' : status) }}
                  className="w-full flex items-center justify-between py-0.5 px-1 -mx-1 rounded text-left hover:bg-black/5 transition-colors"
                  style={{ backgroundColor: invoiceStatusFilter === status ? 'rgba(40, 175, 176, 0.12)' : 'transparent' }}
                >
                  <span className="text-[10px]" style={{ color: '#1F271B', opacity: 0.7 }}>
                    {status === 'not sent' ? 'Not Sent' : status === 'waiting for payment' ? 'Waiting for Payment' : 'Paid'}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: '#1F271B' }}>{invoiceStats[status]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* All Workorders Section */}
      <div className="bg-white rounded shadow-sm border p-3" style={{ borderColor: '#EAEBED', marginTop: '2rem' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
          <h2 className="text-base font-bold" style={{ color: '#1F271B' }}>All workorders ({filteredWorkorders.length} result{filteredWorkorders.length !== 1 ? 's' : ''})</h2>
          <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end flex-wrap">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs font-medium hover:underline px-1"
                style={{ color: '#28AFB0' }}
              >
                Clear filters
              </button>
            )}
            {/* Quote Status Filter */}
            <div className="relative" ref={quoteDropdownRef}>
              <button
                onClick={() => setIsQuoteDropdownOpen(!isQuoteDropdownOpen)}
                className="px-2.5 py-1.5 rounded border text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md"
                style={{ 
                  backgroundColor: quoteStatusFilter === 'all' ? '#F3F4F6' : 'white',
                  borderColor: '#EAEBED',
                  color: '#1F271B'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#D1D5DB'
                  if (quoteStatusFilter !== 'all') {
                    e.currentTarget.style.backgroundColor = '#F9FAFB'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#EAEBED'
                  if (quoteStatusFilter !== 'all') {
                    e.currentTarget.style.backgroundColor = 'white'
                  }
                }}
              >
                <span className="font-semibold" style={{ color: '#1F271B' }}>Quote Status</span>
                <span style={{ color: '#1F271B', opacity: 0.5 }}>|</span>
                <span style={{ color: '#1F271B', opacity: 0.8 }}>{quoteStatusFilter === 'all' ? 'All' : quoteStatusFilter.charAt(0).toUpperCase() + quoteStatusFilter.slice(1)}</span>
                <FiChevronDown size={12} className={`transition-transform ${isQuoteDropdownOpen ? 'rotate-180' : ''}`} style={{ color: '#1F271B', opacity: 0.6 }} />
              </button>
              {isQuoteDropdownOpen && (
                <div className="absolute right-0 mt-1 bg-white rounded shadow-lg border z-10 min-w-[180px]" style={{ borderColor: '#EAEBED' }}>
                  <button
                    onClick={() => {
                      setQuoteStatusFilter('all')
                      setIsQuoteDropdownOpen(false)
                    }}
                    className="w-full text-left px-2 py-1.5 text-[10px] hover:bg-opacity-50 transition-colors"
                    style={{ color: '#1F271B', backgroundColor: quoteStatusFilter === 'all' ? '#F3F4F6' : 'white' }}
                    onMouseEnter={(e) => {
                      if (quoteStatusFilter !== 'all') {
                        e.currentTarget.style.backgroundColor = '#F9FAFB'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (quoteStatusFilter !== 'all') {
                        e.currentTarget.style.backgroundColor = 'white'
                      }
                    }}
                  >
                    All
                  </button>
                  {Object.keys(quoteStats).map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setQuoteStatusFilter(status)
                        setIsQuoteDropdownOpen(false)
                      }}
                      className="w-full text-left px-2 py-1.5 text-[10px] hover:bg-opacity-50 transition-colors border-t"
                      style={{ 
                        color: '#1F271B', 
                        backgroundColor: quoteStatusFilter === status ? '#F3F4F6' : 'white',
                        borderTopColor: '#EAEBED'
                      }}
                      onMouseEnter={(e) => {
                        if (quoteStatusFilter !== status) {
                          e.currentTarget.style.backgroundColor = '#F9FAFB'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (quoteStatusFilter !== status) {
                          e.currentTarget.style.backgroundColor = 'white'
                        }
                      }}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Job Status Filter */}
            <div className="relative" ref={jobDropdownRef}>
              <button
                onClick={() => setIsJobDropdownOpen(!isJobDropdownOpen)}
                className="px-2.5 py-1.5 rounded border text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md"
                style={{ 
                  backgroundColor: jobStatusFilter === 'all' ? '#F3F4F6' : 'white',
                  borderColor: '#EAEBED',
                  color: '#1F271B'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#D1D5DB'
                  if (jobStatusFilter !== 'all') {
                    e.currentTarget.style.backgroundColor = '#F9FAFB'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#EAEBED'
                  if (jobStatusFilter !== 'all') {
                    e.currentTarget.style.backgroundColor = 'white'
                  }
                }}
              >
                <span className="font-semibold" style={{ color: '#1F271B' }}>Job Status</span>
                <span style={{ color: '#1F271B', opacity: 0.5 }}>|</span>
                <span style={{ color: '#1F271B', opacity: 0.8 }}>{jobStatusFilter === 'all' ? 'All' : jobStatusFilter}</span>
                <FiChevronDown size={12} className={`transition-transform ${isJobDropdownOpen ? 'rotate-180' : ''}`} style={{ color: '#1F271B', opacity: 0.6 }} />
              </button>
              {isJobDropdownOpen && (
                <div className="absolute right-0 mt-1 bg-white rounded shadow-lg border z-10 min-w-[180px]" style={{ borderColor: '#EAEBED' }}>
                  <button
                    onClick={() => {
                      setJobStatusFilter('all')
                      setIsJobDropdownOpen(false)
                    }}
                    className="w-full text-left px-2 py-1.5 text-[10px] hover:bg-opacity-50 transition-colors"
                    style={{ color: '#1F271B', backgroundColor: jobStatusFilter === 'all' ? '#F3F4F6' : 'white' }}
                    onMouseEnter={(e) => {
                      if (jobStatusFilter !== 'all') {
                        e.currentTarget.style.backgroundColor = '#F9FAFB'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (jobStatusFilter !== 'all') {
                        e.currentTarget.style.backgroundColor = 'white'
                      }
                    }}
                  >
                    All
                  </button>
                  {Object.keys(jobStats).map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setJobStatusFilter(status)
                        setIsJobDropdownOpen(false)
                      }}
                      className="w-full text-left px-2 py-1.5 text-[10px] hover:bg-opacity-50 transition-colors border-t"
                      style={{ 
                        color: '#1F271B', 
                        backgroundColor: jobStatusFilter === status ? '#F3F4F6' : 'white',
                        borderTopColor: '#EAEBED'
                      }}
                      onMouseEnter={(e) => {
                        if (jobStatusFilter !== status) {
                          e.currentTarget.style.backgroundColor = '#F9FAFB'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (jobStatusFilter !== status) {
                          e.currentTarget.style.backgroundColor = 'white'
                        }
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Invoice Status Filter */}
            <div className="relative" ref={invoiceDropdownRef}>
              <button
                onClick={() => setIsInvoiceDropdownOpen(!isInvoiceDropdownOpen)}
                className="px-2.5 py-1.5 rounded border text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md"
                style={{ 
                  backgroundColor: invoiceStatusFilter === 'all' ? '#F3F4F6' : 'white',
                  borderColor: '#EAEBED',
                  color: '#1F271B'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#D1D5DB'
                  if (invoiceStatusFilter !== 'all') {
                    e.currentTarget.style.backgroundColor = '#F9FAFB'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#EAEBED'
                  if (invoiceStatusFilter !== 'all') {
                    e.currentTarget.style.backgroundColor = 'white'
                  }
                }}
              >
                <span className="font-semibold" style={{ color: '#1F271B' }}>Invoice Status</span>
                <span style={{ color: '#1F271B', opacity: 0.5 }}>|</span>
                <span style={{ color: '#1F271B', opacity: 0.8 }}>{invoiceStatusFilter === 'all' ? 'All' : invoiceStatusFilter.charAt(0).toUpperCase() + invoiceStatusFilter.slice(1)}</span>
                <FiChevronDown size={12} className={`transition-transform ${isInvoiceDropdownOpen ? 'rotate-180' : ''}`} style={{ color: '#1F271B', opacity: 0.6 }} />
              </button>
              {isInvoiceDropdownOpen && (
                <div className="absolute right-0 mt-1 bg-white rounded shadow-lg border z-10 min-w-[180px]" style={{ borderColor: '#EAEBED' }}>
                  <button
                    onClick={() => {
                      setInvoiceStatusFilter('all')
                      setIsInvoiceDropdownOpen(false)
                    }}
                    className="w-full text-left px-2 py-1.5 text-[10px] hover:bg-opacity-50 transition-colors"
                    style={{ color: '#1F271B', backgroundColor: invoiceStatusFilter === 'all' ? '#F3F4F6' : 'white' }}
                    onMouseEnter={(e) => {
                      if (invoiceStatusFilter !== 'all') {
                        e.currentTarget.style.backgroundColor = '#F9FAFB'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (invoiceStatusFilter !== 'all') {
                        e.currentTarget.style.backgroundColor = 'white'
                      }
                    }}
                  >
                    All
                  </button>
                  {Object.keys(invoiceStats).map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setInvoiceStatusFilter(status)
                        setIsInvoiceDropdownOpen(false)
                      }}
                      className="w-full text-left px-2 py-1.5 text-[10px] hover:bg-opacity-50 transition-colors border-t"
                      style={{ 
                        color: '#1F271B', 
                        backgroundColor: invoiceStatusFilter === status ? '#F3F4F6' : 'white',
                        borderTopColor: '#EAEBED'
                      }}
                      onMouseEnter={(e) => {
                        if (invoiceStatusFilter !== status) {
                          e.currentTarget.style.backgroundColor = '#F9FAFB'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (invoiceStatusFilter !== status) {
                          e.currentTarget.style.backgroundColor = 'white'
                        }
                      }}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative flex-1 sm:flex-initial">
              <FiSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2" size={14} style={{ color: '#1F271B', opacity: 0.5 }} />
              <input
                type="text"
                placeholder="Search workorders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-56 pl-8 pr-3 py-1.5 border rounded text-xs focus:outline-none focus:ring-2 transition-all shadow-sm hover:shadow-md"
                style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#28AFB0'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#EAEBED'
                  e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
                onMouseEnter={(e) => {
                  if (document.activeElement !== e.currentTarget) {
                    e.currentTarget.style.borderColor = '#D1D5DB'
                  }
                }}
                onMouseLeave={(e) => {
                  if (document.activeElement !== e.currentTarget) {
                    e.currentTarget.style.borderColor = '#EAEBED'
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Workorders Table */}
        <div className="rounded overflow-hidden border" style={{ borderColor: '#EAEBED' }}>
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#F3F4F6' }}>
                <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Client Name</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Work orders number</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Address</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Schedule</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Quote status</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Job status</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Invoice status</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Total</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Last modified</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkorders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-4 text-center text-xs" style={{ color: '#1F271B', opacity: 0.6 }}>
                    No workorders found
                  </td>
                </tr>
              ) : (
                filteredWorkorders.map((workorder) => {
                  const scheduleDate = workorder.schedule?.day ? new Date(workorder.schedule.day) : null
                  const quoteColor = getStatusColor(workorder.quoteStatus, 'quote')
                  const jobColor = getStatusColor(workorder.jobStatus, 'job')
                  const invoiceColor = getStatusColor(workorder.invoiceStatus, 'invoice')
                  
                  return (
                    <tr
                      key={workorder.id}
                      className="border-t cursor-pointer transition-colors"
                      style={{ borderColor: '#EAEBED' }}
                      onClick={() => handleRowClick(workorder.id)}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white' }}
                    >
                      <td className="px-3 py-2">
                        <p className="text-xs font-medium" style={{ color: '#1F271B' }}>{workorder.clientName}</p>
                      </td>
                      <td className="px-3 py-2">
                        <p className="text-xs" style={{ color: '#1F271B' }}>#{workorder.id} {workorder.title}</p>
                      </td>
                      <td className="px-3 py-2">
                        <p className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>{workorder.address}</p>
                      </td>
                      <td className="px-3 py-2">
                        <p className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>
                          {scheduleDate ? format(scheduleDate, 'MMMM d, yyyy') : 'Unscheduled'}
                        </p>
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium" style={{ backgroundColor: quoteColor.bg, color: quoteColor.text }}>
                          {workorder.quoteStatus.charAt(0).toUpperCase() + workorder.quoteStatus.slice(1)}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium" style={{ backgroundColor: jobColor.bg, color: jobColor.text }}>
                          {workorder.jobStatus}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium" style={{ backgroundColor: invoiceColor.bg, color: invoiceColor.text }}>
                          {workorder.invoiceStatus.charAt(0).toUpperCase() + workorder.invoiceStatus.slice(1)}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Rs {workorder.total.toFixed(2)}</p>
                      </td>
                      <td className="px-3 py-2">
                        <p className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>
                          {(workorder as { lastModified?: string }).lastModified
                            ? format(new Date((workorder as { lastModified: string }).lastModified), 'MMM d, yyyy')
                            : '—'}
                        </p>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
