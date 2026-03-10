'use client'

import { useState, useEffect, useRef } from 'react'
import { FiX, FiFileText } from 'react-icons/fi'
import { mockClients, mockWorkorders } from '@/data/mockData'

export type SendEmailModalType = 'quote' | 'invoice' | 'job-follow' | 'work-order-report'

// Read default "Send via WhatsApp" from settings (e.g. Communications). Default true.
const SEND_WHATSAPP_SETTINGS_KEY = 'kellu_send_whatsapp_default'
function getDefaultSendWhatsApp(): boolean {
  if (typeof window === 'undefined') return true
  const v = localStorage.getItem(SEND_WHATSAPP_SETTINGS_KEY)
  return v === null ? true : v === 'true'
}

// From / Reply To: from Settings (Company email). Non-editable in modal.
const COMPANY_EMAIL_SETTINGS_KEY = 'kellu_company_email'
function getCompanyEmail(): string {
  if (typeof window === 'undefined') return 'company@example.com'
  return localStorage.getItem(COMPANY_EMAIL_SETTINGS_KEY) || 'company@example.com'
}

interface SendEmailModalProps {
  isOpen: boolean
  onClose: () => void
  type: SendEmailModalType
  workorderId: number
  workorderAttachments: File[]
  onAddWorkorderAttachment: (file: File) => void
  /** When bulk (workorderIds), called with the list of selected workorder IDs to send. Otherwise called with no args. */
  onSend: (selectedWorkorderIds?: number[]) => void
  /** Initial state for "Send via WhatsApp" from settings. If not provided, reads from localStorage. */
  defaultSendWhatsApp?: boolean
  /** When provided and length > 1, bulk quote send: To = all clients' emails; right panel = one Quote PDF per work order (each sent only to that client). */
  workorderIds?: number[]
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
  defaultSendWhatsApp,
  workorderIds,
}: SendEmailModalProps) {
  const isBulkQuote = type === 'quote' && workorderIds != null && workorderIds.length > 1
  const bulkList = isBulkQuote && workorderIds
    ? workorderIds
        .map(id => {
          const wo = mockWorkorders.find(w => w.id === id)
          const cl = wo ? mockClients.find(c => c.id === wo.clientId) : null
          return wo && cl ? { workorderId: id, workorder: wo, client: cl } : null
        })
        .filter((x): x is { workorderId: number; workorder: typeof mockWorkorders[0]; client: typeof mockClients[0] } => x != null)
    : []

  const workorder = mockWorkorders.find(wo => wo.id === workorderId)
  const client = workorder ? mockClients.find(c => c.id === workorder.clientId) : null

  const [toEmail, setToEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sendMeCopy, setSendMeCopy] = useState(false)
  const [sendWhatsApp, setSendWhatsApp] = useState(() => defaultSendWhatsApp ?? getDefaultSendWhatsApp())
  const [selectedExisting, setSelectedExisting] = useState<Set<number>>(new Set())
  const [newWorkorderFiles, setNewWorkorderFiles] = useState<File[]>([])
  const [selectedNew, setSelectedNew] = useState<Set<number>>(new Set())
  const [selectedBulkWorkorderIds, setSelectedBulkWorkorderIds] = useState<Set<number>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isBulkQuote && bulkList.length > 0) {
      setToEmail(bulkList.map(b => b.client.email).filter(Boolean).join(', '))
      setSelectedBulkWorkorderIds(new Set(bulkList.map(b => b.workorderId)))
      setSubject(`Quotes from KELLU – ${bulkList.length} quote${bulkList.length !== 1 ? 's' : ''}`)
      setMessage(`Hi,\n\nPlease find attached your quotation(s).\n\nIf you have any questions, please get in touch.\n\nSincerely,\nKELLU`)
      setSendWhatsApp(defaultSendWhatsApp ?? getDefaultSendWhatsApp())
      return
    }
    if (!isOpen || !workorder || !client) return
    setToEmail(client.email || '')
    setSendWhatsApp(defaultSendWhatsApp ?? getDefaultSendWhatsApp())
    const totalAmount = workorder.total ?? (workorder.lineItems?.reduce((sum: number, item: any) => sum + item.total, 0) || 0)
    const paymentsTotal = (workorder.payments && Array.isArray(workorder.payments))
      ? workorder.payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) : 0
    const balance = totalAmount - paymentsTotal
    const hasPayments = paymentsTotal > 0
    const totalPaymentsBalanceBlock = hasPayments
      ? `\nTotal: Rs${totalAmount.toFixed(2)}\nPayments: Rs${paymentsTotal.toFixed(2)}\nBalance: Rs${balance.toFixed(2)}\n`
      : `\nTotal: Rs${totalAmount.toFixed(2)}\n`
    if (type === 'quote') {
      setSubject(`Quote from KELLU - ${workorder.title || 'Job'} ${workorder.quoteNumber || `#${workorder.id}`}`)
      setMessage(`Hi ${client.name},

Thank you for asking us to quote on your project.

The quote amounts are as follows (as of ${new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}):${totalPaymentsBalanceBlock}
If you have any questions or concerns regarding this quote, please don't hesitate to get in touch with us.

Sincerely,
KELLU`)
    } else if (type === 'invoice') {
      setSubject(`Invoice from KELLU - ${workorder.title || 'Job'} ${workorder.invoiceNumber || `INV-${workorder.id}`}`)
      setMessage(`Hi ${client.name},

Please find attached the invoice for ${workorder.title || 'your job'}.${totalPaymentsBalanceBlock}
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
    // Attachments from Workorder: quote excludes invoice; job-follow excludes quote & invoice; invoice shows all
    const forEmail =
      type === 'quote'
        ? workorderAttachments.filter(f => !/invoice/i.test(f.name))
        : type === 'job-follow'
          ? workorderAttachments.filter(f => !/quote/i.test(f.name) && !/invoice/i.test(f.name))
          : workorderAttachments
    setSelectedExisting(new Set(Array.from({ length: forEmail.length }, (_, i) => i)))
    setNewWorkorderFiles([])
    setSelectedNew(new Set())
  }, [isOpen, type, workorderId, workorder, client, workorderAttachments, isBulkQuote, bulkList.length])

  // Attachments from Workorder: quote excludes invoice; job-follow excludes quote & invoice; invoice shows all
  const attachmentsForEmail =
    type === 'quote'
      ? workorderAttachments.filter(f => !/invoice/i.test(f.name))
      : type === 'job-follow'
        ? workorderAttachments.filter(f => !/quote/i.test(f.name) && !/invoice/i.test(f.name))
        : workorderAttachments
  const allExistingItems: { name: string; size: number }[] = attachmentsForEmail.map(f => ({ name: f.name, size: f.size }))

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
    if (isBulkQuote) {
      onSend(Array.from(selectedBulkWorkorderIds))
    } else {
      onSend()
    }
    onClose()
  }

  const toggleBulkQuote = (id: number) => {
    setSelectedBulkWorkorderIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (!isOpen) return null
  if (!isBulkQuote && (!workorder || !client)) return null

  const title = isBulkQuote
    ? `Send quotes (${bulkList.length} recipient${bulkList.length !== 1 ? 's' : ''})`
    : type === 'quote'
      ? `Email quote #${workorder!.id} to ${client!.name}`
      : type === 'invoice'
        ? `Email invoice to ${client!.name}`
        : type === 'work-order-report'
          ? `Send work order report to ${client!.name}`
          : `Email job follow-up to ${client!.name}`

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
          {/* Left: From, Reply To, To, Subject, Message, Send me a copy */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 border-r" style={{ borderColor: '#EAEBED' }}>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>From (Sender)</label>
              <input
                type="email"
                value={getCompanyEmail()}
                readOnly
                className="w-full px-3 py-2 border rounded text-sm bg-gray-50"
                style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Reply To</label>
              <input
                type="email"
                value={getCompanyEmail()}
                readOnly
                className="w-full px-3 py-2 border rounded text-sm bg-gray-50"
                style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              />
              <p className="text-xs mt-1" style={{ color: '#1F271B', opacity: 0.6 }}>Company email from Settings</p>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>To</label>
              <input
                type="email"
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                placeholder="Client email"
                className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              />
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
              {type === 'quote' && (
                <p className="text-xs mt-1" style={{ color: '#1F271B', opacity: 0.6 }}>Default from Template</p>
              )}
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
            <div className="flex flex-wrap gap-x-6 gap-y-2">
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
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendWhatsApp}
                  onChange={(e) => setSendWhatsApp(e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: '#28AFB0' }}
                />
                <span className="text-sm" style={{ color: '#1F271B' }}>Send via WhatsApp</span>
              </label>
            </div>
          </div>

          {/* Right: Bulk Quote PDFs (one per recipient) or Attachments + Additional attachments */}
          <div className="w-80 shrink-0 flex flex-col overflow-hidden border-l" style={{ borderColor: '#EAEBED', backgroundColor: '#FAFAFA' }}>
            {isBulkQuote ? (
              <div className="p-3 flex-1 flex flex-col min-h-0 overflow-hidden">
                <h3 className="text-xs font-semibold mb-2" style={{ color: '#1F271B' }}>Quote PDFs</h3>
                <p className="text-xs mb-2" style={{ color: '#1F271B', opacity: 0.7 }}>
                  Review or uncheck. Each PDF is sent only to its intended recipient.
                </p>
                <div className="space-y-1.5 flex-1 overflow-y-auto min-h-0">
                  {bulkList.map(({ workorderId: wid, workorder: wo, client: cl }) => (
                    <label key={wid} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBulkWorkorderIds.has(wid)}
                        onChange={() => toggleBulkQuote(wid)}
                        className="w-4 h-4 rounded shrink-0"
                        style={{ accentColor: '#28AFB0' }}
                      />
                      <FiFileText size={14} style={{ color: '#1F271B', opacity: 0.6, flexShrink: 0 }} />
                      <span className="text-xs truncate" style={{ color: '#1F271B' }}>
                        Quote {(wo as any).quoteNumber || `#${wid}`} – {cl.name} – {(wo as any).title || 'Job'}.pdf
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <>
            <div className="p-3 border-b" style={{ borderColor: '#EAEBED' }}>
              <h3 className="text-xs font-semibold mb-2" style={{ color: '#1F271B' }}>Attachments</h3>
              <p className="text-xs mb-2" style={{ color: '#1F271B', opacity: 0.7 }}>
                From the work order – select or unselect for this email
              </p>
              <div className="space-y-1.5 max-h-28 overflow-y-auto">
                {allExistingItems.length === 0 ? (
                  <p className="text-xs" style={{ color: '#1F271B', opacity: 0.6 }}>No attachments yet</p>
                ) : (
                  allExistingItems.map((item, index) => (
                    <label key={`existing-${index}`} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedExisting.has(index)}
                        onChange={() => toggleExisting(index)}
                        className="w-4 h-4 rounded shrink-0"
                        style={{ accentColor: '#28AFB0' }}
                      />
                      <FiFileText size={14} style={{ color: '#1F271B', opacity: 0.6, flexShrink: 0 }} />
                      <span className="text-xs truncate" style={{ color: '#1F271B' }}>{item.name}</span>
                      <span className="text-xs shrink-0" style={{ color: '#1F271B', opacity: 0.6 }}>
                        {item.size === 0 ? '0.0 KB' : `${(item.size / 1024).toFixed(1)} KB`}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="flex-1 p-3 flex flex-col min-h-0">
              <h3 className="text-xs font-semibold mb-2" style={{ color: '#1F271B' }}>Additional attachments</h3>
              <p className="text-xs mb-2" style={{ color: '#1F271B', opacity: 0.7 }}>
                Add attachments to send with this email (not part of the work order)
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
              </>
            )}
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
            disabled={isBulkQuote && selectedBulkWorkorderIds.size === 0}
            className="px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#28AFB0', color: 'white' }}
            onMouseEnter={(e) => { if (!(isBulkQuote && selectedBulkWorkorderIds.size === 0)) e.currentTarget.style.backgroundColor = '#1E8A8B' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#28AFB0' }}
          >
            {isBulkQuote ? 'Send all' : 'Send Email'}
          </button>
        </div>
      </div>
    </div>
  )
}
