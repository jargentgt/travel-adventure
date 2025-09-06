// Geocoding Cache Utility
// Stores geocoding results in localStorage to avoid repeat API calls

interface CachedLocation {
  lat: number
  lng: number
  timestamp: number
  source: 'google' | 'extracted' | 'manual'
}

interface GeocodingCache {
  [locationKey: string]: CachedLocation
}

const CACHE_KEY = 'travel_geocoding_cache'
const CACHE_EXPIRY = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
const MAX_CACHE_ENTRIES = 1000 // Prevent localStorage from growing too large

class GeocodingCacheManager {
  private cache: GeocodingCache = {}
  private isLoaded = false

  constructor() {
    this.loadCache()
  }

  // Create a consistent key for locations
  private createLocationKey(location: string): string {
    return location.toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
  }

  // Load cache from localStorage
  private loadCache(): void {
    if (typeof window === 'undefined') return

    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        this.cache = JSON.parse(cached)
        this.cleanExpiredEntries()
        console.log(`📍 Loaded ${Object.keys(this.cache).length} cached locations`)
      }
      this.isLoaded = true
    } catch (error) {
      console.warn('Failed to load geocoding cache:', error)
      this.cache = {}
      this.isLoaded = true
    }
  }

  // Save cache to localStorage
  private saveCache(): void {
    if (typeof window === 'undefined' || !this.isLoaded) return

    try {
      // Limit cache size
      const entries = Object.entries(this.cache)
      if (entries.length > MAX_CACHE_ENTRIES) {
        // Keep only the most recent entries
        const sortedEntries = entries
          .sort(([, a], [, b]) => b.timestamp - a.timestamp)
          .slice(0, MAX_CACHE_ENTRIES)
        
        this.cache = Object.fromEntries(sortedEntries)
        console.log(`🧹 Trimmed cache to ${MAX_CACHE_ENTRIES} entries`)
      }

      localStorage.setItem(CACHE_KEY, JSON.stringify(this.cache))
    } catch (error) {
      console.warn('Failed to save geocoding cache:', error)
    }
  }

  // Remove expired entries
  private cleanExpiredEntries(): void {
    const now = Date.now()
    let cleanedCount = 0

    for (const [key, entry] of Object.entries(this.cache)) {
      if (now - entry.timestamp > CACHE_EXPIRY) {
        delete this.cache[key]
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned ${cleanedCount} expired cache entries`)
      this.saveCache()
    }
  }

  // Get cached location
  getCachedLocation(location: string): CachedLocation | null {
    if (!location || !this.isLoaded) return null

    const key = this.createLocationKey(location)
    const cached = this.cache[key]

    if (!cached) return null

    // Check if expired
    if (Date.now() - cached.timestamp > CACHE_EXPIRY) {
      delete this.cache[key]
      this.saveCache()
      return null
    }

    console.log(`💾 Cache hit for: ${location}`)
    return cached
  }

  // Store location in cache
  setCachedLocation(
    location: string, 
    coordinates: { lat: number; lng: number }, 
    source: CachedLocation['source'] = 'google'
  ): void {
    if (!location || !this.isLoaded) return

    const key = this.createLocationKey(location)
    
    this.cache[key] = {
      lat: coordinates.lat,
      lng: coordinates.lng,
      timestamp: Date.now(),
      source
    }

    this.saveCache()
    console.log(`💾 Cached location: ${location} (${source})`)
  }

  // Get cache statistics
  getCacheStats(): {
    totalEntries: number
    googleEntries: number
    extractedEntries: number
    manualEntries: number
    oldestEntry: string | null
    newestEntry: string | null
  } {
    const entries = Object.entries(this.cache)
    const stats = {
      totalEntries: entries.length,
      googleEntries: 0,
      extractedEntries: 0,
      manualEntries: 0,
      oldestEntry: null as string | null,
      newestEntry: null as string | null
    }

    let oldestTime = Infinity
    let newestTime = 0

    for (const [location, data] of entries) {
      // Count by source
      switch (data.source) {
        case 'google':
          stats.googleEntries++
          break
        case 'extracted':
          stats.extractedEntries++
          break
        case 'manual':
          stats.manualEntries++
          break
      }

      // Track oldest and newest
      if (data.timestamp < oldestTime) {
        oldestTime = data.timestamp
        stats.oldestEntry = location
      }
      if (data.timestamp > newestTime) {
        newestTime = data.timestamp
        stats.newestEntry = location
      }
    }

    return stats
  }

  // Clear all cache (for debugging/reset)
  clearCache(): void {
    this.cache = {}
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CACHE_KEY)
    }
    console.log('🗑️ Geocoding cache cleared')
  }

  // Export cache for backup/analysis
  exportCache(): GeocodingCache {
    return { ...this.cache }
  }

  // Import cache from backup
  importCache(cacheData: GeocodingCache): void {
    this.cache = { ...cacheData }
    this.saveCache()
    console.log(`📥 Imported ${Object.keys(cacheData).length} cache entries`)
  }
}

// Global cache instance
export const geocodingCache = new GeocodingCacheManager()

// Helper function to extract coordinates from various text formats
export const extractCoordinatesFromText = (text: string): { lat: number; lng: number } | null => {
  if (!text) return null

  // Patterns for coordinate extraction
  const patterns = [
    // Google Maps URLs
    /@(-?\d+\.\d+),(-?\d+\.\d+)/,          // @lat,lng
    /ll=(-?\d+\.\d+),(-?\d+\.\d+)/,        // ll=lat,lng
    /q=(-?\d+\.\d+),(-?\d+\.\d+)/,         // q=lat,lng
    
    // Direct coordinate formats
    /(-?\d+\.\d+),\s*(-?\d+\.\d+)/,        // lat, lng
    /lat[:\s]+(-?\d+\.\d+).*lng[:\s]+(-?\d+\.\d+)/i, // lat: X lng: Y
    /latitude[:\s]+(-?\d+\.\d+).*longitude[:\s]+(-?\d+\.\d+)/i, // latitude: X longitude: Y
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const lat = parseFloat(match[1])
      const lng = parseFloat(match[2])
      
      // Validate coordinates (rough bounds check)
      if (!isNaN(lat) && !isNaN(lng) && 
          lat >= -90 && lat <= 90 && 
          lng >= -180 && lng <= 180) {
        return { lat, lng }
      }
    }
  }

  return null
}

// API usage monitoring
export class ApiUsageMonitor {
  private static readonly USAGE_KEY = 'travel_api_usage'
  private static readonly DAILY_LIMIT = 1000 // Conservative daily limit
  private static readonly MONTHLY_LIMIT = 25000 // Within free tier

  static recordApiCall(type: 'geocoding' | 'maps'): void {
    if (typeof window === 'undefined') return

    try {
      const usage = this.getUsage()
      const today = new Date().toISOString().split('T')[0]
      const month = today.substring(0, 7) // YYYY-MM

      // Initialize if needed
      if (!usage.daily[today]) usage.daily[today] = { geocoding: 0, maps: 0 }
      if (!usage.monthly[month]) usage.monthly[month] = { geocoding: 0, maps: 0 }

      // Increment counters
      usage.daily[today][type]++
      usage.monthly[month][type]++
      usage.total[type]++

      // Clean old data (keep last 7 days, 12 months)
      this.cleanOldUsageData(usage)

      localStorage.setItem(this.USAGE_KEY, JSON.stringify(usage))
      
      // Log warnings if approaching limits
      this.checkUsageLimits(usage, today, month)
    } catch (error) {
      console.warn('Failed to record API usage:', error)
    }
  }

  private static getUsage(): any {
    try {
      const stored = localStorage.getItem(this.USAGE_KEY)
      return stored ? JSON.parse(stored) : {
        daily: {},
        monthly: {},
        total: { geocoding: 0, maps: 0 }
      }
    } catch {
      return {
        daily: {},
        monthly: {},
        total: { geocoding: 0, maps: 0 }
      }
    }
  }

  private static cleanOldUsageData(usage: any): void {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 7)
    const cutoffString = cutoffDate.toISOString().split('T')[0]

    // Clean daily data
    for (const date in usage.daily) {
      if (date < cutoffString) {
        delete usage.daily[date]
      }
    }

    // Clean monthly data (keep last 12 months)
    const cutoffMonth = new Date()
    cutoffMonth.setMonth(cutoffMonth.getMonth() - 12)
    const cutoffMonthString = cutoffMonth.toISOString().substring(0, 7)

    for (const month in usage.monthly) {
      if (month < cutoffMonthString) {
        delete usage.monthly[month]
      }
    }
  }

  private static checkUsageLimits(usage: any, today: string, month: string): void {
    const dailyTotal = (usage.daily[today]?.geocoding || 0) + (usage.daily[today]?.maps || 0)
    const monthlyTotal = (usage.monthly[month]?.geocoding || 0) + (usage.monthly[month]?.maps || 0)

    if (dailyTotal > this.DAILY_LIMIT * 0.8) {
      console.warn(`⚠️ Approaching daily API limit: ${dailyTotal}/${this.DAILY_LIMIT}`)
    }

    if (monthlyTotal > this.MONTHLY_LIMIT * 0.8) {
      console.warn(`⚠️ Approaching monthly API limit: ${monthlyTotal}/${this.MONTHLY_LIMIT}`)
    }
  }

  static getUsageStats(): any {
    return this.getUsage()
  }

  static clearUsageData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.USAGE_KEY)
    }
  }
} 