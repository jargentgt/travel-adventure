import React from 'react'

interface TripTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function TripTabs({ activeTab, onTabChange }: TripTabsProps) {
  const tabs = [
      { id: 'timeline', label: 'Timeline', iconClass: 'i-mdi-timeline-clock' },
  { id: 'gallery', label: 'Gallery', iconClass: 'i-mdi-image-multiple' },
  { id: 'info', label: 'Info', iconClass: 'i-mdi-information' }
  ]

  return (
    <div className="tabs tabs-bordered tabs-lg mb-8 justify-center">
      {tabs.map((tab) => (
        <button 
          key={tab.id}
          className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className={`${tab.iconClass} size-5 mr-2`}></span>
          {tab.label}
        </button>
      ))}
    </div>
  )
} 