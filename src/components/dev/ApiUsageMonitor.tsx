'use client'

import React, { useState, useEffect } from 'react'
import { geocodingCache, ApiUsageMonitor } from '@/utils/geocodingCache'

export function ApiUsageMonitorComponent() {
  const [isOpen, setIsOpen] = useState(false)
  const [usageStats, setUsageStats] = useState<any>(null)
  const [cacheStats, setCacheStats] = useState<any>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  useEffect(() => {
    const loadStats = () => {
      try {
        setUsageStats(ApiUsageMonitor.getUsageStats())
        setCacheStats(geocodingCache.getCacheStats())
      } catch (error) {
        console.warn('Failed to load API usage stats:', error)
      }
    }

    loadStats()
  }, [refreshKey])

  const refresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const clearCache = () => {
    geocodingCache.clearCache()
    refresh()
  }

  const clearUsageData = () => {
    ApiUsageMonitor.clearUsageData()
    refresh()
  }

  const exportCache = () => {
    const cache = geocodingCache.exportCache()
    const dataStr = JSON.stringify(cache, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `geocoding-cache-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="btn btn-circle btn-primary btn-sm shadow-lg"
          title="API Usage Monitor"
        >
          <span className="i-mdi-chart-line w-4 h-4"></span>
        </button>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]
  const thisMonth = today.substring(0, 7)
  
  const todayUsage = usageStats?.daily?.[today] || { geocoding: 0, maps: 0 }
  const monthUsage = usageStats?.monthly?.[thisMonth] || { geocoding: 0, maps: 0 }
  const totalUsage = usageStats?.total || { geocoding: 0, maps: 0 }

  const todayTotal = todayUsage.geocoding + todayUsage.maps
  const monthTotal = monthUsage.geocoding + monthUsage.maps
  const grandTotal = totalUsage.geocoding + totalUsage.maps

  // Estimated costs (rough calculation)
  const estimatedMonthlyCost = (monthUsage.geocoding * 5 + monthUsage.maps * 7) / 1000

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="card bg-base-100 shadow-xl border w-96 max-h-96 overflow-y-auto">
        <div className="card-header p-4 pb-2 flex justify-between items-center">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span className="i-mdi-chart-line w-5 h-5"></span>
            API Monitor
          </h3>
          <div className="flex gap-2">
            <button onClick={refresh} className="btn btn-ghost btn-xs" title="Refresh">
              <span className="i-mdi-refresh w-4 h-4"></span>
            </button>
            <button onClick={() => setIsOpen(false)} className="btn btn-ghost btn-xs">
              <span className="i-mdi-close w-4 h-4"></span>
            </button>
          </div>
        </div>
        
        <div className="card-body p-4 space-y-4">
          {/* Usage Statistics */}
          <div>
            <h4 className="font-semibold text-sm mb-2">📊 API Usage</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="stat bg-base-200 rounded p-2">
                <div className="stat-title text-xs">Today</div>
                <div className="stat-value text-sm">{todayTotal}</div>
                <div className="stat-desc">G:{todayUsage.geocoding} M:{todayUsage.maps}</div>
              </div>
              
              <div className="stat bg-base-200 rounded p-2">
                <div className="stat-title text-xs">This Month</div>
                <div className="stat-value text-sm">{monthTotal}</div>
                <div className="stat-desc">G:{monthUsage.geocoding} M:{monthUsage.maps}</div>
              </div>
              
              <div className="stat bg-base-200 rounded p-2">
                <div className="stat-title text-xs">Total</div>
                <div className="stat-value text-sm">{grandTotal}</div>
                <div className="stat-desc">G:{totalUsage.geocoding} M:{totalUsage.maps}</div>
              </div>
              
              <div className="stat bg-base-200 rounded p-2">
                <div className="stat-title text-xs">Est. Cost</div>
                <div className="stat-value text-sm">${estimatedMonthlyCost.toFixed(2)}</div>
                <div className="stat-desc">This month</div>
              </div>
            </div>
          </div>

          {/* Cache Statistics */}
          {cacheStats && (
            <div>
              <h4 className="font-semibold text-sm mb-2">💾 Cache Stats</h4>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Total Cached:</span>
                  <span className="font-mono">{cacheStats.totalEntries}</span>
                </div>
                <div className="flex justify-between">
                  <span>Google API:</span>
                  <span className="font-mono text-warning">{cacheStats.googleEntries}</span>
                </div>
                <div className="flex justify-between">
                  <span>Extracted:</span>
                  <span className="font-mono text-success">{cacheStats.extractedEntries}</span>
                </div>
                <div className="flex justify-between">
                  <span>Manual:</span>
                  <span className="font-mono">{cacheStats.manualEntries}</span>
                </div>
              </div>
              
              <div className="mt-2">
                <div className="text-xs text-base-content/70">
                  Cache Hit Rate: <span className="font-mono text-success">
                    {cacheStats.totalEntries > 0 ? 
                      Math.round((cacheStats.extractedEntries + cacheStats.manualEntries) / cacheStats.totalEntries * 100) 
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Progress Bars */}
          <div>
            <h4 className="font-semibold text-sm mb-2">📈 Usage Limits</h4>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs">
                  <span>Daily (1000 limit)</span>
                  <span>{todayTotal}/1000</span>
                </div>
                <progress 
                  className={`progress w-full ${todayTotal > 800 ? 'progress-error' : todayTotal > 500 ? 'progress-warning' : 'progress-success'}`}
                  value={todayTotal} 
                  max="1000"
                ></progress>
              </div>
              
              <div>
                <div className="flex justify-between text-xs">
                  <span>Monthly (25k free tier)</span>
                  <span>{monthTotal}/25000</span>
                </div>
                <progress 
                  className={`progress w-full ${monthTotal > 20000 ? 'progress-error' : monthTotal > 12500 ? 'progress-warning' : 'progress-success'}`}
                  value={monthTotal} 
                  max="25000"
                ></progress>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button onClick={exportCache} className="btn btn-ghost btn-xs">
              <span className="i-mdi-download w-3 h-3"></span>
              Export Cache
            </button>
            <button onClick={clearCache} className="btn btn-ghost btn-xs text-warning">
              <span className="i-mdi-trash-can w-3 h-3"></span>
              Clear Cache
            </button>
            <button onClick={clearUsageData} className="btn btn-ghost btn-xs text-error">
              <span className="i-mdi-chart-line-variant w-3 h-3"></span>
              Reset Usage
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 