# PMT Loading State Components

This directory contains skeleton loader components for the PMT (Supplementary Feeding Program) tracking feature.

## Components

### CalendarSkeleton
A loading placeholder for the PMT calendar component with grid placeholders.

**Usage:**
```jsx
import CalendarSkeleton from './CalendarSkeleton';

// Used automatically in PMTCalendar when loading
<PMTCalendar childId={childId} />
```

**Features:**
- Shows skeleton for calendar header with navigation
- Displays 7-column grid for week days
- Shows 5 rows of calendar day cells (35 total)
- Includes legend section at the bottom

### StatsSkeleton
A loading placeholder for the PMT statistics card component.

**Usage:**
```jsx
import StatsSkeleton from './StatsSkeleton';

// Used automatically in PMTStatsCard when loading
<PMTStatsCard childId={childId} />
```

**Features:**
- Shows skeleton for header with icon and title
- Displays compliance rate section with progress bar
- Shows 3-column grid for stats (consumed, partial, refused)
- Includes insight message placeholder

### TodayStatusSkeleton
A loading placeholder for the today's PMT status card component.

**Usage:**
```jsx
import TodayStatusSkeleton from './TodayStatusSkeleton';

// Used automatically in TodayStatusCard when loading
<TodayStatusCard childId={childId} childName={childName} onSuccess={handleSuccess} />
```

**Features:**
- Shows skeleton for question header with date
- Displays 3 status button placeholders (consumed, partial, refused)
- Matches the gradient background styling
- Maintains proper spacing and mobile responsiveness

## Features

- Uses Tailwind's `animate-pulse` utility for smooth animations
- Leverages the shared `Shimmer` component for consistent styling
- Matches the layout and structure of actual components
- Maintains the same gradient backgrounds and styling

## Implementation Details

All skeleton components:
1. Use the `Shimmer` component from `../ui/Shimmer`
2. Follow the same layout structure as their corresponding real components
3. Preserve the same color schemes (blue-purple gradients)
4. Support responsive grid layouts

## Requirements Validated

These components satisfy the following requirements:
- **2.3**: Display skeleton loaders during data loading
- **8.1**: Display skeleton loaders matching expected content layout
- **8.4**: Show loading states for calendar and stats components
- **8.5**: Smoothly transition from loading state to actual content
