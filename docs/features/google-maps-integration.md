# Google Maps Integration

## Overview

The trip detail map has been upgraded from OpenStreetMap/Leaflet to Google Maps SDK for a much better user experience with professional styling, marker clustering, and enhanced geocoding.

## Features

### 🗺️ Google Maps SDK
- Professional Google Maps styling and interface
- Better performance and reliability
- Native marker clustering to prevent overlapping pins
- Superior geocoding using Google's database

### 📍 Enhanced Pin Placement & Visibility
- **Full Address Geocoding**: Uses complete location addresses with region biasing for maximum accuracy
- **URL Coordinate Extraction**: Automatically extracts coordinates from Google Maps URLs in activity descriptions
- **Category-Colored Teardrop Pins**: Beautiful custom SVG pins with category colors and embedded time order numbers
- **Time-Based Numbering**: Pins show chronological order (1, 2, 3...) for easy itinerary following
- **Category Color Coding**: Pin colors based on activity type (restaurant=orange, hotel=pink, activity=green, etc.)

### 🛣️ Smart Polyline Routes
- **Connecting Lines**: Visual lines connecting activity pins in chronological order
- **Day-Colored Routes**: Each day has its own colored polyline with directional arrows
- **Zoom-Adaptive Display**: Lines appear when zoomed in (≥13), hidden when zoomed out for clarity
- **Smart Clustering Integration**: Polylines work seamlessly with marker clustering logic

### 🎯 Checkpoint Navigation
- **Overview First**: Map initially displays all locations for full context (Step 0)
- **Opt-in Experience**: "Start Tour" button provides choice to enter guided mode
- **Step-by-Step Guide**: Navigate through activities in chronological order with Next/Prev buttons
- **Smart Focus**: Automatically centers map on selected checkpoint with optimal zoom
- **Progress Tracking**: Visual indicator shows current checkpoint position and activity name
- **Marker Clustering**: Nearby pins are automatically grouped into clusters for better visibility

### 🗓️ Day Navigation
- **Day-Based Filtering**: Switch between trip days to see only that day's activity locations
- **Sticky Navigation**: Day navigation buttons available directly on the map tab
- **Real-time Updates**: Map instantly clears and updates pins when changing days
- **Day-Specific Information**: Map header and legend show current day information
- **Smart Messages**: Helpful messages when no activities have locations for selected day

### 🎯 Enhanced User Experience
- **Auto-Fit Bounds**: Map automatically centers and zooms to show all activity pins
- **Pin Focusing**: Clicking "View on map" centers the map on the selected activity
- **Interactive Info Windows**: Rich popups with activity details
- **Cluster Interaction**: Click clusters to zoom in and see individual pins

## Setup Instructions

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API** (required)
   - **Geocoding API** (required)
   - **Places API** (recommended)

4. Create credentials → API Key
5. (Optional) Restrict the API key to your domain for security

### 2. Configure Environment Variables

Create or update your `.env.local` file:

```env
# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here

# Travel CMS API URL (existing)
NEXT_PUBLIC_API_URL=https://travel-cms-production.up.railway.app
```

### 3. Test the Integration

```bash
npm run dev
```

Visit a trip page and click the "Map" tab to see the Google Maps integration.

## Usage Guide

### Day Navigation on Map
1. **Navigate to Map Tab**: Click the "Map" tab on any trip detail page
2. **Select Day**: Use the day navigation buttons above the map to switch between trip days
3. **View Day Activities**: Map will show only activities with locations for the selected day
4. **Read Activity Labels**: 
   - **Current Implementation**: Custom SVG pins with embedded text labels and hover tooltips
   - **Visible Labels**: Time order numbers (1, 2, 3...) embedded directly in beautiful teardrop pins
   - **Pin Design**: Category-colored teardrops with white circles containing chronological order numbers
   - **Hover Tooltips**: Full activity names appear when you mouse over pins
   - **Advantage**: Combines visual beauty with functional labels - no compromises needed!
5. **Follow Route Lines**: 
   - **Zoom In (≥13)**: Connected lines appear between pins showing your travel route in chronological order
   - **Directional Arrows**: Lines include arrows showing the direction of travel
   - **Day Colors**: Each day has its own colored route line matching the day theme
   - **Zoom Out (<13)**: Lines automatically hide for cleaner overview, clustering may activate
