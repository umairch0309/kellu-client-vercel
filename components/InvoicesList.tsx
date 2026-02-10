'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiSearch } from 'react-icons/fi'
import { mockWorkorders } from '@/data/mockData'

export default function InvoicesList() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const invoices = mockWorkorders
    .filter(wo => wo.invoiceStatus !== 'not sent')
    .map(wo => ({
      id: wo.id,
      invoiceNumber: wo.invoiceNumber,
      clientName: wo.clientName,
      title: wo.title,
      total: wo.total,
      dateSent: wo.invoiceDateSent,
      status: wo.invoiceStatus,
      whatsappStatus: wo.invoiceWhatsappStatus,
      balance: wo.total - (wo.payments?.reduce((sum, p) => sum + p.amount, 0) ?? 0),
    }))

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (invoice.invoiceNumber && invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || invoice.status.replace(' ', '-') === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4" style={{ minHeight: '100vh', padding: '1rem 0', backgroundColor: 'white' }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#1F271B' }}>Invoices</h1>
          <p className="text-sm mt-1" style={{ color: '#1F271B', opacity: 0.7 }}>
            Job-based invoices. Line items are taken from the job. Create and send from the job page or send from here.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-neutral-light">
          <p className="text-sm text-neutral-dark/70 mb-1">Total Invoices</p>
          <p className="text-2xl font-bold text-neutral-dark">{invoices.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-neutral-light">
          <p className="text-sm text-neutral-dark/70 mb-1">Waiting Payment</p>
          <p className="text-2xl font-bold text-tertiary">
            {invoices.filter(i => i.status === 'waiting for payment').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-neutral-light">
          <p className="text-sm text-neutral-dark/70 mb-1">Paid</p>
          <p className="text-2xl font-bold text-secondary">
            {invoices.filter(i => i.status === 'paid').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-neutral-light">
          <p className="text-sm text-neutral-dark/70 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-secondary">
            ${invoices.reduce((sum, i) => sum + i.total, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-neutral-light">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-dark/50" size={18} />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="waiting-for-payment">Waiting Payment</option>
            <option value="paid">Paid</option>
            <option value="bad-debt">Bad Debt</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-light overflow-hidden">
        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-neutral-light">
          {filteredInvoices.map((invoice) => (
            <div
              key={invoice.id}
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/workorders/${invoice.id}`)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push(`/workorders/${invoice.id}`) } }}
              className="p-4 hover:bg-neutral-light/50 cursor-pointer active:bg-neutral-light/70"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-dark">{invoice.invoiceNumber}</p>
                  <p className="text-xs text-neutral-dark/70 mt-1">{invoice.title}</p>
                </div>
              </div>
              <div className="space-y-1 mt-2">
                <p className="text-xs text-neutral-dark">
                  <span className="text-neutral-dark/70">Client: </span>{invoice.clientName}
                </p>
                <p className="text-xs text-neutral-dark/70">
                  Date Sent: {invoice.dateSent}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-neutral-dark/70">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    invoice.status === 'paid' ? 'bg-secondary/20 text-secondary-dark' :
                    invoice.status === 'waiting for payment' ? 'bg-tertiary/20 text-tertiary-dark' :
                    'bg-neutral-dark/10 text-neutral-dark'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-neutral-dark/70">Total: <span className="font-semibold text-neutral-dark">${invoice.total}</span></span>
                  <span className={`text-xs font-semibold ${
                    invoice.balance === 0 ? 'text-secondary' : 'text-tertiary'
                  }`}>
                    Balance: ${invoice.balance}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-light">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Invoice #</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Client</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Title</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Date Sent</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Total</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Balance</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/workorders/${invoice.id}`)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push(`/workorders/${invoice.id}`) } }}
                  className="border-b border-neutral-light hover:bg-neutral-light/50 cursor-pointer active:bg-neutral-light/70"
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-neutral-dark">{invoice.invoiceNumber}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-dark">{invoice.clientName}</td>
                  <td className="px-4 py-3 text-sm text-neutral-dark">{invoice.title}</td>
                  <td className="px-4 py-3 text-sm text-neutral-dark/70">{invoice.dateSent}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      invoice.status === 'paid' ? 'bg-secondary/20 text-secondary' :
                      invoice.status === 'waiting for payment' ? 'bg-tertiary/20 text-tertiary' :
                      'bg-neutral-dark/20 text-neutral-dark'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-neutral-dark">${invoice.total}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-semibold ${
                      invoice.balance === 0 ? 'text-secondary' : 'text-tertiary'
                    }`}>
                      ${invoice.balance}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

