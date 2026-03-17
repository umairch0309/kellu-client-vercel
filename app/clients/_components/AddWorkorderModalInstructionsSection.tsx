'use client'

import { FiPlus } from 'react-icons/fi'

export interface AddWorkorderModalInstructionsSectionProps {
  documentOnly: boolean
  showInstructions: boolean
  setShowInstructions: (v: boolean) => void
  instructions: string
  onFieldChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

export default function AddWorkorderModalInstructionsSection({
  documentOnly,
  showInstructions,
  setShowInstructions,
  instructions,
  onFieldChange,
}: AddWorkorderModalInstructionsSectionProps) {
  if (documentOnly) return null

  if (!showInstructions) {
    return (
      <button
        type="button"
        onClick={() => setShowInstructions(true)}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors"
        style={{ borderColor: '#EAEBED', color: '#28AFB0', backgroundColor: 'white' }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6'; e.currentTarget.style.borderColor = '#28AFB0' }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.borderColor = '#EAEBED' }}
      >
        <FiPlus size={14} />
        <span>Add Instructions</span>
      </button>
    )
  }

  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Instructions</label>
      <textarea
        name="instructions"
        value={instructions}
        onChange={onFieldChange}
        placeholder="Add instructions..."
        rows={2}
        className="w-full px-2 py-1.5 border border-neutral-light rounded focus:outline-none focus:ring-1 focus:ring-primary text-sm resize-none"
        style={{ borderColor: '#EAEBED' }}
      />
    </div>
  )
}
