'use client'

import { FiSend } from 'react-icons/fi'

export interface QuotesSelectionBarProps {
  selectedCount: number
  onDeselectAll: () => void
  onBulkSend: () => void
}

export default function QuotesSelectionBar({ selectedCount, onDeselectAll, onBulkSend }: QuotesSelectionBarProps) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2 border-b flex-wrap"
      style={{ backgroundColor: '#F0FDFA', borderColor: '#EAEBED' }}
    >
      <span className="text-xs font-medium" style={{ color: '#28AFB0' }}>
        {selectedCount} selected
      </span>
      <button
        type="button"
        onClick={onDeselectAll}
        className="text-xs font-medium hover:underline"
        style={{ color: '#28AFB0' }}
      >
        Deselect All
      </button>
      <div className="flex items-center gap-2 ml-2">
        <button
          type="button"
          onClick={onBulkSend}
          className="p-1.5 rounded hover:bg-black/5 transition-colors"
          title="Bulk Send Quotes"
          style={{ color: '#1F271B' }}
        >
          <FiSend size={16} />
        </button>
      </div>
    </div>
  )
}
