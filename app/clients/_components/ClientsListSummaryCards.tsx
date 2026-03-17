'use client'

import { FiChevronRight } from 'react-icons/fi'

export interface ClientsListSummaryCardsProps {
  newClientsLast30Days: number
  totalClients: number
}

export default function ClientsListSummaryCards({ newClientsLast30Days, totalClients }: ClientsListSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
      <div
        className="rounded shadow-sm border overflow-hidden cursor-pointer transition-all hover:shadow-md max-w-xs"
        style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div className="h-0.5" style={{ backgroundColor: '#2B50AA' }} />
        <div className="p-3">
          <div className="flex justify-between items-start mb-1.5">
            <div>
              <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>New clients</p>
              <p className="text-[10px] mt-0.5" style={{ color: '#1F271B', opacity: 0.7 }}>Last 30 days</p>
            </div>
            <FiChevronRight size={12} className="transition-transform" style={{ color: '#1F271B', opacity: 0.5 }} />
          </div>
          <span className="text-xl font-bold" style={{ color: '#1F271B' }}>{newClientsLast30Days}</span>
        </div>
      </div>
      <div
        className="rounded shadow-sm border overflow-hidden cursor-pointer transition-all hover:shadow-md max-w-xs"
        style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div className="h-0.5" style={{ backgroundColor: '#2B50AA' }} />
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
  )
}
