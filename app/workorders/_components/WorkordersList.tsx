'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import type { WorkorderRow } from './WorkordersTable'
import WorkordersListHeader from './WorkordersListHeader'
import WorkordersOverviewCards from './WorkordersOverviewCards'
import WorkordersFiltersBar from './WorkordersFiltersBar'
import WorkordersTable from './WorkordersTable'
import { FileText, FileDown } from 'lucide-react'
import { useCSVDownload } from '@/hooks/csv-download'
import { usePDFDownload } from '@/hooks/pdf-download'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

function extractWorkordersList(json: unknown): unknown[] {
  if (json == null || typeof json !== 'object') return []
  const obj = json as Record<string, unknown>
  const data = obj.data
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const inner = (data as Record<string, unknown>).data
    if (Array.isArray(inner)) return inner
  }
  if (Array.isArray(data)) return data
  return []
}

const QUOTE_MAP: Record<string, string> = {
  NOT_SENT: 'not sent',
  AWAITING_RESPONSE: 'waiting for approval',
  APPROVED: 'approved',
  CONVERTED: 'approved',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
}
const JOB_MAP: Record<string, string> = {
  UNSCHEDULED: 'Unscheduled',
  UNASSIGNED: 'Unscheduled',
  SCHEDULED: 'Scheduled',
  ON_MY_WAY: 'In Progress',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}
const INVOICE_MAP: Record<string, string> = {
  NOT_SENT: 'not sent',
  AWAITING_PAYMENT: 'waiting for payment',
  OVERDUE: 'overdue',
  PAID: 'paid',
  BAD_DEBT: 'bad debt',
  CANCELLED: 'cancelled',
}

type ExportRow = Record<string, string | number | null | undefined>

function workordersToExportRows(rows: WorkorderRow[]): ExportRow[] {
  return rows.map(wo => {
    const scheduleStr = wo.schedule
      ? `${wo.schedule.day}${wo.schedule.startTime != null || wo.schedule.endTime != null ? ` • ${wo.schedule.startTime ?? '—'} - ${wo.schedule.endTime ?? '—'}` : ''}`
      : '—'
    const woNumber = wo.workOrderNumber ?? (wo.title ? `${wo.title}` : String(wo.id))
    return {
      'Client Name': wo.clientName ?? '—',
      'Work order number': woNumber,
      Title: wo.title ?? '—',
      Address: wo.address ?? '—',
      Schedule: scheduleStr,
      'Quote status': wo.quoteStatus ?? '—',
      'Job status': wo.jobStatus ?? '—',
      'Invoice status': wo.invoiceStatus ?? '—',
      Total: wo.total ?? 0,
      'Created at': wo.createdAt ? (format(new Date(wo.createdAt), 'MMM dd, yyyy') || wo.createdAt) : '—',
      'Last modified': wo.lastModified ? (format(new Date(wo.lastModified), 'MMM dd, yyyy') || wo.lastModified) : '—',
    }
  })
}

