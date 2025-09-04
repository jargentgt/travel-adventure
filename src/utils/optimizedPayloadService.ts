import { Trip, TripListing } from '@/types/trip'

class OptimizedPayloadService {
  private baseUrl: string
  private MAX_RETRIES = 3
  private REQUEST_TIMEOUT = 10000

  constructor() {
    // Use Railway production URL for production builds, localhost for development
    const productionUrl = 'https://travel-cms-production.up.railway.app'
    const devUrl = process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL || 'http://localhost:3000'
    
    this.baseUrl = process.env.NODE_ENV === 'production' ? productionUrl : devUrl
  }

  /**
   * Transform image URLs to absolute URLs
   */
  private transformImageUrls(image: any): any {
    if (!image) return image

    const transformUrl = (url: string | null | undefined): string | undefined => {
      if (!url) return undefined
      
      // Convert Payload's media URLs to our working serve-media API endpoint
      let transformedUrl = url
      if (url.startsWith('/api/media/file/')) {
        // Extract filename and use direct API endpoint (no rewrite issues)
        const filename = url.replace('/api/media/file/', '')
        // Don't re-encode since filename is already URL-encoded from the API
        transformedUrl = `/api/serve-media?file=${filename}`
      }
      
      // Convert relative URLs to absolute URLs
      if (transformedUrl.startsWith('/')) {
        return `${this.baseUrl}${transformedUrl}`
      }
      
      return transformedUrl
    }

    const transformedImage = {
      ...image,
      url: transformUrl(image.url),
      thumbnailURL: transformUrl(image.thumbnailURL),
      // Add fallback for missing images
      fallbackUrl: '/images/placeholder-trip.jpg'
    }

    // Transform sizes URLs if they exist
    if (image.sizes) {
      transformedImage.sizes = { ...image.sizes }
      Object.keys(image.sizes).forEach(sizeKey => {
        if (image.sizes[sizeKey]?.url) {
          transformedImage.sizes[sizeKey] = {
            ...image.sizes[sizeKey],
            url: transformUrl(image.sizes[sizeKey].url)
          }
        }
      })
    }

    return transformedImage
  }

  /**
   * Transform trip data from our custom API response format
   */
  private transformTripListing(trip: any): TripListing {
    return {
        id: trip.id,
        title: trip.title,
        slug: trip.slug,
        location: trip.location,
        country: trip.country,
        startDate: trip.startDate,
        endDate: trip.endDate,
        categories: trip.categories || [],
        tags: trip.tags || [],
      status: 'published', // Our API only returns published trips
        coverImage: trip.coverImage ? this.transformImageUrls(trip.coverImage) : undefined,
      dayCount: trip.daysCount || 0,
      activityCount: trip.totalActivities || 0
    }
  }

  /**
   * Transform detailed trip data from our custom API response format
   */
  private transformTripDetail(tripData: any): Trip {
    return {
      id: tripData.id,
      title: tripData.title,
      slug: tripData.slug,
      location: tripData.location,
      country: tripData.country,
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      categories: tripData.categories || [],
      tags: tripData.tags || [],
      status: 'published', // Our API only returns published trips
      coverImage: tripData.coverImage ? this.transformImageUrls(tripData.coverImage) : undefined,
      days: tripData.days?.map((day: any) => ({
        date: day.date,
        activities: day.activities?.map((activity: any) => ({
          id: activity.id,
          title: activity.title,
          time: activity.time,
          location: activity.location || '',
          description: activity.description || '',
          category: activity.category,
          type: activity.type || 'normal',
          icon: activity.icon || '📍',
          order: activity.order || 0,
          date: day.date, // Add the date from the day
          trip: tripData.id, // Add the trip ID
          createdAt: new Date().toISOString(), // Fallback
          updatedAt: new Date().toISOString(), // Fallback
        })) || []
      })) || [],
      totalActivities: tripData.totalActivities || 0,
      dayCount: tripData.totalDays || tripData.days?.length || 0
    }
  }

  /**
   * Get trips using our custom API endpoint
   */
  async getTrips(): Promise<TripListing[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/frontend/trips`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // Check if the response has the expected format
      if (!result.success || !result.data?.trips) {
        console.error('Invalid response format:', result)
        throw new Error('Invalid response format from trips API')
      }

      // Transform each trip using our mapping function
      return result.data.trips.map((trip: any) => this.transformTripListing(trip))
    } catch (error) {
      console.error('Error fetching trips:', error)
      throw error
    }
  }

  /**
   * Get a specific trip by slug
   */
  async getTripBySlug(slug: string): Promise<Trip | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/frontend/trips/${encodeURIComponent(slug)}`,
        { 
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // Check if the response has the expected format  
      if (!result.success || !result.data) {
        console.error('Invalid response format:', result)
        throw new Error('Invalid response format from trip detail API')
      }

      // Transform the trip data using our mapping function
      return this.transformTripDetail(result.data)
    } catch (error) {
      console.error('Error fetching trip detail:', error)
      throw error
    }
  }

  /**
   * Test connection to the Payload CMS
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/frontend/trips?limit=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      return response.ok
    } catch (error) {
      console.error('Connection test failed:', error)
      return false
    }
  }
}

// Export singleton instance
export const optimizedPayloadService = new OptimizedPayloadService() 
export default optimizedPayloadService 