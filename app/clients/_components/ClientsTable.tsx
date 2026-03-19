'use client'

import { FiChevronUp, FiChevronDown, FiMoreVertical, FiArchive, FiEdit2, FiTrash2 } from 'react-icons/fi'
import type { ClientListItem } from './clientsListTypes'
import type { NameSortOption, LastActivitySortOption } from './clientsListTypes'
import { getStatusBadgeStyle } from './clientsListTypes'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export interface ClientsTableProps {
  clients: ClientListItem[]
  selectedClientIds: Set<number | string>
  allFilteredSelected: boolean
  selectAllCheckboxRef: React.RefObject<HTMLInputElement>
  onToggleSelectAll: () => void
  onToggleClientSelection: (e: React.MouseEvent, clientId: number | string) => void
  getDisplayStatus: (client: ClientListItem) => string
  nameSort: NameSortOption
  setNameSort: (v: NameSortOption) => void
  sortByColumn: 'name' | 'lastActivity'
  setSortByColumn: (v: 'name' | 'lastActivity') => void
  isNameSortOpen: boolean
  setIsNameSortOpen: (v: boolean) => void
  nameSortRef: React.RefObject<HTMLDivElement>
  lastActivitySort: LastActivitySortOption
  setLastActivitySort: (v: LastActivitySortOption) => void
  isLastActivitySortOpen: boolean
  setIsLastActivitySortOpen: (v: boolean) => void
  lastActivitySortRef: React.RefObject<HTMLDivElement>
  hoveredRowId: number | string | null
  setHoveredRowId: (v: number | string | null) => void
  onRowClick: (clientId: number | string) => void
  openRowActionsId: number | string | null
  setOpenRowActionsId: (v: number | string | null) => void
  onAddWorkorder: (clientId: number | string) => void
  onUpdateClient?: (client: ClientListItem) => void
  onDeleteClient?: (client: ClientListItem) => void
}

