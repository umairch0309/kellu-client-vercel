'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { mockWorkorders } from '@/data/mockData'
import WorkordersListHeader from './WorkordersListHeader'
import WorkordersOverviewCards from './WorkordersOverviewCards'
import WorkordersFiltersBar from './WorkordersFiltersBar'
import WorkordersTable from './WorkordersTable'

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

  const quoteStats = {
    'not sent': mockWorkorders.filter(w => w.quoteStatus === 'not sent').length,
    'waiting for approval': mockWorkorders.filter(w => w.quoteStatus === 'waiting for approval').length,
    'approved': mockWorkorders.filter(w => w.quoteStatus === 'approved').length,
    'rejected': mockWorkorders.filter((w: { quoteStatus?: string }) => w.quoteStatus === 'rejected').length,
    'expired': mockWorkorders.filter((w: { quoteStatus?: string }) => w.quoteStatus === 'expired').length,
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

  const handleRowClick = (workorderId: number) => {
    router.push(`/workorders/${workorderId}`)
  }

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

        <WorkordersTable workorders={filteredWorkorders} onRowClick={handleRowClick} />
      </div>
    </div>
  )
}
