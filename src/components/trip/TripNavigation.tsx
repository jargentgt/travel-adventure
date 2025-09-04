'use client'

import React from 'react'
import Link from 'next/link'
import { Trip } from '@/types/trip'
import { formatShortDate } from '@/utils/dateFormatter'

interface TripNavigationProps {
  previousTrip?: Trip | null
  nextTrip?: Trip | null
}

export function TripNavigation({ previousTrip, nextTrip }: TripNavigationProps) {

  const getImageUrl = (coverImage: any): string => {
    if (!coverImage) return ''
    
    if (typeof coverImage === 'string') return coverImage
    
    if (coverImage.url) {
      return coverImage.url
    }
    
    if (coverImage.thumbnailURL) {
      return coverImage.thumbnailURL
    }
    
    return ''
  }

  if (!previousTrip && !nextTrip) {
    return null
  }

  return (
    <div className="border-t border-base-300 bg-base-50">
      <div className="section-container-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Previous Trip */}
          <div className="flex justify-start">
            {previousTrip ? (
              <Link 
                href={`/trip/${previousTrip.slug}`}
                className="group flex items-center gap-4 p-4 rounded-lg bg-base-100 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] max-w-md w-full"
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg overflow-hidden">
                    {getImageUrl(previousTrip.coverImage) ? (
                      <img
                        src={getImageUrl(previousTrip.coverImage)}
                        alt={previousTrip.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                        <span className="text-lg">🌎</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="i-mdi-chevron-left w-4 h-4 text-base-content/60"></span>
                    <span className="text-sm text-base-content/60 font-medium">Previous Trip</span>
                  </div>
                  <h3 className="font-semibold text-base-content truncate group-hover:text-primary transition-colors">
                    {previousTrip.title}
                  </h3>
                  <p className="text-sm text-base-content/60">
                    {formatShortDate(previousTrip.startDate)}
                  </p>
                </div>
              </Link>
            ) : (
              <div className="max-w-md w-full opacity-50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="i-mdi-chevron-left w-4 h-4 text-base-content/40"></span>
                  <span className="text-sm text-base-content/40">No previous trip</span>
                </div>
              </div>
            )}
          </div>

          {/* Next Trip */}
          <div className="flex justify-end">
            {nextTrip ? (
              <Link 
                href={`/trip/${nextTrip.slug}`}
                className="group flex items-center gap-4 p-4 rounded-lg bg-base-100 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] max-w-md w-full"
              >
                <div className="flex-grow min-w-0 text-right">
                  <div className="flex items-center justify-end gap-2 mb-1">
                    <span className="text-sm text-base-content/60 font-medium">Next Trip</span>
                    <span className="i-mdi-chevron-right w-4 h-4 text-base-content/60"></span>
                  </div>
                  <h3 className="font-semibold text-base-content truncate group-hover:text-primary transition-colors">
                    {nextTrip.title}
                  </h3>
                  <p className="text-sm text-base-content/60">
                    {formatShortDate(nextTrip.startDate)}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg overflow-hidden">
                    {getImageUrl(nextTrip.coverImage) ? (
                      <img
                        src={getImageUrl(nextTrip.coverImage)}
                        alt={nextTrip.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                        <span className="text-lg">🌎</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ) : (
              <div className="max-w-md w-full opacity-50">
                <div className="flex items-center justify-end gap-2 mb-2">
                  <span className="text-sm text-base-content/40">No next trip</span>
                  <span className="i-mdi-chevron-right w-4 h-4 text-base-content/40"></span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 