function normalizeWorkorder(raw: Record<string, unknown>): WorkorderRow {
  const id = raw.id ?? ''
  const workOrderNumber =
    raw.workOrderNumber != null && String(raw.workOrderNumber).trim() !== ''
      ? String(raw.workOrderNumber)
      : undefined
  const client = (raw.client ?? {}) as Record<string, unknown>
  const clientName = typeof client.name === 'string' ? client.name : '—'
  const address = typeof raw.address === 'string' ? raw.address : undefined
  const scheduledAt = raw.scheduledAt ?? raw.scheduled_at
  const startTime = raw.startTime ?? raw.start_time
  const endTime = raw.endTime ?? raw.end_time
  const schedule =
    scheduledAt != null && String(scheduledAt) !== ''
      ? {
          day: String(scheduledAt),
          startTime: startTime != null ? String(startTime) : undefined,
          endTime: endTime != null ? String(endTime) : undefined,
        }
      : undefined
  const quoteRaw = typeof raw.quoteStatus === 'string' ? raw.quoteStatus : (raw.quote_status as string)
  const jobRaw = typeof raw.jobStatus === 'string' ? raw.jobStatus : (raw.job_status as string)
  const invoiceRaw = typeof raw.invoiceStatus === 'string' ? raw.invoiceStatus : (raw.invoice_status as string)
  const quoteStatus = QUOTE_MAP[quoteRaw ?? ''] ?? quoteRaw ?? 'not sent'
  const jobStatus = JOB_MAP[jobRaw ?? ''] ?? jobRaw ?? 'Unscheduled'
  const invoiceStatus = INVOICE_MAP[invoiceRaw ?? ''] ?? invoiceRaw ?? 'not sent'
  const total =
    typeof raw.total === 'number' ? raw.total : typeof raw.total === 'string' ? parseFloat(raw.total) || 0 : 0
  const createdAt = raw.createdAt ?? raw.created_at
  const updatedAt = raw.updatedAt ?? raw.updated_at
  return {
    id: typeof id === 'string' ? id : typeof id === 'number' ? id : String(id),
    workOrderNumber: workOrderNumber ?? null,
    title: typeof raw.title === 'string' ? raw.title : '—',
    clientName,
    address,
    schedule,
    quoteStatus,
    jobStatus,
    invoiceStatus,
    total,
    createdAt: createdAt != null ? String(createdAt) : undefined,
    lastModified: updatedAt != null ? String(updatedAt) : undefined,
  }
}

