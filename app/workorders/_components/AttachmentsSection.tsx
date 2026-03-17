'use client'

import { FiUpload, FiTrash2 } from 'react-icons/fi'

export interface AttachmentsSectionProps {
  attachmentFiles: File[]
  setAttachmentFiles: (files: File[] | ((prev: File[]) => File[])) => void
  attachmentInputRef: React.RefObject<HTMLInputElement>
}

export default function AttachmentsSection({ attachmentFiles, setAttachmentFiles, attachmentInputRef }: AttachmentsSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
      <div className="flex items-start justify-between mb-1">
        <div>
          <h2 className="text-sm font-semibold" style={{ color: '#1F271B' }}>Attachments</h2>
          <p className="text-xs mt-0.5" style={{ color: '#1F271B', opacity: 0.6 }}>Include all attachments for your quote in one place</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>{attachmentFiles.length} of 10 uploaded</span>
          <button type="button" onClick={() => setAttachmentFiles([])} className="p-1.5 rounded transition-colors" style={{ color: '#1F271B', opacity: 0.7 }} onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.backgroundColor = '#FEE2E2' }} onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.backgroundColor = 'transparent' }} title="Clear attachments"><FiTrash2 size={16} /></button>
        </div>
      </div>
      <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 mt-3" style={{ borderColor: '#EAEBED', backgroundColor: '#FAFAFA' }} onDragOver={(e) => { e.preventDefault(); (e.currentTarget as HTMLElement).style.borderColor = '#28AFB0' }} onDragLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#EAEBED' }} onDrop={(e) => { e.preventDefault(); (e.currentTarget as HTMLElement).style.borderColor = '#EAEBED'; const files = Array.from(e.dataTransfer.files); setAttachmentFiles((prev) => [...prev, ...files].slice(0, 10)) }}>
        <input ref={attachmentInputRef} type="file" multiple accept=".jpeg,.jpg,.png,.heic,.pdf,.docx,image/jpeg,image/png,image/heic,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => { const files = e.target.files ? Array.from(e.target.files) : []; setAttachmentFiles((prev) => [...prev, ...files].slice(0, 10)); e.target.value = '' }} className="hidden" />
        <button type="button" onClick={() => attachmentInputRef.current?.click()} disabled={attachmentFiles.length >= 10} className="px-4 py-2 border rounded-lg text-sm font-medium transition-colors" style={{ borderColor: '#28AFB0', color: '#28AFB0', backgroundColor: 'rgba(40, 175, 176, 0.08)' }} onMouseEnter={(e) => { if (attachmentFiles.length < 10) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(40, 175, 176, 0.15)' }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(40, 175, 176, 0.08)' }}>Select files</button>
        <p className="text-xs" style={{ color: '#1F271B', opacity: 0.6 }}>JPEG, PNG, HEIC, PDF, DOCX, up to 50MB each</p>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button type="button" onClick={() => setAttachmentFiles([])} className="px-4 py-2 border rounded-lg text-sm font-medium transition-colors" style={{ borderColor: '#28AFB0', color: '#28AFB0', backgroundColor: 'white' }}>Cancel</button>
        <button type="button" onClick={() => alert('Attachments saved. (Static UI)')} className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors" style={{ backgroundColor: '#28AFB0' }}>Save</button>
      </div>
    </div>
  )
}
