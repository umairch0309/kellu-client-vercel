'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { FiSave, FiUpload, FiMail, FiMessageCircle, FiSearch, FiX, FiPlus, FiZap, FiSliders, FiMoreVertical, FiUserMinus, FiUserPlus } from 'react-icons/fi'
import { mockMasterPriceList, mockTeamMembers, type MasterPriceItem, type MasterPriceItemType, type MockTeamMember } from '@/data/mockData'

type SettingsSection = 'company' | 'schedule' | 'products' | 'communications' | 'team' | 'roles'

const SIDEBAR_ITEMS: { id: SettingsSection; label: string }[] = [
  { id: 'company', label: 'Company Settings' },
  { id: 'schedule', label: 'Schedule Settings' },
  { id: 'products', label: 'Product and Services' },
  { id: 'communications', label: 'Communications Settings' },
  { id: 'team', label: 'Team Management' },
  { id: 'roles', label: 'Roles & Permissions' },
]

export type RoleDef = { id: string; name: string; description: string; permissions: string[]; isSystem: boolean }

// Matches the shape of each item in /api/roles/permissions/matrix data[]
type PermissionResource = {
  resource: string
  actions: string[]
}

const inputClass = 'w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2'
const labelClass = 'block text-sm font-medium mb-1'
const sectionTitleClass = 'text-base font-semibold mb-3'

const VALID_SECTIONS: SettingsSection[] = ['company', 'schedule', 'products', 'communications', 'team', 'roles']

const LOCALE_STORAGE_KEY = 'appLocale'
export type AppLocale = 'en' | 'es'

export function getStoredLocale(): AppLocale {
  if (typeof window === 'undefined') return 'en'
  const v = localStorage.getItem(LOCALE_STORAGE_KEY)
  return v === 'es' ? 'es' : 'en'
}

