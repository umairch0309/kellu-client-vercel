'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiChevronLeft, FiPaperclip, FiMail, FiMessageCircle } from 'react-icons/fi'
import { mockClients, mockWorkorders } from '@/data/mockData'

interface SendJobFollowPageProps {
  workorderId: number
}

export default function SendJobFollowPage({ workorderId }: SendJobFollowPageProps) {
  const router = useRouter()
  const workorder = mockWorkorders.find(wo => wo.id === workorderId)
  const client = workorder ? mockClients.find(c => c.id === workorder.clientId) : null

  const [emailMessage, setEmailMessage] = useState('')
  const [subject, setSubject] = useState('')
  const [sender, setSender] = useState('company@example.com')
  const [replyTo, setReplyTo] = useState('company@example.com')
  const [sendMeCopy, setSendMeCopy] = useState(false)
  const [sendWhatsApp, setSendWhatsApp] = useState(false)
  const [attachments, setAttachments] = useState<string[]>([])

  useEffect(() => {
    if (workorder && client) {
      setEmailMessage(`Dear ${client.name || 'Client'},

Thank you for choosing us for ${workorder.title || 'your recent job'}. We hope you're satisfied with the work completed.

We'd love to hear your feedback—it helps us improve our service. Please reply to this email with any comments or a quick rating.

Thank you again for your business.

Best regards`)
      setSubject(`Thank you – feedback for ${workorder.title || 'Job'} #${workorder.id}`)
    }
  }, [workorder, client])

  if (!workorder || !client) {
    return (
      <div className="p-8">
        <p style={{ color: '#1F271B' }}>Workorder not found</p>
      </div>
    )
  }

  const handleSendJobFollow = () => {
    alert('Job follow-up email sent successfully!')
    router.push(`/workorders/${workorderId}`)
  }

  const handleAddAttachment = () => {
    const newAttachment = `attachment_${attachments.length + 1}.pdf`
    setAttachments([...attachments, newAttachment])
  }

  return (
    <div className="space-y-4" style={{ backgroundColor: 'white', minHeight: '100vh', padding: '1rem 0' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/workorders/${workorderId}`)}
            className="p-1.5 rounded transition-colors hover:bg-gray-100"
            style={{ color: '#1F271B' }}
          >
            <FiChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold" style={{ color: '#1F271B' }}>
            Send Job Follow
          </h1>
        </div>
      </div>

      {/* Content - same structure as Send Quote (document guideline) */}
      <div className="max-w-4xl mx-auto px-4 space-y-4">
        <div className="bg-white border rounded-lg shadow-md p-4 space-y-3" style={{ borderColor: '#EAEBED' }}>
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
              value={client.email || ''}
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
              Default from template (editable)
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>
              Message (Thank you note + Feedback request)
            </label>
            <textarea
              value={emailMessage}
              onChange={(e) => setEmailMessage(e.target.value)}
              rows={10}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all resize-none"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
            />
            <p className="text-xs mt-1" style={{ color: '#1F271B', opacity: 0.6 }}>
              Prefilled from template – thank you note and feedback request (editable)
            </p>
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>
              Attachments
            </label>
            <div className="space-y-2">
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
                <span>Attach files</span>
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

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pb-4">
          <button
            onClick={() => router.push(`/workorders/${workorderId}`)}
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
            onClick={handleSendJobFollow}
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
            <span>Send Job Follow</span>
          </button>
        </div>
      </div>
    </div>
  )
}
