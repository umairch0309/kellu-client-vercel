'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useClientReminders } from '@/context/ClientRemindersContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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

/** Format a date for display as relative time or fallback */
function formatLastActivity(lastActivityAt?: string | null, fallback = '—'): string {
  if (!lastActivityAt) return fallback
  const date = new Date(lastActivityAt)
  if (Number.isNaN(date.getTime())) return fallback
  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  return date.toLocaleDateString()
}

/** Normalize API client to ClientListItem (supports camelCase and snake_case; id can be string) */
function normalizeClient(raw: Record<string, unknown>): ClientListItem {
  const rawId = raw.id ?? raw.client_id
  const id = typeof rawId === 'string' ? rawId : (typeof rawId === 'number' ? rawId : String(rawId))
  const name =
    typeof raw.name === 'string' ? raw.name
    : [raw.first_name, raw.last_name].some(v => typeof v === 'string')
      ? [raw.first_name, raw.last_name].filter(v => typeof v === 'string').join(' ').trim() || '—'
      : ''
  const phone = typeof raw.phone === 'string' ? raw.phone : (typeof raw.phone_number === 'string' ? raw.phone_number : '')
  const email = typeof raw.email === 'string' ? raw.email : undefined
  const address = typeof raw.address === 'string' ? raw.address : (typeof raw.address_line === 'string' ? raw.address_line : undefined)
  const status = typeof raw.status === 'string' ? raw.status : 'Active'
  const lastActivityAt = typeof raw.lastActivityAt === 'string' ? raw.lastActivityAt : (typeof raw.last_activity_at === 'string' ? raw.last_activity_at : undefined)
  const lastActivity = typeof raw.lastActivity === 'string' ? raw.lastActivity : (typeof raw.last_activity === 'string' ? raw.last_activity : formatLastActivity(lastActivityAt))
  return {
    id,
    name: name || '—',
    phone: phone || '—',
    email: email || undefined,
    address: address || undefined,
    lastActivity: lastActivity || '—',
    status,
    lastActivityAt: lastActivityAt ?? undefined,
  }
}

/** Extract client list from various API response shapes (including nested data.data) */
function extractClientsList(json: unknown): unknown[] {
  if (Array.isArray(json)) return json
  if (json && typeof json === 'object') {
    const obj = json as Record<string, unknown>
    // Nested shape: { data: { data: [...], pagination?: ... } }
    const inner = obj.data
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
      const innerObj = inner as Record<string, unknown>
      if (Array.isArray(innerObj.data)) return innerObj.data
    }
    if (Array.isArray(obj.data)) return obj.data
    if (Array.isArray(obj.clients)) return obj.clients
    if (Array.isArray(obj.results)) return obj.results
    if (Array.isArray(obj.items)) return obj.items
  }
  return []
}

