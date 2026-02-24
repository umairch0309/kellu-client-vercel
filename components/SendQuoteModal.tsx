'use client'

import { useState, useEffect } from 'react'
import { FiX, FiDownload, FiPaperclip, FiMail, FiMessageCircle, FiFileText } from 'react-icons/fi'
import { format } from 'date-fns'

interface SendQuoteModalProps {
  isOpen: boolean
  onClose: () => void
  workorder: any
  client: any
  onQuoteSent: (quotePdfLink: string) => void
}

function buildQuoteEmailMessage(workorder: any, client: any) {
  const totalAmount = workorder?.total ?? (workorder?.lineItems?.reduce((sum: number, item: any) => sum + item.total, 0) || 0)
  const paymentsTotal = (workorder?.payments && Array.isArray(workorder.payments))
    ? workorder.payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) : 0
  const balance = totalAmount - paymentsTotal
  const hasPayments = paymentsTotal > 0
  const totalsBlock = hasPayments
    ? `Total: Rs${totalAmount.toFixed(2)}\nPayments: Rs${paymentsTotal.toFixed(2)}\nBalance: Rs${balance.toFixed(2)}`
    : `Total: Rs${totalAmount.toFixed(2)}`
  return `Dear ${client?.name || 'Client'},

Please find attached the quotation for ${workorder?.title || 'your job'}.

Line Items:
${workorder?.lineItems?.map((item: any) => `- ${item.name}: ${item.quantity} x Rs${item.unitPrice.toFixed(2)} = Rs${item.total.toFixed(2)}`).join('\n') || ''}

${totalsBlock}

Payment Information:
Please make payment via bank transfer or check. Payment details will be provided upon approval.

Thank you for your business.

Best regards`
}

