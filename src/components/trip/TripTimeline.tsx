import React from 'react'
import { Trip, Activity } from '@/types/trip'
import { TimelineItem } from './TimelineItem'
import { DayNavigationFooter } from './DayNavigation'
import { formatShortDate } from '@/utils/dateFormatter'

interface TripTimelineProps {
  trip: Trip
  selectedDay: number
  onDayChange: (dayIndex: number) => void
}

export function TripTimeline({ trip, selectedDay, onDayChange }: TripTimelineProps) {

  // Filter activities to only include Activity objects (not string IDs)
  const activities = trip.days[selectedDay].activities.filter(
    (activity): activity is Activity => typeof activity === 'object'
  )

  return (
    <div className="content-container-lg">
      <div id="timeline-content" className="card bg-base-100 shadow-xl">
        <div className="card-header p-6 pb-0">
          <h3 className="text-2xl font-bold flex items-center gap-3">
                          <span className="i-mdi-calendar-today w-6 h-6 text-primary"></span>
            {formatShortDate(trip.days[selectedDay].date)}
          </h3>
        </div>
        <div className="card-body">
          <ul className="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical timeline-centered">
            {activities.map((activity, index) => {
              const isShifted = index % 2 === 1
              
              return (
                <TimelineItem
                  key={activity.id || index}
                  activity={activity}
                  index={index}
                  isShifted={isShifted}
                />
              )
            })}
          </ul>
        </div>
      </div>
      
      {/* Day Navigation Footer */}
      <DayNavigationFooter 
        trip={trip} 
        selectedDay={selectedDay} 
        onDayChange={onDayChange} 
      />
    </div>
  )
} 