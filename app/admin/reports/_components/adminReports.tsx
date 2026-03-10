'use client'

import { useState, useRef, useEffect } from 'react'
import { FiDownload, FiChevronDown, FiChevronRight, FiFilter } from 'react-icons/fi'

const mockReportData = [
  { business: 'ABC Corporation', jobs: 142, revenue: 45800, invoicesPaid: 89, invoicesOverdue: 12 },
  { business: 'TechStart Solutions', jobs: 89, revenue: 32400, invoicesPaid: 56, invoicesOverdue: 8 },
  { business: 'BuildRight Construction', jobs: 167, revenue: 54200, invoicesPaid: 102, invoicesOverdue: 15 },
  { business: 'Global Industries Ltd', jobs: 234, revenue: 78900, invoicesPaid: 145, invoicesOverdue: 23 },
  { business: 'ProServices Inc', jobs: 198, revenue: 67500, invoicesPaid: 121, invoicesOverdue: 18 },
]

const dateRangeOptions = [
  { value: '7days', label: 'Last 7 days' },
  { value: '30days', label: 'Last 30 days' },
  { value: '3months', label: 'Last 3 months' },
  { value: '12months', label: 'Last 12 months' },
  { value: 'all', label: 'All time' },
]

const businessOptions = [
  { value: 'all', label: 'All Businesses' },
  { value: 'ABC Corporation', label: 'ABC Corporation' },
  { value: 'TechStart Solutions', label: 'TechStart Solutions' },
  { value: 'BuildRight Construction', label: 'BuildRight Construction' },
  { value: 'Global Industries Ltd', label: 'Global Industries Ltd' },
  { value: 'ProServices Inc', label: 'ProServices Inc' },
]

const reportTypeOptions = [
  { value: 'summary', label: 'Business Summary' },
  { value: 'revenue', label: 'Revenue Report' },
  { value: 'jobs', label: 'Jobs Report' },
  { value: 'invoices', label: 'Invoices Report' },
]

