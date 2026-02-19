'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiSave, FiChevronLeft } from 'react-icons/fi'
import { mockClients } from '@/data/mockData'

interface EditClientFormProps {
  clientId: number
}

export default function EditClientForm({ clientId }: EditClientFormProps) {
  const router = useRouter()
  const client = mockClients.find(c => c.id === clientId)
  
  const [formData, setFormData] = useState({
    uniqueIdentifier: '',
    name: '',
    phone: '',
    email: '',
    documentNumber: '',
    leadSource: '',
    notes: '',
    lastActivity: '',
    status: 'Active',
  })

  useEffect(() => {
    if (client) {
      setFormData({
        uniqueIdentifier: client.uniqueIdentifier || '',
        name: client.name || '',
        phone: client.phone || '',
        email: client.email || '',
        documentNumber: client.documentNumber || '',
        leadSource: client.leadSource || '',
        notes: client.notes || '',
        lastActivity: client.lastActivity || '',
        status: client.status || 'Active',
      })
    }
  }, [client])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would save to the backend
    alert('Client updated successfully! (Static UI)')
    router.push('/clients')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleCancel = () => {
    router.push(`/clients/${clientId}`)
  }

  if (!client) {
    return (
      <div className="space-y-3">
        <div className="max-w-2xl mx-auto">
          <p style={{ color: '#1F271B' }}>Client not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="p-1.5 hover:bg-opacity-50 rounded transition-colors"
            style={{ backgroundColor: '#EAEBED' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <FiChevronLeft size={18} style={{ color: '#1F271B' }} />
          </button>
          <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#1F271B' }}>Edit Client</h1>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded shadow-sm border p-3 max-w-2xl mx-auto" style={{ borderColor: '#EAEBED' }}>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Unique Identifier - for internal purposes only, not shown elsewhere */}
          <div>
            <label className="block text-[10px] font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>
              Unique Identifier <span className="font-normal opacity-70">(For internal purposes only)</span>
            </label>
            <input
              type="text"
              name="uniqueIdentifier"
              value={formData.uniqueIdentifier}
              onChange={handleChange}
              placeholder="e.g., CL-001"
              className="w-full px-2.5 py-1 border rounded focus:outline-none focus:ring-2 text-xs transition-all"
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

          {/* Name */}
          <div>
            <label className="block text-[10px] font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>
              Name <span style={{ color: '#B084CC' }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter client name"
              className="w-full px-2.5 py-1 border rounded focus:outline-none focus:ring-2 text-xs transition-all"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              required
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

          {/* Phone Number */}
          <div>
            <label className="block text-[10px] font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>
              Phone Number <span style={{ color: '#B084CC' }}>*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 234-567-8900"
              className="w-full px-2.5 py-1 border rounded focus:outline-none focus:ring-2 text-xs transition-all"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              required
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

          {/* Email */}
          <div>
            <label className="block text-[10px] font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="client@email.com"
              className="w-full px-2.5 py-1 border rounded focus:outline-none focus:ring-2 text-xs transition-all"
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
            <p className="text-[9px] mt-0.5" style={{ color: '#1F271B', opacity: 0.6 }}>
              Optional - If you add an email, the client will start receiving emails.
            </p>
          </div>

          {/* Document Number */}
          <div>
            <label className="block text-[10px] font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>
              Document Number
            </label>
            <input
              type="text"
              name="documentNumber"
              value={formData.documentNumber}
              onChange={handleChange}
              placeholder="Enter document number"
              className="w-full px-2.5 py-1 border rounded focus:outline-none focus:ring-2 text-xs transition-all"
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

          {/* Lead Source */}
          <div>
            <label className="block text-[10px] font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>
              Lead Source
            </label>
            <select
              name="leadSource"
              value={formData.leadSource}
              onChange={handleChange}
              className="w-full px-2.5 py-1 border rounded focus:outline-none focus:ring-2 text-xs transition-all"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#28AFB0'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#EAEBED'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <option value="">Select lead source</option>
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
              <option value="Social Media">Social Media</option>
              <option value="Advertisement">Advertisement</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              placeholder="Additional notes about the client"
              className="w-full px-2.5 py-1 border rounded focus:outline-none focus:ring-2 text-xs transition-all resize-none"
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

          {/* Last Activity */}
          <div>
            <label className="block text-[10px] font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>
              Last Activity
            </label>
            <input
              type="text"
              name="lastActivity"
              value={formData.lastActivity}
              onChange={handleChange}
              placeholder="e.g., 27 minutes ago"
              className="w-full px-2.5 py-1 border rounded focus:outline-none focus:ring-2 text-xs transition-all"
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

          {/* Status */}
          <div>
            <label className="block text-[10px] font-medium mb-1" style={{ color: '#1F271B', opacity: 0.7 }}>
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-2.5 py-1 border rounded focus:outline-none focus:ring-2 text-xs transition-all"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#28AFB0'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#EAEBED'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <option value="Active">Active</option>
              <option value="Archived">Archived</option>
              <option value="Follow Up">Follow Up</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: '#EAEBED' }}>
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1 border rounded transition-all text-xs"
              style={{ 
                borderColor: '#EAEBED', 
                color: '#1F271B',
                backgroundColor: 'white'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#EAEBED'
                e.currentTarget.style.borderColor = '#D1D5DB'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white'
                e.currentTarget.style.borderColor = '#EAEBED'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 rounded transition-all flex items-center gap-1.5 text-xs text-white shadow-sm hover:shadow-md"
              style={{ backgroundColor: '#28AFB0' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1E8A8B'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#28AFB0'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <FiSave size={14} />
              <span>Update Client</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