export default function ClientsList() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [clients, setClients] = useState<ClientListItem[]>([])
  const [clientsLoading, setClientsLoading] = useState(true)
  const [clientsError, setClientsError] = useState<string | null>(null)
  const [newClientsLast30Days, setNewClientsLast30Days] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('Active')
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState(false)
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
  const [isSendMessageOpen, setIsSendMessageOpen] = useState(false)
  const [sendMessageClientIds, setSendMessageClientIds] = useState<(number | string)[]>([])
  const [openRowActionsId, setOpenRowActionsId] = useState<number | string | null>(null)
  const [addWorkorderClientId, setAddWorkorderClientId] = useState<number | string | null>(null)
  const [editingClient, setEditingClient] = useState<ClientListItem | null>(null)
  const [clientToDelete, setClientToDelete] = useState<ClientListItem | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [selectedClientIds, setSelectedClientIds] = useState<Set<number | string>>(new Set())
  const [nameSort, setNameSort] = useState<NameSortOption>('first-az')
  const [lastActivitySort, setLastActivitySort] = useState<LastActivitySortOption>('newest')
  const [sortByColumn, setSortByColumn] = useState<'name' | 'lastActivity'>('name')
  const [hoveredRowId, setHoveredRowId] = useState<number | string | null>(null)
  const [isNameSortOpen, setIsNameSortOpen] = useState(false)
  const [isLastActivitySortOpen, setIsLastActivitySortOpen] = useState(false)

  const moreActionsRef = useRef<HTMLDivElement>(null)
  const statusDropdownRef = useRef<HTMLDivElement>(null)
  const nameSortRef = useRef<HTMLDivElement>(null)
  const lastActivitySortRef = useRef<HTMLDivElement>(null)
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null)
  const { getReminder, isReminderDue } = useClientReminders()

  const fetchClients = useCallback(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    setClientsLoading(true)
    setClientsError(null)
    fetch(`${baseUrl}/api/clients`, { method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`)
        return res.json()
      })
      .then((json: unknown) => {
        const rawList = extractClientsList(json)
        const list = rawList
          .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
          .map((item) => normalizeClient(item))
        setClients(list)
      })
      .catch((err: unknown) => {
        setClientsError(err instanceof Error ? err.message : 'Failed to load clients')
        setClients([])
      })
      .finally(() => setClientsLoading(false))
  }, [])

  const fetchStats = useCallback(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    fetch(`${baseUrl}/api/clients/statistics`, { method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'include' })
      .then((res) => {
        if (!res.ok) return
        return res.json()
      })
      .then((json: unknown) => {
        if (json == null || typeof json !== 'object') return
        const obj = json as Record<string, unknown>
        const data = obj.data as Record<string, unknown> | undefined
        const inner = data ?? obj
        if (inner && typeof inner === 'object') {
          const n = (inner as Record<string, unknown>).newClientsLast30Days ?? (inner as Record<string, unknown>).new_clients_last_30_days
          if (typeof n === 'number' && n >= 0) setNewClientsLast30Days(n)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => { fetchClients() }, [fetchClients])
  useEffect(() => { fetchStats() }, [fetchStats])

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

  const totalClients = clients.length

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm) ||
        (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.address && client.address.toLowerCase().includes(searchTerm.toLowerCase()))
      const displayStatus = getDisplayStatus(client)
      const matchesStatus = !statusFilter || displayStatus.toLowerCase() === statusFilter.toLowerCase()
      return matchesSearch && matchesStatus
    })
  }, [clients, searchTerm, statusFilter, getReminder, isReminderDue])

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
  const toggleClientSelection = (e: React.MouseEvent, clientId: number | string) => {
    e.stopPropagation()
    setSelectedClientIds(prev => {
      const next = new Set(prev)
      if (next.has(clientId)) next.delete(clientId)
      else next.add(clientId)
      return next
    })
  }

  const handleRowClick = (clientId: number | string) => router.push(`/clients/${clientId}`)
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

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    setDeleteLoading(true)
    try {
      const res = await fetch(`${baseUrl}/api/clients/${clientToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message = (data as { message?: string }).message ?? `Request failed (${res.status})`
        alert(message)
        return
      }
      fetchClients()
      setClientToDelete(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete client')
    } finally {
      setDeleteLoading(false)
    }
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
        {clientsLoading ? (
          <div className="px-4 py-8 text-center text-sm" style={{ color: '#1F271B', opacity: 0.8 }}>
            Loading clients…
          </div>
        ) : clientsError ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm mb-3" style={{ color: '#B91C1C' }}>{clientsError}</p>
            <button
              type="button"
              onClick={() => fetchClients()}
              className="px-3 py-1.5 rounded text-sm text-white"
              style={{ backgroundColor: '#28AFB0' }}
            >
              Try again
            </button>
          </div>
        ) : (
          <>
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
              clients={sortedClients}
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
              onUpdateClient={(client) => setEditingClient(client)}
              onDeleteClient={(client) => setClientToDelete(client)}
            />
            <ClientsMobileList
              clients={sortedClients}
              selectedClientIds={selectedClientIds}
              onToggleClientSelection={toggleClientSelection}
              getDisplayStatus={getDisplayStatus}
              onRowClick={handleRowClick}
            />
          </>
        )}
      </div>

      <AddClientModal isOpen={isAddClientOpen} onClose={() => setIsAddClientOpen(false)} mode="new" onCreated={() => { fetchClients(); fetchStats() }} />
      <AddClientModal
        isOpen={!!editingClient}
        onClose={() => setEditingClient(null)}
        client={editingClient ?? undefined}
        mode="update"
        onUpdated={() => { fetchClients(); setEditingClient(null) }}
      />
      <Dialog open={!!clientToDelete} onOpenChange={(open) => { if (!open) setClientToDelete(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete client</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{clientToDelete?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setClientToDelete(null)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteConfirm} disabled={deleteLoading}>
              {deleteLoading ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
