import React from 'react'
import TripDetailClient from './TripDetailClient'

// Allow dynamic parameters beyond those generated at build time
export const dynamicParams = true

// Generate static params for known trips at build time
export async function generateStaticParams() {
  // Only generate static params for production builds (Firebase export)
  if (process.env.NODE_ENV !== 'production') {
    return []
  }

  try {
    // For production builds, always use the Railway production URL and get ALL trips
    const apiUrl = 'https://travel-cms-production.up.railway.app'
    const response = await fetch(`${apiUrl}/api/frontend/trips?limit=100`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      cache: 'no-store'
    })
    const data = await response.json()
    
    if (data.success && data.data.trips) {
      return data.data.trips.map((trip: any) => ({
        slug: trip.slug
      }))
    }
  } catch (error) {
    console.error('Failed to fetch trips for static generation:', error)
  }

  // Fallback to sample trip if API call fails
  return [
    { slug: 'sample-trip' }
  ]
}

interface TripDetailPageProps {
  params: {
    slug: string
  }
}

export default function TripDetailPage({ params }: TripDetailPageProps) {
  return <TripDetailClient slug={params.slug} />
} 