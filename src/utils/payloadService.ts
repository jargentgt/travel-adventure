import { Trip, Activity } from '@/types/trip'

class PayloadService {
  private baseUrl: string
  private trips: Trip[] = []
  private loading = false
  private lastLoadAttempt = 0
  private readonly MAX_RETRIES = 3
  private readonly RETRY_DELAY = 1000 // 1 second
  private readonly REQUEST_TIMEOUT = 10000 // 10 seconds
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  constructor() {
    // Use environment variable or default to localhost CMS
    this.baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'
  }

  async loadTrips(): Promise<Trip[]> {
    // Check cache validity
    const now = Date.now()
    if (this.trips.length > 0 && (now - this.lastLoadAttempt) < this.CACHE_DURATION) {
      console.log('📋 Using cached trips data')
      return this.trips
    }

    // Prevent multiple concurrent loads with timeout protection
    if (this.loading) {
      console.log('⏳ Waiting for existing load to complete...')
      const startWait = Date.now()
      const maxWait = 30000 // 30 seconds max wait
      
      while (this.loading && (Date.now() - startWait) < maxWait) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      // If still loading after timeout, reset and try again
      if (this.loading) {
        console.warn('⚠️ Load timeout detected, resetting loading state')
        this.loading = false
      }
      
      return this.trips
    }

    return this.loadTripsWithRetry()
  }

  private async loadTripsWithRetry(attempt = 1): Promise<Trip[]> {
    this.loading = true
    this.lastLoadAttempt = Date.now()

    try {
      console.log(`🚀 Loading trips from Payload CMS (attempt ${attempt}/${this.MAX_RETRIES})...`)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT)

      // Use proper URL encoding for query parameters and populate activities
      const params = new URLSearchParams({
        'where[status][equals]': 'published',
        'limit': '100',
        'depth': '2' // Populate nested relationships including activities
      })

      const response = await fetch(
        `${this.baseUrl}/api/trips?${params.toString()}`,
        { 
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store' // Disable caching for large responses
        }
      )
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📊 Received trips:', data.docs?.length || 0)

      if (!data.docs || !Array.isArray(data.docs)) {
        throw new Error('Invalid response format: missing docs array')
      }

      if (data.docs.length === 0) {
        console.warn('⚠️ No trips found in CMS')
        this.trips = []
        return this.trips
      }

      this.trips = data.docs.map((trip: any) => this.transformPayloadTrip(trip))
      console.log('✅ Successfully loaded trips:', this.trips.length)
      
      return this.trips
    } catch (error) {
      console.error(`❌ Error loading trips (attempt ${attempt}):`, error)
      
      // If max retries reached, return empty array
      if (attempt >= this.MAX_RETRIES) {
        console.error('🚫 Max retries reached, returning empty trips array')
        this.trips = []
        return this.trips
      }
      
      // Wait before retry with exponential backoff
      const delay = this.RETRY_DELAY * Math.pow(2, attempt - 1)
      console.log(`⏰ Retrying in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
      
      return this.loadTripsWithRetry(attempt + 1)
    } finally {
      this.loading = false
    }
  }

  async getTripBySlug(slug: string): Promise<Trip | null> {
    return this.getTripBySlugWithRetry(slug, 1)
  }

  private async getTripBySlugWithRetry(slug: string, attempt = 1): Promise<Trip | null> {
    try {
      console.log(`🔍 Searching for trip by slug: ${slug} (attempt ${attempt}/${this.MAX_RETRIES})`)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT)

      // Use proper URL encoding for query parameters and populate activities
      const params = new URLSearchParams({
        'where[slug][equals]': slug,
        'where[status][equals]': 'published',
        'limit': '1',
        'depth': '2' // Populate nested relationships including activities
      })

      const response = await fetch(
        `${this.baseUrl}/api/trips?${params.toString()}`,
        { 
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store' // Disable caching for large responses
        }
      )
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.docs || !Array.isArray(data.docs)) {
        throw new Error('Invalid response format: missing docs array')
      }
      
      if (data.docs.length === 0) {
        console.warn('⚠️ Trip not found:', slug)
        return null
      }

      const trip = this.transformPayloadTrip(data.docs[0])
      console.log('✅ Found trip:', trip.title)
      
      return trip
    } catch (error) {
      console.error(`❌ Error loading trip by slug (attempt ${attempt}):`, error)
      
      // If max retries reached, return null
      if (attempt >= this.MAX_RETRIES) {
        console.error('🚫 Max retries reached for getTripBySlug')
        return null
      }
      
      // Wait before retry with exponential backoff
      const delay = this.RETRY_DELAY * Math.pow(2, attempt - 1)
      console.log(`⏰ Retrying in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
      
      return this.getTripBySlugWithRetry(slug, attempt + 1)
    }
  }

