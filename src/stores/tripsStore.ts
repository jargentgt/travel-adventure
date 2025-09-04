import { create } from 'zustand'
import { TripListing } from '@/types/trip'
import { optimizedPayloadService } from '@/utils/optimizedPayloadService'

interface TripsState {
  // Data
  trips: TripListing[]
  
  // Pagination
  pagination: {
    totalDocs: number
    totalPages: number
    currentPage: number
    limit: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  
  // Loading states
  isLoading: boolean
  error: string | null
  
  // Cache management
  lastFetchTime: number | null
  cacheExpiry: number // 5 minutes in milliseconds
  
  // Actions
  fetchTrips: (page?: number, limit?: number) => Promise<void>
  clearCache: () => void
  setError: (error: string | null) => void
}

export const useTripsStore = create<TripsState>((set, get) => ({
  // Initial state
  trips: [],
  pagination: {
    totalDocs: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 12,
    hasNextPage: false,
    hasPrevPage: false
  },
  isLoading: false,
  error: null,
  lastFetchTime: null,
  cacheExpiry: 5 * 60 * 1000, // 5 minutes

  // Fetch trips with caching and pagination
  fetchTrips: async (page: number = 1, limit: number = 12) => {
    const state = get()
    
    // Check if cache is still valid for the same page
    if (
      state.lastFetchTime && 
      state.trips.length > 0 && 
      state.pagination.currentPage === page &&
      Date.now() - state.lastFetchTime < state.cacheExpiry
    ) {
      console.log('🚀 Using cached trips data')
      return // Use cached data
    }

    // Prevent multiple simultaneous calls
    if (state.isLoading) {
      console.log('🚀 API call already in progress, skipping...')
      return
    }

    set({ isLoading: true, error: null })

    try {
      console.log(`🚀 Fetching trips data for page ${page}...`)
      const response = await optimizedPayloadService.getTrips(page, limit)
      
      set({ 
        trips: response.trips, 
        pagination: {
          totalDocs: response.pagination.totalDocs,
          totalPages: response.pagination.totalPages,
          currentPage: response.pagination.page,
          limit: response.pagination.limit,
          hasNextPage: response.pagination.hasNextPage,
          hasPrevPage: response.pagination.hasPrevPage
        },
        isLoading: false, 
        error: null,
        lastFetchTime: Date.now()
      })
      
      console.log('✅ Trips data updated in store:', response.trips.length)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load trips'
      console.error('❌ Error fetching trips:', error)
      
      set({ 
        isLoading: false, 
        error: errorMessage,
        lastFetchTime: null 
      })
    }
  },

  // Clear cache (useful for refreshing data)
  clearCache: () => {
    set({ lastFetchTime: null })
  },

  // Set error state
  setError: (error: string | null) => {
    set({ error })
  }
}))

// Individual selectors for better performance - prevents unnecessary re-renders
export const useTrips = () => useTripsStore((state) => state.trips)
export const useTripsPagination = () => useTripsStore((state) => state.pagination)
export const useTripsLoading = () => useTripsStore((state) => state.isLoading)
export const useTripsError = () => useTripsStore((state) => state.error)
export const useFetchTrips = () => useTripsStore((state) => state.fetchTrips)
export const useClearTripsCache = () => useTripsStore((state) => state.clearCache)

// Combined selectors for convenience (but use sparingly to avoid re-renders)
export const useTripsData = () => ({
  trips: useTrips(),
  isLoading: useTripsLoading(),
  error: useTripsError()
})

export const useTripsActions = () => ({
  fetchTrips: useFetchTrips(),
  clearCache: useClearTripsCache(),
}) 