'use client'

import { FiSearch, FiChevronDown } from 'react-icons/fi'
import type { QuoteStats, JobStats, InvoiceStats } from './WorkordersOverviewCards'

export interface WorkordersFiltersBarProps {
  hasActiveFilters: boolean
  clearAllFilters: () => void
  quoteStatusFilter: string
  setQuoteStatusFilter: (v: string) => void
  quoteStats: QuoteStats
  isQuoteDropdownOpen: boolean
  setIsQuoteDropdownOpen: (v: boolean) => void
  quoteDropdownRef: React.RefObject<HTMLDivElement>
  jobStatusFilter: string
  setJobStatusFilter: (v: string) => void
  jobStats: JobStats
  isJobDropdownOpen: boolean
  setIsJobDropdownOpen: (v: boolean) => void
  jobDropdownRef: React.RefObject<HTMLDivElement>
  invoiceStatusFilter: string
  setInvoiceStatusFilter: (v: string) => void
  invoiceStats: InvoiceStats
  isInvoiceDropdownOpen: boolean
  setIsInvoiceDropdownOpen: (v: boolean) => void
  invoiceDropdownRef: React.RefObject<HTMLDivElement>
  searchTerm: string
  setSearchTerm: (v: string) => void
}

function DropdownButton({
  label,
  valueLabel,
  isOpen,
  onClick,
  isAll,
  children,
}: {
  label: string
  valueLabel: string
  isOpen: boolean
  onClick: () => void
  isAll: boolean
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className="px-2.5 py-1.5 rounded border text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md"
        style={{
          backgroundColor: isAll ? '#F3F4F6' : 'white',
          borderColor: '#EAEBED',
          color: '#1F271B',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#D1D5DB'
          if (!isAll) e.currentTarget.style.backgroundColor = '#F9FAFB'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#EAEBED'
          e.currentTarget.style.backgroundColor = isAll ? '#F3F4F6' : 'white'
        }}
      >
        <span className="font-semibold" style={{ color: '#1F271B' }}>{label}</span>
        <span style={{ color: '#1F271B', opacity: 0.5 }}>|</span>
        <span style={{ color: '#1F271B', opacity: 0.8 }}>{valueLabel}</span>
        <FiChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} style={{ color: '#1F271B', opacity: 0.6 }} />
      </button>
      {children}
    </div>
  )
}

