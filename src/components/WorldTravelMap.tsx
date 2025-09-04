'use client'

import React, { useEffect, useRef, useState } from 'react'
import { TripListing } from '@/types/trip'

interface WorldTravelMapProps {
  trips: TripListing[]
}

declare global {
  interface Window {
    Datamap: any
    d3: any
  }
}

export function WorldTravelMap({ trips }: WorldTravelMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [scriptsLoaded, setScriptsLoaded] = useState(false)
  const [mapInstance, setMapInstance] = useState<any>(null)

  // Country code mapping for DataMaps (comprehensive)
  const countryCodeMap: { [key: string]: string } = {
    // Current trip countries
    'South Korea': 'KOR',
    'Japan': 'JPN',
    
    // Asia (with variants)
    'Korea, Republic of': 'KOR',
    'Republic of Korea': 'KOR',
    'Taiwan': 'TWN',
    'Republic of China': 'TWN',
    'Hong Kong': 'HKG',
    'Hong Kong SAR China': 'HKG',
    'Singapore': 'SGP',
    'Republic of Singapore': 'SGP',
    'Thailand': 'THA',
    'Kingdom of Thailand': 'THA',
    'Malaysia': 'MYS',
    'Indonesia': 'IDN',
    'Republic of Indonesia': 'IDN',
    'Philippines': 'PHL',
    'Republic of the Philippines': 'PHL',
    'Vietnam': 'VNM',
    'Socialist Republic of Vietnam': 'VNM',
    'Cambodia': 'KHM',
    'Kingdom of Cambodia': 'KHM',
    'Laos': 'LAO',
    'Lao People\'s Democratic Republic': 'LAO',
    'Myanmar': 'MMR',
    'Republic of the Union of Myanmar': 'MMR',
    'China': 'CHN',
    'People\'s Republic of China': 'CHN',
    'India': 'IND',
    'Republic of India': 'IND',
    'Nepal': 'NPL',
    'Federal Democratic Republic of Nepal': 'NPL',
    'Bhutan': 'BTN',
    'Kingdom of Bhutan': 'BTN',
    'Sri Lanka': 'LKA',
    'Democratic Socialist Republic of Sri Lanka': 'LKA',
    'Maldives': 'MDV',
    'Republic of Maldives': 'MDV',
    
    // North America
    'United States': 'USA',
    'United States of America': 'USA',
    'USA': 'USA',
    'Canada': 'CAN',
    'Mexico': 'MEX',
    'United Mexican States': 'MEX',
    
    // Europe
    'United Kingdom': 'GBR',
    'Great Britain': 'GBR',
    'England': 'GBR',
    'France': 'FRA',
    'French Republic': 'FRA',
    'Germany': 'DEU',
    'Federal Republic of Germany': 'DEU',
    'Italy': 'ITA',
    'Italian Republic': 'ITA',
    'Spain': 'ESP',
    'Kingdom of Spain': 'ESP',
    'Netherlands': 'NLD',
    'Kingdom of the Netherlands': 'NLD',
    'Switzerland': 'CHE',
    'Swiss Confederation': 'CHE',
    'Austria': 'AUT',
    'Republic of Austria': 'AUT',
    
    // Oceania
    'Australia': 'AUS',
    'Commonwealth of Australia': 'AUS',
    'New Zealand': 'NZL'
  }

  // Country code to full name mapping for display
  const codeToFullNameMap: { [key: string]: string } = {
    'KOR': 'South Korea',
    'JPN': 'Japan',
    'CHN': 'China',
    'TWN': 'Taiwan',
    'HKG': 'Hong Kong',
    'SGP': 'Singapore',
    'THA': 'Thailand',
    'MYS': 'Malaysia',
    'IDN': 'Indonesia',
    'PHL': 'Philippines',
    'VNM': 'Vietnam',
    'KHM': 'Cambodia',
    'LAO': 'Laos',
    'MMR': 'Myanmar',
    'IND': 'India',
    'NPL': 'Nepal',
    'BTN': 'Bhutan',
    'LKA': 'Sri Lanka',
    'MDV': 'Maldives',
    'USA': 'United States of America',
    'CAN': 'Canada',
    'MEX': 'Mexico',
    'GBR': 'United Kingdom',
    'FRA': 'France',
    'DEU': 'Germany',
    'ITA': 'Italy',
    'ESP': 'Spain',
    'NLD': 'Netherlands',
    'CHE': 'Switzerland',
    'AUT': 'Austria',
    'AUS': 'Australia',
    'NZL': 'New Zealand',
    'BRA': 'Brazil',
    'ARG': 'Argentina',
    'RUS': 'Russian Federation',
    'TUR': 'Turkey',
    'EGY': 'Egypt',
    'ZAF': 'South Africa'
  }

  // Process trip data to count visits per country and location
  const processCountryData = () => {
    const countryLocationData: { [key: string]: { [key: string]: number } } = {}
    const countryData: { [key: string]: any } = {}

    trips.forEach(trip => {
      const country = trip.country
      const location = trip.location
      const countryCode = countryCodeMap[country]
      
      if (countryCode) {
        // Use full country name for display, fallback to original if not found in mapping
        const displayName = codeToFullNameMap[country] || country
        
        // Initialize country if not exists
        if (!countryLocationData[displayName]) {
          countryLocationData[displayName] = {}
        }
        
        // Count visits per location within country
        countryLocationData[displayName][location] = (countryLocationData[displayName][location] || 0) + 1
      }
    })

    // Convert to DataMaps format
    Object.keys(countryLocationData).forEach(country => {
      // Find the country code - check if country is already a full name or if it needs conversion
      const countryCode = countryCodeMap[country] || 
                         Object.keys(codeToFullNameMap).find(code => codeToFullNameMap[code] === country)
      
      if (countryCode) {
        const locations = countryLocationData[country]
        const totalVisitCount = Object.values(locations).reduce((sum, count) => sum + count, 0)
        
        countryData[countryCode] = {
          visitCount: totalVisitCount,
          country, // This will now always be the full country name
          locations, // Add location-level data
          fillKey: totalVisitCount >= 3 ? 'HIGH' : totalVisitCount >= 2 ? 'MEDIUM' : 'LOW'
        }
      }
    })

    return countryData
  }

  // Load external scripts
  useEffect(() => {
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve()
          return
        }

        const script = document.createElement('script')
        script.src = src
        script.onload = () => resolve()
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
        document.head.appendChild(script)
      })
    }

    const loadAllScripts = async () => {
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.3/d3.min.js')
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/topojson/1.6.9/topojson.min.js')
        await loadScript('https://cdn.jsdelivr.net/npm/datamaps@0.5.9/dist/datamaps.all.min.js')
        setScriptsLoaded(true)
      } catch (error) {
        console.error('Failed to load DataMaps scripts:', error)
      }
    }

    loadAllScripts()
  }, [])

  // Initialize map
  useEffect(() => {
    if (!scriptsLoaded || !mapRef.current || !window.Datamap) return

    const countryData = processCountryData()
    const totalCountries = Object.keys(countryData).length

    const map = new window.Datamap({
      element: mapRef.current,
      projection: 'mercator',
      responsive: true,
      // Focus on Asia region
      setProjection: function(element: any) {
        const projection = window.d3.geo.mercator()
          .center([120, 25])  // Center on Asia (longitude: 120°E, latitude: 25°N)
          .scale(450)          // Zoom level for Asia
          .translate([element.offsetWidth / 2, element.offsetHeight / 2])
        
        const path = window.d3.geo.path()
          .projection(projection)
        
        return { path: path, projection: projection }
      },
      fills: {
        defaultFill: 'color-mix(in oklab, var(--fallback-b2,oklch(0.86 0.016 240)) 60%, transparent)',
        LOW: 'color-mix(in oklab, var(--fallback-su,oklch(0.66 0.16 156)) 30%, transparent)',
        MEDIUM: 'color-mix(in oklab, var(--fallback-wa,oklch(0.77 0.15 69)) 40%, transparent)',
        HIGH: 'color-mix(in oklab, var(--fallback-er,oklch(0.72 0.16 29)) 50%, transparent)'
      },
      data: countryData,
      geographyConfig: {
        borderColor: 'color-mix(in oklab, var(--fallback-bc,oklch(0.38 0.019 240)) 30%, transparent)',
        highlightFillColor: 'color-mix(in oklab, var(--fallback-p,oklch(0.51 0.29 259)) 20%, transparent)',
        highlightBorderColor: 'var(--fallback-p,oklch(0.51 0.29 259))',
                popupTemplate: function (geo: any, data: any) {
          // Comprehensive country flag mapping
          const countryFlagMap: { [key: string]: string } = {
            // Asia
            'South Korea': '🇰🇷', 'Korea, Republic of': '🇰🇷', 'Republic of Korea': '🇰🇷',
            'Japan': '🇯🇵',
            'China': '🇨🇳', 'People\'s Republic of China': '🇨🇳',
            'Taiwan': '🇹🇼', 'Republic of China': '🇹🇼',
            'Hong Kong': '🇭🇰', 'Hong Kong SAR China': '🇭🇰',
            'Singapore': '🇸🇬', 'Republic of Singapore': '🇸🇬',
            'Thailand': '🇹🇭', 'Kingdom of Thailand': '🇹🇭',
            'Malaysia': '🇲🇾',
            'Indonesia': '🇮🇩', 'Republic of Indonesia': '🇮🇩',
            'Philippines': '🇵🇭', 'Republic of the Philippines': '🇵🇭',
            'Vietnam': '🇻🇳', 'Socialist Republic of Vietnam': '🇻🇳',
            'Cambodia': '🇰🇭', 'Kingdom of Cambodia': '🇰🇭',
            'Laos': '🇱🇦', 'Lao People\'s Democratic Republic': '🇱🇦',
            'Myanmar': '🇲🇲', 'Republic of the Union of Myanmar': '🇲🇲',
            'India': '🇮🇳', 'Republic of India': '🇮🇳',
            'Nepal': '🇳🇵', 'Federal Democratic Republic of Nepal': '🇳🇵',
            'Bhutan': '🇧🇹', 'Kingdom of Bhutan': '🇧🇹',
            'Sri Lanka': '🇱🇰', 'Democratic Socialist Republic of Sri Lanka': '🇱🇰',
            'Maldives': '🇲🇻', 'Republic of Maldives': '🇲🇻',
            'Bangladesh': '🇧🇩', 'People\'s Republic of Bangladesh': '🇧🇩',
            'Pakistan': '🇵🇰', 'Islamic Republic of Pakistan': '🇵🇰',
            'Afghanistan': '🇦🇫', 'Islamic Republic of Afghanistan': '🇦🇫',
            
            // North America
            'United States': '🇺🇸', 'United States of America': '🇺🇸', 'USA': '🇺🇸',
            'Canada': '🇨🇦',
            'Mexico': '🇲🇽', 'United Mexican States': '🇲🇽',
            
            // Europe
            'United Kingdom': '🇬🇧', 'Great Britain': '🇬🇧', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
            'France': '🇫🇷', 'French Republic': '🇫🇷',
            'Germany': '🇩🇪', 'Federal Republic of Germany': '🇩🇪',
            'Italy': '🇮🇹', 'Italian Republic': '🇮🇹',
            'Spain': '🇪🇸', 'Kingdom of Spain': '🇪🇸',
            'Netherlands': '🇳🇱', 'Kingdom of the Netherlands': '🇳🇱',
            'Switzerland': '🇨🇭', 'Swiss Confederation': '🇨🇭',
            'Austria': '🇦🇹', 'Republic of Austria': '🇦🇹',
            'Portugal': '🇵🇹', 'Portuguese Republic': '🇵🇹',
            'Belgium': '🇧🇪', 'Kingdom of Belgium': '🇧🇪',
            'Denmark': '🇩🇰', 'Kingdom of Denmark': '🇩🇰',
            'Sweden': '🇸🇪', 'Kingdom of Sweden': '🇸🇪',
            'Norway': '🇳🇴', 'Kingdom of Norway': '🇳🇴',
            'Finland': '🇫🇮', 'Republic of Finland': '🇫🇮',
            'Iceland': '🇮🇸', 'Republic of Iceland': '🇮🇸',
            'Ireland': '🇮🇪', 'Republic of Ireland': '🇮🇪',
            'Poland': '🇵🇱', 'Republic of Poland': '🇵🇱',
            'Czech Republic': '🇨🇿', 'Czechia': '🇨🇿',
            'Hungary': '🇭🇺', 'Republic of Hungary': '🇭🇺',
            'Greece': '🇬🇷', 'Hellenic Republic': '🇬🇷',
            'Turkey': '🇹🇷', 'Republic of Turkey': '🇹🇷',
            'Russia': '🇷🇺', 'Russian Federation': '🇷🇺',
            
            // Oceania
            'Australia': '🇦🇺', 'Commonwealth of Australia': '🇦🇺',
            'New Zealand': '🇳🇿',
            'Fiji': '🇫🇯', 'Republic of Fiji': '🇫🇯',
            
            // Africa
            'South Africa': '🇿🇦', 'Republic of South Africa': '🇿🇦',
            'Egypt': '🇪🇬', 'Arab Republic of Egypt': '🇪🇬',
            'Morocco': '🇲🇦', 'Kingdom of Morocco': '🇲🇦',
            'Kenya': '🇰🇪', 'Republic of Kenya': '🇰🇪',
            'Nigeria': '🇳🇬', 'Federal Republic of Nigeria': '🇳🇬',
            
            // South America
            'Brazil': '🇧🇷', 'Federative Republic of Brazil': '🇧🇷',
            'Argentina': '🇦🇷', 'Argentine Republic': '🇦🇷',
            'Chile': '🇨🇱', 'Republic of Chile': '🇨🇱',
            'Peru': '🇵🇪', 'Republic of Peru': '🇵🇪',
            'Colombia': '🇨🇴', 'Republic of Colombia': '🇨🇴',
            'Venezuela': '🇻🇪', 'Bolivarian Republic of Venezuela': '🇻🇪',
            'Ecuador': '🇪🇨', 'Republic of Ecuador': '🇪🇨',
            'Uruguay': '🇺🇾', 'Oriental Republic of Uruguay': '🇺🇾',
            'Paraguay': '🇵🇾', 'Republic of Paraguay': '🇵🇾',
            'Bolivia': '🇧🇴', 'Plurinational State of Bolivia': '🇧🇴',
            
            // Middle East
            'Israel': '🇮🇱', 'State of Israel': '🇮🇱',
            'Jordan': '🇯🇴', 'Hashemite Kingdom of Jordan': '🇯🇴',
            'Lebanon': '🇱🇧', 'Lebanese Republic': '🇱🇧',
            'Syria': '🇸🇾', 'Syrian Arab Republic': '🇸🇾',
            'Iraq': '🇮🇶', 'Republic of Iraq': '🇮🇶',
            'Iran': '🇮🇷', 'Islamic Republic of Iran': '🇮🇷',
            'Saudi Arabia': '🇸🇦', 'Kingdom of Saudi Arabia': '🇸🇦',
            'United Arab Emirates': '🇦🇪', 'UAE': '🇦🇪',
            'Qatar': '🇶🇦', 'State of Qatar': '🇶🇦',
            'Kuwait': '🇰🇼', 'State of Kuwait': '🇰🇼',
            'Bahrain': '🇧🇭', 'Kingdom of Bahrain': '🇧🇭',
            'Oman': '🇴🇲', 'Sultanate of Oman': '🇴🇲',
            'Yemen': '🇾🇪', 'Republic of Yemen': '🇾🇪'
          }

          if (!data) {
            // Handle unvisited countries - use the codeToFullNameMap from outer scope
            const geoId = geo.id || geo.properties.ISO_A3 || geo.properties.ADM0_A3
            const fullCountryName = codeToFullNameMap[geoId] || 
                                   geo.properties.NAME_LONG || 
                                   geo.properties.NAME || 
                                   geo.properties.NAME_EN || 
                                   geo.properties.ADMIN || 
                                   geoId || 
                                   'Unknown Country'
            
            return `<div class="bg-base-100 rounded-lg p-3 shadow-lg min-w-32">
                      <div class="font-medium text-base-content">${fullCountryName}:</div>
                      <div class="text-sm text-base-content/70 ml-2">No visits</div>
                    </div>`
          }

          // Handle visited countries - show hierarchical format
          const locations = data.locations || {}
          let locationsList = ''
          
          Object.entries(locations).forEach(([location, count]) => {
            locationsList += `<div class="text-sm text-base-content/80 ml-2">- ${location}: ${count}</div>`
          })

          return `<div class="bg-base-100 rounded-lg p-3 shadow-lg min-w-48">
                    <div class="font-medium text-base-content mb-1">${data.country}:</div>
                    ${locationsList}
                  </div>`
        }
      }
    })

    setMapInstance(map)

    // Handle window resize
    const handleResize = () => {
      if (map && map.resize) {
        map.resize()
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [scriptsLoaded, trips])

  const totalCountries = Object.keys(processCountryData()).length
  const totalTrips = trips.length

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="card-title text-2xl mb-2">🗾 World Travel Map</h2>
            <p className="text-base-content/70">
              Explore the World countries I've visited and discover my travel journey across the world
            </p>
          </div>
          <div className="stats bg-base-200 shadow-sm mt-4 md:mt-0">
            <div className="stat py-3 px-4">
              <div className="stat-value text-lg text-primary">{totalCountries}</div>
              <div className="stat-desc">Countries</div>
            </div>
            <div className="stat py-3 px-4">
              <div className="stat-value text-lg text-secondary">{totalTrips}</div>
              <div className="stat-desc">Total Trips</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{backgroundColor: 'color-mix(in oklab, var(--fallback-su,oklch(0.66 0.16 156)) 30%, transparent)'}}></div>
            <span className="text-sm">1 Trip</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{backgroundColor: 'color-mix(in oklab, var(--fallback-wa,oklch(0.77 0.15 69)) 40%, transparent)'}}></div>
            <span className="text-sm">2 Trips</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{backgroundColor: 'color-mix(in oklab, var(--fallback-er,oklch(0.72 0.16 29)) 50%, transparent)'}}></div>
            <span className="text-sm">3+ Trips</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-base-300"></div>
            <span className="text-sm">Not Visited</span>
          </div>
        </div>

        {/* Map Container */}
        <div className="w-full">
          {!scriptsLoaded ? (
            <div className="flex items-center justify-center h-64 bg-base-200 rounded-lg">
              <div className="text-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="mt-2 text-base-content/70">Loading World map...</p>
              </div>
            </div>
          ) : (
            <div 
              ref={mapRef} 
              id="travel-datamap" 
              className="w-full h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden"
            />
          )}
        </div>

        {totalCountries > 0 && (
          <div className="mt-6 text-center">
            <p className="text-base-content/70">
              🎯 Hover over highlighted World countries to see trip details
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 