'use client'

import { FiX, FiPlus, FiChevronDown, FiCheck } from 'react-icons/fi'
import type { AddWorkorderFormData } from './addWorkorderModalTypes'
import type { AssignOption } from './addWorkorderModalTypes'

export interface AddWorkorderModalAssignSectionProps {
  documentOnly: boolean
  formData: AddWorkorderFormData
  setFormData: React.Dispatch<React.SetStateAction<AddWorkorderFormData>>
  showAssign: boolean
  setShowAssign: (v: boolean) => void
  isAssignDropdownOpen: boolean
  setIsAssignDropdownOpen: (v: boolean) => void
  assignDropdownRef: React.RefObject<HTMLDivElement>
  assignSearchTerm: string
  setAssignSearchTerm: (v: string) => void
  assignOptions: AssignOption[]
  filteredAssignOptions: AssignOption[]
  assignedSet: Set<string>
  toggleAssignSelection: (value: string) => void
  clearAssignSelection: () => void
  selectAllAssign: () => void
}

export default function AddWorkorderModalAssignSection({
  documentOnly,
  formData,
  setFormData,
  showAssign,
  setShowAssign,
  isAssignDropdownOpen,
  setIsAssignDropdownOpen,
  assignDropdownRef,
  assignSearchTerm,
  setAssignSearchTerm,
  assignOptions,
  filteredAssignOptions,
  assignedSet,
  toggleAssignSelection,
  clearAssignSelection,
  selectAllAssign,
}: AddWorkorderModalAssignSectionProps) {
  if (documentOnly) return null

  if (!showAssign) {
    return (
      <button
        type="button"
        onClick={() => setShowAssign(true)}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors"
        style={{ borderColor: '#EAEBED', color: '#28AFB0', backgroundColor: 'white' }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6'; e.currentTarget.style.borderColor = '#28AFB0' }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.borderColor = '#EAEBED' }}
      >
        <FiPlus size={14} />
        <span>Assign</span>
      </button>
    )
  }

  return (
    <div ref={assignDropdownRef} className="relative space-y-2">
      {formData.assignedTeamMembers.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {formData.assignedTeamMembers.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-2 pl-1.5 pr-1 py-1 rounded-lg border"
              style={{ borderColor: '#EAEBED', backgroundColor: '#F9FAFB', color: '#1F271B' }}
            >
              <span className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium flex-shrink-0" style={{ backgroundColor: '#E5E7EB', color: '#1F271B' }}>
                {name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </span>
              <span className="text-sm font-medium max-w-[120px] truncate">{name}</span>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, assignedTeamMembers: prev.assignedTeamMembers.filter(n => n !== name) }))}
                className="p-0.5 rounded hover:bg-gray-200 transition-colors flex-shrink-0"
                style={{ color: '#6B7280' }}
                aria-label={`Remove ${name}`}
              >
                <FiX size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setIsAssignDropdownOpen(!isAssignDropdownOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors"
        style={{ borderColor: '#EAEBED', color: '#28AFB0', backgroundColor: 'white' }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6'; e.currentTarget.style.borderColor = '#28AFB0' }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.borderColor = '#EAEBED' }}
      >
        <FiPlus size={14} />
        <span>Assign</span>
        <FiChevronDown size={12} className={`flex-shrink-0 transition-transform ${isAssignDropdownOpen ? 'rotate-180' : ''}`} style={{ opacity: 0.8 }} />
      </button>
      {isAssignDropdownOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-xl z-[100] min-w-[200px]" style={{ borderColor: '#EAEBED' }}>
          <div className="p-1.5 border-b" style={{ borderColor: '#EAEBED' }}>
            <input
              type="text"
              placeholder="Search team"
              value={assignSearchTerm}
              onChange={(e) => setAssignSearchTerm(e.target.value)}
              className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="px-2 py-1.5 border-b flex items-center justify-between" style={{ borderColor: '#EAEBED' }}>
            <span className="text-sm font-medium" style={{ color: '#1F271B' }}>Select</span>
            <button
              type="button"
              onClick={() => (assignedSet.size === assignOptions.length ? clearAssignSelection() : selectAllAssign())}
              className="text-sm font-medium underline"
              style={{ color: '#28AFB0' }}
            >
              {assignedSet.size === assignOptions.length ? 'Clear' : 'Select all'}
            </button>
          </div>
          <div className="max-h-40 overflow-y-auto">
            {filteredAssignOptions.map((option) => {
              const isSelected = assignedSet.has(option.value)
              return (
                <div
                  key={option.value}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleAssignSelection(option.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleAssignSelection(option.value) } }}
                  className="px-2 py-1.5 cursor-pointer flex items-center gap-2 transition-colors"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 bg-[#2B50AA]" />
                  <span className="text-sm font-medium flex-1 min-w-0" style={{ color: '#1F271B' }}>{option.label}</span>
                  {isSelected && <FiCheck className="flex-shrink-0" size={16} style={{ color: '#28AFB0' }} strokeWidth={3} />}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
