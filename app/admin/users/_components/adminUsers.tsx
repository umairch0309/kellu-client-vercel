'use client'

import { useState, useRef, useEffect } from 'react'
import { FiSearch, FiChevronDown, FiChevronRight, FiRotateCcw, FiSlash, FiLogOut } from 'react-icons/fi'

type UserStatus = 'active' | 'inactive' | 'suspended'
type UserRole = 'Owner' | 'Manager' | 'Employee'

const mockUsers = [
  { id: '1', name: 'John Smith', email: 'john.smith@abccorp.com', role: 'Owner' as UserRole, business: 'ABC Corporation', status: 'active' as UserStatus, lastLogin: '2 hours ago' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah.j@techstart.io', role: 'Manager' as UserRole, business: 'TechStart Solutions', status: 'active' as UserStatus, lastLogin: '1 day ago' },
  { id: '3', name: 'Michael Brown', email: 'm.brown@globalind.com', role: 'Owner' as UserRole, business: 'Global Industries Ltd', status: 'suspended' as UserStatus, lastLogin: '2 weeks ago' },
  { id: '4', name: 'Emily Davis', email: 'emily@buildright.com', role: 'Employee' as UserRole, business: 'BuildRight Construction', status: 'active' as UserStatus, lastLogin: '3 hours ago' },
  { id: '5', name: 'David Wilson', email: 'david@creative.design', role: 'Owner' as UserRole, business: 'Creative Design Studio', status: 'inactive' as UserStatus, lastLogin: '3 months ago' },
]

const uniqueBusinesses = Array.from(new Set(mockUsers.map(u => u.business)))

const statusFilterOptions = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
]

const businessFilterOptions = [
  { value: 'all', label: 'All Businesses' },
  ...uniqueBusinesses.map(b => ({ value: b, label: b })),
]

const getStatusColor = (status: UserStatus) => {
  if (status === 'active') return { bg: 'rgba(40, 175, 176, 0.2)', text: '#1E8A8B' }
  if (status === 'suspended') return { bg: 'rgba(239, 68, 68, 0.15)', text: '#DC2626' }
  if (status === 'inactive') return { bg: '#F3F4F6', text: '#1F271B' }
  return { bg: '#F3F4F6', text: '#1F271B' }
}

const getRoleColor = (role: UserRole) => {
  if (role === 'Owner') return { bg: 'rgba(176, 132, 204, 0.2)', text: '#8B6AA3' }
  if (role === 'Manager') return { bg: 'rgba(43, 80, 170, 0.2)', text: '#1F3A7A' }
  return { bg: '#F3F4F6', text: '#1F271B' }
}

const userStats = {
  active: mockUsers.filter(u => u.status === 'active').length,
  inactive: mockUsers.filter(u => u.status === 'inactive').length,
  suspended: mockUsers.filter(u => u.status === 'suspended').length,
  owners: mockUsers.filter(u => u.role === 'Owner').length,
  employees: mockUsers.filter(u => u.role !== 'Owner').length,
}

