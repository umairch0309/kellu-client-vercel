'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiSearch, FiChevronDown, FiChevronRight, FiTrendingUp } from 'react-icons/fi'

type InvoiceStatus = 'paid' | 'overdue' | 'pending' | 'draft'

const mockInvoices = [
  { id: 'INV-5001', business: 'ABC Corporation', client: 'Downtown Plaza', amount: 12500, status: 'paid' as InvoiceStatus, dueDate: 'Mar 1, 2026' },
  { id: 'INV-5002', business: 'TechStart Solutions', client: 'Metro Office Park', amount: 8400, status: 'overdue' as InvoiceStatus, dueDate: 'Feb 20, 2026' },
  { id: 'INV-5003', business: 'BuildRight Construction', client: 'Riverside Apartments', amount: 18900, status: 'paid' as InvoiceStatus, dueDate: 'Mar 5, 2026' },
  { id: 'INV-5004', business: 'Global Industries Ltd', client: 'Harbor View Mall', amount: 32400, status: 'pending' as InvoiceStatus, dueDate: 'Mar 15, 2026' },
  { id: 'INV-5005', business: 'ProServices Inc', client: 'Tech Campus Building', amount: 6700, status: 'draft' as InvoiceStatus, dueDate: 'Mar 20, 2026' },
  { id: 'INV-5006', business: 'Quantum Logistics', client: 'Distribution Center', amount: 15800, status: 'paid' as InvoiceStatus, dueDate: 'Feb 28, 2026' },
]

const uniqueBusinesses = Array.from(new Set(mockInvoices.map(i => i.business)))

const statusFilterOptions = [
  { value: 'all', label: 'All' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'pending', label: 'Pending' },
  { value: 'draft', label: 'Draft' },
]

const businessFilterOptions = [
  { value: 'all', label: 'All Businesses' },
  ...uniqueBusinesses.map(b => ({ value: b, label: b })),
]

const getStatusColor = (status: InvoiceStatus) => {
  if (status === 'paid') return { bg: 'rgba(40, 175, 176, 0.2)', text: '#1E8A8B' }
  if (status === 'overdue') return { bg: 'rgba(239, 68, 68, 0.15)', text: '#DC2626' }
  if (status === 'pending') return { bg: 'rgba(245, 158, 11, 0.2)', text: '#B45309' }
  if (status === 'draft') return { bg: '#F3F4F6', text: '#1F271B' }
  return { bg: '#F3F4F6', text: '#1F271B' }
}

