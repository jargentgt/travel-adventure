'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trip } from '@/types/trip'
import { LoadingScreen } from '@/components/ui/LoadingSpinner'
import { useCurrentTrip, useTripDetailLoading, useTripDetailError, useFetchTripDetail } from '@/stores/tripDetailStore'
import { useTrips, useFetchTrips, useTripsStore } from '@/stores/tripsStore'
import {
  Breadcrumbs,
  TripHero,
  TripActionBar,
  TripStats,
  TripTabs,
  DayNavigation,
  TripTimeline,
  TripGallery,
  TripInfo,
  TripNavigation,
  TripDetailMap
} from '@/components/trip'
import { ApiUsageMonitorComponent } from '@/components/dev/ApiUsageMonitor'

interface TripDetailClientProps {
  slug: string
}

export default function TripDetailClient({ slug }: TripDetailClientProps) {
  // Use individual Zustand selectors to prevent re-renders
  const trip = useCurrentTrip()
  const isLoading = useTripDetailLoading()
  const error = useTripDetailError()
  const fetchTripDetail = useFetchTripDetail()
  const tripListings = useTrips()
  const fetchTrips = useFetchTrips()
  
  // Local UI state
  const [activeTab, setActiveTab] = useState('timeline')
  const [selectedDay, setSelectedDay] = useState(0)
  const [previousTrip, setPreviousTrip] = useState<Trip | null>(null)
  const [nextTrip, setNextTrip] = useState<Trip | null>(null)
  const [focusedActivityId, setFocusedActivityId] = useState<string | null>(null)

  useEffect(() => {
    if (slug) {
      loadTrip(slug)
    }
  }, [slug])

  const loadTrip = async (slug: string) => {
    const tripData = await fetchTripDetail(slug)
    
    // Load adjacent trips if trip data exists
    if (tripData) {
      await loadAdjacentTrips(tripData)
    }
  }

  const loadAdjacentTrips = async (currentTrip: Trip) => {
    try {
      // Ensure we have trips data in store
      if (tripListings.length === 0) {
        await fetchTrips()
      }
      
      // Get trips from store
      const { trips: freshTripListings } = useTripsStore.getState()
      
      // Convert TripListing to Trip for navigation (only basic fields needed)
      const allTrips: Trip[] = freshTripListings.map((trip) => ({
        ...trip,
        days: [], // Adjacent trips don't need day details
      } as Trip))

      // Sort trips by start date
      const sortedTrips = allTrips.sort((a, b) => 
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      )

      // Find current trip index
      const currentIndex = sortedTrips.findIndex(trip => trip.id === currentTrip.id)
      
      if (currentIndex !== -1) {
        // Set previous trip (earlier date)
        setPreviousTrip(currentIndex > 0 ? sortedTrips[currentIndex - 1] : null)
        
        // Set next trip (later date)
        setNextTrip(currentIndex < sortedTrips.length - 1 ? sortedTrips[currentIndex + 1] : null)
      }
    } catch (error) {
      console.error('Error loading adjacent trips:', error)
    }
  }

  // Loading state
  if (isLoading) {
    return <LoadingScreen message="Loading trip details..." size="xl" type="ring" />
  }

  // Trip not found state
  if (!trip) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h2 className="text-2xl font-bold mb-2">Trip Not Found</h2>
          <p className="text-base-content/60 mb-4">The trip you're looking for doesn't exist.</p>
          <Link href="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  // Handle map pin click - switch to map tab and focus on activity
  const handleMapPinClick = (activityId: string) => {
    setActiveTab('map')
    setFocusedActivityId(activityId)
    
    // Smooth scroll to the map
    setTimeout(() => {
      const element = document.getElementById('trip-map')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100) // Small delay to ensure tab switch completes
  }

  // Main trip detail page
  return (
    <div className="min-h-screen bg-base-100">
      {/* Breadcrumbs */}
      <Breadcrumbs trip={trip} />

      {/* Trip Hero Section */}
      <TripHero trip={trip} />

      {/* Action Bar */}
      <TripActionBar />

      {/* Trip Statistics */}
      <TripStats trip={trip} />

      {/* Main Content */}
      <div className="section-container-lg">
        {/* Content Tabs */}
        <TripTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        {activeTab === 'timeline' && (
          <div>
            {/* Day Navigation */}
            <DayNavigation
              trip={trip}
              selectedDay={selectedDay}
              onDayChange={setSelectedDay}
            />

            {/* Timeline */}
            <TripTimeline 
              trip={trip} 
              selectedDay={selectedDay} 
              onDayChange={setSelectedDay} 
              onMapPinClick={handleMapPinClick}
            />
          </div>
        )}

        {activeTab === 'map' && (
          <div id="trip-map">
            {/* Day Navigation for Map */}
            <DayNavigation
              trip={trip}
              selectedDay={selectedDay}
              onDayChange={setSelectedDay}
            />

            <TripDetailMap 
              trip={trip} 
              selectedDay={selectedDay} 
              focusedActivityId={focusedActivityId}
              onActivityFocus={setFocusedActivityId}
              isVisible={activeTab === 'map'}
            />
          </div>
        )}

        {activeTab === 'gallery' && <TripGallery />}

        {activeTab === 'info' && <TripInfo trip={trip} />}
      </div>

      {/* Trip Navigation */}
      <TripNavigation previousTrip={previousTrip} nextTrip={nextTrip} />
      
      {/* API Usage Monitor (dev only) */}
      <ApiUsageMonitorComponent />
    </div>
  )
} 