'use client'

import { useState, useRef } from 'react'
import { FiSave, FiX } from 'react-icons/fi'
import { sectionTitleClass, labelClass, inputClass } from './settingsTypes'

const SEND_WHATSAPP_DEFAULT_KEY = 'kellu_send_whatsapp_default'

const VARIABLE_SECTIONS: { section: string; variables: { value: string; label: string }[] }[] = [
  { section: 'General', variables: [{ value: '{current_date}', label: 'Current date' }] },
  {
    section: 'Client',
    variables: [
      { value: '{client_name}', label: 'Name' },
      { value: '{company_info}', label: 'Company info: "Your Company"' },
      { value: '{company_name}', label: 'Company Name' },
      { value: '{contact_email}', label: 'Contact Email' },
      { value: '{phone_number}', label: 'Phone Number' },
      { value: '{line_items}', label: 'Line items' },
      { value: '{discount_amount}', label: 'Discount amount' },
      { value: '{total}', label: 'Total' },
      { value: '{payment_amount}', label: 'Payment amount (total amount paid)' },
      { value: '{total_after_payments}', label: 'Total after payments' },
      { value: '{balance}', label: 'Balance' },
    ],
  },
  { section: 'Quote', variables: [{ value: '{quote_number}', label: 'Quote #' }, { value: '{quote_sent_date}', label: 'Sent date' }] },
  {
    section: 'Job',
    variables: [
      { value: '{workorder_number}', label: 'Workorder #' },
      { value: '{arrival_window}', label: 'Arrival window' },
      { value: '{job_date}', label: 'Job Date' },
      { value: '{job_date_time}', label: 'Job Date and Time' },
      { value: '{job_details}', label: 'Job Details' },
      { value: '{job_address}', label: 'Job Address' },
      { value: '{job_title}', label: 'Job Title' },
    ],
  },
  { section: 'Invoice', variables: [{ value: '{invoice_number}', label: 'Invoice #' }, { value: '{invoice_sent_date}', label: 'Sent date' }, { value: '{due_date}', label: 'Due date' }] },
  { section: 'Your Branding', variables: [{ value: '{brand_company_name}', label: 'Company Name' }, { value: '{brand_contact_email}', label: 'Contact Email' }, { value: '{brand_phone_number}', label: 'Phone Number' }] },
]

type ReminderKind = 'booking' | 'quote' | 'invoice'
type CommunicationMessage = {
  id: string
  name: string
  explanation: string
  isReminder: boolean
  reminderKind?: ReminderKind
  reminderSummary?: string[]
}
const COMMUNICATION_MESSAGES: CommunicationMessage[] = [
  { id: 'booking-confirmation', name: 'Booking confirmation', explanation: 'Notifies a client that an assessment has been scheduled when sent.', isReminder: false },
  { id: 'booking-confirmation-reminders', name: 'Booking confirmation Reminders', explanation: 'Automatically notifies a client about an upcoming assessment for a request.', isReminder: true, reminderKind: 'booking', reminderSummary: ['Send a reminder 1 hour before the appointment by email', 'Send a reminder 1 day before the appointment by email at 2:30 PM'] },
  { id: 'send-quote', name: 'Send Quote Message', explanation: 'Notifies a client about a new quote when sent.', isReminder: false },
  { id: 'quote-reminders', name: 'Quote reminders', explanation: 'Reminder to follow up on a sent quote.', isReminder: true, reminderKind: 'quote', reminderSummary: ['Send 48 hours after quote sent by email', 'Send 5 days after quote sent by email'] },
  { id: 'send-invoice', name: 'Send Invoice Message', explanation: 'Notifies a client about a new invoice when sent.', isReminder: false },
  { id: 'invoice-reminders', name: 'Invoice Reminders', explanation: 'Reminder when invoice is due or overdue.', isReminder: true, reminderKind: 'invoice', reminderSummary: ['Send on day due by email', 'Send 2 days after due by email'] },
  { id: 'send-job-report', name: 'Send job Report', explanation: 'Report sent after job completion with notes and details.', isReminder: false },
  { id: 'send-job-follow-up', name: 'Send Job - follow up', explanation: 'Automatically notifies a client about an upcoming job or follow-up.', isReminder: true, reminderKind: 'booking', reminderSummary: ['Send a reminder 1 hour before the appointment by email', 'Send a reminder 1 day before the appointment by email at 2:30 PM'] },
  { id: 'payment-receipt', name: 'Payment receipt', explanation: 'Sent to the client when a payment is received.', isReminder: false },
  { id: 'send-maintenance-follow-up', name: 'Send Maintenance follow-up', explanation: 'Reminder for scheduled maintenance or follow-up with the client.', isReminder: true, reminderKind: 'booking', reminderSummary: ['Send 1 day before by email', 'Send on the day by email at 9:00 AM'] },
  { id: 'send-offer', name: 'Send Offer', explanation: 'Promotional or service offer sent to the client.', isReminder: true, reminderKind: 'booking', reminderSummary: ['Send by email when offer is created', 'Send reminder 3 days after by email'] },
]

