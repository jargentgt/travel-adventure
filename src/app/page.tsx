'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FilterOptions } from '@/types/trip'
import { LoadingScreen, LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { WorldTravelMap } from '@/components/WorldTravelMap'
import { useTrips, useTripsLoading, useTripsError, useFetchTrips, useTripsPagination } from '@/stores/tripsStore'
import { formatDateRange, formatShortDate } from '@/utils/dateFormatter'


export default function HomePage() {
  // Use individual Zustand selectors to prevent re-renders
  const trips = useTrips()
  const pagination = useTripsPagination()
  const isLoading = useTripsLoading()
  const error = useTripsError()
  const fetchTrips = useFetchTrips()
  
  // Local state for UI
  const [filteredTrips, setFilteredTrips] = useState(trips)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<FilterOptions>({
    year: '',
    country: ''
  })

  // Load trips on component mount
  useEffect(() => {
    fetchTrips(currentPage)
  }, [currentPage]) // Fetch when page changes

  // Combined effect: sync and filter trips when data or filters change
  useEffect(() => {
    let filtered = trips

    if (filters.year) {
      filtered = filtered.filter(trip => {
        const year = new Date(trip.startDate).getFullYear()
        return year.toString() === filters.year
      })
    }

    if (filters.country && filters.country.trim() !== '') {
      filtered = filtered.filter(trip => 
        trip.country?.toLowerCase().includes(filters.country!.toLowerCase())
      )
    }

    setFilteredTrips(filtered)
    setCurrentSlide(0) // Reset to first slide when filters change
  }, [trips, filters])

  // Get unique years and countries for filters
  const availableYears = Array.from(new Set(trips.map(trip => 
    new Date(trip.startDate).getFullYear().toString()
  ))).sort((a, b) => parseInt(b) - parseInt(a))

  const availableCountries = Array.from(new Set(trips.map(trip => trip.country).filter(Boolean))).sort()

  const clearFilters = () => {
    setFilters({ year: '', country: '' })
  }

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const getImageUrl = (coverImage: any): string => {
    if (!coverImage) return ''
    
    if (typeof coverImage === 'string') return coverImage
    
    // Handle the transformed coverImage with full URLs
    if (coverImage.url) {
      return coverImage.url
    }
    
    if (coverImage.thumbnailURL) {
      return coverImage.thumbnailURL
    }
    
    return ''
  }

  // Loading screen
  if (isLoading && trips.length === 0) {
    return <LoadingScreen message="Loading travel adventures..." />
  }

  // Error screen
  if (error) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-2">Failed to Load Trips</h1>
          <p className="text-base-content/70 mb-6">{error}</p>
          <button 
            onClick={() => fetchTrips(currentPage)}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Carousel Section */}
      {filteredTrips.length > 0 && (
        <div className="w-full relative overflow-hidden">
          <div className="carousel w-full aspect-[16/9] max-h-[600px]">
            {filteredTrips.slice(0, 10).map((trip, index) => {
              const hasImage = getImageUrl(trip.coverImage) && getImageUrl(trip.coverImage).trim() !== ''
              
              return (
                <div key={trip.id} id={`slide${index + 1}`} className="carousel-item relative w-full h-full flex-shrink-0">
                  {hasImage ? (
                    <div className="w-full h-full flex justify-center">
                      <img
                        src={getImageUrl(trip.coverImage)}
                        alt={trip.coverImage?.alt || trip.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700"></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60 flex items-center justify-center">
                    <div className="hero-content text-center text-white max-w-4xl px-6">
                      <div className="badge badge-primary badge-lg mb-4 px-4 py-2 font-semibold">{trip.country}</div>
                      <h1 className="text-3xl md:text-5xl font-bold mb-4">{trip.title}</h1>
                      <p className="text-base md:text-lg mb-6 opacity-90 max-w-2xl mx-auto">
                        {trip.location} • {new Date(trip.startDate).getFullYear()}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href={`/trip/${trip.slug}`} className="btn btn-primary btn-lg">
                          View Trip Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Navigation arrows - only show if multiple trips */}
          {filteredTrips.length > 1 && (
            <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
              <button 
                onClick={(e) => {
                  e.preventDefault()
                  const totalSlides = Math.min(filteredTrips.length, 10)
                  const prevIndex = currentSlide === 0 ? totalSlides - 1 : currentSlide - 1
                  setCurrentSlide(prevIndex)
                  const targetSlide = document.getElementById(`slide${prevIndex + 1}`)
                  if (targetSlide) {
                    targetSlide.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
                  }
                }}
                className="btn btn-circle btn-ghost text-white hover:bg-white/20"
              >
                ❮
              </button>
              <button 
                onClick={(e) => {
                  e.preventDefault()
                  const totalSlides = Math.min(filteredTrips.length, 10)
                  const nextIndex = currentSlide === totalSlides - 1 ? 0 : currentSlide + 1
                  setCurrentSlide(nextIndex)
                  const targetSlide = document.getElementById(`slide${nextIndex + 1}`)
                  if (targetSlide) {
                    targetSlide.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
                  }
                }}
                className="btn btn-circle btn-ghost text-white hover:bg-white/20"
              >
                ❯
              </button>
            </div>
          )}
          
          {/* Pagination dots - only show if multiple trips */}
          {filteredTrips.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
              {filteredTrips.slice(0, 10).map((_, index) => (
                <button 
                  key={index}
                  onClick={(e) => {
                    e.preventDefault()
                    setCurrentSlide(index)
                    const targetSlide = document.getElementById(`slide${index + 1}`)
                    if (targetSlide) {
                      targetSlide.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
                    }
                  }}
                  className={`w-3 h-3 rounded-full transition-colors cursor-pointer ${
                    currentSlide === index ? 'bg-white' : 'bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="section-container-lg">

        {/* World Travel Map Section */}
        <div id="travel-map" className="mb-16">
          <WorldTravelMap trips={filteredTrips.length > 0 ? filteredTrips : trips} />
        </div>

        {/* Filters */}
        <div className="bg-base-200 rounded-2xl p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Year Filter */}
              <div className="form-control">
                <select 
                  className="select select-bordered select-sm"
                  value={filters.year}
                  onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                >
                  <option value="">All Years</option>
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Country Filter */}
              <div className="form-control">
                <select 
                  className="select select-bordered select-sm"
                  value={filters.country}
                  onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
                >
                  <option value="">All Countries</option>
                  {availableCountries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              {/* Active Filters */}
              {(filters.year || filters.country) && (
                <div className="flex gap-2 items-center">
                  {filters.year && (
                    <div className="badge gap-2 px-3 py-2">
                      <span className="text-sm font-medium">{filters.year}</span>
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, year: '' }))}
                        className="btn btn-ghost btn-xs p-0 min-h-0 h-4 w-4"
                      >
                        <span className="i-mdi-close w-3 h-3"></span>
                      </button>
                    </div>
                  )}
                  {filters.country && (
                    <div className="badge gap-2 px-3 py-2">
                      <span className="text-sm font-medium">{filters.country}</span>
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, country: '' }))}
                        className="btn btn-ghost btn-xs p-0 min-h-0 h-4 w-4"
                      >
                        <span className="i-mdi-close w-3 h-3"></span>
                      </button>
                    </div>
                  )}
                  <button 
                    onClick={clearFilters}
                    className="btn btn-ghost btn-xs"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Trip Count */}
            <div className="flex items-center gap-2 text-sm text-base-content/60">
              {isLoading && <LoadingSpinner size="sm" />}
              <span>
                {filteredTrips.length} trip{filteredTrips.length !== 1 ? 's' : ''}
                {filteredTrips.length !== trips.length && ` of ${trips.length}`}
              </span>
            </div>
          </div>
        </div>


        {/* Trip Listing */}
        {filteredTrips.length === 0 && !isLoading ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🧳</div>
            <h3 className="text-2xl font-bold mb-2">
              {filters.year || filters.country ? 'No trips found' : 'No trips yet'}
            </h3>
            <p className="text-base-content/60 mb-6">
              {filters.year || filters.country 
                ? 'Try adjusting your filters to see more trips.' 
                : 'Start planning your next adventure!'
              }
            </p>
            {(filters.year || filters.country) && (
              <button onClick={clearFilters} className="btn btn-primary">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => (
              <Link key={trip.id} href={`/trip/${trip.slug}`} className="group">
                <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  {/* Trip Image */}
                  <figure className="aspect-[16/9] overflow-hidden relative">
                    {getImageUrl(trip.coverImage) ? (
                      <img
                        src={getImageUrl(trip.coverImage)}
                        alt={trip.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                        <span className="text-4xl">🌎</span>
                      </div>
                    )}
                    {/* Year Badge - Top Right Overlay */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className="badge badge-neutral shadow-lg backdrop-blur-sm bg-black/70 text-white border-0">
                        {new Date(trip.startDate).getFullYear()}
                      </span>
                    </div>
                  </figure>

                  <div className="card-body p-6">
                    {/* Trip Header */}
                    <div className="mb-3">
                      <h2 className="card-title text-xl font-bold">{trip.title}</h2>
                    </div>

                    {/* Location & Country */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">📍</span>
                      <div>
                        <p className="font-medium">{trip.location}</p>
                        <p className="text-sm text-base-content/60">{trip.country}</p>
                      </div>
                    </div>

                    {/* Tags */}
                    {trip.tags && trip.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {trip.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="badge badge-outline badge-sm">
                            {tag}
                          </span>
                        ))}
                        {trip.tags.length > 2 && (
                          <span className="badge badge-outline badge-sm">
                            +{trip.tags.length - 2} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Trip Stats */}
                    <div className="stats stats-horizontal bg-base-200 text-xs">
                      <div className="stat px-3 py-2">
                        <div className="stat-title text-xs">Duration</div>
                        <div className="stat-value text-sm">
                          {getDuration(trip.startDate, trip.endDate)} days
                        </div>
                      </div>
                      <div className="stat px-3 py-2">
                        <div className="stat-title text-xs">Date</div>
                        <div className="stat-value text-sm">
                          {formatDateRange(trip.startDate, trip.endDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Simple Pagination */}
        {pagination.totalPages > 1 && (
          <div className="text-center mt-8 mb-8">
            <div className="join">
              <button
                className={`join-item btn ${!pagination.hasPrevPage ? 'btn-disabled' : ''}`}
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={!pagination.hasPrevPage}
              >
                ← Previous
              </button>
              <button className="join-item btn btn-active btn-primary">
                Page {currentPage} of {pagination.totalPages}
              </button>
              <button
                className={`join-item btn ${!pagination.hasNextPage ? 'btn-disabled' : ''}`}
                onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                disabled={!pagination.hasNextPage}
              >
                Next →
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
} 