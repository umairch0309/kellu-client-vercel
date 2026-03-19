'use client'

import { useState, useEffect } from 'react'
import { FiSave, FiUser, FiPhone, FiMail, FiFileText, FiMessageSquare } from 'react-icons/fi'
import Modal from './Modal'

interface Client {
  id: number | string
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
  /** When provided, called after a new client is created (e.g. to refetch the clients list) */
  onCreated?: () => void
  /** When provided, called after a client is updated (e.g. to refetch the clients list) */
  onUpdated?: () => void
}

export default function AddClientModal({ isOpen, onClose, client, mode = 'new', onSuccess, onCreated, onUpdated }: AddClientModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    documentNumber: '',
    leadSource: '',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && client && mode === 'update') {
      setFormData({
        name: client.name || '',
        phone: client.phone || '',
        email: client.email || '',
        documentNumber: client.documentNumber || '',
        leadSource: client.leadSource || '',
        notes: client.notes || '',
      })
      setSubmitError(null)
    } else if (isOpen && mode === 'new') {
      setFormData({
        name: '',
        phone: '',
        email: '',
        documentNumber: '',
        leadSource: '',
        notes: '',
      })
      setSubmitError(null)
    }
  }, [isOpen, client, mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (mode === 'new') {
      setIsSubmitting(true)
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
      const body: Record<string, string> = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
      }
      if (formData.email.trim()) body.email = formData.email.trim()
      if (formData.documentNumber.trim()) body.documentNumber = formData.documentNumber.trim()
      if (formData.leadSource.trim()) body.leadSource = formData.leadSource.trim()
      if (formData.notes.trim()) body.notes = formData.notes.trim()
      try {
        const res = await fetch(`${baseUrl}/api/clients`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          const message = (data as { message?: string }).message ?? `Request failed (${res.status})`
          setSubmitError(message)
          return
        }
        onSuccess?.({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || undefined,
          documentNumber: formData.documentNumber.trim() || undefined,
          leadSource: formData.leadSource.trim() || undefined,
          notes: formData.notes.trim() || undefined,
        })
        onCreated?.()
        setFormData({ name: '', phone: '', email: '', documentNumber: '', leadSource: '', notes: '' })
        onClose()
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Failed to create client')
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    // Update mode: PATCH /api/clients/{clientId}
    if (!client?.id) return
    setIsSubmitting(true)
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    const body: Record<string, string> = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
    }
    if (formData.email.trim()) body.email = formData.email.trim()
    if (formData.documentNumber.trim()) body.documentNumber = formData.documentNumber.trim()
    if (formData.leadSource.trim()) body.leadSource = formData.leadSource.trim()
    if (formData.notes.trim()) body.notes = formData.notes.trim()
    try {
      const res = await fetch(`${baseUrl}/api/clients/${client.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message = (data as { message?: string }).message ?? `Request failed (${res.status})`
        setSubmitError(message)
        return
      }
      onUpdated?.()
      setFormData({ name: '', phone: '', email: '', documentNumber: '', leadSource: '', notes: '' })
      onClose()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to update client')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const inputBase = 'w-full px-3.5 py-2.5 border rounded-lg text-sm transition-all placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-0'
  const inputStyle = { borderColor: '#EAEBED', color: '#1F271B' }
  const focusRing = 'focus:ring-[#28AFB0] focus:border-[#28AFB0]'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'update' ? 'Update Client' : 'Add Client'} size="md" maxHeight="80vh">
      <form onSubmit={handleSubmit} className="flex flex-col min-h-0">
        {submitError && (
          <div className="mb-4 px-3 py-2 rounded-lg text-sm bg-red-50 border border-red-200" style={{ color: '#B91C1C' }}>
            {submitError}
          </div>
        )}
        <div className="space-y-6 pb-1">
          {/* Contact details */}
          <section className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#1F271B' }}>
              <span className="flex items-center justify-center w-7 h-7 rounded-lg" style={{ backgroundColor: 'rgba(40, 175, 176, 0.12)' }}>
                <FiUser size={14} style={{ color: '#28AFB0' }} />
              </span>
              Contact details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B', opacity: 0.85 }}>
                  Name <span style={{ color: '#B084CC' }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John Smith"
                  className={`${inputBase} ${focusRing}`}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B', opacity: 0.85 }}>
                  Phone <span style={{ color: '#B084CC' }}>*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 234-567-8900"
                  className={`${inputBase} ${focusRing}`}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B', opacity: 0.85 }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="client@email.com"
                  className={`${inputBase} ${focusRing}`}
                  style={inputStyle}
                />
                {mode === 'update' && (
                  <p className="text-[11px] mt-1" style={{ color: '#1F271B', opacity: 0.6 }}>
                    Client will receive emails if set.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Details */}
          <section className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#1F271B' }}>
              <span className="flex items-center justify-center w-7 h-7 rounded-lg" style={{ backgroundColor: 'rgba(40, 175, 176, 0.12)' }}>
                <FiFileText size={14} style={{ color: '#28AFB0' }} />
              </span>
              Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B', opacity: 0.85 }}>
                  Document number
                </label>
                <input
                  type="text"
                  name="documentNumber"
                  value={formData.documentNumber}
                  onChange={handleChange}
                  placeholder="Optional"
                  className={`${inputBase} ${focusRing}`}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B', opacity: 0.85 }}>
                  Lead source
                </label>
                <select
                  name="leadSource"
                  value={formData.leadSource}
                  onChange={handleChange}
                  className={`${inputBase} ${focusRing}`}
                  style={inputStyle}
                >
                  <option value="">Select source</option>
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Advertisement">Advertisement</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </section>

          {/* Notes */}
          <section className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#1F271B' }}>
              <span className="flex items-center justify-center w-7 h-7 rounded-lg" style={{ backgroundColor: 'rgba(40, 175, 176, 0.12)' }}>
                <FiMessageSquare size={14} style={{ color: '#28AFB0' }} />
              </span>
              Notes
            </h3>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B', opacity: 0.85 }}>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Internal notes about this client (optional)"
                className={`${inputBase} resize-none ${focusRing}`}
                style={inputStyle}
              />
            </div>
          </section>
        </div>

        {/* Actions */}
        <div
          className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-5 mt-2 border-t flex-shrink-0"
          style={{ borderColor: '#EAEBED' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border rounded-lg text-sm font-medium transition-colors order-2 sm:order-1"
            style={{ borderColor: '#EAEBED', color: '#1F271B', backgroundColor: 'white' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F3F4F6'
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
            disabled={mode === 'new' ? isSubmitting : false}
            className="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 text-white order-1 sm:order-2 disabled:opacity-70 disabled:pointer-events-none"
            style={{ backgroundColor: '#28AFB0' }}
            onMouseEnter={(e) => {
              if (!(mode === 'new' && isSubmitting)) {
                e.currentTarget.style.backgroundColor = '#1E8A8B'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#28AFB0'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <FiSave size={16} />
            {mode === 'update' ? 'Update Client' : isSubmitting ? 'Saving…' : 'Save Client'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

