'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FiPlus, FiSearch, FiChevronRight, FiTrendingUp, FiDownload, FiUpload, FiEdit } from 'react-icons/fi'
import { mockClients } from '@/data/mockData'

export default function ClientsList() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string[]>(['Active'])
  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState(false)
  const moreActionsRef = useRef<HTMLDivElement>(null)

  // Calculate stats
  const newLeads = mockClients.filter(c => c.status === 'Follow Up').length
  const newClients = mockClients.filter(c => c.status === 'Active').length
  const totalClients = mockClients.length

  const filteredClients = mockClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone.includes(searchTerm) ||
                         (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (client.address && client.address.toLowerCase().includes(searchTerm.toLowerCase()))
    // Handle status filtering: "Follow Up" should match "Leads" filter
    const matchesStatus = selectedStatus.length === 0 || 
                         selectedStatus.includes(client.status) || 
                         (client.status === 'Follow Up' && selectedStatus.includes('Leads'))
    return matchesSearch && matchesStatus
  })

  const handleRowClick = (clientId: number) => {
    router.push(`/clients/${clientId}`)
  }

  const handleViewClick = (e: React.MouseEvent, clientId: number) => {
    e.stopPropagation() // Prevent row click navigation
    router.push(`/clients/${clientId}`)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreActionsRef.current && !moreActionsRef.current.contains(event.target as Node)) {
        setIsMoreActionsOpen(false)
      }
    }
    if (isMoreActionsOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMoreActionsOpen])

  const handleImportClients = () => {
    alert('Import Clients functionality (Static UI)')
    setIsMoreActionsOpen(false)
  }

  const handleExportClients = () => {
    alert('Export Clients functionality (Static UI)')
    setIsMoreActionsOpen(false)
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#1F271B' }}>Clients</h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/clients/new')}
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
            <span>New Client</span>
          </button>
          <div className="relative" ref={moreActionsRef}>
            <button
              onClick={() => setIsMoreActionsOpen(!isMoreActionsOpen)}
              className="px-3 py-1.5 rounded border text-xs font-medium flex items-center gap-1.5 transition-all hover:shadow-sm"
              style={{ 
                backgroundColor: 'white',
                borderColor: '#EAEBED',
                color: '#1F271B'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F9FAFB'
                e.currentTarget.style.borderColor = '#D1D5DB'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white'
                e.currentTarget.style.borderColor = '#EAEBED'
              }}
            >
              <span>... More Actions</span>
            </button>
            {isMoreActionsOpen && (
              <div 
                className="absolute right-0 mt-2 bg-white rounded shadow-lg border z-10 min-w-[180px]"
                style={{ 
                  borderColor: '#EAEBED',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              >
                <button
                  onClick={handleImportClients}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-opacity-50 transition-colors flex items-center gap-2"
                  style={{ color: '#1F271B' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <FiUpload size={14} style={{ color: '#1F271B', opacity: 0.7 }} />
                  <span>Import Clients</span>
                </button>
                <button
                  onClick={handleExportClients}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-opacity-50 transition-colors flex items-center gap-2 border-t"
                  style={{ color: '#1F271B', borderTopColor: '#EAEBED' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <FiDownload size={14} style={{ color: '#1F271B', opacity: 0.7 }} />
                  <span>Export Clients</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div 
          className="rounded shadow-sm border overflow-hidden cursor-pointer transition-all hover:shadow-md"
          style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div className="h-0.5" style={{ backgroundColor: '#B084CC' }}></div>
          <div className="p-3">
            <div className="flex justify-between items-start mb-1.5">
              <div>
                <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>New leads</p>
                <p className="text-[10px] mt-0.5" style={{ color: '#1F271B', opacity: 0.7 }}>Past 30 days</p>
              </div>
              <FiChevronRight size={12} className="transition-transform" style={{ color: '#1F271B', opacity: 0.5 }} />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold" style={{ color: '#1F271B' }}>{newLeads}</span>
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(40, 175, 176, 0.1)' }}>
                <FiTrendingUp size={10} style={{ color: '#28AFB0' }} />
                <span className="text-[10px] font-medium" style={{ color: '#28AFB0' }}>100%</span>
              </div>
            </div>
          </div>
        </div>

        <div 
          className="rounded shadow-sm border overflow-hidden cursor-pointer transition-all hover:shadow-md"
          style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div className="h-0.5" style={{ backgroundColor: '#28AFB0' }}></div>
          <div className="p-3">
            <div className="flex justify-between items-start mb-1.5">
              <div>
                <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>New clients</p>
                <p className="text-[10px] mt-0.5" style={{ color: '#1F271B', opacity: 0.7 }}>Past 30 days</p>
              </div>
              <FiChevronRight size={12} className="transition-transform" style={{ color: '#1F271B', opacity: 0.5 }} />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold" style={{ color: '#1F271B' }}>{newClients}</span>
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(40, 175, 176, 0.1)' }}>
                <FiTrendingUp size={10} style={{ color: '#28AFB0' }} />
                <span className="text-[10px] font-medium" style={{ color: '#28AFB0' }}>100%</span>
              </div>
            </div>
          </div>
        </div>

        <div 
          className="rounded shadow-sm border overflow-hidden cursor-pointer transition-all hover:shadow-md"
          style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div className="h-0.5" style={{ backgroundColor: '#2B50AA' }}></div>
          <div className="p-3">
            <div className="flex justify-between items-start mb-1.5">
              <div>
                <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Total new clients</p>
                <p className="text-[10px] mt-0.5" style={{ color: '#1F271B', opacity: 0.7 }}>Year to date</p>
              </div>
              <FiChevronRight size={12} className="transition-transform" style={{ color: '#1F271B', opacity: 0.5 }} />
            </div>
            <span className="text-xl font-bold" style={{ color: '#1F271B' }}>{totalClients}</span>
          </div>
        </div>
      </div>

      {/* Filtered Clients Section */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2.5">
          <h2 className="text-base font-bold" style={{ color: '#1F271B' }}>
            Filtered clients ({filteredClients.length} {filteredClients.length === 1 ? 'result' : 'results'})
          </h2>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-2 mb-3 items-start sm:items-center">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                const hasActive = selectedStatus.includes('Active')
                const hasFollowUp = selectedStatus.includes('Follow Up')
                if (hasActive && hasFollowUp) {
                  setSelectedStatus([])
                } else {
                  setSelectedStatus(['Active', 'Follow Up'])
                }
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                selectedStatus.length > 0
                  ? 'shadow-sm'
                  : 'bg-white border hover:shadow-sm'
              }`}
              style={selectedStatus.length > 0
                ? { backgroundColor: '#EAEBED', color: '#1F271B' }
                : { borderColor: '#EAEBED', color: '#1F271B' }
              }
              onMouseEnter={(e) => {
                if (selectedStatus.length === 0) {
                  e.currentTarget.style.borderColor = '#D1D5DB'
                  e.currentTarget.style.backgroundColor = '#F9FAFB'
                }
              }}
              onMouseLeave={(e) => {
                if (selectedStatus.length === 0) {
                  e.currentTarget.style.borderColor = '#EAEBED'
                  e.currentTarget.style.backgroundColor = 'white'
                }
              }}
            >
              Status | {selectedStatus.length > 0 
                ? selectedStatus.map(s => s === 'Follow Up' ? 'Leads' : s).join(' and ')
                : 'All'}
            </button>
          </div>
          <div className="flex-1 max-w-md relative">
            <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 transition-colors" size={14} style={{ color: '#1F271B', opacity: 0.5 }} />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border rounded focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs transition-all"
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

        {/* Clients Table */}
        <div className="rounded-lg shadow-md border overflow-hidden bg-white" style={{ borderColor: '#EAEBED', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#F3F4F6' }}>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold border-b" style={{ color: '#1F271B', borderColor: '#EAEBED' }}>
                    Name
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold border-b" style={{ color: '#1F271B', borderColor: '#EAEBED' }}>Address</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold border-b" style={{ color: '#1F271B', borderColor: '#EAEBED' }}>Status</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold border-b" style={{ color: '#1F271B', borderColor: '#EAEBED' }}>Last Activity</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold border-b" style={{ color: '#1F271B', borderColor: '#EAEBED' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client, index) => (
                  <tr
                    key={client.id}
                    onClick={() => handleRowClick(client.id)}
                    className="border-b cursor-pointer transition-all"
                    style={{ 
                      borderColor: '#EAEBED', 
                      backgroundColor: 'white',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F9FAFB'
                      e.currentTarget.style.boxShadow = 'inset 2px 0 0 #28AFB0'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <td className="px-3 py-2.5">
                      <div>
                        <p className="font-medium text-xs" style={{ color: '#1F271B' }}>{client.name}</p>
                        {client.uniqueIdentifier && (
                          <p className="text-[10px] mt-0.5 font-medium" style={{ color: '#1F271B', opacity: 0.6 }}>{client.uniqueIdentifier}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-xs" style={{ color: '#1F271B', opacity: 0.8 }}>
                      {client.address || <span style={{ opacity: 0.5 }}>No address</span>}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium shadow-sm" style={{ 
                        backgroundColor: client.status === 'Active' ? '#28AFB0' : '#EAEBED',
                        color: client.status === 'Active' ? 'white' : '#1F271B'
                      }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: client.status === 'Active' ? 'white' : '#28AFB0' }}></span>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>
                      {client.lastActivity}
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={(e) => handleViewClick(e, client.id)}
                        className="p-1.5 hover:bg-opacity-50 rounded transition-all"
                        style={{ backgroundColor: '#EAEBED' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#D1D5DB'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#EAEBED'
                        }}
                        title="View client details"
                      >
                        <FiEdit size={14} style={{ color: '#1F271B' }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y bg-white" style={{ borderColor: '#EAEBED' }}>
            {filteredClients.map((client) => (
              <div
                key={client.id}
                onClick={() => handleRowClick(client.id)}
                className="p-3 cursor-pointer transition-all border-b"
                style={{ borderColor: '#EAEBED', backgroundColor: 'white' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F9FAFB'
                  e.currentTarget.style.boxShadow = 'inset 3px 0 0 #28AFB0'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs" style={{ color: '#1F271B' }}>{client.name}</p>
                    {client.uniqueIdentifier && (
                      <p className="text-[10px] mt-0.5" style={{ color: '#1F271B', opacity: 0.7 }}>{client.uniqueIdentifier}</p>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ml-2" style={{ 
                    backgroundColor: client.status === 'Active' ? '#28AFB0' : '#EAEBED',
                    color: client.status === 'Active' ? 'white' : '#1F271B'
                  }}>
                    <span className="w-1 h-1 rounded-full" style={{ backgroundColor: client.status === 'Active' ? 'white' : '#28AFB0' }}></span>
                    {client.status}
                  </span>
                </div>
                <p className="text-[10px] mb-1.5" style={{ color: '#1F271B', opacity: 0.8 }}>
                  {client.address || 'No address'}
                </p>
                <p className="text-[10px]" style={{ color: '#1F271B', opacity: 0.7 }}>
                  Last Activity: {client.lastActivity}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
