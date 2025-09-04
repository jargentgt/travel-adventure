// Short date formatting utility
export const formatShortDate = (dateString: string) => {
  const date = new Date(dateString)
  const day = date.getDate()
  const month = date.toLocaleDateString('en-US', { month: 'short' })
  const year = date.getFullYear()
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' })
  
  return `${day} ${month} ${year} (${weekday})`
}

// Format date range
export const formatDateRange = (startDate: string, endDate: string) => {
  const start = formatShortDate(startDate)
  const end = formatShortDate(endDate)
  
  // If same date, show only once
  if (startDate === endDate) {
    return start
  }
  
  return `${start} - ${end}`
}

// Backwards compatibility - keep the old format for specific cases if needed
export const formatLongDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
} 