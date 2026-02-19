'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { FiSave, FiUpload, FiMail, FiMessageCircle, FiSearch, FiX, FiPlus } from 'react-icons/fi'
import { mockMasterPriceList, type MasterPriceItem, type MasterPriceItemType } from '@/data/mockData'

type SettingsSection = 'schedule' | 'products' | 'communications' | 'team' | 'roles' | 'templates' | 'reminders' | 'language'

const SIDEBAR_ITEMS: { id: SettingsSection; label: string }[] = [
  { id: 'schedule', label: 'Schedule Settings' },
  { id: 'products', label: 'Product and Services' },
  { id: 'communications', label: 'Communications settings' },
  { id: 'team', label: 'Team Management' },
  { id: 'roles', label: 'Roles & Permissions' },
  { id: 'templates', label: 'Templates' },
  { id: 'reminders', label: 'Reminders' },
  { id: 'language', label: 'Language' },
]

export type RoleDef = { id: string; name: string; description: string; permissions: string[]; isSystem: boolean }

const SYSTEM_PERMISSION_OPTIONS = [
  { id: 'all', label: 'Full access (all modules and configuration)' },
  { id: 'clients', label: 'Clients' },
  { id: 'workorders', label: 'Work orders' },
  { id: 'quotes', label: 'Quotes' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'settings', label: 'Settings' },
  { id: 'assigned_jobs', label: 'Access only to assigned jobs' },
  { id: 'update_status', label: 'Update job/visit status' },
  { id: 'work_reports', label: 'Submit work reports' },
]

const INITIAL_ROLES: RoleDef[] = [
  { id: 'super-admin', name: 'Super Admin (me)', description: 'Full system control.', permissions: ['all'], isSystem: true },
  { id: 'admin', name: 'Admin / Owner (Service company)', description: 'Full access to all modules and configuration.', permissions: ['all'], isSystem: true },
  { id: 'technician', name: 'Technician', description: 'Access only to assigned jobs. Can update job/visit status and submit work reports.', permissions: ['assigned_jobs', 'update_status', 'work_reports'], isSystem: true },
]

const inputClass = 'w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2'
const labelClass = 'block text-sm font-medium mb-1'
const sectionTitleClass = 'text-base font-semibold mb-3'

const VALID_SECTIONS: SettingsSection[] = ['schedule', 'products', 'communications', 'team', 'roles', 'templates', 'reminders', 'language']

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
  const [activeSection, setActiveSection] = useState<SettingsSection>('schedule')
  const [roles, setRoles] = useState<RoleDef[]>(() => [...INITIAL_ROLES])

  useEffect(() => {
    if (sectionFromUrl && VALID_SECTIONS.includes(sectionFromUrl)) {
      setActiveSection(sectionFromUrl)
    }
  }, [sectionFromUrl])

  return (
    <div className="flex gap-6 min-h-[calc(100vh-8rem)]">
      {/* Left sidebar - matches reference */}
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
        {activeSection === 'schedule' && <ScheduleSettings />}
        {activeSection === 'products' && <ServicesSettings />}
        {activeSection === 'communications' && <CommunicationsSettings />}
        {activeSection === 'team' && <TeamSettings roleOptions={roles.map((r) => r.name)} />}
        {activeSection === 'roles' && <RolesPermissionsSettings roles={roles} setRoles={setRoles} />}
        {activeSection === 'templates' && <EmailTemplates />}
        {activeSection === 'reminders' && <RemindersSettings />}
        {activeSection === 'language' && <LanguageSettings />}
      </main>
    </div>
  )
}

