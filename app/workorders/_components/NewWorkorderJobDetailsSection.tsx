'use client'

import { FiPlus } from 'react-icons/fi'

export interface ClientOption {
  id: number | string
  name: string
  phone?: string
  email?: string
}

export interface NewWorkorderJobDetailsSectionProps {
  title: string
  clientId: number | string | null
  clientName: string
  address: string
  onFieldChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  clientSearchTerm: string
  setClientSearchTerm: (v: string) => void
  isClientDropdownOpen: boolean
  setIsClientDropdownOpen: (v: boolean) => void
  clientDropdownRef: React.RefObject<HTMLDivElement>
  filteredClients: ClientOption[]
  onClientSelect: (clientId: number | string, clientName: string) => void
  onOpenAddClient: () => void
  clientsLoading?: boolean
}

const inputFocusStyles = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = '#28AFB0'
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)'
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = '#EAEBED'
    e.currentTarget.style.boxShadow = 'none'
  },
}

export default function NewWorkorderJobDetailsSection({
  title,
  clientId,
  clientName,
  address,
  onFieldChange,
  clientSearchTerm,
  setClientSearchTerm,
  isClientDropdownOpen,
  setIsClientDropdownOpen,
  clientDropdownRef,
  filteredClients,
  onClientSelect,
  onOpenAddClient,
  clientsLoading = false,
}: NewWorkorderJobDetailsSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
      <h2 className="text-sm font-semibold mb-3" style={{ color: '#1F271B' }}>Job Details</h2>
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>Title <span style={{ color: '#B91C1C' }}>*</span></label>
            <input
              type="text"
              name="title"
              value={title}
              onChange={onFieldChange}
              placeholder="Enter job title"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              required
              {...inputFocusStyles}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>Select a client <span style={{ color: '#B91C1C' }}>*</span></label>
            <div className="relative" ref={clientDropdownRef}>
              <input
                type="text"
                value={clientSearchTerm || clientName}
                onChange={(e) => {
                  setClientSearchTerm(e.target.value)
                  setIsClientDropdownOpen(true)
                }}
                placeholder="Search client..."
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all"
                style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                required
                onFocus={(e) => {
                  setIsClientDropdownOpen(true)
                  inputFocusStyles.onFocus(e)
                }}
                onBlur={inputFocusStyles.onBlur}
              />
              {isClientDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg flex flex-col" style={{ borderColor: '#EAEBED', maxHeight: '12rem' }}>
                  <div className="overflow-y-auto flex-1 min-h-0">
                    {clientsLoading ? (
                      <div className="px-3 py-4 text-center text-xs" style={{ color: '#6B7280' }}>Loading clients…</div>
                    ) : filteredClients.length === 0 ? (
                      <div className="px-3 py-4 text-center text-xs" style={{ color: '#6B7280' }}>No clients found</div>
                    ) : (
                      filteredClients.map((client) => (
                        <button
                          key={client.id}
                          type="button"
                          onClick={() => onClientSelect(client.id, client.name)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-opacity-50 transition-colors border-b"
                          style={{
                            color: '#1F271B',
                            backgroundColor: String(clientId) === String(client.id) ? '#F3F4F6' : 'white',
                            borderBottomColor: '#EAEBED',
                          }}
                          onMouseEnter={(e) => {
                            if (String(clientId) !== String(client.id)) e.currentTarget.style.backgroundColor = '#F9FAFB'
                          }}
                          onMouseLeave={(e) => {
                            if (String(clientId) !== String(client.id)) e.currentTarget.style.backgroundColor = 'white'
                          }}
                        >
                          <div className="font-medium">{client.name}</div>
                          {client.phone != null && client.phone !== '' && (
                            <div className="text-xs" style={{ color: '#1F271B', opacity: 0.6 }}>{client.phone}</div>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors flex-shrink-0 border-t"
                    style={{ color: '#28AFB0', borderColor: '#EAEBED' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white' }}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setIsClientDropdownOpen(false)
                      onOpenAddClient()
                    }}
                  >
                    <FiPlus size={14} />
                    <span>Create a new client</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>Address <span style={{ color: '#B91C1C' }}>*</span></label>
            <p className="text-[10px] mb-1" style={{ color: '#1F271B', opacity: 0.6 }}>Fetched from last registered workorder or task of selected client</p>
            <input
              type="text"
              name="address"
              value={address}
              onChange={onFieldChange}
              placeholder="Enter property address"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              {...inputFocusStyles}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
