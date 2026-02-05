'use client'

import { useState } from 'react'
import { 
  FiClipboard, 
  FiTool, 
  FiDollarSign, 
  FiChevronRight,
  FiHelpCircle,
  FiCalendar
} from 'react-icons/fi'
import { format } from 'date-fns'
import AddWorkorderModal from './AddWorkorderModal'

export default function Dashboard() {
  const [isAddWorkorderOpen, setIsAddWorkorderOpen] = useState(false)
  const [selectedAppointmentTab, setSelectedAppointmentTab] = useState('Total')
  
  // Get current date and time for greeting
  const currentDate = new Date()
  const currentHour = currentDate.getHours()
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening'
  const formattedDate = format(currentDate, 'EEEE, MMMM d')
  
  // Get user name (in a real app, this would come from auth context)
  const userName = 'test'

  const workflowCards = [
    {
      title: 'Quotes',
      color: '#B084CC', // Purple/Amethyst Smoke - matches Quote Status
      icon: FiClipboard,
      primaryStatus: 'Approved',
      primaryValue: '0',
      subDetails: [
        { label: 'Draft', value: '0' },
        { label: 'Changes requested', value: '0' }
      ]
    },
    {
      title: 'Jobs',
      color: '#2B50AA', // Blue/Sapphire - matches Job Status
      icon: FiTool,
      primaryStatus: 'Requires invoicing',
      primaryValue: '0',
      subDetails: [
        { label: 'Active', value: '0' },
        { label: 'Action required', value: '0' }
      ]
    },
    {
      title: 'Invoices',
      color: '#28AFB0', // Teal/Tropical Teal - matches Invoice Status
      icon: FiDollarSign,
      primaryStatus: 'Awaiting payment',
      primaryValue: '0',
      subDetails: [
        { label: 'Draft', value: '0' },
        { label: 'Past due', value: '0' }
      ]
    }
  ]

  const appointmentTabs = [
    { label: 'Total', value: 'Total' },
    { label: 'Active', value: 'Active' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Overdue', value: 'Overdue' },
    { label: 'Remaining', value: 'Remaining' }
  ]

  const businessPerformanceCards = [
    {
      title: 'Receivables',
      text: '0 clients owe you',
      hasInfo: false
    },
    {
      title: 'Upcoming jobs',
      text: 'This week (Feb 1 - Feb 7)',
      hasInfo: true
    },
    {
      title: 'Revenue',
      text: 'This month so far (Feb 1 - now)',
      hasInfo: true
    }
  ]

  return (
    <div className="space-y-6">
      <AddWorkorderModal 
        isOpen={isAddWorkorderOpen} 
        onClose={() => setIsAddWorkorderOpen(false)} 
      />

      {/* Header Section */}
      <div className="space-y-1">
        <p className="text-xs text-neutral-dark/70">{formattedDate}</p>
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
                  <div key={card.title} className="rounded shadow-sm border border-neutral-light overflow-hidden" style={{ backgroundColor: '#F3F4F6' }}>
                    {/* Colored Bar */}
                    <div className="h-0.5" style={{ backgroundColor: card.color }}></div>
                    <div className="p-2.5">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Icon className="text-neutral-dark" size={14} />
                        <h3 className="text-xs font-semibold text-neutral-dark">{card.title}</h3>
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
            <h2 className="text-base font-bold text-neutral-dark mb-2.5">Today's appointments</h2>
            <div className="rounded shadow-sm border border-neutral-light p-3" style={{ backgroundColor: '#F3F4F6' }}>
              {/* Tabs */}
              <div className="flex gap-3 mb-3 border-b border-neutral-light">
                {appointmentTabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setSelectedAppointmentTab(tab.value)}
                    className={`pb-1 text-[10px] font-medium transition-colors ${
                      selectedAppointmentTab === tab.value
                        ? 'text-neutral-dark border-b-2 border-neutral-dark'
                        : 'text-neutral-dark/60 hover:text-neutral-dark'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              
              {/* Tab Content */}
              <div style={{ minHeight: '120px' }}>
                {/* Empty State */}
                <div className="text-center py-6">
                <p className="text-[10px] text-neutral-dark/70 mb-3">
                  This is where you will get an overview of your appointments for today once they are scheduled.
                </p>
                <button
                  onClick={() => setIsAddWorkorderOpen(true)}
                  className="px-3 py-1.5 bg-secondary text-white rounded hover:bg-secondary-dark transition-colors text-xs font-medium inline-flex items-center gap-1"
                >
                  <FiCalendar size={14} />
                  Schedule a Job
                </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Performance Sidebar */}
        <div className="lg:w-72">
          <h2 className="text-base font-bold text-neutral-dark mb-2.5">Business Performance</h2>
          <div className="space-y-2.5">
            {businessPerformanceCards.map((card) => (
              <div key={card.title} className="rounded shadow-sm border border-neutral-light p-2.5 cursor-pointer hover:shadow-md transition-shadow" style={{ backgroundColor: '#F3F4F6' }}>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-semibold text-neutral-dark">{card.title}</h3>
                  <FiChevronRight className="text-neutral-dark/40" size={12} />
                </div>
                <div className="flex items-center gap-1 mb-1.5">
                  <p className="text-[10px] text-neutral-dark/70">{card.text}</p>
                  {card.hasInfo && (
                    <FiHelpCircle className="text-neutral-dark/40" size={10} />
                  )}
                </div>
                <div className="h-px bg-neutral-light mb-1"></div>
                <div className="h-2.5 w-8 bg-neutral-light rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
