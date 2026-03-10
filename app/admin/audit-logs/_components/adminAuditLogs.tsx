'use client'

import { useState, useRef, useEffect } from 'react'
import { FiSearch, FiChevronDown } from 'react-icons/fi'

const mockAuditLogs = [
  { id: '1', timestamp: 'Feb 27, 2026 14:23:15', action: 'User Login', performedBy: 'john.smith@abccorp.com', targetBusiness: 'ABC Corporation', module: 'Authentication', ipAddress: '192.168.1.100' },
  { id: '2', timestamp: 'Feb 27, 2026 14:15:42', action: 'Business Suspended', performedBy: 'admin@kellu.io', targetBusiness: 'Global Industries Ltd', module: 'Businesses', ipAddress: '10.0.0.5' },
  { id: '3', timestamp: 'Feb 27, 2026 13:58:30', action: 'Invoice Created', performedBy: 'sarah.j@techstart.io', targetBusiness: 'TechStart Solutions', module: 'Invoices', ipAddress: '192.168.1.45' },
  { id: '4', timestamp: 'Feb 27, 2026 13:42:18', action: 'Job Updated', performedBy: 'emily@buildright.com', targetBusiness: 'BuildRight Construction', module: 'Jobs', ipAddress: '192.168.1.78' },
  { id: '5', timestamp: 'Feb 27, 2026 13:30:05', action: 'User Invited', performedBy: 'admin@proservices.com', targetBusiness: 'ProServices Inc', module: 'Users', ipAddress: '192.168.2.12' },
  { id: '6', timestamp: 'Feb 27, 2026 12:15:33', action: 'Settings Updated', performedBy: 'admin@kellu.io', targetBusiness: 'Platform Settings', module: 'Settings', ipAddress: '10.0.0.5' },
  { id: '7', timestamp: 'Feb 27, 2026 11:45:22', action: 'Password Reset', performedBy: 'david@creative.design', targetBusiness: 'Creative Design Studio', module: 'Authentication', ipAddress: '192.168.3.89' },
  { id: '8', timestamp: 'Feb 27, 2026 11:20:15', action: 'Report Generated', performedBy: 'admin@kellu.io', targetBusiness: 'All Businesses', module: 'Reports', ipAddress: '10.0.0.5' },
]

const actionFilterOptions = [
  { value: 'all', label: 'All Actions' },
  { value: 'login', label: 'Login/Logout' },
  { value: 'created', label: 'Created' },
  { value: 'updated', label: 'Updated' },
  { value: 'deleted', label: 'Deleted' },
]

const moduleFilterOptions = [
  { value: 'all', label: 'All Modules' },
  { value: 'Authentication', label: 'Authentication' },
  { value: 'Businesses', label: 'Businesses' },
  { value: 'Jobs', label: 'Jobs' },
  { value: 'Invoices', label: 'Invoices' },
  { value: 'Users', label: 'Users' },
  { value: 'Settings', label: 'Settings' },
  { value: 'Reports', label: 'Reports' },
]

const getModuleColor = (module: string) => {
  const map: Record<string, { bg: string; text: string }> = {
    Authentication: { bg: 'rgba(43, 80, 170, 0.15)', text: '#2B50AA' },
    Businesses:    { bg: 'rgba(40, 175, 176, 0.2)',  text: '#1E8A8B' },
    Invoices:      { bg: 'rgba(245, 158, 11, 0.2)',  text: '#B45309' },
    Jobs:          { bg: 'rgba(34, 197, 94, 0.15)',  text: '#15803D' },
    Users:         { bg: 'rgba(168, 85, 247, 0.15)', text: '#7E22CE' },
    Settings:      { bg: '#F3F4F6',                  text: '#1F271B' },
    Reports:       { bg: 'rgba(239, 68, 68, 0.12)',  text: '#DC2626' },
  }
  return map[module] ?? { bg: '#F3F4F6', text: '#1F271B' }
}

