'use client'

import { FiX, FiCalendar } from 'react-icons/fi'
import type { ScheduleItem } from './scheduleTypes'

export type UnscheduledSidebarProps = {
  showUnscheduled: boolean
  onClose: () => void
  unscheduledItems: ScheduleItem[]
}

export default function UnscheduledSidebar({
  showUnscheduled,
  onClose,
  unscheduledItems,
}: UnscheduledSidebarProps) {
  if (!showUnscheduled) return null

  return (
    <div className="flex lg:flex w-64 max-w-[90vw] lg:max-w-none border-l border-neutral-light bg-white flex-col flex-shrink-0 fixed lg:relative right-0 top-0 bottom-0 z-30 lg:z-auto shadow-lg lg:shadow-none h-full">
      <div className="p-4 border-b border-neutral-light flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-neutral-dark">Unscheduled</span>
          <span className="text-sm text-neutral-dark/70">({unscheduledItems.length})</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-neutral-light rounded">
          <FiX size={18} className="text-neutral-dark/70" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {unscheduledItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-lg bg-neutral-light flex items-center justify-center mb-4">
              <FiCalendar className="text-neutral-dark/30" size={32} />
            </div>
            <p className="text-sm text-neutral-dark/70 mb-1">Drag items here to unschedule them</p>
          </div>
        ) : (
          <div className="space-y-2">
            {unscheduledItems.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/x-schedule-item', JSON.stringify({ id: item.id }))
                  e.dataTransfer.effectAllowed = 'move'
                  e.dataTransfer.setDragImage(e.currentTarget, 0, 0)
                }}
                className="p-3 bg-neutral-light rounded-lg border border-neutral-light cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow"
              >
                <p className="text-sm font-medium text-neutral-dark">{item.clientName}</p>
                <p className="text-xs text-neutral-dark/70 mt-1">{item.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
