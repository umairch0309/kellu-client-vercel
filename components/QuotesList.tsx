'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FiSearch, FiFileText, FiSend, FiChevronRight, FiChevronDown, FiEye } from 'react-icons/fi'
import { format } from 'date-fns'
import { mockWorkorders } from '@/data/mockData'

const quotes = mockWorkorders
  .filter(wo => wo.quoteStatus !== 'not sent' && wo.quoteNumber)
  .map(wo => ({
    id: wo.id,
    quoteNumber: wo.quoteNumber,
    clientName: wo.clientName,
    title: wo.title,
    total: wo.total,
    dateSent: wo.quoteDateSent,
    status: wo.quoteStatus,
    whatsappStatus: wo.quoteWhatsappStatus,
    workorderId: wo.id,
  }))

export default function QuotesList() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const statusDropdownRef = useRef<HTMLDivElement>(null)

  // Calculate stats for overview blocks
  const quoteStats = {
    'waiting for approval': quotes.filter(q => q.status === 'waiting for approval').length,
    'approved': quotes.filter(q => q.status === 'approved').length,
  }

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false)
      }
    }
    if (isStatusDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isStatusDropdownOpen])

  const handleRowClick = (workorderId: number) => {
    router.push(`/workorders/${workorderId}`)
  }

  // Light theme badges: light bg + darker text (matches /tasks style)
  const getStatusColor = (status: string) => {
    if (status === 'approved') return { bg: 'rgba(40, 175, 176, 0.2)', text: '#1E8A8B' }
    if (status === 'waiting for approval') return { bg: 'rgba(176, 132, 204, 0.2)', text: '#8B6AA3' }
    return { bg: '#F3F4F6', text: '#1F271B' }
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#1F271B' }}>Quotes</h1>
      </div>

      {/* Overview Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Waiting for Approval Block */}
        <div 
          className="rounded shadow-sm border overflow-hidden cursor-pointer transition-all hover:shadow-md"
          style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          onClick={() => {
            if (statusFilter === 'waiting for approval') {
              setStatusFilter('all')
            } else {
              setStatusFilter('waiting for approval')
            }
          }}
        >
          <div className="h-0.5" style={{ backgroundColor: '#B084CC' }}></div>
          <div className="p-3">
            <div className="flex justify-between items-start mb-1.5">
              <div>
                <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Waiting for Approval</p>
              </div>
              <FiChevronRight size={12} className="transition-transform" style={{ color: '#1F271B', opacity: 0.5 }} />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px]" style={{ color: '#1F271B', opacity: 0.7 }}>Quotes</span>
                <span className="text-xs font-semibold" style={{ color: '#1F271B' }}>{quoteStats['waiting for approval']}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Approved Block */}
        <div 
          className="rounded shadow-sm border overflow-hidden cursor-pointer transition-all hover:shadow-md"
          style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          onClick={() => {
            if (statusFilter === 'approved') {
              setStatusFilter('all')
            } else {
              setStatusFilter('approved')
            }
          }}
        >
          <div className="h-0.5" style={{ backgroundColor: '#28AFB0' }}></div>
          <div className="p-3">
            <div className="flex justify-between items-start mb-1.5">
              <div>
                <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Approved</p>
              </div>
              <FiChevronRight size={12} className="transition-transform" style={{ color: '#1F271B', opacity: 0.5 }} />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px]" style={{ color: '#1F271B', opacity: 0.7 }}>Quotes</span>
                <span className="text-xs font-semibold" style={{ color: '#1F271B' }}>{quoteStats['approved']}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Quotes Section */}
      <div className="bg-white rounded shadow-sm border p-3" style={{ borderColor: '#EAEBED', marginTop: '2rem' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
          <h2 className="text-base font-bold" style={{ color: '#1F271B' }}>All quotes ({filteredQuotes.length} result{filteredQuotes.length !== 1 ? 's' : ''})</h2>
          <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end flex-wrap">
            {/* Search Bar */}
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

            {/* Status Filter */}
            <div className="relative" ref={statusDropdownRef}>
              <button
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="px-2.5 py-1.5 rounded border text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md"
                style={{ 
                  backgroundColor: statusFilter === 'all' ? '#F3F4F6' : 'white',
                  borderColor: '#EAEBED',
                  color: '#1F271B'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#D1D5DB'
                  if (statusFilter !== 'all') {
                    e.currentTarget.style.backgroundColor = '#F9FAFB'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#EAEBED'
                  if (statusFilter !== 'all') {
                    e.currentTarget.style.backgroundColor = 'white'
                  }
                }}
              >
                <span className="font-semibold" style={{ color: '#1F271B' }}>Status</span>
                <span style={{ color: '#1F271B', opacity: 0.5 }}>|</span>
                <span style={{ color: '#1F271B', opacity: 0.8 }}>
                  {statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                </span>
                <FiChevronDown size={12} className={`transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} style={{ color: '#1F271B', opacity: 0.6 }} />
              </button>
              {isStatusDropdownOpen && (
                <div className="absolute right-0 mt-1 bg-white rounded shadow-lg border z-10 min-w-[180px]" style={{ borderColor: '#EAEBED' }}>
                  <button
                    onClick={() => {
                      setStatusFilter('all')
                      setIsStatusDropdownOpen(false)
                    }}
                    className="w-full text-left px-2 py-1.5 text-[10px] hover:bg-opacity-50 transition-colors"
                    style={{ color: '#1F271B', backgroundColor: statusFilter === 'all' ? '#F3F4F6' : 'white' }}
                    onMouseEnter={(e) => {
                      if (statusFilter !== 'all') {
                        e.currentTarget.style.backgroundColor = '#F9FAFB'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (statusFilter !== 'all') {
                        e.currentTarget.style.backgroundColor = 'white'
                      }
                    }}
                  >
                    All
                  </button>
                  {Object.keys(quoteStats).map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status)
                        setIsStatusDropdownOpen(false)
                      }}
                      className="w-full text-left px-2 py-1.5 text-[10px] hover:bg-opacity-50 transition-colors border-t"
                      style={{ 
                        color: '#1F271B', 
                        backgroundColor: statusFilter === status ? '#F3F4F6' : 'white',
                        borderTopColor: '#EAEBED'
                      }}
                      onMouseEnter={(e) => {
                        if (statusFilter !== status) {
                          e.currentTarget.style.backgroundColor = '#F9FAFB'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (statusFilter !== status) {
                          e.currentTarget.style.backgroundColor = 'white'
                        }
                      }}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {filteredQuotes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderBottomColor: '#EAEBED' }}>
                  <th className="text-left py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>QUOTE #</th>
                  <th className="text-left py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>CLIENT</th>
                  <th className="text-left py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>TITLE</th>
                  <th className="text-left py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>DATE SENT</th>
                  <th className="text-left py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>STATUS</th>
                  <th className="text-right py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>TOTAL</th>
                  <th className="text-right py-2 px-2 font-medium text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotes.map((quote) => {
                  const statusColors = getStatusColor(quote.status)
                  return (
                    <tr
                      key={quote.id}
                      onClick={() => handleRowClick(quote.workorderId)}
                      className="border-b cursor-pointer transition-colors hover:bg-gray-50"
                      style={{ borderBottomColor: '#EAEBED' }}
                    >
                      <td className="py-2 px-2">
                        <p className="text-xs font-medium" style={{ color: '#1F271B' }}>{quote.quoteNumber}</p>
                      </td>
                      <td className="py-2 px-2 text-xs" style={{ color: '#1F271B' }}>{quote.clientName}</td>
                      <td className="py-2 px-2 text-xs" style={{ color: '#1F271B' }}>{quote.title}</td>
                      <td className="py-2 px-2 text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>
                        {quote.dateSent ? format(new Date(quote.dateSent), 'MMM dd, yyyy') : '—'}
                      </td>
                      <td className="py-2 px-2">
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium" style={{ 
                          backgroundColor: statusColors.bg,
                          color: statusColors.text
                        }}>
                          {quote.status}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right">
                        <span className="text-xs font-semibold" style={{ color: '#1F271B' }}>
                          Rs{quote.total.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => router.push(`/workorders/${quote.workorderId}/send-quote`)}
                            className="p-1.5 rounded transition-all"
                            style={{ color: '#28AFB0', backgroundColor: 'transparent' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#F0FDFA'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent'
                            }}
                            title="Send Quote"
                          >
                            <FiSend size={14} />
                          </button>
                          <button
                            onClick={() => {
                              // Open PDF in new window (placeholder)
                              alert('PDF preview would open here')
                            }}
                            className="p-1.5 rounded transition-all"
                            style={{ color: '#1F271B', backgroundColor: 'transparent' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#F3F4F6'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent'
                            }}
                            title="View PDF"
                          >
                            <FiFileText size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm" style={{ color: '#1F271B', opacity: 0.6 }}>
              No quotes found.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
