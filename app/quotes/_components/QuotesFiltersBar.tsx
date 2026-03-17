'use client'

import { FiSearch, FiChevronDown } from 'react-icons/fi'

export interface StatusFilterOption {
  value: string
  label: string
}

export interface QuotesFiltersBarProps {
  searchTerm: string
  setSearchTerm: (v: string) => void
  statusFilter: string
  setStatusFilter: (v: string) => void
  statusFilterOptions: StatusFilterOption[]
  isStatusDropdownOpen: boolean
  setIsStatusDropdownOpen: (v: boolean) => void
  statusDropdownRef: React.RefObject<HTMLDivElement>
}

export default function QuotesFiltersBar({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  statusFilterOptions,
  isStatusDropdownOpen,
  setIsStatusDropdownOpen,
  statusDropdownRef,
}: QuotesFiltersBarProps) {
  return (
    <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end flex-wrap">
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

      <div className="relative" ref={statusDropdownRef}>
        <button
          type="button"
          onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
          className="px-2.5 py-1.5 rounded border text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md"
          style={{
            backgroundColor: statusFilter === 'all' ? '#F3F4F6' : 'white',
            borderColor: '#EAEBED',
            color: '#1F271B',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#D1D5DB'
            if (statusFilter !== 'all') e.currentTarget.style.backgroundColor = '#F9FAFB'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#EAEBED'
            if (statusFilter !== 'all') e.currentTarget.style.backgroundColor = 'white'
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
                  type="button"
                  onClick={() => {
                    setStatusFilter(opt.value)
                    setIsStatusDropdownOpen(false)
                  }}
                  className="w-full text-left px-2 py-1.5 text-xs transition-colors"
                  style={{
                    color: '#1F271B',
                    backgroundColor: statusFilter === opt.value ? '#F3F4F6' : 'white',
                  }}
                  onMouseEnter={(e) => {
                    if (statusFilter !== opt.value) e.currentTarget.style.backgroundColor = '#F9FAFB'
                  }}
                  onMouseLeave={(e) => {
                    if (statusFilter !== opt.value) e.currentTarget.style.backgroundColor = 'white'
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
  )
}
