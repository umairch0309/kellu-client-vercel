'use client'

import { useState, useRef } from 'react'
import { FiX, FiUpload, FiFileText } from 'react-icons/fi'

interface CreateJobReportModalProps {
  isOpen: boolean
  onClose: () => void
  workorderTitle: string
  onSave: (report: { notes: string; photoFiles: File[]; hasSignature: boolean }) => void
}

export default function CreateJobReportModal({ isOpen, onClose, workorderTitle, onSave }: CreateJobReportModalProps) {
  const [notes, setNotes] = useState('')
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    setPhotoFiles(prev => [...prev, ...files].slice(0, 10))
    e.target.value = ''
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    setSignatureDataUrl(null)
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.strokeStyle = '#1F271B'
    ctx.lineWidth = 2
    ctx.stroke()
  }

  const endDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) setSignatureDataUrl(canvas.toDataURL('image/png'))
  }

  const handleGeneratePdf = () => {
    onSave({ notes, photoFiles, hasSignature: !!signatureDataUrl })
    onClose()
    setNotes('')
    setPhotoFiles([])
    setSignatureDataUrl(null)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col" style={{ border: '1px solid #EAEBED' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: '#EAEBED' }}>
          <h2 className="text-base font-semibold" style={{ color: '#1F271B' }}>Create Job Report (Job Form)</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded hover:bg-gray-100" style={{ color: '#1F271B' }}>
            <FiX size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <p className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>
            Work reports can be captured via an external form tool (e.g. Tally). After filling, generate the PDF to store with this work order.
          </p>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>Photos</label>
            <div
              className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer"
              style={{ borderColor: '#EAEBED' }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoAdd} />
              <FiUpload size={24} style={{ color: '#28AFB0' }} />
              <span className="text-sm" style={{ color: '#1F271B' }}>Upload photos</span>
            </div>
            {photoFiles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {photoFiles.map((f, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#F3F4F6', color: '#1F271B' }}>
                    {f.name}
                    <button type="button" onClick={() => setPhotoFiles(prev => prev.filter((_, j) => j !== i))} className="ml-1">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes for the job report..."
              rows={4}
              className="w-full px-3 py-2 border rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#28AFB0]"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>Digital signature</label>
            {!signatureDataUrl ? (
              <div className="border rounded-lg overflow-hidden" style={{ borderColor: '#EAEBED' }}>
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={120}
                  className="w-full border-b cursor-crosshair block"
                  style={{ borderColor: '#EAEBED' }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={endDrawing}
                  onMouseLeave={endDrawing}
                />
                <p className="text-xs p-2" style={{ color: '#1F271B', opacity: 0.6 }}>Draw your signature above</p>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <img src={signatureDataUrl} alt="Signature" className="h-12 border rounded" style={{ borderColor: '#EAEBED' }} />
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-xs px-2 py-1 border rounded"
                  style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t shrink-0" style={{ borderColor: '#EAEBED' }}>
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded text-sm font-medium" style={{ borderColor: '#EAEBED', color: '#1F271B' }}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGeneratePdf}
            className="px-4 py-2 rounded text-sm font-medium text-white flex items-center gap-2"
            style={{ backgroundColor: '#28AFB0' }}
          >
            <FiFileText size={16} />
            Generate PDF & Save
          </button>
        </div>
      </div>
    </div>
  )
}