export default function SettingsView() {
  const searchParams = useSearchParams()
  const sectionFromUrl = searchParams.get('section') as SettingsSection | null
  const [activeSection, setActiveSection] = useState<SettingsSection>('company')

  useEffect(() => {
    if (sectionFromUrl && VALID_SECTIONS.includes(sectionFromUrl)) {
      setActiveSection(sectionFromUrl)
    }
  }, [sectionFromUrl])

  return (
    <div className="flex gap-6 min-h-[calc(100vh-8rem)]">
      {/* Left sidebar */}
      <aside className="w-56 shrink-0 border-r bg-white overflow-hidden" style={{ borderColor: '#EAEBED' }}>
        <div className="p-4 border-b" style={{ borderColor: '#EAEBED' }}>
          <h2 className="text-xl font-bold" style={{ color: '#1F271B' }}>Settings</h2>
        </div>
        <nav className="p-3">
          <div className="space-y-0.5">
            {SIDEBAR_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className="w-full px-3 py-2 rounded text-left text-sm font-medium transition-colors hover:bg-black/5"
                style={{
                  backgroundColor: activeSection === item.id ? 'rgba(40, 175, 176, 0.12)' : 'transparent',
                  color: activeSection === item.id ? '#28AFB0' : '#1F271B',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {activeSection === 'company' && <CompanySettings />}
        {activeSection === 'schedule' && <ScheduleSettings />}
        {activeSection === 'products' && <ServicesSettings />}
        {activeSection === 'communications' && <CommunicationsSettings />}
        {activeSection === 'team' && <TeamSettings roleOptions={['Admin / Owner (Service company)', 'Technician']} />}
        {activeSection === 'roles' && <RolesPermissionsSettings />}
      </main>
    </div>
  )
}

function LanguageSettings() {
  const [locale, setLocale] = useState<AppLocale>(() => getStoredLocale())
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
    setSaved(true)
    window.dispatchEvent(new CustomEvent('appLocaleChange', { detail: locale }))
    if (typeof document !== 'undefined') document.documentElement.lang = locale === 'es' ? 'es' : 'en'
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 pb-8">
      <h1 className="text-2xl font-bold" style={{ color: '#1F271B' }}>Language</h1>
      <p className="text-sm" style={{ color: '#1F271B', opacity: 0.7 }}>
        Choose the language for the application. You can change it at any time.
      </p>
      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>Display language</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border" style={{ borderColor: locale === 'en' ? '#28AFB0' : '#EAEBED', backgroundColor: locale === 'en' ? 'rgba(40, 175, 176, 0.08)' : 'transparent' }}>
            <input type="radio" name="locale" value="en" checked={locale === 'en'} onChange={() => setLocale('en')} className="w-4 h-4" style={{ accentColor: '#28AFB0' }} />
            <span className="font-medium" style={{ color: '#1F271B' }}>English</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border" style={{ borderColor: locale === 'es' ? '#28AFB0' : '#EAEBED', backgroundColor: locale === 'es' ? 'rgba(40, 175, 176, 0.08)' : 'transparent' }}>
            <input type="radio" name="locale" value="es" checked={locale === 'es'} onChange={() => setLocale('es')} className="w-4 h-4" style={{ accentColor: '#28AFB0' }} />
            <span className="font-medium" style={{ color: '#1F271B' }}>Spanish</span>
          </label>
        </div>
      </section>
      <div className="flex items-center gap-3">
        <button type="button" onClick={handleSave} className="px-6 py-2 rounded text-sm font-medium flex items-center gap-2 text-white" style={{ backgroundColor: '#28AFB0' }}>
          <FiSave size={18} />
          Save changes
        </button>
        {saved && <span className="text-sm" style={{ color: '#28AFB0' }}>Language updated.</span>}
      </div>
    </div>
  )
}

const CALENDAR_COLOR_PALETTE = [
  '#DC2626', '#EA580C', '#F97316', '#78716C', '#D6D3D1',
  '#FACC15', '#2563EB', '#3B82F6', '#60A5FA', '#22D3EE',
  '#15803D', '#22C55E', '#4ADE80', '#7C3AED', '#C026D3',
  '#EC4899', '#1F271B', '#6B7280', '#9CA3AF',
]

type CalendarColorAssignment = { id: string; color: string; assignedTo: string }

const DEFAULT_CALENDAR_ASSIGNMENTS: CalendarColorAssignment[] = [
  { id: '1', color: '#3B82F6', assignedTo: 'Tom Wilson' },
]

function ScheduleSettings() {
  const [assignments, setAssignments] = useState<CalendarColorAssignment[]>(() => [...DEFAULT_CALENDAR_ASSIGNMENTS])
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [assignColor, setAssignColor] = useState(CALENDAR_COLOR_PALETTE[2])
  const [assignPerson, setAssignPerson] = useState('')

  const teamMemberOptions = mockTeamMembers.filter((m) => m.active).map((m) => ({ value: m.name, label: m.name }))

  const handleSaveAssignment = () => {
    if (!assignPerson.trim()) return
    setAssignments((prev) => {
      const existing = prev.find((a) => a.assignedTo === assignPerson.trim())
      const next = existing
        ? prev.map((a) => (a.assignedTo === assignPerson.trim() ? { ...a, color: assignColor } : a))
        : [...prev, { id: String(Date.now()), color: assignColor, assignedTo: assignPerson.trim() }]
      return next
    })
    setAssignModalOpen(false)
    setAssignPerson('')
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold" style={{ color: '#1F271B' }}>Calendar colors</h1>
        <button
          type="button"
          onClick={() => setAssignModalOpen(true)}
          className="px-4 py-2 rounded text-sm font-medium flex items-center gap-2 text-white shrink-0"
          style={{ backgroundColor: '#28AFB0' }}
        >
          Assign a Color
        </button>
      </div>
      <p className="text-sm" style={{ color: '#1F271B', opacity: 0.7 }}>
        Assign colors to team members. Calendar blocks will use the color of the assigned person. If multiple colors apply to an item, the last applicable color will be used.
      </p>

      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <div className="space-y-3">
          {assignments.length === 0 ? (
            <p className="text-sm py-4" style={{ color: '#1F271B', opacity: 0.6 }}>No color assignments yet. Click &quot;Assign a Color&quot; to add one.</p>
          ) : (
            assignments.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 py-2 px-3 rounded-lg border"
                style={{ borderColor: '#EAEBED', backgroundColor: '#FAFAFA' }}
              >
                <FiSliders size={16} style={{ color: '#1F271B', opacity: 0.6 }} className="shrink-0" />
                <div
                  className="w-5 h-5 rounded shrink-0 border"
                  style={{ backgroundColor: a.color, borderColor: '#EAEBED' }}
                />
                <span className="text-sm font-medium" style={{ color: '#28AFB0' }}>
                  Assigned to {a.assignedTo}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" style={{ borderColor: '#EAEBED', border: '1px solid #EAEBED' }}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold" style={{ color: '#1F271B' }}>Assign a color</h3>
              <button
                type="button"
                onClick={() => { setAssignModalOpen(false); setAssignPerson('') }}
                className="p-1.5 rounded hover:bg-gray-100"
                style={{ color: '#1F271B' }}
                aria-label="Close"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="mb-5">
              <label className={labelClass} style={{ color: '#1F271B' }}>Choose a color</label>
              <div className="flex flex-wrap gap-1.5">
                {CALENDAR_COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAssignColor(c)}
                    className="w-8 h-8 rounded border-2 shrink-0 flex items-center justify-center transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c,
                      borderColor: assignColor === c ? '#1F271B' : '#EAEBED',
                      boxShadow: assignColor === c ? 'inset 0 0 0 1px rgba(0,0,0,0.2)' : 'none',
                    }}
                    aria-label={`Color ${c}`}
                  >
                    {assignColor === c && <FiX size={14} className="text-white drop-shadow" strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className={labelClass} style={{ color: '#1F271B' }}>Apply color</label>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                <div className="flex-1">
                  <span className="text-xs block mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>when assigned to</span>
                  <select
                    value={assignPerson}
                    onChange={(e) => setAssignPerson(e.target.value)}
                    className={inputClass}
                    style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                  >
                    <option value="">Select team member</option>
                    {teamMemberOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 sm:min-w-[140px]">
                  <span className="text-xs block mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>team member</span>
                  <select
                    value={assignPerson}
                    onChange={(e) => setAssignPerson(e.target.value)}
                    className={inputClass}
                    style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                  >
                    <option value="">—</option>
                    {teamMemberOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-lg p-3 mb-5" style={{ backgroundColor: '#F3F4F6', color: '#1F271B' }}>
              <p className="text-xs" style={{ opacity: 0.85 }}>
                If multiple colors apply to an item, the last applicable color will be used.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setAssignModalOpen(false); setAssignPerson('') }}
                className="px-4 py-2 border rounded text-sm font-medium"
                style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAssignment}
                className="px-4 py-2 rounded text-sm font-medium text-white"
                style={{ backgroundColor: '#28AFB0' }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

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

function CommunicationsSettings() {
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

function TemplateEditModal({ templateId, templateName, onClose }: { templateId: string; templateName: string; onClose: () => void }) {
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

function ReminderEditModal({ templateId, templateName, reminderKind, onClose }: { templateId: string; templateName: string; reminderKind: ReminderKind; onClose: () => void }) {
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

const MOCK_BANKS = ['Banco de Chile', 'Banco Estado', 'Scotiabank', 'BCI', 'Santander', 'Itaú', 'Other']

function CompanySettings() {
  return (
    <div className="space-y-6 pb-8">
      <h1 className="text-2xl font-bold" style={{ color: '#1F271B' }}>Company settings</h1>

      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>Reply list</h2>
        <p className="text-sm mb-4" style={{ color: '#1F271B', opacity: 0.7 }}>Email addresses that receive replies from client email communication.</p>
        <div>
          <label className={labelClass} style={{ color: '#1F271B' }}>Reply-to emails</label>
          <input type="text" placeholder="e.g. replies@company.com" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
        </div>
      </section>

      <p className="text-xs italic" style={{ color: '#1F271B', opacity: 0.6 }}>
        See company and Business profile settings in Jobber for reference.
      </p>

      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>Due dates</h2>
        <p className="text-sm mb-4" style={{ color: '#1F271B', opacity: 0.7 }}>Default due dates for quote and invoice.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Quote due (days)</label>
            <input type="number" defaultValue={7} min={1} className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Invoice due (days)</label>
            <input type="number" defaultValue={3} min={1} className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
            <p className="text-xs mt-1" style={{ color: '#1F271B', opacity: 0.6 }}>e.g. 3 days to calculate expiration date</p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>Personal profile</h2>
        <p className="text-sm mb-4" style={{ color: '#1F271B', opacity: 0.7 }}>Update your personal profile details.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Full name</label>
            <input type="text" placeholder="Your name" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Email</label>
            <input type="email" placeholder="you@company.com" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>Company details</h2>
        <p className="text-sm mb-4" style={{ color: '#1F271B', opacity: 0.7 }}>Update company information used on quotes, invoices, and communications.</p>
        <div className="space-y-4">
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Company name</label>
            <input type="text" defaultValue="Water Test" placeholder="Company name" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Phone number</label>
            <input type="tel" placeholder="+56 9 1234 5678" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Website URL</label>
            <div className="flex gap-2 items-center flex-wrap">
              <input type="url" placeholder="https://" className={`${inputClass} flex-1 min-w-0`} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
              <a href="#" className="text-sm font-medium flex items-center gap-1.5 shrink-0" style={{ color: '#2563EB' }}>
                <FiZap size={14} />
                Generate My Website
              </a>
            </div>
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Email address</label>
            <input type="email" placeholder="info@company.com" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
            <p className="text-xs mt-1" style={{ color: '#1F271B', opacity: 0.6 }}>Used for customer-facing info, internal notifications, and as Reply Email (e.g. when a customer replies to a quote email).</p>
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Company Country ID (RUT)</label>
            <input type="text" placeholder="RUT / Tax ID" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Street 1</label>
            <input type="text" placeholder="Street address" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Street 2</label>
            <input type="text" placeholder="Apt, suite, etc. (optional)" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} style={{ color: '#1F271B' }}>City</label>
              <input type="text" placeholder="City" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
            </div>
            <div>
              <label className={labelClass} style={{ color: '#1F271B' }}>State</label>
              <input type="text" placeholder="State / Region" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
            </div>
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Zip code</label>
            <input type="text" placeholder="Zip code" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>Company logo</h2>
        <p className="text-sm mb-3" style={{ color: '#1F271B', opacity: 0.7 }}>Used in email messages and on PDFs (quote and invoice).</p>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-lg flex items-center justify-center border shrink-0" style={{ borderColor: '#EAEBED', backgroundColor: '#F3F4F6' }}>
            <span className="text-xs" style={{ color: '#1F271B', opacity: 0.5 }}>Logo</span>
          </div>
          <button type="button" className="px-4 py-2 rounded text-sm font-medium flex items-center gap-2 text-white" style={{ backgroundColor: '#28AFB0' }}>
            <FiUpload size={16} />
            Upload logo
          </button>
        </div>
      </section>

      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>Company colors</h2>
        <p className="text-sm mb-4" style={{ color: '#1F271B', opacity: 0.7 }}>Two colors for document personalization (quotes, invoices, PDFs).</p>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium w-24 shrink-0" style={{ color: '#1F271B' }}>Color 1</label>
            <input type="color" defaultValue="#28AFB0" className="w-10 h-10 rounded border cursor-pointer" style={{ borderColor: '#EAEBED', padding: 2 }} />
            <input type="text" defaultValue="#28AFB0" className="w-24 px-2 py-1.5 border rounded text-sm font-mono" style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium w-24 shrink-0" style={{ color: '#1F271B' }}>Color 2</label>
            <input type="color" defaultValue="#1F271B" className="w-10 h-10 rounded border cursor-pointer" style={{ borderColor: '#EAEBED', padding: 2 }} />
            <input type="text" defaultValue="#1F271B" className="w-24 px-2 py-1.5 border rounded text-sm font-mono" style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>Bank details</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Bank</label>
            <select className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }}>
              {MOCK_BANKS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Account type</label>
            <select className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }}>
              <option>Cuenta corriente</option>
              <option>Cuenta Vista / RUT</option>
              <option>Cuenta de Ahorro</option>
            </select>
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Account number</label>
            <input type="text" placeholder="Account number" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Email for payment notifications</label>
            <input type="email" placeholder="payments@company.com" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Online payment link</label>
            <input type="url" placeholder="https://payment-link.example.com" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
            <p className="text-xs mt-1" style={{ color: '#1F271B', opacity: 0.6 }}>URL to share with customers for online payment.</p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>Terms & conditions</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Budget (Quote) Terms & Conditions</label>
            <textarea rows={4} placeholder="Payment terms for quotes…" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Invoice Terms & Conditions</label>
            <textarea rows={4} placeholder="Payment due terms for invoices…" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>Arrival window</h2>
        <p className="text-sm mb-3" style={{ color: '#1F271B', opacity: 0.7 }}>Number of hours (1–4) added to the scheduled start time to define the arrival range shown to the customer. Used for booking confirmation.</p>
        <div className="flex items-center gap-3">
          <label className={labelClass} style={{ color: '#1F271B' }}>Arrival window (hours)</label>
          <select className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B', maxWidth: '120px' }}>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>
        </div>
        <p className="text-xs mt-2" style={{ color: '#1F271B', opacity: 0.6 }}>
          Logic: takes the scheduled start time and adds the arrival window; this range is what we inform the customer for arrivals and use for booking confirmation.
        </p>
      </section>

      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>WhatsApp sender</h2>
        <p className="text-sm mb-3" style={{ color: '#1F271B', opacity: 0.7 }}>Company WhatsApp number used for automated messages.</p>
        <input type="text" placeholder="+56 9 1234 5678" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B', maxWidth: '400px' }} />
      </section>

      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>Tax (VAT / IVA)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Tax ID</label>
            <input type="text" placeholder="12.345.678-9" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Default tax rate (%)</label>
            <input type="number" defaultValue={19} min={0} step={0.01} placeholder="19" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
            <p className="text-xs mt-1" style={{ color: '#1F271B', opacity: 0.6 }}>Example: 19%</p>
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button type="button" className="px-6 py-2 rounded text-sm font-medium flex items-center gap-2 text-white" style={{ backgroundColor: '#28AFB0' }}>
          <FiSave size={18} />
          Save changes
        </button>
      </div>
    </div>
  )
}

function RolesPermissionsSettings() {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<RoleDef | null>(null)
  const [customRoles, setCustomRoles] = useState<RoleDef[]>([])

  // ── API state ──────────────────────────────────────────────────────────────
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionResource[]>([])
  const [matrixLoading, setMatrixLoading] = useState(true)
  const [matrixError, setMatrixError] = useState<string | null>(null)

  useEffect(() => {
    setMatrixLoading(true)
    setMatrixError(null)
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    fetch(`${baseUrl}/api/roles/permissions/matrix`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setPermissionMatrix(json.data)
        } else {
          throw new Error('Unexpected response shape')
        }
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to load permissions'
        setMatrixError(msg)
      })
      .finally(() => setMatrixLoading(false))
  }, [])

  // Flatten matrix → permission options keyed as "resource:action" for the modal
  const allPermissions = useMemo<{ id: string; label: string }[]>(() => {
    const options: { id: string; label: string }[] = [
      { id: 'all', label: 'Full access (all modules and configuration)' },
    ]
    permissionMatrix.forEach(({ resource, actions }) => {
      actions.forEach((action) => {
        options.push({ id: `${resource}:${action}`, label: `${resource} — ${action}` })
      })
    })
    return options
  }, [permissionMatrix])

  // Each row in the Roles table is one PermissionResource from the API
  // plus any custom roles the user has created locally
  const tableRows = useMemo(() => {
    const apiRows: RoleDef[] = permissionMatrix.map((item) => ({
      id: item.resource,
      name: item.resource.charAt(0).toUpperCase() + item.resource.slice(1),
      description: `Manage ${item.resource}`,
      permissions: item.actions.map((a) => `${item.resource}:${a}`),
      isSystem: true,
    }))
    return [...apiRows, ...customRoles]
  }, [permissionMatrix, customRoles])

  const handleSaveCustomRole = (name: string, description: string, permissions: string[]) => {
    if (editingRole && !editingRole.isSystem) {
      setCustomRoles((prev) =>
        prev.map((r) => (r.id === editingRole.id ? { ...r, name, description, permissions } : r))
      )
    } else {
      setCustomRoles((prev) => [
        ...prev,
        { id: `custom-${Date.now()}`, name, description, permissions, isSystem: false },
      ])
    }
    setAddModalOpen(false)
    setEditingRole(null)
  }

  const formatPermissions = (permissions: string[]): string => {
    if (permissions.includes('all')) return 'Full access'
    const grouped: Record<string, string[]> = {}
    permissions.forEach((p) => {
      const [resource, action] = p.split(':')
      if (resource && action) {
        if (!grouped[resource]) grouped[resource] = []
        grouped[resource].push(action)
      }
    })
    return (
      Object.entries(grouped)
        .map(([res, acts]) => `${res}: ${acts.join(', ')}`)
        .join(' | ') || '—'
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1F271B' }}>Roles & Permissions</h1>
        <p className="text-sm mt-1" style={{ color: '#1F271B', opacity: 0.7 }}>
          System-wide permissions are predefined. Business owners can create custom roles and assign specific
          permissions to roles. The assigned role may see the portal in a different design view.
        </p>
      </div>

      {/* Minimum required roles */}
      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>Minimum required roles</h2>
        <ul className="space-y-2 text-sm" style={{ color: '#1F271B', opacity: 0.85 }}>
          <li>
            <strong>Admin / Owner (Service company)</strong> — Full access to all modules and configuration.
          </li>
          <li>
            <strong>Technician</strong> — Access only to assigned jobs; can update job/visit status and submit
            work reports.
          </li>
        </ul>
      </section>

      {/* Roles table — rows driven by /api/roles/permissions/matrix */}
      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>Roles</h2>
          <button
            type="button"
            onClick={() => { setEditingRole(null); setAddModalOpen(true) }}
            disabled={matrixLoading}
            className="px-4 py-2 rounded text-sm font-medium text-white flex items-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: '#28AFB0' }}
          >
            <FiPlus size={18} />
            Create custom role
          </button>
        </div>

        {matrixLoading && (
          <div className="flex items-center gap-2 py-6">
            <div
              className="w-4 h-4 border-2 rounded-full animate-spin"
              style={{ borderColor: '#28AFB0', borderTopColor: 'transparent' }}
            />
            <span className="text-sm" style={{ color: '#1F271B', opacity: 0.6 }}>Loading roles…</span>
          </div>
        )}

        {!matrixLoading && matrixError && (
          <div className="rounded-lg p-3" style={{ backgroundColor: '#FEF2F2' }}>
            <p className="text-sm" style={{ color: '#DC2626' }}>Failed to load roles: {matrixError}</p>
          </div>
        )}

        {!matrixLoading && !matrixError && (
          <div className="border rounded-lg overflow-hidden" style={{ borderColor: '#EAEBED' }}>
            <table className="w-full">
              <thead style={{ backgroundColor: '#F3F4F6' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1F271B' }}>Role</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1F271B' }}>Description</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1F271B' }}>Permissions</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold w-24" style={{ color: '#1F271B' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((r) => (
                  <tr key={r.id} className="border-b" style={{ borderColor: '#EAEBED' }}>
                    <td className="px-4 py-3">
                      <span className="font-medium" style={{ color: '#1F271B' }}>{r.name}</span>
                      {r.isSystem && (
                        <span className="ml-2 text-xs" style={{ color: '#1F271B', opacity: 0.5 }}>(system)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#1F271B', opacity: 0.8 }}>{r.description}</td>
                    <td
                      className="px-4 py-3 text-xs max-w-xs truncate"
                      style={{ color: '#1F271B', opacity: 0.8 }}
                      title={formatPermissions(r.permissions)}
                    >
                      {formatPermissions(r.permissions)}
                    </td>
                    <td className="px-4 py-3">
                      {!r.isSystem && (
                        <button
                          type="button"
                          onClick={() => { setEditingRole(r); setAddModalOpen(true) }}
                          className="text-sm font-medium"
                          style={{ color: '#28AFB0' }}
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {addModalOpen && (
        <AddEditRoleModal
          role={editingRole}
          allPermissions={allPermissions}
          permissionMatrix={permissionMatrix}
          onClose={() => { setAddModalOpen(false); setEditingRole(null) }}
          onSave={handleSaveCustomRole}
        />
      )}
    </div>
  )
}

function AddEditRoleModal({
  role,
  allPermissions,
  permissionMatrix,
  onClose,
  onSave,
}: {
  role: RoleDef | null
  allPermissions: { id: string; label: string }[]
  permissionMatrix: PermissionResource[]
  onClose: () => void
  onSave: (name: string, description: string, permissions: string[]) => void
}) {
  const [name, setName] = useState(role?.name ?? '')
  const [description, setDescription] = useState(role?.description ?? '')
  const [permissions, setPermissions] = useState<string[]>(role?.permissions ?? [])

  const isFullAccess = permissions.includes('all')

  const toggleAll = () => {
    setPermissions(isFullAccess ? [] : ['all'])
  }

  // Select / deselect every action in a resource
  const toggleResourceAll = (resource: string, actions: string[]) => {
    const keys = actions.map((a) => `${resource}:${a}`)
    const allChecked = keys.every((k) => permissions.includes(k))
    if (allChecked) {
      setPermissions((prev) => prev.filter((p) => !keys.includes(p)))
    } else {
      setPermissions((prev) => {
        const withoutAll = prev.filter((p) => p !== 'all')
        return Array.from(new Set([...withoutAll, ...keys]))
      })
    }
  }

  const togglePermission = (id: string) => {
    if (id === 'all') { toggleAll(); return }
    setPermissions((prev) => {
      const withoutAll = prev.filter((p) => p !== 'all')
      return withoutAll.includes(id)
        ? withoutAll.filter((p) => p !== id)
        : [...withoutAll, id]
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave(name.trim(), description.trim(), permissions)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
        style={{ borderColor: '#EAEBED', border: '1px solid #EAEBED' }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold" style={{ color: '#1F271B' }}>
            {role ? 'Edit role' : 'Create custom role'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-gray-100"
            style={{ color: '#1F271B' }}
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Role name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Field worker"
              className={inputClass}
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this role can do"
              className={inputClass}
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
            />
          </div>

          {/* Permissions */}
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Permissions</label>

            {/* Full access master toggle */}
            <label
              className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border mb-3"
              style={{
                borderColor: isFullAccess ? '#28AFB0' : '#EAEBED',
                backgroundColor: isFullAccess ? 'rgba(40,175,176,0.07)' : 'transparent',
              }}
            >
              <input
                type="checkbox"
                checked={isFullAccess}
                onChange={toggleAll}
                className="w-4 h-4 rounded"
                style={{ accentColor: '#28AFB0' }}
              />
              <span className="text-sm font-medium" style={{ color: '#1F271B' }}>
                Full access (all modules and configuration)
              </span>
            </label>

            {/* Grouped resource → action checkboxes (hidden when full-access is on) */}
            {!isFullAccess && (
              <div
                className="border rounded-lg overflow-hidden"
                style={{ borderColor: '#EAEBED', maxHeight: 340, overflowY: 'auto' }}
              >
                {permissionMatrix.length === 0 ? (
                  <p className="px-4 py-3 text-sm" style={{ color: '#1F271B', opacity: 0.5 }}>
                    No permission resources loaded.
                  </p>
                ) : (
                  permissionMatrix.map(({ resource, actions }) => {
                    const keys = actions.map((a) => `${resource}:${a}`)
                    const allChecked = keys.every((k) => permissions.includes(k))
                    const someChecked = keys.some((k) => permissions.includes(k))

                    return (
                      <div
                        key={resource}
                        className="border-b last:border-b-0"
                        style={{ borderColor: '#EAEBED' }}
                      >
                        {/* Resource header with select-all */}
                        <label
                          className="flex items-center gap-2 px-4 py-2 cursor-pointer"
                          style={{ backgroundColor: '#F9FAFB' }}
                        >
                          <input
                            type="checkbox"
                            checked={allChecked}
                            ref={(el) => {
                              if (el) el.indeterminate = !allChecked && someChecked
                            }}
                            onChange={() => toggleResourceAll(resource, actions)}
                            className="w-4 h-4 rounded"
                            style={{ accentColor: '#28AFB0' }}
                          />
                          <span
                            className="text-sm font-semibold capitalize"
                            style={{ color: '#1F271B' }}
                          >
                            {resource}
                          </span>
                        </label>

                        {/* Individual action checkboxes */}
                        <div className="px-5 pb-2.5 flex flex-wrap gap-x-5 gap-y-1">
                          {actions.map((action) => {
                            const key = `${resource}:${action}`
                            return (
                              <label
                                key={key}
                                className="flex items-center gap-1.5 cursor-pointer py-1"
                              >
                                <input
                                  type="checkbox"
                                  checked={permissions.includes(key)}
                                  onChange={() => togglePermission(key)}
                                  className="w-3.5 h-3.5 rounded"
                                  style={{ accentColor: '#28AFB0' }}
                                />
                                <span className="text-xs" style={{ color: '#1F271B' }}>
                                  {action}
                                </span>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded text-sm font-medium"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded text-sm font-medium text-white"
              style={{ backgroundColor: '#28AFB0' }}
            >
              {role ? 'Save' : 'Create role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

type TeamMemberRow = MockTeamMember

function TeamSettings({ roleOptions }: { roleOptions: string[] }) {
  const [members, setMembers] = useState<TeamMemberRow[]>(() => [...mockTeamMembers])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMemberRow | null>(null)
  const [actionsOpenId, setActionsOpenId] = useState<number | null>(null)

  const syncFromMock = () => setMembers([...mockTeamMembers])

  const openAdd = () => {
    setEditingMember(null)
    setModalOpen(true)
  }
  const openEdit = (m: TeamMemberRow) => {
    setEditingMember(m)
    setActionsOpenId(null)
    setModalOpen(true)
  }
  const setActive = (id: number, active: boolean) => {
    const m = mockTeamMembers.find((x) => x.id === id)
    if (m) {
      m.active = active
      syncFromMock()
    }
    setActionsOpenId(null)
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1F271B' }}>Team Management</h1>
        <p className="text-sm mt-1" style={{ color: '#1F271B', opacity: 0.7 }}>
          Add or manage team members. Deactivated users cannot be assigned to new visits; past visits still show them as assigned.
        </p>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={openAdd}
          className="px-4 py-2 rounded text-sm font-medium text-white flex items-center gap-2"
          style={{ backgroundColor: '#28AFB0' }}
        >
          <FiPlus size={18} />
          Add team member
        </button>
      </div>
      <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#EAEBED' }}>
        <table className="w-full">
          <thead style={{ backgroundColor: '#F3F4F6' }}>
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1F271B' }}>NAME</th>
              <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1F271B' }}>EMAIL</th>
              <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1F271B' }}>LAST LOGIN</th>
              <th className="px-4 py-3 text-left text-sm font-semibold w-24" style={{ color: '#1F271B' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const active = m.active
              const initials = m.name.split(/\s+/).map((n) => n[0]).join('').toUpperCase().slice(0, 2)
              return (
                <tr key={m.id} className="border-b" style={{ borderColor: '#EAEBED', opacity: active ? 1 : 0.7 }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium shrink-0" style={{ backgroundColor: active ? 'rgba(43, 80, 170, 0.2)' : '#E5E7EB', color: active ? '#1F3A7A' : '#6B7280' }}>
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#1F271B' }}>{m.name}</p>
                        <p className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>{m.role}{!active && ' · Inactive'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#1F271B', opacity: 0.8 }}>{m.email}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#1F271B', opacity: 0.6 }}>—</td>
                  <td className="px-4 py-3 relative">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(m)}
                        className="text-sm font-medium"
                        style={{ color: '#28AFB0' }}
                      >
                        Edit
                      </button>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setActionsOpenId(actionsOpenId === m.id ? null : m.id)}
                          className="p-1.5 rounded hover:bg-gray-100"
                          style={{ color: '#1F271B' }}
                          aria-label="Actions"
                        >
                          <FiMoreVertical size={18} />
                        </button>
                        {actionsOpenId === m.id && (
                          <>
                            <div className="fixed inset-0 z-10" aria-hidden onClick={() => setActionsOpenId(null)} />
                            <div
                              className="absolute right-0 top-full mt-1 py-1 rounded-lg border shadow-lg bg-white z-20 min-w-[180px]"
                              style={{ borderColor: '#EAEBED' }}
                            >
                              <button
                                type="button"
                                onClick={() => openEdit(m)}
                                className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50"
                                style={{ color: '#1F271B' }}
                              >
                                <FiMail size={14} />
                                Resend invitation
                              </button>
                              {active ? (
                                <button
                                  type="button"
                                  onClick={() => setActive(m.id, false)}
                                  className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-red-50"
                                  style={{ color: '#DC2626' }}
                                >
                                  <FiUserMinus size={14} />
                                  Deactivate
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setActive(m.id, true)}
                                  className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50"
                                  style={{ color: '#28AFB0' }}
                                >
                                  <FiUserPlus size={14} />
                                  Reactivate
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <AddTeamMemberModal
          roleOptions={roleOptions.length > 0 ? roleOptions : ['Admin / Owner (Service company)', 'Technician']}
          initial={editingMember ? { ...editingMember, hasPicture: !!editingMember.picture } : undefined}
          onClose={() => { setModalOpen(false); setEditingMember(null) }}
          onSave={(member) => {
            const { password: _p, hasPicture: _h, ...rest } = member
            if (editingMember) {
              const idx = mockTeamMembers.findIndex((x) => x.id === editingMember.id)
              if (idx >= 0) Object.assign(mockTeamMembers[idx], rest)
            } else {
              const newId = Math.max(0, ...mockTeamMembers.map((x) => x.id)) + 1
              mockTeamMembers.push({
                id: newId,
                ...rest,
                picture: '',
                active: true,
              })
            }
            syncFromMock()
            setModalOpen(false)
            setEditingMember(null)
          }}
        />
      )}
    </div>
  )
}

function AddTeamMemberModal({
  roleOptions,
  onClose,
  onSave,
  initial,
}: {
  roleOptions: string[]
  onClose: () => void
  onSave: (member: { name: string; email: string; phone: string; rut: string; role: string; hasPicture: boolean; password?: string }) => void
  initial?: { name: string; email: string; phone: string; rut: string; role: string; hasPicture: boolean }
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [rut, setRut] = useState(initial?.rut ?? '')
  const [role, setRole] = useState(initial?.role ?? roleOptions[0] ?? 'Technician')
  const [password, setPassword] = useState('')
  const [hasPicture, setHasPicture] = useState(!!initial?.hasPicture)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    onSave({ name: name.trim(), email: email.trim(), phone: phone.trim(), rut: rut.trim(), role, hasPicture, password: password || undefined })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" style={{ borderColor: '#EAEBED', border: '1px solid #EAEBED' }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold" style={{ color: '#1F271B' }}>{initial ? 'Edit team member' : 'Add team member'}</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded hover:bg-gray-100" style={{ color: '#1F271B' }} aria-label="Close">
            <FiX size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Full name" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email@company.com" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Phone number</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234-567-8900" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>RUT (national Identity Document)</label>
            <input type="text" value={rut} onChange={(e) => setRut(e.target.value)} placeholder="RUT / ID number" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }}>
              {roleOptions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <p className="text-xs mt-1" style={{ color: '#1F271B', opacity: 0.6 }}>Assigned role may see the portal in a different design view. Configure in Settings → Roles & Permissions.</p>
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Picture</label>
            <p className="text-xs mb-2" style={{ color: '#1F271B', opacity: 0.6 }}>
              To be sent with email and WhatsApp notifications when this member is assigned to a job.
            </p>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full border flex items-center justify-center shrink-0" style={{ borderColor: '#EAEBED', backgroundColor: '#F3F4F6' }}>
                {hasPicture ? <span className="text-xs" style={{ color: '#1F271B', opacity: 0.6 }}>Photo</span> : <span className="text-xs" style={{ color: '#1F271B', opacity: 0.4 }}>No photo</span>}
              </div>
              <div className="flex-1">
                <input type="file" accept="image/*" id="team-member-photo" className="hidden" />
                <label htmlFor="team-member-photo" className="inline-block px-3 py-2 rounded text-sm font-medium cursor-pointer" style={{ backgroundColor: '#EAEBED', color: '#1F271B' }}>
                  Upload picture
                </label>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input type="checkbox" checked={hasPicture} onChange={(e) => setHasPicture(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: '#28AFB0' }} />
                  <span className="text-xs" style={{ color: '#1F271B' }}>Include in notifications when assigned</span>
                </label>
              </div>
            </div>
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={initial ? 'Leave blank to keep current' : 'Set password'} className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
            {initial && <p className="text-xs mt-1" style={{ color: '#1F271B', opacity: 0.6 }}>Leave blank to keep current password.</p>}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded text-sm font-medium" style={{ borderColor: '#EAEBED', color: '#1F271B' }}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded text-sm font-medium text-white" style={{ backgroundColor: '#28AFB0' }}>{initial ? 'Save' : 'Add team member'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ServicesSettings() {
  const [items, setItems] = useState<MasterPriceItem[]>(() => [...mockMasterPriceList])
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'type'>('name')
  const [sortAsc, setSortAsc] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [importOpen, setImportOpen] = useState(false)

  const filtered = useMemo(() => {
    let list = items.filter(
      (i) =>
        !search ||
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        (i.description && i.description.toLowerCase().includes(search.toLowerCase())) ||
        i.type.toLowerCase().includes(search.toLowerCase())
    )
    list = [...list].sort((a, b) => {
      const mul = sortAsc ? 1 : -1
      if (sortBy === 'name') return mul * (a.name.localeCompare(b.name))
      return mul * (a.type.localeCompare(b.type))
    })
    return list
  }, [items, search, sortBy, sortAsc])

  const toggleSort = (field: 'name' | 'type') => {
    if (sortBy === field) setSortAsc((a) => !a)
    else { setSortBy(field); setSortAsc(true) }
  }

  const openAdd = () => { setEditingId(null); setModalOpen(true) }
  const openEdit = (id: number) => { setEditingId(id); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditingId(null) }

  return (
    <div className="space-y-4 pb-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1F271B' }}>Products & services</h1>
        <p className="text-sm mt-1" style={{ color: '#1F271B', opacity: 0.7 }}>
          Add and update your products & services to stay organized when creating quotes, quote templates, jobs, and invoices. You can also add new custom services from a work order to the master price list.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" size={16} style={{ color: '#1F271B', opacity: 0.5 }} />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2 border rounded text-sm focus:outline-none focus:ring-2"
            style={{ borderColor: '#EAEBED', color: '#1F271B' }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-black/5"
              style={{ color: '#1F271B', opacity: 0.6 }}
              aria-label="Clear search"
            >
              <FiX size={16} />
            </button>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="px-4 py-2 border rounded text-sm font-medium transition-colors"
            style={{ borderColor: '#EAEBED', color: '#1F271B', backgroundColor: 'white' }}
          >
            Import
          </button>
          <button
            type="button"
            onClick={openAdd}
            className="px-4 py-2 rounded text-sm font-medium flex items-center gap-1.5 text-white transition-colors"
            style={{ backgroundColor: '#28AFB0' }}
          >
            <FiPlus size={16} />
            Add Item
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#EAEBED' }}>
        <table className="w-full">
          <thead style={{ backgroundColor: '#F3F4F6' }}>
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1F271B' }}>
                <button type="button" onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:opacity-80">
                  Name
                  <span className="text-xs opacity-60">{sortBy === 'name' ? (sortAsc ? '↑' : '↓') : ''}</span>
                </button>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1F271B' }}>Description</th>
              <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1F271B' }}>
                <button type="button" onClick={() => toggleSort('type')} className="flex items-center gap-1 hover:opacity-80">
                  Type
                  <span className="text-xs opacity-60">{sortBy === 'type' ? (sortAsc ? '↑' : '↓') : ''}</span>
                </button>
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold" style={{ color: '#1F271B' }}>Cost</th>
              <th className="px-4 py-3 text-right text-sm font-semibold" style={{ color: '#1F271B' }}>Markup %</th>
              <th className="px-4 py-3 text-right text-sm font-semibold" style={{ color: '#1F271B' }}>Price</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr className="border-b" style={{ borderColor: '#EAEBED' }}>
                <td className="px-4 py-8 text-sm text-center" style={{ color: '#1F271B', opacity: 0.6 }} colSpan={6}>
                  No items yet. Add items or import to build your master price list.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openEdit(item.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEdit(item.id) } }}
                  className="border-b cursor-pointer transition-colors hover:bg-gray-50"
                  style={{ borderColor: '#EAEBED' }}
                >
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium" style={{ color: '#2B50AA' }}>{item.name}</span>
                  </td>
                  <td className="px-4 py-3 text-sm max-w-xs truncate" style={{ color: '#1F271B', opacity: 0.8 }} title={item.description}>
                    {item.description || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#1F271B' }}>{item.type === 'service' ? 'Service' : 'Product'}</td>
                  <td className="px-4 py-3 text-sm text-right" style={{ color: '#1F271B' }}>Rs{item.cost.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-right" style={{ color: '#1F271B' }}>{item.markupPercent}%</td>
                  <td className="px-4 py-3 text-sm text-right font-medium" style={{ color: '#1F271B' }}>Rs{item.price.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <AddEditPriceItemModal
          item={editingId != null ? items.find((i) => i.id === editingId) ?? null : null}
          onClose={closeModal}
          onSave={(next) => {
            if (editingId != null) {
              setItems((prev) => prev.map((i) => (i.id === editingId ? { ...next, id: i.id } : i)))
            } else {
              setItems((prev) => [...prev, { ...next, id: Math.max(0, ...prev.map((i) => i.id)) + 1 }])
            }
            closeModal()
          }}
        />
      )}

      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" style={{ borderColor: '#EAEBED', border: '1px solid #EAEBED' }}>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#1F271B' }}>Import price list</h3>
            <p className="text-sm mb-4" style={{ color: '#1F271B', opacity: 0.7 }}>
              Upload a CSV with columns: type, name, description, cost, markupPercent, price. Type must be &quot;service&quot; or &quot;product&quot;.
            </p>
            <div className="border-2 border-dashed rounded-lg p-6 text-center" style={{ borderColor: '#EAEBED' }}>
              <input type="file" accept=".csv" className="hidden" id="import-csv" />
              <label htmlFor="import-csv" className="cursor-pointer text-sm font-medium" style={{ color: '#28AFB0' }}>
                Select CSV file
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={() => setImportOpen(false)} className="px-4 py-2 border rounded text-sm" style={{ borderColor: '#EAEBED', color: '#1F271B' }}>
                Cancel
              </button>
              <button type="button" className="px-4 py-2 rounded text-sm text-white" style={{ backgroundColor: '#28AFB0' }}>
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AddEditPriceItemModal({
  item,
  onClose,
  onSave,
}: {
  item: MasterPriceItem | null
  onClose: () => void
  onSave: (item: Omit<MasterPriceItem, 'id'>) => void
}) {
  const [type, setType] = useState<MasterPriceItemType>(item?.type ?? 'service')
  const [name, setName] = useState(item?.name ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [cost, setCost] = useState(item?.cost ?? 0)
  const [markupPercent, setMarkupPercent] = useState(item?.markupPercent ?? 0)
  const [price, setPrice] = useState(item?.price ?? 0)

  const updatePriceFromMarkup = () => {
    const p = cost * (1 + markupPercent / 100)
    setPrice(Number(p.toFixed(2)))
  }

  const handleSave = () => {
    if (!name.trim()) return
    onSave({
      type,
      name: name.trim(),
      description: description.trim(),
      cost: Number(cost) || 0,
      markupPercent: Number(markupPercent) || 0,
      price: Number(price) || 0,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" style={{ borderColor: '#EAEBED', border: '1px solid #EAEBED' }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold" style={{ color: '#1F271B' }}>{item ? 'Edit item' : 'Add item'}</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded hover:bg-gray-100" style={{ color: '#1F271B' }}>
            <FiX size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Item type</label>
            <select value={type} onChange={(e) => setType(e.target.value as MasterPriceItemType)} className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }}>
              <option value="service">Service</option>
              <option value="product">Product</option>
            </select>
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Item name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Exterior Window Cleaning" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Description</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass} style={{ color: '#1F271B' }}>Cost</label>
              <input type="number" min={0} step={0.01} value={cost || ''} onChange={(e) => setCost(Number(e.target.value) || 0)} onBlur={updatePriceFromMarkup} className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
            </div>
            <div>
              <label className={labelClass} style={{ color: '#1F271B' }}>Markup %</label>
              <input type="number" min={0} step={0.01} value={markupPercent || ''} onChange={(e) => setMarkupPercent(Number(e.target.value) || 0)} onBlur={updatePriceFromMarkup} className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
            </div>
            <div>
              <label className={labelClass} style={{ color: '#1F271B' }}>Price</label>
              <input type="number" min={0} step={0.01} value={price || ''} onChange={(e) => setPrice(Number(e.target.value) || 0)} className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded text-sm" style={{ borderColor: '#EAEBED', color: '#1F271B' }}>
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="px-4 py-2 rounded text-sm text-white" style={{ backgroundColor: '#28AFB0' }}>
            {item ? 'Save' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}