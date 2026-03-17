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

  return (
    <div className="flex justify-end gap-1.5 pt-2 border-t border-neutral-light">
      {!documentOnly && (
        <button
          type="button"
          onClick={onClose}
          className="px-2.5 py-1 bg-white border border-neutral-light rounded text-neutral-dark hover:bg-neutral-light transition-colors text-xs font-medium"
        >
          Cancel
        </button>
      )}
      {effectiveTaskType === 'task' && editingTask && onConvertToWorkorder && (
        <button
          type="button"
          onClick={handleConvertToWorkorder}
          className="px-2.5 py-1 bg-white border border-neutral-light rounded text-neutral-dark hover:bg-neutral-light transition-colors text-xs font-medium"
        >
          Convert to Workorder
        </button>
      )}
      <button
        type="submit"
        className="px-2.5 py-1 bg-secondary text-white rounded hover:bg-secondary-dark transition-colors text-xs font-medium"
      >
        {quoteOnly ? 'Save Quote' : invoiceOnly ? 'Save Invoice' : effectiveTaskType === 'task' ? 'Save' : 'Save'}
      </button>
    </div>
  )
}
