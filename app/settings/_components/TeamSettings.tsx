'use client'

import { useState } from 'react'
import { FiPlus, FiX, FiMail, FiMoreVertical, FiUserMinus, FiUserPlus } from 'react-icons/fi'
import { mockTeamMembers, type MockTeamMember } from '@/data/mockData'
import { labelClass, inputClass } from './settingsTypes'

type TeamMemberRow = MockTeamMember

function AddTeamMemberModal({
  roleOptions,
  onClose,
  onSave,
  initial,
}: {
  roleOptions: string[]
  onClose: () => void
  onSave: (member: { name: string; email: string; phone: string; rut: string; role: string; hasPicture: boolean; password?: string }) => void
  initial?: { name: string; email: string; phone: string; rut: string; role: string; hasPicture: boolean }
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [rut, setRut] = useState(initial?.rut ?? '')
  const [role, setRole] = useState(initial?.role ?? roleOptions[0] ?? 'Technician')
  const [password, setPassword] = useState('')
  const [hasPicture, setHasPicture] = useState(!!initial?.hasPicture)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    onSave({ name: name.trim(), email: email.trim(), phone: phone.trim(), rut: rut.trim(), role, hasPicture, password: password || undefined })
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
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Full name" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email@company.com" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Phone number</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234-567-8900" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>RUT (national Identity Document)</label>
            <input type="text" value={rut} onChange={(e) => setRut(e.target.value)} placeholder="RUT / ID number" className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }}>
              {roleOptions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <p className="text-xs mt-1" style={{ color: '#1F271B', opacity: 0.6 }}>Assigned role may see the portal in a different design view. Configure in Settings → Roles & Permissions.</p>
          </div>
          <div>
            <label className={labelClass} style={{ color: '#1F271B' }}>Picture</label>
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
            <label className={labelClass} style={{ color: '#1F271B' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={initial ? 'Leave blank to keep current' : 'Set password'} className={inputClass} style={{ borderColor: '#EAEBED', color: '#1F271B' }} />
            {initial && <p className="text-xs mt-1" style={{ color: '#1F271B', opacity: 0.6 }}>Leave blank to keep current password.</p>}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded text-sm font-medium" style={{ borderColor: '#EAEBED', color: '#1F271B' }}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded text-sm font-medium text-white" style={{ backgroundColor: '#28AFB0' }}>{initial ? 'Save' : 'Add team member'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function TeamSettings({ roleOptions }: { roleOptions: string[] }) {
  const [members, setMembers] = useState<TeamMemberRow[]>(() => [...mockTeamMembers])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMemberRow | null>(null)
  const [actionsOpenId, setActionsOpenId] = useState<number | null>(null)

  const syncFromMock = () => setMembers([...mockTeamMembers])

  const openAdd = () => {
    setEditingMember(null)
    setModalOpen(true)
  }
  const openEdit = (m: TeamMemberRow) => {
    setEditingMember(m)
    setActionsOpenId(null)
    setModalOpen(true)
  }
  const setActive = (id: number, active: boolean) => {
    const m = mockTeamMembers.find((x) => x.id === id)
    if (m) {
      m.active = active
      syncFromMock()
    }
    setActionsOpenId(null)
  }

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
            {members.map((m) => {
              const active = m.active
              const initials = m.name.split(/\s+/).map((n) => n[0]).join('').toUpperCase().slice(0, 2)
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
                  <td className="px-4 py-3 text-sm" style={{ color: '#1F271B', opacity: 0.6 }}>—</td>
                  <td className="px-4 py-3 relative">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(m)}
                        className="text-sm font-medium"
                        style={{ color: '#28AFB0' }}
                      >
                        Edit
                      </button>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setActionsOpenId(actionsOpenId === m.id ? null : m.id)}
                          className="p-1.5 rounded hover:bg-gray-100"
                          style={{ color: '#1F271B' }}
                          aria-label="Actions"
                        >
                          <FiMoreVertical size={18} />
                        </button>
                        {actionsOpenId === m.id && (
                          <>
                            <div className="fixed inset-0 z-10" aria-hidden onClick={() => setActionsOpenId(null)} />
                            <div
                              className="absolute right-0 top-full mt-1 py-1 rounded-lg border shadow-lg bg-white z-20 min-w-[180px]"
                              style={{ borderColor: '#EAEBED' }}
                            >
                              <button
                                type="button"
                                onClick={() => openEdit(m)}
                                className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50"
                                style={{ color: '#1F271B' }}
                              >
                                <FiMail size={14} />
                                Resend invitation
                              </button>
                              {active ? (
                                <button
                                  type="button"
                                  onClick={() => setActive(m.id, false)}
                                  className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-red-50"
                                  style={{ color: '#DC2626' }}
                                >
                                  <FiUserMinus size={14} />
                                  Deactivate
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setActive(m.id, true)}
                                  className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50"
                                  style={{ color: '#28AFB0' }}
                                >
                                  <FiUserPlus size={14} />
                                  Reactivate
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <AddTeamMemberModal
          roleOptions={roleOptions.length > 0 ? roleOptions : ['Admin / Owner (Service company)', 'Technician']}
          initial={editingMember ? { ...editingMember, hasPicture: !!editingMember.picture } : undefined}
          onClose={() => { setModalOpen(false); setEditingMember(null) }}
          onSave={(member) => {
            const { password: _p, hasPicture: _h, ...rest } = member
            if (editingMember) {
              const idx = mockTeamMembers.findIndex((x) => x.id === editingMember.id)
              if (idx >= 0) Object.assign(mockTeamMembers[idx], rest)
            } else {
              const newId = Math.max(0, ...mockTeamMembers.map((x) => x.id)) + 1
              mockTeamMembers.push({
                id: newId,
                ...rest,
                picture: '',
                active: true,
              })
            }
            syncFromMock()
            setModalOpen(false)
            setEditingMember(null)
          }}
        />
      )}
    </div>
  )
}
