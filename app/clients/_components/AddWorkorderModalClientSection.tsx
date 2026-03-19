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
  /** Opens embedded add-client modal (workorder / quote flows) */
  onOpenAddClient: () => void
  /** When `invoice`, label/placeholder and list layout match new-invoice requirements */
  clientSearchVariant?: 'default' | 'invoice'
  clientsLoading?: boolean
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
  clientSearchVariant = 'default',
  clientsLoading = false,
}: AddWorkorderModalClientSectionProps) {
  const invoice = clientSearchVariant === 'invoice'
  const label = invoice ? (
    <span>
      Search client <span className="text-red-500">*</span>
    </span>
  ) : (
    'Search client or address'
  )
  const placeholder = invoice ? 'Search client' : 'Search client or address'

  const handleNewClient = () => {
    setIsClientDropdownOpen(false)
    onOpenAddClient()
  }

  return (
    <div className="relative space-y-1.5" ref={clientDropdownRef}>
      <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>
        {label}
      </label>
      <input
        type="text"
        name="client"
        value={formData.client}
        onChange={(e) => {
          onFieldChange(e)
          if (invoice) {
            setFormData((prev) => ({ ...prev, clientId: null }))
          }
          setIsClientDropdownOpen(true)
        }}
        onFocus={() => setIsClientDropdownOpen(true)}
        placeholder={placeholder}
        className="w-full px-2 py-1.5 border border-neutral-light rounded focus:outline-none focus:ring-1 focus:ring-primary text-sm"
        style={{ borderColor: '#EAEBED' }}
      />
      {isClientDropdownOpen && (
        <div
          className="absolute z-10 w-full mt-0.5 bg-white border rounded shadow-lg max-h-48 overflow-y-auto"
          style={{ borderColor: '#EAEBED' }}
        >
          {clientsLoading && (
            <div className="px-2 py-3 text-sm" style={{ color: '#6B7280' }}>
              Loading clients…
            </div>
          )}
          {!clientsLoading ? (
            filteredClients.map((client) => (
              <button
                key={String(client.id)}
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    client: client.name,
                    clientId: invoice ? client.id : prev.clientId,
                    address: client.address || prev.address,
                  }))
                  setIsClientDropdownOpen(false)
                }}
                className="w-full text-left px-2 py-2 text-sm hover:bg-gray-50 border-b"
                style={{ color: '#1F271B', borderBottomColor: '#EAEBED' }}
              >
                {invoice ? (
                  <>
                    <div className="font-medium">{client.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#1F271B', opacity: 0.7 }}>
                      {[client.address, client.phone, client.email].filter(Boolean).join(' · ') || '—'}
                    </div>
                  </>
                ) : (
                  <>
                    {client.address && <div className="font-medium">{client.address}</div>}
                    <div className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>
                      {client.name}
                      {client.phone ? ` | ${client.phone}` : ''}
                    </div>
                  </>
                )}
              </button>
            ))
          ) : null}
          {!clientsLoading && filteredClients.length === 0 && (
            <div className="px-2 py-3 text-sm" style={{ color: '#6B7280' }}>
              No clients match your search.
            </div>
          )}
          <button
            type="button"
            onClick={handleNewClient}
            className="w-full flex items-center justify-center gap-1.5 px-2 py-2 text-sm font-medium transition-colors"
            style={{ color: '#28AFB0' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F3F4F6'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white'
            }}
          >
            <FiPlus size={14} />
            <span>New client</span>
          </button>
        </div>
      )}
    </div>
  )
}
