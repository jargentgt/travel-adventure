import React, { useState } from 'react'
import { Activity } from '@/types/trip'
import { formatLinksInText } from '@/utils/linkFormatter'

interface TimelineItemProps {
  activity: Activity
  index: number
  isShifted: boolean
}

// Helper functions for description formatting  
const getCategoryIcon = (category: Activity['category']) => {
  const icons = {
    airport: '<span class="i-mdi-airplane w-3 h-3 inline-block"></span>',
    hotel: '<span class="i-mdi-bed w-3 h-3 inline-block"></span>',
    driving: '<span class="i-mdi-car w-3 h-3 inline-block"></span>',
    transport: '<span class="i-mdi-bus w-3 h-3 inline-block"></span>',
    cafe: '<span class="i-mdi-coffee w-3 h-3 inline-block"></span>',
    restaurant: '<span class="i-mdi-silverware-fork-knife w-3 h-3 inline-block"></span>',
    shopping: '<span class="i-mdi-shopping w-3 h-3 inline-block"></span>',
    activity: '<span class="i-mdi-star w-3 h-3 inline-block"></span>'
  }
  return icons[category] || '<span class="i-mdi-circle w-3 h-3 inline-block"></span>'
}

// Get timeline marker icon based on category
const getTimelineIcon = (category: Activity['category']) => {
  const iconClasses = {
    airport: 'i-mdi-airplane w-4 h-4',
    hotel: 'i-mdi-bed w-4 h-4', 
    driving: 'i-mdi-car w-4 h-4',
    transport: 'i-mdi-bus w-4 h-4',
    cafe: 'i-mdi-coffee w-4 h-4',
    restaurant: 'i-mdi-silverware-fork-knife w-4 h-4',
    shopping: 'i-mdi-shopping w-4 h-4',
    activity: 'i-mdi-star w-4 h-4'
  }
  return iconClasses[category] || 'i-mdi-circle w-4 h-4'
}

// Helper function to remove category tags from description
const removeCategoryTags = (description: string): string => {
  if (!description) return description
  
  // Remove [category] pattern from the beginning of the first line
  const lines = description.split('\n')
  if (lines.length > 0) {
    // Remove [category] pattern at the start of the first line
    lines[0] = lines[0].replace(/^\s*[\[「][^\]」]+[\]」]\s*/, '');
  }
  
  // Join back and remove any empty lines at the beginning
  return lines.join('\n').replace(/^\s*\n+/, '')
}

const formatDescription = (description: string, category: Activity['category']) => {
  if (!description) return description

  // First, remove category tags
  const cleanDescription = removeCategoryTags(description)
  if (!cleanDescription.trim()) return ''

  // Process links BEFORE adding HTML formatting to prevent <br/> from being included in URLs
  const cleanDescriptionWithLinks = formatLinksInText(cleanDescription)

  // Just add one icon at the beginning based on activity category
  const icon = getCategoryIcon(category)
  
  // Convert multi-line descriptions to bullet points without individual icons
  const lines = cleanDescriptionWithLinks.split('\n').filter(line => line.trim())
  
  if (lines.length <= 1) {
    // Single line - add category icon prefix
    return `${icon} ${cleanDescriptionWithLinks}`
  }

  // Multiple lines - add category icon at start, then bullet points
  const bulletPoints = lines.map(line => {
    const trimmedLine = line.trim()
    if (!trimmedLine) return ''
    return `• ${trimmedLine}`
  }).join('<br/>')
  
  return `${icon} <br/>${bulletPoints}`
}