export function AdminAuditLogs() {
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [moduleFilter, setModuleFilter] = useState('all')
  const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false)
  const [isModuleDropdownOpen, setIsModuleDropdownOpen] = useState(false)
  const actionDropdownRef = useRef<HTMLDivElement>(null)
  const moduleDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionDropdownRef.current && !actionDropdownRef.current.contains(event.target as Node)) {
        setIsActionDropdownOpen(false)
      }
      if (moduleDropdownRef.current && !moduleDropdownRef.current.contains(event.target as Node)) {
        setIsModuleDropdownOpen(false)
      }
    }
    if (isActionDropdownOpen || isModuleDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isActionDropdownOpen, isModuleDropdownOpen])

  const filteredLogs = mockAuditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetBusiness.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesAction = actionFilter === 'all' || log.action.toLowerCase().includes(actionFilter)
    const matchesModule = moduleFilter === 'all' || log.module === moduleFilter
    return matchesSearch && matchesAction && matchesModule
  })

  const hasActiveFilters = searchTerm !== '' || actionFilter !== 'all' || moduleFilter !== 'all'

  const clearAllFilters = () => {
    setSearchTerm('')
    setActionFilter('all')
    setModuleFilter('all')
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#1F271B' }}>Audit Logs</h1>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded shadow-sm border p-3" style={{ borderColor: '#EAEBED' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
          <h2 className="text-base font-bold" style={{ color: '#1F271B' }}>
            All logs ({filteredLogs.length} result{filteredLogs.length !== 1 ? 's' : ''})
          </h2>
          <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end flex-wrap">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs font-medium hover:underline px-1"
                style={{ color: '#28AFB0' }}
              >
                Clear filters
              </button>
            )}

            {/* Action Filter Dropdown */}
            <div className="relative" ref={actionDropdownRef}>
              <button
                onClick={() => setIsActionDropdownOpen(!isActionDropdownOpen)}
                className="px-2.5 py-1.5 rounded border text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md"
                style={{
                  backgroundColor: actionFilter === 'all' ? '#F3F4F6' : 'white',
                  borderColor: '#EAEBED',
                  color: '#1F271B',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#D1D5DB'
                  if (actionFilter !== 'all') e.currentTarget.style.backgroundColor = '#F9FAFB'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#EAEBED'
                  if (actionFilter !== 'all') e.currentTarget.style.backgroundColor = 'white'
                }}
              >
                <span className="font-semibold" style={{ color: '#1F271B' }}>Action</span>
                <span style={{ color: '#1F271B', opacity: 0.5 }}>|</span>
                <span style={{ color: '#1F271B', opacity: 0.8 }}>
                  {actionFilterOptions.find(o => o.value === actionFilter)?.label ?? actionFilter}
                </span>
                <FiChevronDown size={12} className={`transition-transform ${isActionDropdownOpen ? 'rotate-180' : ''}`} style={{ color: '#1F271B', opacity: 0.6 }} />
              </button>
              {isActionDropdownOpen && (
                <div className="absolute right-0 mt-1 bg-white rounded shadow-lg border z-10 min-w-[180px] py-1" style={{ borderColor: '#EAEBED' }}>
                  {actionFilterOptions.map((opt, idx) => (
                    <span key={opt.value}>
                      {idx > 0 && <div className="mx-2 border-t" style={{ borderStyle: 'dashed', borderColor: '#EAEBED' }} />}
                      <button
                        onClick={() => { setActionFilter(opt.value); setIsActionDropdownOpen(false) }}
                        className="w-full text-left px-2 py-1.5 text-xs transition-colors"
                        style={{ color: '#1F271B', backgroundColor: actionFilter === opt.value ? '#F3F4F6' : 'white' }}
                        onMouseEnter={(e) => { if (actionFilter !== opt.value) e.currentTarget.style.backgroundColor = '#F9FAFB' }}
                        onMouseLeave={(e) => { if (actionFilter !== opt.value) e.currentTarget.style.backgroundColor = 'white' }}
                      >
                        {opt.label}
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Module Filter Dropdown */}
            <div className="relative" ref={moduleDropdownRef}>
              <button
                onClick={() => setIsModuleDropdownOpen(!isModuleDropdownOpen)}
                className="px-2.5 py-1.5 rounded border text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md"
                style={{
                  backgroundColor: moduleFilter === 'all' ? '#F3F4F6' : 'white',
                  borderColor: '#EAEBED',
                  color: '#1F271B',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#D1D5DB'
                  if (moduleFilter !== 'all') e.currentTarget.style.backgroundColor = '#F9FAFB'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#EAEBED'
                  if (moduleFilter !== 'all') e.currentTarget.style.backgroundColor = 'white'
                }}
              >
                <span className="font-semibold" style={{ color: '#1F271B' }}>Module</span>
                <span style={{ color: '#1F271B', opacity: 0.5 }}>|</span>
                <span style={{ color: '#1F271B', opacity: 0.8 }}>
                  {moduleFilterOptions.find(o => o.value === moduleFilter)?.label ?? moduleFilter}
                </span>
                <FiChevronDown size={12} className={`transition-transform ${isModuleDropdownOpen ? 'rotate-180' : ''}`} style={{ color: '#1F271B', opacity: 0.6 }} />
              </button>
              {isModuleDropdownOpen && (
                <div className="absolute right-0 mt-1 bg-white rounded shadow-lg border z-10 min-w-[180px] py-1" style={{ borderColor: '#EAEBED' }}>
                  {moduleFilterOptions.map((opt, idx) => (
                    <span key={opt.value}>
                      {idx > 0 && <div className="mx-2 border-t" style={{ borderStyle: 'dashed', borderColor: '#EAEBED' }} />}
                      <button
                        onClick={() => { setModuleFilter(opt.value); setIsModuleDropdownOpen(false) }}
                        className="w-full text-left px-2 py-1.5 text-xs transition-colors"
                        style={{ color: '#1F271B', backgroundColor: moduleFilter === opt.value ? '#F3F4F6' : 'white' }}
                        onMouseEnter={(e) => { if (moduleFilter !== opt.value) e.currentTarget.style.backgroundColor = '#F9FAFB' }}
                        onMouseLeave={(e) => { if (moduleFilter !== opt.value) e.currentTarget.style.backgroundColor = 'white' }}
                      >
                        {opt.label}
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative flex-1 sm:flex-initial">
              <FiSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2" size={14} style={{ color: '#1F271B', opacity: 0.5 }} />
              <input
                type="text"
                placeholder="Search by action, user, or business..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-8 pr-3 py-1.5 border rounded text-xs focus:outline-none transition-all shadow-sm hover:shadow-md"
                style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#28AFB0'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 175, 176, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#EAEBED'
                  e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
                onMouseEnter={(e) => {
                  if (document.activeElement !== e.currentTarget) e.currentTarget.style.borderColor = '#D1D5DB'
                }}
                onMouseLeave={(e) => {
                  if (document.activeElement !== e.currentTarget) e.currentTarget.style.borderColor = '#EAEBED'
                }}
              />
            </div>
          </div>
        </div>

        {filteredLogs.length > 0 ? (
          <div className="rounded overflow-hidden border" style={{ borderColor: '#EAEBED' }}>
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#F3F4F6' }}>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Timestamp</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Action</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Performed By</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Target Business</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Module</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const moduleColor = getModuleColor(log.module)
                  return (
                    <tr
                      key={log.id}
                      className="border-t cursor-pointer transition-colors"
                      style={{ borderColor: '#EAEBED' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white' }}
                    >
                      <td className="px-3 py-2">
                        <p className="text-xs font-mono" style={{ color: '#1F271B', opacity: 0.7 }}>{log.timestamp}</p>
                      </td>
                      <td className="px-3 py-2">
                        <p className="text-xs font-medium" style={{ color: '#1F271B' }}>{log.action}</p>
                      </td>
                      <td className="px-3 py-2">
                        <p className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>{log.performedBy}</p>
                      </td>
                      <td className="px-3 py-2">
                        <p className="text-xs font-medium" style={{ color: '#1F271B' }}>{log.targetBusiness}</p>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium"
                          style={{ backgroundColor: moduleColor.bg, color: moduleColor.text }}
                        >
                          {log.module}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm" style={{ color: '#1F271B', opacity: 0.6 }}>No audit logs found.</p>
          </div>
        )}

        {/* Results summary */}
        <p className="text-[10px] mt-2" style={{ color: '#1F271B', opacity: 0.5 }}>
          Showing {filteredLogs.length} of {mockAuditLogs.length} audit logs
        </p>
      </div>
    </div>
  )
}