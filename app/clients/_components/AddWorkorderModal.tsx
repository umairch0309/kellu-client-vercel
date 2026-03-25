'use client'

import { useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { format, parse } from 'date-fns'
import { mockClients, mockTeamMembers, mockMasterPriceList } from '@/data/mockData'
import { extractClientsList, normalizeApiClientOption, type ApiClientOption } from '@/lib/clientsListApi'
import { extractPriceList, normalizePriceListSelectItem, type PriceListSelectItem } from '@/lib/priceListApi'
import AddClientModal from './AddClientModal'
import type { AddWorkorderFormData } from './addWorkorderModalTypes'
import AddWorkorderModalHeader from './AddWorkorderModalHeader'
import AddWorkorderModalClientSection from './AddWorkorderModalClientSection'
import AddWorkorderModalInstructionsSection from './AddWorkorderModalInstructionsSection'
import AddWorkorderModalAssignSection from './AddWorkorderModalAssignSection'
import AddWorkorderModalLineItemsSection from './AddWorkorderModalLineItemsSection'
import AddWorkorderModalScheduleSection from './AddWorkorderModalScheduleSection'
import AddWorkorderModalFooter from './AddWorkorderModalFooter'
import AddWorkorderModalCalendar from './AddWorkorderModalCalendar'
import AddWorkorderModalTimePickers from './AddWorkorderModalTimePickers'
import type { AddWorkorderModalProps } from './addWorkorderModalTypes'

function parseTime(s: string): { hour: number; minute: number; period: 'AM' | 'PM' } | null {
  const m = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!m) return null
  const hour = parseInt(m[1], 10)
  const minute = parseInt(m[2], 10)
  const period = m[3].toUpperCase() as 'AM' | 'PM'
  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return null
  return { hour, minute, period }
}
function timeToMinutes(t: { hour: number; minute: number; period: 'AM' | 'PM' }): number {
  let h = t.hour
  if (t.period === 'AM' && h === 12) h = 0
  else if (t.period === 'PM' && h !== 12) h += 12
  return h * 60 + t.minute
}
function formatTime(hour: number, minute: number, period: 'AM' | 'PM'): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`
}

const defaultFormState = (): AddWorkorderFormData => ({
  client: '',
  clientId: null,
  address: '',
  title: '',
  instructions: '',
  assignedTeamMembers: [],
  startDate: format(new Date(), 'MMM d, yyyy'),
  startTime: '03:15 AM',
  endTime: '04:15 AM',
  lineItems: [],
})

export default function AddWorkorderModal({
  isOpen,
  onClose,
  initialDate,
  initialTime,
  position,
  initialClientId,
  mode = 'workorder',
  onTaskCreated,
  editingTask,
  onTaskUpdated,
  onConvertToWorkorder,
}: AddWorkorderModalProps) {
  const router = useRouter()
  const quoteOnly = mode === 'quote-only'
  const invoiceOnly = mode === 'invoice-only'
  const taskOnly = mode === 'task'
  const documentOnly = quoteOnly || invoiceOnly
  const apiBackedDocument = quoteOnly || invoiceOnly

  const [apiClients, setApiClients] = useState<ApiClientOption[]>([])
  const [clientsLoading, setClientsLoading] = useState(false)
  const [priceListItems, setPriceListItems] = useState<PriceListSelectItem[]>([])
  const [priceListLoading, setPriceListLoading] = useState(false)
  const [documentSubmitting, setDocumentSubmitting] = useState(false)

  const [taskType, setTaskType] = useState<'workorder' | 'task'>(taskOnly ? 'task' : 'workorder')
  const effectiveTaskType = taskOnly ? 'task' : taskType
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false)
  const [showInstructions, setShowInstructions] = useState(() => !!(taskOnly && editingTask?.instructions?.trim()))
  const [showAssign, setShowAssign] = useState(false)
  const [anytime, setAnytime] = useState(true)
  const [isAddLineItemDropdownOpen, setIsAddLineItemDropdownOpen] = useState(false)
  const [addLineItemSearchTerm, setAddLineItemSearchTerm] = useState('')
  const [isStartDateCalendarOpen, setIsStartDateCalendarOpen] = useState(false)
  const [startDatePickerMonth, setStartDatePickerMonth] = useState(new Date())
  const [isStartTimeDropdownOpen, setIsStartTimeDropdownOpen] = useState(false)
  const [isEndTimeDropdownOpen, setIsEndTimeDropdownOpen] = useState(false)
  const [dropdownAnchor, setDropdownAnchor] = useState<{ top: number; left: number; type: 'date' | 'startTime' | 'endTime' } | null>(null)
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false)
  const [isAssignDropdownOpen, setIsAssignDropdownOpen] = useState(false)
  const [assignSearchTerm, setAssignSearchTerm] = useState('')
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)

  const typeDropdownRef = useRef<HTMLDivElement>(null)
  const lineItemsSectionRef = useRef<HTMLDivElement>(null)
  const addLineItemDropdownRef = useRef<HTMLDivElement>(null)
  const startDateCalendarRef = useRef<HTMLDivElement>(null)
  const startTimeDropdownRef = useRef<HTMLDivElement>(null)
  const endTimeDropdownRef = useRef<HTMLDivElement>(null)
  const clientDropdownRef = useRef<HTMLDivElement>(null)
  const assignDropdownRef = useRef<HTMLDivElement>(null)
  const dropdownPortalRef = useRef<HTMLDivElement>(null)

  const getDefaultFormData = (): AddWorkorderFormData => {
    if (taskOnly && editingTask) {
      let startDateFormatted = format(new Date(), 'MMM d, yyyy')
      try {
        const d = parse(editingTask.dueDate, 'yyyy-MM-dd', new Date())
        if (!isNaN(d.getTime())) startDateFormatted = format(d, 'MMM d, yyyy')
      } catch {
        // keep default
      }
      return {
        client: editingTask.clientName,
        clientId: null,
        address: editingTask.address ?? '',
        title: editingTask.title,
        instructions: editingTask.instructions ?? '',
        assignedTeamMembers: editingTask.assignedTo ? editingTask.assignedTo.split(',').map(s => s.trim()).filter(Boolean) : [],
        startDate: startDateFormatted,
        startTime: '09:00 AM',
        endTime: '10:00 AM',
        lineItems: [],
      }
    }
    return defaultFormState()
  }

  const [formData, setFormData] = useState<AddWorkorderFormData>(getDefaultFormData)

  const assignOptions = [
    { value: 'Business owner', label: 'Business owner' },
    ...mockTeamMembers.filter(m => m.active).map(m => ({ value: m.name, label: m.name })),
  ]
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

  const masterPriceSource = useMemo(() => {
    if (apiBackedDocument) {
      return priceListItems.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        type: item.type,
      }))
    }
    return mockMasterPriceList
  }, [apiBackedDocument, priceListItems])

  const addLineItemFiltered = masterPriceSource.filter(
    item => item.name.toLowerCase().includes(addLineItemSearchTerm.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(addLineItemSearchTerm.toLowerCase())
  )
  const addLineItemServices = addLineItemFiltered.filter(i => i.type === 'service')
  const addLineItemProducts = addLineItemFiltered.filter(i => i.type === 'product')
  const addLineItemSelect = (item: { name: string; description: string; price: number }) => {
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { name: item.name, description: item.description || '', quantity: 1, unitPrice: item.price }],
    }))
    setAddLineItemSearchTerm('')
    setIsAddLineItemDropdownOpen(false)
  }

  const startTimeParsed = parseTime(formData.startTime)
  const endTimeParsed = formData.endTime ? parseTime(formData.endTime) : null
  const startMinutes = startTimeParsed ? timeToMinutes(startTimeParsed) : 0
  const endMinutes = endTimeParsed ? timeToMinutes(endTimeParsed) : 0
  const isEndValid = !formData.endTime || endMinutes > startMinutes
  const defaultEndFromStart = (() => {
    const m = Math.min(startMinutes + 60, 24 * 60 - 1)
    const h24 = Math.floor(m / 60)
    const min = m % 60
    const hour12 = h24 % 12 || 12
    const period: 'AM' | 'PM' = h24 < 12 ? 'AM' : 'PM'
    return { hour: hour12, minute: min, period }
  })()

  const applyStartTime = (hour: number, minute: number, period: 'AM' | 'PM') => {
    setFormData(prev => ({ ...prev, startTime: formatTime(hour, minute, period) }))
    setIsStartTimeDropdownOpen(false)
  }
  const applyEndTime = (hour: number, minute: number, period: 'AM' | 'PM') => {
    const mins = timeToMinutes({ hour, minute, period })
    if (mins <= startMinutes) return
    setFormData(prev => ({ ...prev, endTime: formatTime(hour, minute, period) }))
    setIsEndTimeDropdownOpen(false)
  }

  const filteredClientsForModal = useMemo(() => {
    const term = (formData.client || '').toLowerCase()
    if (apiBackedDocument) {
      return apiClients
        .filter(
          (c) =>
            c.name.toLowerCase().includes(term) ||
            (c.phone || '').toLowerCase().includes(term) ||
            (c.email || '').toLowerCase().includes(term)
        )
        .map((c) => ({
          id: c.id,
          name: c.name,
          address: c.address,
          phone: c.phone,
          email: c.email,
        }))
    }
    return mockClients.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        (c.address || '').toLowerCase().includes(term) ||
      (c.phone || '').includes(formData.client || '')
  )
  }, [apiBackedDocument, apiClients, formData.client])

  useEffect(() => {
    if (!isOpen || !apiBackedDocument) return
    let cancelled = false
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    setClientsLoading(true)
    fetch(`${baseUrl}/api/clients`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return
        const rows = extractClientsList(json)
          .filter((x): x is Record<string, unknown> => x != null && typeof x === 'object' && !Array.isArray(x))
          .map((raw) => normalizeApiClientOption(raw))
        setApiClients(rows)
      })
      .catch(() => {
        if (!cancelled) setApiClients([])
      })
      .finally(() => {
        if (!cancelled) setClientsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [isOpen, apiBackedDocument])

  useEffect(() => {
    if (!isOpen || !apiBackedDocument) return
    let cancelled = false
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
    setPriceListLoading(true)
    fetch(`${baseUrl}/api/price-list`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return
        const rows = extractPriceList(json)
          .filter((x): x is Record<string, unknown> => x != null && typeof x === 'object' && !Array.isArray(x))
          .map((raw) => normalizePriceListSelectItem(raw as Record<string, unknown>))
        setPriceListItems(rows)
      })
      .catch(() => {
        if (!cancelled) setPriceListItems([])
      })
      .finally(() => {
        if (!cancelled) setPriceListLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [isOpen, apiBackedDocument])

  useEffect(() => {
    if (!isOpen || !apiBackedDocument || initialClientId == null || initialClientId === '') return
    const c = apiClients.find((x) => String(x.id) === String(initialClientId))
    if (c) {
      setFormData((prev) => ({
        ...prev,
        client: c.name,
        clientId: c.id,
        address: c.address || prev.address,
      }))
    }
  }, [isOpen, apiBackedDocument, initialClientId, apiClients])

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return
    const pad = 8
    const dateHeight = 280
    const timeHeight = 120
    if (isStartDateCalendarOpen && startDateCalendarRef.current) {
      const rect = startDateCalendarRef.current.getBoundingClientRect()
      let top = rect.bottom + 4
      if (top + dateHeight > window.innerHeight - pad) top = rect.top - dateHeight - 4
      const left = Math.max(pad, Math.min(rect.left, window.innerWidth - 240 - pad))
      setDropdownAnchor({ top, left, type: 'date' })
    } else if (isStartTimeDropdownOpen && startTimeDropdownRef.current) {
      const rect = startTimeDropdownRef.current.getBoundingClientRect()
      let top = rect.bottom + 4
      if (top + timeHeight > window.innerHeight - pad) top = rect.top - timeHeight - 4
      const left = Math.max(pad, Math.min(rect.left, window.innerWidth - 180 - pad))
      setDropdownAnchor({ top, left, type: 'startTime' })
    } else if (isEndTimeDropdownOpen && endTimeDropdownRef.current) {
      const rect = endTimeDropdownRef.current.getBoundingClientRect()
      let top = rect.bottom + 4
      if (top + timeHeight > window.innerHeight - pad) top = rect.top - timeHeight - 4
      const left = Math.max(pad, Math.min(rect.left, window.innerWidth - 180 - pad))
      setDropdownAnchor({ top, left, type: 'endTime' })
    } else {
      setDropdownAnchor(null)
    }
  }, [isStartDateCalendarOpen, isStartTimeDropdownOpen, isEndTimeDropdownOpen])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(target)) setIsTypeDropdownOpen(false)
      if (addLineItemDropdownRef.current && !addLineItemDropdownRef.current.contains(target)) setIsAddLineItemDropdownOpen(false)
      const insidePortal = dropdownPortalRef.current && dropdownPortalRef.current.contains(target)
      if (!insidePortal && startDateCalendarRef.current && !startDateCalendarRef.current.contains(target)) setIsStartDateCalendarOpen(false)
      if (!insidePortal && startTimeDropdownRef.current && !startTimeDropdownRef.current.contains(target)) setIsStartTimeDropdownOpen(false)
      if (!insidePortal && endTimeDropdownRef.current && !endTimeDropdownRef.current.contains(target)) setIsEndTimeDropdownOpen(false)
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(target)) setIsClientDropdownOpen(false)
      if (assignDropdownRef.current && !assignDropdownRef.current.contains(target)) setIsAssignDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isTypeDropdownOpen, isClientDropdownOpen, isAssignDropdownOpen, isAddLineItemDropdownOpen, isStartDateCalendarOpen, isStartTimeDropdownOpen, isEndTimeDropdownOpen])

  useEffect(() => {
    if (!isOpen) return
    if (apiBackedDocument) {
      setFormData({
        ...defaultFormState(),
        startDate: initialDate ? format(initialDate, 'MMM d, yyyy') : format(new Date(), 'MMM d, yyyy'),
        startTime: initialTime || '03:15 AM',
        endTime: initialTime
          ? (() => {
              const [time, period] = initialTime.split(' ')
              const [hours, minutes] = time.split(':')
              let hour = parseInt(hours, 10)
              if (period === 'PM' && hour !== 12) hour += 12
              if (period === 'AM' && hour === 12) hour = 0
              const endHour = (hour + 1) % 24
              const endHour12 = endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour
              const endAmpm = endHour >= 12 ? 'PM' : 'AM'
              return `${endHour12}:${minutes} ${endAmpm}`
            })()
          : '04:15 AM',
      })
      setAnytime(!initialTime)
      return
    }
    const client = initialClientId ? mockClients.find((c) => String(c.id) === String(initialClientId)) : null
    setFormData((prev) => ({
        ...prev,
        client: client ? client.name : '',
      clientId: null,
      address: client ? client.address || '' : '',
        startDate: initialDate ? format(initialDate, 'MMM d, yyyy') : format(new Date(), 'MMM d, yyyy'),
        startTime: initialTime || '03:15 AM',
      endTime: initialTime
        ? (() => {
          const [time, period] = initialTime.split(' ')
          const [hours, minutes] = time.split(':')
            let hour = parseInt(hours, 10)
          if (period === 'PM' && hour !== 12) hour += 12
          if (period === 'AM' && hour === 12) hour = 0
          const endHour = (hour + 1) % 24
          const endHour12 = endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour
          const endAmpm = endHour >= 12 ? 'PM' : 'AM'
          return `${endHour12}:${minutes} ${endAmpm}`
          })()
        : '04:15 AM',
      }))
      setAnytime(!initialTime)
  }, [isOpen, initialDate, initialTime, initialClientId, apiBackedDocument])

  useEffect(() => {
    if (!isOpen || !taskOnly) return
    if (editingTask) {
      let startDateFormatted = format(new Date(), 'MMM d, yyyy')
      try {
        const d = parse(editingTask.dueDate, 'yyyy-MM-dd', new Date())
        if (!isNaN(d.getTime())) startDateFormatted = format(d, 'MMM d, yyyy')
      } catch {
        // keep default
      }
      setFormData(prev => ({
        ...prev,
        client: editingTask.clientName,
        clientId: null,
        address: editingTask.address ?? '',
        title: editingTask.title,
        instructions: editingTask.instructions ?? '',
        assignedTeamMembers: editingTask.assignedTo ? editingTask.assignedTo.split(',').map(s => s.trim()).filter(Boolean) : [],
        startDate: startDateFormatted,
        startTime: '09:00 AM',
        endTime: '10:00 AM',
        lineItems: [],
      }))
      setShowInstructions(!!(editingTask.instructions && editingTask.instructions.trim()))
      setAnytime(true)
    } else {
      setFormData(defaultFormState())
      setShowInstructions(false)
      setAnytime(true)
    }
  }, [isOpen, taskOnly, editingTask])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (quoteOnly) {
      const titleTrim = (formData.title || '').trim()
      const addressTrim = (formData.address || '').trim()
      if (formData.clientId == null || formData.clientId === '') {
        alert('Please select a client from the list.')
        return
      }
      if (!addressTrim) {
        alert('Address is required.')
        return
      }
      if (!titleTrim) {
        alert('Title is required.')
        return
      }
      setDocumentSubmitting(true)
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
        const body: Record<string, unknown> = {
          clientId: formData.clientId,
          title: titleTrim,
          address: addressTrim,
          quoteRequired: true,
        }
        const instructionsTrim = (formData.instructions || '').trim()
        if (instructionsTrim) body.instructions = instructionsTrim
        if (formData.lineItems.length > 0) {
          body.lineItems = formData.lineItems.map((item) => ({
            name: (item.name || '').trim() || '—',
            itemType: 'SERVICE' as const,
            description: (item.description || '').trim() || null,
            quantity: Number(item.quantity) || 0,
            price: Number(item.unitPrice) || 0,
            cost: 0,
          }))
        }
        const res = await fetch(`${baseUrl}/api/quotes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || (data as { success?: boolean }).success === false) {
          const msg =
            (data as { message?: string }).message ??
            (data as { errors?: { message?: string }[] })?.errors?.[0]?.message ??
            `Failed to create quote (${res.status})`
          alert(msg)
          return
        }
        alert('Quote created successfully.')
        onClose()
        setFormData(defaultFormState())
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to create quote')
      } finally {
        setDocumentSubmitting(false)
      }
      return
    }
    if (invoiceOnly) {
      const titleTrim = (formData.title || '').trim()
      const addressTrim = (formData.address || '').trim()
      if (formData.clientId == null || formData.clientId === '') {
        alert('Please select a client from the list.')
        return
      }
      if (!addressTrim) {
        alert('Address is required.')
        return
      }
      if (!titleTrim) {
        alert('Title is required.')
        return
      }
      setDocumentSubmitting(true)
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
        const body: Record<string, unknown> = {
          clientId: formData.clientId,
          title: titleTrim,
          address: addressTrim,
        }
        if (formData.lineItems.length > 0) {
          body.lineItems = formData.lineItems.map((item) => ({
            name: (item.name || '').trim() || '—',
            itemType: 'SERVICE' as const,
            description: (item.description || '').trim() || null,
            quantity: Number(item.quantity) || 0,
            price: Number(item.unitPrice) || 0,
        cost: 0,
          }))
        }
        const res = await fetch(`${baseUrl}/api/invoices`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          const msg =
            (data as { message?: string }).message ??
            (data as { errors?: { message?: string }[] })?.errors?.[0]?.message ??
            `Failed to create invoice (${res.status})`
          alert(msg)
          return
        }
        alert('Invoice created successfully.')
        onClose()
        setFormData(defaultFormState())
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to create invoice')
      } finally {
        setDocumentSubmitting(false)
      }
      return
    }
    if (!anytime && formData.endTime && !isEndValid) {
      alert('End time must be after start time.')
      return
    }
    if (effectiveTaskType === 'task') {
      const taskData = {
        title: formData.title || 'Untitled Task',
        clientName: formData.client || '',
        address: formData.address || '',
        instructions: formData.instructions || '',
        assignedTo: formData.assignedTeamMembers?.join(', ') || '',
        startDate: formData.startDate,
        startTime: formData.startTime,
        endTime: anytime ? '' : (formData.endTime || ''),
        anytime,
      }
      if (editingTask) {
        onTaskUpdated?.(editingTask.id, taskData)
      } else {
        onTaskCreated?.(taskData)
      }
    } else {
      alert('Workorder created successfully! (Static UI)')
    }
    onClose()
    setFormData(defaultFormState())
    setShowInstructions(false)
    setShowAssign(false)
    setAnytime(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const removeTime = () => setFormData(prev => ({ ...prev, endTime: '' }))

  if (!isOpen) return null

  const getModalStyle = (): React.CSSProperties => {
    if (!position || typeof window === 'undefined') {
      return { position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }
    }
    const modalWidth = 320
    const modalHeight = 500
    const padding = 8
    let left = position.x + 31
    let top = position.y + 61
    if (left + modalWidth > window.innerWidth - padding) left = position.x - modalWidth - 10
    if (left < padding) left = padding
    if (top + modalHeight > window.innerHeight - padding) top = position.y - modalHeight - 10
    if (top < padding) top = padding
    return { position: 'fixed', left: `${left}px`, top: `${top}px`, transform: 'none' }
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute inset-0 bg-neutral-dark bg-opacity-20 pointer-events-auto" onClick={onClose} />
      <div 
        className="relative bg-white rounded-lg shadow-2xl w-[320px] overflow-hidden flex flex-col pointer-events-auto border border-neutral-light"
        style={{ ...getModalStyle(), maxHeight: 'min(560px, 85vh)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <AddWorkorderModalHeader
          mode={mode}
          editingTask={editingTask}
          taskType={taskType}
          setTaskType={setTaskType}
          isTypeDropdownOpen={isTypeDropdownOpen}
          setIsTypeDropdownOpen={setIsTypeDropdownOpen}
          typeDropdownRef={typeDropdownRef}
          onClose={onClose}
        />

        <div className="flex flex-col flex-1 min-h-0">
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-2.5">
            <AddWorkorderModalClientSection
              formData={formData}
              setFormData={setFormData}
              onFieldChange={handleChange}
              isClientDropdownOpen={isClientDropdownOpen}
              setIsClientDropdownOpen={setIsClientDropdownOpen}
              clientDropdownRef={clientDropdownRef}
              filteredClients={filteredClientsForModal}
              onOpenAddClient={apiBackedDocument ? () => router.push('/clients') : () => setIsAddClientOpen(true)}
              clientSearchVariant={apiBackedDocument ? 'invoice' : 'default'}
              clientsLoading={apiBackedDocument && clientsLoading}
            />

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>
                {apiBackedDocument ? (
                  <>
                    Address <span className="text-red-500">*</span>
                  </>
                ) : (
                  'Address'
                )}
              </label>
              <p className="text-[10px] mb-0.5" style={{ color: '#1F271B', opacity: 0.6 }}>
                {apiBackedDocument
                  ? 'Required. Prefilled when you select a client; you can edit it if needed.'
                  : 'Fetched from last registered workorder or task of selected client'}
              </p>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
                className="w-full px-2 py-1.5 border border-neutral-light rounded focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                style={{ borderColor: '#EAEBED' }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>
                {apiBackedDocument ? (
                  <>
                    Title <span className="text-red-500">*</span>
                  </>
                ) : (
                  'Title'
                )}
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Title"
                className="w-full px-2 py-1.5 border border-neutral-light rounded focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                style={{ borderColor: '#EAEBED' }}
              />
            </div>

            <AddWorkorderModalInstructionsSection
              documentOnly={documentOnly}
              showInstructions={showInstructions}
              setShowInstructions={setShowInstructions}
              instructions={formData.instructions}
              onFieldChange={handleChange}
            />

            <AddWorkorderModalAssignSection
              documentOnly={documentOnly}
              formData={formData}
              setFormData={setFormData}
              showAssign={showAssign}
              setShowAssign={setShowAssign}
              isAssignDropdownOpen={isAssignDropdownOpen}
              setIsAssignDropdownOpen={setIsAssignDropdownOpen}
              assignDropdownRef={assignDropdownRef}
              assignSearchTerm={assignSearchTerm}
              setAssignSearchTerm={setAssignSearchTerm}
              assignOptions={assignOptions}
              filteredAssignOptions={filteredAssignOptions}
              assignedSet={assignedSet}
              toggleAssignSelection={toggleAssignSelection}
              clearAssignSelection={clearAssignSelection}
              selectAllAssign={selectAllAssign}
            />

            <AddWorkorderModalLineItemsSection
              show={effectiveTaskType === 'workorder' || documentOnly}
              formData={formData}
              setFormData={setFormData}
              lineItemsSectionRef={lineItemsSectionRef}
              addLineItemDropdownRef={addLineItemDropdownRef}
              isAddLineItemDropdownOpen={isAddLineItemDropdownOpen}
              setIsAddLineItemDropdownOpen={setIsAddLineItemDropdownOpen}
              addLineItemSearchTerm={addLineItemSearchTerm}
              setAddLineItemSearchTerm={setAddLineItemSearchTerm}
              addLineItemServices={addLineItemServices}
              addLineItemProducts={addLineItemProducts}
              addLineItemFiltered={addLineItemFiltered}
              onAddLineItemSelect={addLineItemSelect}
              lineItemsSectionLabel={apiBackedDocument ? 'Line items (Optional)' : null}
              onNavigateCreatePriceItem={apiBackedDocument ? () => router.push('/settings?section=products') : undefined}
              priceListLoading={apiBackedDocument && priceListLoading}
            />

            <AddWorkorderModalScheduleSection
              documentOnly={documentOnly}
              formData={formData}
              anytime={anytime}
              setAnytime={setAnytime}
              isStartDateCalendarOpen={isStartDateCalendarOpen}
              setIsStartDateCalendarOpen={setIsStartDateCalendarOpen}
              setStartDatePickerMonth={setStartDatePickerMonth}
              startDateCalendarRef={startDateCalendarRef}
              startTimeDropdownRef={startTimeDropdownRef}
              endTimeDropdownRef={endTimeDropdownRef}
              isStartTimeDropdownOpen={isStartTimeDropdownOpen}
              setIsStartTimeDropdownOpen={setIsStartTimeDropdownOpen}
              isEndTimeDropdownOpen={isEndTimeDropdownOpen}
              setIsEndTimeDropdownOpen={setIsEndTimeDropdownOpen}
              isEndValid={isEndValid}
              onRemoveEndTime={removeTime}
            />
                </div>

            <AddWorkorderModalFooter
              documentOnly={documentOnly}
              mode={mode}
              effectiveTaskType={effectiveTaskType}
              editingTask={editingTask}
              onConvertToWorkorder={onConvertToWorkorder}
              onClose={onClose}
              formData={formData}
              anytime={anytime}
              isSubmitting={documentSubmitting}
            />
          </form>
        </div>
      </div>

      {dropdownAnchor && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropdownPortalRef}
          className="bg-white border rounded-lg shadow-xl z-[10000]"
          style={{ position: 'fixed', top: dropdownAnchor.top, left: dropdownAnchor.left, borderColor: '#EAEBED' }}
        >
          {dropdownAnchor.type === 'date' && (
            <AddWorkorderModalCalendar
              currentMonth={startDatePickerMonth}
              setCurrentMonth={setStartDatePickerMonth}
              selectedDateStr={formData.startDate}
              onSelectDate={(day) => {
                          setFormData(prev => ({ ...prev, startDate: format(day, 'MMM d, yyyy') }))
                          setStartDatePickerMonth(day)
                          setIsStartDateCalendarOpen(false)
                        }}
              onClose={() => setIsStartDateCalendarOpen(false)}
            />
          )}
          {dropdownAnchor.type === 'startTime' && startTimeParsed && (
            <AddWorkorderModalTimePickers
              type="start"
              parsed={startTimeParsed}
              onSelect={applyStartTime}
            />
          )}
          {dropdownAnchor.type === 'endTime' && (
            <AddWorkorderModalTimePickers
              type="end"
              parsed={endTimeParsed ?? defaultEndFromStart}
              onSelect={applyEndTime}
            />
          )}
        </div>,
        document.body
      )}

      <AddClientModal
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
        mode="new"
        onSuccess={(data) => {
          setFormData((prev) => ({
            ...prev,
            client: data.name,
            clientId: null,
            address: data.address || prev.address,
          }))
        }}
      />
    </div>
  )
}
