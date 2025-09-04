import React from 'react'
import { Trip, Activity } from '@/types/trip'
import { TimelineItem } from './TimelineItem'

interface TripTimelineProps {
  trip: Trip
  selectedDay: number
}

export function TripTimeline({ trip, selectedDay }: TripTimelineProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Filter activities to only include Activity objects (not string IDs)
  const activities = trip.days[selectedDay].activities.filter(
    (activity): activity is Activity => typeof activity === 'object'
  )

  return (
    <div className="content-container-lg">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-header p-6 pb-0">
          <h3 className="text-2xl font-bold flex items-center gap-3">
                          <span className="i-mdi-calendar-today w-6 h-6 text-primary"></span>
            {formatDate(trip.days[selectedDay].date)}
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
    </div>
  )
} 