export default function WorkordersFiltersBar({
  hasActiveFilters,
  clearAllFilters,
  quoteStatusFilter,
  setQuoteStatusFilter,
  quoteStats,
  isQuoteDropdownOpen,
  setIsQuoteDropdownOpen,
  quoteDropdownRef,
  jobStatusFilter,
  setJobStatusFilter,
  jobStats,
  isJobDropdownOpen,
  setIsJobDropdownOpen,
  jobDropdownRef,
  invoiceStatusFilter,
  setInvoiceStatusFilter,
  invoiceStats,
  isInvoiceDropdownOpen,
  setIsInvoiceDropdownOpen,
  invoiceDropdownRef,
  searchTerm,
  setSearchTerm,
}: WorkordersFiltersBarProps) {
  const dropdownClass = 'absolute right-0 mt-1 bg-white rounded shadow-lg border z-10 min-w-[180px] py-1'
  const dropdownStyle = { borderColor: '#EAEBED' }
  const optionClass = 'w-full text-left px-2 py-1.5 text-[10px] hover:bg-opacity-50 transition-colors'
  const optionStyle = (active: boolean) => ({ color: '#1F271B', backgroundColor: active ? '#F3F4F6' : 'white' })

  return (
    <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end flex-wrap">
      {hasActiveFilters && (
        <button type="button" onClick={clearAllFilters} className="text-xs font-medium hover:underline px-1" style={{ color: '#28AFB0' }}>
          Clear filters
        </button>
      )}
      <div className="relative" ref={quoteDropdownRef}>
        <DropdownButton
          label="Quote Status"
          valueLabel={quoteStatusFilter === 'all' ? 'All' : quoteStatusFilter.charAt(0).toUpperCase() + quoteStatusFilter.slice(1)}
          isOpen={isQuoteDropdownOpen}
          onClick={() => setIsQuoteDropdownOpen(!isQuoteDropdownOpen)}
          isAll={quoteStatusFilter === 'all'}
        >
          {isQuoteDropdownOpen && (
            <div className={dropdownClass} style={dropdownStyle}>
              <button onClick={() => { setQuoteStatusFilter('all'); setIsQuoteDropdownOpen(false) }} className={optionClass} style={optionStyle(quoteStatusFilter === 'all')} onMouseEnter={(e) => { if (quoteStatusFilter !== 'all') e.currentTarget.style.backgroundColor = '#F9FAFB' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = quoteStatusFilter === 'all' ? '#F3F4F6' : 'white' }}>All</button>
              {Object.keys(quoteStats).map((status) => (
                <span key={status}>
                  <div className="mx-2 border-t" style={{ borderStyle: 'dashed', borderColor: '#EAEBED' }} />
                  <button onClick={() => { setQuoteStatusFilter(status); setIsQuoteDropdownOpen(false) }} className={optionClass} style={optionStyle(quoteStatusFilter === status)} onMouseEnter={(e) => { if (quoteStatusFilter !== status) e.currentTarget.style.backgroundColor = '#F9FAFB' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = quoteStatusFilter === status ? '#F3F4F6' : 'white' }}>{status.charAt(0).toUpperCase() + status.slice(1)}</button>
                </span>
              ))}
            </div>
          )}
        </DropdownButton>
      </div>
      <div className="relative" ref={jobDropdownRef}>
        <DropdownButton
          label="Job Status"
          valueLabel={jobStatusFilter === 'all' ? 'All' : jobStatusFilter}
          isOpen={isJobDropdownOpen}
          onClick={() => setIsJobDropdownOpen(!isJobDropdownOpen)}
          isAll={jobStatusFilter === 'all'}
        >
          {isJobDropdownOpen && (
            <div className={dropdownClass} style={dropdownStyle}>
              <button onClick={() => { setJobStatusFilter('all'); setIsJobDropdownOpen(false) }} className={optionClass} style={optionStyle(jobStatusFilter === 'all')} onMouseEnter={(e) => { if (jobStatusFilter !== 'all') e.currentTarget.style.backgroundColor = '#F9FAFB' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = jobStatusFilter === 'all' ? '#F3F4F6' : 'white' }}>All</button>
              {Object.keys(jobStats).map((status) => (
                <span key={status}>
                  <div className="mx-2 border-t" style={{ borderStyle: 'dashed', borderColor: '#EAEBED' }} />
                  <button onClick={() => { setJobStatusFilter(status); setIsJobDropdownOpen(false) }} className={optionClass} style={optionStyle(jobStatusFilter === status)} onMouseEnter={(e) => { if (jobStatusFilter !== status) e.currentTarget.style.backgroundColor = '#F9FAFB' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = jobStatusFilter === status ? '#F3F4F6' : 'white' }}>{status}</button>
                </span>
              ))}
            </div>
          )}
        </DropdownButton>
      </div>
      <div className="relative" ref={invoiceDropdownRef}>
        <DropdownButton
          label="Invoice Status"
          valueLabel={invoiceStatusFilter === 'all' ? 'All' : invoiceStatusFilter.charAt(0).toUpperCase() + invoiceStatusFilter.slice(1)}
          isOpen={isInvoiceDropdownOpen}
          onClick={() => setIsInvoiceDropdownOpen(!isInvoiceDropdownOpen)}
          isAll={invoiceStatusFilter === 'all'}
        >
          {isInvoiceDropdownOpen && (
            <div className={dropdownClass} style={dropdownStyle}>
              <button onClick={() => { setInvoiceStatusFilter('all'); setIsInvoiceDropdownOpen(false) }} className={optionClass} style={optionStyle(invoiceStatusFilter === 'all')} onMouseEnter={(e) => { if (invoiceStatusFilter !== 'all') e.currentTarget.style.backgroundColor = '#F9FAFB' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = invoiceStatusFilter === 'all' ? '#F3F4F6' : 'white' }}>All</button>
              {Object.keys(invoiceStats).map((status) => (
                <span key={status}>
                  <div className="mx-2 border-t" style={{ borderStyle: 'dashed', borderColor: '#EAEBED' }} />
                  <button onClick={() => { setInvoiceStatusFilter(status); setIsInvoiceDropdownOpen(false) }} className={optionClass} style={optionStyle(invoiceStatusFilter === status)} onMouseEnter={(e) => { if (invoiceStatusFilter !== status) e.currentTarget.style.backgroundColor = '#F9FAFB' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = invoiceStatusFilter === status ? '#F3F4F6' : 'white' }}>{status.charAt(0).toUpperCase() + status.slice(1)}</button>
                </span>
              ))}
            </div>
          )}
        </DropdownButton>
      </div>
      <div className="relative flex-1 sm:flex-initial">
        <FiSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2" size={14} style={{ color: '#1F271B', opacity: 0.5 }} />
        <input
          type="text"
          placeholder="Search workorders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-56 pl-8 pr-3 py-1.5 border rounded text-xs focus:outline-none focus:ring-2 transition-all shadow-sm hover:shadow-md"
          style={{ borderColor: '#EAEBED', color: '#1F271B' }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#28AFB0'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#EAEBED'; e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
          onMouseEnter={(e) => { if (document.activeElement !== e.currentTarget) e.currentTarget.style.borderColor = '#D1D5DB' }}
          onMouseLeave={(e) => { if (document.activeElement !== e.currentTarget) e.currentTarget.style.borderColor = '#EAEBED' }}
        />
      </div>
    </div>
  )
}
