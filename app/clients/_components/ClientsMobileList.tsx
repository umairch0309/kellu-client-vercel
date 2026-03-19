'use client'

import type { ClientListItem } from './clientsListTypes'
import { getStatusBadgeStyle } from './clientsListTypes'

export interface ClientsMobileListProps {
  clients: ClientListItem[]
  selectedClientIds: Set<number | string>
  onToggleClientSelection: (e: React.MouseEvent, clientId: number | string) => void
  getDisplayStatus: (client: ClientListItem) => string
  onRowClick: (clientId: number | string) => void
}

export default function ClientsMobileList({
  clients,
  selectedClientIds,
  onToggleClientSelection,
  getDisplayStatus,
  onRowClick,
}: ClientsMobileListProps) {
  return (
    <div className="md:hidden divide-y bg-white" style={{ borderColor: '#EAEBED' }}>
      {clients.map((client) => (
        <div key={client.id} className="p-3 border-b flex gap-2" style={{ borderColor: '#EAEBED', backgroundColor: 'white' }}>
          <div className="flex-shrink-0 pt-0.5">
            <input
              type="checkbox"
              checked={selectedClientIds.has(client.id)}
              onChange={() => {}}
              onClick={(e) => { e.stopPropagation(); onToggleClientSelection(e, client.id) }}
              className="w-3.5 h-3.5 rounded focus:ring-1 cursor-pointer"
              style={{ borderColor: '#EAEBED' }}
            />
          </div>
          <div
            className="flex-1 min-w-0 cursor-pointer transition-all rounded"
            onClick={() => onRowClick(client.id)}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB'; e.currentTarget.style.boxShadow = 'inset 3px 0 0 #28AFB0' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <div className="flex justify-between items-start mb-1.5">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-xs" style={{ color: '#1F271B' }}>{client.name}</p>
              </div>
              {(() => {
                const status = getDisplayStatus(client)
                const style = getStatusBadgeStyle(status)
                return (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ml-2" style={{ backgroundColor: style.backgroundColor, color: style.color }}>
                    <span className="w-1 h-1 rounded-full" style={{ backgroundColor: style.dotColor }} />
                    {status}
                  </span>
                )
              })()}
            </div>
            <p className="text-[10px]" style={{ color: '#1F271B', opacity: 0.7 }}>
              Last Activity: {client.lastActivity}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
