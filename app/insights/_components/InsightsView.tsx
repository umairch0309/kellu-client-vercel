'use client'

import { useState, useMemo } from 'react'
import { format, subYears, startOfYear, endOfYear, startOfMonth, endOfMonth, subMonths, subWeeks, isWithinInterval, parseISO, getMonth, getYear } from 'date-fns'
import { FiCalendar } from 'react-icons/fi'
import { mockWorkorders } from '@/data/mockData'
import { formatUsd } from '@/lib/formatCurrency'

type TabId = 'revenue' | 'lead_conversion' | 'jobs' | 'invoices'
type DateRangePreset = 'last_12_weeks' | 'this_year_to_date' | 'last_12_months' | 'last_year_to_date'
type OverviewPreset = 'month_to_date' | 'last_month' | 'year_to_date' | 'custom'

const TAB_LABELS: Record<TabId, string> = {
  revenue: 'Revenue',
  'lead_conversion': 'Lead conversion',
  jobs: 'Jobs',
  invoices: 'Invoices',
}

function getRangeForOverviewPreset(preset: OverviewPreset): { start: Date; end: Date } {
  const now = new Date()
  switch (preset) {
    case 'month_to_date':
      return { start: startOfMonth(now), end: now }
    case 'last_month':
      const lastMonth = subMonths(now, 1)
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) }
    case 'year_to_date':
      return { start: startOfYear(now), end: now }
    case 'custom':
      return { start: subMonths(now, 1), end: now }
    default:
      return { start: startOfMonth(now), end: now }
  }
}

function getRangeForPreset(preset: DateRangePreset): { start: Date; end: Date } {
  const now = new Date()
  switch (preset) {
    case 'last_12_weeks':
      return { start: subWeeks(now, 12), end: now }
    case 'this_year_to_date':
      return { start: startOfYear(now), end: now }
    case 'last_12_months':
      return { start: subMonths(now, 12), end: now }
    case 'last_year_to_date':
      const lastYear = subYears(now, 1)
      return { start: startOfYear(lastYear), end: endOfYear(lastYear) }
    default:
      return { start: subWeeks(now, 12), end: now }
  }
}

function inRange(dateStr: string, start: Date, end: Date): boolean {
  try {
    const d = parseISO(dateStr)
    return isWithinInterval(d, { start, end })
  } catch {
    return false
  }
}

const INVOICED_STATUSES = ['waiting for payment', 'paid', 'overdue']
const EXCLUDED_JOB_STATUSES = ['Unscheduled', 'Unassigned', 'Cancelled']

const PRESET_OPTIONS: { value: DateRangePreset; label: string }[] = [
  { value: 'last_12_weeks', label: 'Last 12 weeks' },
  { value: 'this_year_to_date', label: `This year (${new Date().getFullYear()}) to date` },
  { value: 'last_12_months', label: 'Last 12 months' },
  { value: 'last_year_to_date', label: `Last year (${new Date().getFullYear() - 1}) to date` },
]

const OVERVIEW_PRESET_OPTIONS: { value: OverviewPreset; label: string }[] = [
  { value: 'month_to_date', label: 'Month to date' },
  { value: 'last_month', label: 'Last month' },
  { value: 'year_to_date', label: 'Year to date' },
  { value: 'custom', label: 'Custom' },
]

// Use a proper index signature so year numbers can index these types safely
type YearMap = Record<number, number>

