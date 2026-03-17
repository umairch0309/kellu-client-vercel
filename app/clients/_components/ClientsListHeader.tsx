'use client'

import { FiPlus, FiUpload, FiDownload } from 'react-icons/fi'

export interface ClientsListHeaderProps {
  onNewClient: () => void
  onImport: () => void
  onExport: () => void
  moreActionsRef: React.RefObject<HTMLDivElement>
  isMoreActionsOpen: boolean
  setIsMoreActionsOpen: (v: boolean) => void
}

export default function ClientsListHeader({
  onNewClient,
  onImport,
  onExport,
  moreActionsRef,
  isMoreActionsOpen,
  setIsMoreActionsOpen,
}: ClientsListHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#1F271B' }}>Clients</h1>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onNewClient}
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
            type="button"
            onClick={() => setIsMoreActionsOpen(!isMoreActionsOpen)}
            className="px-3 py-1.5 rounded border text-xs font-medium flex items-center gap-1.5 transition-all hover:shadow-sm"
            style={{ backgroundColor: 'white', borderColor: '#EAEBED', color: '#1F271B' }}
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
              style={{ borderColor: '#EAEBED', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
            >
              <button
                type="button"
                onClick={onImport}
                className="w-full text-left px-3 py-2 text-xs hover:bg-opacity-50 transition-colors flex items-center gap-2"
                style={{ color: '#1F271B' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <FiUpload size={14} style={{ color: '#1F271B', opacity: 0.7 }} />
                <span>Import Clients</span>
              </button>
              <button
                type="button"
                onClick={onExport}
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
  )
}
