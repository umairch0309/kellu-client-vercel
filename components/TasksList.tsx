'use client'

import { useState } from 'react'
import { FiPlus, FiSearch, FiCheckCircle, FiClock } from 'react-icons/fi'
import AddWorkorderModal from './AddWorkorderModal'
import { mockWorkorders, mockClients } from '@/data/mockData'
import { format, parse } from 'date-fns'

type TaskItem = {
  id: number
  title: string
  clientName: string
  assignedTo: string
  dueDate: string
  status: string // same as Job Status: Unscheduled | Scheduled | In Progress | Completed
  address?: string
  instructions?: string
}

const initialMockTasks: TaskItem[] = [
  {
    id: 1,
    title: 'Follow-up Call',
    clientName: 'Mike Davis',
    assignedTo: 'Bob Miller',
    dueDate: '2024-01-16',
    status: 'Scheduled',
  },
  {
    id: 2,
    title: 'Site Inspection',
    clientName: 'Emily Brown',
    assignedTo: 'Tom Wilson',
    dueDate: '2024-01-17',
    status: 'In Progress',
  },
  {
    id: 3,
    title: 'Quote Review',
    clientName: 'John Smith',
    assignedTo: 'Jane Doe',
    dueDate: '2024-01-15',
    status: 'Completed',
  },
]

