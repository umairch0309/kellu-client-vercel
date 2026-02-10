'use client'

import { useState } from 'react'
import { FiPlus, FiSearch, FiCheckCircle, FiClock } from 'react-icons/fi'
import NewTaskModal from './NewTaskModal'

const initialMockTasks = [
  {
    id: 1,
    title: 'Follow-up Call',
    clientName: 'Mike Davis',
    assignedTo: 'Bob Miller',
    dueDate: '2024-01-16',
    status: 'Pending',
    priority: 'Medium',
  },
  {
    id: 2,
    title: 'Site Inspection',
    clientName: 'Emily Brown',
    assignedTo: 'Tom Wilson',
    dueDate: '2024-01-17',
    status: 'In Progress',
    priority: 'High',
  },
  {
    id: 3,
    title: 'Quote Review',
    clientName: 'John Smith',
    assignedTo: 'Jane Doe',
    dueDate: '2024-01-15',
    status: 'Completed',
    priority: 'Low',
  },
]

export default function TasksList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false)
  const [tasks, setTasks] = useState(initialMockTasks)

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || task.status.toLowerCase().replace(' ', '-') === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-neutral-dark">Tasks</h1>
        <button
          onClick={() => setIsNewTaskModalOpen(true)}
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
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
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
            <div key={task.id} className="p-4 hover:bg-neutral-light/50">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-dark">{task.title}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                  task.status === 'Completed' ? 'bg-secondary/20 text-secondary-dark' :
                  task.status === 'In Progress' ? 'bg-secondary/20 text-secondary-dark' :
                  'bg-tertiary/20 text-tertiary-dark'
                }`}>
                  {task.status === 'Completed' ? <FiCheckCircle size={14} className="inline mr-1" /> : <FiClock size={14} className="inline mr-1" />}
                  {task.status}
                </span>
              </div>
              <div className="space-y-1 mt-2">
                <p className="text-xs text-neutral-dark">
                  <span className="text-neutral-dark/70">Client: </span>{task.clientName}
                </p>
                <p className="text-xs text-neutral-dark/70">
                  Assigned To: {task.assignedTo}
                </p>
                <p className="text-xs text-neutral-dark/70">
                  Due Date: {task.dueDate}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-neutral-dark/70">Priority:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.priority === 'High' ? 'bg-tertiary/20 text-tertiary-dark' :
                    task.priority === 'Medium' ? 'bg-secondary/20 text-secondary-dark' :
                    'bg-neutral-dark/10 text-neutral-dark'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-light">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Title</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Client</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Assigned To</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Due Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Priority</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-dark">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr
                  key={task.id}
                  className="border-b border-neutral-light hover:bg-neutral-light/50 cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-neutral-dark">{task.title}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-dark">{task.clientName}</td>
                  <td className="px-4 py-3 text-sm text-neutral-dark/70">{task.assignedTo}</td>
                  <td className="px-4 py-3 text-sm text-neutral-dark/70">{task.dueDate}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.priority === 'High' ? 'bg-tertiary/20 text-tertiary-dark' :
                      task.priority === 'Medium' ? 'bg-secondary/20 text-secondary-dark' :
                      'bg-neutral-dark/10 text-neutral-dark'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                      task.status === 'Completed' ? 'bg-secondary/20 text-secondary-dark' :
                      task.status === 'In Progress' ? 'bg-secondary/20 text-secondary-dark' :
                      'bg-tertiary/20 text-tertiary-dark'
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

      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        onSave={(task) => {
          setTasks(prev => [...prev, {
            id: Math.max(0, ...prev.map(t => t.id)) + 1,
            title: task.title,
            clientName: task.clientName || '—',
            assignedTo: task.assignedTo || 'Unassigned',
            dueDate: task.startDate,
            status: 'Pending',
            priority: 'Medium',
          }])
          setIsNewTaskModalOpen(false)
        }}
      />
    </div>
  )
}