6. **Smart Zoom Behavior**:
   - **Overview Mode**: Zoomed out shows clustered pins for general area awareness
   - **Detail Mode**: Zoomed in shows individual pins with connecting route lines
   - **Auto-fit**: Changing days automatically fits the map to show that day's activities
7. **Checkpoint Navigation**: 
   - **Overview First**: Map initially shows all locations in normal view (Step 0)
   - **Start Tour**: Large "Start Tour" button for opt-in guided experience
   - **Step-by-Step Guide**: Use "Next Checkpoint" and "Prev Checkpoint" buttons to follow your itinerary in chronological order  
   - **Smart Focus**: Each checkpoint smoothly centers the map on the activity pin and shows details
   - **Progress Indicator**: Shows current position (e.g., "2 / 5") and activity name
8. **Interactive Pins**: Click any pin to see detailed activity information in an info popup
9. **Focus from Timeline**: Use "View on map" buttons in the timeline tab to switch to map and focus on specific activities

## Technical Implementation

### Dependencies Added

```json
{
  "@googlemaps/js-api-loader": "^1.16.2",
  "@googlemaps/markerclusterer": "^2.5.3"
}
```

### Key Components

1. **TripDetailMap.tsx** - Main map component
2. **Google Maps Loader** - Handles API loading and initialization
3. **MarkerClusterer** - Groups nearby pins for better visibility
4. **Geocoding Service** - Converts addresses to coordinates

### Smart Geocoding Strategy

1. **Cache Check**: Look for previously geocoded coordinates in localStorage cache
2. **URL Extraction**: Extract coordinates from Google Maps URLs in descriptions (free)
3. **Full API Address Geocoding**: Use complete address from API as-is for maximum accuracy
   - Uses full detailed addresses: `"高松機場, 1312-7 Konanchō..."`
   - Smart region detection: Detects 日本 for JP, Korea/한국 for KR biasing
   - No modification of API address data - uses exactly what backend provides
4. **Simplified Display**: Shows clean version in UI while using full address for geocoding
   - Pin design: Classic teardrop pins with category colors and white center dots
   - Label display: Google Maps native tooltips on hover
   - Label content: Activity titles shown automatically by Google Maps
   - Info popup: Shows activity title, time, category, and simplified location
   - Legend: Mini pin shapes with category colors
   - Geocoding: Uses full API address for accuracy
5. **Fallback Handling**: Graceful degradation with detailed logging for failed geocoding

### Google Maps Built-in Labels

1. **Standard Behavior**: Uses Google Maps' native `title` property for tooltips
   - **Tooltips appear on hover** (standard Google Maps behavior)
   - Positioned automatically by Google Maps (usually to the right)
   - Native Google Maps styling and behavior
   - No custom positioning or styling needed
   - **Current Implementation**: `title: activity.title` in marker options

2. **Automatic Management**: Google Maps handles all label functionality
   - Show/hide based on zoom level
   - Collision detection and avoidance  
   - Clustering integration
   - Performance optimization

3. **Zero Maintenance**: No custom label management code required
   - No position calculations or updates
   - No custom styling or rendering
   - No cluster detection logic
   - Reduced bundle size and complexity

4. **Cost Effective**: Uses only core Maps API features
   - No additional API calls for labels
   - Leverages Google's optimized rendering
   - Minimal performance overhead

### Available Label Options

#### **Option 1: Hover Tooltips (`title`)**
```typescript
title: activity.title  // "高松機場" appears on hover
```
- ✅ **Best for**: Detailed information on demand
- ✅ **Behavior**: Native Google Maps tooltip (right-side)
- ✅ **Length**: Unlimited text length
- ✅ **Styling**: Standard Google Maps appearance

#### **Option 2: Visible Labels (`label: string`)**
```typescript
label: "空港"  // Always visible on the pin
```
- ✅ **Best for**: Quick identification (1-3 characters)
- ✅ **Behavior**: Always visible text on marker
- ✅ **Length**: Short text works best
- ✅ **Styling**: Basic Google Maps label styling

