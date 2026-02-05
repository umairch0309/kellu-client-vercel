'use client'

import { useState } from 'react'
import { FiPlus, FiSearch, FiCheckCircle, FiClock } from 'react-icons/fi'

const mockTasks = [
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

  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || task.status.toLowerCase().replace(' ', '-') === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-neutral-dark">Tasks</h1>
        <button className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-colors flex items-center gap-2">
          <FiPlus size={18} />
          <span>New Task</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-neutral-light">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-dark/50" size={18} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-light overflow-hidden">
        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-neutral-light">
          {filteredTasks.map((task) => (
            <div key={task.id} className="p-4 hover:bg-neutral-light/50">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-dark">{task.title}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                  task.status === 'Completed' ? 'bg-secondary/20 text-secondary' :
                  task.status === 'In Progress' ? 'bg-secondary/20 text-secondary' :
                  'bg-tertiary/20 text-tertiary'
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
                    task.priority === 'High' ? 'bg-tertiary/20 text-tertiary' :
                    task.priority === 'Medium' ? 'bg-secondary/20 text-secondary' :
                    'bg-neutral-dark/20 text-neutral-dark'
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
                      task.priority === 'High' ? 'bg-tertiary/20 text-tertiary' :
                      task.priority === 'Medium' ? 'bg-secondary/20 text-secondary' :
                      'bg-neutral-dark/20 text-neutral-dark'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                      task.status === 'Completed' ? 'bg-secondary/20 text-secondary' :
                      task.status === 'In Progress' ? 'bg-secondary/20 text-secondary' :
                      'bg-tertiary/20 text-tertiary'
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
    </div>
  )
}

