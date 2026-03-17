export interface LineItemForm {
  name: string
  description: string
  quantity: number
  unitPrice: number
}

export interface AddWorkorderFormData {
  client: string
  address: string
  title: string
  instructions: string
  assignedTeamMembers: string[]
  startDate: string
  startTime: string
  endTime: string
  lineItems: LineItemForm[]
}

export type AddWorkorderModalMode = 'workorder' | 'quote-only' | 'invoice-only' | 'task'

export interface EditingTask {
  id: number
  title: string
  clientName: string
  address?: string
  instructions?: string
  assignedTo: string
  dueDate: string
}

export interface AddWorkorderModalProps {
  isOpen: boolean
  onClose: () => void
  initialDate?: Date
  initialTime?: string
  position?: { x: number; y: number }
  initialClientId?: number
  mode?: AddWorkorderModalMode
  onTaskCreated?: (task: {
    title: string
    clientName: string
    address: string
    instructions: string
    assignedTo: string
    startDate: string
    startTime: string
    endTime: string
    anytime: boolean
  }) => void
  editingTask?: EditingTask
  onTaskUpdated?: (
    taskId: number,
    task: {
      title: string
      clientName: string
      address: string
      instructions: string
      assignedTo: string
      startDate: string
      startTime: string
      endTime: string
      anytime: boolean
    }
  ) => void
  onConvertToWorkorder?: (task: {
    title: string
    clientName: string
    address: string
    instructions: string
    assignedTo: string
    startDate: string
    startTime: string
    endTime: string
    anytime: boolean
  }) => void
}

export interface AssignOption {
  value: string
  label: string
}

export interface ClientOption {
  id: number
  name: string
  address?: string
  phone?: string
}
