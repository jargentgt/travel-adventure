import React from 'react'
import { Trip } from '@/types/trip'
import { formatDateRange, formatShortDate } from '@/utils/dateFormatter'

interface TripInfoProps {
  trip: Trip
}

export function TripInfo({ trip }: TripInfoProps) {

  const stats = {
    totalDays: trip.days.length,
    totalActivities: trip.days.reduce((acc, day) => acc + day.activities.length, 0)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">Trip Information</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-bold mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {trip.tags.map((tag) => (
                  <div key={tag} className="badge badge-outline badge-sm">
                    #{tag}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-2">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {trip.categories.map((category) => (
                  <div key={category} className="badge badge-primary">
                    {category}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-2">Trip Duration</h4>
              <p className="text-sm">
                {formatDateRange(trip.startDate, trip.endDate)} ({stats.totalDays} days)
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-2">Last Updated</h4>
              <p className="text-sm text-base-content/60">
                {trip.updatedAt ? new Date(trip.updatedAt).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 