export function TimelineItem({ activity, index, isShifted }: TimelineItemProps) {
  const formattedDescription = activity.description ? formatDescription(activity.description, activity.category) : ''
  
  // Count actual content lines and check length (before HTML formatting)
  const cleanDescription = activity.description ? removeCategoryTags(activity.description) : ''
  const contentLines = cleanDescription.split('\n').filter(line => line.trim())
  const isMultiLine = contentLines.length > 3
  const isSingleLongLine = contentLines.length <= 3 && cleanDescription.length > 200
  const shouldTruncate = isMultiLine || isSingleLongLine
  
  // Create truncated version
  const truncatedDescription = shouldTruncate
    ? (() => {
        if (isMultiLine) {
          // Multiple lines: show first 3 lines
          const first3Lines = contentLines.slice(0, 3).join('\n')
          return formatDescription(first3Lines, activity.category)
        } else if (isSingleLongLine) {
          // Single long line: truncate to 200 characters
          const truncatedText = cleanDescription.substring(0, 200) + '...'
          return formatDescription(truncatedText, activity.category)
        }
        return formattedDescription
      })()
    : formattedDescription

  const getCategoryBadgeColor = (category: Activity['category']) => {
    const colors = {
      airport: 'badge-info',        // Blue - Aviation theme
      hotel: 'badge-success',       // Green - Accommodation/Nature
      driving: 'badge-warning',     // Orange - Energy/Movement
      transport: 'bg-cyan-500 text-white border-cyan-500',  // Cyan - Public transport
      cafe: 'bg-amber-700 text-white border-amber-700',     // Brown - Coffee theme
      restaurant: 'badge-error',    // Red - Food/Dining
      shopping: 'badge-secondary',  // Purple - Luxury/Retail
      activity: 'bg-indigo-500 text-white border-indigo-500' // Indigo - Recreation
    }
    return colors[category] || 'badge-ghost'
  }

  const getCategoryBackgroundColor = (category: Activity['category']) => {
    const backgroundColors = {
      airport: 'bg-gradient-to-br from-blue-50/80 to-sky-50/60',           // Blue tones
      hotel: 'bg-gradient-to-br from-green-50/80 to-emerald-50/60',       // Green tones
      driving: 'bg-gradient-to-br from-orange-50/80 to-amber-50/60',      // Orange tones
      transport: 'bg-gradient-to-br from-cyan-50/80 to-teal-50/60',       // Cyan tones
      cafe: 'bg-gradient-to-br from-amber-50/80 to-yellow-100/60',        // Coffee/Brown tones
      restaurant: 'bg-gradient-to-br from-red-50/80 to-rose-50/60',       // Red tones
      shopping: 'bg-gradient-to-br from-purple-50/80 to-violet-50/60',    // Purple tones
      activity: 'bg-gradient-to-br from-indigo-50/80 to-blue-100/60'      // Indigo tones
    }
    return backgroundColors[category] || 'bg-gradient-to-br from-gray-50/60 to-white/40'
  }

  const getCardClasses = (activityType: Activity['type'], category: Activity['category']) => {
    const categoryBg = getCategoryBackgroundColor(category)
    
    if (activityType === 'rain_plan') {
      return `card rain-plan-card ${categoryBg} backdrop-blur-sm border border-blue-200/30 shadow-lg relative overflow-hidden`
    }
    return `card ${categoryBg} shadow-md relative`
  }

  const getRainPlanIndicator = () => {
    if (activity.type === 'rain_plan') {
      return (
        <div className="absolute top-3 right-3 flex items-center gap-1">
          <div className="badge badge-info badge-sm px-2 py-1 rain-plan-badge">
            <span className="text-xs">🌧️</span>
            <span className="ml-1 text-xs font-medium">Rain Plan</span>
          </div>
        </div>
      )
    }
    return null
  }

  const getCategoryBadge = () => {
    return (
      <div className={`absolute top-3 ${activity.type === 'rain_plan' ? 'right-20' : 'right-3'} z-10`}>
        <div className={`badge ${getCategoryBadgeColor(activity.category)} badge-sm`}>
          {activity.category}
        </div>
      </div>
    )
  }

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(activity.location || '')
    } catch (err) {
      console.error('Failed to copy address:', err)
      const textArea = document.createElement('textarea')
      textArea.value = activity.location || ''
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
  }

  const handleShowMore = (event: React.MouseEvent<HTMLButtonElement>) => {
    const side = isShifted ? 'left' : 'right'
    const preview = document.getElementById(`preview-${side}-${index}`)
    const full = document.getElementById(`full-${side}-${index}`)
    const button = event.target as HTMLButtonElement

    if (full?.classList.contains('hidden')) {
      preview?.classList.add('hidden')
      full?.classList.remove('hidden')
      button.textContent = 'Show less'
    } else {
      preview?.classList.remove('hidden')
      full?.classList.add('hidden')
      button.textContent = 'Show more'
    }
  }

  return (
    <li className={isShifted ? 'timeline-shift' : ''}>
      {/* Timeline marker */}
      <div className="timeline-middle h-8">
        <span className={`${
          activity.type === 'rain_plan' 
            ? 'rain-plan-marker bg-gradient-to-br from-blue-100/80 to-slate-100/80 border-2 border-blue-200/50 backdrop-blur-sm' 
            : 'bg-primary/20'
        } flex size-8 items-center justify-center rounded-full`}>
          {activity.type === 'rain_plan' ? (
            <span className="text-lg">🌧️</span>
          ) : (
            <span className={getTimelineIcon(activity.category)}></span>
          )}
        </span>
      </div>

      {/* Time (positioned close to center) */}
      {isShifted ? (
        <div className="timeline-end timeline-time-right">
          <div className="text-base-content/50 text-sm font-normal">{activity.time}</div>
        </div>
      ) : (
        <div className="timeline-start timeline-time-left">
          <div className="text-base-content/50 text-sm font-normal">{activity.time}</div>
        </div>
      )}

      {/* Content (alternates sides) */}
      {isShifted ? (
        <div className="timeline-start me-4 mb-8">
          <div className={getCardClasses(activity.type, activity.category)}>
            {getRainPlanIndicator()}
            {getCategoryBadge()}
            <div className="card-body gap-4">
              <h5 className="card-title text-lg pr-20">{activity.title}</h5>
              
              {activity.location && (
                <div className="flex items-center gap-2 text-sm text-base-content/70">
                  <span className="i-mdi-map-marker w-4 h-4"></span>
                  <a 
                    href={`https://maps.google.com/?q=${encodeURIComponent(activity.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-primary hover:text-primary-focus"
                  >
                    {activity.location?.split(',')[0] || activity.location}
                  </a>
                  <button
                    className="btn btn-ghost btn-xs text-base-content/60 hover:text-primary"
                    onClick={handleCopyAddress}
                    title="Copy full address"
                  >
                    <span className="i-mdi-content-copy w-3 h-3"></span>
                  </button>
                </div>
              )}

              {activity.description && (
                <div>
                  <span 
                    id={`preview-left-${index}`}
                    dangerouslySetInnerHTML={{
                      __html: truncatedDescription
                    }}
                  />
                  {shouldTruncate && (
                    <>
                      <span 
                        id={`full-left-${index}`} 
                        className="hidden"
                        dangerouslySetInnerHTML={{
                          __html: formattedDescription
                        }}
                      />
                      <button 
                        className="btn btn-primary btn-xs ml-2"
                        onClick={handleShowMore}
                      >
                        Show more
                      </button>
                    </>
                  )}
                </div>
              )}

              {((activity as any).cost || activity.type === 'rain_plan') && (
                <div className="flex flex-wrap items-center gap-2">
                  {activity.type === 'rain_plan' && (
                    <div className="badge badge-info badge-sm rain-plan-badge">
                      🌧️ Rain Plan
                    </div>
                  )}
                  {(activity as any).cost && (
                    <div className="badge badge-outline badge-sm">
                      Cost: ${(activity as any).cost}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="timeline-end ms-4 mb-8">
          <div className={getCardClasses(activity.type, activity.category)}>
            {getRainPlanIndicator()}
            {getCategoryBadge()}
            <div className="card-body gap-4">
              <h5 className="card-title text-lg pr-20">{activity.title}</h5>
              
              {activity.location && (
                <div className="flex items-center gap-2 text-sm text-base-content/70">
                  <span className="i-mdi-map-marker w-4 h-4"></span>
                  <a 
                    href={`https://maps.google.com/?q=${encodeURIComponent(activity.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-primary hover:text-primary-focus"
                  >
                    {activity.location?.split(',')[0] || activity.location}
                  </a>
                  <button
                    className="btn btn-ghost btn-xs text-base-content/60 hover:text-primary"
                    onClick={handleCopyAddress}
                    title="Copy full address"
                  >
                    <span className="i-mdi-content-copy w-3 h-3"></span>
                  </button>
                </div>
              )}

              {activity.description && (
                <div>
                  <span 
                    id={`preview-right-${index}`}
                    dangerouslySetInnerHTML={{
                      __html: truncatedDescription
                    }}
                  />
                  {shouldTruncate && (
                    <>
                      <span 
                        id={`full-right-${index}`} 
                        className="hidden"
                        dangerouslySetInnerHTML={{
                          __html: formattedDescription
                        }}
                      />
                      <button 
                        className="btn btn-primary btn-xs ml-2"
                        onClick={handleShowMore}
                      >
                        Show more
                      </button>
                    </>
                  )}
                </div>
              )}

              {((activity as any).cost || activity.type === 'rain_plan') && (
                <div className="flex flex-wrap items-center gap-2">
                  {activity.type === 'rain_plan' && (
                    <div className="badge badge-info badge-sm rain-plan-badge">
                      🌧️ Rain Plan
                    </div>
                  )}
                  {(activity as any).cost && (
                    <div className="badge badge-outline badge-sm">
                      Cost: ${(activity as any).cost}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <hr />
    </li>
  )
} 