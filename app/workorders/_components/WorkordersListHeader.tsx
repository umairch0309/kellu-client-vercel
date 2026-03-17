'use client'

import { FiPlus } from 'react-icons/fi'

export interface WorkordersListHeaderProps {
  onNewWorkorder: () => void
}

export default function WorkordersListHeader({ onNewWorkorder }: WorkordersListHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#1F271B' }}>Workorders</h1>
      <div className="flex gap-2">
        <button
          onClick={onNewWorkorder}
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
          <span>New Workorder</span>
        </button>
      </div>
    </div>
  )
}