const PREVIEW_REPLACEMENTS: Record<string, string> = {
  '{client_name}': 'Natasha',
  '{current_date}': new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  '{company_name}': 'Your Company',
  '{company_info}': 'Your Company',
  '{contact_email}': 'contact@company.com',
  '{phone_number}': '+1 234-567-8900',
  '{quote_number}': '#2345',
  '{quote_sent_date}': 'Feb 5, 2026',
  '{workorder_number}': '#WO-101',
  '{job_date}': 'Feb 15, 2026',
  '{job_title}': 'Plumbing repair',
  '{invoice_number}': '#INV-789',
  '{due_date}': 'Mar 1, 2026',
  '{brand_company_name}': 'Ernies Plumbers Homeland',
  '{brand_contact_email}': 'info@company.com',
  '{brand_phone_number}': '+1 234-567-8900',
}
function previewText(text: string): string {
  let out = text
  Object.entries(PREVIEW_REPLACEMENTS).forEach(([key, val]) => {
    out = out.split(key).join(val)
  })
  return out
}

function TemplateEditModal({ templateName, onClose }: { templateId: string; templateName: string; onClose: () => void }) {
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(false)
  const [activeTab, setActiveTab] = useState<'email' | 'whatsapp'>('email')
  const [subject, setSubject] = useState(`Following up on quote {quote_number}`)
  const [message, setMessage] = useState(`Hi {client_name},\n\nWe just wanted to send a quick note to see if you had a chance to look at the quote we sent recently? We're happy to answer any questions you might have.\n\nWe're excited to get to work, so if you'd like to proceed let us know and we can get started!\n\nThanks,`)
  const [variableDropdownOpen, setVariableDropdownOpen] = useState(false)
  const messageRef = useRef<HTMLTextAreaElement | null>(null)

  const insertVariable = (value: string) => {
    const ta = messageRef.current
    if (ta) {
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const before = message.slice(0, start)
      const after = message.slice(end)
      setMessage(before + value + after)
      setVariableDropdownOpen(false)
      setTimeout(() => ta.focus(), 0)
    }
  }

  const previewSubject = previewText(subject)
  const previewBody = previewText(message) + '\n\n' + (PREVIEW_REPLACEMENTS['{brand_company_name}'] ?? 'Company Name')
  const whatsappReadOnlyMessage = previewText(message)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" style={{ borderColor: '#EAEBED', border: '1px solid #EAEBED' }}>
        <div className="flex justify-between items-center p-4 border-b shrink-0" style={{ borderColor: '#EAEBED' }}>
          <h3 className="text-lg font-semibold" style={{ color: '#1F271B' }}>Edit template: {templateName}</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded hover:bg-gray-100" style={{ color: '#1F271B' }} aria-label="Close">
            <FiX size={20} />
          </button>
        </div>

        <div className="p-4 border-b" style={{ borderColor: '#EAEBED' }}>
          <p className="text-sm font-medium mb-2" style={{ color: '#1F271B' }}>Notification method</p>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: '#28AFB0' }} />
              <span className="text-sm" style={{ color: '#1F271B' }}>Email</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={notifyWhatsApp} onChange={(e) => setNotifyWhatsApp(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: '#28AFB0' }} />
              <span className="text-sm" style={{ color: '#1F271B' }}>WhatsApp</span>
            </label>
          </div>
        </div>

        <div className="flex border-b shrink-0" style={{ borderColor: '#EAEBED' }}>
          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className="px-4 py-3 text-sm font-medium border-b-2 transition-colors"
            style={{
              borderBottomColor: activeTab === 'email' ? '#28AFB0' : 'transparent',
              color: activeTab === 'email' ? '#28AFB0' : '#1F271B',
              opacity: activeTab === 'email' ? 1 : 0.7,
            }}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('whatsapp')}
            className="px-4 py-3 text-sm font-medium border-b-2 transition-colors"
            style={{
              borderBottomColor: activeTab === 'whatsapp' ? '#28AFB0' : 'transparent',
              color: activeTab === 'whatsapp' ? '#28AFB0' : '#1F271B',
              opacity: activeTab === 'whatsapp' ? 1 : 0.7,
            }}
          >
            WhatsApp
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {activeTab === 'email' && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className={labelClass} style={{ color: '#1F271B' }}>Email subject</label>
                  <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
                </div>
                <div>
                  <label className={labelClass} style={{ color: '#1F271B' }}>Message</label>
                  <textarea
                    ref={messageRef}
                    rows={10}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={inputClass}
                    style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                  />
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <button type="button" className="text-sm font-medium" style={{ color: '#DC2626' }}>Reset</button>
                  <div className="relative">
                    <span className="text-xs mr-2" style={{ color: '#1F271B', opacity: 0.7 }}>Insert variable:</span>
                    <button
                      type="button"
                      onClick={() => setVariableDropdownOpen((o) => !o)}
                      className="text-sm font-medium"
                      style={{ color: '#28AFB0' }}
                    >
                      Insert variable
                    </button>
                    {variableDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-10" aria-hidden onClick={() => setVariableDropdownOpen(false)} />
                        <div
                          className="absolute left-0 top-full mt-1 py-2 rounded-lg border shadow-lg bg-white z-20 max-h-64 overflow-y-auto min-w-[220px]"
                          style={{ borderColor: '#EAEBED' }}
                        >
                          <p className="px-3 pb-1 text-xs font-medium" style={{ color: '#1F271B', opacity: 0.6 }}>Example:</p>
                          {VARIABLE_SECTIONS.map(({ section, variables }) => (
                            <div key={section}>
                              <p className="px-3 py-1 text-xs font-medium sticky top-0 bg-gray-50" style={{ color: '#6B7280' }}>{section}</p>
                              {variables.map((v) => (
                                <button key={v.value} type="button" onClick={() => insertVariable(v.value)} className="w-full px-3 py-1.5 text-left text-sm font-medium hover:bg-gray-100 block" style={{ color: '#1F271B' }}>{v.label}</button>
                              ))}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="rounded-lg p-4 min-h-[200px]" style={{ backgroundColor: '#F5F0E6' }}>
                <p className="text-xs font-medium mb-2" style={{ color: '#1F271B', opacity: 0.7 }}>Preview</p>
                <div className="text-sm whitespace-pre-wrap" style={{ color: '#1F271B' }}>
                  <p className="font-medium mb-2">{previewSubject}</p>
                  <p className="whitespace-pre-wrap">{previewBody}</p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'whatsapp' && (
            <div className="p-4">
              <p className="text-sm mb-2" style={{ color: '#1F271B', opacity: 0.8 }}>This is the message sent to your customers via WhatsApp. Editing is not available yet.</p>
              <div className="rounded-lg border p-4 bg-gray-50" style={{ borderColor: '#EAEBED' }}>
                <p className="text-sm whitespace-pre-wrap" style={{ color: '#1F271B' }}>{whatsappReadOnlyMessage}</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t flex justify-end gap-2 shrink-0" style={{ borderColor: '#EAEBED' }}>
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded text-sm font-medium" style={{ borderColor: '#EAEBED', color: '#1F271B' }}>Cancel</button>
          <button type="button" className="px-4 py-2 rounded text-sm font-medium text-white" style={{ backgroundColor: '#28AFB0' }}>Save</button>
        </div>
      </div>
    </div>
  )
}

type BookingScheduleRow = { time: number; type: 'hours before' | 'days before'; timeOfDay: string; email: boolean; whatsapp: boolean }
type QuoteInvoiceScheduleRow = { timeOfReminder: string; days: number; email: boolean; whatsapp: boolean }

function ReminderEditModal({ templateName, reminderKind, onClose }: { templateId: string; templateName: string; reminderKind: ReminderKind; onClose: () => void }) {
  const isBooking = reminderKind === 'booking'
  const [bookingSchedules, setBookingSchedules] = useState<BookingScheduleRow[]>([
    { time: 1, type: 'hours before', timeOfDay: '14:30', email: true, whatsapp: false },
    { time: 1, type: 'days before', timeOfDay: '14:30', email: true, whatsapp: false },
  ])
  const [quoteInvoiceSchedules, setQuoteInvoiceSchedules] = useState<QuoteInvoiceScheduleRow[]>([
    { timeOfReminder: '08:00', days: 0, email: true, whatsapp: false },
    { timeOfReminder: 'AnyTime', days: 2, email: true, whatsapp: false },
  ])
  const [activeTab, setActiveTab] = useState<'email' | 'whatsapp'>('email')
  const [subject, setSubject] = useState(`Scheduled reminder: ${templateName}`)
  const [message, setMessage] = useState(`Hi {client_name},\n\nReminder about your upcoming appointment. We look forward to seeing you.\n\nThanks,`)
  const [variableDropdownOpen, setVariableDropdownOpen] = useState(false)
  const messageRef = useRef<HTMLTextAreaElement | null>(null)

  const addBookingSchedule = () => setBookingSchedules((s) => [...s, { time: 1, type: 'hours before', timeOfDay: '09:00', email: true, whatsapp: false }])
  const removeBookingSchedule = (i: number) => setBookingSchedules((s) => s.filter((_, idx) => idx !== i))
  const addQuoteInvoiceSchedule = () => setQuoteInvoiceSchedules((s) => [...s, { timeOfReminder: '08:00', days: 1, email: true, whatsapp: false }])
  const removeQuoteInvoiceSchedule = (i: number) => setQuoteInvoiceSchedules((s) => s.filter((_, idx) => idx !== i))

  const insertVariable = (value: string) => {
    const ta = messageRef.current
    if (ta) {
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const before = message.slice(0, start)
      const after = message.slice(end)
      setMessage(before + value + after)
      setVariableDropdownOpen(false)
      setTimeout(() => ta.focus(), 0)
    }
  }

  const previewBody = previewText(message) + '\n\n' + (PREVIEW_REPLACEMENTS['{brand_company_name}'] ?? 'Company Name')
  const whatsappReadOnlyMessage = previewText(message)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" style={{ borderColor: '#EAEBED', border: '1px solid #EAEBED' }}>
        <div className="flex justify-between items-center p-4 border-b shrink-0" style={{ borderColor: '#EAEBED' }}>
          <h3 className="text-lg font-semibold" style={{ color: '#1F271B' }}>Edit {templateName}</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded hover:bg-gray-100" style={{ color: '#1F271B' }} aria-label="Close">
            <FiX size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 min-h-0 space-y-6">
          <section>
            <h4 className={sectionTitleClass} style={{ color: '#1F271B' }}>Schedules</h4>
            {isBooking ? (
              <>
                <div className="space-y-3">
                  {bookingSchedules.map((row, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-2 py-2 border-b" style={{ borderColor: '#EAEBED' }}>
                      <span className="text-sm" style={{ color: '#1F271B' }}>Send a reminder</span>
                      <input type="number" min={1} max={99} value={row.time} onChange={(e) => setBookingSchedules((s) => s.map((r, j) => (j === i ? { ...r, time: Number(e.target.value) || 1 } : r)))} className="w-14 px-2 py-1.5 border rounded text-sm" style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
                      <select value={row.type} onChange={(e) => setBookingSchedules((s) => s.map((r, j) => (j === i ? { ...r, type: e.target.value as 'hours before' | 'days before' } : r)))} className="px-2 py-1.5 border rounded text-sm" style={{ borderColor: '#EAEBED', color: '#1F271B' }}>
                        <option value="hours before">hour(s) before</option>
                        <option value="days before">day(s) before</option>
                      </select>
                      <span className="text-sm" style={{ color: '#1F271B' }}>the appointment by</span>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={row.email} onChange={(e) => setBookingSchedules((s) => s.map((r, j) => (j === i ? { ...r, email: e.target.checked } : r)))} className="w-4 h-4 rounded" style={{ accentColor: '#28AFB0' }} />
                        <span className="text-sm">Email</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={row.whatsapp} onChange={(e) => setBookingSchedules((s) => s.map((r, j) => (j === i ? { ...r, whatsapp: e.target.checked } : r)))} className="w-4 h-4 rounded" style={{ accentColor: '#28AFB0' }} />
                        <span className="text-sm">WhatsApp</span>
                      </label>
                      {row.type === 'days before' && (
                        <>
                          <span className="text-sm" style={{ color: '#1F271B' }}>at</span>
                          <input type="time" value={row.timeOfDay} onChange={(e) => setBookingSchedules((s) => s.map((r, j) => (j === i ? { ...r, timeOfDay: e.target.value } : r)))} className="px-2 py-1.5 border rounded text-sm" style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
                        </>
                      )}
                      {bookingSchedules.length > 1 && (
                        <button type="button" onClick={() => removeBookingSchedule(i)} className="text-sm font-medium ml-2" style={{ color: '#DC2626' }}>Delete</button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addBookingSchedule} className="mt-2 text-sm font-medium" style={{ color: '#28AFB0' }}>Add</button>
                <p className="text-xs mt-2" style={{ color: '#1F271B', opacity: 0.6 }}>If current time is after the set reminder time, no reminder is sent (e.g. a 6 hours before reminder set for an appointment scheduled 4 hours before would not be sent).</p>
              </>
            ) : (
              <>
                <div className="space-y-3">
                  {quoteInvoiceSchedules.map((row, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-2 py-2 border-b" style={{ borderColor: '#EAEBED' }}>
                      <span className="text-sm" style={{ color: '#1F271B' }}>At</span>
                      <select value={row.timeOfReminder} onChange={(e) => setQuoteInvoiceSchedules((s) => s.map((r, j) => (j === i ? { ...r, timeOfReminder: e.target.value } : r)))} className="px-2 py-1.5 border rounded text-sm" style={{ borderColor: '#EAEBED', color: '#1F271B' }}>
                        <option value="08:00">8:00 AM</option>
                        <option value="09:00">9:00 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="18:00">6:00 PM</option>
                        <option value="AnyTime">AnyTime</option>
                      </select>
                      <input type="number" min={0} value={row.days} onChange={(e) => setQuoteInvoiceSchedules((s) => s.map((r, j) => (j === i ? { ...r, days: Number(e.target.value) || 0 } : r)))} className="w-14 px-2 py-1.5 border rounded text-sm" style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
                      <span className="text-sm" style={{ color: '#1F271B' }}>day(s) {reminderKind === 'quote' ? 'after quote sent' : 'after invoices are due'}</span>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={row.email} onChange={(e) => setQuoteInvoiceSchedules((s) => s.map((r, j) => (j === i ? { ...r, email: e.target.checked } : r)))} className="w-4 h-4 rounded" style={{ accentColor: '#28AFB0' }} />
                        <span className="text-sm">Email</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={row.whatsapp} onChange={(e) => setQuoteInvoiceSchedules((s) => s.map((r, j) => (j === i ? { ...r, whatsapp: e.target.checked } : r)))} className="w-4 h-4 rounded" style={{ accentColor: '#28AFB0' }} />
                        <span className="text-sm">WhatsApp</span>
                      </label>
                      {quoteInvoiceSchedules.length > 1 && (
                        <button type="button" onClick={() => removeQuoteInvoiceSchedule(i)} className="text-sm font-medium ml-2" style={{ color: '#DC2626' }}>Delete</button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addQuoteInvoiceSchedule} className="mt-2 text-sm font-medium" style={{ color: '#28AFB0' }}>Add</button>
                <p className="text-xs mt-2" style={{ color: '#1F271B', opacity: 0.6 }}>Reminders are only sent if {reminderKind === 'quote' ? 'Quote status: awaiting for approval.' : 'Invoice status: Awaiting for payment or Overdue.'}</p>
              </>
            )}
          </section>

          <section>
            <h4 className={sectionTitleClass} style={{ color: '#1F271B' }}>Templates</h4>
            <div className="flex border-b mb-4" style={{ borderColor: '#EAEBED' }}>
              <button type="button" onClick={() => setActiveTab('email')} className="px-4 py-2 text-sm font-medium border-b-2" style={{ borderBottomColor: activeTab === 'email' ? '#28AFB0' : 'transparent', color: activeTab === 'email' ? '#28AFB0' : '#1F271B' }}>Email</button>
              <button type="button" onClick={() => setActiveTab('whatsapp')} className="px-4 py-2 text-sm font-medium border-b-2" style={{ borderBottomColor: activeTab === 'whatsapp' ? '#28AFB0' : 'transparent', color: activeTab === 'whatsapp' ? '#28AFB0' : '#1F271B' }}>WhatsApp</button>
            </div>
            {activeTab === 'email' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className={labelClass} style={{ color: '#1F271B' }}>Email subject</label>
                    <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
                  </div>
                  <div>
                    <label className={labelClass} style={{ color: '#1F271B' }}>Message</label>
                    <textarea ref={messageRef} rows={6} value={message} onChange={(e) => setMessage(e.target.value)} className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <button type="button" className="text-sm font-medium" style={{ color: '#DC2626' }}>Reset</button>
                    <div className="relative">
                      <button type="button" onClick={() => setVariableDropdownOpen((o) => !o)} className="text-sm font-medium" style={{ color: '#28AFB0' }}>Insert variable</button>
                      {variableDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-10" aria-hidden onClick={() => setVariableDropdownOpen(false)} />
                          <div className="absolute left-0 top-full mt-1 py-2 rounded-lg border shadow-lg bg-white z-20 max-h-64 overflow-y-auto min-w-[220px]" style={{ borderColor: '#EAEBED' }}>
                            {VARIABLE_SECTIONS.map(({ section, variables }) => (
                              <div key={section}>
                                <p className="px-3 py-1 text-xs font-medium sticky top-0 bg-gray-50" style={{ color: '#6B7280' }}>{section}</p>
                                {variables.map((v) => (
                                  <button key={v.value} type="button" onClick={() => insertVariable(v.value)} className="w-full px-3 py-1.5 text-left text-sm font-medium hover:bg-gray-100 block" style={{ color: '#1F271B' }}>{v.label}</button>
                                ))}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="rounded-lg p-4 min-h-[120px]" style={{ backgroundColor: '#F5F0E6' }}>
                  <p className="text-xs font-medium mb-2" style={{ color: '#1F271B', opacity: 0.7 }}>Preview</p>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: '#1F271B' }}>{previewBody}</p>
                </div>
              </div>
            )}
            {activeTab === 'whatsapp' && (
              <div className="p-2">
                <p className="text-sm mb-2" style={{ color: '#1F271B', opacity: 0.8 }}>Message sent to customers via WhatsApp. Editing is not available yet.</p>
                <div className="rounded-lg border p-4 bg-gray-50" style={{ borderColor: '#EAEBED' }}>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: '#1F271B' }}>{whatsappReadOnlyMessage}</p>
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="p-4 border-t flex justify-end gap-2 shrink-0" style={{ borderColor: '#EAEBED' }}>
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded text-sm font-medium" style={{ borderColor: '#EAEBED', color: '#1F271B' }}>Cancel</button>
          <button type="button" className="px-4 py-2 rounded text-sm font-medium text-white" style={{ backgroundColor: '#28AFB0' }}>Save</button>
        </div>
      </div>
    </div>
  )
}

export default function CommunicationsSettings() {
  const [sendWhatsAppByDefault, setSendWhatsAppByDefault] = useState(() => {
    if (typeof window === 'undefined') return true
    const v = localStorage.getItem(SEND_WHATSAPP_DEFAULT_KEY)
    return v === null ? true : v === 'true'
  })
  const [reminderEnabled, setReminderEnabled] = useState<Record<string, boolean>>(() =>
    COMMUNICATION_MESSAGES.filter((m) => m.isReminder).reduce((acc, m) => ({ ...acc, [m.id]: true }), {})
  )
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null)

  const handleSave = () => {
    localStorage.setItem(SEND_WHATSAPP_DEFAULT_KEY, String(sendWhatsAppByDefault))
  }
  const toggleReminder = (id: string) => setReminderEnabled((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="space-y-6 pb-8">
      <h1 className="text-2xl font-bold" style={{ color: '#1F271B' }}>Communications Settings</h1>
      <p className="text-sm" style={{ color: '#1F271B', opacity: 0.7 }}>
        Manage message templates and reminders in one place. Edit each template and turn reminders on or off.
      </p>

      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>Email & WhatsApp</h2>
        <p className="text-sm mb-3" style={{ color: '#1F271B', opacity: 0.7 }}>
          Default options when sending quote or invoice emails.
        </p>
        <label className="flex items-center justify-between gap-4 cursor-pointer py-2 border-b" style={{ borderColor: '#EAEBED' }}>
          <span className="text-sm font-medium" style={{ color: '#1F271B' }}>Send via WhatsApp by default (quote and invoice emails)</span>
          <input
            type="checkbox"
            checked={sendWhatsAppByDefault}
            onChange={(e) => setSendWhatsAppByDefault(e.target.checked)}
            className="w-4 h-4 rounded"
            style={{ accentColor: '#28AFB0' }}
          />
        </label>
      </section>

      <section className="bg-white rounded-lg border p-5" style={{ borderColor: '#EAEBED' }}>
        <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>Messages</h2>
        <div className="divide-y -mx-1" style={{ borderColor: '#EAEBED' }}>
          {COMMUNICATION_MESSAGES.map((msg) => (
            <div
              key={msg.id}
              className="py-4 px-1 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-base font-semibold" style={{ color: '#1F271B' }}>{msg.name}</h3>
                  {msg.isReminder && (
                    <label className="flex items-center gap-2 cursor-pointer shrink-0">
                      <span className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>Reminder</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={reminderEnabled[msg.id] ?? true}
                        onClick={() => toggleReminder(msg.id)}
                        className="relative w-10 h-6 rounded-full transition-colors"
                        style={{ backgroundColor: reminderEnabled[msg.id] !== false ? '#28AFB0' : '#D1D5DB' }}
                      >
                        <span
                          className="absolute w-4 h-4 rounded-full bg-white shadow transition-transform"
                          style={{ left: reminderEnabled[msg.id] !== false ? '22px' : '4px', top: '4px' }}
                        />
                      </button>
                    </label>
                  )}
                </div>
                <p className="text-sm mt-0.5" style={{ color: '#1F271B', opacity: 0.75 }}>{msg.explanation}</p>
                {msg.isReminder && msg.reminderSummary && msg.reminderSummary.length > 0 && (
                  <ul className="mt-2 space-y-0.5 text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>
                    {msg.reminderSummary.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingTemplateId(msg.id)}
                  className="text-sm font-medium underline hover:no-underline"
                  style={{ color: '#28AFB0' }}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <button type="button" onClick={handleSave} className="px-6 py-2 rounded text-sm font-medium flex items-center gap-2 text-white" style={{ backgroundColor: '#28AFB0' }}>
          <FiSave size={18} />
          Save changes
        </button>
      </div>

      {editingTemplateId && (() => {
        const msg = COMMUNICATION_MESSAGES.find((m) => m.id === editingTemplateId)
        if (msg?.isReminder) {
          return (
            <ReminderEditModal
              templateId={editingTemplateId}
              templateName={msg.name}
              reminderKind={msg.reminderKind ?? 'booking'}
              onClose={() => setEditingTemplateId(null)}
            />
          )
        }
        return (
          <TemplateEditModal
            templateId={editingTemplateId}
            templateName={msg?.name ?? editingTemplateId}
            onClose={() => setEditingTemplateId(null)}
          />
        )
      })()}
    </div>
  )
}
