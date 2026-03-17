'use client'

export interface QuoteSectionProps {
  quoteClientMessage: string
  setQuoteClientMessage: (s: string) => void
  quoteTermsAndConditions: string
  setQuoteTermsAndConditions: (s: string) => void
  quoteRequired: boolean
  setQuoteRequired: (v: boolean) => void
  applyToAllFutureQuotes: boolean
  setApplyToAllFutureQuotes: (v: boolean) => void
  onSave: () => void
}

export default function QuoteSection({
  quoteClientMessage,
  setQuoteClientMessage,
  quoteTermsAndConditions,
  setQuoteTermsAndConditions,
  quoteRequired,
  setQuoteRequired,
  applyToAllFutureQuotes,
  setApplyToAllFutureQuotes,
  onSave,
}: QuoteSectionProps) {
  return (
    <div className="rounded-lg border p-4 space-y-4" style={{ borderColor: '#EAEBED', backgroundColor: '#F3F4F6' }}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold" style={{ color: '#1F271B' }}>Quote</h2>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={quoteRequired} onChange={(e) => setQuoteRequired(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: '#28AFB0' }} />
          <span className="text-sm font-medium" style={{ color: '#1F271B' }}>Quote required</span>
        </label>
      </div>
      <div className="rounded-lg border p-4 bg-white" style={{ borderColor: '#EAEBED' }}>
        <h3 className="text-sm font-semibold mb-2" style={{ color: '#1F271B' }}>Client message</h3>
        <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>Client message</label>
        <textarea value={quoteClientMessage} onChange={(e) => setQuoteClientMessage(e.target.value)} placeholder="Description" rows={4} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all resize-none" style={{ borderColor: '#EAEBED', color: '#1F271B' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#28AFB0'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)' }} onBlur={(e) => { e.currentTarget.style.borderColor = '#EAEBED'; e.currentTarget.style.boxShadow = 'none' }} />
      </div>
      <div className="rounded-lg border p-4 bg-white" style={{ borderColor: '#EAEBED' }}>
        <h3 className="text-sm font-semibold mb-2" style={{ color: '#1F271B' }}>Contract / Disclaimer</h3>
        <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>Contract / Disclaimer</label>
        <textarea value={quoteTermsAndConditions} onChange={(e) => setQuoteTermsAndConditions(e.target.value)} placeholder="Description" rows={4} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all resize-none" style={{ borderColor: '#EAEBED', color: '#1F271B' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#28AFB0'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)' }} onBlur={(e) => { e.currentTarget.style.borderColor = '#EAEBED'; e.currentTarget.style.boxShadow = 'none' }} />
        <label className="flex items-center gap-2 mt-3 cursor-pointer">
          <input type="checkbox" checked={applyToAllFutureQuotes} onChange={(e) => setApplyToAllFutureQuotes(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: '#28AFB0' }} />
          <span className="text-sm font-medium" style={{ color: '#1F271B' }}>Apply to all future quotes</span>
        </label>
        <div className="flex justify-end mt-3">
          <button type="button" onClick={onSave} className="px-4 py-2 rounded text-sm font-medium text-white transition-colors" style={{ backgroundColor: '#28AFB0' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E8A8B' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#28AFB0' }}>Save</button>
        </div>
      </div>
    </div>
  )
}
