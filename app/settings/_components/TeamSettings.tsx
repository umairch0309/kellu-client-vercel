'use client'

import { useState, useEffect, useCallback } from 'react'
import { FiPlus, FiX, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { labelClass, inputClass } from './settingsTypes'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export type TeamMemberRow = {
  id: number | string
  name: string
  email: string
  phone: string
  rut: string
  role: string
  picture?: string
  active: boolean
  lastLogin: string | null
}

function extractTeamList(json: unknown): unknown[] {
  if (json == null || typeof json !== 'object') return []
  const obj = json as Record<string, unknown>
  const data = obj.data
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const inner = (data as Record<string, unknown>).data
    if (Array.isArray(inner)) return inner
  }
  if (Array.isArray(data)) return data
  return []
}

function normalizeTeamMember(raw: Record<string, unknown>): TeamMemberRow {
  const id = raw.id ?? (raw as Record<string, unknown>).userId
  const user = (raw.user ?? (raw as Record<string, unknown>).User) as Record<string, unknown> | undefined
  const role = (raw.role ?? (raw as Record<string, unknown>).Role) as Record<string, unknown> | undefined
  const name = typeof user?.name === 'string' ? user.name : '—'
  const email = typeof user?.email === 'string' ? user.email : '—'
  const phone = typeof user?.phone_no === 'string' ? user.phone_no : (typeof user?.phone === 'string' ? (user.phone as string) : '')
  const roleName = typeof role?.name === 'string' ? role.name : (typeof role?.displayName === 'string' ? (role?.displayName as string) : '—')
  const isActive = raw.isActive !== false
  const lastLogin = typeof raw.lastLogin === 'string' ? raw.lastLogin : (typeof (raw as Record<string, unknown>).last_login === 'string' ? (raw as Record<string, unknown>).last_login as string : (user && typeof (user as Record<string, unknown>).lastLogin === 'string' ? (user as Record<string, unknown>).lastLogin as string : null))
  return {
    id: typeof id === 'string' ? id : (typeof id === 'number' ? id : String(id)),
    name,
    email,
    phone,
    rut: typeof user?.rut === 'string' ? user.rut : '',
    role: roleName,
    active: isActive,
    lastLogin: lastLogin || null,
  }
}

export type RoleOption = { id: string; name: string }

/** Fetch roles from GET /api/roles (same as RolesPermissionsSettings) - id and name for dropdown and POST */
function fetchRoles(): Promise<RoleOption[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
  return fetch(`${baseUrl}/api/roles`, { method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'include' })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    })
    .then((json: unknown) => {
      if (!json || typeof json !== 'object') return []
      const obj = json as Record<string, unknown>
      const raw = obj.data
      if (!Array.isArray(raw)) return []
      return raw.map((r: unknown) => {
        const row = r as Record<string, unknown>
        const id = String(row.id ?? '')
        const name = String(row.name ?? row.displayName ?? '')
        return id && name ? { id, name } : null
      }).filter((x): x is RoleOption => x != null)
    })
    .catch(() => [])
}

export type AddTeamMemberPayload = {
  name: string
  email: string
  phone: string
  password: string
  roleId: string
  rut?: string
  includeInNotificationsWhenAssigned?: boolean
}

export type UpdateTeamMemberPayload = {
  name: string
  email: string
  phone: string
  roleId: string
  rut?: string
  includeInNotificationsWhenAssigned?: boolean
  password?: string
}

