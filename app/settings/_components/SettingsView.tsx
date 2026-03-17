'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { SIDEBAR_ITEMS, VALID_SECTIONS, type SettingsSection } from './settingsTypes'
import CompanySettings from './CompanySettings'
import ScheduleSettings from './ScheduleSettings'
import ServicesSettings from './ServicesSettings'
import CommunicationsSettings from './CommunicationsSettings'
import TeamSettings from './TeamSettings'
import RolesPermissionsSettings from './RolesPermissionsSettings'

// Re-export for consumers that imported from SettingsView
export type { RoleDef, AppLocale } from './settingsTypes'
export { getStoredLocale } from './settingsTypes'

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
