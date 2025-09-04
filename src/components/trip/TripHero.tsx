import React from 'react'
import { Trip } from '@/types/trip'

interface TripHeroProps {
  trip: Trip
}

export function TripHero({ trip }: TripHeroProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTotalDays = () => {
    const start = new Date(trip.startDate)
    const end = new Date(trip.endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  const getGradientForTrip = () => {
    // Define gradient colors for different countries/categories
    if (trip.country === 'South Korea') return 'bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700'
    if (trip.country === 'Japan') return 'bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700'
    if (trip.categories.includes('adventure')) return 'bg-gradient-to-br from-orange-500 via-red-600 to-pink-700'
    if (trip.categories.includes('nature')) return 'bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-700'
    return 'bg-gradient-to-br from-amber-500 via-orange-600 to-red-700'
  }

  const hasImage = trip.coverImage?.url && trip.coverImage.url.trim() !== ''

  return (
    <div 
      className={`relative h-[500px] md:h-[600px] overflow-hidden ${
        hasImage 
          ? 'bg-cover bg-center bg-no-repeat' 
          : getGradientForTrip()
      }`}
      style={hasImage ? {
        backgroundImage: `url('${trip.coverImage!.url}')`
      } : {}}
    >
      {/* Enhanced overlay for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60"></div>
      
      {/* Content container with better positioning */}
      <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center text-white max-w-6xl w-full">
          
          {/* Country and Categories Badges */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            <div className="badge badge-primary badge-lg font-semibold text-base px-4 py-2">
              {trip.country}
            </div>
            {trip.categories.map((category) => (
              <div key={category} className="badge badge-secondary badge-lg font-medium text-sm px-3 py-2">
                {category}
              </div>
            ))}
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight drop-shadow-lg">
            {trip.title}
          </h1>
          
          {/* Trip Details with improved spacing */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-8 text-base sm:text-lg">
            <div className="flex items-center gap-2 bg-black/20 rounded-full px-4 py-2 backdrop-blur-sm">
              <span className="i-mdi-map-marker w-5 h-5 flex-shrink-0"></span>
              <span className="font-medium">{trip.location}</span>
            </div>
            
            <div className="flex items-center gap-2 bg-black/20 rounded-full px-4 py-2 backdrop-blur-sm">
              <span className="i-mdi-calendar-today w-5 h-5 flex-shrink-0"></span>
              <span className="font-medium hidden sm:inline">{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
              <span className="font-medium sm:hidden">{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span>
            </div>
            
            <div className="flex items-center gap-2 bg-black/20 rounded-full px-4 py-2 backdrop-blur-sm">
              <span className="i-mdi-clock-outline w-5 h-5 flex-shrink-0"></span>
              <span className="font-medium">{getTotalDays()} Days</span>
            </div>
          </div>
          
          {/* Tags with better visibility */}
          <div className="flex flex-wrap gap-2 justify-center">
            {trip.tags.map((tag) => (
              <span key={tag} className="badge badge-outline badge-lg border-white/60 text-white/90 hover:bg-white/10 transition-colors px-3 py-2 font-medium">
                #{tag}
              </span>
            ))}
          </div>
          
        </div>
      </div>
    </div>
  )
} 