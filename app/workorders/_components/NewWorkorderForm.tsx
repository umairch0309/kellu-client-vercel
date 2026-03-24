'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { mockWorkorders, companyTaxRatePercent } from '@/data/mockData'
import type { ClientOption } from './NewWorkorderJobDetailsSection'
import AddProductServiceModal, { type NewProductServiceData } from './AddProductServiceModal'
import AddClientModal from '../../clients/_components/AddClientModal'
import type { LineItem } from './newWorkorderFormTypes'
import NewWorkorderFormHeader from './NewWorkorderFormHeader'
import NewWorkorderJobDetailsSection from './NewWorkorderJobDetailsSection'
import NewWorkorderScheduleSection from './NewWorkorderScheduleSection'
import NewWorkorderAssignSection from './NewWorkorderAssignSection'
import NewWorkorderInstructionsSection from './NewWorkorderInstructionsSection'
import NewWorkorderLineItemsSection from './NewWorkorderLineItemsSection'
import NewWorkorderNotesSection from './NewWorkorderNotesSection'
import NewWorkorderFormFooter from './NewWorkorderFormFooter'

function extractClientsList(json: unknown): unknown[] {
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

function normalizeClientOption(raw: Record<string, unknown>): ClientOption {
  const id = raw.id ?? ''
  const name = typeof raw.name === 'string' ? raw.name : '—'
  const phone = typeof raw.phone === 'string' ? raw.phone : (typeof (raw as Record<string, unknown>).phone_no === 'string' ? (raw as Record<string, unknown>).phone_no as string : undefined)
  const email = typeof raw.email === 'string' ? raw.email : undefined
  return {
    id: typeof id === 'string' ? id : typeof id === 'number' ? id : String(id),
    name,
    phone,
    email,
  }
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

type TeamMemberOption = { id: number | string; name: string; active: boolean }

function normalizeTeamMember(raw: Record<string, unknown>): TeamMemberOption {
  const id = raw.id ?? (raw as Record<string, unknown>).userId
  const user = (raw.user ?? (raw as Record<string, unknown>).User) as Record<string, unknown> | undefined
  const name = typeof user?.name === 'string' ? user.name : '—'
  const isActive = raw.isActive !== false
  return {
    id: typeof id === 'string' ? id : typeof id === 'number' ? id : String(id),
    name,
    active: isActive,
  }
}

function extractPriceList(json: unknown): unknown[] {
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

function extractSingleWorkorder(json: unknown): Record<string, unknown> | null {
  if (json == null || typeof json !== 'object') return null
  const obj = json as Record<string, unknown>
  let data = obj.data
  if (data != null && typeof data === 'object' && !Array.isArray(data)) {
    const inner = (data as Record<string, unknown>).data
    if (inner != null && typeof inner === 'object' && !Array.isArray(inner)) return inner as Record<string, unknown>
    return data as Record<string, unknown>
  }
  return null
}

function workorderApiToFormData(raw: Record<string, unknown>): {
  title: string
  clientId: number | string | null
  clientName: string
  address: string
  scheduleDay: string
  startTime: string
  endTime: string
  scheduleLater: boolean
  anytime: boolean
  assignedTeamMembers: string[]
  instructions: string
  lineItems: LineItem[]
  discountPercent: number
  notes: string
} {
  const client = (raw.client ?? {}) as Record<string, unknown>
  const clientId = client.id ?? raw.clientId
  const clientName = typeof client.name === 'string' ? client.name : (typeof (raw as any).clientName === 'string' ? (raw as any).clientName : '')
  const assignedTo = (raw.assignedTo ?? {}) as Record<string, unknown>
  const user = (assignedTo.user ?? {}) as Record<string, unknown>
  const assignedName = typeof user.name === 'string' ? user.name : (user.email != null ? String(user.email) : null)
  const scheduledAt = raw.scheduledAt ?? raw.scheduled_at
  const startTime = raw.startTime ?? raw.start_time
  const endTime = raw.endTime ?? raw.end_time
  const scheduleDay = scheduledAt != null && String(scheduledAt).trim() !== '' ? String(scheduledAt).slice(0, 10) : format(new Date(), 'yyyy-MM-dd')
  const lineItemsRaw = Array.isArray(raw.lineItems) ? raw.lineItems : []
  const lineItems: LineItem[] = lineItemsRaw.map((li: any) => {
    const qty = typeof li.quantity === 'number' ? li.quantity : parseInt(String(li.quantity), 10) || 1
    const price = typeof li.price === 'number' ? li.price : parseFloat(String(li.price ?? 0)) || 0
    const cost = typeof li.cost === 'number' ? li.cost : parseFloat(String(li.cost ?? 0)) || 0
    return {
      name: typeof li.name === 'string' ? li.name : '',
      description: typeof li.description === 'string' ? li.description : '',
      quantity: qty,
      unitCost: cost,
      unitPrice: price,
    }
  })
  const discount = typeof raw.discount === 'number' ? raw.discount : typeof raw.discount === 'string' ? parseFloat(raw.discount) || 0 : 0
  const discountType = String((raw.discountType ?? raw.discount_type) ?? '').toUpperCase()
  const discountPercent = discountType === 'PERCENTAGE' ? discount : 0
  return {
    title: typeof raw.title === 'string' ? raw.title : '',
    clientId: clientId != null && clientId !== '' ? (typeof clientId === 'string' ? clientId : typeof clientId === 'number' ? clientId : String(clientId)) : null,
    clientName,
    address: typeof raw.address === 'string' ? raw.address : '',
    scheduleDay,
    startTime: startTime != null ? String(startTime).slice(0, 5) : '09:00',
    endTime: endTime != null ? String(endTime).slice(0, 5) : '10:00',
    scheduleLater: raw.isScheduleLater === true,
    anytime: (raw as any).anytime ?? false,
    assignedTeamMembers: assignedName ? [assignedName] : [],
    instructions: raw.instructions != null ? String(raw.instructions) : '',
    lineItems: lineItems.length > 0 ? lineItems : [],
    discountPercent,
    notes: raw.notes != null ? String(raw.notes) : '',
  }
}

type PriceListMaterialOption = { id: number | string; name: string; description?: string; unitPrice: number }

function normalizePriceListItemToMaterial(raw: Record<string, unknown>): PriceListMaterialOption {
  const id = raw.id ?? ''
  const name = typeof raw.name === 'string' ? raw.name : '—'
  const description = typeof raw.description === 'string' ? raw.description : (raw.description == null ? '' : String(raw.description))
  const price = typeof raw.price === 'number' ? raw.price : (typeof raw.price === 'string' ? parseFloat(raw.price) || 0 : 0)
  return {
    id: typeof id === 'string' ? id : typeof id === 'number' ? id : String(id),
    name,
    description: description || undefined,
    unitPrice: price,
  }
}

interface NewWorkorderFormProps {
  workorderId?: number | string
}

export default function NewWorkorderForm({ workorderId }: NewWorkorderFormProps = {}) {
  const router = useRouter()
  const [clients, setClients] = useState<ClientOption[]>([])
  const [clientsLoading, setClientsLoading] = useState(true)
  const [clientSearchTerm, setClientSearchTerm] = useState('')
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false)
  const [isTeamMemberDropdownOpen, setIsTeamMemberDropdownOpen] = useState(false)
  const [assignSearchTerm, setAssignSearchTerm] = useState('')
  const [lineItemNameDropdownIndex, setLineItemNameDropdownIndex] = useState<number | null>(null)
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false)
  const [addProductModalLineIndex, setAddProductModalLineIndex] = useState<number | null>(null)
  const [addProductModalInitialName, setAddProductModalInitialName] = useState('')
  const [priceListMaterials, setPriceListMaterials] = useState<PriceListMaterialOption[]>([])
  const [customMaterials, setCustomMaterials] = useState<Array<{ id: number; name: string; description: string; unitPrice: number }>>([])
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [editWorkorderLoading, setEditWorkorderLoading] = useState(!!workorderId)
  const [editWorkorderError, setEditWorkorderError] = useState<string | null>(null)
  const clientDropdownRef = useRef<HTMLDivElement>(null)
  const teamMemberDropdownRef = useRef<HTMLDivElement>(null)
  const lineItemsSectionRef = useRef<HTMLDivElement>(null)

  const fetchClients = useCallback(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    setClientsLoading(true)
    fetch(`${baseUrl}/api/clients`, { method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`)
        return res.json()
      })
      .then((json: unknown) => {
        const rawList = extractClientsList(json)
        const list = rawList
          .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
          .map((item) => normalizeClientOption(item))
        setClients(list)
      })
      .catch(() => setClients([]))
      .finally(() => setClientsLoading(false))
  }, [])

  const [teamMembers, setTeamMembers] = useState<TeamMemberOption[]>([])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const fetchTeamMembers = useCallback(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
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
        setTeamMembers(list)
      })
      .catch(() => setTeamMembers([]))
  }, [])

  useEffect(() => {
    fetchTeamMembers()
  }, [fetchTeamMembers])

  const fetchPriceList = useCallback(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    fetch(`${baseUrl}/api/price-list`, { method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`)
        return res.json()
      })
      .then((json: unknown) => {
        const rawList = extractPriceList(json)
        const list = rawList
          .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
          .map((item) => normalizePriceListItemToMaterial(item))
        setPriceListMaterials(list)
      })
      .catch(() => setPriceListMaterials([]))
  }, [])

  useEffect(() => {
    fetchPriceList()
  }, [fetchPriceList])

  const workorder = workorderId ? mockWorkorders.find(wo => String(wo.id) === String(workorderId)) : null
  const [formData, setFormData] = useState({
    title: workorder?.title || '',
    clientId: (workorder?.clientId ?? null) as number | string | null,
    clientName: workorder?.clientName || '',
    address: workorder?.address || '',
    scheduleDay: workorder?.schedule?.day || format(new Date(), 'yyyy-MM-dd'),
    startTime: workorder?.schedule?.startTime || '09:00',
    endTime: workorder?.schedule?.endTime || '10:00',
    scheduleLater: false,
    anytime: workorder ? (workorder as { anytime?: boolean }).anytime ?? false : true,
    assignedTeamMembers: workorder?.assignedTeamMember ? [workorder.assignedTeamMember] : [] as string[],
    instructions: workorder?.instructions || '',
    lineItems: (workorder?.lineItems || []).map((item: { name: string; description?: string; quantity: number; unitCost?: number; unitPrice?: number }) => ({
      name: item.name,
      description: item.description || '',
      quantity: item.quantity,
      unitCost: item.unitCost ?? 0,
      unitPrice: item.unitPrice ?? item.unitCost ?? 0,
    })) as LineItem[],
    discountPercent: 0,
    notes: workorder?.notes || '',
  })

  // When in edit mode with API id, fetch workorder and pre-fill form
  useEffect(() => {
    if (!workorderId) {
      setEditWorkorderLoading(false)
      return
    }
    if (workorder) {
      setEditWorkorderLoading(false)
      return
    }
    let cancelled = false
    setEditWorkorderError(null)
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    fetch(`${baseUrl}/api/workorders/${workorderId}`, { credentials: 'include' })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}))
        if (cancelled) return { ok: res.ok, json }
        if (!res.ok) {
          const msg = (json as { message?: string }).message ?? `Failed to load (${res.status})`
          setEditWorkorderError(msg)
          setEditWorkorderLoading(false)
          return { ok: false, json }
        }
        const data = extractSingleWorkorder(json)
        if (data) {
          setFormData(workorderApiToFormData(data))
          setEditWorkorderError(null)
        } else {
          setEditWorkorderError('Could not load workorder.')
        }
        return { ok: true, json }
      })
      .catch(() => {
        if (!cancelled) setEditWorkorderError('Failed to load workorder.')
      })
      .finally(() => {
        if (!cancelled) setEditWorkorderLoading(false)
      })
    return () => { cancelled = true }
  }, [workorderId, workorder])

  useEffect(() => {
    if (formData.clientId != null && formData.clientId !== '') {
      const lastJob = mockWorkorders
        .filter(wo => String(wo.clientId) === String(formData.clientId))
        .sort((a, b) => new Date((b as { createdAt: string }).createdAt).getTime() - new Date((a as { createdAt: string }).createdAt).getTime())[0]
      if (lastJob && lastJob.address) {
        setFormData(prev => ({ ...prev, address: lastJob.address }))
      }
    }
  }, [formData.clientId])

  const filteredClients = clients.filter(client => {
    const term = clientSearchTerm.toLowerCase()
    const matchesSearch =
      client.name.toLowerCase().includes(term) ||
      (client.phone && client.phone.includes(clientSearchTerm)) ||
      (client.email && client.email.toLowerCase().includes(term))
    return matchesSearch || (workorderId && String(client.id) === String(formData.clientId))
  })

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(target)) setIsClientDropdownOpen(false)
      if (teamMemberDropdownRef.current && !teamMemberDropdownRef.current.contains(target)) setIsTeamMemberDropdownOpen(false)
      if (lineItemNameDropdownIndex !== null && lineItemsSectionRef.current && !lineItemsSectionRef.current.contains(target)) {
        setLineItemNameDropdownIndex(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isClientDropdownOpen, isTeamMemberDropdownOpen, lineItemNameDropdownIndex])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    const titleTrim = (formData.title || '').trim()
    const addressTrim = (formData.address || '').trim()
    if (!titleTrim) {
      setSubmitError('Title is required.')
      return
    }
    if (formData.clientId == null || formData.clientId === '') {
      setSubmitError('Please select a client.')
      return
    }
    if (!addressTrim) {
      setSubmitError('Address is required.')
      return
    }
    setIsSubmitting(true)
    try {
      const scheduledAt =
        formData.scheduleLater || !formData.scheduleDay
          ? null
          : formData.scheduleDay
      const firstAssignedName = formData.assignedTeamMembers[0]
      const assignedToId =
        firstAssignedName != null
          ? teamMembers.find((m) => m.name === firstAssignedName)?.id
          : undefined
      const body: Record<string, unknown> = {
        title: titleTrim,
        clientId: formData.clientId,
        address: addressTrim,
      }
      if ((formData.instructions || '').trim()) body.instructions = formData.instructions.trim()
      if ((formData.notes || '').trim()) body.notes = formData.notes.trim()
      if (formData.scheduleLater != null) body.isScheduleLater = formData.scheduleLater
      if (scheduledAt != null && scheduledAt !== '') body.scheduledAt = scheduledAt
      if ((formData.startTime || '').trim()) body.startTime = formData.startTime.trim()
      if ((formData.endTime || '').trim()) body.endTime = formData.endTime.trim()
      if (assignedToId != null) body.assignedTo = assignedToId
      if (formData.lineItems.length > 0) {
        body.lineItems = formData.lineItems.map((item) => ({
          name: (item.name || '').trim() || '—',
          itemType: 'SERVICE' as const,
          description: (item.description || '').trim() || null,
          quantity: Number(item.quantity) || 0,
          price: Number(item.unitPrice) || 0,
          cost: Number(item.unitCost) ?? 0,
        }))
      }
      if (formData.discountPercent != null && formData.discountPercent > 0) {
        body.discount = formData.discountPercent
        body.discountType = 'PERCENTAGE'
      }
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
      const url = workorderId ? `${baseUrl}/api/workorders/${workorderId}` : `${baseUrl}/api/workorders`
      let method: 'PATCH' | 'POST' = workorderId ? 'PATCH' : 'POST'
      let res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      if (workorderId && res.status === 404 && method === 'PATCH') {
        method = 'POST'
        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        })
      }
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = (data as { message?: string }).message ?? (data as { errors?: { message?: string }[] })?.errors?.[0]?.message ?? `Request failed (${res.status})`
        setSubmitError(msg)
        return
      }
    if (workorderId) {
      router.push(`/workorders/${workorderId}`)
    } else {
      router.push('/workorders')
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save workorder')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else if (name === 'discountPercent') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(String(value)) || 0 }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleClientSelect = (clientId: number | string, clientName: string) => {
    setFormData(prev => ({ ...prev, clientId, clientName }))
    setIsClientDropdownOpen(false)
    setClientSearchTerm('')
  }

  const assignOptions = teamMembers
    .filter(m => m.active)
    .map(m => ({ value: m.name, label: m.name }))
  const filteredAssignOptions = assignOptions.filter(opt =>
    opt.label.toLowerCase().includes(assignSearchTerm.toLowerCase())
  )
  const assignedSet = new Set(formData.assignedTeamMembers)
  const toggleAssignSelection = (value: string) => {
    const next = assignedSet.has(value)
      ? formData.assignedTeamMembers.filter(n => n !== value)
      : [...formData.assignedTeamMembers, value]
    setFormData(prev => ({ ...prev, assignedTeamMembers: next }))
  }
  const clearAssignSelection = () => setFormData(prev => ({ ...prev, assignedTeamMembers: [] }))
  const selectAllAssign = () => setFormData(prev => ({ ...prev, assignedTeamMembers: assignOptions.map(o => o.value) }))

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { name: '', description: '', quantity: 1, unitCost: 0, unitPrice: 0 }],
    }))
  }

  const removeLineItem = (index: number) => {
    setFormData(prev => ({ ...prev, lineItems: prev.lineItems.filter((_, i) => i !== index) }))
  }

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    setFormData(prev => {
      const updated = [...prev.lineItems]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, lineItems: updated }
    })
  }

  const subtotal = formData.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const totalCost = formData.lineItems.reduce((sum, item) => sum + item.quantity * (item.unitCost ?? 0), 0)
  const discountAmount = (subtotal * (formData.discountPercent || 0)) / 100
  const afterDiscount = subtotal - discountAmount
  const taxAmount = (afterDiscount * companyTaxRatePercent) / 100
  const grandTotal = afterDiscount + taxAmount
  const estimatedMargin = grandTotal - totalCost
  const estimatedMarginPercent = grandTotal > 0 ? (estimatedMargin / grandTotal) * 100 : 0

  const handleCancel = () => {
    if (workorderId) router.push(`/workorders/${workorderId}`)
    else router.push('/workorders')
  }

  const openAddProductModal = (lineIndex: number, initialName: string) => {
    setAddProductModalInitialName(initialName)
    setAddProductModalLineIndex(lineIndex)
    setIsAddProductModalOpen(true)
  }

  const handleAddProductSave = (data: NewProductServiceData) => {
          const newId = 10000 + customMaterials.length
    setCustomMaterials(prev => [
            ...prev,
      { id: newId, name: data.name, description: data.description, unitPrice: data.unitPrice },
          ])
          if (addProductModalLineIndex !== null) {
      setFormData(prev => {
              const next = [...prev.lineItems]
              next[addProductModalLineIndex] = {
                ...next[addProductModalLineIndex],
                name: data.name,
                description: data.description,
                unitCost: data.unitCost ?? next[addProductModalLineIndex].unitCost ?? 0,
                unitPrice: data.unitPrice,
              }
              return { ...prev, lineItems: next }
            })
          }
    setIsAddProductModalOpen(false)
    setAddProductModalLineIndex(null)
  }

  if (editWorkorderLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p style={{ color: '#1F271B' }}>Loading workorder…</p>
      </div>
    )
  }

  if (editWorkorderError && workorderId && !workorder) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 p-4">
        <p style={{ color: '#B91C1C' }}>{editWorkorderError}</p>
        <button
          type="button"
          onClick={() => router.push(`/workorders/${workorderId}`)}
          className="px-3 py-1.5 rounded text-sm font-medium"
          style={{ backgroundColor: '#28AFB0', color: 'white' }}
        >
          Back to workorder
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <NewWorkorderFormHeader isEdit={!!workorderId} onCancel={handleCancel} />

      <div className="max-w-4xl mx-auto px-4 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <NewWorkorderJobDetailsSection
            title={formData.title}
            clientId={formData.clientId}
            clientName={formData.clientName}
            address={formData.address}
            onFieldChange={handleChange}
            clientSearchTerm={clientSearchTerm}
            setClientSearchTerm={setClientSearchTerm}
            isClientDropdownOpen={isClientDropdownOpen}
            setIsClientDropdownOpen={setIsClientDropdownOpen}
            clientDropdownRef={clientDropdownRef}
            filteredClients={filteredClients}
            onClientSelect={handleClientSelect}
            onOpenAddClient={() => setIsAddClientOpen(true)}
            clientsLoading={clientsLoading}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <NewWorkorderScheduleSection
              scheduleDay={formData.scheduleDay}
              startTime={formData.startTime}
              endTime={formData.endTime}
              scheduleLater={formData.scheduleLater}
              anytime={formData.anytime}
              onFieldChange={handleChange}
            />
            <NewWorkorderAssignSection
              assignedTeamMembers={formData.assignedTeamMembers}
              assignOptions={assignOptions}
              filteredAssignOptions={filteredAssignOptions}
              assignSearchTerm={assignSearchTerm}
              setAssignSearchTerm={setAssignSearchTerm}
              isOpen={isTeamMemberDropdownOpen}
              setIsOpen={setIsTeamMemberDropdownOpen}
              teamMemberDropdownRef={teamMemberDropdownRef}
              isSelected={(v) => assignedSet.has(v)}
              toggleSelection={toggleAssignSelection}
              onSelectAllOrClear={() => (assignedSet.size === assignOptions.length ? clearAssignSelection() : selectAllAssign())}
              selectAllLabel={assignedSet.size === assignOptions.length ? 'Clear' : 'Select all'}
            />
          </div>

          <NewWorkorderInstructionsSection instructions={formData.instructions} onFieldChange={handleChange} />

          <NewWorkorderLineItemsSection
            lineItems={formData.lineItems}
            addLineItem={addLineItem}
            removeLineItem={removeLineItem}
            updateLineItem={updateLineItem}
            lineItemNameDropdownIndex={lineItemNameDropdownIndex}
            setLineItemNameDropdownIndex={setLineItemNameDropdownIndex}
            lineItemsSectionRef={lineItemsSectionRef}
            discountPercent={formData.discountPercent}
            onFieldChange={handleChange}
            subtotal={subtotal}
            discountAmount={discountAmount}
            taxAmount={taxAmount}
            grandTotal={grandTotal}
            totalCost={totalCost}
            estimatedMargin={estimatedMargin}
            estimatedMarginPercent={estimatedMarginPercent}
            taxRatePercent={companyTaxRatePercent}
            materialsList={priceListMaterials}
            customMaterials={customMaterials}
            onOpenAddProduct={openAddProductModal}
          />

          <NewWorkorderNotesSection notes={formData.notes} onFieldChange={handleChange} />

          {submitError && (
            <div className="p-3 rounded border bg-red-50 border-red-200 text-sm" style={{ color: '#B91C1C' }}>{submitError}</div>
          )}

          <NewWorkorderFormFooter isEdit={!!workorderId} onCancel={handleCancel} isSubmitting={isSubmitting} />
        </form>

        <AddProductServiceModal
          isOpen={isAddProductModalOpen}
          onClose={() => {
          setIsAddProductModalOpen(false)
          setAddProductModalLineIndex(null)
        }}
          initialName={addProductModalInitialName}
          onSave={handleAddProductSave}
      />
      <AddClientModal
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
        mode="new"
        onSuccess={(data) => {
            setFormData(prev => ({ ...prev, clientName: data.name }))
          setClientSearchTerm('')
          setIsAddClientOpen(false)
            fetchClients()
        }}
      />
      </div>
    </div>
  )
}
