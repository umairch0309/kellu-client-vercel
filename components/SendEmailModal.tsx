'use client'

import { useState, useEffect, useRef } from 'react'
import { FiX, FiFileText } from 'react-icons/fi'
import { mockClients, mockWorkorders } from '@/data/mockData'

export type SendEmailModalType = 'quote' | 'invoice' | 'job-follow' | 'work-order-report'

interface SendEmailModalProps {
  isOpen: boolean
  onClose: () => void
  type: SendEmailModalType
  workorderId: number
  workorderAttachments: File[]
  onAddWorkorderAttachment: (file: File) => void
  onSend: () => void
}

const MAX_ATTACH_MB = 10

export default function SendEmailModal({
  isOpen,
  onClose,
  type,
  workorderId,
  workorderAttachments,
  onAddWorkorderAttachment,
  onSend,
}: SendEmailModalProps) {
  const workorder = mockWorkorders.find(wo => wo.id === workorderId)
  const client = workorder ? mockClients.find(c => c.id === workorder.clientId) : null

  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sendMeCopy, setSendMeCopy] = useState(false)
  const [selectedExisting, setSelectedExisting] = useState<Set<number>>(new Set())
  const [newWorkorderFiles, setNewWorkorderFiles] = useState<File[]>([])
  const [selectedNew, setSelectedNew] = useState<Set<number>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen || !workorder || !client) return
    const totalAmount = workorder.lineItems?.reduce((sum: number, item: any) => sum + item.total, 0) || 0
    if (type === 'quote') {
      setSubject(`Quote from KELLU - ${workorder.title || 'Job'} ${workorder.quoteNumber || `#${workorder.id}`}`)
      setMessage(`Hi ${client.name},

Thank you for asking us to quote on your project.

The quote total is Rs${totalAmount.toFixed(2)} as of ${new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}.

If you have any questions or concerns regarding this quote, please don't hesitate to get in touch with us.

Sincerely,
KELLU`)
    } else if (type === 'invoice') {
      setSubject(`Invoice from KELLU - ${workorder.title || 'Job'} ${workorder.invoiceNumber || `INV-${workorder.id}`}`)
      setMessage(`Hi ${client.name},

Please find attached the invoice for ${workorder.title || 'your job'}.

Total: Rs${totalAmount.toFixed(2)}

Payment details are included in the invoice. Thank you for your business.

Sincerely,
KELLU`)
    } else if (type === 'work-order-report') {
      setSubject(`Work order report – ${workorder.title || 'Job'} #${workorder.id}`)
      setMessage(`Hi ${client.name},

Please find attached the work order report for ${workorder.title || 'your job'} (Job #${workorder.id}).

This report includes photos, notes, and completion details from our team.

If you have any questions, please get in touch.

Sincerely,
KELLU`)
    } else {
      setSubject(`Thank you – feedback for ${workorder.title || 'Job'} #${workorder.id}`)
      setMessage(`Hi ${client.name},

Thank you for choosing us for ${workorder.title || 'your recent job'}. We hope you're satisfied with the work completed.

We'd love to hear your feedback—it helps us improve our service. Please reply with any comments or a quick rating.

Thank you again for your business.

Sincerely,
KELLU`)
    }
    setSelectedExisting(new Set(workorderAttachments.map((_, i) => i)))
    setNewWorkorderFiles([])
    setSelectedNew(new Set())
  }, [isOpen, type, workorderId, workorder, client, workorderAttachments])

  const toggleExisting = (index: number) => {
    setSelectedExisting(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const toggleNew = (index: number) => {
    setSelectedNew(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    let currentMb = [...workorderAttachments, ...newWorkorderFiles].reduce((sum, f) => sum + f.size / (1024 * 1024), 0)
    const toAdd: File[] = []
    for (const file of files) {
      if (currentMb + file.size / (1024 * 1024) > MAX_ATTACH_MB) break
      toAdd.push(file)
      onAddWorkorderAttachment(file)
      currentMb += file.size / (1024 * 1024)
    }
    setNewWorkorderFiles(prev => {
      const next = [...prev, ...toAdd]
      setSelectedNew(prevSet => {
        const s = new Set(prevSet)
        toAdd.forEach((_, i) => s.add(prev.length + i))
        return s
      })
      return next
    })
    e.target.value = ''
  }

  const totalMb = [...workorderAttachments, ...newWorkorderFiles].reduce((sum, f) => sum + f.size / (1024 * 1024), 0)

  const handleSend = () => {
    onSend()
    onClose()
  }

  if (!isOpen) return null
  if (!workorder || !client) return null

  const title =
    type === 'quote'
      ? `Email quote #${workorder.id} to ${client.name}`
      : type === 'invoice'
        ? `Email invoice to ${client.name}`
        : type === 'work-order-report'
          ? `Send work order report to ${client.name}`
          : `Email job follow-up to ${client.name}`

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div
        className="bg-white rounded-lg shadow-xl flex flex-col max-h-[90vh] w-full max-w-4xl overflow-hidden"
        style={{ borderColor: '#EAEBED', border: '1px solid #EAEBED' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: '#EAEBED' }}>
          <h2 className="text-base font-semibold" style={{ color: '#1F271B' }}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded transition-colors hover:bg-gray-100"
            style={{ color: '#1F271B' }}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Body: two columns */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Left: To, Subject, Message, Send me a copy */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 border-r" style={{ borderColor: '#EAEBED' }}>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>To</label>
              <div className="px-3 py-2 border rounded flex items-center gap-2" style={{ borderColor: '#EAEBED', backgroundColor: '#F9FAFB' }}>
                <span className="text-sm" style={{ color: '#1F271B' }}>{client.email || 'No email'}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border rounded text-sm resize-none focus:outline-none focus:ring-2"
                style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              />
              {type === 'quote' && (
                <p className="text-xs mt-1" style={{ color: '#1F271B', opacity: 0.6 }}>
                  Your client will see a button to view the schedule and location of their upcoming appointments in their client hub.
                </p>
              )}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sendMeCopy}
                onChange={(e) => setSendMeCopy(e.target.checked)}
                className="w-4 h-4 rounded"
                style={{ accentColor: '#28AFB0' }}
              />
              <span className="text-sm" style={{ color: '#1F271B' }}>Send me a copy</span>
            </label>
          </div>

          {/* Right: Attachments + Workorder Attachments */}
          <div className="w-80 shrink-0 flex flex-col overflow-hidden border-l" style={{ borderColor: '#EAEBED', backgroundColor: '#FAFAFA' }}>
            <div className="p-3 border-b" style={{ borderColor: '#EAEBED' }}>
              <h3 className="text-xs font-semibold mb-2" style={{ color: '#1F271B' }}>Attachments</h3>
              <p className="text-xs mb-2" style={{ color: '#1F271B', opacity: 0.7 }}>
                Upload within the workorder – select or unselect for this email
              </p>
              <div className="space-y-1.5 max-h-28 overflow-y-auto">
                {workorderAttachments.length === 0 ? (
                  <p className="text-xs" style={{ color: '#1F271B', opacity: 0.6 }}>No attachments yet</p>
                ) : (
                  workorderAttachments.map((file, index) => (
                    <label key={`existing-${index}`} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedExisting.has(index)}
                        onChange={() => toggleExisting(index)}
                        className="w-4 h-4 rounded shrink-0"
                        style={{ accentColor: '#28AFB0' }}
                      />
                      <FiFileText size={14} style={{ color: '#1F271B', opacity: 0.6, flexShrink: 0 }} />
                      <span className="text-xs truncate" style={{ color: '#1F271B' }}>{file.name}</span>
                      <span className="text-xs shrink-0" style={{ color: '#1F271B', opacity: 0.6 }}>
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="flex-1 p-3 flex flex-col min-h-0">
              <h3 className="text-xs font-semibold mb-2" style={{ color: '#1F271B' }}>Workorder Attachments</h3>
              <p className="text-xs mb-2" style={{ color: '#1F271B', opacity: 0.7 }}>
                Add new attachment for this workorder
              </p>
              {newWorkorderFiles.length > 0 && (
                <div className="space-y-1.5 mb-2 max-h-24 overflow-y-auto">
                  {newWorkorderFiles.map((file, index) => (
                    <label key={`new-${index}`} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedNew.has(index)}
                        onChange={() => toggleNew(index)}
                        className="w-4 h-4 rounded shrink-0"
                        style={{ accentColor: '#28AFB0' }}
                      />
                      <FiFileText size={14} style={{ color: '#1F271B', opacity: 0.6, flexShrink: 0 }} />
                      <span className="text-xs truncate" style={{ color: '#1F271B' }}>{file.name}</span>
                      <span className="text-xs shrink-0" style={{ color: '#1F271B', opacity: 0.6 }}>
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </label>
                  ))}
                </div>
              )}
              <div
                className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 flex-1 min-h-[120px] cursor-pointer transition-colors"
                style={{ borderColor: '#EAEBED', backgroundColor: 'white' }}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#28AFB0' }}
                onDragLeave={(e) => { e.currentTarget.style.borderColor = '#EAEBED' }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.currentTarget.style.borderColor = '#EAEBED'
                  const files = Array.from(e.dataTransfer.files)
                  setNewWorkorderFiles(prev => {
                    let currentMb = [...workorderAttachments, ...prev].reduce((sum, f) => sum + f.size / (1024 * 1024), 0)
                    const toAdd: File[] = []
                    for (const f of files) {
                      if (currentMb + f.size / (1024 * 1024) > MAX_ATTACH_MB) break
                      toAdd.push(f)
                      onAddWorkorderAttachment(f)
                      currentMb += f.size / (1024 * 1024)
                    }
                    const next = [...prev, ...toAdd]
                    setSelectedNew(prevSet => {
                      const s = new Set(prevSet)
                      toAdd.forEach((_, i) => s.add(prev.length + i))
                      return s
                    })
                    return next
                  })
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileSelect}
                />
                <span className="text-sm font-medium" style={{ color: '#28AFB0' }}>Upload Files</span>
                <span className="text-xs" style={{ color: '#1F271B', opacity: 0.6 }}>Select or drag files here to upload</span>
              </div>
              <p className="text-xs mt-2" style={{ color: '#1F271B', opacity: 0.6 }}>
                You've attached {totalMb.toFixed(2)} MB of the {MAX_ATTACH_MB}.00 MB limit.
              </p>
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
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            className="px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#28AFB0', color: 'white' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E8A8B' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#28AFB0' }}
          >
            Send Email
          </button>
        </div>
      </div>
    </div>
  )
}
