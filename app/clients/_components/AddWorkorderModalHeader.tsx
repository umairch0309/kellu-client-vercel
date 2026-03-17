'use client'

import { FiX, FiChevronDown, FiCheckCircle } from 'react-icons/fi'
import type { AddWorkorderModalMode, EditingTask } from './addWorkorderModalTypes'

export interface AddWorkorderModalHeaderProps {
  mode: AddWorkorderModalMode
  editingTask?: EditingTask | null
  taskType: 'workorder' | 'task'
  setTaskType: (t: 'workorder' | 'task') => void
  isTypeDropdownOpen: boolean
  setIsTypeDropdownOpen: (v: boolean) => void
  typeDropdownRef: React.RefObject<HTMLDivElement>
  onClose: () => void
}

export default function AddWorkorderModalHeader({
  mode,
  editingTask,
  taskType,
  setTaskType,
  isTypeDropdownOpen,
  setIsTypeDropdownOpen,
  typeDropdownRef,
  onClose,
}: AddWorkorderModalHeaderProps) {
  const quoteOnly = mode === 'quote-only'
  const invoiceOnly = mode === 'invoice-only'
  const taskOnly = mode === 'task'

  return (
    <div className="flex items-center justify-between p-2.5 border-b border-neutral-light">
      <div className="relative" ref={typeDropdownRef}>
        {quoteOnly ? (
          <span className="text-base font-semibold text-neutral-dark">New Quote</span>
        ) : invoiceOnly ? (
          <span className="text-base font-semibold text-neutral-dark">New Invoice</span>
        ) : taskOnly ? (
          <span className="text-base font-semibold text-neutral-dark">{editingTask ? 'Edit Task' : 'New Task'}</span>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
              className="flex items-center gap-1.5 text-base font-semibold text-neutral-dark hover:text-neutral-dark/80 transition-colors"
            >
              <span>{taskType === 'task' ? 'New Task' : 'New Workorder'}</span>
              <FiChevronDown size={12} className={`text-neutral-dark/70 transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isTypeDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-neutral-light rounded shadow-lg z-10 min-w-[160px]">
                <button
                  type="button"
                  onClick={() => { setTaskType('workorder'); setIsTypeDropdownOpen(false) }}
                  className="w-full px-3 py-2 text-left text-sm text-neutral-dark hover:bg-neutral-light flex items-center gap-2"
                >
                  {taskType === 'workorder' ? <FiCheckCircle size={14} className="text-neutral-dark" /> : <div className="w-[14px]" />}
                  <span>New Workorder</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setTaskType('task'); setIsTypeDropdownOpen(false) }}
                  className="w-full px-3 py-2 text-left text-sm text-neutral-dark hover:bg-neutral-light flex items-center gap-2"
                >
                  {taskType === 'task' ? <FiCheckCircle size={14} className="text-neutral-dark" /> : <div className="w-[14px]" />}
                  <span>New Task</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <button type="button" onClick={onClose} className="p-0.5 hover:bg-neutral-light rounded text-neutral-dark transition-colors">
        <FiX size={16} />
      </button>
    </div>
  )
}