const formatAmount = (n: number) => {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`
  return `$${n.toLocaleString()}`
}

function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (val: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const selectedLabel = options.find(o => o.value === value)?.label ?? value

  return (
    <div className="relative" ref={ref}>
      <p className="text-[10px] font-semibold mb-1" style={{ color: '#1F271B', opacity: 0.6 }}>{label}</p>
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-2.5 py-1.5 rounded border text-xs font-medium flex items-center justify-between gap-1.5 transition-all shadow-sm hover:shadow-md"
        style={{
          backgroundColor: '#F3F4F6',
          borderColor: '#EAEBED',
          color: '#1F271B',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#D1D5DB' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#EAEBED' }}
      >
        <span style={{ color: '#1F271B', opacity: 0.85 }}>{selectedLabel}</span>
        <FiChevronDown
          size={12}
          className={`transition-transform shrink-0 ${open ? 'rotate-180' : ''}`}
          style={{ color: '#1F271B', opacity: 0.6 }}
        />
      </button>
      {open && (
        <div
          className="absolute left-0 mt-1 bg-white rounded shadow-lg border z-10 min-w-full py-1"
          style={{ borderColor: '#EAEBED' }}
        >
          {options.map((opt, idx) => (
            <span key={opt.value}>
              {idx > 0 && (
                <div className="mx-2 border-t" style={{ borderStyle: 'dashed', borderColor: '#EAEBED' }} />
              )}
              <button
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className="w-full text-left px-2 py-1.5 text-xs transition-colors"
                style={{
                  color: '#1F271B',
                  backgroundColor: value === opt.value ? '#F3F4F6' : 'white',
                }}
                onMouseEnter={(e) => { if (value !== opt.value) e.currentTarget.style.backgroundColor = '#F9FAFB' }}
                onMouseLeave={(e) => { if (value !== opt.value) e.currentTarget.style.backgroundColor = 'white' }}
              >
                {opt.label}
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export function AdminReports() {
  const [dateRange, setDateRange] = useState('30days')
  const [business, setBusiness] = useState('all')
  const [reportType, setReportType] = useState('summary')

  const filteredData = business === 'all'
    ? mockReportData
    : mockReportData.filter(row => row.business === business)

  const totals = filteredData.reduce(
    (acc, row) => ({
      jobs: acc.jobs + row.jobs,
      revenue: acc.revenue + row.revenue,
      invoicesPaid: acc.invoicesPaid + row.invoicesPaid,
      invoicesOverdue: acc.invoicesOverdue + row.invoicesOverdue,
    }),
    { jobs: 0, revenue: 0, invoicesPaid: 0, invoicesOverdue: 0 }
  )

  const dateRangeLabel = dateRangeOptions.find(o => o.value === dateRange)?.label ?? dateRange
  const reportTypeLabel = reportTypeOptions.find(o => o.value === reportType)?.label ?? reportType

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#1F271B' }}>Reports</h1>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Filter Panel */}
        <div
          className="w-full lg:w-56 shrink-0 rounded shadow-sm border overflow-hidden"
          style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
        >
          <div className="h-0.5" style={{ backgroundColor: '#28AFB0' }} />
          <div className="p-3">
            <div className="flex justify-between items-start mb-3">
              <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Filters</p>
              <FiChevronRight size={12} style={{ color: '#1F271B', opacity: 0.5 }} />
            </div>
            <div className="space-y-3">
              <FilterDropdown
                label="Date Range"
                value={dateRange}
                options={dateRangeOptions}
                onChange={setDateRange}
              />
              <FilterDropdown
                label="Business"
                value={business}
                options={businessOptions}
                onChange={setBusiness}
              />
              <FilterDropdown
                label="Report Type"
                value={reportType}
                options={reportTypeOptions}
                onChange={setReportType}
              />
              <button
                className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold transition-all shadow-sm hover:shadow-md"
                style={{ backgroundColor: '#28AFB0', color: 'white' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E8A8B' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#28AFB0' }}
              >
                <FiFilter size={12} />
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Main Report Area */}
        <div className="flex-1 min-w-0 bg-white rounded shadow-sm border" style={{ borderColor: '#EAEBED' }}>
          {/* Report Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border-b" style={{ borderColor: '#EAEBED' }}>
            <div>
              <h2 className="text-base font-bold" style={{ color: '#1F271B' }}>{reportTypeLabel}</h2>
              <p className="text-[10px] mt-0.5" style={{ color: '#1F271B', opacity: 0.55 }}>
                {dateRangeLabel} · {business === 'all' ? 'All businesses' : business}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-2.5 py-1.5 rounded border text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md"
                style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED', color: '#1F271B' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#D1D5DB' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#EAEBED' }}
              >
                <FiDownload size={12} />
                Export CSV
              </button>
              <button
                className="px-2.5 py-1.5 rounded border text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md"
                style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED', color: '#1F271B' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#D1D5DB' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#EAEBED' }}
              >
                <FiDownload size={12} />
                Export PDF
              </button>
            </div>
          </div>

          {/* Report Table */}
          <div className="rounded overflow-hidden">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#F3F4F6' }}>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Business</th>
                  <th className="px-3 py-2 text-right text-[10px] font-semibold" style={{ color: '#1F271B' }}>Total Jobs</th>
                  <th className="px-3 py-2 text-right text-[10px] font-semibold" style={{ color: '#1F271B' }}>Revenue</th>
                  <th className="px-3 py-2 text-right text-[10px] font-semibold" style={{ color: '#1F271B' }}>Invoices Paid</th>
                  <th className="px-3 py-2 text-right text-[10px] font-semibold" style={{ color: '#1F271B' }}>Invoices Overdue</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => (
                  <tr
                    key={index}
                    className="border-t cursor-pointer transition-colors"
                    style={{ borderColor: '#EAEBED' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white' }}
                  >
                    <td className="px-3 py-2">
                      <p className="text-xs font-medium" style={{ color: '#1F271B' }}>{row.business}</p>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <p className="text-xs" style={{ color: '#1F271B', opacity: 0.8 }}>{row.jobs}</p>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>${row.revenue.toLocaleString()}</p>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span
                        className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium"
                        style={{ backgroundColor: 'rgba(40, 175, 176, 0.2)', color: '#1E8A8B' }}
                      >
                        {row.invoicesPaid}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span
                        className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium"
                        style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#DC2626' }}
                      >
                        {row.invoicesOverdue}
                      </span>
                    </td>
                  </tr>
                ))}

                {/* Totals Row */}
                <tr className="border-t" style={{ borderColor: '#EAEBED', backgroundColor: '#F3F4F6' }}>
                  <td className="px-3 py-2">
                    <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Total</p>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>{totals.jobs}</p>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>${totals.revenue.toLocaleString()}</p>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span
                      className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium"
                      style={{ backgroundColor: 'rgba(40, 175, 176, 0.2)', color: '#1E8A8B' }}
                    >
                      {totals.invoicesPaid}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span
                      className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium"
                      style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#DC2626' }}
                    >
                      {totals.invoicesOverdue}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}