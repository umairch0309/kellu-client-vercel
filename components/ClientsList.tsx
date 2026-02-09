'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FiPlus, FiSearch, FiChevronRight, FiChevronUp, FiChevronDown, FiDownload, FiUpload, FiTrash2, FiFile, FiArchive } from 'react-icons/fi'
import { mockClients } from '@/data/mockData'
import AddClientModal from './AddClientModal'

type NameSortOption = 'first-az' | 'first-za' | 'last-az' | 'last-za'
type LastActivitySortOption = 'newest' | 'oldest'

export default function ClientsList() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('Active') // '' = All, or 'Active' | 'Follow Up' | 'Archive'
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState(false)
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
  const [selectedClientIds, setSelectedClientIds] = useState<Set<number>>(new Set())
  const [nameSort, setNameSort] = useState<NameSortOption>('first-az')
  const [lastActivitySort, setLastActivitySort] = useState<LastActivitySortOption>('newest')
  const [sortByColumn, setSortByColumn] = useState<'name' | 'lastActivity'>('name')
  const [isNameSortOpen, setIsNameSortOpen] = useState(false)
  const [isLastActivitySortOpen, setIsLastActivitySortOpen] = useState(false)
  const moreActionsRef = useRef<HTMLDivElement>(null)
  const statusDropdownRef = useRef<HTMLDivElement>(null)
  const nameSortRef = useRef<HTMLDivElement>(null)
  const lastActivitySortRef = useRef<HTMLDivElement>(null)
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null)

  // Open Add Client modal when navigating from /clients/new (redirected with ?new=1)
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setIsAddClientOpen(true)
      router.replace('/clients', { scroll: false })
    }
  }, [searchParams, router])

  // Calculate stats
  const totalClients = mockClients.length

  const filteredClients = mockClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone.includes(searchTerm) ||
                         (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (client.address && client.address.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = !statusFilter || client.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Sort by name
  const getFirstLast = (name: string) => {
    const parts = name.trim().split(/\s+/)
    const first = parts[0] || ''
    const last = parts.slice(1).join(' ') || ''
    return { first, last }
  }
  const getLastActivityAt = (c: (typeof mockClients)[0]) => {
    const at = (c as { lastActivityAt?: string }).lastActivityAt
    return at ? new Date(at).getTime() : 0
  }
  const sortedClients = [...filteredClients].sort((a, b) => {
    if (sortByColumn === 'lastActivity') {
      const ta = getLastActivityAt(a)
      const tb = getLastActivityAt(b)
      return lastActivitySort === 'newest' ? tb - ta : ta - tb
    }
    const { first: aFirst, last: aLast } = getFirstLast(a.name)
    const { first: bFirst, last: bLast } = getFirstLast(b.name)
    switch (nameSort) {
      case 'first-az':
        return aFirst.localeCompare(bFirst) || aLast.localeCompare(bLast)
      case 'first-za':
        return bFirst.localeCompare(aFirst) || bLast.localeCompare(aLast)
      case 'last-az':
        return aLast.localeCompare(bLast) || aFirst.localeCompare(bFirst)
      case 'last-za':
        return bLast.localeCompare(aLast) || bFirst.localeCompare(bFirst)
      default:
        return 0
    }
  })

  const allFilteredSelected = filteredClients.length > 0 && filteredClients.every(c => selectedClientIds.has(c.id))
  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedClientIds(prev => {
        const next = new Set(prev)
        filteredClients.forEach(c => next.delete(c.id))
        return next
      })
    } else {
      setSelectedClientIds(prev => {
        const next = new Set(prev)
        filteredClients.forEach(c => next.add(c.id))
        return next
      })
    }
  }
  const toggleClientSelection = (e: React.MouseEvent, clientId: number) => {
    e.stopPropagation()
    setSelectedClientIds(prev => {
      const next = new Set(prev)
      if (next.has(clientId)) next.delete(clientId)
      else next.add(clientId)
      return next
    })
  }

  const handleRowClick = (clientId: number) => {
    router.push(`/clients/${clientId}`)
  }

  const handleDeselectAll = () => setSelectedClientIds(new Set())

  const handleDeleteSelected = () => {
    if (selectedClientIds.size === 0) return
    alert(`Delete ${selectedClientIds.size} selected client(s)? (Static UI – not implemented.)`)
    setSelectedClientIds(new Set())
  }

  const handleArchiveSelected = () => {
    if (selectedClientIds.size === 0) return
    alert(`Archive ${selectedClientIds.size} selected client(s)? (Static UI – not implemented.)`)
    setSelectedClientIds(new Set())
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (moreActionsRef.current && !moreActionsRef.current.contains(target)) {
        setIsMoreActionsOpen(false)
      }
      if (nameSortRef.current && !nameSortRef.current.contains(target)) {
        setIsNameSortOpen(false)
      }
      if (lastActivitySortRef.current && !lastActivitySortRef.current.contains(target)) {
        setIsLastActivitySortOpen(false)
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(target)) {
        setIsStatusDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMoreActionsOpen, isNameSortOpen, isLastActivitySortOpen, isStatusDropdownOpen])

  useEffect(() => {
    const el = selectAllCheckboxRef.current
    if (!el) return
    const n = filteredClients.length
    const selected = selectedClientIds.size
    el.indeterminate = n > 0 && selected > 0 && selected < n
  }, [filteredClients.length, selectedClientIds.size])

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
            onClick={() => setIsAddClientOpen(true)}
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
                <button
                  onClick={() => { handleArchiveSelected(); setIsMoreActionsOpen(false) }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-opacity-50 transition-colors flex items-center gap-2 border-t"
                  style={{ color: '#1F271B', borderTopColor: '#EAEBED' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <FiArchive size={14} style={{ color: '#1F271B', opacity: 0.7 }} />
                  <span>Archive Clients</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 gap-3">
        <div 
          className="rounded shadow-sm border overflow-hidden cursor-pointer transition-all hover:shadow-md max-w-xs"
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
          <div className="relative" ref={statusDropdownRef}>
            <button
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-xs font-medium transition-all"
              style={{ backgroundColor: 'white', borderColor: '#EAEBED', color: '#1F271B' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#D1D5DB'
                e.currentTarget.style.backgroundColor = '#F9FAFB'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#EAEBED'
                e.currentTarget.style.backgroundColor = 'white'
              }}
            >
              Status | {statusFilter === '' ? 'All' : statusFilter === 'Follow Up' ? 'Follow-up' : statusFilter}
              <FiChevronDown size={12} className={`transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} style={{ color: '#1F271B', opacity: 0.6 }} />
            </button>
            {isStatusDropdownOpen && (
              <div
                className="absolute left-0 mt-1 bg-white rounded shadow-lg border z-20 min-w-[160px]"
                style={{ borderColor: '#EAEBED', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              >
                <button
                  type="button"
                  onClick={() => { setStatusFilter(''); setIsStatusDropdownOpen(false) }}
                  className="w-full text-left px-3 py-2 text-xs flex items-center justify-between"
                  style={{ color: '#1F271B', backgroundColor: statusFilter === '' ? '#F3F4F6' : 'white' }}
                >
                  All
                  {statusFilter === '' && <span className="text-green-600">✓</span>}
                </button>
                <button
                  type="button"
                  onClick={() => { setStatusFilter('Active'); setIsStatusDropdownOpen(false) }}
                  className="w-full text-left px-3 py-2 text-xs flex items-center justify-between"
                  style={{ color: '#1F271B', backgroundColor: statusFilter === 'Active' ? '#F3F4F6' : 'white' }}
                >
                  Active
                  {statusFilter === 'Active' && <span className="text-green-600">✓</span>}
                </button>
                <button
                  type="button"
                  onClick={() => { setStatusFilter('Follow Up'); setIsStatusDropdownOpen(false) }}
                  className="w-full text-left px-3 py-2 text-xs flex items-center justify-between"
                  style={{ color: '#1F271B', backgroundColor: statusFilter === 'Follow Up' ? '#F3F4F6' : 'white' }}
                >
                  Follow-up
                  {statusFilter === 'Follow Up' && <span className="text-green-600">✓</span>}
                </button>
                <button
                  type="button"
                  onClick={() => { setStatusFilter('Archive'); setIsStatusDropdownOpen(false) }}
                  className="w-full text-left px-3 py-2 text-xs flex items-center justify-between"
                  style={{ color: '#1F271B', backgroundColor: statusFilter === 'Archive' ? '#F3F4F6' : 'white' }}
                >
                  Archive
                  {statusFilter === 'Archive' && <span className="text-green-600">✓</span>}
                </button>
              </div>
            )}
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
          {/* Selection bar: show when at least one client is selected */}
          {selectedClientIds.size > 0 && (
            <div
              className="flex items-center gap-3 px-3 py-2 border-b flex-wrap"
              style={{ backgroundColor: '#F0FDFA', borderColor: '#EAEBED' }}
            >
              <span className="text-xs font-medium" style={{ color: '#28AFB0' }}>
                {selectedClientIds.size} selected
              </span>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="text-xs font-medium hover:underline"
                style={{ color: '#28AFB0' }}
              >
                Deselect All
              </button>
              <div className="flex items-center gap-2 ml-2">
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  className="p-1.5 rounded hover:bg-black/5 transition-colors"
                  title="Delete selected"
                  style={{ color: '#1F271B' }}
                >
                  <FiTrash2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleArchiveSelected}
                  className="p-1.5 rounded hover:bg-black/5 transition-colors"
                  title="Archive selected"
                  style={{ color: '#1F271B' }}
                >
                  <FiFile size={16} />
                </button>
              </div>
            </div>
          )}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#F3F4F6' }}>
                  <th className="px-2 py-2.5 text-left border-b w-10" style={{ borderColor: '#EAEBED' }}>
                    <input
                      type="checkbox"
                      ref={selectAllCheckboxRef}
                      checked={allFilteredSelected}
                      onChange={toggleSelectAll}
                      onClick={e => e.stopPropagation()}
                      className="w-3.5 h-3.5 rounded focus:ring-1"
                      style={{ borderColor: '#EAEBED' }}
                    />
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold border-b relative" style={{ color: '#1F271B', borderColor: '#EAEBED' }}>
                    <div className="flex items-center gap-1 relative" ref={nameSortRef}>
                      <span>Name</span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setIsNameSortOpen(!isNameSortOpen) }}
                        className="flex items-center p-0.5 rounded hover:bg-black/5"
                        title="Order by name"
                      >
                        <span className="flex flex-col -space-y-1.5" style={{ color: '#1F271B', opacity: 0.6 }}>
                          <FiChevronUp size={12} strokeWidth={2.5} />
                          <FiChevronDown size={12} strokeWidth={2.5} />
                        </span>
                      </button>
                      {isNameSortOpen && (
                        <div
                          className="absolute mt-1 left-0 top-full bg-white rounded shadow-lg border z-20 min-w-[160px]"
                          style={{ borderColor: '#EAEBED', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                        >
                          <button
                            type="button"
                            onClick={() => { setSortByColumn('name'); setNameSort('first-az'); setIsNameSortOpen(false) }}
                            className="w-full text-left px-3 py-2 text-xs flex items-center justify-between"
                            style={{ color: '#1F271B', backgroundColor: nameSort === 'first-az' ? '#F3F4F6' : 'white' }}
                          >
                            First name (A-Z)
                            {nameSort === 'first-az' && <span className="text-green-600">✓</span>}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setSortByColumn('name'); setNameSort('first-za'); setIsNameSortOpen(false) }}
                            className="w-full text-left px-3 py-2 text-xs flex items-center justify-between"
                            style={{ color: '#1F271B', backgroundColor: nameSort === 'first-za' ? '#F3F4F6' : 'white' }}
                          >
                            First name (Z-A)
                            {nameSort === 'first-za' && <span className="text-green-600">✓</span>}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setSortByColumn('name'); setNameSort('last-az'); setIsNameSortOpen(false) }}
                            className="w-full text-left px-3 py-2 text-xs flex items-center justify-between"
                            style={{ color: '#1F271B', backgroundColor: nameSort === 'last-az' ? '#F3F4F6' : 'white' }}
                          >
                            Last name (A-Z)
                            {nameSort === 'last-az' && <span className="text-green-600">✓</span>}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setSortByColumn('name'); setNameSort('last-za'); setIsNameSortOpen(false) }}
                            className="w-full text-left px-3 py-2 text-xs flex items-center justify-between"
                            style={{ color: '#1F271B', backgroundColor: nameSort === 'last-za' ? '#F3F4F6' : 'white' }}
                          >
                            Last name (Z-A)
                            {nameSort === 'last-za' && <span className="text-green-600">✓</span>}
                          </button>
                        </div>
                      )}
                    </div>
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold border-b" style={{ color: '#1F271B', borderColor: '#EAEBED' }}>Address</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold border-b" style={{ color: '#1F271B', borderColor: '#EAEBED' }}>Status</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold border-b relative" style={{ color: '#1F271B', borderColor: '#EAEBED' }}>
                    <div className="flex items-center gap-1 relative" ref={lastActivitySortRef}>
                      <span>Last Activity</span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setIsLastActivitySortOpen(!isLastActivitySortOpen) }}
                        className="flex items-center p-0.5 rounded hover:bg-black/5"
                        title="Order by last activity"
                      >
                        <span className="flex flex-col -space-y-1.5" style={{ color: '#1F271B', opacity: 0.6 }}>
                          <FiChevronUp size={12} strokeWidth={2.5} />
                          <FiChevronDown size={12} strokeWidth={2.5} />
                        </span>
                      </button>
                      {isLastActivitySortOpen && (
                        <div
                          className="absolute mt-1 left-0 top-full bg-white rounded shadow-lg border z-20 min-w-[140px]"
                          style={{ borderColor: '#EAEBED', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                        >
                          <button
                            type="button"
                            onClick={() => { setSortByColumn('lastActivity'); setLastActivitySort('newest'); setIsLastActivitySortOpen(false) }}
                            className="w-full text-left px-3 py-2 text-xs flex items-center justify-between"
                            style={{ color: '#1F271B', backgroundColor: lastActivitySort === 'newest' ? '#F3F4F6' : 'white' }}
                          >
                            Newest first
                            {lastActivitySort === 'newest' && <span className="text-green-600">✓</span>}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setSortByColumn('lastActivity'); setLastActivitySort('oldest'); setIsLastActivitySortOpen(false) }}
                            className="w-full text-left px-3 py-2 text-xs flex items-center justify-between"
                            style={{ color: '#1F271B', backgroundColor: lastActivitySort === 'oldest' ? '#F3F4F6' : 'white' }}
                          >
                            Oldest first
                            {lastActivitySort === 'oldest' && <span className="text-green-600">✓</span>}
                          </button>
                        </div>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedClients.map((client) => (
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
                    <td className="px-2 py-2.5 w-10">
                      <input
                        type="checkbox"
                        checked={selectedClientIds.has(client.id)}
                        onChange={() => {}}
                        onClick={(e) => { e.stopPropagation(); toggleClientSelection(e as unknown as React.MouseEvent, client.id) }}
                        className="w-3.5 h-3.5 rounded focus:ring-1 cursor-pointer"
                        style={{ borderColor: '#EAEBED' }}
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="font-medium text-xs" style={{ color: '#1F271B' }}>{client.name}</p>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y bg-white" style={{ borderColor: '#EAEBED' }}>
            {sortedClients.map((client) => (
              <div
                key={client.id}
                onClick={() => handleRowClick(client.id)}
                className="p-3 cursor-pointer transition-all border-b flex gap-2"
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
                <div className="flex-shrink-0 pt-0.5">
                  <input
                    type="checkbox"
                    checked={selectedClientIds.has(client.id)}
                    onChange={() => {}}
                    onClick={(e) => { e.stopPropagation(); toggleClientSelection(e as unknown as React.MouseEvent, client.id) }}
                    className="w-3.5 h-3.5 rounded focus:ring-1 cursor-pointer"
                    style={{ borderColor: '#EAEBED' }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs" style={{ color: '#1F271B' }}>{client.name}</p>
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
              </div>
            ))}
          </div>
        </div>
      </div>

      <AddClientModal
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
        mode="new"
      />
    </div>
  )
}