export default function SendQuoteModal({ isOpen, onClose, workorder, client, onQuoteSent }: SendQuoteModalProps) {
  const [emailMessage, setEmailMessage] = useState(() => (workorder && client ? buildQuoteEmailMessage(workorder, client) : ''))
  const [subject, setSubject] = useState(() => `Quotation for ${workorder?.title || 'Job'} - ${workorder?.quoteNumber || `Q-${workorder?.id}`}`)
  const [sender, setSender] = useState('company@example.com') // Should come from Settings
  const [replyTo, setReplyTo] = useState('company@example.com') // Should come from Settings
  const [sendMeCopy, setSendMeCopy] = useState(false)
  const [sendWhatsApp, setSendWhatsApp] = useState(false)
  const [attachments, setAttachments] = useState<string[]>([])
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [quotePdfLink, setQuotePdfLink] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && workorder && client) {
      setEmailMessage(buildQuoteEmailMessage(workorder, client))
      setSubject(`Quotation for ${workorder.title || 'Job'} - ${workorder.quoteNumber || `Q-${workorder.id}`}`)
    }
  }, [isOpen, workorder, client])

  if (!isOpen) return null

  const handleGeneratePdf = () => {
    setIsGeneratingPdf(true)
    // Simulate PDF generation
    setTimeout(() => {
      const pdfLink = `/quotes/${workorder?.quoteNumber || `Q-${workorder?.id}`}.pdf`
      setQuotePdfLink(pdfLink)
      setIsGeneratingPdf(false)
    }, 1000)
  }

  const handleSendQuote = () => {
    if (!quotePdfLink) {
      handleGeneratePdf()
      setTimeout(() => {
        const pdfLink = `/quotes/${workorder?.quoteNumber || `Q-${workorder?.id}`}.pdf`
        setQuotePdfLink(pdfLink)
        onQuoteSent(pdfLink)
        onClose()
      }, 1500)
    } else {
      onQuoteSent(quotePdfLink)
      onClose()
    }
  }

  const handleAddAttachment = () => {
    // Simulate file upload
    const newAttachment = `attachment_${attachments.length + 1}.pdf`
    setAttachments([...attachments, newAttachment])
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" style={{ borderColor: '#EAEBED' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderBottomColor: '#EAEBED' }}>
          <h2 className="text-lg font-semibold" style={{ color: '#1F271B' }}>Send Quote</h2>
          <button
            onClick={onClose}
            className="p-1 rounded transition-colors"
            style={{ color: '#1F271B', opacity: 0.6 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1'
              e.currentTarget.style.backgroundColor = '#F3F4F6'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.6'
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Generate PDF Section */}
          <div className="bg-white border rounded-lg p-4" style={{ borderColor: '#EAEBED', backgroundColor: '#F3F4F6' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold mb-1" style={{ color: '#1F271B' }}>Quote PDF</h3>
                <p className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>
                  {quotePdfLink ? 'PDF generated successfully' : 'Generate PDF quotation with line items. When payments have been recorded, the PDF shows Total, Payments, and Balance (as in the summary).'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {quotePdfLink && (
                  <>
                    <a
                      href={quotePdfLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 border rounded text-xs font-medium flex items-center gap-1.5 transition-all"
                      style={{ borderColor: '#28AFB0', color: '#28AFB0', backgroundColor: 'white' }}
                    >
                      <FiDownload size={12} />
                      <span>Open</span>
                    </a>
                    <button
                      onClick={handleGeneratePdf}
                      className="px-3 py-1.5 border rounded text-xs font-medium transition-all"
                      style={{ borderColor: '#EAEBED', color: '#1F271B', backgroundColor: 'white' }}
                    >
                      Regenerate
                    </button>
                  </>
                )}
                {!quotePdfLink && (
                  <button
                    onClick={handleGeneratePdf}
                    disabled={isGeneratingPdf}
                    className="px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-all"
                    style={{ backgroundColor: '#28AFB0', color: 'white' }}
                  >
                    {isGeneratingPdf ? 'Generating...' : 'Generate PDF'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Email Details */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>
                From (Sender)
              </label>
              <input
                type="email"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all"
                style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>
                Reply To
              </label>
              <input
                type="email"
                value={replyTo}
                onChange={(e) => setReplyTo(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all"
                style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              />
              <p className="text-xs mt-1" style={{ color: '#1F271B', opacity: 0.6 }}>
                Company email from Settings
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>
                To
              </label>
              <input
                type="email"
                value={client?.email || ''}
                disabled
                className="w-full px-3 py-2 border rounded text-sm bg-gray-50"
                style={{ borderColor: '#EAEBED', color: '#1F271B', opacity: 0.7 }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all"
                style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              />
              <p className="text-xs mt-1" style={{ color: '#1F271B', opacity: 0.6 }}>
                Default from Template
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>
                Message
              </label>
              <textarea
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all resize-none"
                style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              />
              <p className="text-xs mt-1" style={{ color: '#1F271B', opacity: 0.6 }}>
                Prefilled from message template (editable)
              </p>
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>
                Attachments
              </label>
              <div className="space-y-2">
                {quotePdfLink && (
                  <div className="flex items-center justify-between p-2 border rounded" style={{ borderColor: '#EAEBED', backgroundColor: '#F9FAFB' }}>
                    <div className="flex items-center gap-2">
                      <FiFileText size={14} style={{ color: '#1F271B', opacity: 0.6 }} />
                      <span className="text-xs" style={{ color: '#1F271B' }}>
                        {workorder?.quoteNumber || `Q-${workorder?.id}`}.pdf
                      </span>
                    </div>
                  </div>
                )}
                {attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded" style={{ borderColor: '#EAEBED', backgroundColor: '#F9FAFB' }}>
                    <div className="flex items-center gap-2">
                      <FiPaperclip size={14} style={{ color: '#1F271B', opacity: 0.6 }} />
                      <span className="text-xs" style={{ color: '#1F271B' }}>{attachment}</span>
                    </div>
                    <button
                      onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                      className="text-xs"
                      style={{ color: '#DC2626' }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleAddAttachment}
                  className="px-3 py-1.5 border border-dashed rounded text-xs font-medium flex items-center gap-1.5 transition-all w-full"
                  style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F3F4F6'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white'
                  }}
                >
                  <FiPaperclip size={12} />
                  <span>Attach other files</span>
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-2 pt-2 border-t" style={{ borderTopColor: '#EAEBED' }}>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={sendMeCopy}
                  onChange={(e) => setSendMeCopy(e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: '#28AFB0' }}
                />
                <span className="text-sm" style={{ color: '#1F271B' }}>Send me a copy</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={sendWhatsApp}
                  onChange={(e) => setSendWhatsApp(e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: '#28AFB0' }}
                />
                <span className="text-sm flex items-center gap-1" style={{ color: '#1F271B' }}>
                  <FiMessageCircle size={14} />
                  Send also via WhatsApp
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t" style={{ borderTopColor: '#EAEBED' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded text-sm font-medium transition-all"
            style={{ borderColor: '#EAEBED', color: '#1F271B', backgroundColor: 'white' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F3F4F6'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSendQuote}
            className="px-4 py-2 rounded text-sm font-medium flex items-center gap-2 transition-all"
            style={{ backgroundColor: '#28AFB0', color: 'white' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1E8A8B'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#28AFB0'
            }}
          >
            <FiMail size={16} />
            <span>Send Quote</span>
          </button>
        </div>
      </div>
    </div>
  )
}
