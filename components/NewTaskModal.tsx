'use client'

import { useState, useRef, useEffect } from 'react'
import { FiX, FiChevronDown } from 'react-icons/fi'
import { format, addDays } from 'date-fns'
import { mockClients, mockTeamMembers } from '@/data/mockData'

interface NewTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (task: { title: string; clientName: string; address: string; instructions: string; assignedTo: string; startDate: string; startTime: string; endTime: string; anytime: boolean }) => void
}

const inputStyle = {
  borderColor: '#EAEBED',
  color: '#1F271B',
}
const focusRing = 'focus:outline-none focus:ring-2 focus:ring-[#28AFB0] focus:border-[#28AFB0]'

export default function NewTaskModal({ isOpen, onClose, onSave }: NewTaskModalProps) {
  const defaultStart = addDays(new Date(), 3)
  const [clientSearch, setClientSearch] = useState('')
  const [showClientDropdown, setShowClientDropdown] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null)
  const [address, setAddress] = useState('')
  const [title, setTitle] = useState('')
  const [instructions, setInstructions] = useState('')
  const [showInstructions, setShowInstructions] = useState(false)
  const [assignedTo, setAssignedTo] = useState('')
  const [showAssignDropdown, setShowAssignDropdown] = useState(false)
  const [startDate, setStartDate] = useState(format(defaultStart, 'yyyy-MM-dd'))
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [anytime, setAnytime] = useState(false)
  const [showMoreOptions, setShowMoreOptions] = useState(false)
  const clientDropdownRef = useRef<HTMLDivElement>(null)
  const assignRef = useRef<HTMLDivElement>(null)

  const filteredClients = mockClients.filter(
    c =>
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      (c.address || '').toLowerCase().includes(clientSearch.toLowerCase())
  )
  const selectedClient = selectedClientId ? mockClients.find(c => c.id === selectedClientId) : null

  useEffect(() => {
    if (selectedClient) {
      setAddress(selectedClient.address || '')
      setClientSearch(selectedClient.name)
    }
  }, [selectedClientId])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(e.target as Node)) setShowClientDropdown(false)
      if (assignRef.current && !assignRef.current.contains(e.target as Node)) setShowAssignDropdown(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (!isOpen) return null

  const handleSave = () => {
    const clientName = selectedClient?.name || clientSearch || ''
    onSave?.({
      title: title || 'Untitled Task',
      clientName,
      address,
      instructions,
      assignedTo,
      startDate,
      startTime,
      endTime: anytime ? '' : endTime,
      anytime,
    })
    onClose()
    setClientSearch('')
    setSelectedClientId(null)
    setAddress('')
    setTitle('')
    setInstructions('')
    setShowInstructions(false)
    setAssignedTo('')
    setStartDate(format(defaultStart, 'yyyy-MM-dd'))
    setStartTime('09:00')
    setEndTime('10:00')
    setAnytime(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        style={{ border: '1px solid #EAEBED' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: '#EAEBED' }}>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold" style={{ color: '#1F271B' }}>New Task</h2>
            <button
              type="button"
              className="p-1 rounded hover:bg-gray-100"
              style={{ color: '#1F271B' }}
              title="Task options"
            >
              <FiChevronDown size={18} />
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-gray-100"
            style={{ color: '#1F271B' }}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div ref={clientDropdownRef} className="relative">
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Search client or address</label>
            <input
              type="text"
              value={clientSearch}
              onChange={(e) => {
                setClientSearch(e.target.value)
                setShowClientDropdown(true)
                if (!e.target.value) setSelectedClientId(null)
              }}
              onFocus={() => setShowClientDropdown(true)}
              placeholder="Search client or address."
              className={`w-full px-3 py-2 border rounded text-sm ${focusRing}`}
              style={inputStyle}
            />
            {showClientDropdown && (clientSearch || filteredClients.length > 0) && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto" style={{ borderColor: '#EAEBED' }}>
                {filteredClients.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedClientId(c.id)
                      setShowClientDropdown(false)
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                    style={{ color: '#1F271B' }}
                  >
                    <div className="font-medium">{c.name}</div>
                    {c.address && <div className="text-xs opacity-70">{c.address}</div>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className="text-sm font-medium"
            style={{ color: '#28AFB0' }}
            onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline' }}
            onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none' }}
          >
            + Create client or address
          </button>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address"
              className={`w-full px-3 py-2 border rounded text-sm ${focusRing}`}
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className={`w-full px-3 py-2 border rounded text-sm ${focusRing}`}
              style={inputStyle}
            />
          </div>

          {!showInstructions ? (
            <button
              type="button"
              className="text-sm font-medium"
              style={{ color: '#28AFB0' }}
              onClick={() => setShowInstructions(true)}
              onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline' }}
              onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none' }}
            >
              + Add Instructions
            </button>
          ) : (
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Instructions</label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Add instructions..."
                rows={3}
                className={`w-full px-3 py-2 border rounded text-sm resize-none ${focusRing}`}
                style={inputStyle}
              />
            </div>
          )}

          <div ref={assignRef} className="relative">
            <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Assign</label>
            <button
              type="button"
              onClick={() => setShowAssignDropdown(!showAssignDropdown)}
              className="w-full px-3 py-2 border rounded text-sm text-left flex items-center justify-between"
              style={{ borderColor: '#EAEBED', color: assignedTo ? '#1F271B' : '#9CA3AF' }}
            >
              <span>{assignedTo || '+ Assign'}</span>
              <FiChevronDown size={16} style={{ opacity: 0.6 }} />
            </button>
            {showAssignDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg py-1" style={{ borderColor: '#EAEBED' }}>
                <button
                  type="button"
                  onClick={() => { setAssignedTo(''); setShowAssignDropdown(false) }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                  style={{ color: '#1F271B' }}
                >
                  None
                </button>
                {mockTeamMembers.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => { setAssignedTo(m.name); setShowAssignDropdown(false) }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                    style={{ color: '#1F271B' }}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Scheduling */}
          <div className="pt-3 border-t space-y-3" style={{ borderColor: '#EAEBED' }}>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full px-3 py-2 border rounded text-sm ${focusRing}`}
                style={inputStyle}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Start</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={anytime}
                  className={`w-full px-3 py-2 border rounded text-sm disabled:opacity-60 disabled:bg-gray-50 ${focusRing}`}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>End</label>
                <div className="relative">
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    disabled={anytime}
                    className={`w-full px-3 py-2 border rounded text-sm disabled:opacity-60 disabled:bg-gray-50 pr-8 ${focusRing}`}
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => setEndTime('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100"
                    style={{ color: '#1F271B' }}
                    title="Clear end time"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={anytime}
                onChange={(e) => setAnytime(e.target.checked)}
                className="w-4 h-4 rounded"
                style={{ accentColor: '#28AFB0' }}
              />
              <span className="text-sm" style={{ color: '#1F271B' }}>Anytime</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t shrink-0" style={{ borderColor: '#EAEBED' }}>
          <button
            type="button"
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            className="px-4 py-2 border rounded text-sm font-medium"
            style={{ borderColor: '#EAEBED', color: '#1F271B', backgroundColor: 'white' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white' }}
          >
            More Options
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded text-sm font-medium text-white"
            style={{ backgroundColor: '#28AFB0' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E8A8B' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#28AFB0' }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