const formatAmount = (n: number) => {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`
  return `$${n.toLocaleString()}`
}

export function AdminInvoices() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [businessFilter, setBusinessFilter] = useState('all')
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const [isBusinessDropdownOpen, setIsBusinessDropdownOpen] = useState(false)
  const statusDropdownRef = useRef<HTMLDivElement>(null)
  const businessDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false)
      }
      if (businessDropdownRef.current && !businessDropdownRef.current.contains(event.target as Node)) {
        setIsBusinessDropdownOpen(false)
      }
    }
    if (isStatusDropdownOpen || isBusinessDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isStatusDropdownOpen, isBusinessDropdownOpen])

  const overviewCounts = useMemo(() => {
    const overdue = mockInvoices.filter(i => i.status === 'overdue')
    const pending = mockInvoices.filter(i => i.status === 'pending')
    const draft = mockInvoices.filter(i => i.status === 'draft')
    return {
      overdue: overdue.length,
      overdueAmount: overdue.reduce((s, i) => s + i.amount, 0),
      pending: pending.length,
      pendingAmount: pending.reduce((s, i) => s + i.amount, 0),
      draft: draft.length,
      draftAmount: draft.reduce((s, i) => s + i.amount, 0),
    }
  }, [])

  const paidInvoices = useMemo(() => mockInvoices.filter(i => i.status === 'paid'), [])
  const paidCount = paidInvoices.length
  const paidTotal = paidInvoices.reduce((s, i) => s + i.amount, 0)
  const totalVolume = mockInvoices.reduce((s, i) => s + i.amount, 0)
  const averageInvoice = mockInvoices.length > 0 ? totalVolume / mockInvoices.length : 0
  
  const filteredInvoices = mockInvoices.filter(invoice => {
    const matchesSearch =
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.business.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    const matchesBusiness = businessFilter === 'all' || invoice.business === businessFilter
    return matchesSearch && matchesStatus && matchesBusiness
  })

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || businessFilter !== 'all'

  const clearAllFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setBusinessFilter('all')
  }

  const overviewLinks = [
    { status: 'overdue', label: 'Overdue', count: overviewCounts.overdue, amount: overviewCounts.overdueAmount, bulletColor: '#DC2626' },
    { status: 'pending', label: 'Pending', count: overviewCounts.pending, amount: overviewCounts.pendingAmount, bulletColor: '#D97706' },
    { status: 'draft', label: 'Draft', count: overviewCounts.draft, amount: overviewCounts.draftAmount, bulletColor: '#2B50AA' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#1F271B' }}>Invoices</h1>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="rounded shadow-sm border overflow-hidden transition-all hover:shadow-md" style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}>
          <div className="h-0.5" style={{ backgroundColor: '#28AFB0' }} />
          <div className="p-3">
            <div className="flex justify-between items-start mb-1.5">
              <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Overview</p>
              <FiChevronRight size={12} style={{ color: '#1F271B', opacity: 0.5 }} />
            </div>
            <div className="space-y-1.5">
              {overviewLinks.map(({ status, label, count, amount, bulletColor }) => (
                <button key={status} type="button" onClick={() => setStatusFilter(prev => prev === status ? 'all' : status)} className="w-full flex items-center justify-between py-0.5 px-1 -mx-1 rounded text-left hover:bg-black/5 transition-colors" style={{ backgroundColor: statusFilter === status ? 'rgba(40, 175, 176, 0.12)' : 'transparent' }}>
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

        <div className="rounded shadow-sm border overflow-hidden transition-all hover:shadow-md" style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}>
          <div className="h-0.5" style={{ backgroundColor: '#28AFB0' }} />
          <div className="p-3">
            <div className="flex justify-between items-start mb-1.5">
              <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Paid</p>
              <FiChevronRight size={12} style={{ color: '#1F271B', opacity: 0.5 }} />
            </div>
            <p className="text-[10px] mb-1.5" style={{ color: '#1F271B', opacity: 0.6 }}>All time</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-bold" style={{ color: '#1F271B' }}>{paidCount}</span>
              {paidCount > 0 && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#15803D' }}>
                  <FiTrendingUp size={12} /> Collected
                </span>
              )}
            </div>
            <p className="text-xs mt-1" style={{ color: '#1F271B', opacity: 0.8 }}>{formatAmount(paidTotal)}</p>
          </div>
        </div>

        <div className="rounded shadow-sm border overflow-hidden transition-all hover:shadow-md" style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}>
          <div className="h-0.5" style={{ backgroundColor: '#2B50AA' }} />
          <div className="p-3">
            <div className="flex justify-between items-start mb-1.5">
              <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Average invoice</p>
              <FiChevronRight size={12} style={{ color: '#1F271B', opacity: 0.5 }} />
            </div>
            <p className="text-[10px] mb-1.5" style={{ color: '#1F271B', opacity: 0.6 }}>All invoices</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-bold" style={{ color: '#1F271B' }}>{formatAmount(averageInvoice)}</span>
            </div>
            <p className="text-[10px] mt-1" style={{ color: '#1F271B', opacity: 0.6 }}>Total volume: {formatAmount(totalVolume)}</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded shadow-sm border p-3" style={{ borderColor: '#EAEBED', marginTop: '2rem' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
          <h2 className="text-base font-bold" style={{ color: '#1F271B' }}>
            All invoices ({filteredInvoices.length} result{filteredInvoices.length !== 1 ? 's' : ''})
          </h2>
          <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end flex-wrap">
            {hasActiveFilters && (
              <button type="button" onClick={clearAllFilters} className="text-xs font-medium hover:underline px-1" style={{ color: '#28AFB0' }}>
                Clear filters
              </button>
            )}

            {/* Business Filter */}
            <div className="relative" ref={businessDropdownRef}>
              <button onClick={() => setIsBusinessDropdownOpen(!isBusinessDropdownOpen)} className="px-2.5 py-1.5 rounded border text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md" style={{ backgroundColor: businessFilter === 'all' ? '#F3F4F6' : 'white', borderColor: '#EAEBED', color: '#1F271B' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#D1D5DB'; if (businessFilter !== 'all') e.currentTarget.style.backgroundColor = '#F9FAFB' }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#EAEBED'; if (businessFilter !== 'all') e.currentTarget.style.backgroundColor = 'white' }}>
                <span className="font-semibold" style={{ color: '#1F271B' }}>Business</span>
                <span style={{ color: '#1F271B', opacity: 0.5 }}>|</span>
                <span style={{ color: '#1F271B', opacity: 0.8 }}>{businessFilter === 'all' ? 'All' : businessFilter}</span>
                <FiChevronDown size={12} className={`transition-transform ${isBusinessDropdownOpen ? 'rotate-180' : ''}`} style={{ color: '#1F271B', opacity: 0.6 }} />
              </button>
              {isBusinessDropdownOpen && (
                <div className="absolute right-0 mt-1 bg-white rounded shadow-lg border z-10 min-w-[200px] py-1" style={{ borderColor: '#EAEBED' }}>
                  {businessFilterOptions.map((opt, idx) => (
                    <span key={opt.value}>
                      {idx > 0 && <div className="mx-2 border-t" style={{ borderStyle: 'dashed', borderColor: '#EAEBED' }} />}
                      <button onClick={() => { setBusinessFilter(opt.value); setIsBusinessDropdownOpen(false) }} className="w-full text-left px-2 py-1.5 text-xs transition-colors" style={{ color: '#1F271B', backgroundColor: businessFilter === opt.value ? '#F3F4F6' : 'white' }} onMouseEnter={(e) => { if (businessFilter !== opt.value) e.currentTarget.style.backgroundColor = '#F9FAFB' }} onMouseLeave={(e) => { if (businessFilter !== opt.value) e.currentTarget.style.backgroundColor = 'white' }}>{opt.label}</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Status Filter */}
            <div className="relative" ref={statusDropdownRef}>
              <button onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)} className="px-2.5 py-1.5 rounded border text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md" style={{ backgroundColor: statusFilter === 'all' ? '#F3F4F6' : 'white', borderColor: '#EAEBED', color: '#1F271B' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#D1D5DB'; if (statusFilter !== 'all') e.currentTarget.style.backgroundColor = '#F9FAFB' }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#EAEBED'; if (statusFilter !== 'all') e.currentTarget.style.backgroundColor = 'white' }}>
                <span className="font-semibold" style={{ color: '#1F271B' }}>Status</span>
                <span style={{ color: '#1F271B', opacity: 0.5 }}>|</span>
                <span style={{ color: '#1F271B', opacity: 0.8 }}>{statusFilterOptions.find(o => o.value === statusFilter)?.label ?? statusFilter}</span>
                <FiChevronDown size={12} className={`transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} style={{ color: '#1F271B', opacity: 0.6 }} />
              </button>
              {isStatusDropdownOpen && (
                <div className="absolute right-0 mt-1 bg-white rounded shadow-lg border z-10 min-w-[180px] py-1" style={{ borderColor: '#EAEBED' }}>
                  {statusFilterOptions.map((opt, idx) => (
                    <span key={opt.value}>
                      {idx > 0 && <div className="mx-2 border-t" style={{ borderStyle: 'dashed', borderColor: '#EAEBED' }} />}
                      <button onClick={() => { setStatusFilter(opt.value); setIsStatusDropdownOpen(false) }} className="w-full text-left px-2 py-1.5 text-xs transition-colors" style={{ color: '#1F271B', backgroundColor: statusFilter === opt.value ? '#F3F4F6' : 'white' }} onMouseEnter={(e) => { if (statusFilter !== opt.value) e.currentTarget.style.backgroundColor = '#F9FAFB' }} onMouseLeave={(e) => { if (statusFilter !== opt.value) e.currentTarget.style.backgroundColor = 'white' }}>{opt.label}</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Search */}
            <div className="relative flex-1 sm:flex-initial">
              <FiSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2" size={14} style={{ color: '#1F271B', opacity: 0.5 }} />
              <input type="text" placeholder="Search by invoice ID or client..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full sm:w-56 pl-8 pr-3 py-1.5 border rounded text-xs focus:outline-none transition-all shadow-sm hover:shadow-md" style={{ borderColor: '#EAEBED', color: '#1F271B' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#28AFB0'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)' }} onBlur={(e) => { e.currentTarget.style.borderColor = '#EAEBED'; e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }} onMouseEnter={(e) => { if (document.activeElement !== e.currentTarget) e.currentTarget.style.borderColor = '#D1D5DB' }} onMouseLeave={(e) => { if (document.activeElement !== e.currentTarget) e.currentTarget.style.borderColor = '#EAEBED' }} />
            </div>
          </div>
        </div>

        {filteredInvoices.length > 0 ? (
          <div className="rounded overflow-hidden border" style={{ borderColor: '#EAEBED' }}>
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#F3F4F6' }}>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Invoice ID</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Business</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Client</th>
                  <th className="px-3 py-2 text-right text-[10px] font-semibold" style={{ color: '#1F271B' }}>Amount</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Status</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => {
                  const color = getStatusColor(invoice.status)
                  return (
                    <tr
                      key={invoice.id}
                      className="border-t cursor-pointer transition-colors"
                      style={{ borderColor: '#EAEBED' }}
                      onClick={() => router.push(`/admin/invoices/${invoice.id}`)}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white' }}
                    >
                      <td className="px-3 py-2"><p className="text-xs font-medium" style={{ color: '#1F271B' }}>{invoice.id}</p></td>
                      <td className="px-3 py-2"><p className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>{invoice.business}</p></td>
                      <td className="px-3 py-2"><p className="text-xs font-medium" style={{ color: '#1F271B' }}>{invoice.client}</p></td>
                      <td className="px-3 py-2 text-right"><p className="text-xs font-semibold" style={{ color: '#1F271B' }}>${invoice.amount.toLocaleString()}</p></td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium" style={{ backgroundColor: color.bg, color: color.text }}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-3 py-2"><p className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>{invoice.dueDate}</p></td>
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
    </div>
  )
}