import React from 'react'
import { Trip, Activity } from '@/types/trip'

interface TripStatsProps {
  trip: Trip
}

export function TripStats({ trip }: TripStatsProps) {
  const getTripStats = () => {
    const totalActivities = trip.days.reduce((acc, day) => acc + day.activities.length, 0)
    const categorySet = new Set(trip.days.flatMap(day => 
      day.activities
        .filter(activity => typeof activity === 'object' && activity.category)
        .map(activity => (activity as Activity).category)
    ))
    const categories = Array.from(categorySet)
    
    return {
      totalActivities,
      totalDays: trip.days.length,
      categories
    }
  }

  const stats = getTripStats()

  return (
    <div className="bg-base-200/50 py-6">
      <div className="content-container-narrow">
        <div className="stats shadow-lg w-full">
          <div className="stat">
            <div className="stat-figure text-primary">
              <span className="i-mdi-calendar-today w-8 h-8"></span>
            </div>
            <div className="stat-title">Total Days</div>
            <div className="stat-value text-primary">{stats.totalDays}</div>
            <div className="stat-desc">Including travel time</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-secondary">
              <span className="i-mdi-checklist w-8 h-8"></span>
            </div>
            <div className="stat-title">Activities</div>
            <div className="stat-value text-secondary">{stats.totalActivities}</div>
            <div className="stat-desc">Meals, tours & experiences</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-accent">
              <span className="i-mdi-currency-usd w-8 h-8"></span>
            </div>
            <div className="stat-title">Estimated Budget</div>
            <div className="stat-value text-accent">${(trip as any).budget ? ((trip as any).budget / 1000).toFixed(0) : '0'}K</div>
            <div className="stat-desc">Per person approximate</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-info">
              <span className="i-mdi-tag-multiple w-8 h-8"></span>
            </div>
            <div className="stat-title">Categories</div>
            <div className="stat-value text-info">{stats.categories.length}</div>
            <div className="stat-desc">Activity types</div>
          </div>
        </div>
      </div>
    </div>
  )
} 