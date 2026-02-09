'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  FiClipboard, 
  FiTool, 
  FiDollarSign, 
  FiChevronRight,
  FiHelpCircle,
  FiCalendar
} from 'react-icons/fi'
import { format, isToday, parseISO, parse } from 'date-fns'
import AddWorkorderModal from './AddWorkorderModal'
import { mockWorkorders, mockTeamMembers } from '@/data/mockData'

export default function Dashboard() {
  const router = useRouter()
  const [isAddWorkorderOpen, setIsAddWorkorderOpen] = useState(false)
  const [selectedViewTab, setSelectedViewTab] = useState<'Visit' | 'Employee'>('Visit')
  
  // Get current date and time for greeting
  const currentDate = new Date()
  const formattedDate = format(currentDate, 'EEEE, MMMM d')
  
  // Get user name (in a real app, this would come from auth context)
  const userName = 'Umair'
  const greeting = 'Good morning'

  // Calculate real-time stats from mockWorkorders
  const quoteStats = useMemo(() => ({
    'not sent': mockWorkorders.filter(w => w.quoteStatus === 'not sent').length,
    'waiting for approval': mockWorkorders.filter(w => w.quoteStatus === 'waiting for approval').length,
    'approved': mockWorkorders.filter(w => w.quoteStatus === 'approved').length,
  }), [])

  const jobStats = useMemo(() => ({
    'Unscheduled': mockWorkorders.filter(w => w.jobStatus === 'Unscheduled').length,
    'Scheduled': mockWorkorders.filter(w => w.jobStatus === 'Scheduled').length,
    'In Progress': mockWorkorders.filter(w => w.jobStatus === 'In Progress').length,
    'Completed': mockWorkorders.filter(w => w.jobStatus === 'Completed').length,
  }), [])

  const invoiceStats = useMemo(() => ({
    'not sent': mockWorkorders.filter(w => w.invoiceStatus === 'not sent').length,
    'waiting for payment': mockWorkorders.filter(w => w.invoiceStatus === 'waiting for payment').length,
    'paid': mockWorkorders.filter(w => w.invoiceStatus === 'paid').length,
  }), [])

  // Calculate "Requires invoicing" - jobs that are completed but not invoiced
  const requiresInvoicing = useMemo(() => {
    return mockWorkorders.filter(w => 
      w.jobStatus === 'Completed' && 
      (w.invoiceStatus === 'not sent' || !w.invoiceNumber)
    ).length
  }, [])

  // Calculate "Action required" - jobs that need attention (overdue, etc.)
  const actionRequired = useMemo(() => {
    return mockWorkorders.filter(w => 
      w.jobStatus === 'Overdue' || 
      (w.jobStatus === 'Scheduled' && w.schedule && new Date(w.schedule.day) < new Date())
    ).length
  }, [])

  const workflowCards = useMemo(() => [
    {
      title: 'Quotes',
      color: '#B084CC', // Purple/Amethyst Smoke - matches Quote Status
      icon: FiClipboard,
      primaryStatus: 'Approved',
      primaryValue: quoteStats['approved'].toString(),
      subDetails: [
        { label: 'Waiting for approval', value: quoteStats['waiting for approval'].toString() },
        { label: 'Not sent', value: quoteStats['not sent'].toString() }
      ],
      route: '/quotes'
    },
    {
      title: 'Workflow',
      color: '#2B50AA', // Blue/Sapphire - matches Job Status
      icon: FiTool,
      primaryStatus: 'Requires invoicing',
      primaryValue: requiresInvoicing.toString(),
      subDetails: [
        { label: 'Unscheduled', value: jobStats['Unscheduled'].toString() },
        { label: 'Scheduled', value: jobStats['Scheduled'].toString() },
        { label: 'In Progress', value: jobStats['In Progress'].toString() },
        { label: 'Completed', value: jobStats['Completed'].toString() },
        { label: 'Action required', value: actionRequired.toString() }
      ],
      route: '/workorders'
    },
    {
      title: 'Invoices',
      color: '#28AFB0', // Teal/Tropical Teal - matches Invoice Status
      icon: FiDollarSign,
      primaryStatus: 'Awaiting payment',
      primaryValue: invoiceStats['waiting for payment'].toString(),
      subDetails: [
        { label: 'Not sent', value: invoiceStats['not sent'].toString() },
        { label: 'Paid', value: invoiceStats['paid'].toString() }
      ],
      route: '/invoices'
    }
  ], [quoteStats, jobStats, invoiceStats, requiresInvoicing, actionRequired])

  // Today's appointments: use a fixed date so the same appointments always show (static for demo)
  const STATIC_APPOINTMENTS_DATE = '2026-02-05'
  const todayAppointments = useMemo(() => {
    return mockWorkorders.filter(wo => {
      const scheduleDate = wo.schedule?.day
      return scheduleDate && scheduleDate === STATIC_APPOINTMENTS_DATE
    })
  }, [])

  // Group by status for Visit view
  const appointmentsByStatus = useMemo(() => {
    const grouped: Record<string, typeof todayAppointments> = {}
    todayAppointments.forEach(wo => {
      const status = wo.jobStatus || 'Unscheduled'
      if (!grouped[status]) {
        grouped[status] = []
      }
      grouped[status].push(wo)
    })
    return grouped
  }, [todayAppointments])

  // Group by employee for Employee view
  const appointmentsByEmployee = useMemo(() => {
    const grouped: Record<string, typeof todayAppointments> = {}
    todayAppointments.forEach(wo => {
      const employee = wo.assignedTeamMember || 'Unassigned'
      if (!grouped[employee]) {
        grouped[employee] = []
      }
      grouped[employee].push(wo)
    })
    return grouped
  }, [todayAppointments])

  // Get employee initials
  const getEmployeeInitials = (name: string) => {
    if (!name) return 'U'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  // Get status color
  const getStatusColor = (status: string) => {
    if (status === 'Completed') return '#28AFB0'
    if (status === 'In Progress') return '#2B50AA'
    if (status === 'Scheduled') return '#28AFB0'
    if (status === 'Overdue') return '#EF4444' // Red for overdue
    if (status === 'Unscheduled') return '#EAEBED'
    return '#28AFB0'
  }


  return (
    <div className="space-y-6">
      <AddWorkorderModal 
        isOpen={isAddWorkorderOpen} 
        onClose={() => setIsAddWorkorderOpen(false)} 
      />

      {/* Header Section */}
      <div className="space-y-1">
        <p className="text-sm font-bold text-neutral-dark mb-2">Test Company</p>
        <p className="text-sm text-neutral-dark/70">{formattedDate}</p>
        <h1 className="text-xl md:text-2xl font-bold text-neutral-dark">{greeting}, {userName}</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          {/* Workflow Section */}
          <div>
            <h2 className="text-base font-bold text-neutral-dark mb-2.5">Workflow</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {workflowCards.map((card) => {
                const Icon = card.icon
                return (
                  <div 
                    key={card.title} 
                    onClick={() => router.push(card.route)}
                    className="rounded shadow-sm border border-neutral-light overflow-hidden cursor-pointer transition-all hover:shadow-md"
                    style={{ backgroundColor: '#F3F4F6' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    {/* Colored Bar */}
                    <div className="h-0.5" style={{ backgroundColor: card.color }}></div>
                    <div className="p-2.5">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Icon className="text-neutral-dark" size={14} />
                        <h3 className="text-sm font-semibold text-neutral-dark">{card.title}</h3>
                      </div>
                      <div className="mb-1.5">
                        <p className="text-[9px] text-neutral-dark/70 mb-0.5">{card.primaryStatus}</p>
                        <p className="text-lg font-bold text-neutral-dark">{card.primaryValue}</p>
                      </div>
                      <div className="space-y-0.5">
                        {card.subDetails.map((detail, idx) => (
                          <p key={idx} className="text-[9px] text-neutral-dark/60">
                            {detail.label} ({detail.value})
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Today's Appointments Section */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-base font-bold" style={{ color: '#1F271B' }}>Today's appointments</h2>
              <button
                onClick={() => router.push('/schedule')}
                className="px-3 py-1.5 rounded text-xs font-medium transition-all border"
                style={{ 
                  borderColor: '#2B50AA', 
                  color: '#2B50AA', 
                  backgroundColor: 'white' 
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F0F4FF'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white'
                }}
              >
                View Schedule
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden" style={{ borderColor: '#EAEBED' }}>
              {/* Visit/Employee Tabs */}
              <div className="flex gap-0 border-b" style={{ borderBottomColor: '#EAEBED' }}>
                <button
                  onClick={() => setSelectedViewTab('Visit')}
                  className={`px-4 py-2.5 text-xs font-medium transition-colors ${
                    selectedViewTab === 'Visit'
                      ? 'text-neutral-dark bg-white border-b-2' 
                      : 'text-neutral-dark/60 hover:text-neutral-dark hover:bg-gray-50'
                  }`}
                  style={{
                    borderBottomColor: selectedViewTab === 'Visit' ? '#1F271B' : 'transparent',
                    borderBottomWidth: selectedViewTab === 'Visit' ? '2px' : '0'
                  }}
                >
                  Visit
                </button>
                <button
                  onClick={() => setSelectedViewTab('Employee')}
                  className={`px-4 py-2.5 text-xs font-medium transition-colors ${
                    selectedViewTab === 'Employee'
                      ? 'text-neutral-dark bg-white border-b-2'
                      : 'text-neutral-dark/60 hover:text-neutral-dark hover:bg-gray-50'
                  }`}
                  style={{
                    borderBottomColor: selectedViewTab === 'Employee' ? '#1F271B' : 'transparent',
                    borderBottomWidth: selectedViewTab === 'Employee' ? '2px' : '0'
                  }}
                >
                  Employee
                </button>
              </div>
              
              {/* Content */}
              <div className="p-4">
                {selectedViewTab === 'Visit' ? (
                  // Visit View - Grouped by Status
                  <div className="space-y-4">
                    {Object.keys(appointmentsByStatus).length > 0 ? (
                      Object.entries(appointmentsByStatus).map(([status, appointments]) => (
                        <div key={status}>
                          <h3 className="text-sm font-bold mb-2.5 uppercase tracking-wide" style={{ color: '#1F271B' }}>
                            {appointments.length} {status}
                          </h3>
                          <div className="space-y-2">
                            {appointments.map((wo) => {
                              const employee = wo.assignedTeamMember || 'Unassigned'
                              const startTime = wo.schedule?.startTime || ''
                              const endTime = wo.schedule?.endTime || ''
                              // Format time from HH:mm to h:mm a (e.g., "07:55" -> "7:55 AM")
                              const formatTime = (timeStr: string) => {
                                if (!timeStr) return ''
                                const [hours, minutes] = timeStr.split(':')
                                const hour = parseInt(hours)
                                const ampm = hour >= 12 ? 'PM' : 'AM'
                                const displayHour = hour % 12 || 12
                                return `${displayHour}:${minutes} ${ampm}`
                              }
                              const formattedStartTime = formatTime(startTime)
                              const formattedEndTime = formatTime(endTime)
                              return (
                                <div
                                  key={wo.id}
                                  onClick={() => router.push(`/workorders/${wo.id}`)}
                                  className="bg-white rounded border cursor-pointer hover:shadow-sm transition-all flex items-center gap-3 p-3"
                                  style={{ borderColor: '#EAEBED' }}
                                >
                                  <div className="w-1 h-14 rounded-full flex-shrink-0" style={{ backgroundColor: getStatusColor(status) }}></div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate" style={{ color: '#1F271B' }}>
                                      {wo.clientName} - {wo.title}
                                    </p>
                                    <p className="text-xs mt-1" style={{ color: '#1F271B', opacity: 0.7 }}>
                                      {formattedStartTime} - {formattedEndTime}
                                    </p>
                                  </div>
                                  <div className="flex-shrink-0">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium" style={{ backgroundColor: '#F3F4F6', color: '#1F271B' }}>
                                      {getEmployeeInitials(employee)}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-sm mb-4" style={{ color: '#1F271B', opacity: 0.7 }}>
                          You have no visits scheduled today.
                        </p>
                        <button
                          onClick={() => setIsAddWorkorderOpen(true)}
                          className="px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5 mx-auto border"
                          style={{ borderColor: '#28AFB0', color: '#28AFB0', backgroundColor: 'white' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#F0FDFA'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white'
                          }}
                        >
                          <FiCalendar size={14} />
                          Schedule a Job
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  // Employee View - Grouped by Employee
                  <div className="space-y-4">
                    {Object.keys(appointmentsByEmployee).length > 0 ? (
                      Object.entries(appointmentsByEmployee).map(([employee, appointments]) => (
                        <div key={employee}>
                          <h3 className="text-sm font-bold mb-2.5 flex items-center gap-2" style={{ color: '#1F271B' }}>
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium" style={{ backgroundColor: '#F3F4F6', color: '#1F271B' }}>
                              {getEmployeeInitials(employee)}
                            </div>
                            <span>{employee}</span>
                          </h3>
                          <div className="space-y-2">
                            {appointments.map((wo) => {
                              const startTime = wo.schedule?.startTime || ''
                              const endTime = wo.schedule?.endTime || ''
                              // Format time from HH:mm to h:mm a (e.g., "07:55" -> "7:55 AM")
                              const formatTime = (timeStr: string) => {
                                if (!timeStr) return ''
                                const [hours, minutes] = timeStr.split(':')
                                const hour = parseInt(hours)
                                const ampm = hour >= 12 ? 'PM' : 'AM'
                                const displayHour = hour % 12 || 12
                                return `${displayHour}:${minutes} ${ampm}`
                              }
                              const formattedStartTime = formatTime(startTime)
                              const formattedEndTime = formatTime(endTime)
                              return (
                                <div
                                  key={wo.id}
                                  onClick={() => router.push(`/workorders/${wo.id}`)}
                                  className="bg-white rounded border cursor-pointer hover:shadow-sm transition-all flex items-center gap-3 p-3"
                                  style={{ borderColor: '#EAEBED' }}
                                >
                                  <div className="w-1 h-14 rounded-full flex-shrink-0" style={{ backgroundColor: getStatusColor(wo.jobStatus || 'Unscheduled') }}></div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate" style={{ color: '#1F271B' }}>
                                      {wo.clientName} - {wo.title}
                                    </p>
                                    <p className="text-xs mt-1" style={{ color: '#1F271B', opacity: 0.7 }}>
                                      {formattedStartTime} - {formattedEndTime}
                                    </p>
                                  </div>
                                  <div className="flex-shrink-0">
                                    <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#F3F4F6', color: '#1F271B' }}>
                                      {wo.jobStatus || 'Unscheduled'}
                                    </span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-sm mb-4" style={{ color: '#1F271B', opacity: 0.7 }}>
                          You have no appointments scheduled for today.
                        </p>
                        <button
                          onClick={() => setIsAddWorkorderOpen(true)}
                          className="px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5 mx-auto border"
                          style={{ borderColor: '#28AFB0', color: '#28AFB0', backgroundColor: 'white' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#F0FDFA'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white'
                          }}
                        >
                          <FiCalendar size={14} />
                          Schedule a Job
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
