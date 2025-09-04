import { create } from 'zustand'
import { Trip } from '@/types/trip'
import { optimizedPayloadService } from '@/utils/optimizedPayloadService'

interface TripCache {
  trip: Trip
  lastFetchTime: number
}

interface TripDetailState {
  // Data
  trips: Record<string, TripCache> // slug -> { trip, lastFetchTime }
  currentTrip: Trip | null
  
  // Loading states
  isLoading: boolean
  error: string | null
  currentSlug: string | null
  
  // Cache management
  cacheExpiry: number // 10 minutes for trip details
  
  // Actions
  fetchTripDetail: (slug: string) => Promise<Trip | null>
  clearCache: (slug?: string) => void
  setError: (error: string | null) => void
  setCurrentTrip: (trip: Trip | null) => void
}

export const useTripDetailStore = create<TripDetailState>((set, get) => ({
  // Initial state
  trips: {},
  currentTrip: null,
  isLoading: false,
  error: null,
  currentSlug: null,
  cacheExpiry: 10 * 60 * 1000, // 10 minutes

  // Fetch trip detail with caching
  fetchTripDetail: async (slug: string) => {
    const state = get()
    
    // Check if cache is still valid for this specific trip
    const cachedTrip = state.trips[slug]
    if (
      cachedTrip && 
      Date.now() - cachedTrip.lastFetchTime < state.cacheExpiry
    ) {
      console.log(`🚀 Using cached trip detail for: ${slug}`)
      set({ 
        currentTrip: cachedTrip.trip, 
        currentSlug: slug,
        error: null 
      })
      return cachedTrip.trip
    }

    // Prevent multiple simultaneous calls for the same slug
    if (state.isLoading && state.currentSlug === slug) {
      console.log(`🚀 API call already in progress for: ${slug}, skipping...`)
      return state.currentTrip
    }

    set({ isLoading: true, error: null, currentSlug: slug })

    try {
      console.log(`🚀 Fetching fresh trip detail for: ${slug}...`)
      const trip = await optimizedPayloadService.getTripBySlug(slug)
      
      if (trip) {
        // Update cache for this specific trip
        set((state) => ({ 
          trips: {
            ...state.trips,
            [slug]: {
              trip,
              lastFetchTime: Date.now()
            }
          },
          currentTrip: trip,
          isLoading: false, 
          error: null,
          currentSlug: slug
        }))
        
        console.log(`✅ Trip detail updated in store for: ${slug}`)
        return trip
      } else {
        set({ 
          currentTrip: null,
          isLoading: false, 
          error: 'Trip not found',
          currentSlug: slug
        })
        return null
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to load trip: ${slug}`
      console.error(`❌ Error fetching trip detail for ${slug}:`, error)
      
      set({ 
        isLoading: false, 
        error: errorMessage,
        currentSlug: slug,
        currentTrip: null
      })
      return null
    }
  },

  // Clear cache (for specific trip or all trips)
  clearCache: (slug?: string) => {
    if (slug) {
      set((state) => {
        const newTrips = { ...state.trips }
        delete newTrips[slug]
        return { trips: newTrips }
      })
    } else {
      set({ trips: {} })
    }
  },

  // Set error state
  setError: (error: string | null) => {
    set({ error })
  },

  // Set current trip
  setCurrentTrip: (trip: Trip | null) => {
    set({ currentTrip: trip })
  }
}))

// Individual selectors for better performance
export const useCurrentTrip = () => useTripDetailStore((state) => state.currentTrip)
export const useTripDetailLoading = () => useTripDetailStore((state) => state.isLoading)
export const useTripDetailError = () => useTripDetailStore((state) => state.error)
export const useCurrentSlug = () => useTripDetailStore((state) => state.currentSlug)
export const useFetchTripDetail = () => useTripDetailStore((state) => state.fetchTripDetail)
export const useClearTripDetailCache = () => useTripDetailStore((state) => state.clearCache)

// Combined selectors for convenience (use individual selectors when possible)
export const useTripDetailData = () => ({
  currentTrip: useCurrentTrip(),
  isLoading: useTripDetailLoading(),
  error: useTripDetailError(),
  currentSlug: useCurrentSlug()
})

export const useTripDetailActions = () => ({
  fetchTripDetail: useFetchTripDetail(),
  clearCache: useClearTripDetailCache(),
})

// Get cached trip by slug (without triggering fetch)
export const useCachedTrip = (slug: string) => useTripDetailStore((state) => 
  state.trips[slug]?.trip || null
) 