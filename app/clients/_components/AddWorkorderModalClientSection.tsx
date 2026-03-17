'use client'

import { FiPlus } from 'react-icons/fi'
import type { AddWorkorderFormData } from './addWorkorderModalTypes'
import type { ClientOption } from './addWorkorderModalTypes'

export interface AddWorkorderModalClientSectionProps {
  formData: AddWorkorderFormData
  setFormData: React.Dispatch<React.SetStateAction<AddWorkorderFormData>>
  onFieldChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  isClientDropdownOpen: boolean
  setIsClientDropdownOpen: (v: boolean) => void
  clientDropdownRef: React.RefObject<HTMLDivElement>
  filteredClients: ClientOption[]
  onOpenAddClient: () => void
}

export default function AddWorkorderModalClientSection({
  formData,
  setFormData,
  onFieldChange,
  isClientDropdownOpen,
  setIsClientDropdownOpen,
  clientDropdownRef,
  filteredClients,
  onOpenAddClient,
}: AddWorkorderModalClientSectionProps) {
  return (
    <div className="relative space-y-1.5" ref={clientDropdownRef}>
      <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Search client or address</label>
      <input
        type="text"
        name="client"
        value={formData.client}
        onChange={(e) => {
          onFieldChange(e)
          setIsClientDropdownOpen(true)
        }}
        onFocus={() => setIsClientDropdownOpen(true)}
        placeholder="Search client or address"
        className="w-full px-2 py-1.5 border border-neutral-light rounded focus:outline-none focus:ring-1 focus:ring-primary text-sm"
        style={{ borderColor: '#EAEBED' }}
      />
      {isClientDropdownOpen && (
        <div className="absolute z-10 w-full mt-0.5 bg-white border rounded shadow-lg max-h-48 overflow-y-auto" style={{ borderColor: '#EAEBED' }}>
          {filteredClients.map((client) => (
            <button
              key={client.id}
              type="button"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  client: client.name,
                  address: client.address || prev.address,
                }))
                setIsClientDropdownOpen(false)
              }}
              className="w-full text-left px-2 py-2 text-sm hover:bg-gray-50 border-b"
              style={{ color: '#1F271B', borderBottomColor: '#EAEBED' }}
            >
              {client.address && <div className="font-medium">{client.address}</div>}
              <div className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>
                {client.name}{client.phone ? ` | ${client.phone}` : ''}
              </div>
            </button>
          ))}
          <button
            type="button"
            onClick={() => { setIsClientDropdownOpen(false); onOpenAddClient() }}
            className="w-full flex items-center justify-center gap-1.5 px-2 py-2 text-sm font-medium transition-colors"
            style={{ color: '#28AFB0' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white' }}
          >
            <FiPlus size={14} />
            <span>New client</span>
          </button>
        </div>
      )}
    </div>
  )
}