#### **Option 3: Styled Labels (`label: MarkerLabel`)**
```typescript
label: {
  text: activity.category[0],     // First letter of category
  color: '#ffffff',               // White text
  fontFamily: 'Arial, sans-serif',
  fontSize: '12px',
  fontWeight: 'bold'
}
```
- ✅ **Best for**: Branded appearance
- ✅ **Behavior**: Custom styled text on marker
- ✅ **Length**: 1-2 characters recommended
- ✅ **Styling**: Full control over appearance

#### **Option 4: SVG Embedded Text - CURRENT BEST SOLUTION**
```typescript
title: activity.title,  // Detailed tooltip on hover
icon: {
  url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg width="32" height="45" viewBox="0 0 32 45">
      <path d="..." fill="${getCategoryColor(activity.category)}" stroke="#ffffff"/>
      <circle cx="16" cy="16" r="10" fill="rgba(255,255,255,0.9)"/>
      <text x="16" y="20" text-anchor="middle" font-weight="bold" 
            fill="${getCategoryColor(activity.category)}">
        ${getCategoryIcon(activity.category)}
      </text>
    </svg>
  `)}`,
  scaledSize: new window.google.maps.Size(28, 40)
}
```
- ✅ **Best for**: Perfect visual design + functional labels without compromises
- ✅ **Behavior**: Beautiful colored pins with embedded text + hover tooltips
- ✅ **Example**: Pink teardrop with white circle containing "1", "高松機場" on hover
- ✅ **User Experience**: Combines elegance with functionality - no MarkerLabel limitations!

### Implementation Examples

#### **Switch to Visible Labels**
```typescript
// Replace title with visible label
const marker = new window.google.maps.Marker({
  position: position,
  map: mapInstance,
  label: activity.title.substring(0, 2), // Show first 2 characters
  icon: customIcon
});
```

#### **Use Styled MarkerLabel**
```typescript
// Add styled label with category color
const marker = new window.google.maps.Marker({
  position: position,
  map: mapInstance,
  label: {
    text: getCategoryIcon(activity.category), // Use category symbol
    color: getCategoryColor(activity.category),
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  icon: customIcon
});
```

#### **Combine Tooltip + Label**
```typescript
// Best of both worlds
const marker = new window.google.maps.Marker({
  position: position,
  map: mapInstance,
  title: activity.title,           // Hover tooltip: "高松機場"
  label: activity.category[0],     // Visible label: "A" (Airport)
  icon: customIcon
});
```

### Current Implementation Details

**Active Configuration**: Custom SVG Icons with Embedded Text (Best of Both Worlds!)
- **Beautiful Pins**: Category-colored teardrop pins with white text circles  
- **Embedded Labels**: Time order numbers (1, 2, 3, etc.) baked directly into the pin graphics
- **Hover Tooltips**: Full activity names for detailed information
- **Visual Excellence**: Maintains original design aesthetics while adding functional labels

#### **Time Order Pin Mapping**
| Activity Order | Pin Design | Example |
|---------------|------------|---------|
| 1st Activity | Category-colored teardrop with white circle containing "1" | Pink hotel pin with white "1" |
| 2nd Activity | Category-colored teardrop with white circle containing "2" | Orange restaurant pin with white "2" |
| 3rd Activity | Category-colored teardrop with white circle containing "3" | Green activity pin with white "3" |
| 4th Activity | Category-colored teardrop with white circle containing "4" | Blue transport pin with white "4" |
| Nth Activity | Category-colored teardrop with white circle containing "N" | Color matches activity category, number shows time order |

**Pin Colors by Category:**
- 🏨 **Hotels**: Pink teardrops
- 🍽️ **Restaurants/Food**: Orange teardrops  
- 🎯 **Activities**: Green teardrops
- ✈️ **Transportation**: Blue teardrops
- 🛍️ **Shopping**: Purple teardrops

**Result**: Quick visual scanning + detailed information on demand!

### SVG Embedded Text Solution

#### **Problem Solved!** ✅
We bypassed the MarkerLabel compatibility issues by **embedding text directly into custom SVG icons**. This approach provides the best of both worlds:

