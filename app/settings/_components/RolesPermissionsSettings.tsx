'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { FiPlus, FiX, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi'
import { sectionTitleClass, labelClass, inputClass, type RoleDef, type PermissionResource } from './settingsTypes'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

function AddEditRoleModal({
  role,
  allPermissions,
  permissionMatrix,
  onClose,
  onSave,
  loading,
  error,
}: {
  role: RoleDef | null
  allPermissions: { id: string; label: string }[]
  permissionMatrix: PermissionResource[]
  onClose: () => void
  onSave: (name: string, description: string, permissions: string[]) => void
  loading?: boolean
  error?: string | null
}) {
  const [name, setName] = useState(role?.name ?? '')
  const [description, setDescription] = useState(role?.description ?? '')
  const [permissions, setPermissions] = useState<string[]>(role?.permissions ?? [])

  const isFullAccess = permissions.includes('all')

  const toggleAll = () => {
    setPermissions(isFullAccess ? [] : ['all'])
  }

  const toggleResourceAll = (resource: string, actions: string[]) => {
    const keys = actions.map((a) => `${resource}:${a}`)
    const allChecked = keys.every((k) => permissions.includes(k))
    if (allChecked) {
      setPermissions((prev) => prev.filter((p) => !keys.includes(p)))
    } else {
      setPermissions((prev) => {
        const withoutAll = prev.filter((p) => p !== 'all')
        return Array.from(new Set([...withoutAll, ...keys]))
      })
    }
  }

  const togglePermission = (id: string) => {
    if (id === 'all') { toggleAll(); return }
    setPermissions((prev) => {
      const withoutAll = prev.filter((p) => p !== 'all')
      return withoutAll.includes(id)
        ? withoutAll.filter((p) => p !== id)
        : [...withoutAll, id]
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave(name.trim(), description.trim(), permissions)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
        style={{ borderColor: '#EAEBED', border: '1px solid #EAEBED' }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold" style={{ color: '#1F271B' }}>
            {role ? 'Edit role' : 'Create custom role'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-gray-100"
            style={{ color: '#1F271B' }}
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Role name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Field worker"
              className={inputClass}
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
            />
          </div>

          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this role can do"
              className={inputClass}
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
            />
          </div>

          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Permissions</label>

            <label
              className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border mb-3"
              style={{
                borderColor: isFullAccess ? '#28AFB0' : '#EAEBED',
                backgroundColor: isFullAccess ? 'rgba(40,175,176,0.07)' : 'transparent',
              }}
            >
              <input
                type="checkbox"
                checked={isFullAccess}
                onChange={toggleAll}
                className="w-4 h-4 rounded"
                style={{ accentColor: '#28AFB0' }}
              />
              <span className="text-sm font-medium" style={{ color: '#1F271B' }}>
                Full access (all modules and configuration)
              </span>
            </label>

            {!isFullAccess && (
              <div
                className="border rounded-lg overflow-hidden"
                style={{ borderColor: '#EAEBED', maxHeight: 340, overflowY: 'auto' }}
              >
                {permissionMatrix.length === 0 ? (
                  <p className="px-4 py-3 text-sm" style={{ color: '#1F271B', opacity: 0.5 }}>
                    No permission resources loaded.
                  </p>
                ) : (
                  permissionMatrix.filter((item) => item?.resource != null && typeof item.resource === 'string').map(({ resource, actions }) => {
                    const actionsList = Array.isArray(actions) ? actions : []
                    const keys = actionsList.map((a) => `${resource}:${a}`)
                    const allChecked = keys.every((k) => permissions.includes(k))
                    const someChecked = keys.some((k) => permissions.includes(k))

                    return (
                      <div
                        key={resource}
                        className="border-b last:border-b-0"
                        style={{ borderColor: '#EAEBED' }}
                      >
                        <label
                          className="flex items-center gap-2 px-4 py-2 cursor-pointer"
                          style={{ backgroundColor: '#F9FAFB' }}
                        >
                          <input
                            type="checkbox"
                            checked={allChecked}
                            ref={(el) => {
                              if (el) el.indeterminate = !allChecked && someChecked
                            }}
                            onChange={() => toggleResourceAll(resource, actionsList)}
                            className="w-4 h-4 rounded"
                            style={{ accentColor: '#28AFB0' }}
                          />
                          <span
                            className="text-sm font-semibold capitalize"
                            style={{ color: '#1F271B' }}
                          >
                            {resource}
                          </span>
                        </label>

                        <div className="px-5 pb-2.5 flex flex-wrap gap-x-5 gap-y-1">
                          {actionsList.map((action) => {
                            const key = `${resource}:${action}`
                            return (
                              <label
                                key={key}
                                className="flex items-center gap-1.5 cursor-pointer py-1"
                              >
                                <input
                                  type="checkbox"
                                  checked={permissions.includes(key)}
                                  onChange={() => togglePermission(key)}
                                  className="w-3.5 h-3.5 rounded"
                                  style={{ accentColor: '#28AFB0' }}
                                />
                                <span className="text-xs" style={{ color: '#1F271B' }}>
                                  {action}
                                </span>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-lg p-3" style={{ backgroundColor: '#FEF2F2' }}>
              <p className="text-sm" style={{ color: '#DC2626' }}>{error}</p>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border rounded text-sm font-medium disabled:opacity-50"
              style={{ borderColor: '#EAEBED', color: '#1F271B' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded text-sm font-medium text-white disabled:opacity-50 flex items-center gap-2"
              style={{ backgroundColor: '#28AFB0' }}
            >
              {loading && (
                <span
                  className="w-3.5 h-3.5 border-2 rounded-full animate-spin inline-block"
                  style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }}
                />
              )}
              {role ? 'Save' : loading ? 'Creating…' : 'Create role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/** Parse API role (from GET or POST) into RoleDef */
function parseRoleFromApi(data: Record<string, unknown>, fallbackName = '', fallbackDescription = ''): RoleDef {
  const rawPerms = Array.isArray(data.permissions) ? data.permissions : []
  const permissions: string[] = rawPerms.map((p: unknown) => {
    if (typeof p === 'string' && p.includes(':')) return p
    const o = p as Record<string, unknown>
    const perm = o?.permission as Record<string, unknown> | undefined
    if (perm && typeof perm.resource === 'string' && typeof perm.action === 'string') {
      return `${perm.resource}:${perm.action}`
    }
    return ''
  }).filter(Boolean)
  return {
    id: String(data.id ?? ''),
    name: String(data.name ?? data.displayName ?? fallbackName),
    description: String(data.description ?? fallbackDescription),
    permissions,
    isSystem: data.isSystem === true,
  }
}

export default function RolesPermissionsSettings() {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<RoleDef | null>(null)

  const [permissionMatrix, setPermissionMatrix] = useState<PermissionResource[]>([])
  const [matrixLoading, setMatrixLoading] = useState(true)
  const [matrixError, setMatrixError] = useState<string | null>(null)

  const [rolesList, setRolesList] = useState<RoleDef[]>([])
  const [rolesLoading, setRolesLoading] = useState(true)
  const [rolesError, setRolesError] = useState<string | null>(null)
  const [roleSearchQuery, setRoleSearchQuery] = useState('')

  /** Normalize API matrix to { resource: string, actions: string[] }[] so downstream code is safe */
  const normalizePermissionMatrix = (raw: unknown): PermissionResource[] => {
    if (!Array.isArray(raw)) return []
    return raw
      .map((item: unknown) => {
        const o = item as Record<string, unknown>
        const resource = typeof o?.resource === 'string' ? o.resource : typeof o?.name === 'string' ? o.name : String(o?.resource ?? o?.name ?? '')
        const actions = Array.isArray(o?.actions) ? o.actions : Array.isArray(o?.permissions) ? o.permissions : []
        const actionStrings: string[] = actions
          .map((a: unknown) => (typeof a === 'string' ? a : String((a as Record<string, unknown>)?.action ?? '')))
          .filter((s): s is string => typeof s === 'string' && s.length > 0)
        return { resource: resource.trim(), actions: actionStrings }
      })
      .filter((item) => item.resource.length > 0)
  }

  useEffect(() => {
    setMatrixLoading(true)
    setMatrixError(null)
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    fetch(`${baseUrl}/api/roles/permissions/matrix`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((json) => {
        const raw = json?.data
        if (!json?.success || !Array.isArray(raw)) {
          throw new Error((json as { message?: string })?.message ?? 'Unexpected response shape')
        }
        setPermissionMatrix(normalizePermissionMatrix(raw))
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to load permissions'
        setMatrixError(msg)
      })
      .finally(() => setMatrixLoading(false))
  }, [])

  const fetchRoles = useCallback(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    setRolesLoading(true)
    setRolesError(null)
    fetch(`${baseUrl}/api/roles`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((json) => {
        const raw = json?.data
        if (!json?.success || !Array.isArray(raw)) {
          throw new Error((json as { message?: string })?.message ?? 'Unexpected response shape')
        }
        const roles: RoleDef[] = raw.map((r: unknown) => parseRoleFromApi(r as Record<string, unknown>))
        setRolesList(roles)
      })
      .catch((err: unknown) => {
        setRolesError(err instanceof Error ? err.message : 'Failed to load roles')
      })
      .finally(() => setRolesLoading(false))
  }, [])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  const allPermissions = useMemo<{ id: string; label: string }[]>(() => {
    const options: { id: string; label: string }[] = [
      { id: 'all', label: 'Full access (all modules and configuration)' },
    ]
    permissionMatrix.forEach(({ resource, actions }) => {
      if (resource == null || typeof resource !== 'string') return
      const list = Array.isArray(actions) ? actions : []
      list.forEach((action) => {
        options.push({ id: `${resource}:${action}`, label: `${resource} — ${action}` })
      })
    })
    return options
  }, [permissionMatrix])

  const formatPermissionsForSearch = (permissions: string[]): string => {
    if (permissions.includes('all')) return 'full access'
    const grouped: Record<string, string[]> = {}
    permissions.forEach((p) => {
      const [resource, action] = p.split(':')
      if (resource && action) {
        if (!grouped[resource]) grouped[resource] = []
        grouped[resource].push(action)
      }
    })
    return Object.entries(grouped)
      .map(([res, acts]) => `${res} ${acts.join(' ')}`)
      .join(' ')
  }

  const filteredTableRows = useMemo(() => {
    const q = roleSearchQuery.trim().toLowerCase()
    if (!q) return rolesList
    return rolesList.filter((r) => {
      const name = (r.name ?? '').toLowerCase()
      const description = (r.description ?? '').toLowerCase()
      const permsText = formatPermissionsForSearch(r.permissions).toLowerCase()
      return name.includes(q) || description.includes(q) || permsText.includes(q)
    })
  }, [rolesList, roleSearchQuery])

  const tableRows = filteredTableRows

  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [roleToDelete, setRoleToDelete] = useState<RoleDef | null>(null)

  /** Convert UI permission strings ("resource:action" or "all") to API shape */
  const permissionsToApi = (perms: string[]): { resource: string; action: string }[] => {
    if (perms.includes('all')) {
      return permissionMatrix.flatMap(({ resource, actions }) => {
        if (resource == null || typeof resource !== 'string') return []
        return (Array.isArray(actions) ? actions : []).map((action) => ({ resource, action }))
      })
    }
    return perms
      .filter((p) => p.includes(':'))
      .map((p) => {
        const [resource, action] = p.split(':')
        return { resource: resource ?? '', action: action ?? '' }
      })
      .filter((p) => p.resource && p.action)
  }

  const handleSaveCustomRole = async (name: string, description: string, permissions: string[]) => {
    setCreateError(null)
    setCreateLoading(true)
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    const body = {
      name: name.trim(),
      displayName: null as string | null,
      description: description.trim() || null,
      permissions: permissionsToApi(permissions),
    }
    try {
      if (editingRole && !editingRole.isSystem) {
        const res = await fetch(`${baseUrl}/api/roles/${editingRole.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json?.message ?? `HTTP ${res.status}`)
        if (!json.success) throw new Error(json?.message ?? 'Update failed')
        fetchRoles()
        setAddModalOpen(false)
        setEditingRole(null)
        return
      }

      const res = await fetch(`${baseUrl}/api/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json?.message ?? `HTTP ${res.status}`)
      }
      if (!json.success || !json.data) {
        throw new Error(json?.message ?? 'Invalid response')
      }
      fetchRoles()
      setAddModalOpen(false)
      setEditingRole(null)
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to save role')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleDeleteClick = (role: RoleDef) => {
    setRoleToDelete(role)
  }

  const handleDeleteConfirm = async () => {
    if (!roleToDelete) return
    const roleId = roleToDelete.id
    setDeleteError(null)
    setDeleteLoadingId(roleId)
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    try {
      const res = await fetch(`${baseUrl}/api/roles/${roleId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.message ?? `HTTP ${res.status}`)
      if (!json.success) throw new Error(json?.message ?? 'Delete failed')
      setRoleToDelete(null)
      fetchRoles()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete role')
    } finally {
      setDeleteLoadingId(null)
    }
  }

  const formatPermissions = (permissions: string[]): string => {
    if (permissions.includes('all')) return 'Full access'
    const grouped: Record<string, string[]> = {}
    permissions.forEach((p) => {
      const [resource, action] = p.split(':')
      if (resource && action) {
        if (!grouped[resource]) grouped[resource] = []
        grouped[resource].push(action)
      }
    })
    return (
      Object.entries(grouped)
        .map(([res, acts]) => `${res}: ${acts.join(', ')}`)
        .join(' | ') || '—'
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1F271B' }}>Roles & Permission</h1>
      </div>

      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>Minimum required roles</h2>
        <ul className="space-y-2 text-sm" style={{ color: '#1F271B', opacity: 0.85 }}>
          <li>
            <strong>Admin / Owner (Service company)</strong> — Full access to all modules and configuration.
          </li>
          <li>
            <strong>Technician</strong> — Access only to assigned jobs; can update job/visit status and submit
            work reports.
          </li>
        </ul>
      </section>

      <section className="bg-white rounded-lg border p-6" style={{ borderColor: '#EAEBED' }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className={sectionTitleClass} style={{ color: '#1F271B' }}>Roles</h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:flex-1 sm:max-w-md sm:justify-end">
            <div className="relative flex-1 min-w-0 max-w-md sm:max-w-xs">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" size={16} style={{ color: '#1F271B', opacity: 0.5 }} />
              <input
                type="text"
                placeholder="Search roles…"
                value={roleSearchQuery}
                onChange={(e) => setRoleSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2 border rounded text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: '#EAEBED', color: '#1F271B' }}
                aria-label="Search roles"
              />
              {roleSearchQuery && (
                <button
                  type="button"
                  onClick={() => setRoleSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-black/5"
                  style={{ color: '#1F271B', opacity: 0.6 }}
                  aria-label="Clear search"
                >
                  <FiX size={16} />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => { setEditingRole(null); setAddModalOpen(true) }}
              disabled={matrixLoading}
              className="px-4 py-2 rounded text-sm font-medium text-white flex items-center gap-2 disabled:opacity-50 shrink-0"
              style={{ backgroundColor: '#28AFB0' }}
            >
              <FiPlus size={18} />
              Create custom role
            </button>
          </div>
        </div>

        {deleteError && (
          <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: '#FEF2F2' }}>
            <p className="text-sm" style={{ color: '#DC2626' }}>{deleteError}</p>
            <button
              type="button"
              onClick={() => setDeleteError(null)}
              className="text-xs mt-1 underline"
              style={{ color: '#DC2626' }}
            >
              Dismiss
            </button>
          </div>
        )}

        {rolesLoading && (
          <div className="flex items-center gap-2 py-6">
            <div
              className="w-4 h-4 border-2 rounded-full animate-spin"
              style={{ borderColor: '#28AFB0', borderTopColor: 'transparent' }}
            />
            <span className="text-sm" style={{ color: '#1F271B', opacity: 0.6 }}>Loading roles…</span>
          </div>
        )}

        {!rolesLoading && rolesError && (
          <div className="rounded-lg p-3" style={{ backgroundColor: '#FEF2F2' }}>
            <p className="text-sm" style={{ color: '#DC2626' }}>Failed to load roles: {rolesError}</p>
          </div>
        )}

        {!rolesLoading && !rolesError && (
          <div className="border rounded-lg overflow-hidden" style={{ borderColor: '#EAEBED' }}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
              <thead style={{ backgroundColor: '#F3F4F6' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1F271B' }}>Role</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1F271B' }}>Description</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#1F271B' }}>Permissions</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold w-28" style={{ color: '#1F271B' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((r) => (
                  <tr key={r.id} className="border-b" style={{ borderColor: '#EAEBED' }}>
                    <td className="px-4 py-3">
                      <span className="font-medium" style={{ color: '#1F271B' }}>{r.name}</span>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#1F271B', opacity: 0.8 }}>{r.description}</td>
                    <td
                      className="px-4 py-3 text-xs max-w-xs truncate"
                      style={{ color: '#1F271B', opacity: 0.8 }}
                      title={formatPermissions(r.permissions)}
                    >
                      {formatPermissions(r.permissions)}
                    </td>
                    <td className="px-4 py-3">
                      {!r.isSystem && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => { setEditingRole(r); setAddModalOpen(true) }}
                            className="p-2 rounded hover:bg-black/5 transition-colors"
                            style={{ color: '#28AFB0' }}
                            title="Update role"
                            aria-label="Update role"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(r)}
                            disabled={deleteLoadingId === r.id}
                            className="p-2 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                            style={{ color: '#DC2626' }}
                            title="Delete role"
                            aria-label="Delete role"
                          >
                            {deleteLoadingId === r.id ? (
                              <span
                                className="w-4 h-4 border-2 rounded-full animate-spin inline-block"
                                style={{ borderColor: '#DC2626', borderTopColor: 'transparent' }}
                              />
                            ) : (
                              <FiTrash2 size={18} />
                            )}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </section>

      <Dialog open={!!roleToDelete} onOpenChange={(open) => { if (!open) setRoleToDelete(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the role &quot;{roleToDelete?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRoleToDelete(null)}
              disabled={!!deleteLoadingId}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={!!deleteLoadingId}
            >
              {deleteLoadingId ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {addModalOpen && (
        <AddEditRoleModal
          role={editingRole}
          allPermissions={allPermissions}
          permissionMatrix={permissionMatrix}
          onClose={() => { setAddModalOpen(false); setEditingRole(null); setCreateError(null) }}
          onSave={handleSaveCustomRole}
          loading={createLoading}
          error={createError}
        />
      )}
    </div>
  )
}