  private transformPayloadTrip(payloadTrip: any): Trip {
    return {
      id: payloadTrip.id,
      title: payloadTrip.title,
      slug: payloadTrip.slug,
      startDate: payloadTrip.startDate,
      endDate: payloadTrip.endDate,
      location: payloadTrip.location,
      country: payloadTrip.country,
      coverImage: payloadTrip.coverImage ? {
        url: this.getFullImageUrl(payloadTrip.coverImage.url),
        alt: payloadTrip.coverImage.alt,
        width: payloadTrip.coverImage.width,
        height: payloadTrip.coverImage.height
      } : undefined,
      categories: payloadTrip.categories || [],
      tags: payloadTrip.tags || [],
      days: payloadTrip.days?.map((day: any) => ({
        date: day.date,
        activities: day.activities?.map((activity: any) => {
          // If activity is populated (object), transform it
          if (typeof activity === 'object' && activity.id) {
            return {
              id: activity.id,
              time: activity.time,
              title: activity.title,
              location: activity.location || '',
              description: activity.description || '',
              category: activity.category,
              type: activity.type || 'normal',
              icon: activity.icon || '',
              date: activity.date,
              trip: typeof activity.trip === 'object' ? activity.trip.id : activity.trip,
              order: activity.order || 0,
              createdAt: activity.createdAt,
              updatedAt: activity.updatedAt
            }
          }
          // If activity is just an ID (string), return it as is
          return activity
        }) || []
      })) || [],
      status: payloadTrip.status || 'published',
      updatedAt: payloadTrip.updatedAt,
      createdAt: payloadTrip.createdAt
    }
  }

  private getFullImageUrl(url: string): string {
    // If URL is already absolute, return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    
    // Convert Payload's API media URLs to direct static file URLs
    if (url.startsWith('/api/media/file/')) {
      // Convert /api/media/file/filename.ext to /media/filename.ext
      const filename = url.replace('/api/media/file/', '')
      return `${this.baseUrl}/media/${filename}`
    }
    
    // If URL already starts with /media/, just prepend base URL
    if (url.startsWith('/media/')) {
      return `${this.baseUrl}${url}`
    }
    
    // For any other relative paths starting with /, prepend CMS base URL
    if (url.startsWith('/')) {
      return `${this.baseUrl}${url}`
    }
    
    // For relative paths without leading slash, prepend CMS base URL with slash
    return `${this.baseUrl}/${url}`
  }

  // Clear cache when needed
  clearCache() {
    this.trips = []
    this.lastLoadAttempt = 0
    this.loading = false
    console.log('🧹 Cache cleared')
  }

  // Force refresh data
  async forceRefresh(): Promise<Trip[]> {
    this.clearCache()
    return this.loadTrips()
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const response = await fetch(`${this.baseUrl}/api/health`, {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      return response.ok
    } catch (error) {
      console.warn('🏥 CMS health check failed:', error)
      return false
    }
  }

  // Get trips by filters (for homepage filtering)
  async getFilteredTrips(filters: {
    search?: string
    year?: string
    country?: string
  }): Promise<Trip[]> {
    const allTrips = await this.loadTrips()
    
    return allTrips.filter(trip => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const searchableText = [
          trip.title,
          trip.location,
          ...trip.tags,
          ...trip.categories,
          ...trip.days.flatMap(day => 
            day.activities
              .filter((activity): activity is Activity => typeof activity === 'object')
              .map(activity => 
                `${activity.title} ${activity.location || ''} ${activity.description || ''}`
              )
          )
        ].join(' ').toLowerCase()
        
        if (!searchableText.includes(searchTerm)) {
          return false
        }
      }

      // Year filter
      if (filters.year && filters.year !== 'all') {
        const tripYear = new Date(trip.startDate).getFullYear().toString()
        if (tripYear !== filters.year) {
          return false
        }
      }

      // Country filter
      if (filters.country && filters.country !== 'all') {
        if (trip.country !== filters.country) {
          return false
        }
      }

      return true
    })
  }

  // Helper methods for filtering
  async getAllYears(): Promise<string[]> {
    const trips = await this.loadTrips()
    const years = trips.map(trip => new Date(trip.startDate).getFullYear().toString())
    return Array.from(new Set(years)).sort()
  }

  async getAllCountries(): Promise<string[]> {
    const trips = await this.loadTrips()
    const countries = trips.map(trip => trip.country)
    return Array.from(new Set(countries)).sort()
  }

  private getCountryFromLocation(location: string): string {
    // Extract country from location string (assumes format: "City, Country" or "Region, Country")
    const parts = location.split(',').map(part => part.trim())
    return parts[parts.length - 1] || location
  }
}

// Export singleton instance
export const payloadService = new PayloadService() 