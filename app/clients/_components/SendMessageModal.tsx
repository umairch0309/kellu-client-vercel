'use client'

import { useState, useEffect, useRef } from 'react'
import { FiX, FiMail } from 'react-icons/fi'
import { format } from 'date-fns'
import { mockClients } from '@/data/mockData'

const MESSAGE_TEMPLATES = {
  'Maintenance follow-up': {
    subject: 'Maintenance follow-up from {{COMPANY_NAME}}',
    message: `Hi {{CLIENT_NAME}},

This is a friendly reminder about your scheduled maintenance.

If you have any questions, contact us at {{DEFAULT_EMAIL}}.

Best regards,
{{COMPANY_NAME}}`,
  },
  'Send Offer': {
    subject: 'Special offer from {{COMPANY_NAME}} - {{CURRENT_DATE}}',
    message: `Hi {{CLIENT_NAME}},

We have a special offer for you.

Get in touch with us at {{DEFAULT_EMAIL}} to learn more.

Sincerely,
{{COMPANY_NAME}}`,
  },
} as const

type TemplateKey = keyof typeof MESSAGE_TEMPLATES

const VARIABLES = [
  { label: 'Client name', value: '{{CLIENT_NAME}}' },
  { label: 'Company name', value: '{{COMPANY_NAME}}' },
  { label: 'Current date', value: '{{CURRENT_DATE}}' },
  { label: 'Default email', value: '{{DEFAULT_EMAIL}}' },
]

function renderPreview(text: string, clientName: string): string {
  return text
    .replace(/\{\{CLIENT_NAME\}\}/g, clientName)
    .replace(/\{\{COMPANY_NAME\}\}/g, 'Ernies Plumbers Homeland')
    .replace(/\{\{CURRENT_DATE\}\}/g, format(new Date(), 'MMM d, yyyy'))
    .replace(/\{\{DEFAULT_EMAIL\}\}/g, 'alexys52@edmondventures.com')
}

interface SendMessageModalProps {
  isOpen: boolean
  onClose: () => void
  clientIds: (number | string)[]
  onSent?: () => void
}

