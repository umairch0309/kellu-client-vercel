'use client'

export interface NewWorkorderNotesSectionProps {
  notes: string
  onFieldChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
}

export default function NewWorkorderNotesSection({ notes, onFieldChange }: NewWorkorderNotesSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
      <h2 className="text-sm font-semibold mb-3" style={{ color: '#1F271B' }}>Notes <span style={{ opacity: 0.6, fontWeight: 400 }}>(Optional)</span></h2>
      <textarea
        name="notes"
        value={notes}
        onChange={onFieldChange}
        placeholder="Enter additional notes..."
        rows={3}
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

