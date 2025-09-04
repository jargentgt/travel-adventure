import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Navigation } from '@/components/ui/Navigation'
import './globals.css'

export const metadata: Metadata = {
  title: 'Travel Adventures - Discover Amazing Journeys',
  description: 'Explore detailed travel itineraries and get inspired by beautiful destinations around the world.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <script src="/flyonui.js" defer></script>
      </head>
      <body className="bg-base-100 text-base-content min-h-screen">
        {/* Navigation Header */}
        <nav className="navbar bg-base-100 shadow-lg sticky top-0 z-50 rounded-box shadow-base-300/20 shadow-sm">
          <Navigation />
        </nav>

        {/* Main Content */}
        <main>
          {children}
        </main>

        {/* Footer */}
        <footer className="footer footer-center p-10 bg-base-200 text-base-content">
          <div>
            <div className="text-3xl mb-4">✈️</div>
            <p className="font-bold text-lg">
              Travel Adventures
            </p>
            <p className="text-base-content/60">
              Discover amazing journeys and create unforgettable memories
            </p>
          </div>
          <div>
            <div className="grid grid-flow-col gap-4">
              <a className="link link-hover">About</a>
              <a className="link link-hover">Contact</a>
              <a className="link link-hover">Privacy Policy</a>
              <a className="link link-hover">Terms</a>
            </div>
          </div>
          <div>
            <div className="grid grid-flow-col gap-4">
              <a className="btn btn-ghost btn-circle">
                <span className="i-mdi-twitter w-5 h-5"></span>
              </a>
              <a className="btn btn-ghost btn-circle">
                <span className="i-mdi-instagram w-5 h-5"></span>
              </a>
              <a className="btn btn-ghost btn-circle">
                <span className="i-mdi-facebook w-5 h-5"></span>
              </a>
            </div>
          </div>
          <div>
            <p className="text-sm text-base-content/60">
              © 2024 Travel Adventures. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
} 