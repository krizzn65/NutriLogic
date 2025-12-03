# Jurnal Makan Loading State Components

This directory contains skeleton loader components for the Jurnal Makan (Meal Journal) feature.

## Components

### ChildSelectorSkeleton
A loading placeholder for the child selector dropdown component.

**Usage:**
```jsx
import ChildSelectorSkeleton from './ChildSelectorSkeleton';

// Used automatically in EnhancedChildSelector when loading prop is true
<EnhancedChildSelector loading={true} />
```

### TimelineSkeleton
A loading placeholder for the meal timeline with meal card placeholders.

**Props:**
- `mealCount` (number, default: 3) - Number of meal cards to show per time section

**Usage:**
```jsx
import TimelineSkeleton from './TimelineSkeleton';

<TimelineSkeleton mealCount={3} />
```

## Features

- Uses Tailwind's `animate-pulse` utility for smooth animations
- Leverages the shared `Shimmer` component for consistent styling
- Matches the layout and structure of actual components
- Responsive design that adapts to different screen sizes

## Implementation Details

All skeleton components:
1. Use the `Shimmer` component from `../ui/Shimmer`
2. Follow the same layout structure as their corresponding real components
3. Use consistent spacing and sizing
4. Support the same responsive breakpoints

## Requirements Validated

These components satisfy the following requirements:
- **2.3**: Display skeleton loaders during data loading
- **8.1**: Display skeleton loaders matching expected content layout
- **8.2**: Show loading indicator in child selector area
- **8.3**: Display timeline skeleton loaders
- **8.4**: Show loading states for calendar and stats components
