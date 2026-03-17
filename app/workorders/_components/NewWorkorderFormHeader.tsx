'use client'

import { FiChevronLeft } from 'react-icons/fi'

export interface NewWorkorderFormHeaderProps {
  isEdit: boolean
  onCancel: () => void
}

export default function NewWorkorderFormHeader({ isEdit, onCancel }: NewWorkorderFormHeaderProps) {
  return (
    <div className="bg-white border-b" style={{ borderColor: '#EAEBED' }}>
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded transition-colors hover:bg-gray-100"
            style={{ color: '#1F271B' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F3F4F6'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <FiChevronLeft size={20} />
          </button>
          <div className="h-1 w-8 rounded-full" style={{ backgroundColor: '#28AFB0' }} />
          <h1 className="text-xl font-bold" style={{ color: '#1F271B' }}>
            {isEdit ? 'Edit Workorder' : 'New Workorder'}
          </h1>
        </div>
      </div>
    </div>
  )
}