export default function TasksList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null)
  const [tasks, setTasks] = useState(initialMockTasks)

  const openNewTaskModal = () => {
    setEditingTask(null)
    setIsNewTaskModalOpen(true)
  }
  const openEditTaskModal = (task: TaskItem) => {
    setEditingTask(task)
    setIsNewTaskModalOpen(true)
  }
  const closeTaskModal = () => {
    setIsNewTaskModalOpen(false)
    setEditingTask(null)
  }

  const timeTo24 = (s: string): string => {
    if (!s || !s.trim()) return '09:00'
    const m = s.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
    if (!m) return '09:00'
    let hour = parseInt(m[1], 10)
    const minute = m[2]
    if (m[3].toUpperCase() === 'PM' && hour !== 12) hour += 12
    if (m[3].toUpperCase() === 'AM' && hour === 12) hour = 0
    return `${String(hour).padStart(2, '0')}:${minute}`
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-neutral-dark">Tasks</h1>
        <button
          onClick={openNewTaskModal}
          className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          style={{ backgroundColor: '#28AFB0', color: 'white' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E8A8B' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#28AFB0' }}
        >
          <FiPlus size={18} />
          <span>New Task</span>
        </button>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-light overflow-hidden">
        {/* Filters + Search - single line (consistent with Workorders) */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 p-3 border-b border-neutral-light">
          <h2 className="text-base font-bold" style={{ color: '#1F271B' }}>
            All tasks ({filteredTasks.length} result{filteredTasks.length !== 1 ? 's' : ''})
          </h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 sm:flex-initial justify-end">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 border rounded text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
              style={{ borderColor: '#EAEBED', color: '#1F271B', backgroundColor: '#F3F4F6' }}
            >
              <option value="all">Status | All</option>
              <option value="Unscheduled">Unscheduled</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <div className="relative flex-1 sm:flex-initial sm:min-w-[200px]">
              <FiSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2" size={14} style={{ color: '#1F271B', opacity: 0.5 }} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                style={{ borderColor: '#EAEBED', color: '#1F271B' }}
              />
            </div>
          </div>
        </div>
        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-neutral-light">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              role="button"
              tabIndex={0}
              onClick={() => openEditTaskModal(task)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEditTaskModal(task) } }}
              className="p-4 hover:bg-neutral-light/50 cursor-pointer active:bg-neutral-light/70"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-dark">{task.clientName}</p>
                  <p className="text-xs text-neutral-dark/70 mt-0.5">{task.title}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 shrink-0 ${
                  task.status === 'Completed' || task.status === 'In Progress' ? 'bg-[rgba(40,175,176,0.2)] text-[#1E8A8B]' :
                  task.status === 'Scheduled' ? 'bg-[rgba(43,80,170,0.2)] text-[#1F3A7A]' :
                  'bg-neutral-dark/10 text-neutral-dark'
                }`}>
                  {task.status === 'Completed' ? <FiCheckCircle size={14} className="inline mr-1" /> : <FiClock size={14} className="inline mr-1" />}
                  {task.status}
                </span>
              </div>
              <div className="space-y-1 mt-2">
                <p className="text-xs text-neutral-dark/70">
                  Assigned To: {task.assignedTo}
                </p>
                <p className="text-xs text-neutral-dark/70">
                  Scheduled date: {task.dueDate}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-light">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Client</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Title</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Assigned To</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Scheduled date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr
                  key={task.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openEditTaskModal(task)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEditTaskModal(task) } }}
                  className="border-b border-neutral-light hover:bg-neutral-light/50 cursor-pointer"
                >
                  <td className="px-4 py-3 text-sm font-medium text-neutral-dark">{task.clientName}</td>
                  <td className="px-4 py-3 text-sm text-neutral-dark">{task.title}</td>
                  <td className="px-4 py-3 text-sm text-neutral-dark/70">{task.assignedTo}</td>
                  <td className="px-4 py-3 text-sm text-neutral-dark/70">{task.dueDate}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                      task.status === 'Completed' || task.status === 'In Progress' ? 'bg-[rgba(40,175,176,0.2)] text-[#1E8A8B]' :
                      task.status === 'Scheduled' ? 'bg-[rgba(43,80,170,0.2)] text-[#1F3A7A]' :
                      'bg-neutral-dark/10 text-neutral-dark'
                    }`}>
                      {task.status === 'Completed' ? <FiCheckCircle size={14} /> : <FiClock size={14} />}
                      {task.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddWorkorderModal
        key={editingTask ? `edit-${editingTask.id}` : 'new'}
        isOpen={isNewTaskModalOpen}
        onClose={closeTaskModal}
        mode="task"
        editingTask={editingTask ? {
          id: editingTask.id,
          title: editingTask.title,
          clientName: editingTask.clientName,
          address: editingTask.address,
          instructions: editingTask.instructions,
          assignedTo: editingTask.assignedTo,
          dueDate: editingTask.dueDate,
        } : undefined}
        onTaskCreated={(task) => {
          setTasks(prev => [...prev, {
            id: Math.max(0, ...prev.map(t => t.id)) + 1,
            title: task.title,
            clientName: task.clientName || '—',
            assignedTo: task.assignedTo || 'Unassigned',
            dueDate: (() => {
              try {
                const d = parse(task.startDate, 'MMM d, yyyy', new Date())
                return isNaN(d.getTime()) ? task.startDate : format(d, 'yyyy-MM-dd')
              } catch {
                return task.startDate
              }
            })(),
            status: 'Scheduled',
          }])
          closeTaskModal()
        }}
        onTaskUpdated={(taskId, task) => {
          setTasks(prev => prev.map(t => t.id === taskId ? {
            ...t,
            title: task.title,
            clientName: task.clientName || '—',
            assignedTo: task.assignedTo || 'Unassigned',
            dueDate: (() => {
              try {
                const d = parse(task.startDate, 'MMM d, yyyy', new Date())
                return isNaN(d.getTime()) ? task.startDate : format(d, 'yyyy-MM-dd')
              } catch {
                return task.startDate
              }
            })(),
            address: task.address || t.address,
            instructions: task.instructions || t.instructions,
          } : t))
          closeTaskModal()
        }}
        onConvertToWorkorder={(task) => {
          const clientMatch = mockClients.find(c => c.name === task.clientName)
          const clientId = clientMatch?.id ?? 1
          const newId = mockWorkorders.length > 0 ? Math.max(...mockWorkorders.map((w: { id: number }) => w.id)) + 1 : 1
          let scheduleDay = format(new Date(), 'yyyy-MM-dd')
          try {
            const d = parse(task.startDate, 'MMM d, yyyy', new Date())
            if (!isNaN(d.getTime())) scheduleDay = format(d, 'yyyy-MM-dd')
          } catch {
            // use today
          }
          const newWo = {
            id: newId,
            title: task.title || 'Work order',
            clientId,
            clientName: task.clientName || '',
            address: task.address || '',
            schedule: { day: scheduleDay, startTime: task.anytime ? '09:00' : timeTo24(task.startTime), endTime: task.anytime ? '10:00' : timeTo24(task.endTime || '10:00 AM') },
            assignedTeamMember: task.assignedTo?.split(',')[0]?.trim() || '',
            instructions: task.instructions || '',
            lineItems: [],
            subtotal: 0,
            discount: 0,
            discountType: 'amount' as const,
            tax: 0,
            total: 0,
            cost: 0,
            estimateMargin: 0,
            expenses: [],
            notes: '',
            quoteStatus: 'not sent' as const,
            quoteNumber: '',
            quoteDateSent: '',
            quoteWhatsappStatus: '',
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
          if (editingTask) {
            setTasks(prev => prev.filter(t => t.id !== editingTask.id))
          }
          closeTaskModal()
        }}
      />
    </div>
  )
}

