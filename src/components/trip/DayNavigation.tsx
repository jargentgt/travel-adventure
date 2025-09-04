import React from 'react'
import { Trip } from '@/types/trip'

interface DayNavigationProps {
  trip: Trip
  selectedDay: number
  onDayChange: (dayIndex: number) => void
}

export function DayNavigation({ trip, selectedDay, onDayChange }: DayNavigationProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-8 justify-center">
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
  )
} 