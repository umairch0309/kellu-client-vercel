'use client'

import { FiSearch, FiChevronDown } from 'react-icons/fi'

export interface ClientsListFiltersBarProps {
  statusFilter: string
  setStatusFilter: (v: string) => void
  isStatusDropdownOpen: boolean
  setIsStatusDropdownOpen: (v: boolean) => void
  statusDropdownRef: React.RefObject<HTMLDivElement>
  searchTerm: string
  setSearchTerm: (v: string) => void
  resultCount: number
}

export default function ClientsListFiltersBar({
  statusFilter,
  setStatusFilter,
  isStatusDropdownOpen,
  setIsStatusDropdownOpen,
  statusDropdownRef,
  searchTerm,
  setSearchTerm,
  resultCount,
}: ClientsListFiltersBarProps) {
  return (
    <div className="bg-white rounded shadow-sm border p-3 mb-3" style={{ borderColor: '#EAEBED' }}>
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <h2 className="text-base font-bold" style={{ color: '#1F271B' }}>
          Filtered clients ({resultCount} {resultCount === 1 ? 'result' : 'results'})
        </h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 sm:flex-initial justify-end">
          <div className="relative" ref={statusDropdownRef}>
            <button
              type="button"
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-xs font-medium transition-all w-full sm:w-auto"
              style={{ backgroundColor: statusFilter === '' ? '#F3F4F6' : 'white', borderColor: '#EAEBED', color: '#1F271B' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#D1D5DB'
                e.currentTarget.style.backgroundColor = '#F9FAFB'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#EAEBED'
                e.currentTarget.style.backgroundColor = statusFilter === '' ? '#F3F4F6' : 'white'
              }}
            >
              Status | {statusFilter === '' ? 'All' : statusFilter === 'Follow Up' ? 'Follow-up' : statusFilter}
              <FiChevronDown size={12} className={`transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} style={{ color: '#1F271B', opacity: 0.6 }} />
            </button>
            {isStatusDropdownOpen && (
              <div
                className="absolute left-0 sm:right-0 mt-1 bg-white rounded shadow-lg border z-20 min-w-[160px] py-1"
                style={{ borderColor: '#EAEBED', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              >
                <button
                  type="button"
                  onClick={() => { setStatusFilter(''); setIsStatusDropdownOpen(false) }}
                  className="w-full text-left px-3 py-2 text-xs flex items-center justify-between"
                  style={{ color: '#1F271B', backgroundColor: statusFilter === '' ? '#F3F4F6' : 'white' }}
                >
                  All
                  {statusFilter === '' && <span className="text-green-600">✓</span>}
                </button>
                <div className="mx-2 border-t" style={{ borderStyle: 'dashed', borderColor: '#EAEBED' }} />
                <button
                  type="button"
                  onClick={() => { setStatusFilter('Active'); setIsStatusDropdownOpen(false) }}
                  className="w-full text-left px-3 py-2 text-xs flex items-center justify-between"
                  style={{ color: '#1F271B', backgroundColor: statusFilter === 'Active' ? '#F3F4F6' : 'white' }}
                >
                  Active
                  {statusFilter === 'Active' && <span className="text-green-600">✓</span>}
                </button>
                <div className="mx-2 border-t" style={{ borderStyle: 'dashed', borderColor: '#EAEBED' }} />
                <button
                  type="button"
                  onClick={() => { setStatusFilter('Follow Up'); setIsStatusDropdownOpen(false) }}
                  className="w-full text-left px-3 py-2 text-xs flex items-center justify-between"
                  style={{ color: '#1F271B', backgroundColor: statusFilter === 'Follow Up' ? '#F3F4F6' : 'white' }}
                >
                  Follow-up
                  {statusFilter === 'Follow Up' && <span className="text-green-600">✓</span>}
                </button>
                <div className="mx-2 border-t" style={{ borderStyle: 'dashed', borderColor: '#EAEBED' }} />
                <button
                  type="button"
                  onClick={() => { setStatusFilter('Archive'); setIsStatusDropdownOpen(false) }}
                  className="w-full text-left px-3 py-2 text-xs flex items-center justify-between"
                  style={{ color: '#1F271B', backgroundColor: statusFilter === 'Archive' ? '#F3F4F6' : 'white' }}
                >
                  Archive
                  {statusFilter === 'Archive' && <span className="text-green-600">✓</span>}
                </button>
              </div>
            )}
          </div>
          <div className="relative flex-1 sm:flex-initial sm:min-w-[200px]">
            <FiSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2" size={14} style={{ color: '#1F271B', opacity: 0.5 }} />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border rounded text-xs transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
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
        </div>
      </div>
    </div>
  )
}