function AddTeamMemberModal({
  roles,
  onClose,
  onSaveAdd,
  onSaveEdit,
  initial,
  loading,
  error,
}: {
  roles: RoleOption[]
  onClose: () => void
  onSaveAdd?: (payload: AddTeamMemberPayload) => void
  onSaveEdit?: (memberId: number | string, payload: UpdateTeamMemberPayload) => void
  initial?: { memberId?: number | string; name: string; email: string; phone: string; rut: string; role: string; roleId?: string; hasPicture: boolean }
  loading?: boolean
  error?: string | null
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [rut, setRut] = useState(initial?.rut ?? '')
  const [roleId, setRoleId] = useState(initial?.roleId ?? initial?.role ?? roles[0]?.id ?? '')
  const [password, setPassword] = useState('')
  const [hasPicture, setHasPicture] = useState(!!initial?.hasPicture)

  const isAdd = !initial
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const nameTrim = name.trim()
    const emailTrim = email.trim()
    const phoneTrim = phone.trim()
    if (!nameTrim || !emailTrim) return
    if (isAdd) {
      if (!phoneTrim || !password.trim() || !roleId) return
      onSaveAdd?.({
        name: nameTrim,
        email: emailTrim,
        phone: phoneTrim,
        password: password.trim(),
        roleId,
        rut: rut.trim() || undefined,
        includeInNotificationsWhenAssigned: hasPicture || undefined,
      })
    } else if (initial?.memberId != null) {
      onSaveEdit?.(initial.memberId, {
        name: nameTrim,
        email: emailTrim,
        phone: phoneTrim,
        roleId,
        rut: rut.trim() || undefined,
        includeInNotificationsWhenAssigned: hasPicture || undefined,
        password: password.trim() || undefined,
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" style={{ borderColor: '#EAEBED', border: '1px solid #EAEBED' }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold" style={{ color: '#1F271B' }}>{initial ? 'Edit team member' : 'Add team member'}</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded hover:bg-gray-100" style={{ color: '#1F271B' }} aria-label="Close">
            <FiX size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="px-3 py-2 rounded text-sm bg-red-50 border border-red-200" style={{ color: '#B91C1C' }}>{error}</div>
          )}
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Name <span style={{ color: '#B91C1C' }}>*</span></label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Full name" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Email <span style={{ color: '#B91C1C' }}>*</span></label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email@company.com" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Phone number <span style={{ color: '#B91C1C' }}>*</span></label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required={isAdd} placeholder="+1 234-567-8900" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>RUT (national Identity Document) <span style={{ opacity: 0.6 }}>(Optional)</span></label>
            <input type="text" value={rut} onChange={(e) => setRut(e.target.value)} placeholder="RUT / ID number" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Role <span style={{ color: '#B91C1C' }}>*</span></label>
            <select value={roleId} onChange={(e) => setRoleId(e.target.value)} required className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }}>
              {roles.length === 0 ? (
                <option value="">Select role</option>
              ) : (
                roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))
              )}
            </select>
            <p className="text-xs mt-1" style={{ color: '#1F271B', opacity: 0.6 }}>Assigned role may see the portal in a different design view. Configure in Settings → Roles & Permissions.</p>
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Picture <span style={{ opacity: 0.6 }}>(Optional)</span></label>
            <p className="text-xs mb-2" style={{ color: '#1F271B', opacity: 0.6 }}>
              To be sent with email and WhatsApp notifications when this member is assigned to a job.
            </p>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full border flex items-center justify-center shrink-0" style={{ borderColor: '#EAEBED', backgroundColor: '#F3F4F6' }}>
                {hasPicture ? <span className="text-xs" style={{ color: '#1F271B', opacity: 0.6 }}>Photo</span> : <span className="text-xs" style={{ color: '#1F271B', opacity: 0.4 }}>No photo</span>}
              </div>
              <div className="flex-1">
                <input type="file" accept="image/*" id="team-member-photo" className="hidden" />
                <label htmlFor="team-member-photo" className="inline-block px-3 py-2 rounded text-sm font-medium cursor-pointer" style={{ backgroundColor: '#EAEBED', color: '#1F271B' }}>
                  Upload picture
                </label>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input type="checkbox" checked={hasPicture} onChange={(e) => setHasPicture(e.target.checked)} className="w-4 h-4 rounded" style={{ accentColor: '#28AFB0' }} />
                  <span className="text-xs" style={{ color: '#1F271B' }}>Include in notifications when assigned</span>
                </label>
              </div>
            </div>
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Password {isAdd && <span style={{ color: '#B91C1C' }}>*</span>}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required={isAdd} placeholder={initial ? 'Leave blank to keep current' : 'Set password'} className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
            {initial && <p className="text-xs mt-1" style={{ color: '#1F271B', opacity: 0.6 }}>Leave blank to keep current password.</p>}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 border rounded text-sm font-medium" style={{ borderColor: '#EAEBED', color: '#1F271B' }}>Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded text-sm font-medium text-white disabled:opacity-70" style={{ backgroundColor: '#28AFB0' }}>{loading ? 'Saving…' : initial ? 'Save' : 'Add team member'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function TeamSettings() {
  const [members, setMembers] = useState<TeamMemberRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [roles, setRoles] = useState<RoleOption[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMemberRow | null>(null)
  const [addMemberLoading, setAddMemberLoading] = useState(false)
  const [addMemberError, setAddMemberError] = useState<string | null>(null)
  const [memberToDelete, setMemberToDelete] = useState<TeamMemberRow | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    fetchRoles().then(setRoles)
  }, [])

  const fetchTeam = useCallback(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    setLoading(true)
    setError(null)
    fetch(`${baseUrl}/api/team`, { method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`)
        return res.json()
      })
      .then((json: unknown) => {
        const rawList = extractTeamList(json)
        const list = rawList
          .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
          .map((item) => normalizeTeamMember(item))
        setMembers(list)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load team')
        setMembers([])
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchTeam() }, [fetchTeam])

  const openAdd = () => {
    setEditingMember(null)
    setModalOpen(true)
  }
  const openEdit = (m: TeamMemberRow) => {
    setEditingMember(m)
    setModalOpen(true)
  }

  const handleUpdateMember = useCallback(async (memberId: number | string, payload: UpdateTeamMemberPayload) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    setAddMemberError(null)
    setAddMemberLoading(true)
    try {
      const res = await fetch(`${baseUrl}/api/team/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: payload.name,
          email: payload.email,
          phoneNumber: payload.phone,
          roleId: payload.roleId,
          ...(payload.rut != null && payload.rut !== '' && { rut: payload.rut }),
          ...(payload.includeInNotificationsWhenAssigned != null && { includeInNotificationsWhenAssigned: payload.includeInNotificationsWhenAssigned }),
          ...(payload.password != null && payload.password !== '' && { password: payload.password }),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message = (data as { message?: string }).message ?? `Request failed (${res.status})`
        setAddMemberError(message)
        return
      }
      fetchTeam()
      setModalOpen(false)
      setEditingMember(null)
    } catch (err) {
      setAddMemberError(err instanceof Error ? err.message : 'Failed to update team member')
    } finally {
      setAddMemberLoading(false)
    }
  }, [])

  const handleAddMember = useCallback(async (payload: AddTeamMemberPayload) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    setAddMemberError(null)
    setAddMemberLoading(true)
    try {
      const res = await fetch(`${baseUrl}/api/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: payload.name,
          email: payload.email,
          password: payload.password,
          phoneNumber: payload.phone,
          roleId: payload.roleId,
          ...(payload.rut != null && payload.rut !== '' && { rut: payload.rut }),
          ...(payload.includeInNotificationsWhenAssigned != null && { includeInNotificationsWhenAssigned: payload.includeInNotificationsWhenAssigned }),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message = (data as { message?: string }).message ?? `Request failed (${res.status})`
        setAddMemberError(message)
        return
      }
      fetchTeam()
      setModalOpen(false)
      setEditingMember(null)
    } catch (err) {
      setAddMemberError(err instanceof Error ? err.message : 'Failed to add team member')
    } finally {
      setAddMemberLoading(false)
    }
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!memberToDelete) return
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    setDeleteLoading(true)
    try {
      const res = await fetch(`${baseUrl}/api/team/${memberToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message = (data as { message?: string }).message ?? `Request failed (${res.status})`
        alert(message)
        return
      }
      fetchTeam()
      setMemberToDelete(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete team member')
    } finally {
      setDeleteLoading(false)
    }
  }, [memberToDelete])

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1F271B' }}>Team Management</h1>
        <p className="text-sm mt-1" style={{ color: '#1F271B', opacity: 0.7 }}>
          Add or manage team members. Deactivated users cannot be assigned to new visits; past visits still show them as assigned.
        </p>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={openAdd}
          className="px-4 py-2 rounded text-sm font-medium text-white flex items-center gap-2"
          style={{ backgroundColor: '#28AFB0' }}
        >
          <FiPlus size={18} />
          Add team member
        </button>
      </div>
      <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#EAEBED' }}>
        <TooltipProvider delayDuration={200}>
        <table className="w-full">
          <thead style={{ backgroundColor: '#F3F4F6' }}>
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1F271B' }}>NAME</th>
              <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1F271B' }}>EMAIL</th>
              <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1F271B' }}>LAST LOGIN</th>
              <th className="px-4 py-3 text-left text-sm font-semibold w-24" style={{ color: '#1F271B' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm" style={{ color: '#1F271B', opacity: 0.7 }}>Loading team…</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center">
                  <p className="text-sm mb-2" style={{ color: '#B91C1C' }}>{error}</p>
                  <button type="button" onClick={() => fetchTeam()} className="px-3 py-1.5 rounded text-sm text-white" style={{ backgroundColor: '#28AFB0' }}>Try again</button>
                </td>
              </tr>
            ) : (
            members.map((m) => {
              const active = m.active
              const initials = m.name.split(/\s+/).map((n) => n[0]).join('').toUpperCase().slice(0, 2)
              const lastLoginDisplay = m.lastLogin ? (() => { const d = new Date(m.lastLogin); return Number.isNaN(d.getTime()) ? m.lastLogin : d.toLocaleString() })() : '—'
              return (
                <tr key={m.id} className="border-b" style={{ borderColor: '#EAEBED', opacity: active ? 1 : 0.7 }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium shrink-0" style={{ backgroundColor: active ? 'rgba(43, 80, 170, 0.2)' : '#E5E7EB', color: active ? '#1F3A7A' : '#6B7280' }}>
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#1F271B' }}>{m.name}</p>
                        <p className="text-xs" style={{ color: '#1F271B', opacity: 0.7 }}>{m.role}{!active && ' · Inactive'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#1F271B', opacity: 0.8 }}>{m.email}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#1F271B', opacity: 0.6 }}>{lastLoginDisplay}</td>
                  <td className="px-4 py-3 relative">
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => openEdit(m)}
                            className="p-1.5 rounded transition-colors hover:opacity-90"
                            style={{ color: '#28AFB0' }}
                            aria-label="Update team member"
                          >
                            <FiEdit2 size={18} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="z-[100]">Update team member</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => setMemberToDelete(m)}
                            className="p-1.5 rounded hover:bg-red-50 transition-colors"
                            style={{ color: '#B91C1C' }}
                            aria-label="Delete team member"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="z-[100]">Delete team member</TooltipContent>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              )
            })
            )}
          </tbody>
        </table>
        </TooltipProvider>
      </div>

      <Dialog open={!!memberToDelete} onOpenChange={(open) => { if (!open) setMemberToDelete(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete team member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove &quot;{memberToDelete?.name}&quot; from the team? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setMemberToDelete(null)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteConfirm} disabled={deleteLoading}>
              {deleteLoading ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {modalOpen && (
        <AddTeamMemberModal
          roles={roles}
          initial={editingMember ? { memberId: editingMember.id, name: editingMember.name, email: editingMember.email, phone: editingMember.phone, rut: editingMember.rut, role: editingMember.role, roleId: roles.find((r) => r.name === editingMember.role)?.id ?? '', hasPicture: !!editingMember.picture } : undefined}
          onClose={() => { setModalOpen(false); setEditingMember(null); setAddMemberError(null) }}
          onSaveEdit={editingMember ? handleUpdateMember : undefined}
          onSaveAdd={!editingMember ? handleAddMember : undefined}
          loading={addMemberLoading}
          error={addMemberError}
        />
      )}
    </div>
  )
}
