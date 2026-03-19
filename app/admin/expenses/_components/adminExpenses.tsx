'use client'

import { useState, useRef, useEffect } from 'react'
import { FiSearch, FiChevronDown, FiChevronRight } from 'react-icons/fi'
import { formatUsd } from '@/lib/formatCurrency'

export function AdminExpenses() {
  const [searchTerm, setSearchTerm] = useState('')
  const [businessFilter, setBusinessFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isBusinessDropdownOpen, setIsBusinessDropdownOpen] = useState(false)
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false)
  const businessDropdownRef = useRef<HTMLDivElement>(null)
  const categoryDropdownRef = useRef<HTMLDivElement>(null)

  const businessOptions = [{ value: 'all', label: 'All Businesses' }]
  const categoryOptions = [{ value: 'all', label: 'All Categories' }]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (businessDropdownRef.current && !businessDropdownRef.current.contains(event.target as Node)) {
        setIsBusinessDropdownOpen(false)
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false)
      }
    }
    if (isBusinessDropdownOpen || isCategoryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isBusinessDropdownOpen, isCategoryDropdownOpen])

  const hasActiveFilters = searchTerm !== '' || businessFilter !== 'all' || categoryFilter !== 'all'

  const clearAllFilters = () => {
    setSearchTerm('')
    setBusinessFilter('all')
    setCategoryFilter('all')
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#1F271B' }}>Expenses</h1>
      </div>

      {/* Overview Cards */}
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
            <p className="text-[10px]" style={{ color: '#1F271B', opacity: 0.5 }}>No data yet</p>
          </div>
        </div>

        {/* Card 2: Total Expenses */}
        <div
          className="rounded shadow-sm border overflow-hidden transition-all hover:shadow-md"
          style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <div className="h-0.5" style={{ backgroundColor: '#28AFB0' }} />
          <div className="p-3">
            <div className="flex justify-between items-start mb-1.5">
              <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Total Expenses</p>
              <FiChevronRight size={12} style={{ color: '#1F271B', opacity: 0.5 }} />
            </div>
            <p className="text-[10px] mb-1.5" style={{ color: '#1F271B', opacity: 0.6 }}>All time</p>
            <span className="text-2xl font-bold" style={{ color: '#1F271B' }}>$0</span>
          </div>
        </div>

        {/* Card 3: Average Expense */}
        <div
          className="rounded shadow-sm border overflow-hidden transition-all hover:shadow-md"
          style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <div className="h-0.5" style={{ backgroundColor: '#2B50AA' }} />
          <div className="p-3">
            <div className="flex justify-between items-start mb-1.5">
              <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Average expense</p>
              <FiChevronRight size={12} style={{ color: '#1F271B', opacity: 0.5 }} />
            </div>
            <p className="text-[10px] mb-1.5" style={{ color: '#1F271B', opacity: 0.6 }}>All expenses</p>
            <span className="text-2xl font-bold" style={{ color: '#1F271B' }}>{formatUsd(0)}</span>
            <p className="text-[10px] mt-1" style={{ color: '#1F271B', opacity: 0.6 }}>No expenses recorded</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded shadow-sm border p-3" style={{ borderColor: '#EAEBED', marginTop: '2rem' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
          <h2 className="text-base font-bold" style={{ color: '#1F271B' }}>All expenses (0 results)</h2>
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

            {/* Business Filter Dropdown */}
            <div className="relative" ref={businessDropdownRef}>
              <button
                onClick={() => setIsBusinessDropdownOpen(!isBusinessDropdownOpen)}
                className="px-2.5 py-1.5 rounded border text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md"
                style={{
                  backgroundColor: businessFilter === 'all' ? '#F3F4F6' : 'white',
                  borderColor: '#EAEBED',
                  color: '#1F271B',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#D1D5DB'
                  if (businessFilter !== 'all') e.currentTarget.style.backgroundColor = '#F9FAFB'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#EAEBED'
                  if (businessFilter !== 'all') e.currentTarget.style.backgroundColor = 'white'
                }}
              >
                <span className="font-semibold" style={{ color: '#1F271B' }}>Business</span>
                <span style={{ color: '#1F271B', opacity: 0.5 }}>|</span>
                <span style={{ color: '#1F271B', opacity: 0.8 }}>All</span>
                <FiChevronDown size={12} className={`transition-transform ${isBusinessDropdownOpen ? 'rotate-180' : ''}`} style={{ color: '#1F271B', opacity: 0.6 }} />
              </button>
              {isBusinessDropdownOpen && (
                <div className="absolute right-0 mt-1 bg-white rounded shadow-lg border z-10 min-w-[180px] py-1" style={{ borderColor: '#EAEBED' }}>
                  {businessOptions.map((opt, idx) => (
                    <span key={opt.value}>
                      {idx > 0 && <div className="mx-2 border-t" style={{ borderStyle: 'dashed', borderColor: '#EAEBED' }} />}
                      <button
                        onClick={() => { setBusinessFilter(opt.value); setIsBusinessDropdownOpen(false) }}
                        className="w-full text-left px-2 py-1.5 text-xs transition-colors"
                        style={{ color: '#1F271B', backgroundColor: businessFilter === opt.value ? '#F3F4F6' : 'white' }}
                        onMouseEnter={(e) => { if (businessFilter !== opt.value) e.currentTarget.style.backgroundColor = '#F9FAFB' }}
                        onMouseLeave={(e) => { if (businessFilter !== opt.value) e.currentTarget.style.backgroundColor = 'white' }}
                      >
                        {opt.label}
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Category Filter Dropdown */}
            <div className="relative" ref={categoryDropdownRef}>
              <button
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="px-2.5 py-1.5 rounded border text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md"
                style={{
                  backgroundColor: categoryFilter === 'all' ? '#F3F4F6' : 'white',
                  borderColor: '#EAEBED',
                  color: '#1F271B',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#D1D5DB'
                  if (categoryFilter !== 'all') e.currentTarget.style.backgroundColor = '#F9FAFB'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#EAEBED'
                  if (categoryFilter !== 'all') e.currentTarget.style.backgroundColor = 'white'
                }}
              >
                <span className="font-semibold" style={{ color: '#1F271B' }}>Category</span>
                <span style={{ color: '#1F271B', opacity: 0.5 }}>|</span>
                <span style={{ color: '#1F271B', opacity: 0.8 }}>All</span>
                <FiChevronDown size={12} className={`transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} style={{ color: '#1F271B', opacity: 0.6 }} />
              </button>
              {isCategoryDropdownOpen && (
                <div className="absolute right-0 mt-1 bg-white rounded shadow-lg border z-10 min-w-[180px] py-1" style={{ borderColor: '#EAEBED' }}>
                  {categoryOptions.map((opt, idx) => (
                    <span key={opt.value}>
                      {idx > 0 && <div className="mx-2 border-t" style={{ borderStyle: 'dashed', borderColor: '#EAEBED' }} />}
                      <button
                        onClick={() => { setCategoryFilter(opt.value); setIsCategoryDropdownOpen(false) }}
                        className="w-full text-left px-2 py-1.5 text-xs transition-colors"
                        style={{ color: '#1F271B', backgroundColor: categoryFilter === opt.value ? '#F3F4F6' : 'white' }}
                        onMouseEnter={(e) => { if (categoryFilter !== opt.value) e.currentTarget.style.backgroundColor = '#F9FAFB' }}
                        onMouseLeave={(e) => { if (categoryFilter !== opt.value) e.currentTarget.style.backgroundColor = 'white' }}
                      >
                        {opt.label}
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative flex-1 sm:flex-initial">
              <FiSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2" size={14} style={{ color: '#1F271B', opacity: 0.5 }} />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-56 pl-8 pr-3 py-1.5 border rounded text-xs focus:outline-none transition-all shadow-sm hover:shadow-md"
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
                  if (document.activeElement !== e.currentTarget) e.currentTarget.style.borderColor = '#D1D5DB'
                }}
                onMouseLeave={(e) => {
                  if (document.activeElement !== e.currentTarget) e.currentTarget.style.borderColor = '#EAEBED'
                }}
              />
            </div>
          </div>
        </div>

        {/* Empty state */}
        <div className="rounded overflow-hidden border" style={{ borderColor: '#EAEBED' }}>
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#F3F4F6' }}>
                <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Business</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Category</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Description</th>
                <th className="px-3 py-2 text-right text-[10px] font-semibold" style={{ color: '#1F271B' }}>Amount</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Status</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-xs" style={{ color: '#1F271B', opacity: 0.5 }}>
                  Expenses module coming soon...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}