export function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [businessFilter, setBusinessFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('owners')
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const [isBusinessDropdownOpen, setIsBusinessDropdownOpen] = useState(false)
  const statusDropdownRef = useRef<HTMLDivElement>(null)
  const businessDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false)
      }
      if (businessDropdownRef.current && !businessDropdownRef.current.contains(event.target as Node)) {
        setIsBusinessDropdownOpen(false)
      }
    }
    if (isStatusDropdownOpen || isBusinessDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isStatusDropdownOpen, isBusinessDropdownOpen])

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    const matchesBusiness = businessFilter === 'all' || user.business === businessFilter
    const matchesTab =
      activeTab === 'owners' ? user.role === 'Owner' : user.role !== 'Owner'
    return matchesSearch && matchesStatus && matchesBusiness && matchesTab
  })

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || businessFilter !== 'all'

  const clearAllFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setBusinessFilter('all')
  }

  const overviewLinks = [
    { status: 'active', label: 'Active', count: userStats.active, bulletColor: '#28AFB0' },
    { status: 'inactive', label: 'Inactive', count: userStats.inactive, bulletColor: '#9CA3AF' },
    { status: 'suspended', label: 'Suspended', count: userStats.suspended, bulletColor: '#DC2626' },
  ]

  const tabs = [
    { value: 'owners', label: 'Business Owners', count: userStats.owners },
    { value: 'employees', label: 'Employees', count: userStats.employees },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#1F271B' }}>Users</h1>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Card 1: Status Overview */}
        <div
          className="rounded shadow-sm border overflow-hidden transition-all hover:shadow-md"
          style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <div className="h-0.5" style={{ backgroundColor: '#28AFB0' }} />
          <div className="p-3">
            <div className="flex justify-between items-start mb-1.5">
              <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>User Status</p>
              <FiChevronRight size={12} style={{ color: '#1F271B', opacity: 0.5 }} />
            </div>
            <div className="space-y-1.5">
              {overviewLinks.map(({ status, label, count, bulletColor }) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(prev => prev === status ? 'all' : status)}
                  className="w-full flex items-center justify-between py-0.5 px-1 -mx-1 rounded text-left hover:bg-black/5 transition-colors"
                  style={{ backgroundColor: statusFilter === status ? 'rgba(40, 175, 176, 0.12)' : 'transparent' }}
                >
                  <span className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: bulletColor }} />
                    <span className="text-[10px] truncate" style={{ color: '#1F271B', opacity: 0.7 }}>{label}</span>
                  </span>
                  <span className="text-xs font-semibold shrink-0" style={{ color: '#1F271B' }}>{count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Owners */}
        <div
          className="rounded shadow-sm border overflow-hidden transition-all hover:shadow-md cursor-pointer"
          style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
          onClick={() => setActiveTab('owners')}
        >
          <div className="h-0.5" style={{ backgroundColor: '#B084CC' }} />
          <div className="p-3">
            <div className="flex justify-between items-start mb-1.5">
              <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Business Owners</p>
              <FiChevronRight size={12} style={{ color: '#1F271B', opacity: 0.5 }} />
            </div>
            <p className="text-[10px] mb-1.5" style={{ color: '#1F271B', opacity: 0.6 }}>All businesses</p>
            <span className="text-2xl font-bold" style={{ color: '#1F271B' }}>{userStats.owners}</span>
            <p className="text-[10px] mt-1" style={{ color: '#1F271B', opacity: 0.6 }}>Registered owners</p>
          </div>
        </div>

        {/* Card 3: Employees */}
        <div
          className="rounded shadow-sm border overflow-hidden transition-all hover:shadow-md cursor-pointer"
          style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
          onClick={() => setActiveTab('employees')}
        >
          <div className="h-0.5" style={{ backgroundColor: '#2B50AA' }} />
          <div className="p-3">
            <div className="flex justify-between items-start mb-1.5">
              <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Employees</p>
              <FiChevronRight size={12} style={{ color: '#1F271B', opacity: 0.5 }} />
            </div>
            <p className="text-[10px] mb-1.5" style={{ color: '#1F271B', opacity: 0.6 }}>All businesses</p>
            <span className="text-2xl font-bold" style={{ color: '#1F271B' }}>{userStats.employees}</span>
            <p className="text-[10px] mt-1" style={{ color: '#1F271B', opacity: 0.6 }}>Managers & staff</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded shadow-sm border p-3" style={{ borderColor: '#EAEBED', marginTop: '2rem' }}>
        {/* Tabs */}
        <div className="flex border-b mb-3" style={{ borderColor: '#EAEBED' }}>
          {tabs.map(tab => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className="px-3 py-2 text-xs font-medium transition-all relative"
              style={{
                color: activeTab === tab.value ? '#1F271B' : '#1F271B',
                opacity: activeTab === tab.value ? 1 : 0.5,
              }}
            >
              {tab.label}
              <span
                className="ml-1.5 px-1 py-0.5 rounded text-[9px] font-semibold"
                style={{
                  backgroundColor: activeTab === tab.value ? 'rgba(40, 175, 176, 0.15)' : '#F3F4F6',
                  color: activeTab === tab.value ? '#1E8A8B' : '#1F271B',
                }}
              >
                {tab.count}
              </span>
              {activeTab === tab.value && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: '#28AFB0' }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Table header row with filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
          <h2 className="text-base font-bold" style={{ color: '#1F271B' }}>
            {activeTab === 'owners' ? 'Business Owners' : 'Employees'} ({filteredUsers.length} result{filteredUsers.length !== 1 ? 's' : ''})
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

            {/* Business Filter Dropdown */}
            <div className="relative" ref={businessDropdownRef}>
              <button
                onClick={() => setIsBusinessDropdownOpen(!isBusinessDropdownOpen)}
                className="px-2.5 py-1.5 rounded border text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md"
                style={{
                  backgroundColor: businessFilter === 'all' ? '#F3F4F6' : 'white',
                  borderColor: '#EAEBED',
                  color: '#1F271B',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#D1D5DB'
                  if (businessFilter !== 'all') e.currentTarget.style.backgroundColor = '#F9FAFB'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#EAEBED'
                  if (businessFilter !== 'all') e.currentTarget.style.backgroundColor = 'white'
                }}
              >
                <span className="font-semibold" style={{ color: '#1F271B' }}>Business</span>
                <span style={{ color: '#1F271B', opacity: 0.5 }}>|</span>
                <span style={{ color: '#1F271B', opacity: 0.8 }}>{businessFilter === 'all' ? 'All' : businessFilter}</span>
                <FiChevronDown size={12} className={`transition-transform ${isBusinessDropdownOpen ? 'rotate-180' : ''}`} style={{ color: '#1F271B', opacity: 0.6 }} />
              </button>
              {isBusinessDropdownOpen && (
                <div className="absolute right-0 mt-1 bg-white rounded shadow-lg border z-10 min-w-[200px] py-1" style={{ borderColor: '#EAEBED' }}>
                  {businessFilterOptions.map((opt, idx) => (
                    <span key={opt.value}>
                      {idx > 0 && <div className="mx-2 border-t" style={{ borderStyle: 'dashed', borderColor: '#EAEBED' }} />}
                      <button
                        onClick={() => { setBusinessFilter(opt.value); setIsBusinessDropdownOpen(false) }}
                        className="w-full text-left px-2 py-1.5 text-xs transition-colors"
                        style={{ color: '#1F271B', backgroundColor: businessFilter === opt.value ? '#F3F4F6' : 'white' }}
                        onMouseEnter={(e) => { if (businessFilter !== opt.value) e.currentTarget.style.backgroundColor = '#F9FAFB' }}
                        onMouseLeave={(e) => { if (businessFilter !== opt.value) e.currentTarget.style.backgroundColor = 'white' }}
                      >
                        {opt.label}
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Status Filter Dropdown */}
            <div className="relative" ref={statusDropdownRef}>
              <button
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="px-2.5 py-1.5 rounded border text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md"
                style={{
                  backgroundColor: statusFilter === 'all' ? '#F3F4F6' : 'white',
                  borderColor: '#EAEBED',
                  color: '#1F271B',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#D1D5DB'
                  if (statusFilter !== 'all') e.currentTarget.style.backgroundColor = '#F9FAFB'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#EAEBED'
                  if (statusFilter !== 'all') e.currentTarget.style.backgroundColor = 'white'
                }}
              >
                <span className="font-semibold" style={{ color: '#1F271B' }}>Status</span>
                <span style={{ color: '#1F271B', opacity: 0.5 }}>|</span>
                <span style={{ color: '#1F271B', opacity: 0.8 }}>
                  {statusFilterOptions.find(o => o.value === statusFilter)?.label ?? statusFilter}
                </span>
                <FiChevronDown size={12} className={`transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} style={{ color: '#1F271B', opacity: 0.6 }} />
              </button>
              {isStatusDropdownOpen && (
                <div className="absolute right-0 mt-1 bg-white rounded shadow-lg border z-10 min-w-[160px] py-1" style={{ borderColor: '#EAEBED' }}>
                  {statusFilterOptions.map((opt, idx) => (
                    <span key={opt.value}>
                      {idx > 0 && <div className="mx-2 border-t" style={{ borderStyle: 'dashed', borderColor: '#EAEBED' }} />}
                      <button
                        onClick={() => { setStatusFilter(opt.value); setIsStatusDropdownOpen(false) }}
                        className="w-full text-left px-2 py-1.5 text-xs transition-colors"
                        style={{ color: '#1F271B', backgroundColor: statusFilter === opt.value ? '#F3F4F6' : 'white' }}
                        onMouseEnter={(e) => { if (statusFilter !== opt.value) e.currentTarget.style.backgroundColor = '#F9FAFB' }}
                        onMouseLeave={(e) => { if (statusFilter !== opt.value) e.currentTarget.style.backgroundColor = 'white' }}
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
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-56 pl-8 pr-3 py-1.5 border rounded text-xs focus:outline-none transition-all shadow-sm hover:shadow-md"
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

        {/* Table */}
        <div className="rounded overflow-hidden border" style={{ borderColor: '#EAEBED' }}>
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#F3F4F6' }}>
                <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Name</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Email</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Role</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Business</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Status</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Last Login</th>
                <th className="px-3 py-2 text-right text-[10px] font-semibold" style={{ color: '#1F271B' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-4 text-center text-xs" style={{ color: '#1F271B', opacity: 0.6 }}>
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const statusColor = getStatusColor(user.status)
                  const roleColor = getRoleColor(user.role)
                  return (
                    <tr
                      key={user.id}
                      className="border-t transition-colors"
                      style={{ borderColor: '#EAEBED' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white' }}
                    >
                      <td className="px-3 py-2">
                        <p className="text-xs font-medium" style={{ color: '#1F271B' }}>{user.name}</p>
                      </td>
                      <td className="px-3 py-2">
                        <p className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>{user.email}</p>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium"
                          style={{ backgroundColor: roleColor.bg, color: roleColor.text }}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <p className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>{user.business}</p>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium"
                          style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
                        >
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <p className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>{user.lastLogin}</p>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-end gap-0.5">
                          <button
                            className="p-1.5 rounded transition-all"
                            style={{ color: '#1F271B', backgroundColor: 'transparent' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                            title="Reset Password"
                          >
                            <FiRotateCcw size={13} />
                          </button>
                          <button
                            className="p-1.5 rounded transition-all"
                            style={{ color: '#DC2626', backgroundColor: 'transparent' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                            title="Disable Account"
                          >
                            <FiSlash size={13} />
                          </button>
                          <button
                            className="p-1.5 rounded transition-all"
                            style={{ color: '#1F271B', backgroundColor: 'transparent' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                            title="Force Logout"
                          >
                            <FiLogOut size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}