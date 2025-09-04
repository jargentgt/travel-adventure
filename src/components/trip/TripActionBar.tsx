import React from 'react'

export function TripActionBar() {
  return (
    <div className="bg-base-100 border-b border-base-300">
      <div className="section-container">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <div className="tooltip" data-tip="Download itinerary">
              <button className="btn btn-outline btn-sm">
                <span className="i-mdi-download w-4 h-4"></span>
                Download
              </button>
            </div>
            <div className="tooltip" data-tip="Share trip">
              <button className="btn btn-outline btn-sm">
                <span className="i-mdi-share-variant w-4 h-4"></span>
                Share
              </button>
            </div>
            <div className="tooltip" data-tip="Print friendly">
              <button className="btn btn-outline btn-sm">
                <span className="i-mdi-printer w-4 h-4"></span>
                Print
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
} 