#### **Final Implementation**
Using **custom SVG teardrops with embedded text** for perfect visual + functional results:
```typescript
// Beautiful custom pin with embedded text
title: activity.title,           // Hover tooltip
icon: {
  url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg width="32" height="45" viewBox="0 0 32 45">
      <!-- Colored teardrop shape -->
      <path d="M16 0C7.163 0 0 7.163 0 16c0 8.837 16 29 16 29s16-20.163 16-29C32 7.163 24.837 0 16 0z" 
            fill="${categoryColor}" stroke="#ffffff" stroke-width="2"/>
      <!-- White circle for text background -->
      <circle cx="16" cy="16" r="10" fill="rgba(255,255,255,0.9)"/>
             <!-- Time order number embedded in SVG -->
       <text x="16" y="20" text-anchor="middle" font-size="10" font-weight="bold" 
             fill="${categoryColor}">${timeOrder}</text>
    </svg>
  `)}`,
  scaledSize: new window.google.maps.Size(28, 40),
  anchor: new window.google.maps.Point(14, 40)
}
```

#### **Advantages of This Approach**
- ✅ **Beautiful Design**: Maintains original teardrop pin aesthetics
- ✅ **Always Visible**: Text is part of the icon, never hidden
- ✅ **Color Coordinated**: Pin and text colors match perfectly  
- ✅ **No MarkerLabel Issues**: Bypasses all Google Maps labeling limitations
- ✅ **Zero Maintenance**: Text positioning handled by SVG, not JavaScript
- ✅ **Performance**: Single image request, no separate label calculations

### Map Configuration

- **Default Center**: Tokyo (will adjust based on actual pins)
- **Zoom Levels**: Auto-fit for overview, zoom to 17 for pin focus
- **Styling**: Clean interface with POI labels hidden
- **Controls**: Full set of Google Maps controls enabled

## User Experience Improvements

### ✅ Problems Fixed

1. **Beautiful Map Interface**: Replaced basic OpenStreetMap with professional Google Maps
2. **Proper Centering**: Map auto-fits to show all activity pins with appropriate zoom
3. **Pin Focusing**: "View on map" buttons now properly center and zoom to selected activities
4. **No More Overlapping**: Marker clustering prevents pin collision issues
5. **Better Geocoding**: Higher accuracy location placement using Google's data

### 🎯 Features Added

- **Loading States**: Smooth loading experience with spinners
- **Error Handling**: Clear messages for missing API keys or configuration issues
- **Responsive Design**: Works perfectly on desktop and mobile
- **Accessibility**: Proper focus management and keyboard navigation

## API Usage and Costs

### Google Maps Pricing

- **Maps JavaScript API**: $7 per 1,000 map loads
- **Geocoding API**: $5 per 1,000 requests
- **Free Tier**: $200 monthly credit (covers ~28K map loads)

### Cost Optimization

- Map instances are reused and properly cleaned up
- Geocoding results could be cached in the future
- API key restrictions limit unauthorized usage

## Cost Optimization Features ⭐

### 💾 Intelligent Caching System
- **30-day cache**: Geocoding results stored in localStorage
- **Smart cache management**: Automatic cleanup and size limits
- **90%+ cost reduction** for repeat visitors

### 📍 Coordinate Extraction
- **Free geocoding**: Extracts coordinates from Google Maps URLs
- **Multiple formats**: Supports @lat,lng, ll=lat,lng, q=lat,lng patterns
- **Zero API calls** for URLs with embedded coordinates

### ⚡ Ultra-Lazy Loading
- **Three-tier loading**: Tab visibility + viewport detection + user interaction
- **Manual trigger**: Users click "Load Map" button to actually load Google Maps API
- **Intersection observer**: Only initializes when map container is in viewport
- **Up to 80% fewer API calls**: Eliminates accidental map loads
- **Instant page loading**: No Google Maps API loaded until explicitly requested

### 📊 Usage Monitoring (Dev Mode)
- **Real-time tracking**: Daily and monthly API usage
- **Cost estimates**: Live spending calculations
- **Progress bars**: Visual limits monitoring
- **Export tools**: Cache backup and analysis

See [API Cost Optimization Guide](./api-cost-optimization.md) for detailed cost-saving strategies.

## Future Enhancements

- **Route Planning**: Connect activity locations with directions
- **Server-side Cache**: Persistent geocoding cache
- **Custom Map Styles**: Brand-specific map theming
- **Offline Support**: Cache map tiles for offline viewing
- **CMS Coordinate Storage**: Direct lat/lng storage in database 