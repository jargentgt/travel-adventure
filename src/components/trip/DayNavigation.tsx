import React from 'react'
import { Trip } from '@/types/trip'
import { formatShortDate } from '@/utils/dateFormatter'

interface DayNavigationProps {
  trip: Trip
  selectedDay: number
  onDayChange: (dayIndex: number) => void
}

export function DayNavigation({ trip, selectedDay, onDayChange }: DayNavigationProps) {
  return (
    <div className="sticky top-16 z-40 bg-base-100 shadow-sm mb-8">
      {/* Mobile: Full width with horizontal scroll */}
      <div className="md:hidden py-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 px-4">
          {trip.days.map((day, index) => (
            <button
              key={index}
              className={`btn btn-sm flex-shrink-0 ${selectedDay === index ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => onDayChange(index)}
            >
              Day {index + 1}
              <div className="badge badge-sm ml-2">{day.activities.length}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Desktop: Center aligned, no scroll */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-2 justify-center flex-wrap">
            {trip.days.map((day, index) => (
              <button
                key={index}
                className={`btn btn-sm ${selectedDay === index ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => onDayChange(index)}
              >
                Day {index + 1}
                <div className="badge badge-sm ml-2">{day.activities.length}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface DayNavigationFooterProps {
  trip: Trip
  selectedDay: number
  onDayChange: (dayIndex: number) => void
}

export function DayNavigationFooter({ trip, selectedDay, onDayChange }: DayNavigationFooterProps) {
  const previousDay = selectedDay > 0 ? selectedDay - 1 : null
  const nextDay = selectedDay < trip.days.length - 1 ? selectedDay + 1 : null

  const handleDayChange = (dayIndex: number) => {
    onDayChange(dayIndex)
    // Smooth scroll to timeline content instead of very top
    setTimeout(() => {
      const timelineElement = document.getElementById('timeline-content')
      if (timelineElement) {
        timelineElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    }, 50) // Small delay to ensure content has updated
  }

  if (previousDay === null && nextDay === null) {
    return null
  }

    return (
    <div className="mt-8">
      <div className="mx-auto py-6">
        {/* Unified Layout - Simple side by side for all screen sizes */}
        <div className="flex justify-between items-center w-full">
          {/* Previous Day - Left Aligned */}
          <div className="flex justify-start">
            {previousDay !== null ? (
              <button 
                onClick={() => handleDayChange(previousDay)}
                className="group flex items-center gap-3 p-3 rounded-lg bg-base-100 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.05]"
              >
                <span className="i-mdi-chevron-left w-5 h-5 text-base-content/60"></span>
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold">
                  {previousDay + 1}
                </div>
              </button>
            ) : (
              <div className="opacity-30">
                <span className="i-mdi-chevron-left w-5 h-5 text-base-content/40"></span>
              </div>
            )}
          </div>

          {/* Next Day - Right Aligned */}
          <div className="flex justify-end">
            {nextDay !== null ? (
              <button 
                onClick={() => handleDayChange(nextDay)}
                className="group flex items-center gap-3 p-3 rounded-lg bg-base-100 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.05]"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold">
                  {nextDay + 1}
                </div>
                <span className="i-mdi-chevron-right w-5 h-5 text-base-content/60"></span>
              </button>
            ) : (
              <div className="opacity-30">
                <span className="i-mdi-chevron-right w-5 h-5 text-base-content/40"></span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 