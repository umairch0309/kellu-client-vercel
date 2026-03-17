'use client'

import { useState } from 'react'
import { FiSave } from 'react-icons/fi'
import { getStoredLocale, LOCALE_STORAGE_KEY, sectionTitleClass, type AppLocale } from './settingsTypes'

export default function LanguageSettings() {
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
