'use client'

import { FiChevronDown, FiCheck } from 'react-icons/fi'

export interface AssignOption {
  value: string
  label: string
}

export interface NewWorkorderAssignSectionProps {
  assignedTeamMembers: string[]
  assignOptions: AssignOption[]
  filteredAssignOptions: AssignOption[]
  assignSearchTerm: string
  setAssignSearchTerm: (v: string) => void
  isOpen: boolean
  setIsOpen: (v: boolean) => void
  teamMemberDropdownRef: React.RefObject<HTMLDivElement>
  isSelected: (value: string) => boolean
  toggleSelection: (value: string) => void
  onSelectAllOrClear: () => void
  selectAllLabel: string
}

export default function NewWorkorderAssignSection({
  assignedTeamMembers,
  assignOptions,
  filteredAssignOptions,
  assignSearchTerm,
  setAssignSearchTerm,
  isOpen,
  setIsOpen,
  teamMemberDropdownRef,
  isSelected,
  toggleSelection,
  onSelectAllOrClear,
  selectAllLabel,
}: NewWorkorderAssignSectionProps) {
  return (
    <div className="lg:col-span-1 bg-white rounded-lg shadow-md border p-4" style={{ borderColor: '#EAEBED' }}>
      <label className="block text-xs font-medium mb-1.5" style={{ color: '#1F271B' }}>Assign Team Member <span style={{ opacity: 0.6, fontWeight: 400 }}>(Optional)</span></label>
      <div className="relative" ref={teamMemberDropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 text-sm transition-all flex items-center justify-between"
          style={{
            borderColor: '#EAEBED',
            color: assignedTeamMembers.length ? '#1F271B' : '#9CA3AF',
            backgroundColor: 'white',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#28AFB0'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#EAEBED'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <span className="truncate">
            {assignedTeamMembers.length === 0
              ? 'Select team member'
              : assignedTeamMembers.length === 1
                ? assignedTeamMembers[0]
                : `${assignedTeamMembers.length} selected`}
          </span>
          <FiChevronDown size={14} style={{ color: '#1F271B', opacity: 0.5 }} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-xl min-w-[200px]" style={{ borderColor: '#EAEBED' }}>
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
              <button type="button" onClick={onSelectAllOrClear} className="text-sm font-medium underline" style={{ color: '#28AFB0' }}>
                {selectAllLabel}
              </button>
            </div>
            <div className="max-h-40 overflow-y-auto">
              {filteredAssignOptions.map((option) => {
                const selected = isSelected(option.value)
                return (
                  <div
                    key={option.value}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleSelection(option.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        toggleSelection(option.value)
                      }
                    }}
                    className="px-2 py-1.5 cursor-pointer flex items-center gap-2 transition-colors"
                    style={{ backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                  >
                    <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 bg-[#2B50AA]" />
                    <span className="text-sm font-medium flex-1 min-w-0" style={{ color: '#1F271B' }}>{option.label}</span>
                    {selected && <FiCheck className="flex-shrink-0" size={16} style={{ color: '#28AFB0' }} strokeWidth={3} />}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
