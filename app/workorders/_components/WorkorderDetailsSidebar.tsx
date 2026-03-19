'use client'

import { format } from 'date-fns'
import { FiFileText, FiCheckCircle, FiEdit, FiTrash2 } from 'react-icons/fi'
import type { CustomerReminder } from '@/context/ClientRemindersContext'

export interface WorkorderDetailsSidebarProps {
  workorder: any
  jobReportPdfUrl: string | null
  jobReportSentAt: string | null
  tallyWorkReportSentAt: string | null
  getReminder: (clientId: number | string) => CustomerReminder | null
  isReminderDue: (r: CustomerReminder) => boolean
  onSetReminderOpen: () => void
  onEditReminder: () => void
  deleteReminder: (clientId: number | string) => void
}

export default function WorkorderDetailsSidebar({
  workorder,
  jobReportPdfUrl,
  jobReportSentAt,
  tallyWorkReportSentAt,
  getReminder,
  isReminderDue,
  onSetReminderOpen,
  onEditReminder,
  deleteReminder,
}: WorkorderDetailsSidebarProps) {
  const latestReportSent = (() => {
    const a = jobReportSentAt ? new Date(jobReportSentAt).getTime() : 0
    const b = tallyWorkReportSentAt ? new Date(tallyWorkReportSentAt).getTime() : 0
    return a >= b ? jobReportSentAt : tallyWorkReportSentAt
  })()
  const reminder = workorder ? getReminder(workorder.clientId) : null
  const reminderDue = reminder ? isReminderDue(reminder) : false

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
        <h2 className="text-sm font-semibold mb-3" style={{ color: '#1F271B' }}>Work Order Details</h2>
        <div className="divide-y" style={{ borderColor: '#EAEBED' }}>
          <div className="flex justify-between items-center py-2.5 first:pt-0">
            <span className="text-xs font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Created at</span>
            <span className="text-xs" style={{ color: '#1F271B' }}>{(workorder as any).createdAt ? format(new Date((workorder as any).createdAt), 'MMM dd, yyyy') : '—'}</span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-xs font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Last Quote</span>
            {workorder.quoteNumber ? <a href="#" className="text-xs flex items-center gap-1 text-blue-600 hover:underline"><FiFileText size={12} /><span>{workorder.quoteNumber}.pdf</span></a> : <span className="text-xs" style={{ color: '#1F271B', opacity: 0.6 }}>—</span>}
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-xs font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Quote sent</span>
            {workorder.quoteDateSent ? <span className="text-xs flex items-center gap-1" style={{ color: '#1F271B' }}><FiCheckCircle size={12} style={{ color: '#059669' }} />{format(new Date(workorder.quoteDateSent), 'MMM dd, yyyy')}</span> : <span className="text-xs" style={{ color: '#1F271B', opacity: 0.6 }}>Not sent</span>}
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-xs font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Quote WhatsApp status</span>
            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: workorder.quoteWhatsappStatus === 'sent' ? 'rgba(40, 175, 176, 0.2)' : '#F3F4F6', color: workorder.quoteWhatsappStatus === 'sent' ? '#1E8A8B' : '#1F271B' }}>{workorder.quoteWhatsappStatus || 'Not sent'}</span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-xs font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Last Invoice</span>
            {workorder.invoiceNumber ? <a href="#" className="text-xs flex items-center gap-1 text-blue-600 hover:underline"><FiFileText size={12} /><span>{workorder.invoiceNumber}.pdf</span></a> : <span className="text-xs" style={{ color: '#1F271B', opacity: 0.6 }}>—</span>}
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-xs font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Invoice sent</span>
            {workorder.invoiceDateSent ? <span className="text-xs flex items-center gap-1" style={{ color: '#1F271B' }}><FiCheckCircle size={12} style={{ color: '#059669' }} />{format(new Date(workorder.invoiceDateSent), 'MMM dd, yyyy')}</span> : <span className="text-xs" style={{ color: '#1F271B', opacity: 0.6 }}>Not sent</span>}
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-xs font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Invoice WhatsApp status</span>
            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: workorder.invoiceWhatsappStatus === 'sent' ? 'rgba(40, 175, 176, 0.2)' : '#F3F4F6', color: workorder.invoiceWhatsappStatus === 'sent' ? '#1E8A8B' : '#1F271B' }}>{workorder.invoiceWhatsappStatus || 'Not sent'}</span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-xs font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Last Work REPORT</span>
            {jobReportPdfUrl ? <a href={jobReportPdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1 text-blue-600 hover:underline"><FiFileText size={12} /><span>Job report.pdf</span></a> : <span className="text-xs" style={{ color: '#1F271B', opacity: 0.6 }}>—</span>}
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-xs font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Work report sent</span>
            {latestReportSent ? <span className="text-xs flex items-center gap-1" style={{ color: '#1F271B' }}><FiCheckCircle size={12} style={{ color: '#059669' }} />{format(new Date(latestReportSent), 'MMM dd, yyyy')}</span> : <span className="text-xs" style={{ color: '#1F271B', opacity: 0.6 }}>Not sent</span>}
          </div>
          <div className="flex justify-between items-center py-2.5 last:pb-0">
            <span className="text-xs font-medium" style={{ color: '#1F271B', opacity: 0.7 }}>Job Follow sent</span>
            {(workorder as any).jobFollowSentAt ? <span className="text-xs flex items-center gap-1" style={{ color: '#1F271B' }}><FiCheckCircle size={12} style={{ color: '#059669' }} />{format(new Date((workorder as any).jobFollowSentAt), 'MMM dd, yyyy')}</span> : <span className="text-xs" style={{ color: '#1F271B', opacity: 0.6 }}>Not sent</span>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
        <h2 className="text-sm font-semibold mb-3" style={{ color: '#1F271B' }}>Reminders</h2>
        <div className="space-y-2">
          {workorder.quoteDateSent && (
            <div className="p-2 rounded" style={{ backgroundColor: '#F3F4F6' }}>
              <div className="flex items-center justify-between mb-1"><span className="text-xs font-medium" style={{ color: '#1F271B' }}>Quote Reminder</span><FiCheckCircle size={12} style={{ color: '#059669' }} /></div>
              <p className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>Sent on {format(new Date(workorder.quoteDateSent), 'MMM dd, yyyy')}</p>
            </div>
          )}
          {workorder.invoiceDateSent && (
            <div className="p-2 rounded" style={{ backgroundColor: '#F3F4F6' }}>
              <div className="flex items-center justify-between mb-1"><span className="text-xs font-medium" style={{ color: '#1F271B' }}>Invoice Reminder</span><FiCheckCircle size={12} style={{ color: '#059669' }} /></div>
              <p className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>Sent on {format(new Date(workorder.invoiceDateSent), 'MMM dd, yyyy')}</p>
            </div>
          )}
          {!workorder.quoteDateSent && !workorder.invoiceDateSent && <p className="text-xs text-center py-2" style={{ color: '#1F271B', opacity: 0.6 }}>No reminders sent</p>}
        </div>
      </div>

      {workorder && (
        <div className="bg-white rounded-lg shadow-md border p-4 mt-3" style={{ borderColor: '#EAEBED' }}>
          <h2 className="text-sm font-semibold mb-0.5" style={{ color: '#1F271B' }}>Customer reminder</h2>
          <p className="text-xs mb-2.5" style={{ color: '#1F271B', opacity: 0.7 }}>Remind me to follow up on this client in future date</p>
          {!reminder ? (
            <button type="button" onClick={onSetReminderOpen} className="w-full px-3 py-2 border border-dashed rounded text-xs font-medium transition-colors" style={{ borderColor: '#EAEBED', color: '#1F271B', backgroundColor: 'white' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB'; (e.currentTarget as HTMLElement).style.borderColor = '#28AFB0' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; (e.currentTarget as HTMLElement).style.borderColor = '#EAEBED' }}>Set customer reminder</button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs" style={{ color: reminderDue ? '#DC2626' : '#1F271B' }}>{format(new Date(reminder.date + (reminder.time ? `T${reminder.time}` : '')), 'MMM d, yyyy · HH:mm')}{reminder.note ? ` · ${reminder.note}` : ''}</p>
              {reminderDue && <p className="text-xs font-medium" style={{ color: '#DC2626' }}>Status: Follow up</p>}
              <div className="flex items-center gap-2">
                <button type="button" onClick={onEditReminder} className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors" style={{ color: '#1F271B', border: '1px solid #EAEBED' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}><FiEdit size={10} />Edit</button>
                <button type="button" onClick={() => deleteReminder(workorder.clientId)} className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors" style={{ color: '#DC2626', border: '1px solid #EAEBED' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FEF2F2' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}><FiTrash2 size={10} />Delete</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
