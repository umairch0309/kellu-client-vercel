'use client'

export interface NewWorkorderInstructionsSectionProps {
  instructions: string
  onFieldChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
}

export default function NewWorkorderInstructionsSection({ instructions, onFieldChange }: NewWorkorderInstructionsSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
      <h2 className="text-sm font-semibold mb-3" style={{ color: '#1F271B' }}>Instructions</h2>
      <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>Instructions</label>
      <textarea
        name="instructions"
        value={instructions}
        onChange={onFieldChange}
        placeholder="Enter job instructions..."
        rows={4}
        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all resize-none"
        style={{ borderColor: '#EAEBED', color: '#1F271B' }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#28AFB0'
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = '#EAEBED'
          e.currentTarget.style.boxShadow = 'none'
        }}
      />
    </div>
  )
}