export default function ClientsTable({
  clients,
  selectedClientIds,
  allFilteredSelected,
  selectAllCheckboxRef,
  onToggleSelectAll,
  onToggleClientSelection,
  getDisplayStatus,
  nameSort,
  setNameSort,
  sortByColumn,
  setSortByColumn,
  isNameSortOpen,
  setIsNameSortOpen,
  nameSortRef,
  lastActivitySort,
  setLastActivitySort,
  isLastActivitySortOpen,
  setIsLastActivitySortOpen,
  lastActivitySortRef,
  hoveredRowId,
  setHoveredRowId,
  onRowClick,
  openRowActionsId,
  setOpenRowActionsId,
  onAddWorkorder,
  onUpdateClient,
  onDeleteClient,
}: ClientsTableProps) {
  const clickableCellProps = (clientId: number | string) => ({
    onClick: () => onRowClick(clientId),
    onMouseEnter: () => setHoveredRowId(clientId),
    onMouseLeave: () => setHoveredRowId(null),
    className: 'px-3 py-2.5 cursor-pointer transition-all',
    style: { borderColor: '#EAEBED' as const },
  })

  return (
    <div className="hidden md:block overflow-x-auto">
      <TooltipProvider delayDuration={200}>
      <table className="w-full">
        <thead>
          <tr style={{ backgroundColor: '#F3F4F6' }}>
            <th className="px-2 py-2.5 text-left border-b w-10" style={{ borderColor: '#EAEBED' }}>
              <input
                type="checkbox"
                ref={selectAllCheckboxRef}
                checked={allFilteredSelected}
                onChange={onToggleSelectAll}
                onClick={(e) => e.stopPropagation()}
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
                  <div className="absolute mt-1 left-0 top-full bg-white rounded shadow-lg border z-20 min-w-[160px] py-1" style={{ borderColor: '#EAEBED', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <button type="button" onClick={() => { setSortByColumn('name'); setNameSort('first-az'); setIsNameSortOpen(false) }} className="w-full text-left px-3 py-2 text-xs flex items-center justify-between" style={{ color: '#1F271B', backgroundColor: nameSort === 'first-az' ? '#F3F4F6' : 'white' }}>First name (A-Z){nameSort === 'first-az' && <span className="text-green-600">✓</span>}</button>
                    <div className="mx-2 border-t" style={{ borderStyle: 'dashed', borderColor: '#EAEBED' }} />
                    <button type="button" onClick={() => { setSortByColumn('name'); setNameSort('first-za'); setIsNameSortOpen(false) }} className="w-full text-left px-3 py-2 text-xs flex items-center justify-between" style={{ color: '#1F271B', backgroundColor: nameSort === 'first-za' ? '#F3F4F6' : 'white' }}>First name (Z-A){nameSort === 'first-za' && <span className="text-green-600">✓</span>}</button>
                    <div className="mx-2 border-t" style={{ borderStyle: 'dashed', borderColor: '#EAEBED' }} />
                    <button type="button" onClick={() => { setSortByColumn('name'); setNameSort('last-az'); setIsNameSortOpen(false) }} className="w-full text-left px-3 py-2 text-xs flex items-center justify-between" style={{ color: '#1F271B', backgroundColor: nameSort === 'last-az' ? '#F3F4F6' : 'white' }}>Last name (A-Z){nameSort === 'last-az' && <span className="text-green-600">✓</span>}</button>
                    <div className="mx-2 border-t" style={{ borderStyle: 'dashed', borderColor: '#EAEBED' }} />
                    <button type="button" onClick={() => { setSortByColumn('name'); setNameSort('last-za'); setIsNameSortOpen(false) }} className="w-full text-left px-3 py-2 text-xs flex items-center justify-between" style={{ color: '#1F271B', backgroundColor: nameSort === 'last-za' ? '#F3F4F6' : 'white' }}>Last name (Z-A){nameSort === 'last-za' && <span className="text-green-600">✓</span>}</button>
                  </div>
                )}
              </div>
            </th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold border-b" style={{ color: '#1F271B', borderColor: '#EAEBED' }}>Status</th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold border-b relative" style={{ color: '#1F271B', borderColor: '#EAEBED' }}>
              <div className="flex items-center gap-1 relative" ref={lastActivitySortRef}>
                <span>Last Activity</span>
                <button type="button" onClick={(e) => { e.stopPropagation(); setIsLastActivitySortOpen(!isLastActivitySortOpen) }} className="flex items-center p-0.5 rounded hover:bg-black/5" title="Order by last activity">
                  <span className="flex flex-col -space-y-1.5" style={{ color: '#1F271B', opacity: 0.6 }}>
                    <FiChevronUp size={12} strokeWidth={2.5} />
                    <FiChevronDown size={12} strokeWidth={2.5} />
                  </span>
                </button>
                {isLastActivitySortOpen && (
                  <div className="absolute mt-1 left-0 top-full bg-white rounded shadow-lg border z-20 min-w-[140px] py-1" style={{ borderColor: '#EAEBED', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <button type="button" onClick={() => { setSortByColumn('lastActivity'); setLastActivitySort('newest'); setIsLastActivitySortOpen(false) }} className="w-full text-left px-3 py-2 text-xs flex items-center justify-between" style={{ color: '#1F271B', backgroundColor: lastActivitySort === 'newest' ? '#F3F4F6' : 'white' }}>Newest first{lastActivitySort === 'newest' && <span className="text-green-600">✓</span>}</button>
                    <div className="mx-2 border-t" style={{ borderStyle: 'dashed', borderColor: '#EAEBED' }} />
                    <button type="button" onClick={() => { setSortByColumn('lastActivity'); setLastActivitySort('oldest'); setIsLastActivitySortOpen(false) }} className="w-full text-left px-3 py-2 text-xs flex items-center justify-between" style={{ color: '#1F271B', backgroundColor: lastActivitySort === 'oldest' ? '#F3F4F6' : 'white' }}>Oldest first{lastActivitySort === 'oldest' && <span className="text-green-600">✓</span>}</button>
                  </div>
                )}
              </div>
            </th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold border-b" style={{ color: '#1F271B', borderColor: '#EAEBED' }}>Actions</th>
            <th className="px-2 py-2.5 w-10 border-b" style={{ borderColor: '#EAEBED' }} aria-label="More" />
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => {
            const isRowHovered = hoveredRowId === client.id
            return (
              <tr
                key={client.id}
                className="border-b transition-all"
                style={{ borderColor: '#EAEBED', backgroundColor: isRowHovered ? '#F9FAFB' : 'white', boxShadow: isRowHovered ? 'inset 2px 0 0 #28AFB0' : 'none' }}
              >
                <td className="px-2 py-2.5 w-10 border-b" style={{ borderColor: '#EAEBED', backgroundColor: 'white' }}>
                  <input
                    type="checkbox"
                    checked={selectedClientIds.has(client.id)}
                    onChange={() => {}}
                    onClick={(e) => { e.stopPropagation(); onToggleClientSelection(e, client.id) }}
                    className="w-3.5 h-3.5 rounded focus:ring-1 cursor-pointer"
                    style={{ borderColor: '#EAEBED' }}
                  />
                </td>
                <td {...clickableCellProps(client.id)}>
                  <p className="font-medium text-xs" style={{ color: '#1F271B' }}>{client.name}</p>
                </td>
                <td {...clickableCellProps(client.id)}>
                  {(() => {
                    const status = getDisplayStatus(client)
                    const style = getStatusBadgeStyle(status)
                    return (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium shadow-sm" style={{ backgroundColor: style.backgroundColor, color: style.color }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: style.dotColor }} />
                        {status}
                      </span>
                    )
                  })()}
                </td>
                <td {...clickableCellProps(client.id)}>
                  <span className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>{client.lastActivity}</span>
                </td>
                <td className="px-2 py-2.5 border-b align-middle" style={{ borderColor: '#EAEBED', backgroundColor: isRowHovered ? '#F9FAFB' : 'white' }} onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    {onUpdateClient && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" onClick={() => onUpdateClient(client)} className="p-1.5 rounded transition-colors hover:opacity-90" style={{ color: '#28AFB0' }} aria-label="Edit client">
                            <FiEdit2 size={16} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="z-[100]">Edit client</TooltipContent>
                      </Tooltip>
                    )}
                    {onDeleteClient && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" onClick={() => onDeleteClient(client)} className="p-1.5 rounded hover:bg-red-50 transition-colors" style={{ color: '#B91C1C' }} aria-label="Delete client">
                            <FiTrash2 size={16} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="z-[100]">Delete client</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </td>
                <td className="px-2 py-2.5 w-10 border-b align-middle" style={{ borderColor: '#EAEBED', backgroundColor: isRowHovered ? '#F9FAFB' : 'white' }} data-row-actions data-client-id={client.id}>
                  <div className="relative flex justify-center">
                    <button type="button" onClick={(e) => { e.stopPropagation(); setOpenRowActionsId(openRowActionsId === client.id ? null : client.id) }} className="p-1.5 rounded hover:bg-black/10 transition-colors" title="More actions" style={{ color: '#1F271B' }}>
                      <FiMoreVertical size={16} />
                    </button>
                    {openRowActionsId === client.id && (
                      <div className="absolute right-0 top-full mt-0.5 z-30 bg-white rounded shadow-lg border py-1 min-w-[180px]" style={{ borderColor: '#EAEBED', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} onClick={(e) => e.stopPropagation()}>
                        <button type="button" onClick={() => { setOpenRowActionsId(null); onAddWorkorder(client.id) }} className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-gray-50" style={{ color: '#1F271B' }}>Create workorder</button>
                        <button type="button" onClick={() => { setOpenRowActionsId(null); onAddWorkorder(client.id) }} className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-gray-50 border-t" style={{ color: '#1F271B', borderTopColor: '#EAEBED' }}>Create task</button>
                        <button type="button" onClick={() => { setOpenRowActionsId(null); alert('Create Quote (Static UI – not implemented)') }} className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-gray-50 border-t" style={{ color: '#1F271B', borderTopColor: '#EAEBED' }}>Create Quote</button>
                        <button type="button" onClick={() => { setOpenRowActionsId(null); alert('Create Invoice (Static UI – not implemented)') }} className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-gray-50 border-t" style={{ color: '#1F271B', borderTopColor: '#EAEBED' }}>Create Invoice</button>
                        <button type="button" onClick={() => { setOpenRowActionsId(null); alert(`Archive ${client.name} (Static UI – not implemented.)`) }} className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-gray-50 border-t" style={{ color: '#1F271B', borderTopColor: '#EAEBED' }}>
                          <FiArchive size={14} style={{ opacity: 0.8 }} />
                          Archived
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      </TooltipProvider>
    </div>
  )
}
