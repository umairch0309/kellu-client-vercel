'use client'

import { useState } from 'react'
import { FiSave, FiEye, FiRotateCcw, FiMail, FiBell, FiDroplet, FiShield, FiSettings } from 'react-icons/fi'

type TabId = 'email' | 'notifications' | 'branding' | 'security' | 'defaults'

const tabs: { value: TabId; label: string; icon: React.ReactNode }[] = [
  { value: 'email', label: 'Email Templates', icon: <FiMail size={11} /> },
  { value: 'notifications', label: 'Notification Rules', icon: <FiBell size={11} /> },
  { value: 'branding', label: 'Branding', icon: <FiDroplet size={11} /> },
  { value: 'security', label: 'Security Policies', icon: <FiShield size={11} /> },
  { value: 'defaults', label: 'Default Business Settings', icon: <FiSettings size={11} /> },
]

const notificationRules = [
  { id: 'new_business', label: 'New Business Registration', description: 'Notify admins when a new business signs up' },
  { id: 'failed_login', label: 'Failed Login Attempts', description: 'Alert on multiple failed login attempts' },
  { id: 'high_value', label: 'High-Value Transactions', description: 'Notify on transactions over $10,000' },
]

export function AdminPlatformSettings() {
  const [activeTab, setActiveTab] = useState<TabId>('email')
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    new_business: true,
    failed_login: true,
    high_value: true,
  })
  const [require2fa, setRequire2fa] = useState(true)

  const toggleNotification = (id: string) =>
    setNotifications(prev => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#1F271B' }}>Platform Settings</h1>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded shadow-sm border p-3" style={{ borderColor: '#EAEBED', marginTop: '2rem' }}>
        {/* Tabs */}
        <div className="flex border-b mb-3 overflow-x-auto" style={{ borderColor: '#EAEBED' }}>
          {tabs.map(tab => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className="px-3 py-2 text-xs font-medium transition-all relative whitespace-nowrap flex items-center gap-1.5"
              style={{
                color: '#1F271B',
                opacity: activeTab === tab.value ? 1 : 0.5,
              }}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.value && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: '#28AFB0' }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="pt-1">

          {/* Email Templates */}
          {activeTab === 'email' && (
            <div className="space-y-4 max-w-2xl">
              <div className="rounded border overflow-hidden" style={{ borderColor: '#EAEBED' }}>
                <div className="px-3 py-2" style={{ backgroundColor: '#F3F4F6' }}>
                  <p className="text-[10px] font-semibold" style={{ color: '#1F271B' }}>Welcome Email</p>
                </div>
                <div className="p-3 space-y-3">
                  <div>
                    <label className="block text-[10px] font-semibold mb-1" style={{ color: '#1F271B' }}>Subject Line</label>
                    <input
                      type="text"
                      defaultValue="Welcome to Kellu!"
                      className="w-full px-2.5 py-1.5 border rounded text-xs focus:outline-none transition-all"
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
                  <div>
                    <label className="block text-[10px] font-semibold mb-1" style={{ color: '#1F271B' }}>Email Body</label>
                    <textarea
                      defaultValue="Welcome to Kellu! We're excited to have you on board..."
                      rows={7}
                      className="w-full px-2.5 py-1.5 border rounded text-xs focus:outline-none transition-all resize-none"
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
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-medium transition-all shadow-sm"
                  style={{ borderColor: '#EAEBED', color: '#1F271B', backgroundColor: '#F3F4F6' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#EAEBED' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
                >
                  <FiEye size={12} />
                  Preview
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all shadow-sm hover:shadow-md"
                  style={{ backgroundColor: '#28AFB0', color: 'white' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E8A8B' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#28AFB0' }}
                >
                  <FiSave size={12} />
                  Save Template
                </button>
              </div>
            </div>
          )}

          {/* Notification Rules */}
          {activeTab === 'notifications' && (
            <div className="max-w-2xl">
              <div className="rounded border overflow-hidden" style={{ borderColor: '#EAEBED' }}>
                <div className="px-3 py-2" style={{ backgroundColor: '#F3F4F6' }}>
                  <p className="text-[10px] font-semibold" style={{ color: '#1F271B' }}>Notification Rules</p>
                </div>
                {notificationRules.map((rule, idx) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between px-3 py-2.5 border-t transition-colors"
                    style={{ borderColor: '#EAEBED' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white' }}
                  >
                    <div>
                      <p className="text-xs font-medium" style={{ color: '#1F271B' }}>{rule.label}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: '#1F271B', opacity: 0.6 }}>{rule.description}</p>
                    </div>
                    {/* Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleNotification(rule.id)}
                      className="relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors"
                      style={{ backgroundColor: notifications[rule.id] ? '#28AFB0' : '#D1D5DB' }}
                    >
                      <span
                        className="inline-block h-3 w-3 rounded-full bg-white shadow transition-transform"
                        style={{ transform: notifications[rule.id] ? 'translateX(14px)' : 'translateX(2px)' }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Branding */}
          {activeTab === 'branding' && (
            <div className="space-y-4 max-w-2xl">
              <div className="rounded border overflow-hidden" style={{ borderColor: '#EAEBED' }}>
                <div className="px-3 py-2" style={{ backgroundColor: '#F3F4F6' }}>
                  <p className="text-[10px] font-semibold" style={{ color: '#1F271B' }}>Branding</p>
                </div>
                <div className="p-3 space-y-3">
                  <div>
                    <label className="block text-[10px] font-semibold mb-1" style={{ color: '#1F271B' }}>Platform Name</label>
                    <input
                      type="text"
                      defaultValue="Kellu"
                      className="w-full px-2.5 py-1.5 border rounded text-xs focus:outline-none transition-all"
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
                  <div>
                    <label className="block text-[10px] font-semibold mb-1" style={{ color: '#1F271B' }}>Primary Brand Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        defaultValue="#28AFB0"
                        className="h-8 w-14 rounded border cursor-pointer"
                        style={{ borderColor: '#EAEBED', padding: '2px' }}
                      />
                      <input
                        type="text"
                        defaultValue="#28AFB0"
                        className="flex-1 px-2.5 py-1.5 border rounded text-xs focus:outline-none transition-all"
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
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-medium transition-all shadow-sm"
                  style={{ borderColor: '#EAEBED', color: '#1F271B', backgroundColor: '#F3F4F6' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#EAEBED' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
                >
                  <FiRotateCcw size={12} />
                  Reset
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all shadow-sm hover:shadow-md"
                  style={{ backgroundColor: '#28AFB0', color: 'white' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E8A8B' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#28AFB0' }}
                >
                  <FiSave size={12} />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Security Policies */}
          {activeTab === 'security' && (
            <div className="space-y-4 max-w-2xl">
              <div className="rounded border overflow-hidden" style={{ borderColor: '#EAEBED' }}>
                <div className="px-3 py-2" style={{ backgroundColor: '#F3F4F6' }}>
                  <p className="text-[10px] font-semibold" style={{ color: '#1F271B' }}>Security Policies</p>
                </div>
                <div className="p-3 space-y-3">
                  <div>
                    <label className="block text-[10px] font-semibold mb-1" style={{ color: '#1F271B' }}>Password Minimum Length</label>
                    <input
                      type="number"
                      defaultValue={8}
                      className="w-full px-2.5 py-1.5 border rounded text-xs focus:outline-none transition-all"
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
                  <div>
                    <label className="block text-[10px] font-semibold mb-1" style={{ color: '#1F271B' }}>Session Timeout (minutes)</label>
                    <input
                      type="number"
                      defaultValue={60}
                      className="w-full px-2.5 py-1.5 border rounded text-xs focus:outline-none transition-all"
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
                </div>
                {/* 2FA Toggle Row */}
                <div
                  className="flex items-center justify-between px-3 py-2.5 border-t transition-colors"
                  style={{ borderColor: '#EAEBED' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white' }}
                >
                  <div>
                    <p className="text-xs font-medium" style={{ color: '#1F271B' }}>Require Two-Factor Authentication</p>
                    <p className="text-[10px] mt-0.5" style={{ color: '#1F271B', opacity: 0.6 }}>Enforce 2FA for all admin accounts</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRequire2fa(p => !p)}
                    className="relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors"
                    style={{ backgroundColor: require2fa ? '#28AFB0' : '#D1D5DB' }}
                  >
                    <span
                      className="inline-block h-3 w-3 rounded-full bg-white shadow transition-transform"
                      style={{ transform: require2fa ? 'translateX(14px)' : 'translateX(2px)' }}
                    />
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all shadow-sm hover:shadow-md"
                  style={{ backgroundColor: '#28AFB0', color: 'white' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E8A8B' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#28AFB0' }}
                >
                  <FiSave size={12} />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Default Business Settings */}
          {activeTab === 'defaults' && (
            <div className="space-y-4 max-w-2xl">
              <div className="rounded border overflow-hidden" style={{ borderColor: '#EAEBED' }}>
                <div className="px-3 py-2" style={{ backgroundColor: '#F3F4F6' }}>
                  <p className="text-[10px] font-semibold" style={{ color: '#1F271B' }}>Default Business Settings</p>
                </div>
                <div className="p-3 space-y-3">
                  <div>
                    <label className="block text-[10px] font-semibold mb-1" style={{ color: '#1F271B' }}>Default Currency</label>
                    <input
                      type="text"
                      defaultValue="USD"
                      className="w-full px-2.5 py-1.5 border rounded text-xs focus:outline-none transition-all"
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
                  <div>
                    <label className="block text-[10px] font-semibold mb-1" style={{ color: '#1F271B' }}>Default Time Zone</label>
                    <input
                      type="text"
                      defaultValue="America/New_York"
                      className="w-full px-2.5 py-1.5 border rounded text-xs focus:outline-none transition-all"
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
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all shadow-sm hover:shadow-md"
                  style={{ backgroundColor: '#28AFB0', color: 'white' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E8A8B' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#28AFB0' }}
                >
                  <FiSave size={12} />
                  Save Changes
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}