function PlaceholderSection({ name }: { name: string }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold" style={{ color: '#1F271B' }}>{name}</h1>
      <p className="text-sm" style={{ color: '#1F271B', opacity: 0.7 }}>This section is under construction.</p>
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

const DEFAULT_BLOCK_COLORS = [
  { id: 'job', label: 'Job', color: '#28AFB0' },
  { id: 'quote', label: 'Quote / Budget', color: '#2B50AA' },
  { id: 'unassigned', label: 'Unassigned', color: '#9CA3AF' },
  { id: 'blocked', label: 'Blocked / Time off', color: '#6B7280' },
  { id: 'in progress', label: 'In progress', color: '#7C3AED' },
]

function ScheduleSettings() {
  const [blocks, setBlocks] = useState(DEFAULT_BLOCK_COLORS)
  return (
    <div className="space-y-6 pb-8">
      <h1 className="text-2xl font-bold" style={{ color: '#1F271B' }}>Schedule Settings</h1>
      <p className="text-sm" style={{ color: '#1F271B', opacity: 0.7 }}>
        Set colors for blocks shown on the schedule. These colors help distinguish job status, quotes, unassigned time, and blocked time.
      </p>
      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>Block colors</h2>
        <div className="space-y-4 max-w-md">
          {blocks.map((b) => (
            <div key={b.id} className="flex items-center gap-4">
              <label className="w-32 text-sm font-medium shrink-0" style={{ color: '#1F271B' }}>{b.label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={b.color}
                  onChange={(e) => setBlocks((prev) => prev.map((x) => (x.id === b.id ? { ...x, color: e.target.value } : x)))}
                  className="w-10 h-10 rounded border cursor-pointer"
                  style={{ borderColor: '#EAEBED', padding: 2 }}
                />
                <input
                  type="text"
                  value={b.color}
                  onChange={(e) => setBlocks((prev) => prev.map((x) => (x.id === b.id ? { ...x, color: e.target.value } : x)))}
                  className="w-24 px-2 py-1.5 border rounded text-sm font-mono"
                  style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs mt-4" style={{ color: '#1F271B', opacity: 0.6 }}>
          Colors apply to the calendar/schedule view. Use hex codes (e.g. #28AFB0) for consistency.
        </p>
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

function CommunicationsSettings() {
  return (
    <div className="space-y-6 pb-8">
      <h1 className="text-2xl font-bold" style={{ color: '#1F271B' }}>Communications settings</h1>
      <p className="text-sm" style={{ color: '#1F271B', opacity: 0.7 }}>
        Opt in or out of reminders by type. When a reminder type is disabled, no reminders of that type will be sent.
      </p>
      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>Reminders by type</h2>
        <div className="space-y-3">
          <label className="flex items-center justify-between gap-4 cursor-pointer py-2 border-b" style={{ borderColor: '#EAEBED' }}>
            <span className="text-sm font-medium" style={{ color: '#1F271B' }}>Budget (Quote) reminders</span>
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded" style={{ accentColor: '#28AFB0' }} />
          </label>
          <label className="flex items-center justify-between gap-4 cursor-pointer py-2 border-b" style={{ borderColor: '#EAEBED' }}>
            <span className="text-sm font-medium" style={{ color: '#1F271B' }}>Booking confirmation reminder</span>
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded" style={{ accentColor: '#28AFB0' }} />
          </label>
          <label className="flex items-center justify-between gap-4 cursor-pointer py-2 border-b" style={{ borderColor: '#EAEBED' }}>
            <span className="text-sm font-medium" style={{ color: '#1F271B' }}>Invoice reminders</span>
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded" style={{ accentColor: '#28AFB0' }} />
          </label>
          <label className="flex items-center justify-between gap-4 cursor-pointer py-2" style={{ borderColor: '#EAEBED' }}>
            <span className="text-sm font-medium" style={{ color: '#1F271B' }}>Customer reminders (maintenance / offers)</span>
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded" style={{ accentColor: '#28AFB0' }} />
          </label>
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

function CompanySettings() {
  return (
    <div className="space-y-6 pb-8">
      <h1 className="text-2xl font-bold" style={{ color: '#1F271B' }}>Profile & Company Settings</h1>

      {/* 13.1 Profile & Company Settings - in sequence */}
      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>Company details</h2>
        <p className="text-sm mb-4" style={{ color: '#1F271B', opacity: 0.7 }}>Update company information used on quotes, invoices, and communications.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Company legal name</label>
            <input type="text" defaultValue="ABC Services Inc." className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Company address</label>
            <input type="text" defaultValue="123 Business St" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Company phone number</label>
            <input type="tel" defaultValue="+1 234-567-8900" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Company Country ID (RUT)</label>
            <input type="text" placeholder="RUT / Tax ID" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass} style={{ color: '#1F271B' }}>Webpage</label>
            <input type="url" placeholder="https://" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>Company logo</h2>
        <p className="text-sm mb-3" style={{ color: '#1F271B', opacity: 0.7 }}>Used in email messages and on PDFs (quote and invoice).</p>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-lg flex items-center justify-center border" style={{ borderColor: '#EAEBED', backgroundColor: '#F3F4F6' }}>
            <span className="text-xs" style={{ color: '#1F271B', opacity: 0.5 }}>Logo</span>
          </div>
          <button type="button" className="px-4 py-2 rounded text-sm font-medium flex items-center gap-2 text-white" style={{ backgroundColor: '#28AFB0' }}>
            <FiUpload size={16} />
            Upload logo
          </button>
        </div>
      </section>

      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>Bank details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Bank</label>
            <input type="text" defaultValue="First National Bank" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Account type</label>
            <select className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }}>
              <option>Checking</option>
              <option>Savings</option>
            </select>
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Account number</label>
            <input type="text" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Email for payment notifications</label>
            <input type="email" placeholder="payments@company.com" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>Online payment link support</h2>
        <p className="text-sm mb-3" style={{ color: '#1F271B', opacity: 0.7 }}>Transbank, MercadoPago, or others.</p>
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded" style={{ accentColor: '#28AFB0' }} />
            <span className="text-sm" style={{ color: '#1F271B' }}>Transbank</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded" style={{ accentColor: '#28AFB0' }} />
            <span className="text-sm" style={{ color: '#1F271B' }}>MercadoPago</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded" style={{ accentColor: '#28AFB0' }} />
            <span className="text-sm" style={{ color: '#1F271B' }}>Other</span>
          </label>
        </div>
      </section>

      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>Email for notifications</h2>
        <label className={labelClass} style={{ color: '#1F271B' }}>Email</label>
        <input type="email" placeholder="notifications@company.com" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B', maxWidth: '400px' }} />
      </section>

      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>Terms & conditions</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Budget (Quote) Terms & Conditions</label>
            <textarea rows={4} defaultValue="Payment terms: Net 30 days." className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Invoice Terms & Conditions</label>
            <textarea rows={4} defaultValue="Payment due within 30 days." className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div className="max-w-xs">
            <label className={labelClass} style={{ color: '#1F271B' }}>Invoice due (days)</label>
            <input type="number" defaultValue={3} min={1} className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
            <p className="text-xs mt-1" style={{ color: '#1F271B', opacity: 0.6 }}>e.g. 3 days = expiration date</p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>Booking & scheduling</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Arrival window</label>
            <input type="text" placeholder="e.g. 30 min" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Duration (default)</label>
            <select className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }}>
              <option>30 min</option>
              <option>1 hour</option>
              <option>2 hours</option>
              <option>Half day</option>
              <option>Full day</option>
            </select>
          </div>
        </div>
        <p className="text-xs mt-2" style={{ color: '#1F271B', opacity: 0.6 }}>
          Arrival window logic: takes start time and adds the arrival window. Used for booking confirmation.
        </p>
      </section>

      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>WhatsApp sender</h2>
        <label className={labelClass} style={{ color: '#1F271B' }}>Sender name or number</label>
        <input type="text" placeholder="Sender name or number" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B', maxWidth: '400px' }} />
      </section>

      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>Tax</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Tax ID (VAT / IVA)</label>
            <input type="text" defaultValue="12-3456789-0" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Default tax rate (%)</label>
            <input type="number" defaultValue={19} min={0} step={0.01} className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
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

const TEMPLATE_IDS = [
  'booking-confirmation',
  'quote',
  'quote-follow-up',
  'invoice',
  'invoice-follow-up',
  'schedule-confirmation',
  'schedule-confirmation-reminder',
  'workorder-report',
] as const

const TEMPLATE_LABELS: Record<string, string> = {
  'booking-confirmation': 'Booking Confirmation',
  'quote': 'Quote',
  'quote-follow-up': 'Quote Follow Up',
  'invoice': 'Invoice',
  'invoice-follow-up': 'Invoice Follow Up',
  'schedule-confirmation': 'Schedule Confirmation',
  'schedule-confirmation-reminder': 'Schedule Confirmation Reminder',
  'workorder-report': 'Work Order Report',
}

function EmailTemplates() {
  return (
    <div className="space-y-6 pb-8">
      <h1 className="text-2xl font-bold" style={{ color: '#1F271B' }}>Templates</h1>
      <p className="text-sm" style={{ color: '#1F271B', opacity: 0.7 }}>
        Templates for invoice, invoice follow up, quote, quote follow up, schedule confirmation, schedule confirmation reminder, and work order report.
      </p>

      {TEMPLATE_IDS.map((id) => (
        <section key={id} className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
          <div className="flex justify-between items-start mb-4">
            <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>{TEMPLATE_LABELS[id] || id}</h2>
            <div className="flex items-center gap-4">
              <span className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>Channel:</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded" style={{ accentColor: '#28AFB0' }} />
                <FiMail size={14} />
                <span className="text-sm">Email</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" style={{ accentColor: '#28AFB0' }} />
                <FiMessageCircle size={14} />
                <span className="text-sm">WhatsApp</span>
              </label>
            </div>
          </div>
          {id === 'booking-confirmation' && (
            <label className="flex items-center gap-2 mb-4 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded" style={{ accentColor: '#28AFB0' }} />
              <span className="text-sm" style={{ color: '#1F271B' }}>Include assigned team members&apos; profile picture</span>
            </label>
          )}
          <div className="space-y-3">
            <div>
              <label className={labelClass} style={{ color: '#1F271B' }}>Subject</label>
              <input type="text" defaultValue={`${TEMPLATE_LABELS[id]} from Company`} className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
            </div>
            <div>
              <label className={labelClass} style={{ color: '#1F271B' }}>Message</label>
              <textarea rows={5} defaultValue={`Hi {client_name},\n\nMessage body. You can use variables like {job_title}, {quote_total}, {invoice_number}.`} className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>Insert variable:</span>
              <select className="px-2 py-1 border rounded text-xs" style={{ borderColor: '#EAEBED', color: '#1F271B' }}>
                <option value="{client_name}">client_name</option>
                <option value="{job_title}">job_title</option>
                <option value="{quote_total}">quote_total</option>
                <option value="{invoice_number}">invoice_number</option>
                <option value="{company_name}">company_name</option>
              </select>
            </div>
            <button type="button" className="text-sm font-medium" style={{ color: '#28AFB0' }}>Reset to system default</button>
          </div>
        </section>
      ))}

      <div className="flex justify-end">
        <button type="button" className="px-6 py-2 rounded text-sm font-medium flex items-center gap-2 text-white" style={{ backgroundColor: '#28AFB0' }}>
          <FiSave size={18} />
          Save changes
        </button>
      </div>
    </div>
  )
}

function RemindersSettings() {
  const [bookingRows, setBookingRows] = useState([{ timeBefore: 2, timeType: 'days' as 'hours' | 'days', timeOfDay: '18:00', channel: ['email'] as ('email' | 'whatsapp')[] }, { timeBefore: 1, timeType: 'days', timeOfDay: '12:00', channel: ['whatsapp'] }])
  const addBookingRow = () => setBookingRows((r) => [...r, { timeBefore: 1, timeType: 'days', timeOfDay: '18:00', channel: ['email'] }])
  return (
    <div className="space-y-6 pb-8">
      <h1 className="text-2xl font-bold" style={{ color: '#1F271B' }}>Reminders</h1>
      <p className="text-sm" style={{ color: '#1F271B', opacity: 0.7 }}>
        Configure reminders for budget (quote), booking confirmation, invoice, and customer follow-ups. Enable or disable each type below. Reminders can be sent by email, WhatsApp, or both. You can resend reminders manually at any time without affecting the scheduled reminders.
      </p>

      {/* Budget (Quote) reminders */}
      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>Budget (Quote) reminders</h2>
        <p className="text-xs mb-3" style={{ color: '#1F271B', opacity: 0.6 }}>
          <strong>Restriction:</strong> Sent only when budget status is &quot;waiting for approval&quot;. If budget is approved, no reminder is sent.
        </p>
        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input type="checkbox" defaultChecked className="w-4 h-4 rounded" style={{ accentColor: '#28AFB0' }} />
          <span className="text-sm font-medium" style={{ color: '#1F271B' }}>Enable budget reminders</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Reminder 1</label>
            <div className="flex gap-2 items-center flex-wrap">
              <input type="number" defaultValue={48} className="w-20 px-2 py-2 border rounded text-sm" style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
              <span className="text-sm" style={{ color: '#1F271B' }}>hours after sent</span>
            </div>
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Reminder 2</label>
            <div className="flex gap-2 items-center flex-wrap">
              <input type="number" defaultValue={120} className="w-20 px-2 py-2 border rounded text-sm" style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
              <span className="text-sm" style={{ color: '#1F271B' }}>hours (5 days) after sent</span>
            </div>
          </div>
        </div>
        <p className={labelClass} style={{ color: '#1F271B' }}>Channel</p>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded" style={{ accentColor: '#28AFB0' }} />
            <span className="text-sm">Email</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded" style={{ accentColor: '#28AFB0' }} />
            <span className="text-sm">WhatsApp</span>
          </label>
        </div>
      </section>

      {/* Booking confirmation reminder */}
      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>Booking confirmation reminder</h2>
        <p className="text-xs mb-3" style={{ color: '#1F271B', opacity: 0.6 }}>
          Examples: Email 2 days before the job at 18:00. WhatsApp 1 day before at noon. For jobs scheduled for the next day after 12:00, no reminder is sent. Same logic applies to the 2-day threshold for the first reminder.
        </p>
        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input type="checkbox" defaultChecked className="w-4 h-4 rounded" style={{ accentColor: '#28AFB0' }} />
          <span className="text-sm font-medium" style={{ color: '#1F271B' }}>Enable booking reminders</span>
        </label>
        <div className="space-y-4">
          {bookingRows.map((row, i) => (
            <div key={i} className="flex flex-wrap items-end gap-3 p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB', borderColor: '#EAEBED', border: '1px solid transparent' }}>
              <div>
                <label className={labelClass} style={{ color: '#1F271B' }}>Time before appointment</label>
                <div className="flex gap-2">
                  <input type="number" min={1} max={99} defaultValue={row.timeBefore} className="w-16 px-2 py-2 border rounded text-sm" style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
                  <select defaultValue={row.timeType} className="px-2 py-2 border rounded text-sm" style={{ borderColor: '#EAEBED', color: '#1F271B' }}>
                    <option value="hours">hours</option>
                    <option value="days">days</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass} style={{ color: '#1F271B' }}>Time of reminder</label>
                <input type="time" defaultValue={row.timeOfDay} className="px-3 py-2 border rounded text-sm" style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
              </div>
              <div>
                <label className={labelClass} style={{ color: '#1F271B' }}>Channel</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" defaultChecked={row.channel.includes('email')} className="w-4 h-4 rounded" style={{ accentColor: '#28AFB0' }} />
                    <span className="text-sm">Email</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" defaultChecked={row.channel.includes('whatsapp')} className="w-4 h-4 rounded" style={{ accentColor: '#28AFB0' }} />
                    <span className="text-sm">WhatsApp</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={addBookingRow} className="text-sm font-medium" style={{ color: '#28AFB0' }}>+ Add reminder</button>
        </div>
      </section>

      {/* Invoice reminders */}
      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>Invoice reminders</h2>
        <p className="text-xs mb-3" style={{ color: '#1F271B', opacity: 0.6 }}>
          <strong>Restriction:</strong> If invoice is paid, no reminder is sent.
        </p>
        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input type="checkbox" defaultChecked className="w-4 h-4 rounded" style={{ accentColor: '#28AFB0' }} />
          <span className="text-sm font-medium" style={{ color: '#1F271B' }}>Enable invoice reminders</span>
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded" style={{ accentColor: '#28AFB0' }} />
            <span className="text-sm">Reminder 1: on day due</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded" style={{ accentColor: '#28AFB0' }} />
            <span className="text-sm">Reminder 2: 2 days after invoice is due</span>
          </label>
        </div>
      </section>

      {/* Customer / Campaign reminders */}
      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>Campaigns: maintenance / offer (Customer reminder)</h2>
        <p className="text-sm mb-2" style={{ color: '#1F271B', opacity: 0.8 }}>
          Configure reminders per client to send maintenance follow-ups and offers. Customer reminder can be set at work order level or customer level (always associated with the customer). Set a reminder date and note.
        </p>
        <ul className="text-xs mb-3 list-disc list-inside space-y-1" style={{ color: '#1F271B', opacity: 0.7 }}>
          <li>When reminder date is triggered (today &gt; reminder date), client status changes to &quot;Follow up&quot;.</li>
          <li>Client statuses: <strong>Active</strong>, <strong>Archived</strong>, <strong>Follow up</strong> — filterable in client list view.</li>
          <li>When in Follow up: in customer detail view (and list view) — <strong>Send Email</strong> (same template as quote). Optional: <strong>Send Campaign</strong> (bulk send after selecting clients in list view).</li>
          <li>Reminders can be resent manually at any time, independently from the schedule.</li>
        </ul>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" defaultChecked className="w-4 h-4 rounded" style={{ accentColor: '#28AFB0' }} />
          <span className="text-sm font-medium" style={{ color: '#1F271B' }}>Enable customer reminders</span>
        </label>
      </section>

      {/* Email format & defaults */}
      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>Email format &amp; defaults</h2>
        <p className="text-sm mb-2" style={{ color: '#1F271B', opacity: 0.8 }}>
          Reminder emails are sent from the company owner. Use the default subject (Jobber-style) or customize per template. A default template is loaded in the platform for every message type.
        </p>
        <p className="text-xs" style={{ color: '#1F271B', opacity: 0.6 }}>
          Resend reminders manually at any time without disturbing the scheduled reminders already programmed.
        </p>
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

function RolesPermissionsSettings({ roles, setRoles }: { roles: RoleDef[]; setRoles: React.Dispatch<React.SetStateAction<RoleDef[]>> }) {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<RoleDef | null>(null)

  const handleSaveCustomRole = (name: string, description: string, permissions: string[]) => {
    if (editingRole) {
      setRoles((prev) => prev.map((r) => (r.id === editingRole.id ? { ...r, name, description, permissions } : r)))
    } else {
      setRoles((prev) => [...prev, { id: `custom-${Date.now()}`, name, description, permissions, isSystem: false }])
    }
    setAddModalOpen(false)
    setEditingRole(null)
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1F271B' }}>Roles & Permissions</h1>
        <p className="text-sm mt-1" style={{ color: '#1F271B', opacity: 0.7 }}>
          System-wide permissions are predefined. Business owners can create custom roles and assign specific permissions to roles. The assigned role may see the portal in a different design view.
        </p>
      </div>

      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>Minimum required roles</h2>
        <ul className="space-y-2 text-sm mb-4" style={{ color: '#1F271B', opacity: 0.85 }}>
          <li><strong>Super Admin (me)</strong> — Full system control.</li>
          <li><strong>Admin / Owner (Service company)</strong> — Full access to all modules and configuration.</li>
          <li><strong>Technician</strong> — Access only to assigned jobs; can update job/visit status and submit work reports.</li>
        </ul>
      </section>

      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>Roles</h2>
          <button
            type="button"
            onClick={() => { setEditingRole(null); setAddModalOpen(true) }}
            className="px-4 py-2 rounded text-sm font-medium text-white flex items-center gap-2"
            style={{ backgroundColor: '#28AFB0' }}
          >
            <FiPlus size={18} />
            Create custom role
          </button>
        </div>
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
              {roles.map((r) => (
                <tr key={r.id} className="border-b" style={{ borderColor: '#EAEBED' }}>
                  <td className="px-4 py-3">
                    <span className="font-medium" style={{ color: '#1F271B' }}>{r.name}</span>
                    {r.isSystem && <span className="ml-2 text-xs" style={{ color: '#1F271B', opacity: 0.6 }}>(system)</span>}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#1F271B', opacity: 0.8 }}>{r.description}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#1F271B', opacity: 0.8 }}>
                    {r.permissions.includes('all') ? 'Full access' : r.permissions.join(', ')}
                  </td>
                  <td className="px-4 py-3">
                    {!r.isSystem && (
                      <button type="button" onClick={() => { setEditingRole(r); setAddModalOpen(true) }} className="text-sm font-medium" style={{ color: '#28AFB0' }}>Edit</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {addModalOpen && (
        <AddEditRoleModal
          role={editingRole}
          allPermissions={SYSTEM_PERMISSION_OPTIONS}
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
  onClose,
  onSave,
}: {
  role: RoleDef | null
  allPermissions: { id: string; label: string }[]
  onClose: () => void
  onSave: (name: string, description: string, permissions: string[]) => void
}) {
  const [name, setName] = useState(role?.name ?? '')
  const [description, setDescription] = useState(role?.description ?? '')
  const [permissions, setPermissions] = useState<string[]>(role?.permissions ?? [])

  const togglePermission = (id: string) => {
    if (id === 'all') {
      setPermissions((prev) => (prev.includes('all') ? [] : ['all']))
    } else {
      setPermissions((prev) => {
        const next = prev.filter((p) => p !== 'all')
        return next.includes(id) ? next.filter((p) => p !== id) : [...next, id]
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave(name.trim(), description.trim(), permissions)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" style={{ borderColor: '#EAEBED', border: '1px solid #EAEBED' }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold" style={{ color: '#1F271B' }}>{role ? 'Edit role' : 'Create custom role'}</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded hover:bg-gray-100" style={{ color: '#1F271B' }} aria-label="Close">
            <FiX size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Role name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Field worker" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Description</label>
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this role can do" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Permissions</label>
            <div className="space-y-2 border rounded-lg p-3" style={{ borderColor: '#EAEBED', maxHeight: 200, overflowY: 'auto' }}>
              {allPermissions.map((p) => (
                <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.includes(p.id)}
                    onChange={() => togglePermission(p.id)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: '#28AFB0' }}
                  />
                  <span className="text-sm" style={{ color: '#1F271B' }}>{p.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded text-sm font-medium" style={{ borderColor: '#EAEBED', color: '#1F271B' }}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded text-sm font-medium text-white" style={{ backgroundColor: '#28AFB0' }}>{role ? 'Save' : 'Create role'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TeamSettings({ roleOptions }: { roleOptions: string[] }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<{ id: number; name: string; email: string; phone: string; rut: string; role: string; hasPicture: boolean } | null>(null)
  const [members, setMembers] = useState([
    { id: 1, name: 'Tom Wilson', email: 'tom.wilson@company.com', phone: '+1 234-567-8900', rut: '', role: 'Technician', hasPicture: true },
  ])

  const openAdd = () => {
    setEditingMember(null)
    setModalOpen(true)
  }
  const openEdit = (m: (typeof members)[0]) => {
    setEditingMember(m)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1F271B' }}>Team Management</h1>
        <p className="text-sm mt-1" style={{ color: '#1F271B', opacity: 0.7 }}>
          Business owners can add team members. Assign roles and permissions to each team member.
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
              <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1F271B' }}>Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1F271B' }}>Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1F271B' }}>Role</th>
              <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1F271B' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b" style={{ borderColor: '#EAEBED' }}>
                <td className="px-4 py-3 text-sm" style={{ color: '#1F271B' }}>{m.name}</td>
                <td className="px-4 py-3 text-sm" style={{ color: '#1F271B', opacity: 0.8 }}>{m.email}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: 'rgba(43, 80, 170, 0.2)', color: '#1F3A7A' }}>{m.role}</span>
                </td>
                <td className="px-4 py-3">
                  <button type="button" onClick={() => openEdit(m)} className="text-sm font-medium" style={{ color: '#28AFB0' }}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <AddTeamMemberModal
          roleOptions={roleOptions.length > 0 ? roleOptions : ['Admin / Owner (Service company)', 'Technician']}
          initial={editingMember ?? undefined}
          onClose={() => { setModalOpen(false); setEditingMember(null) }}
          onSave={(member) => {
            const { password: _p, ...rest } = member
            if (editingMember) {
              setMembers((prev) => prev.map((m) => (m.id === editingMember.id ? { ...rest, id: m.id } : m)))
            } else {
              setMembers((prev) => [...prev, { ...rest, id: Math.max(0, ...prev.map((m) => m.id)) + 1 }])
            }
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
    else {
      setSortBy(field)
      setSortAsc(true)
    }
  }

  const openAdd = () => {
    setEditingId(null)
    setModalOpen(true)
  }
  const openEdit = (id: number) => {
    setEditingId(id)
    setModalOpen(true)
  }
  const closeModal = () => {
    setModalOpen(false)
    setEditingId(null)
  }

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
              <th className="px-4 py-3 text-left text-sm font-semibold w-20" style={{ color: '#1F271B' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr className="border-b" style={{ borderColor: '#EAEBED' }}>
                <td className="px-4 py-8 text-sm text-center" style={{ color: '#1F271B', opacity: 0.6 }} colSpan={7}>
                  No items yet. Add items or import to build your master price list.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="border-b" style={{ borderColor: '#EAEBED' }}>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => openEdit(item.id)}
                      className="text-sm font-medium text-left hover:underline"
                      style={{ color: '#2B50AA' }}
                    >
                      {item.name}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm max-w-xs truncate" style={{ color: '#1F271B', opacity: 0.8 }} title={item.description}>
                    {item.description || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#1F271B' }}>{item.type === 'service' ? 'Service' : 'Product'}</td>
                  <td className="px-4 py-3 text-sm text-right" style={{ color: '#1F271B' }}>Rs{item.cost.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-right" style={{ color: '#1F271B' }}>{item.markupPercent}%</td>
                  <td className="px-4 py-3 text-sm text-right font-medium" style={{ color: '#1F271B' }}>Rs{item.price.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => openEdit(item.id)} className="text-sm font-medium" style={{ color: '#28AFB0' }}>
                      Edit
                    </button>
                  </td>
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
