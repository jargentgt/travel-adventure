'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Trip, Activity } from '@/types/trip'
import { Loader } from '@googlemaps/js-api-loader'
import { MarkerClusterer } from '@googlemaps/markerclusterer'
import { geocodingCache, extractCoordinatesFromText, ApiUsageMonitor } from '@/utils/geocodingCache'

interface TripDetailMapProps {
  trip: Trip
  selectedDay: number
  focusedActivityId?: string | null
  onActivityFocus?: (activityId: string | null) => void
  isVisible?: boolean // For lazy loading
}

declare global {
  interface Window {
    google: any
  }
}



export function TripDetailMap({ trip, selectedDay, focusedActivityId, onActivityFocus, isVisible = true }: TripDetailMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [markers, setMarkers] = useState<Map<string, any>>(new Map())
  const [markerClusterer, setMarkerClusterer] = useState<MarkerClusterer | null>(null)
  const [polylines, setPolylines] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentZoom, setCurrentZoom] = useState<number>(12)
  const [userHasInteracted, setUserHasInteracted] = useState(false)
  const [currentCheckpoint, setCurrentCheckpoint] = useState<number>(0) // Track current checkpoint index
  const [tourStarted, setTourStarted] = useState<boolean>(false) // Track if guided tour has started



  // Helper function to simplify location display for labels
  const simplifyLocationForDisplay = (fullLocation: string): string => {
    return fullLocation.split(',')[0].trim()
  }

  // Helper function to get category icon/letter for labels
  const getCategoryIcon = (category: string): string => {
    const categoryMap: Record<string, string> = {
      // Accommodation 
      'hotel': 'H',
      'accommodation': 'H',
      'lodging': 'H',
      // Food & Dining
      'restaurant': 'R', 
      'food': 'F',
      'dining': 'D',
      'cafe': 'C',
      // Activities & Sightseeing
      'activity': 'A',
      'sightseeing': 'S',
      'attraction': 'A',
      'museum': 'M',
      'temple': 'T',
      'park': 'P',
      // Shopping
      'shopping': '🛍',
      'market': 'M',
      // Transportation
      'transport': '🚌',
      'transportation': '🚌', 
      'airport': '✈',
      'station': '🚉',
      // Default
      'default': '📍'
    }
    
    const normalizedCategory = category.toLowerCase()
    return categoryMap[normalizedCategory] || categoryMap.default
  }

  // Helper function to get day color for polylines
  const getDayColor = (dayIndex: number): string => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F']
    return colors[dayIndex % colors.length]
  }

  // Helper function to determine if polylines should be visible based on zoom
  const shouldShowPolylines = (zoomLevel: number): boolean => {
    return zoomLevel >= 13 // Show lines when zoomed in enough for detail
  }

  // Helper function to determine if clustering should be enabled
  const shouldEnableClustering = (zoomLevel: number, activityCount: number): boolean => {
    return zoomLevel < 13 && activityCount > 6 // Cluster when zoomed out and many activities
  }

  // Function to create polyline for a set of coordinates
  const createPolylineForCoordinates = (coordinates: { lat: number, lng: number }[], dayIndex: number): any | null => {
    if (!window.google || coordinates.length < 2) return null

    return new window.google.maps.Polyline({
      path: coordinates,
      geodesic: true,
      strokeColor: getDayColor(dayIndex),
      strokeOpacity: 0.8,
      strokeWeight: 3,
      icons: [{
        icon: {
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 3,
          fillColor: getDayColor(dayIndex),
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 1
        },
        offset: '50%',
        repeat: '200px'
      }]
    })
  }

  // Function to fit map to day's activities using existing markers
  const fitMapToDay = (dayIndex: number) => {
    if (!mapInstance || !trip.days[dayIndex]?.activities) return

    // Get marker positions from the current markers Map
    const markerPositions: { lat: number, lng: number }[] = []
    markers.forEach(marker => {
      if (marker.getVisible()) {
        const position = marker.getPosition()
        if (position) {
          markerPositions.push({
            lat: position.lat(),
            lng: position.lng()
          })
        }
      }
    })
    
    if (markerPositions.length === 0) return

    const bounds = new window.google.maps.LatLngBounds()
    markerPositions.forEach(position => {
      bounds.extend(position)
    })

    // Add some padding to the bounds
    mapInstance.fitBounds(bounds, { 
      padding: { top: 50, right: 50, bottom: 50, left: 50 } 
    })
  }







  // Checkpoint navigation functions
  const focusOnCheckpoint = (checkpointIndex: number) => {
    if (!mapInstance || markers.size === 0) return

    const activitiesWithLocations = getActivitiesWithLocations()
    if (checkpointIndex < 0 || checkpointIndex >= activitiesWithLocations.length) return

    const activity = activitiesWithLocations[checkpointIndex]
    const marker = markers.get(activity.id)
    
    if (marker) {
      // Close all existing info windows first
      markers.forEach((m) => {
        if (m.infoWindow) {
          m.infoWindow.close()
        }
      })

      // Center map on the checkpoint marker with smooth animation
      mapInstance.panTo(marker.getPosition())
      
      // Set appropriate zoom for checkpoint focus
      const targetZoom = Math.max(15, currentZoom) // Ensure we're zoomed in enough to see details
      if (mapInstance.getZoom() !== targetZoom) {
        mapInstance.setZoom(targetZoom)
      }
      
      // Open info window for this checkpoint
      if (marker.infoWindow) {
        setTimeout(() => {
          marker.infoWindow.open(mapInstance, marker)
        }, 500) // Delay to allow map animation to complete
      }
      
      // Update current checkpoint
      setCurrentCheckpoint(checkpointIndex)
      
      // Trigger activity focus callback
      if (onActivityFocus) {
        onActivityFocus(activity.id)
      }
      
      console.log(`📍 Focused on checkpoint ${checkpointIndex + 1}: ${activity.title}`)
    }
  }

  const goToNextCheckpoint = () => {
    const activitiesWithLocations = getActivitiesWithLocations()
    const nextIndex = Math.min(currentCheckpoint + 1, activitiesWithLocations.length - 1)
    focusOnCheckpoint(nextIndex)
  }

  const goToPrevCheckpoint = () => {
    const prevIndex = Math.max(currentCheckpoint - 1, 0)
    focusOnCheckpoint(prevIndex)
  }

  // Start guided tour
  const startTour = () => {
    setTourStarted(true)
    setCurrentCheckpoint(0)
    focusOnCheckpoint(0)
    console.log('🧭 Started guided tour - focusing on first checkpoint')
  }

  // Reset checkpoint and tour when day changes
  const resetCheckpointOnDayChange = () => {
    setCurrentCheckpoint(0)
    setTourStarted(false)
  }

  // Load Google Maps (only when user explicitly requests it)
  useEffect(() => {
    if (!userHasInteracted) {
      setIsLoading(false)
      return
    }

    const loadGoogleMaps = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      
      if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
        console.error('⚠️ Google Maps API key not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file')
        setIsLoading(false)
        return
      }

      if (window.google?.maps) {
        setGoogleMapsLoaded(true)
        setIsLoading(false)
        return
      }

      try {
        console.log('🔄 Loading Google Maps API...')
        setIsLoading(true)
        
        const loader = new Loader({
          apiKey: apiKey,
          version: 'weekly',
          libraries: ['places', 'marker']
        })

        await loader.load()
        
        // Record API usage for monitoring
        ApiUsageMonitor.recordApiCall('maps')
        
        setGoogleMapsLoaded(true)
        setIsLoading(false)
        console.log('✅ Google Maps loaded successfully')
      } catch (error) {
        console.error('❌ Failed to load Google Maps:', error)
        setIsLoading(false)
      }
    }

    loadGoogleMaps()
  }, [userHasInteracted])

  // Get activities for the selected day with locations
  const getActivitiesWithLocations = (): Activity[] => {
    if (!trip.days[selectedDay]?.activities) {
      console.log('No activities found for selected day:', selectedDay)
      return []
    }
    
    const dayActivities = trip.days[selectedDay].activities
    console.log(`Day ${selectedDay} has ${dayActivities.length} activities`)
    
    const filtered = dayActivities.filter(
      (activity): activity is Activity => {
        if (typeof activity !== 'object' || activity === null) {
          return false
        }
        
        const activityObj = activity as Activity
        const hasLocation = activityObj.location !== undefined && 
                           activityObj.location !== null &&
                           typeof activityObj.location === 'string' &&
                           activityObj.location.trim() !== ''
        
        return hasLocation
      }
    )
    
    console.log(`Filtered ${filtered.length} activities with locations`)
    return filtered
  }

  // Get category color for markers
  const getCategoryColor = (category: Activity['category']): string => {
    const colors = {
      airport: '#3b82f6',    // blue
      hotel: '#8b5cf6',      // purple
      driving: '#ef4444',    // red
      transport: '#10b981',  // green
      cafe: '#f59e0b',       // amber
      restaurant: '#f97316', // orange
      shopping: '#ec4899',   // pink
      activity: '#06b6d4'    // cyan
    }
    return colors[category] || '#6b7280'
  }





  // Initialize Google Map
  useEffect(() => {
    if (!googleMapsLoaded || !mapRef.current || !window.google || mapInstance) return

    const activitiesWithLocations = getActivitiesWithLocations()
    if (activitiesWithLocations.length === 0) return

    // Initialize map with a default center (will be adjusted later)
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 35.6762, lng: 139.6503 }, // Tokyo as default
      zoom: 12,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    })

    // Listen for zoom changes 
    map.addListener('zoom_changed', () => {
      const newZoom = map.getZoom() || 12
      setCurrentZoom(newZoom)
    })

    setMapInstance(map)
  }, [googleMapsLoaded])

  // Add markers and clustering
  useEffect(() => {
    if (!mapInstance || !window.google) return

    const activitiesWithLocations = getActivitiesWithLocations()
    console.log(`🗓️  Day ${selectedDay + 1}: Adding markers for ${activitiesWithLocations.length} activities`)
    
    // Reset checkpoint to first activity when day changes
    resetCheckpointOnDayChange()
    
    // Always clear existing markers, polylines, and clustering when day changes
    if (markerClusterer) {
      markerClusterer.clearMarkers()
      setMarkerClusterer(null)
    }
    markers.forEach(marker => {
      marker.setMap(null)
    })
    setMarkers(new Map())
    
    // Clear existing polylines
    polylines.forEach(polyline => {
      polyline.setMap(null)
    })
    setPolylines([])
    

    
    if (activitiesWithLocations.length === 0) {
      console.log(`📍 No activities with locations found for day ${selectedDay + 1}`)
      return
    }

    const newMarkers = new Map()
    const bounds = new window.google.maps.LatLngBounds()
    const geocoder = new window.google.maps.Geocoder()
    let successCount = 0

    // Geocode and create markers with caching
    const geocodePromises = activitiesWithLocations.map(async (activity, index) => {
      try {
        console.log(`🔍 Processing: ${activity.title} - ${activity.location}`)
        
        let position: { lat: number, lng: number } | null = null
        
        // Step 1: Check cache first
        const cached = geocodingCache.getCachedLocation(activity.location!)
        if (cached) {
          position = { lat: cached.lat, lng: cached.lng }
          console.log(`💾 Using cached coordinates for ${activity.title}`)
        } else {
          // Step 2: Try to extract coordinates from text (free)
          const descriptionText = activity.description || ''
          const locationText = activity.location || ''
          const extractedCoords = extractCoordinatesFromText(descriptionText + ' ' + locationText)
          
                        if (extractedCoords) {
                position = extractedCoords
                console.log(`📍 Extracted coordinates for ${activity.title}:`, position)
                
                // Cache the extracted coordinates with full address
                geocodingCache.setCachedLocation(activity.location!, position, 'extracted')
                                  } else {
            // Step 3: Use Google Maps Geocoding API with full address from API (costs money)
            const fullApiAddress = activity.location!.trim()
            
            try {
              console.log(`🌐 Geocoding full API address: "${fullApiAddress}"`)
              
              const result = await new Promise<any>((resolve, reject) => {
                geocoder.geocode(
                  { 
                    address: fullApiAddress,
                    // Smart region detection from address content
                    region: fullApiAddress.includes('日本') ? 'JP' : 
                           fullApiAddress.includes('Korea') || fullApiAddress.includes('한국') ? 'KR' : 
                           'JP' // Default to JP for most travel content
                  },
                  (results: any, status: any) => {
                    if (status === 'OK' && results?.[0]) {
                      resolve(results[0])
                    } else {
                      reject(new Error(`Geocoding failed for "${fullApiAddress}": ${status}`))
                    }
                  }
                )
              })
              
              position = {
                lat: result.geometry.location.lat(),
                lng: result.geometry.location.lng()
              }
              
              // Record API usage and cache the result with full API address
              ApiUsageMonitor.recordApiCall('geocoding')
              geocodingCache.setCachedLocation(activity.location!, position, 'google')
              
              console.log(`✅ Geocoded "${activity.title}" via Google API:`, position)
              console.log(`📍 Full API address used: "${fullApiAddress}"`)
            } catch (error) {
              console.warn(`❌ Failed to geocode full API address "${fullApiAddress}":`, error)
            }
          }
        }
        
        if (position) {
          // Create standard Google Maps pin with category color
          const marker = new window.google.maps.Marker({
            position: position,
            map: mapInstance,
            
            // Beautiful custom pin with embedded text (BEST SOLUTION!)
            title: activity.title,  // Tooltip on hover with full name
            
            // Custom SVG icon with embedded text - combines beauty + functionality
            icon: {
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg width="32" height="45" viewBox="0 0 32 45" xmlns="http://www.w3.org/2000/svg">
                  <!-- Teardrop pin shape -->
                  <path d="M16 0C7.163 0 0 7.163 0 16c0 8.837 16 29 16 29s16-20.163 16-29C32 7.163 24.837 0 16 0z" 
                        fill="${getCategoryColor(activity.category)}" 
                        stroke="#ffffff" 
                        stroke-width="2"/>
                  <!-- White circle background for text -->
                  <circle cx="16" cy="16" r="10" fill="rgba(255,255,255,0.9)" stroke="none"/>
                  <!-- Time order number -->
                  <text x="16" y="20" text-anchor="middle" 
                        font-family="Arial, sans-serif" 
                        font-size="10" 
                        font-weight="bold" 
                        fill="${getCategoryColor(activity.category)}">
                    ${index + 1}
                  </text>
                </svg>
              `)}`,
              scaledSize: new window.google.maps.Size(28, 40),
              anchor: new window.google.maps.Point(14, 40)
            }
          })

          // Create info window with simplified location display
          const simplifiedLocation = simplifyLocationForDisplay(activity.location!)
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 12px; min-width: 200px;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: ${getCategoryColor(activity.category)};">
                  ${index + 1}. ${activity.title}
                </h3>
                <p style="margin: 0 0 4px 0; font-size: 14px; color: #666; font-weight: 500;">
                  ${activity.time}
                </p>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #888; text-transform: capitalize;">
                  ${activity.category}
                </p>
                <p style="margin: 0; font-size: 12px; color: #888; line-height: 1.4;">
                  ${simplifiedLocation}
                </p>
              </div>
            `
          })

          // Add click listener
          marker.addListener('click', () => {
            // Close other info windows
            markers.forEach((m) => {
              if (m.infoWindow) {
                m.infoWindow.close()
              }
            })
            
            // Open this info window
            infoWindow.open(mapInstance, marker)
            
            // Trigger focus callback
            if (onActivityFocus) {
              onActivityFocus(activity.id)
            }
          })

          // Store marker reference - Google Maps will handle labels automatically
          marker.infoWindow = infoWindow
          newMarkers.set(activity.id, marker)
          bounds.extend(position)
          successCount++
        }
      } catch (error) {
        console.error(`Failed to process activity ${activity.title}:`, error)
      }
    })

    // Wait for all geocoding to complete
    Promise.allSettled(geocodePromises).then(() => {
      console.log(`✅ Day ${selectedDay + 1}: Successfully geocoded ${successCount} out of ${activitiesWithLocations.length} activities`)
      setMarkers(newMarkers)

      if (newMarkers.size > 0) {
        // Get coordinates for polyline creation
        const coordinates: { lat: number, lng: number }[] = []
        activitiesWithLocations.forEach((activity, index) => {
          const marker = newMarkers.get(activity.id)
          if (marker) {
            const position = marker.getPosition()
            if (position) {
              coordinates.push({
                lat: position.lat(),
                lng: position.lng()
              })
            }
          }
        })

        // Apply smart clustering and polyline logic
        const currentZoom = mapInstance.getZoom() || 12
        const enableClustering = shouldEnableClustering(currentZoom, newMarkers.size)
        const showPolylines = shouldShowPolylines(currentZoom)

        // Create marker clustering if needed
        if (enableClustering) {
          const clusterer = new MarkerClusterer({
            map: mapInstance,
            markers: Array.from(newMarkers.values()),
          })
          setMarkerClusterer(clusterer)
          console.log(`🔗 Day ${selectedDay + 1}: Clustering enabled (${newMarkers.size} markers)`)
        } else {
          console.log(`📍 Day ${selectedDay + 1}: Individual markers shown (${newMarkers.size} markers)`)
        }

        // Create and show polylines if conditions are met
        if (showPolylines && coordinates.length >= 2) {
          const polyline = createPolylineForCoordinates(coordinates, selectedDay)
          if (polyline) {
            polyline.setMap(mapInstance)
            setPolylines([polyline])
            console.log(`🛣️  Day ${selectedDay + 1}: Route polyline created with ${coordinates.length} points`)
          }
        } else if (coordinates.length < 2) {
          console.log(`🛣️  Day ${selectedDay + 1}: Not enough coordinates for polyline (${coordinates.length} points)`)
        } else {
          console.log(`🛣️  Day ${selectedDay + 1}: Polyline hidden due to zoom level (${currentZoom})`)
        }

        // Fit map to show all markers with proper padding
        if (!bounds.isEmpty()) {
          mapInstance.fitBounds(bounds, {
            top: 50,
            right: 50,
            bottom: 50,
            left: 50
          })
          
          // Ensure minimum zoom level for better visibility, but allow polylines to show
          const listener = window.google.maps.event.addListenerOnce(mapInstance, 'bounds_changed', () => {
            const newZoom = mapInstance.getZoom()
            if (newZoom && newZoom > 16) {
              mapInstance.setZoom(16)
            }
            // Auto-zoom to show polylines if we have few activities
            else if (newZoom && newZoom < 13 && newMarkers.size <= 6) {
              mapInstance.setZoom(14) // Sweet spot for showing both markers and lines
            }

            // Map initialization complete - ready for user interaction
            console.log('🗺️ Map initialization complete - showing overview of all activities')
          })
        }
      } else {
        console.log(`🗺️  Day ${selectedDay + 1}: No valid markers to display`)
      }
    })
  }, [mapInstance, selectedDay])

  // Handle zoom changes for dynamic polyline and clustering behavior
  useEffect(() => {
    if (!mapInstance || !window.google || markers.size === 0) return

    const handleZoomChanged = () => {
      const currentZoom = mapInstance.getZoom() || 12
      setCurrentZoom(currentZoom)
      
      const enableClustering = shouldEnableClustering(currentZoom, markers.size)
      const showPolylines = shouldShowPolylines(currentZoom)

      // Handle clustering changes
      if (enableClustering && !markerClusterer) {
        // Enable clustering
        const clusterer = new MarkerClusterer({
          map: mapInstance,
          markers: Array.from(markers.values()),
        })
        setMarkerClusterer(clusterer)
        console.log(`🔗 Zoom ${currentZoom}: Clustering enabled`)
      } else if (!enableClustering && markerClusterer) {
        // Disable clustering
        markerClusterer.clearMarkers()
        setMarkerClusterer(null)
        // Re-add markers individually
        markers.forEach(marker => {
          marker.setMap(mapInstance)
        })
        console.log(`📍 Zoom ${currentZoom}: Individual markers shown`)
      }

      // Handle polyline visibility
      if (showPolylines && polylines.length === 0) {
        // Show polylines - recreate them from current marker positions
        const coordinates: { lat: number, lng: number }[] = []
        markers.forEach(marker => {
          if (marker.getVisible()) {
            const position = marker.getPosition()
            if (position) {
              coordinates.push({
                lat: position.lat(),
                lng: position.lng()
              })
            }
          }
        })
        
        if (coordinates.length >= 2) {
          const polyline = createPolylineForCoordinates(coordinates, selectedDay)
          if (polyline) {
            polyline.setMap(mapInstance)
            setPolylines([polyline])
            console.log(`🛣️  Zoom ${currentZoom}: Polyline shown`)
          }
        }
      } else if (!showPolylines && polylines.length > 0) {
        // Hide polylines
        polylines.forEach(polyline => {
          polyline.setMap(null)
        })
        setPolylines([])
        console.log(`🛣️  Zoom ${currentZoom}: Polyline hidden`)
      }
    }

    // Add zoom change listener
    const listener = mapInstance.addListener('zoom_changed', handleZoomChanged)

    // Cleanup
    return () => {
      if (listener) {
        window.google.maps.event.removeListener(listener)
      }
    }
  }, [mapInstance, markers, markerClusterer, polylines, selectedDay])

  // Auto-fit map to day's activities when selectedDay changes
  useEffect(() => {
    if (!mapInstance || markers.size === 0) return

    // Add a small delay to ensure markers are rendered
    const timeoutId = setTimeout(() => {
      fitMapToDay(selectedDay)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [selectedDay, mapInstance, markers])

  // Handle focused activity
  useEffect(() => {
    if (!mapInstance || !focusedActivityId || !markers.has(focusedActivityId)) return

    const marker = markers.get(focusedActivityId)
    if (marker) {
      // Center map on the marker and zoom in appropriately
      mapInstance.panTo(marker.getPosition())
      mapInstance.setZoom(17)
      
      // Close other info windows
      markers.forEach((m) => {
        if (m.infoWindow) {
          m.infoWindow.close()
        }
      })
      
      // Open the info window for this marker
      if (marker.infoWindow) {
        marker.infoWindow.open(mapInstance, marker)
      }
      
      // Clear focus after animation
      setTimeout(() => {
        if (onActivityFocus) {
          onActivityFocus(null)
        }
      }, 2000)
    }
  }, [focusedActivityId, markers, mapInstance])

  const activitiesWithLocations = getActivitiesWithLocations()

  // Show lazy loading placeholder before user interaction
  if (isVisible && !userHasInteracted) {
    return (
      <div className="content-container-lg">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center py-16">
            <div className="flex flex-col items-center gap-4">
              <span className="i-mdi-map w-16 h-16 text-primary"></span>
              <h3 className="text-xl font-semibold text-base-content/70">Interactive Map Ready</h3>
              <p className="text-base-content/50">
                Click here to load the map and view activity locations for Day {selectedDay + 1}
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => setUserHasInteracted(true)}
              >
                <span className="i-mdi-map-marker w-4 h-4"></span>
                Load Map
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show loading state after user interaction
  if (isLoading) {
    return (
      <div className="content-container-lg">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center py-16">
            <div className="flex flex-col items-center gap-4">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <h3 className="text-xl font-semibold text-base-content/70">Loading Map...</h3>
              <p className="text-base-content/50">
                Setting up Google Maps for activity locations
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show API key configuration message
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === 'your_google_maps_api_key_here') {
    return (
      <div className="content-container-lg">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center py-16">
            <div className="flex flex-col items-center gap-4">
              <span className="i-mdi-key-variant w-16 h-16 text-warning"></span>
              <h3 className="text-xl font-semibold text-base-content/70">Google Maps API Key Required</h3>
              <div className="text-base-content/50 max-w-md">
                <p className="mb-4">To display the map, please add your Google Maps API key to your environment variables:</p>
                <div className="bg-base-200 p-4 rounded-lg text-left text-sm font-mono">
                  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
                </div>
                <p className="mt-4 text-xs">
                  Get your API key from the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="link link-primary">Google Cloud Console</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

          // Show no locations message
        if (activitiesWithLocations.length === 0) {
          return (
            <div className="content-container-lg">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body text-center py-16">
                  <div className="flex flex-col items-center gap-4">
                    <span className="i-mdi-map-marker-off w-16 h-16 text-base-content/30"></span>
                    <h3 className="text-xl font-semibold text-base-content/70">No Locations for Day {selectedDay + 1}</h3>
                    <p className="text-base-content/50">
                      Activities for Day {selectedDay + 1} don't have location information to display on the map. 
                      Try selecting a different day above.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        }

  return (
    <div className="content-container-lg">
                  <div className="card bg-base-100 shadow-xl">
              <div className="card-header p-6 pb-0">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <span className="i-mdi-map w-6 h-6 text-primary"></span>
                  Day {selectedDay + 1} Locations
                  <div className="badge badge-primary badge-sm">{activitiesWithLocations.length}</div>
                </h3>
                <p className="text-sm text-base-content/70 mt-2">
                  Showing activity locations for <strong>Day {selectedDay + 1}</strong>. 
                  Use the day navigation above to switch between days. 
                  Click pins for activity details.
                </p>
              </div>
        <div className="card-body">
          <div 
            ref={mapRef} 
            className="w-full h-96 rounded-lg border border-base-300 shadow-inner"
            style={{ minHeight: '500px' }}
          />
          
          {/* Checkpoint Navigation */}
          {activitiesWithLocations.length > 0 && (
            <div className="mt-4 flex justify-center items-center gap-4 p-4 bg-base-200 rounded-lg">
              {!tourStarted ? (
                /* Start Tour Button */
                <div className="flex flex-col items-center gap-3">
                  <div className="text-center">
                    <h4 className="text-sm font-semibold text-base-content">Ready for a guided tour?</h4>
                    <p className="text-xs text-base-content/60 mt-1">
                      Follow your itinerary step-by-step with {activitiesWithLocations.length} checkpoints
                    </p>
                  </div>
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={startTour}
                  >
                    <span className="i-mdi-play-circle w-5 h-5"></span>
                    Start Tour
                  </button>
                </div>
              ) : (
                /* Normal Checkpoint Navigation */
                <>
                  <button 
                    className={`btn btn-sm ${currentCheckpoint === 0 ? 'btn-disabled' : 'btn-primary'}`}
                    onClick={goToPrevCheckpoint}
                    disabled={currentCheckpoint === 0}
                  >
                    <span className="i-mdi-chevron-left w-4 h-4"></span>
                    Prev Checkpoint
                  </button>
                  
                  <div className="flex items-center gap-2 px-4 py-2 bg-base-100 rounded-lg shadow-inner">
                    <span className="i-mdi-map-marker w-4 h-4 text-primary"></span>
                    <span className="text-sm font-medium">
                      {currentCheckpoint + 1} / {activitiesWithLocations.length}
                    </span>
                    <span className="text-xs text-base-content/60">
                      {activitiesWithLocations[currentCheckpoint]?.title}
                    </span>
                  </div>
                  
                  <button 
                    className={`btn btn-sm ${currentCheckpoint === activitiesWithLocations.length - 1 ? 'btn-disabled' : 'btn-primary'}`}
                    onClick={goToNextCheckpoint}
                    disabled={currentCheckpoint === activitiesWithLocations.length - 1}
                  >
                    Next Checkpoint
                    <span className="i-mdi-chevron-right w-4 h-4"></span>
                  </button>
                </>
              )}
            </div>
          )}
          
          {/* Legend */}
                <div className="mt-4 p-4 bg-base-200 rounded-lg">
                  <h4 className="text-sm font-semibold mb-2">Day {selectedDay + 1} Activity Types</h4>
                  <div className="flex flex-wrap gap-3 text-xs">
                    {Array.from(new Set(activitiesWithLocations.map(a => a.category))).map(category => (
                      <div key={category} className="flex items-center gap-2">
                        <div 
                          className="w-4 h-6 border border-white rounded-b-full shadow-sm relative"
                          style={{ 
                            backgroundColor: getCategoryColor(category),
                            clipPath: 'ellipse(50% 40% at 50% 60%)'
                          }}
                        >
                          <div 
                            className="w-1.5 h-1.5 bg-white rounded-full absolute"
                            style={{ 
                              top: '30%', 
                              left: '50%', 
                              transform: 'translateX(-50%)',
                              opacity: 0.9
                            }}
                          ></div>
                        </div>
                        <span className="capitalize text-base-content/70 font-medium">{category}</span>
                      </div>
                    ))}
                  </div>
                </div>
        </div>
      </div>
    </div>
  )
} 