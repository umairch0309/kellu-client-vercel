'use client'

export interface InternalNotesSectionProps {
  internalNote: string
  setInternalNote: (s: string) => void
}

export default function InternalNotesSection({ internalNote, setInternalNote }: InternalNotesSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
      <h2 className="text-sm font-semibold mb-1" style={{ color: '#1F271B' }}>Internal notes</h2>
      <p className="text-xs mb-3" style={{ color: '#1F271B', opacity: 0.6 }}>Internal notes will only be seen by your team</p>
      <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>Internal notes</label>
      <textarea value={internalNote} onChange={(e) => setInternalNote(e.target.value)} placeholder="Note details" rows={4} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all resize-none" style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
    </div>
  )
}
