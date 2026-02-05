'use client'

import { useState, useEffect } from 'react'
import { FiSave } from 'react-icons/fi'
import Modal from './Modal'

interface Client {
  id: number
  uniqueIdentifier?: string
  name: string
  phone: string
  email?: string
  documentNumber?: string
  address?: string
  leadSource?: string
  notes?: string
  status?: string
  lastActivity?: string
  tags?: string[]
}

export type NewClientData = {
  name: string
  phone: string
  email?: string
  documentNumber?: string
  address?: string
  leadSource?: string
  notes?: string
}

interface AddClientModalProps {
  isOpen: boolean
  onClose: () => void
  client?: Client
  mode?: 'new' | 'update'
  /** When provided, called with the new client data on save (e.g. to fill a parent form like workorder) */
  onSuccess?: (data: NewClientData) => void
}

export default function AddClientModal({ isOpen, onClose, client, mode = 'new', onSuccess }: AddClientModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    documentNumber: '',
    address: '',
    leadSource: '',
    notes: '',
  })

  useEffect(() => {
    if (isOpen && client && mode === 'update') {
      setFormData({
        name: client.name || '',
        phone: client.phone || '',
        email: client.email || '',
        documentNumber: client.documentNumber || '',
        address: client.address || '',
        leadSource: client.leadSource || '',
        notes: client.notes || '',
      })
    } else if (isOpen && mode === 'new') {
      setFormData({
        name: '',
        phone: '',
        email: '',
        documentNumber: '',
        address: '',
        leadSource: '',
        notes: '',
      })
    }
  }, [isOpen, client, mode])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'new') {
      onSuccess?.({
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        documentNumber: formData.documentNumber || undefined,
        address: formData.address || undefined,
        leadSource: formData.leadSource || undefined,
        notes: formData.notes || undefined,
      })
    }
    alert(mode === 'update' ? 'Client updated successfully! (Static UI)' : 'Client created successfully! (Static UI)')
    onClose()
    if (mode === 'new') {
      setFormData({
        name: '',
        phone: '',
        email: '',
        documentNumber: '',
        address: '',
        leadSource: '',
        notes: '',
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'update' ? 'Update Client' : 'New Client'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#1F271B' }}>
            Name <span style={{ color: '#B084CC' }}>*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter client name"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm"
            style={{ borderColor: '#EAEBED', color: '#1F271B' }}
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#1F271B' }}>
            Phone Number <span style={{ color: '#B084CC' }}>*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 234-567-8900"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm"
            style={{ borderColor: '#EAEBED', color: '#1F271B' }}
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#1F271B' }}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="client@email.com"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm"
            style={{ borderColor: '#EAEBED', color: '#1F271B' }}
          />
          {mode === 'update' && (
            <p className="text-xs mt-1" style={{ color: '#1F271B', opacity: 0.7 }}>
              If you add an email, the client will start receiving emails.
            </p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#1F271B' }}>Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter client address"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm"
            style={{ borderColor: '#EAEBED', color: '#1F271B' }}
          />
        </div>

        {/* Document Number */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#1F271B' }}>Document Number</label>
          <input
            type="text"
            name="documentNumber"
            value={formData.documentNumber}
            onChange={handleChange}
            placeholder="Enter document number"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm"
            style={{ borderColor: '#EAEBED', color: '#1F271B' }}
          />
        </div>

        {/* Lead Source */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#1F271B' }}>Lead Source</label>
          <select
            name="leadSource"
            value={formData.leadSource}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm"
            style={{ borderColor: '#EAEBED', color: '#1F271B' }}
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
          <label className="block text-sm font-medium mb-2" style={{ color: '#1F271B' }}>Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Additional notes about the client"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm"
            style={{ borderColor: '#EAEBED', color: '#1F271B' }}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: '#EAEBED' }}>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border rounded-lg transition-colors text-sm"
            style={{ 
              borderColor: '#EAEBED', 
              color: '#1F271B',
              backgroundColor: 'white'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EAEBED'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm text-white"
            style={{ backgroundColor: '#28AFB0' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1E8A8B'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#28AFB0'}
          >
            <FiSave size={18} />
            {mode === 'update' ? 'Update Client' : 'Save Client'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

