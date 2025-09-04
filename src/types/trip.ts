// Base trip interface for common fields
export interface TripBase {
  id: string
  title: string
  slug: string
  startDate: string
  endDate: string
  location: string
  country: string
  coverImage?: {
    url: string
    alt?: string
    width?: number
    height?: number
  }
  categories: string[]
  tags: string[]
  status: 'draft' | 'published'
}

// Listing trip (lightweight for homepage)
export interface TripListing extends TripBase {
  activityCount: number
  dayCount: number
}

// Full trip with activities (for detail page)
export interface Trip extends TripBase {
  days: Day[]
  updatedAt?: string // From Payload metadata
  createdAt?: string // From Payload metadata
  totalActivities?: number // Computed field
  dayCount?: number // Computed field
}

export interface Day {
  date: string
  activities: Activity[] | string[] // Can be populated or just IDs
}

export interface Activity {
  id: string
  time: string
  title: string
  location?: string
  description?: string
  category: 'airport' | 'hotel' | 'driving' | 'transport' | 'cafe' | 'restaurant' | 'activity' | 'shopping'
  type: 'normal' | 'rain_plan'
  icon?: string
  date: string
  trip: string | Trip
  order?: number
  createdAt: string
  updatedAt: string
}

export interface TripMetadata {
  totalDays: number
  totalActivities: number
  categories: string[]
  locations: string[]
}

export interface FilterOptions {
  category?: string
  year?: string
  location?: string
  search?: string
  country?: string
} 