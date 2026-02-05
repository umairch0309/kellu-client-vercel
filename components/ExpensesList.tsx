'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FiPlus, FiSearch, FiChevronDown, FiChevronRight } from 'react-icons/fi'
import { format } from 'date-fns'
import { mockExpenses, mockWorkorders, mockClients } from '@/data/mockData'

export default function ExpensesList() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [workorderFilter, setWorkorderFilter] = useState('all')
  const [clientFilter, setClientFilter] = useState('all')
  const [invoiceNumberFilter, setInvoiceNumberFilter] = useState('')
  const [startDateFilter, setStartDateFilter] = useState('')
  const [endDateFilter, setEndDateFilter] = useState('')
  const [isWorkorderDropdownOpen, setIsWorkorderDropdownOpen] = useState(false)
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false)
  const workorderDropdownRef = useRef<HTMLDivElement>(null)
  const clientDropdownRef = useRef<HTMLDivElement>(null)

  // Get unique workorders and clients from expenses
  const linkedWorkorderIds = mockExpenses
    .filter(exp => exp.linkedWorkorder !== null)
    .map(exp => exp.linkedWorkorder)
    .filter((id, index, self) => self.indexOf(id) === index) as number[]

  const linkedClients = linkedWorkorderIds
    .map(woId => mockWorkorders.find(wo => wo.id === woId)?.clientId)
    .filter((id, index, self) => id && self.indexOf(id) === index) as number[]

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (workorderDropdownRef.current && !workorderDropdownRef.current.contains(event.target as Node)) {
        setIsWorkorderDropdownOpen(false)
      }
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
        setIsClientDropdownOpen(false)
      }
    }
    if (isWorkorderDropdownOpen || isClientDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isWorkorderDropdownOpen, isClientDropdownOpen])

  const filteredExpenses = mockExpenses.filter(expense => {
    // Search filter
    const matchesSearch = !searchTerm || 
      expense.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expense.invoiceNumber && expense.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()))

    // Workorder filter
    const matchesWorkorder = workorderFilter === 'all' || 
      (workorderFilter === 'linked' && expense.linkedWorkorder !== null) ||
      (workorderFilter === 'unlinked' && expense.linkedWorkorder === null) ||
      (workorderFilter !== 'all' && workorderFilter !== 'linked' && workorderFilter !== 'unlinked' && 
       expense.linkedWorkorder === parseInt(workorderFilter))

    // Client filter
    let matchesClient = true
    if (clientFilter !== 'all') {
      const workorder = expense.linkedWorkorder ? mockWorkorders.find(wo => wo.id === expense.linkedWorkorder) : null
      matchesClient = workorder ? workorder.clientId === parseInt(clientFilter) : false
    }

    // Invoice number filter
    const matchesInvoice = !invoiceNumberFilter || 
      (expense.invoiceNumber && expense.invoiceNumber.toLowerCase().includes(invoiceNumberFilter.toLowerCase()))

    // Date range filter
    const matchesDateRange = (!startDateFilter || expense.date >= startDateFilter) &&
      (!endDateFilter || expense.date <= endDateFilter)

    return matchesSearch && matchesWorkorder && matchesClient && matchesInvoice && matchesDateRange
  })

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.total, 0)

  const handleRowClick = (expense: typeof mockExpenses[0]) => {
    if (expense.linkedWorkorder) {
      router.push(`/workorders/${expense.linkedWorkorder}`)
    }
  }

  return (
    <div className="space-y-3" style={{ backgroundColor: 'white', minHeight: '100vh', padding: '1rem 0' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#1F271B' }}>Expenses</h1>
        <button
          onClick={() => router.push('/expenses/new')}
          className="px-3 py-1.5 rounded text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md"
          style={{ backgroundColor: '#28AFB0' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1E8A8B'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#28AFB0'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <FiPlus size={14} />
          <span>New Expense</span>
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded shadow-sm border p-3" style={{ borderColor: '#EAEBED' }}>
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2" size={14} style={{ color: '#1F271B', opacity: 0.5 }} />
            <input
              type="text"
              placeholder="Search by item name, details, or invoice number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border rounded text-xs transition-all"
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

          {/* Filter Buttons Row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Workorder Filter */}
            <div className="relative" ref={workorderDropdownRef}>
              <button
                onClick={() => setIsWorkorderDropdownOpen(!isWorkorderDropdownOpen)}
                className="px-2.5 py-1.5 rounded border text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md"
                style={{ 
                  backgroundColor: workorderFilter === 'all' ? '#F3F4F6' : 'white',
                  borderColor: '#EAEBED',
                  color: '#1F271B'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#D1D5DB'
                  if (workorderFilter !== 'all') {
                    e.currentTarget.style.backgroundColor = '#F9FAFB'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#EAEBED'
                  if (workorderFilter !== 'all') {
                    e.currentTarget.style.backgroundColor = 'white'
                  }
                }}
              >
                <span className="font-semibold" style={{ color: '#1F271B' }}>Workorder</span>
                <span style={{ color: '#1F271B', opacity: 0.5 }}>|</span>
                <span style={{ color: '#1F271B', opacity: 0.8 }}>
                  {workorderFilter === 'all' ? 'All' : 
                   workorderFilter === 'linked' ? 'Linked' :
                   workorderFilter === 'unlinked' ? 'Unlinked' :
                   `WO #${workorderFilter}`}
                </span>
                <FiChevronDown size={12} className={`transition-transform ${isWorkorderDropdownOpen ? 'rotate-180' : ''}`} style={{ color: '#1F271B', opacity: 0.6 }} />
              </button>
              {isWorkorderDropdownOpen && (
                <div className="absolute left-0 mt-1 bg-white rounded shadow-lg border z-10 min-w-[200px]" style={{ borderColor: '#EAEBED' }}>
                  <button
                    onClick={() => {
                      setWorkorderFilter('all')
                      setIsWorkorderDropdownOpen(false)
                    }}
                    className="w-full text-left px-2 py-1.5 text-[10px] hover:bg-opacity-50 transition-colors"
                    style={{ color: '#1F271B', backgroundColor: workorderFilter === 'all' ? '#F3F4F6' : 'white' }}
                  >
                    All
                  </button>
                  <button
                    onClick={() => {
                      setWorkorderFilter('linked')
                      setIsWorkorderDropdownOpen(false)
                    }}
                    className="w-full text-left px-2 py-1.5 text-[10px] hover:bg-opacity-50 transition-colors border-t"
                    style={{ 
                      color: '#1F271B', 
                      backgroundColor: workorderFilter === 'linked' ? '#F3F4F6' : 'white',
                      borderTopColor: '#EAEBED'
                    }}
                  >
                    Linked to Workorder
                  </button>
                  <button
                    onClick={() => {
                      setWorkorderFilter('unlinked')
                      setIsWorkorderDropdownOpen(false)
                    }}
                    className="w-full text-left px-2 py-1.5 text-[10px] hover:bg-opacity-50 transition-colors border-t"
                    style={{ 
                      color: '#1F271B', 
                      backgroundColor: workorderFilter === 'unlinked' ? '#F3F4F6' : 'white',
                      borderTopColor: '#EAEBED'
                    }}
                  >
                    Not Linked
                  </button>
                  {linkedWorkorderIds.map((woId) => {
                    const wo = mockWorkorders.find(w => w.id === woId)
                    return wo ? (
                      <button
                        key={woId}
                        onClick={() => {
                          setWorkorderFilter(woId.toString())
                          setIsWorkorderDropdownOpen(false)
                        }}
                        className="w-full text-left px-2 py-1.5 text-[10px] hover:bg-opacity-50 transition-colors border-t"
                        style={{ 
                          color: '#1F271B', 
                          backgroundColor: workorderFilter === woId.toString() ? '#F3F4F6' : 'white',
                          borderTopColor: '#EAEBED'
                        }}
                      >
                        WO #{woId} - {wo.title}
                      </button>
                    ) : null
                  })}
                </div>
              )}
            </div>

            {/* Client Filter */}
            {linkedClients.length > 0 && (
              <div className="relative" ref={clientDropdownRef}>
                <button
                  onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                  className="px-2.5 py-1.5 rounded border text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md"
                  style={{ 
                    backgroundColor: clientFilter === 'all' ? '#F3F4F6' : 'white',
                    borderColor: '#EAEBED',
                    color: '#1F271B'
                  }}
                >
                  <span className="font-semibold" style={{ color: '#1F271B' }}>Client</span>
                  <span style={{ color: '#1F271B', opacity: 0.5 }}>|</span>
                  <span style={{ color: '#1F271B', opacity: 0.8 }}>
                    {clientFilter === 'all' ? 'All' : 
                     mockClients.find(c => c.id === parseInt(clientFilter))?.name || 'All'}
                  </span>
                  <FiChevronDown size={12} className={`transition-transform ${isClientDropdownOpen ? 'rotate-180' : ''}`} style={{ color: '#1F271B', opacity: 0.6 }} />
                </button>
                {isClientDropdownOpen && (
                  <div className="absolute left-0 mt-1 bg-white rounded shadow-lg border z-10 min-w-[200px]" style={{ borderColor: '#EAEBED' }}>
                    <button
                      onClick={() => {
                        setClientFilter('all')
                        setIsClientDropdownOpen(false)
                      }}
                      className="w-full text-left px-2 py-1.5 text-[10px] hover:bg-opacity-50 transition-colors"
                      style={{ color: '#1F271B', backgroundColor: clientFilter === 'all' ? '#F3F4F6' : 'white' }}
                    >
                      All Clients
                    </button>
                    {linkedClients.map((clientId) => {
                      const client = mockClients.find(c => c.id === clientId)
                      return client ? (
                        <button
                          key={clientId}
                          onClick={() => {
                            setClientFilter(clientId.toString())
                            setIsClientDropdownOpen(false)
                          }}
                          className="w-full text-left px-2 py-1.5 text-[10px] hover:bg-opacity-50 transition-colors border-t"
                          style={{ 
                            color: '#1F271B', 
                            backgroundColor: clientFilter === clientId.toString() ? '#F3F4F6' : 'white',
                            borderTopColor: '#EAEBED'
                          }}
                        >
                          {client.name}
                        </button>
                      ) : null
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Date Range Filters */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                placeholder="Start Date"
                className="px-2.5 py-1.5 border rounded text-xs transition-all"
                style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              />
              <span style={{ color: '#1F271B', opacity: 0.5 }}>to</span>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                placeholder="End Date"
                className="px-2.5 py-1.5 border rounded text-xs transition-all"
                style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              />
            </div>

            {/* Invoice Number Filter */}
            <input
              type="text"
              value={invoiceNumberFilter}
              onChange={(e) => setInvoiceNumberFilter(e.target.value)}
              placeholder="Invoice #"
              className="px-2.5 py-1.5 border rounded text-xs transition-all"
              style={{ borderColor: '#EAEBED', color: '#1F271B', minWidth: '120px' }}
            />
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded shadow-sm border overflow-hidden" style={{ borderColor: '#EAEBED' }}>
        <div className="p-3 border-b" style={{ borderBottomColor: '#EAEBED' }}>
          <h2 className="text-base font-bold" style={{ color: '#1F271B' }}>
            All expenses ({filteredExpenses.length} result{filteredExpenses.length !== 1 ? 's' : ''})
          </h2>
        </div>
        {filteredExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderBottomColor: '#EAEBED' }}>
                  <th className="text-left py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>DATE</th>
                  <th className="text-left py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>ITEM NAME</th>
                  <th className="text-left py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>DETAILS</th>
                  <th className="text-left py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>LINKED WORKORDER</th>
                  <th className="text-left py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>INVOICE #</th>
                  <th className="text-right py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => {
                  const workorder = expense.linkedWorkorder ? mockWorkorders.find(wo => wo.id === expense.linkedWorkorder) : null
                  const client = workorder ? mockClients.find(c => c.id === workorder.clientId) : null
                  return (
                    <tr
                      key={expense.id}
                      onClick={() => handleRowClick(expense)}
                      className={`border-b transition-colors ${expense.linkedWorkorder ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                      style={{ borderBottomColor: '#EAEBED' }}
                    >
                      <td className="py-2 px-2 text-xs" style={{ color: '#1F271B' }}>
                        {format(new Date(expense.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="py-2 px-2">
                        <p className="text-xs font-medium" style={{ color: '#1F271B' }}>{expense.itemName}</p>
                      </td>
                      <td className="py-2 px-2 text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>
                        {expense.details || '—'}
                      </td>
                      <td className="py-2 px-2">
                        {expense.linkedWorkorder ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-medium" style={{ color: '#28AFB0' }}>
                              WO #{expense.linkedWorkorder}
                            </span>
                            {client && (
                              <span className="text-[10px]" style={{ color: '#1F271B', opacity: 0.6 }}>
                                {client.name}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: '#1F271B', opacity: 0.5 }}>—</span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>
                        {expense.invoiceNumber || '—'}
                      </td>
                      <td className="py-2 px-2 text-right">
                        <span className="text-xs font-semibold" style={{ color: '#1F271B' }}>
                          Rs{expense.total.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t font-semibold" style={{ borderTopColor: '#EAEBED' }}>
                  <td colSpan={5} className="py-2 px-2 text-xs text-right" style={{ color: '#1F271B' }}>
                    Total:
                  </td>
                  <td className="py-2 px-2 text-right">
                    <span className="text-xs font-bold" style={{ color: '#1F271B' }}>
                      Rs{totalExpenses.toFixed(2)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm" style={{ color: '#1F271B', opacity: 0.6 }}>
              No expenses found. Click "New Expense" to add one.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
