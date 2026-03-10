'use client'

import { useState, useRef, useEffect } from 'react'
import { FiPlus, FiLock, FiChevronRight, FiSave, FiX } from 'react-icons/fi'

type RoleId = 'owner' | 'manager' | 'employee' | 'viewer'

const roles: { id: RoleId; name: string; protected: boolean }[] = [
  { id: 'owner', name: 'Owner', protected: true },
  { id: 'manager', name: 'Manager', protected: false },
  { id: 'employee', name: 'Employee', protected: false },
  { id: 'viewer', name: 'Viewer', protected: false },
]

const permissionSections = [
  {
    section: 'Jobs',
    permissions: [
      { id: 'jobs.view', label: 'View Jobs' },
      { id: 'jobs.create', label: 'Create Jobs' },
      { id: 'jobs.edit', label: 'Edit Jobs' },
      { id: 'jobs.delete', label: 'Delete Jobs' },
    ],
  },
  {
    section: 'Invoices',
    permissions: [
      { id: 'invoices.view', label: 'View Invoices' },
      { id: 'invoices.create', label: 'Create Invoices' },
      { id: 'invoices.edit', label: 'Edit Invoices' },
      { id: 'invoices.delete', label: 'Delete Invoices' },
    ],
  },
  {
    section: 'Expenses',
    permissions: [
      { id: 'expenses.view', label: 'View Expenses' },
      { id: 'expenses.create', label: 'Create Expenses' },
      { id: 'expenses.edit', label: 'Edit Expenses' },
      { id: 'expenses.delete', label: 'Delete Expenses' },
    ],
  },
  {
    section: 'Users',
    permissions: [
      { id: 'users.view', label: 'View Users' },
      { id: 'users.create', label: 'Invite Users' },
      { id: 'users.edit', label: 'Edit Users' },
      { id: 'users.delete', label: 'Remove Users' },
    ],
  },
  {
    section: 'Settings',
    permissions: [
      { id: 'settings.view', label: 'View Settings' },
      { id: 'settings.edit', label: 'Edit Settings' },
      { id: 'settings.billing', label: 'Manage Billing' },
    ],
  },
]

const defaultPermissions: Record<RoleId, Set<string>> = {
  owner: new Set(permissionSections.flatMap(s => s.permissions.map(p => p.id))),
  manager: new Set([
    'jobs.view', 'jobs.create', 'jobs.edit',
    'invoices.view', 'invoices.create', 'invoices.edit',
    'expenses.view', 'expenses.create',
    'users.view',
    'settings.view',
  ]),
  employee: new Set([
    'jobs.view', 'jobs.create',
    'invoices.view',
    'expenses.view', 'expenses.create',
    'settings.view',
  ]),
  viewer: new Set([
    'jobs.view',
    'invoices.view',
    'expenses.view',
    'settings.view',
  ]),
}

const getRoleColor = (roleId: RoleId) => {
  if (roleId === 'owner') return { bg: 'rgba(176, 132, 204, 0.2)', text: '#8B6AA3', bar: '#B084CC' }
  if (roleId === 'manager') return { bg: 'rgba(43, 80, 170, 0.2)', text: '#1F3A7A', bar: '#2B50AA' }
  if (roleId === 'employee') return { bg: 'rgba(40, 175, 176, 0.2)', text: '#1E8A8B', bar: '#28AFB0' }
  return { bg: '#F3F4F6', text: '#1F271B', bar: '#9CA3AF' }
}

const roleStats = {
  total: roles.length,
  protected: roles.filter(r => r.protected).length,
  custom: roles.filter(r => !r.protected).length,
}

