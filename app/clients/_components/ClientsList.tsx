'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { mockClients } from '@/data/mockData'
import { useClientReminders } from '@/context/ClientRemindersContext'
import AddClientModal from './AddClientModal'
import AddWorkorderModal from './AddWorkorderModal'
import SendMessageModal from './SendMessageModal'
import type { NameSortOption, LastActivitySortOption } from './clientsListTypes'
import type { ClientListItem } from './clientsListTypes'
import ClientsListHeader from './ClientsListHeader'
import ClientsListSummaryCards from './ClientsListSummaryCards'
import ClientsListFiltersBar from './ClientsListFiltersBar'
import ClientsListSelectionBar from './ClientsListSelectionBar'
import ClientsTable from './ClientsTable'
import ClientsMobileList from './ClientsMobileList'

export default function ClientsList() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('Active')
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState(false)
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
  const [isSendMessageOpen, setIsSendMessageOpen] = useState(false)
  const [sendMessageClientIds, setSendMessageClientIds] = useState<number[]>([])
  const [openRowActionsId, setOpenRowActionsId] = useState<number | null>(null)
  const [addWorkorderClientId, setAddWorkorderClientId] = useState<number | null>(null)
  const [selectedClientIds, setSelectedClientIds] = useState<Set<number>>(new Set())
  const [nameSort, setNameSort] = useState<NameSortOption>('first-az')
  const [lastActivitySort, setLastActivitySort] = useState<LastActivitySortOption>('newest')
  const [sortByColumn, setSortByColumn] = useState<'name' | 'lastActivity'>('name')
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null)
  const [isNameSortOpen, setIsNameSortOpen] = useState(false)
  const [isLastActivitySortOpen, setIsLastActivitySortOpen] = useState(false)

  const moreActionsRef = useRef<HTMLDivElement>(null)
  const statusDropdownRef = useRef<HTMLDivElement>(null)
  const nameSortRef = useRef<HTMLDivElement>(null)
  const lastActivitySortRef = useRef<HTMLDivElement>(null)
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null)
  const { getReminder, isReminderDue } = useClientReminders()

  const getDisplayStatus = (client: ClientListItem) => {
    const r = getReminder(client.id)
    return r && isReminderDue(r) ? 'Follow Up' : client.status
  }

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setIsAddClientOpen(true)
      router.replace('/clients', { scroll: false })
    }
  }, [searchParams, router])

  const totalClients = mockClients.length
  const newClientsLast30Days = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)
    return mockClients.filter(c => {
      const created = (c as { createdAt?: string }).createdAt
      if (!created) return false
      return new Date(created) >= cutoff
    }).length
  }, [])

  const filteredClients = useMemo(() => {
    return mockClients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm) ||
        (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.address && client.address.toLowerCase().includes(searchTerm.toLowerCase()))
      const displayStatus = getDisplayStatus(client as ClientListItem)
      const matchesStatus = !statusFilter || displayStatus === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchTerm, statusFilter, getReminder, isReminderDue])

  const getFirstLast = (name: string) => {
    const parts = name.trim().split(/\s+/)
    return { first: parts[0] || '', last: parts.slice(1).join(' ') || '' }
  }
  const getLastActivityAt = (c: ClientListItem) => {
    const at = (c as { lastActivityAt?: string }).lastActivityAt
    return at ? new Date(at).getTime() : 0
  }
  const sortedClients = useMemo(() => {
    return [...filteredClients].sort((a, b) => {
      if (sortByColumn === 'lastActivity') {
        const ta = getLastActivityAt(a as ClientListItem)
        const tb = getLastActivityAt(b as ClientListItem)
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
  }, [filteredClients, sortByColumn, nameSort, lastActivitySort])

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

  const handleRowClick = (clientId: number) => router.push(`/clients/${clientId}`)
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
  const handleMarkAsFollowUp = () => {
    if (selectedClientIds.size === 0) return
    alert(`Mark ${selectedClientIds.size} selected client(s) as Follow-up. (Static UI – not implemented.)`)
    setSelectedClientIds(new Set())
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (moreActionsRef.current && !moreActionsRef.current.contains(target)) setIsMoreActionsOpen(false)
      if (nameSortRef.current && !nameSortRef.current.contains(target)) setIsNameSortOpen(false)
      if (lastActivitySortRef.current && !lastActivitySortRef.current.contains(target)) setIsLastActivitySortOpen(false)
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(target)) setIsStatusDropdownOpen(false)
      if (openRowActionsId !== null) {
        const el = (target as Element).closest?.('[data-row-actions]')
        if (!el || (el as HTMLElement).dataset?.clientId !== String(openRowActionsId)) setOpenRowActionsId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMoreActionsOpen, isNameSortOpen, isLastActivitySortOpen, isStatusDropdownOpen, openRowActionsId])

  useEffect(() => {
    const el = selectAllCheckboxRef.current
    if (!el) return
    const n = filteredClients.length
    const selected = selectedClientIds.size
    ;(el as HTMLInputElement & { indeterminate: boolean }).indeterminate = n > 0 && selected > 0 && selected < n
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
      <ClientsListHeader
        onNewClient={() => setIsAddClientOpen(true)}
        onImport={handleImportClients}
        onExport={handleExportClients}
        moreActionsRef={moreActionsRef}
        isMoreActionsOpen={isMoreActionsOpen}
        setIsMoreActionsOpen={setIsMoreActionsOpen}
      />

      <ClientsListSummaryCards newClientsLast30Days={newClientsLast30Days} totalClients={totalClients} />

      <ClientsListFiltersBar
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        isStatusDropdownOpen={isStatusDropdownOpen}
        setIsStatusDropdownOpen={setIsStatusDropdownOpen}
        statusDropdownRef={statusDropdownRef}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        resultCount={filteredClients.length}
      />

      <div className="rounded-lg shadow-md border overflow-hidden bg-white" style={{ borderColor: '#EAEBED', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
        {selectedClientIds.size > 0 && (
          <ClientsListSelectionBar
            selectedCount={selectedClientIds.size}
            onDeselectAll={handleDeselectAll}
            onSendMessage={() => { setSendMessageClientIds(Array.from(selectedClientIds)); setIsSendMessageOpen(true) }}
            onMarkAsFollowUp={handleMarkAsFollowUp}
            onArchive={handleArchiveSelected}
            onDelete={handleDeleteSelected}
          />
        )}
        <ClientsTable
          clients={sortedClients as ClientListItem[]}
          selectedClientIds={selectedClientIds}
          allFilteredSelected={allFilteredSelected}
          selectAllCheckboxRef={selectAllCheckboxRef}
          onToggleSelectAll={toggleSelectAll}
          onToggleClientSelection={toggleClientSelection}
          getDisplayStatus={getDisplayStatus}
          nameSort={nameSort}
          setNameSort={setNameSort}
          sortByColumn={sortByColumn}
          setSortByColumn={setSortByColumn}
          isNameSortOpen={isNameSortOpen}
          setIsNameSortOpen={setIsNameSortOpen}
          nameSortRef={nameSortRef}
          lastActivitySort={lastActivitySort}
          setLastActivitySort={setLastActivitySort}
          isLastActivitySortOpen={isLastActivitySortOpen}
          setIsLastActivitySortOpen={setIsLastActivitySortOpen}
          lastActivitySortRef={lastActivitySortRef}
          hoveredRowId={hoveredRowId}
          setHoveredRowId={setHoveredRowId}
          onRowClick={handleRowClick}
          openRowActionsId={openRowActionsId}
          setOpenRowActionsId={setOpenRowActionsId}
          onAddWorkorder={setAddWorkorderClientId}
        />
        <ClientsMobileList
          clients={sortedClients as ClientListItem[]}
          selectedClientIds={selectedClientIds}
          onToggleClientSelection={toggleClientSelection}
          getDisplayStatus={getDisplayStatus}
          onRowClick={handleRowClick}
        />
      </div>

      <AddClientModal isOpen={isAddClientOpen} onClose={() => setIsAddClientOpen(false)} mode="new" />
      <AddWorkorderModal
        isOpen={addWorkorderClientId !== null}
        onClose={() => setAddWorkorderClientId(null)}
        initialClientId={addWorkorderClientId ?? undefined}
      />
      <SendMessageModal
        isOpen={isSendMessageOpen && sendMessageClientIds.length > 0}
        onClose={() => { setIsSendMessageOpen(false); setSendMessageClientIds([]) }}
        clientIds={sendMessageClientIds}
        onSent={() => { setSelectedClientIds(new Set()); setSendMessageClientIds([]) }}
      />
    </div>
  )
}