export default function WorkordersList() {
  const router = useRouter()
  const [workorders, setWorkorders] = useState<WorkorderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
  const [workorderToDelete, setWorkorderToDelete] = useState<WorkorderRow | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchWorkorders = useCallback(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    setLoading(true)
    setError(null)
    fetch(`${baseUrl}/api/workorders`, { method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`)
        return res.json()
      })
      .then((json: unknown) => {
        const rawList = extractWorkordersList(json)
        const list = rawList
          .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
          .map((item) => normalizeWorkorder(item))
        setWorkorders(list)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load workorders')
        setWorkorders([])
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchWorkorders()
  }, [fetchWorkorders])

  const [overviewQuoteStats, setOverviewQuoteStats] = useState<Record<string, number>>({
    'not sent': 0,
    'waiting for approval': 0,
    approved: 0,
    rejected: 0,
    expired: 0,
  })
  const [overviewJobStats, setOverviewJobStats] = useState<Record<string, number>>({
    Unscheduled: 0,
    Scheduled: 0,
    'In Progress': 0,
    Completed: 0,
    Cancelled: 0,
  })
  const [overviewInvoiceStats, setOverviewInvoiceStats] = useState<Record<string, number>>({
    'not sent': 0,
    'waiting for payment': 0,
    paid: 0,
    overdue: 0,
    'bad debt': 0,
    cancelled: 0,
  })

  const fetchOverview = useCallback(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    fetch(`${baseUrl}/api/workorders/overview`, { method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`)
        return res.json()
      })
      .then((json: unknown) => {
        const obj = json as Record<string, unknown>
        const data = (obj?.data ?? {}) as Record<string, unknown>
        const quoteRaw = (data.quoteStatus ?? []) as Array<{ status: string; count: number }>
        const jobRaw = (data.jobStatus ?? []) as Array<{ status: string; count: number }>
        const invoiceRaw = (data.invoiceStatus ?? []) as Array<{ status: string; count: number }>

        const quote: Record<string, number> = {
          'not sent': 0,
          'waiting for approval': 0,
          approved: 0,
          rejected: 0,
          expired: 0,
        }
        quoteRaw.forEach(({ status, count }) => {
          const key = QUOTE_MAP[status] ?? status.replace(/_/g, ' ').toLowerCase()
          quote[key] = (quote[key] ?? 0) + (Number(count) || 0)
        })
        setOverviewQuoteStats(quote)

        const job: Record<string, number> = {
          Unscheduled: 0,
          Scheduled: 0,
          'In Progress': 0,
          Completed: 0,
          Cancelled: 0,
        }
        jobRaw.forEach(({ status, count }) => {
          const key = JOB_MAP[status] ?? status.replace(/_/g, ' ').trim()
          job[key] = (job[key] ?? 0) + (Number(count) || 0)
        })
        setOverviewJobStats(job)

        const invoice: Record<string, number> = {
          'not sent': 0,
          'waiting for payment': 0,
          paid: 0,
          overdue: 0,
          'bad debt': 0,
          cancelled: 0,
        }
        invoiceRaw.forEach(({ status, count }) => {
          const key = INVOICE_MAP[status] ?? status.replace(/_/g, ' ').toLowerCase()
          invoice[key] = (invoice[key] ?? 0) + (Number(count) || 0)
        })
        setOverviewInvoiceStats(invoice)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchOverview()
  }, [fetchOverview])

  const quoteStats = overviewQuoteStats
  const jobStats = overviewJobStats
  const invoiceStats = overviewInvoiceStats

  const filteredWorkorders = useMemo(() => {
    return workorders.filter((wo) => {
      const search = searchTerm.toLowerCase()
      const matchesSearch =
        wo.clientName.toLowerCase().includes(search) ||
        wo.title.toLowerCase().includes(search) ||
        (wo.address && wo.address.toLowerCase().includes(search)) ||
        `#${wo.id}`.includes(searchTerm)
      const matchesQuote = quoteStatusFilter === 'all' || wo.quoteStatus === quoteStatusFilter
      const matchesJob = jobStatusFilter === 'all' || wo.jobStatus === jobStatusFilter
      const matchesInvoice = invoiceStatusFilter === 'all' || wo.invoiceStatus === invoiceStatusFilter
      return matchesSearch && matchesQuote && matchesJob && matchesInvoice
    })
  }, [workorders, searchTerm, quoteStatusFilter, jobStatusFilter, invoiceStatusFilter])

  const hasActiveFilters = searchTerm !== '' || quoteStatusFilter !== 'all' || jobStatusFilter !== 'all' || invoiceStatusFilter !== 'all'

  const { downloadCSV } = useCSVDownload({ filename: 'workorders' })
  const { downloadPDF } = usePDFDownload({
    filename: 'workorders',
    title: 'Workorders',
    subtitle: `${filteredWorkorders.length} workorder${filteredWorkorders.length !== 1 ? 's' : ''}`,
  })

  const handleDownloadCSV = useCallback(() => {
    const rows = workordersToExportRows(filteredWorkorders)
    if (rows.length === 0) return
    downloadCSV(rows, `workorders-${format(new Date(), 'yyyy-MM-dd')}`)
  }, [filteredWorkorders, downloadCSV])

  const handleDownloadPDF = useCallback(() => {
    const rows = workordersToExportRows(filteredWorkorders)
    if (rows.length === 0) return
    downloadPDF(rows, {
      filename: `workorders-${format(new Date(), 'yyyy-MM-dd')}`,
      title: 'Workorders',
      subtitle: `${filteredWorkorders.length} workorder${filteredWorkorders.length !== 1 ? 's' : ''}`,
    })
  }, [filteredWorkorders, downloadPDF])

  const clearAllFilters = () => {
    setSearchTerm('')
    setQuoteStatusFilter('all')
    setJobStatusFilter('all')
    setInvoiceStatusFilter('all')
  }

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
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isQuoteDropdownOpen, isJobDropdownOpen, isInvoiceDropdownOpen])

  const handleRowClick = (workorderId: number | string) => {
    router.push(`/workorders/${workorderId}`)
  }

  const handleUpdateWorkorder = useCallback(
    (workorder: WorkorderRow) => {
      router.push(`/workorders/${workorder.id}/edit`)
    },
    [router]
  )

  const handleDeleteConfirm = useCallback(async () => {
    if (!workorderToDelete) return
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    setDeleteLoading(true)
    try {
      const res = await fetch(`${baseUrl}/api/workorders/${workorderToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
      if (!res.ok) {
        setDeleteLoading(false)
        return
      }
      setWorkorderToDelete(null)
      fetchWorkorders()
      fetchOverview()
    } catch {
      setDeleteLoading(false)
    } finally {
      setDeleteLoading(false)
    }
  }, [workorderToDelete, fetchWorkorders, fetchOverview])

  return (
    <div className="space-y-3">
      <WorkordersListHeader onNewWorkorder={() => router.push('/workorders/new')} />

      <WorkordersOverviewCards
        quoteStats={quoteStats}
        jobStats={jobStats}
        invoiceStats={invoiceStats}
        quoteStatusFilter={quoteStatusFilter}
        setQuoteStatusFilter={setQuoteStatusFilter}
        jobStatusFilter={jobStatusFilter}
        setJobStatusFilter={setJobStatusFilter}
        invoiceStatusFilter={invoiceStatusFilter}
        setInvoiceStatusFilter={setInvoiceStatusFilter}
      />

      <div className="bg-white rounded shadow-sm border p-3" style={{ borderColor: '#EAEBED', marginTop: '2rem' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
          <h2 className="text-base font-bold" style={{ color: '#1F271B' }}>
            All workorders ({filteredWorkorders.length} result{filteredWorkorders.length !== 1 ? 's' : ''})
          </h2>
          <WorkordersFiltersBar
            hasActiveFilters={hasActiveFilters}
            clearAllFilters={clearAllFilters}
            quoteStatusFilter={quoteStatusFilter}
            setQuoteStatusFilter={setQuoteStatusFilter}
            quoteStats={quoteStats}
            isQuoteDropdownOpen={isQuoteDropdownOpen}
            setIsQuoteDropdownOpen={setIsQuoteDropdownOpen}
            quoteDropdownRef={quoteDropdownRef}
            jobStatusFilter={jobStatusFilter}
            setJobStatusFilter={setJobStatusFilter}
            jobStats={jobStats}
            isJobDropdownOpen={isJobDropdownOpen}
            setIsJobDropdownOpen={setIsJobDropdownOpen}
            jobDropdownRef={jobDropdownRef}
            invoiceStatusFilter={invoiceStatusFilter}
            setInvoiceStatusFilter={setInvoiceStatusFilter}
            invoiceStats={invoiceStats}
            isInvoiceDropdownOpen={isInvoiceDropdownOpen}
            setIsInvoiceDropdownOpen={setIsInvoiceDropdownOpen}
            invoiceDropdownRef={invoiceDropdownRef}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={filteredWorkorders.length === 0}
            className="px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#28AFB0', color: 'white' }}
            onMouseEnter={(e) => { if (filteredWorkorders.length > 0) e.currentTarget.style.backgroundColor = '#1E8A8B' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#28AFB0' }}
          >
            <FileText size={16} className="flex-shrink-0" />
            Download PDF
          </button>
          <button
            type="button"
            onClick={handleDownloadCSV}
            disabled={filteredWorkorders.length === 0}
            className="px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#28AFB0', color: 'white' }}
            onMouseEnter={(e) => { if (filteredWorkorders.length > 0) e.currentTarget.style.backgroundColor = '#1E8A8B' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#28AFB0' }}
          >
            <FileDown size={16} className="flex-shrink-0" />
            Download CSV
          </button>
        </div>

        {error ? (
          <div className="py-6 text-center">
            <p className="text-sm mb-2" style={{ color: '#B91C1C' }}>{error}</p>
            <button type="button" onClick={() => fetchWorkorders()} className="px-3 py-1.5 rounded text-sm text-white" style={{ backgroundColor: '#28AFB0' }}>Try again</button>
          </div>
        ) : (
          <WorkordersTable
            workorders={filteredWorkorders}
            onRowClick={handleRowClick}
            loading={loading}
            onUpdateWorkorder={handleUpdateWorkorder}
            onDeleteWorkorder={(wo) => setWorkorderToDelete(wo)}
          />
        )}
      </div>

      <Dialog open={!!workorderToDelete} onOpenChange={(open) => { if (!open) setWorkorderToDelete(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete workorder</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{workorderToDelete?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setWorkorderToDelete(null)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteConfirm} disabled={deleteLoading}>
              {deleteLoading ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