export function AdminRolesPermissions() {
  const [selectedRole, setSelectedRole] = useState<RoleId>('owner')
  const [permissions, setPermissions] = useState<Record<RoleId, Set<string>>>(defaultPermissions)

  const currentPerms = permissions[selectedRole]
  const isProtected = roles.find(r => r.id === selectedRole)?.protected ?? false
  const totalPerms = permissionSections.flatMap(s => s.permissions).length
  const enabledCount = currentPerms.size

  const togglePermission = (permId: string) => {
    if (isProtected) return
    setPermissions(prev => {
      const updated = new Set(prev[selectedRole])
      if (updated.has(permId)) updated.delete(permId)
      else updated.add(permId)
      return { ...prev, [selectedRole]: updated }
    })
  }

  const toggleSection = (sectionPerms: { id: string }[]) => {
    if (isProtected) return
    const allEnabled = sectionPerms.every(p => currentPerms.has(p.id))
    setPermissions(prev => {
      const updated = new Set(prev[selectedRole])
      sectionPerms.forEach(p => allEnabled ? updated.delete(p.id) : updated.add(p.id))
      return { ...prev, [selectedRole]: updated }
    })
  }

  const overviewCards = [
    { label: 'Total Roles', count: roleStats.total, bulletColor: '#28AFB0' },
    { label: 'Protected', count: roleStats.protected, bulletColor: '#B084CC' },
    { label: 'Custom', count: roleStats.custom, bulletColor: '#2B50AA' },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#1F271B' }}>Roles & Permissions</h1>
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all shadow-sm hover:shadow-md"
          style={{ backgroundColor: '#28AFB0', color: 'white' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E8A8B' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#28AFB0' }}
        >
          <FiPlus size={13} />
          Create Role
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Role Overview */}
        <div
          className="rounded shadow-sm border overflow-hidden transition-all hover:shadow-md"
          style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <div className="h-0.5" style={{ backgroundColor: '#28AFB0' }} />
          <div className="p-3">
            <div className="flex justify-between items-start mb-1.5">
              <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Role Overview</p>
              <FiChevronRight size={12} style={{ color: '#1F271B', opacity: 0.5 }} />
            </div>
            <div className="space-y-1.5">
              {overviewCards.map(({ label, count, bulletColor }) => (
                <div key={label} className="w-full flex items-center justify-between py-0.5 px-1 -mx-1 rounded">
                  <span className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: bulletColor }} />
                    <span className="text-[10px] truncate" style={{ color: '#1F271B', opacity: 0.7 }}>{label}</span>
                  </span>
                  <span className="text-xs font-semibold shrink-0" style={{ color: '#1F271B' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Active Role */}
        <div
          className="rounded shadow-sm border overflow-hidden transition-all hover:shadow-md cursor-pointer"
          style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <div className="h-0.5" style={{ backgroundColor: getRoleColor(selectedRole).bar }} />
          <div className="p-3">
            <div className="flex justify-between items-start mb-1.5">
              <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Selected Role</p>
              <FiChevronRight size={12} style={{ color: '#1F271B', opacity: 0.5 }} />
            </div>
            <p className="text-[10px] mb-1.5" style={{ color: '#1F271B', opacity: 0.6 }}>Currently editing</p>
            <span className="text-2xl font-bold" style={{ color: '#1F271B' }}>
              {roles.find(r => r.id === selectedRole)?.name}
            </span>
            <p className="text-[10px] mt-1" style={{ color: '#1F271B', opacity: 0.6 }}>
              {isProtected ? 'Protected role' : 'Editable role'}
            </p>
          </div>
        </div>

        {/* Card 3: Permissions Count */}
        <div
          className="rounded shadow-sm border overflow-hidden transition-all hover:shadow-md cursor-pointer"
          style={{ backgroundColor: '#F3F4F6', borderColor: '#EAEBED' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <div className="h-0.5" style={{ backgroundColor: '#2B50AA' }} />
          <div className="p-3">
            <div className="flex justify-between items-start mb-1.5">
              <p className="text-xs font-semibold" style={{ color: '#1F271B' }}>Permissions</p>
              <FiChevronRight size={12} style={{ color: '#1F271B', opacity: 0.5 }} />
            </div>
            <p className="text-[10px] mb-1.5" style={{ color: '#1F271B', opacity: 0.6 }}>Current role access</p>
            <span className="text-2xl font-bold" style={{ color: '#1F271B' }}>{enabledCount}</span>
            <p className="text-[10px] mt-1" style={{ color: '#1F271B', opacity: 0.6 }}>of {totalPerms} total</p>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div className="bg-white rounded shadow-sm border p-3" style={{ borderColor: '#EAEBED', marginTop: '2rem' }}>
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
          <h2 className="text-base font-bold" style={{ color: '#1F271B' }}>
            Manage Permissions
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left: Roles List */}
          <div className="w-full lg:w-44 shrink-0">
            <div className="rounded border overflow-hidden" style={{ borderColor: '#EAEBED' }}>
              <div style={{ backgroundColor: '#F3F4F6' }} className="px-3 py-2">
                <p className="text-[10px] font-semibold" style={{ color: '#1F271B' }}>Roles</p>
              </div>
              {roles.map((role, idx) => {
                const color = getRoleColor(role.id)
                const isSelected = selectedRole === role.id
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left transition-colors border-t text-xs"
                    style={{
                      borderColor: '#EAEBED',
                      backgroundColor: isSelected ? 'rgba(40, 175, 176, 0.07)' : 'white',
                      color: '#1F271B',
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#F9FAFB' }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'white' }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: isSelected ? color.bar : '#D1D5DB' }}
                      />
                      <span className="font-medium truncate">{role.name}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {role.protected && <FiLock size={10} style={{ color: '#1F271B', opacity: 0.35 }} />}
                      {isSelected && <FiChevronRight size={11} style={{ color: '#28AFB0' }} />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right: Permissions Matrix */}
          <div className="flex-1 min-w-0">
            {/* Role label */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style={{
                  backgroundColor: getRoleColor(selectedRole).bg,
                  color: getRoleColor(selectedRole).text,
                }}
              >
                {isProtected && <FiLock size={9} />}
                {roles.find(r => r.id === selectedRole)?.name} Permissions
              </span>
              {isProtected && (
                <span className="text-[10px]" style={{ color: '#1F271B', opacity: 0.5 }}>
                  Protected — cannot be edited
                </span>
              )}
            </div>

            {/* Permissions Table */}
            <div className="rounded overflow-hidden border" style={{ borderColor: '#EAEBED' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#F3F4F6' }}>
                    <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Section</th>
                    <th className="px-3 py-2 text-left text-[10px] font-semibold" style={{ color: '#1F271B' }}>Permission</th>
                    <th className="px-3 py-2 text-center text-[10px] font-semibold" style={{ color: '#1F271B' }}>Access</th>
                  </tr>
                </thead>
                <tbody>
                  {permissionSections.map((section) => {
                    const allEnabled = section.permissions.every(p => currentPerms.has(p.id))
                    const someEnabled = section.permissions.some(p => currentPerms.has(p.id))
                    return section.permissions.map((perm, permIdx) => (
                      <tr
                        key={perm.id}
                        className="border-t transition-colors"
                        style={{ borderColor: '#EAEBED' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white' }}
                      >
                        {permIdx === 0 ? (
                          <td
                            className="px-3 py-2 align-top"
                            rowSpan={section.permissions.length}
                            style={{ borderRight: '1px solid #EAEBED', verticalAlign: 'middle' }}
                          >
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: someEnabled ? '#28AFB0' : '#D1D5DB' }}
                              />
                              <span className="text-xs font-semibold" style={{ color: '#1F271B' }}>{section.section}</span>
                            </div>
                          </td>
                        ) : null}
                        <td className="px-3 py-2">
                          <span className="text-xs" style={{ color: '#1F271B', opacity: 0.75 }}>{perm.label}</span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            disabled={isProtected}
                            onClick={() => togglePermission(perm.id)}
                            className="inline-flex items-center justify-center w-4 h-4 rounded transition-all"
                            style={{
                              backgroundColor: currentPerms.has(perm.id) ? '#28AFB0' : '#EAEBED',
                              cursor: isProtected ? 'default' : 'pointer',
                            }}
                            onMouseEnter={(e) => {
                              if (!isProtected) {
                                e.currentTarget.style.backgroundColor = currentPerms.has(perm.id) ? '#1E8A8B' : '#D1D5DB'
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = currentPerms.has(perm.id) ? '#28AFB0' : '#EAEBED'
                            }}
                          >
                            {currentPerms.has(perm.id) && (
                              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                <path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  })}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            {!isProtected && (
              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-medium transition-all shadow-sm"
                  style={{ borderColor: '#EAEBED', color: '#1F271B', backgroundColor: '#F3F4F6' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#EAEBED' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
                >
                  <FiX size={12} />
                  Cancel
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all shadow-sm hover:shadow-md"
                  style={{ backgroundColor: '#28AFB0', color: 'white' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E8A8B' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#28AFB0' }}
                >
                  <FiSave size={12} />
                  Save Permissions
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}