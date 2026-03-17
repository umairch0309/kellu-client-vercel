'use client'

import { FiSave, FiUpload, FiZap } from 'react-icons/fi'
import { sectionTitleClass, labelClass, inputClass } from './settingsTypes'

const MOCK_BANKS = ['Banco de Chile', 'Banco Estado', 'Scotiabank', 'BCI', 'Santander', 'Itaú', 'Other']

export default function CompanySettings() {
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