export default function InsightsView() {
  const [activeTab, setActiveTab] = useState<TabId>('revenue')
  const [datePreset, setDatePreset] = useState<DateRangePreset>('last_12_weeks')
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false)
  const [overviewPreset, setOverviewPreset] = useState<OverviewPreset>('month_to_date')
  const [overviewDropdownOpen, setOverviewDropdownOpen] = useState(false)

  const overviewRange = useMemo(() => getRangeForOverviewPreset(overviewPreset), [overviewPreset])
  const overviewRangeLabel = overviewPreset === 'custom'
    ? `${format(overviewRange.start, 'MMM d, yyyy')} - ${format(overviewRange.end, 'MMM d, yyyy')}`
    : overviewPreset === 'month_to_date'
      ? 'Month to date'
      : overviewPreset === 'last_month'
        ? 'Last month'
        : 'Year to date'

  const overviewKpis = useMemo(() => {
    const start = overviewRange.start
    const end = overviewRange.end
    let convertedQuotes = 0
    let jobs = 0
    let invoicedValue = 0
    const isInvoiced = (s: string) => INVOICED_STATUSES.includes((s ?? '').toLowerCase())
    mockWorkorders.forEach((wo) => {
      if (wo.quoteDateSent && (wo as { quoteStatus?: string }).quoteStatus === 'approved' && inRange(wo.quoteDateSent, start, end)) convertedQuotes += 1
      if (wo.schedule?.day && !EXCLUDED_JOB_STATUSES.some((s) => ((wo as { jobStatus?: string }).jobStatus ?? '').toLowerCase() === s.toLowerCase()) && inRange(wo.schedule.day, start, end)) jobs += 1
      if (wo.invoiceDateSent && isInvoiced((wo as { invoiceStatus?: string }).invoiceStatus ?? '') && inRange(wo.invoiceDateSent, start, end)) {
        invoicedValue += (wo.subtotal ?? 0) - (wo.discount ?? 0)
      }
    })
    return { convertedQuotes, jobs, invoicedValue }
  }, [overviewRange])

  const range = useMemo(() => getRangeForPreset(datePreset), [datePreset])
  const rangeLabel = `${format(range.start, 'MMM d, yyyy')} - ${format(range.end, 'MMM d, yyyy')}`

  const isInvoicedStatus = (s: string) => INVOICED_STATUSES.includes((s ?? '').toLowerCase())

  const { revenueByMonth, jobsByMonth, invoicesByMonth, totals } = useMemo(() => {
    const start = range.start
    const end = range.end
    // Fixed: use Record<number, number> so dynamic year keys are valid
    const revenueByMonth: Record<string, YearMap> = {}
    const jobsByMonth: Record<string, YearMap> = {}
    const invoicesByMonth: Record<string, YearMap> = {}
    const monthKeys = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    let totalRevenue2025 = 0
    let totalRevenue2026 = 0
    let totalJobs2025 = 0
    let totalJobs2026 = 0
    let totalInvoiced2025 = 0
    let totalInvoiced2026 = 0

    mockWorkorders.forEach((wo) => {
      const invStatus = (wo as { invoiceStatus?: string }).invoiceStatus ?? ''
      const jobStatus = (wo as { jobStatus?: string }).jobStatus ?? ''
      const net = (wo.subtotal ?? 0) - (wo.discount ?? 0)

      if (wo.invoiceDateSent && isInvoicedStatus(invStatus) && inRange(wo.invoiceDateSent, start, end)) {
        const d = parseISO(wo.invoiceDateSent)
        const y = getYear(d)
        const m = monthKeys[getMonth(d)]
        if (!revenueByMonth[m]) revenueByMonth[m] = {}
        revenueByMonth[m][y] = (revenueByMonth[m][y] ?? 0) + net
        if (y === 2025) totalRevenue2025 += net
        else if (y === 2026) totalRevenue2026 += net
      }
      if (wo.invoiceDateSent && isInvoicedStatus(invStatus) && inRange(wo.invoiceDateSent, start, end)) {
        const d = parseISO(wo.invoiceDateSent)
        const y = getYear(d)
        const m = monthKeys[getMonth(d)]
        if (!invoicesByMonth[m]) invoicesByMonth[m] = {}
        invoicesByMonth[m][y] = (invoicesByMonth[m][y] ?? 0) + net
        if (y === 2025) totalInvoiced2025 += net
        else if (y === 2026) totalInvoiced2026 += net
      }
      if (wo.schedule?.day && !EXCLUDED_JOB_STATUSES.some((s) => jobStatus.toLowerCase() === s.toLowerCase()) && inRange(wo.schedule.day, start, end)) {
        const d = parseISO(wo.schedule.day)
        const y = getYear(d)
        const m = monthKeys[getMonth(d)]
        if (!jobsByMonth[m]) jobsByMonth[m] = {}
        jobsByMonth[m][y] = (jobsByMonth[m][y] ?? 0) + 1
        if (y === 2025) totalJobs2025 += 1
        else if (y === 2026) totalJobs2026 += 1
      }
    })

    const allMonths = [...monthKeys]
    allMonths.forEach((m) => {
      if (!revenueByMonth[m]) revenueByMonth[m] = {}
      if (!jobsByMonth[m]) jobsByMonth[m] = {}
      if (!invoicesByMonth[m]) invoicesByMonth[m] = {}
    })

    return {
      revenueByMonth,
      jobsByMonth,
      invoicesByMonth,
      totals: {
        revenue: { 2025: totalRevenue2025, 2026: totalRevenue2026 } as YearMap,
        jobs: { 2025: totalJobs2025, 2026: totalJobs2026 } as YearMap,
        invoices: { 2025: totalInvoiced2025, 2026: totalInvoiced2026 } as YearMap,
      },
      monthKeys,
    }
  }, [range])

  const leadConversionByMonth = useMemo(() => {
    const start = range.start
    const end = range.end
    // Fixed: use Record<number, number> so dynamic year keys are valid
    const result: Record<string, YearMap> = {}
    const monthKeys = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    monthKeys.forEach((m) => { result[m] = {} })
    let total2025 = 0
    let total2026 = 0
    mockWorkorders.forEach((wo) => {
      if (!wo.quoteDateSent) return
      const qs = (wo as { quoteStatus?: string }).quoteStatus
      if (qs !== 'approved') return
      if (!inRange(wo.quoteDateSent, start, end)) return
      const d = parseISO(wo.quoteDateSent)
      const y = getYear(d)
      const m = monthKeys[getMonth(d)]
      result[m][y] = (result[m][y] ?? 0) + 1
      if (y === 2025) total2025 += 1
      else if (y === 2026) total2026 += 1
    })
    return { data: result, monthKeys, totals: { 2025: total2025, 2026: total2026 } as YearMap }
  }, [range])

  const chartData = useMemo(() => {
    const keys = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    if (activeTab === 'revenue') return { keys, byMonth: revenueByMonth, totals: totals.revenue, format: 'currency' as const }
    if (activeTab === 'jobs') return { keys, byMonth: jobsByMonth, totals: totals.jobs, format: 'number' as const }
    if (activeTab === 'invoices') return { keys, byMonth: invoicesByMonth, totals: totals.invoices, format: 'currency' as const }
    return { keys: leadConversionByMonth.monthKeys, byMonth: leadConversionByMonth.data, totals: leadConversionByMonth.totals, format: 'number' as const }
  }, [activeTab, revenueByMonth, jobsByMonth, invoicesByMonth, leadConversionByMonth, totals])

  const maxVal = useMemo(() => {
    let m = 0
    Object.values(chartData.byMonth).forEach((months) => {
      Object.values(months).forEach((v) => { if (typeof v === 'number' && v > m) m = v })
    })
    return m
  }, [chartData.byMonth])

  const selectPreset = (p: DateRangePreset) => {
    setDatePreset(p)
    setDateDropdownOpen(false)
  }

  return (
    <div className="space-y-6 pb-8">
      <h1 className="text-2xl font-bold" style={{ color: '#1F271B' }}>Insights</h1>

      {/* Overview section */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold" style={{ color: '#1F271B' }}>Overview</h2>
          <div className="relative">
            <button
              type="button"
              onClick={() => setOverviewDropdownOpen((o) => !o)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm hover:bg-gray-50"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
            >
              <FiCalendar size={16} style={{ opacity: 0.8 }} />
              {overviewRangeLabel}
            </button>
            {overviewDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" aria-hidden onClick={() => setOverviewDropdownOpen(false)} />
                <div
                  className="absolute right-0 top-full mt-1 py-2 rounded-lg border shadow-lg bg-white z-20 min-w-[180px]"
                  style={{ borderColor: '#EAEBED' }}
                >
                  {OVERVIEW_PRESET_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { setOverviewPreset(opt.value); setOverviewDropdownOpen(false) }}
                      className="w-full px-3 py-2 text-left text-sm flex items-center justify-between hover:bg-gray-50"
                      style={{
                        color: '#1F271B',
                        backgroundColor: overviewPreset === opt.value ? 'rgba(40, 175, 176, 0.12)' : undefined,
                      }}
                    >
                      <span>{opt.label}</span>
                      {overviewPreset === opt.value && <span className="text-lg" style={{ color: '#28AFB0' }}>✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border p-4 shadow-sm" style={{ borderColor: '#EAEBED', backgroundColor: '#fff' }}>
            <p className="text-sm font-medium" style={{ color: '#1F271B', opacity: 0.8 }}>Converted Quotes</p>
            <p className="text-2xl font-bold mt-1" style={{ color: '#1F271B' }}>{overviewKpis.convertedQuotes}</p>
          </div>
          <div className="rounded-lg border p-4 shadow-sm" style={{ borderColor: '#EAEBED', backgroundColor: '#fff' }}>
            <p className="text-sm font-medium" style={{ color: '#1F271B', opacity: 0.8 }}>Jobs</p>
            <p className="text-2xl font-bold mt-1" style={{ color: '#1F271B' }}>{overviewKpis.jobs}</p>
          </div>
          <div className="rounded-lg border p-4 shadow-sm" style={{ borderColor: '#EAEBED', backgroundColor: '#fff' }}>
            <p className="text-sm font-medium" style={{ color: '#1F271B', opacity: 0.8 }}>Invoiced value</p>
            <p className="text-2xl font-bold mt-1" style={{ color: '#1F271B' }}>{formatUsd(overviewKpis.invoicedValue, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
          </div>
        </div>
      </section>

      <div className="flex border-b" style={{ borderColor: '#EAEBED' }}>
        {(Object.keys(TAB_LABELS) as TabId[]).map((tabId) => (
          <button
            key={tabId}
            type="button"
            onClick={() => setActiveTab(tabId)}
            className="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
            style={{
              borderBottomColor: activeTab === tabId ? '#28AFB0' : 'transparent',
              color: activeTab === tabId ? '#28AFB0' : '#1F271B',
              opacity: activeTab === tabId ? 1 : 0.7,
            }}
          >
            {TAB_LABELS[tabId]}
          </button>
        ))}
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold border-b-2 border-dashed border-transparent pb-0.5" style={{ color: '#1F271B', borderBottomColor: '#1F271B' }}>
            {TAB_LABELS[activeTab]}
          </h2>
          <div className="relative">
            <button
              type="button"
              onClick={() => setDateDropdownOpen((o) => !o)}
              className="flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-gray-50"
              style={{ color: '#1F271B' }}
            >
              <FiCalendar size={16} style={{ opacity: 0.8 }} />
              {rangeLabel}
            </button>
            {dateDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" aria-hidden onClick={() => setDateDropdownOpen(false)} />
                <div
                  className="absolute left-0 top-full mt-1 py-2 rounded-lg border shadow-lg bg-white z-20 min-w-[240px]"
                  style={{ borderColor: '#EAEBED' }}
                >
                  {PRESET_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => selectPreset(opt.value)}
                      className="w-full px-3 py-2 text-left text-sm flex items-center justify-between hover:bg-gray-50"
                      style={{
                        color: '#1F271B',
                        backgroundColor: datePreset === opt.value ? 'rgba(40, 175, 176, 0.12)' : undefined,
                      }}
                    >
                      <span>{opt.label}</span>
                      {datePreset === opt.value && <span className="text-lg" style={{ color: '#28AFB0' }}>✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {(activeTab === 'revenue' || activeTab === 'invoices') && (
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#7C3AED' }} />
              <span className="text-sm font-semibold" style={{ color: '#1F271B' }}>
                ${(chartData.totals[2025] ?? 0).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </span>
              <span className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>2025</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#28AFB0' }} />
              <span className="text-sm font-semibold" style={{ color: '#1F271B' }}>
                {formatUsd(chartData.totals[2026] ?? 0, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </span>
              <span className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>2026</span>
            </div>
          </div>
        )}
        {(activeTab === 'jobs' || activeTab === 'lead_conversion') && (
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#7C3AED' }} />
              <span className="text-sm font-semibold" style={{ color: '#1F271B' }}>{chartData.totals[2025] ?? 0}</span>
              <span className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>2025</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#28AFB0' }} />
              <span className="text-sm font-semibold" style={{ color: '#1F271B' }}>{chartData.totals[2026] ?? 0}</span>
              <span className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>2026</span>
            </div>
          </div>
        )}

        <div className="rounded-lg border p-4" style={{ borderColor: '#EAEBED', backgroundColor: '#FAFAFA' }}>
          <div className="flex gap-4 items-end justify-between" style={{ minHeight: 200 }}>
            {chartData.keys.slice(0, 12).map((month) => {
              const vals = chartData.byMonth[month] ?? {}
              const v2025 = vals[2025] ?? 0
              const v2026 = vals[2026] ?? 0
              const scale = maxVal > 0 ? 160 / maxVal : 0
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex justify-center gap-0.5 items-end" style={{ height: 160 }}>
                    {v2025 > 0 && (
                      <div
                        className="w-4 rounded-t"
                        style={{ height: Math.max(4, v2025 * scale), backgroundColor: '#7C3AED' }}
                        title={`2025: ${chartData.format === 'currency' ? formatUsd(v2025, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : v2025}`}
                      />
                    )}
                    {v2026 > 0 && (
                      <div
                        className="w-4 rounded-t"
                        style={{ height: Math.max(4, v2026 * scale), backgroundColor: '#28AFB0' }}
                        title={`2026: ${chartData.format === 'currency' ? formatUsd(v2026, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : v2026}`}
                      />
                    )}
                  </div>
                  <span className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>{month}</span>
                </div>
              )
            })}
          </div>
          <div className="flex gap-4 mt-2 justify-center">
            <span className="flex items-center gap-1.5 text-xs" style={{ color: '#1F271B', opacity: 0.8 }}><span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#7C3AED' }} />2025</span>
            <span className="flex items-center gap-1.5 text-xs" style={{ color: '#1F271B', opacity: 0.8 }}><span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#28AFB0' }} />2026</span>
          </div>
        </div>
      </section>
    </div>
  )
}