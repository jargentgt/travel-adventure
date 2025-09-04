import React from 'react'

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'
  type?: 'spinner' | 'dots' | 'ring' | 'ball' | 'bars' | 'infinity'
  className?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'primary', 
  type = 'spinner',
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClass = size !== 'md' ? `loading-${size}` : ''
  const colorClass = `text-${color}`
  const typeClass = `loading-${type}`
  
  return (
    <span 
      className={`loading ${typeClass} ${sizeClass} ${colorClass} ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}

interface LoadingScreenProps {
  message?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'
  type?: 'spinner' | 'dots' | 'ring' | 'ball' | 'bars' | 'infinity'
}

export function LoadingScreen({ 
  message = 'Loading...', 
  size = 'lg',
  color = 'primary',
  type = 'spinner'
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size={size} color={color} type={type} className="mb-4" />
        <p className="text-base-content/70 text-lg font-medium">{message}</p>
      </div>
    </div>
  )
}

interface LoadingOverlayProps {
  message?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'
  type?: 'spinner' | 'dots' | 'ring' | 'ball' | 'bars' | 'infinity'
}

export function LoadingOverlay({ 
  message,
  size = 'lg',
  color = 'primary',
  type = 'spinner'
}: LoadingOverlayProps) {
  return (
    <div className="absolute inset-0 bg-base-100/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center bg-base-100 p-6 rounded-lg shadow-lg">
        <LoadingSpinner size={size} color={color} type={type} className="mb-4" />
        {message && (
          <p className="text-base-content/70 text-sm font-medium">{message}</p>
        )}
      </div>
    </div>
  )
} 