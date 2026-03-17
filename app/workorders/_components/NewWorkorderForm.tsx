'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { mockClients, mockTeamMembers, mockWorkorders, mockMaterialsList, companyTaxRatePercent } from '@/data/mockData'
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

interface NewWorkorderFormProps {
  workorderId?: number
}

export default function NewWorkorderForm({ workorderId }: NewWorkorderFormProps = {}) {
  const router = useRouter()
  const [clientSearchTerm, setClientSearchTerm] = useState('')
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false)
  const [isTeamMemberDropdownOpen, setIsTeamMemberDropdownOpen] = useState(false)
  const [assignSearchTerm, setAssignSearchTerm] = useState('')
  const [lineItemNameDropdownIndex, setLineItemNameDropdownIndex] = useState<number | null>(null)
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false)
  const [addProductModalLineIndex, setAddProductModalLineIndex] = useState<number | null>(null)
  const [addProductModalInitialName, setAddProductModalInitialName] = useState('')
  const [customMaterials, setCustomMaterials] = useState<Array<{ id: number; name: string; description: string; unitPrice: number }>>([])
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
  const clientDropdownRef = useRef<HTMLDivElement>(null)
  const teamMemberDropdownRef = useRef<HTMLDivElement>(null)
  const lineItemsSectionRef = useRef<HTMLDivElement>(null)

  const workorder = workorderId ? mockWorkorders.find(wo => wo.id === workorderId) : null

  const [formData, setFormData] = useState({
    title: workorder?.title || '',
    clientId: workorder?.clientId ?? null as number | null,
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

  useEffect(() => {
    if (formData.clientId && formData.clientId > 0) {
      const lastJob = mockWorkorders
        .filter(wo => wo.clientId === formData.clientId)
        .sort((a, b) => new Date((b as { createdAt: string }).createdAt).getTime() - new Date((a as { createdAt: string }).createdAt).getTime())[0]
      if (lastJob && lastJob.address) {
        setFormData(prev => ({ ...prev, address: lastJob.address }))
      } else {
        const client = mockClients.find(c => c.id === formData.clientId)
        if (client && client.address) {
          setFormData(prev => ({ ...prev, address: client.address || '' }))
        }
      }
    }
  }, [formData.clientId])

  const filteredClients = mockClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
      client.phone.includes(clientSearchTerm) ||
      (client.email && client.email.toLowerCase().includes(clientSearchTerm.toLowerCase()))
    return matchesSearch || (workorderId && client.id === formData.clientId)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (workorderId) {
      alert('Workorder updated successfully! (Static UI)')
      router.push(`/workorders/${workorderId}`)
    } else {
      alert('Workorder created successfully! (Static UI)')
      router.push('/workorders')
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

  const handleClientSelect = (clientId: number, clientName: string) => {
    setFormData(prev => ({ ...prev, clientId, clientName }))
    setIsClientDropdownOpen(false)
    setClientSearchTerm('')
  }

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
            materialsList={mockMaterialsList}
            customMaterials={customMaterials}
            onOpenAddProduct={openAddProductModal}
          />

          <NewWorkorderNotesSection notes={formData.notes} onFieldChange={handleChange} />

          <NewWorkorderFormFooter isEdit={!!workorderId} onCancel={handleCancel} />
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
            setFormData(prev => ({ ...prev, clientName: data.name, clientId: -1 }))
            setClientSearchTerm('')
            setIsAddClientOpen(false)
          }}
        />
      </div>
    </div>
  )
}
