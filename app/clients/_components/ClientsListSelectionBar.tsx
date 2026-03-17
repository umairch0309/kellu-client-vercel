'use client'

import { FiMail, FiFlag, FiArchive, FiTrash2 } from 'react-icons/fi'

export interface ClientsListSelectionBarProps {
  selectedCount: number
  onDeselectAll: () => void
  onSendMessage: () => void
  onMarkAsFollowUp: () => void
  onArchive: () => void
  onDelete: () => void
}

export default function ClientsListSelectionBar({
  selectedCount,
  onDeselectAll,
  onSendMessage,
  onMarkAsFollowUp,
  onArchive,
  onDelete,
}: ClientsListSelectionBarProps) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2 border-b flex-wrap"
      style={{ backgroundColor: '#F0FDFA', borderColor: '#EAEBED' }}
    >
      <span className="text-xs font-medium" style={{ color: '#28AFB0' }}>
        {selectedCount} selected
      </span>
      <button type="button" onClick={onDeselectAll} className="text-xs font-medium hover:underline" style={{ color: '#28AFB0' }}>
        Deselect All
      </button>
      <div className="flex items-center gap-2 ml-2">
        <button
          type="button"
          onClick={onSendMessage}
          className="p-1.5 rounded hover:bg-black/5 transition-colors"
          title="Send message"
          style={{ color: '#1F271B' }}
        >
          <FiMail size={16} />
        </button>
        <button
          type="button"
          onClick={onMarkAsFollowUp}
          className="p-1.5 rounded hover:bg-black/5 transition-colors"
          title="Mark as Follow-up"
          style={{ color: '#1F271B' }}
        >
          <FiFlag size={16} />
        </button>
        <button
          type="button"
          onClick={onArchive}
          className="p-1.5 rounded hover:bg-black/5 transition-colors border"
          title="Archived clients"
          style={{ color: '#1F271B', borderColor: '#EAEBED', backgroundColor: 'rgba(0,0,0,0.02)' }}
        >
          <FiArchive size={16} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-1.5 rounded hover:bg-black/5 transition-colors"
          title="Delete selected"
          style={{ color: '#1F271B' }}
        >
          <FiTrash2 size={16} />
        </button>
      </div>
    </div>
  )
}
