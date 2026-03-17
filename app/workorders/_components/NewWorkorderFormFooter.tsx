'use client'

import { FiSave } from 'react-icons/fi'

export interface NewWorkorderFormFooterProps {
  isEdit: boolean
  onCancel: () => void
}

export default function NewWorkorderFormFooter({ isEdit, onCancel }: NewWorkorderFormFooterProps) {
  return (
    <div className="flex justify-end gap-3 pt-4">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 border rounded transition-all text-sm font-medium"
        style={{ borderColor: '#EAEBED', color: '#1F271B', backgroundColor: 'white' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#F3F4F6'
          e.currentTarget.style.borderColor = '#D1D5DB'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'white'
          e.currentTarget.style.borderColor = '#EAEBED'
        }}
      >
        Cancel
      </button>
      <button
        type="submit"
        className="px-4 py-2 rounded transition-all flex items-center gap-2 text-sm text-white font-medium shadow-sm hover:shadow-md"
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
        <FiSave size={16} />
        <span>{isEdit ? 'Update Workorder' : 'Save Workorder'}</span>
      </button>
    </div>
  )
}
