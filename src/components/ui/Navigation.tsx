'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function Navigation() {
  const pathname = usePathname()
  const scrollToTravelMap = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const element = document.getElementById('travel-map')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToTripListing = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const element = document.getElementById('trip-listing')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Fallback toggle functionality in case FlyonUI script doesn't load
  useEffect(() => {
    const toggleButton = document.querySelector('[data-collapse="#navbar-collapse"]')
    const collapseElement = document.getElementById('navbar-collapse')
    
    if (toggleButton && collapseElement) {
      const handleToggle = () => {
        collapseElement.classList.toggle('hidden')
      }
      
      toggleButton.addEventListener('click', handleToggle)
      
      return () => {
        toggleButton.removeEventListener('click', handleToggle)
      }
    }
  }, [])

  return (
    <div className="w-full md:flex md:items-center md:gap-2">
      <div className="flex items-center justify-between">
        <div className="navbar-start items-center justify-between max-md:w-full">
          <Link href="/" className="link text-base-content link-neutral text-xl font-bold no-underline whitespace-nowrap">
            Travel Adventures
          </Link>
          <div className="md:hidden">
            <button 
              type="button" 
              className="collapse-toggle btn btn-outline btn-secondary btn-sm btn-square" 
              data-collapse="#navbar-collapse" 
              aria-controls="navbar-collapse" 
              aria-label="Toggle navigation"
            >
                          <span className="i-mdi-menu collapse-open:hidden w-4 h-4"></span>
            <span className="i-mdi-close collapse-open:block hidden w-4 h-4"></span>
            </button>
          </div>
        </div>
      </div>
      <div 
        id="navbar-collapse" 
        className="md:navbar-end collapse hidden grow basis-full overflow-hidden transition-[height] duration-300 max-md:w-full"
      >
        <ul className="menu md:menu-horizontal gap-2 p-0 text-base max-md:mt-2">
          <li>
            {pathname === '/' ? (
              <a href="#trip-listing" onClick={scrollToTripListing}>
                All Trips
              </a>
            ) : (
              <Link href="/#trip-listing">
                All Trips
              </Link>
            )}
          </li>
          <li>
            {pathname === '/' ? (
              <a href="#travel-map" onClick={scrollToTravelMap}>
                Travel Map
              </a>
            ) : (
              <Link href="/#travel-map">
                Travel Map
              </Link>
            )}
          </li>
        </ul>
      </div>
    </div>
  )
} 