export default function SendMessageModal({
  isOpen,
  onClose,
  clientIds,
  onSent,
}: SendMessageModalProps) {
  const [template, setTemplate] = useState<TemplateKey>('Maintenance follow-up')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sendMeCopy, setSendMeCopy] = useState(false)
  const [isVariableDropdownOpen, setIsVariableDropdownOpen] = useState(false)
  const messageRef = useRef<HTMLTextAreaElement>(null)
  const variableDropdownRef = useRef<HTMLDivElement>(null)

  const clients = clientIds
    .map(id => mockClients.find(c => c.id === id || String(c.id) === String(id)))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
  const isMultiple = clients.length > 1
  const previewClientName = clients[0]?.name ?? 'Client'
  const previewSubject = renderPreview(subject, previewClientName)
  const previewMessage = renderPreview(message, previewClientName)

  useEffect(() => {
    if (!isOpen) return
    setTemplate('Maintenance follow-up')
    const def = MESSAGE_TEMPLATES['Maintenance follow-up']
    setSubject(def.subject)
    setMessage(def.message)
    setSendMeCopy(false)
    setIsVariableDropdownOpen(false)
  }, [isOpen, clientIds.join(',')])

  useEffect(() => {
    const def = MESSAGE_TEMPLATES[template]
    setSubject(def.subject)
    setMessage(def.message)
  }, [template])

  const handleReset = () => {
    const def = MESSAGE_TEMPLATES[template]
    setSubject(def.subject)
    setMessage(def.message)
  }

  const insertVariable = (variable: string) => {
    const ta = messageRef.current
    if (ta) {
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const before = message.slice(0, start)
      const after = message.slice(end)
      setMessage(before + variable + after)
      setIsVariableDropdownOpen(false)
      setTimeout(() => { ta.focus(); ta.setSelectionRange(start + variable.length, start + variable.length) }, 0)
    } else {
      setMessage(prev => prev + variable)
      setIsVariableDropdownOpen(false)
    }
  }

  const handleSend = () => {
    if (isMultiple) {
      alert(`Sent communication to all ${clients.length} selected clients. (Static UI)`)
    } else if (clients.length === 1) {
      alert(`Sent communication to ${clients[0].name}. (Static UI)`)
    }
    onSent?.()
    onClose()
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (variableDropdownRef.current && !variableDropdownRef.current.contains(e.target as Node)) {
        setIsVariableDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" aria-modal="true">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div
        className="relative bg-white rounded-lg shadow-xl border w-full max-w-4xl max-h-[90vh] flex flex-col"
        style={{ borderColor: '#EAEBED' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header: title + template dropdown */}
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: '#EAEBED' }}>
          <div className="flex items-center gap-3 flex-wrap">
            <FiMail size={18} style={{ color: '#28AFB0' }} />
            <h2 className="text-lg font-semibold" style={{ color: '#1F271B' }}>
              {isMultiple ? 'Send message to selected clients' : 'Send message'}
            </h2>
            <select
              value={template}
              onChange={e => setTemplate(e.target.value as TemplateKey)}
              className="px-3 py-1.5 border rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#28AFB0]"
              style={{ borderColor: '#EAEBED', color: '#1F271B', backgroundColor: 'white' }}
            >
              <option value="Maintenance follow-up">Maintenance follow-up</option>
              <option value="Send Offer">Send Offer</option>
            </select>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
            style={{ color: '#1F271B' }}
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Two columns: Edit (left) + Preview (right) */}
        <div className="flex-1 overflow-hidden flex min-h-0">
          {/* Left: Edit */}
          <div className="flex-1 overflow-y-auto p-4 border-r flex flex-col gap-4" style={{ borderColor: '#EAEBED', minWidth: 0 }}>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>To</label>
              <div className="px-3 py-2 border rounded text-sm" style={{ borderColor: '#EAEBED', backgroundColor: '#F9FAFB', color: '#1F271B' }}>
                {isMultiple
                  ? `${clients.map(c => c.name).join(', ')} (${clients.filter(c => c.email).length} with email)`
                  : (clients[0]?.email || clients[0]?.name || 'No recipient')}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Subject</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Message subject"
                className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#28AFB0]"
                style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Message</label>
              <textarea
                ref={messageRef}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Your message..."
                rows={10}
                className="w-full px-3 py-2 border rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#28AFB0]"
                style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 border rounded text-xs font-medium transition-colors"
                style={{ borderColor: '#EAEBED', color: '#1F271B', backgroundColor: 'white' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white' }}
              >
                Reset
              </button>
              <div className="relative" ref={variableDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsVariableDropdownOpen(prev => !prev)}
                  className="px-3 py-1.5 border rounded text-xs font-medium transition-colors"
                  style={{ borderColor: '#EAEBED', color: '#28AFB0', backgroundColor: 'white' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white' }}
                >
                  Insert Variable
                </button>
                {isVariableDropdownOpen && (
                  <div
                    className="absolute left-0 top-full mt-1 z-10 bg-white border rounded shadow-lg py-1 min-w-[180px]"
                    style={{ borderColor: '#EAEBED' }}
                  >
                    {VARIABLES.map(({ label, value }, i) => (
                      <span key={value}>
                        {i > 0 && <div className="mx-2 border-t" style={{ borderStyle: 'dashed', borderColor: '#EAEBED' }} />}
                        <button
                          type="button"
                          onClick={() => insertVariable(value)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50"
                          style={{ color: '#1F271B' }}
                        >
                          {label} ({value})
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sendMeCopy}
                onChange={e => setSendMeCopy(e.target.checked)}
                className="w-4 h-4 rounded"
                style={{ accentColor: '#28AFB0' }}
              />
              <span className="text-xs" style={{ color: '#1F271B' }}>Send me a copy</span>
            </label>
          </div>

          {/* Right: Preview */}
          <div className="w-80 flex-shrink-0 flex flex-col border-l" style={{ borderColor: '#EAEBED', backgroundColor: '#F9FAFB' }}>
            <div className="px-3 py-2 border-b text-xs font-semibold" style={{ borderColor: '#EAEBED', color: '#1F271B' }}>
              Preview
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              <div>
                <p className="text-[10px] font-medium mb-0.5" style={{ color: '#1F271B', opacity: 0.7 }}>Subject</p>
                <p className="text-sm" style={{ color: '#1F271B' }}>{previewSubject || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium mb-0.5" style={{ color: '#1F271B', opacity: 0.7 }}>Message</p>
                <div className="text-sm whitespace-pre-wrap rounded p-2 bg-white border" style={{ color: '#1F271B', borderColor: '#EAEBED' }}>
                  {previewMessage || '—'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t shrink-0" style={{ borderColor: '#EAEBED' }}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded text-sm font-medium transition-colors"
            style={{ borderColor: '#EAEBED', color: '#1F271B', backgroundColor: 'white' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            className="px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#28AFB0', color: 'white' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1E8A8B' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#28AFB0' }}
          >
            <FiMail size={14} />
            Send message
          </button>
        </div>
      </div>
    </div>
  )
}
