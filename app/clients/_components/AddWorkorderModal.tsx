'use client'

import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { format, parse } from 'date-fns'
import { mockClients, mockTeamMembers, mockMasterPriceList, mockWorkorders } from '@/data/mockData'
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
  const quoteOnly = mode === 'quote-only'
  const invoiceOnly = mode === 'invoice-only'
  const taskOnly = mode === 'task'
  const documentOnly = quoteOnly || invoiceOnly

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

  const addLineItemFiltered = mockMasterPriceList.filter(
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

  const filteredClientsForModal = mockClients.filter(
    c =>
      c.name.toLowerCase().includes((formData.client || '').toLowerCase()) ||
      (c.address || '').toLowerCase().includes((formData.client || '').toLowerCase()) ||
      (c.phone || '').includes(formData.client || '')
  )

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
    const client = initialClientId ? mockClients.find(c => c.id === initialClientId) : null
    setFormData(prev => ({
      ...prev,
      client: client ? client.name : '',
      address: client ? (client.address || '') : '',
      startDate: initialDate ? format(initialDate, 'MMM d, yyyy') : format(new Date(), 'MMM d, yyyy'),
      startTime: initialTime || '03:15 AM',
      endTime: initialTime ? (() => {
        const [time, period] = initialTime.split(' ')
        const [hours, minutes] = time.split(':')
        let hour = parseInt(hours)
        if (period === 'PM' && hour !== 12) hour += 12
        if (period === 'AM' && hour === 12) hour = 0
        const endHour = (hour + 1) % 24
        const endHour12 = endHour > 12 ? endHour - 12 : endHour === 0 ? 12 : endHour
        const endAmpm = endHour >= 12 ? 'PM' : 'AM'
        return `${endHour12}:${minutes} ${endAmpm}`
      })() : '04:15 AM',
    }))
    setAnytime(!initialTime)
  }, [isOpen, initialDate, initialTime, initialClientId])

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (quoteOnly) {
      const clientMatch = mockClients.find(c => c.name === formData.client)
      const clientId = clientMatch?.id ?? 1
      const clientName = formData.client || (clientMatch?.name ?? '')
      const lineItems = formData.lineItems.map(item => ({
        name: item.name,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice ?? 0,
        unitCost: 0,
        total: (item.quantity || 1) * (item.unitPrice ?? 0),
      }))
      const subtotal = lineItems.reduce((sum, i) => sum + i.total, 0)
      const newId = mockWorkorders.length > 0 ? Math.max(...mockWorkorders.map((w: { id: number }) => w.id)) + 1 : 1
      const newWo = {
        id: newId,
        title: formData.title || 'Quote',
        clientId,
        clientName,
        address: formData.address || '',
        schedule: { day: format(new Date(), 'yyyy-MM-dd'), startTime: '09:00', endTime: '10:00' },
        assignedTeamMember: '',
        instructions: '',
        lineItems,
        subtotal,
        discount: 0,
        discountType: 'amount' as const,
        tax: 0,
        total: subtotal,
        cost: 0,
        estimateMargin: subtotal,
        expenses: [],
        notes: '',
        quoteStatus: 'not sent' as const,
        quoteNumber: '',
        quoteDateSent: '',
        quoteWhatsappStatus: '',
        quoteRequired: true,
        invoiceStatus: 'not sent' as const,
        invoiceNumber: '',
        invoiceDateSent: '',
        invoiceWhatsappStatus: '',
        jobStatus: 'Scheduled' as const,
        payments: [],
        createdAt: format(new Date(), 'yyyy-MM-dd'),
        lastModified: format(new Date(), 'yyyy-MM-dd'),
      }
      mockWorkorders.push(newWo as never)
      alert('Quote saved. Work order created.')
      onClose()
      setFormData(defaultFormState())
      return
    }
    if (invoiceOnly) {
      const clientMatch = mockClients.find(c => c.name === formData.client)
      const clientId = clientMatch?.id ?? 1
      const clientName = formData.client || (clientMatch?.name ?? '')
      const lineItems = formData.lineItems.map(item => ({
        name: item.name,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice ?? 0,
        unitCost: 0,
        total: (item.quantity || 1) * (item.unitPrice ?? 0),
      }))
      const subtotal = lineItems.reduce((sum, i) => sum + i.total, 0)
      const newId = mockWorkorders.length > 0 ? Math.max(...mockWorkorders.map((w: { id: number }) => w.id)) + 1 : 1
      const newWo = {
        id: newId,
        title: formData.title || 'Invoice',
        clientId,
        clientName,
        address: formData.address || '',
        schedule: { day: format(new Date(), 'yyyy-MM-dd'), startTime: '09:00', endTime: '10:00' },
        assignedTeamMember: '',
        instructions: '',
        lineItems,
        subtotal,
        discount: 0,
        discountType: 'amount' as const,
        tax: 0,
        total: subtotal,
        cost: 0,
        estimateMargin: subtotal,
        expenses: [],
        notes: '',
        quoteStatus: 'approved' as const,
        quoteNumber: `Q-${newId}`,
        quoteDateSent: format(new Date(), 'yyyy-MM-dd'),
        quoteWhatsappStatus: 'sent',
        invoiceStatus: 'not sent' as const,
        invoiceNumber: '',
        invoiceDateSent: '',
        invoiceWhatsappStatus: '',
        jobStatus: 'Completed' as const,
        payments: [],
        createdAt: format(new Date(), 'yyyy-MM-dd'),
        lastModified: format(new Date(), 'yyyy-MM-dd'),
      }
      mockWorkorders.push(newWo as never)
      alert('Invoice saved. Work order created.')
      onClose()
      setFormData(defaultFormState())
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

        <div className="flex-1 overflow-y-auto p-2.5">
          <form onSubmit={handleSubmit} className="space-y-2.5">
            <AddWorkorderModalClientSection
              formData={formData}
              setFormData={setFormData}
              onFieldChange={handleChange}
              isClientDropdownOpen={isClientDropdownOpen}
              setIsClientDropdownOpen={setIsClientDropdownOpen}
              clientDropdownRef={clientDropdownRef}
              filteredClients={filteredClientsForModal}
              onOpenAddClient={() => setIsAddClientOpen(true)}
            />

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Address</label>
              <p className="text-[10px] mb-0.5" style={{ color: '#1F271B', opacity: 0.6 }}>Fetched from last registered workorder or task of selected client</p>
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
              <label className="block text-xs font-medium mb-1" style={{ color: '#1F271B' }}>Title</label>
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

            <AddWorkorderModalFooter
              documentOnly={documentOnly}
              mode={mode}
              effectiveTaskType={effectiveTaskType}
              editingTask={editingTask}
              onConvertToWorkorder={onConvertToWorkorder}
              onClose={onClose}
              formData={formData}
              anytime={anytime}
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
          setFormData(prev => ({ ...prev, client: data.name, address: data.address || prev.address }))
        }}
      />
    </div>
  )
}
