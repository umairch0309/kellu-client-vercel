'use client'

import { useState } from 'react'
import { FiSave, FiUpload, FiMail, FiMessageCircle } from 'react-icons/fi'

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', label: 'Profile & Company' },
    { id: 'templates', label: 'Templates' },
    { id: 'reminders', label: 'Reminders' },
    { id: 'team', label: 'Team' },
    { id: 'services', label: 'Services/Products' },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-2xl md:text-3xl font-bold text-neutral-dark">Settings</h1>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-light overflow-hidden">
        <div className="border-b border-neutral-light">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-neutral-dark/70 hover:text-neutral-dark'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 md:p-6" style={{ minHeight: '400px' }}>
          {/* Profile & Company */}
          <div style={{ display: activeTab === 'profile' ? 'block' : 'none' }}>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-neutral-dark mb-4">Company Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-2">Company Legal Name</label>
                    <input
                      type="text"
                      defaultValue="ABC Services Inc."
                      className="w-full px-4 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-2">Company Address</label>
                    <input
                      type="text"
                      defaultValue="123 Business St, City, State 12345"
                      className="w-full px-4 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-2">Phone Number</label>
                    <input
                      type="tel"
                      defaultValue="+1 234-567-8900"
                      className="w-full px-4 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue="contact@company.com"
                      className="w-full px-4 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-2">Tax ID (VAT/IVA)</label>
                    <input
                      type="text"
                      defaultValue="12-3456789-0"
                      className="w-full px-4 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-2">Default Tax Rate (%)</label>
                    <input
                      type="number"
                      defaultValue="19"
                      className="w-full px-4 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-neutral-dark mb-4">Company Logo</h2>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-neutral-light rounded-lg flex items-center justify-center">
                    <span className="text-neutral-dark/50">Logo</span>
                  </div>
                  <button className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-colors flex items-center gap-2">
                    <FiUpload size={18} />
                    <span>Upload Logo</span>
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-neutral-dark mb-4">Bank Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-2">Bank</label>
                    <input
                      type="text"
                      defaultValue="First National Bank"
                      className="w-full px-4 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-2">Account Type</label>
                    <select className="w-full px-4 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>Checking</option>
                      <option>Savings</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-2">Account Number</label>
                    <input
                      type="text"
                      defaultValue="1234567890"
                      className="w-full px-4 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-2">Email for Payment Notifications</label>
                    <input
                      type="email"
                      defaultValue="payments@company.com"
                      className="w-full px-4 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-neutral-dark mb-4">Terms & Conditions</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-2">Quote Terms & Conditions</label>
                    <textarea
                      rows={4}
                      defaultValue="Payment terms: Net 30 days..."
                      className="w-full px-4 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-2">Invoice Terms & Conditions</label>
                    <textarea
                      rows={4}
                      defaultValue="Payment due within 3 days..."
                      className="w-full px-4 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-dark mb-2">Invoice Due (days)</label>
                    <input
                      type="number"
                      defaultValue="3"
                      className="w-full px-4 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <button className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-colors flex items-center gap-2">
                <FiSave size={18} />
                <span>Save Changes</span>
              </button>
            </div>
          </div>

          {/* Templates */}
          <div style={{ display: activeTab === 'templates' ? 'block' : 'none' }}>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-neutral-dark mb-4">Email Templates</h2>
                <div className="space-y-4">
                  {['Quote', 'Invoice', 'Booking Confirmation', 'Quote Follow Up', 'Invoice Follow Up', 'Workorder Report'].map((template) => (
                    <div key={template} className="border border-neutral-light rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-neutral-dark">{template}</h3>
                        <div className="flex gap-2">
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span className="flex items-center gap-1">
                              <FiMail size={14} />
                              Email
                            </span>
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" className="rounded" />
                            <span className="flex items-center gap-1">
                              <FiMessageCircle size={14} />
                              WhatsApp
                            </span>
                          </label>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-sm font-medium text-neutral-dark mb-1">Subject</label>
                          <input
                            type="text"
                            defaultValue={`${template} from ABC Services`}
                            className="w-full px-3 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-dark mb-1">Message</label>
                          <textarea
                            rows={4}
                            defaultValue={`Dear {client_name},...`}
                            className="w-full px-3 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                          />
                        </div>
                        <button className="text-sm text-primary hover:text-primary-dark">Reset to Default</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Reminders */}
          <div style={{ display: activeTab === 'reminders' ? 'block' : 'none' }}>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-neutral-dark mb-4">Reminder Settings</h2>
                <div className="space-y-4">
                  <div className="border border-neutral-light rounded-lg p-4">
                    <h3 className="font-semibold text-neutral-dark mb-3">Quote Reminders</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span>Enable Reminders</span>
                        </label>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-dark mb-1">Reminder 1</label>
                          <div className="flex gap-2">
                            <input type="number" defaultValue="48" className="w-20 px-2 py-1 border border-neutral-light rounded text-sm" />
                            <select className="flex-1 px-2 py-1 border border-neutral-light rounded text-sm">
                              <option>hours</option>
                              <option>days</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-dark mb-1">Reminder 2</label>
                          <div className="flex gap-2">
                            <input type="number" defaultValue="120" className="w-20 px-2 py-1 border border-neutral-light rounded text-sm" />
                            <select className="flex-1 px-2 py-1 border border-neutral-light rounded text-sm">
                              <option>hours</option>
                              <option>days</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-neutral-light rounded-lg p-4">
                    <h3 className="font-semibold text-neutral-dark mb-3">Booking Confirmation Reminder</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span>Enable Reminders</span>
                        </label>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-dark mb-1">Before Appointment</label>
                          <div className="flex gap-2">
                            <input type="number" defaultValue="2" className="w-20 px-2 py-1 border border-neutral-light rounded text-sm" />
                            <select className="flex-1 px-2 py-1 border border-neutral-light rounded text-sm">
                              <option>days</option>
                              <option>hours</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-dark mb-1">Time</label>
                          <input type="time" defaultValue="18:00" className="w-full px-2 py-1 border border-neutral-light rounded text-sm" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-neutral-light rounded-lg p-4">
                    <h3 className="font-semibold text-neutral-dark mb-3">Invoice Reminders</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span>Enable Reminders</span>
                        </label>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-dark mb-1">Reminder 1 (Day Due)</label>
                          <input type="checkbox" defaultChecked className="rounded" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-dark mb-1">Reminder 2 (After Due)</label>
                          <div className="flex gap-2">
                            <input type="number" defaultValue="2" className="w-20 px-2 py-1 border border-neutral-light rounded text-sm" />
                            <span className="text-sm self-center">days after</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Team */}
          <div style={{ display: activeTab === 'team' ? 'block' : 'none' }}>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-neutral-dark">Team Members</h2>
                <button className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-colors">
                  Add Team Member
                </button>
              </div>
              <div className="border border-neutral-light rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-neutral-light">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Role</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-neutral-light">
                      <td className="px-4 py-3 text-sm text-neutral-dark">Tom Wilson</td>
                      <td className="px-4 py-3 text-sm text-neutral-dark/70">tom.wilson@company.com</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">Technician</span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-sm text-primary hover:text-primary-dark">Edit</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Services/Products */}
          <div style={{ display: activeTab === 'services' ? 'block' : 'none' }}>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-neutral-dark">Master Price List</h2>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-neutral-light text-neutral-dark rounded-lg hover:bg-neutral-dark/10 transition-colors">
                    Import
                  </button>
                  <button className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-colors">
                    Add Item
                  </button>
                </div>
              </div>
              <div className="border border-neutral-light rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-neutral-light">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Description</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Cost</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Markup %</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Price</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

