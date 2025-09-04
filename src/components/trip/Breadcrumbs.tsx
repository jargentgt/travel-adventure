import React from 'react'
import Link from 'next/link'
import { Trip } from '@/types/trip'

interface BreadcrumbsProps {
  trip: Trip
}

export function Breadcrumbs({ trip }: BreadcrumbsProps) {
  return (
    <div className="bg-base-200/50 border-b border-base-300/50">
      <div className="section-container">
        <nav className="flex items-center space-x-2 text-sm text-base-content/70">
          <Link href="/" className="flex items-center hover:text-primary transition-colors">
            <span className="i-mdi-home w-4 h-4 mr-1"></span>
            Home
          </Link>
          
          <span className="text-base-content/40">/</span>
          
          <Link href="/" className="hover:text-primary transition-colors">
            Trips
          </Link>
          
          <span className="text-base-content/40">/</span>
          
          <span className="text-primary font-medium truncate max-w-md">
            {trip.title}
          </span>
        </nav>
      </div>
    </div>
  )
} 