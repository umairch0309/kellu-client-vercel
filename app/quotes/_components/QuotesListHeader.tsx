'use client'

import { FiPlus } from 'react-icons/fi'

export interface QuotesListHeaderProps {
  onAddNewQuote: () => void
}

export default function QuotesListHeader({ onAddNewQuote }: QuotesListHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#1F271B' }}>Quotes</h1>
      <button
        type="button"
        onClick={onAddNewQuote}
        className="px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1.5 transition-all shrink-0"
        style={{ backgroundColor: '#28AFB0', color: 'white' }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E8A8B' }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#28AFB0' }}
      >
        <FiPlus size={16} />
        <span>Add New Quote</span>
      </button>
    </div>
  )
}
