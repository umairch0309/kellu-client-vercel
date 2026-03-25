'use client'

import type { AddWorkorderFormData } from './addWorkorderModalTypes'
import type { AddWorkorderModalMode } from './addWorkorderModalTypes'
import type { EditingTask } from './addWorkorderModalTypes'

export interface AddWorkorderModalFooterProps {
  documentOnly: boolean
  mode: AddWorkorderModalMode
  effectiveTaskType: 'workorder' | 'task'
  editingTask?: EditingTask | null
  onConvertToWorkorder?: (task: {
    title: string
    clientName: string
    address: string
    instructions: string
    assignedTo: string
    startDate: string
    startTime: string
    endTime: string
    anytime: boolean
  }) => void
  onClose: () => void
  formData: AddWorkorderFormData
  anytime: boolean
  /** Disables Save while invoice POST is in flight */
  isSubmitting?: boolean
}

export default function AddWorkorderModalFooter({
  documentOnly,
  mode,
  effectiveTaskType,
  editingTask,
  onConvertToWorkorder,
  onClose,
  formData,
  anytime,
  isSubmitting = false,
}: AddWorkorderModalFooterProps) {
  const quoteOnly = mode === 'quote-only'
  const invoiceOnly = mode === 'invoice-only'

  const handleConvertToWorkorder = () => {
    if (!onConvertToWorkorder) return
    onConvertToWorkorder({
      title: formData.title || 'Untitled Task',
      clientName: formData.client || '',
      address: formData.address || '',
      instructions: formData.instructions || '',
      assignedTo: formData.assignedTeamMembers?.join(', ') || '',
      startDate: formData.startDate,
      startTime: formData.startTime,
      endTime: anytime ? '' : (formData.endTime || ''),
      anytime,
    })
    onClose()
  }

  const cancelBtnClass =
    'px-2.5 py-1 bg-white border border-neutral-light rounded text-neutral-dark hover:bg-neutral-light transition-colors text-xs font-medium'

  if (invoiceOnly) {
    return (
      <div className="shrink-0 border-t border-neutral-light bg-white px-2.5 pb-2.5 pt-2.5">
        <div className="flex flex-col gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-3 bg-[#28AFB0] text-white rounded-lg hover:bg-secondary-dark transition-colors text-sm font-semibold disabled:opacity-50 disabled:pointer-events-none shadow-sm"
          >
            {isSubmitting ? 'Saving invoice…' : 'Save invoice'}
          </button>
          <button type="button" onClick={onClose} className={`w-full py-2 ${cancelBtnClass} text-sm`}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="shrink-0 flex justify-end gap-1.5 pt-2 border-t border-neutral-light bg-white px-2.5 pb-2.5">
      {!documentOnly && (
        <button type="button" onClick={onClose} className={cancelBtnClass}>
          Cancel
        </button>
      )}
      {quoteOnly && (
        <button type="button" onClick={onClose} className={cancelBtnClass}>
          Cancel
        </button>
      )}
      {effectiveTaskType === 'task' && editingTask && onConvertToWorkorder && (
        <button type="button" onClick={handleConvertToWorkorder} className={cancelBtnClass}>
          Convert to Workorder
        </button>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`px-2.5 py-1 text-white rounded transition-colors text-xs font-medium disabled:opacity-50 disabled:pointer-events-none ${
          quoteOnly ? 'bg-[#28AFB0] hover:bg-secondary-dark' : 'bg-secondary hover:bg-secondary-dark'
        }`}
      >
        {isSubmitting ? (quoteOnly ? 'Saving quote…' : 'Saving…') : quoteOnly ? 'Save Quote' : effectiveTaskType === 'task' ? 'Save' : 'Save'}
      </button>
    </div>
  )
}
