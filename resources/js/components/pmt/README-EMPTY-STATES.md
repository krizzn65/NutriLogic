# PMT Empty State Components

This directory contains empty state components for the PMT (Pemberian Makanan Tambahan) feature.

## Components

### NoPMTDataEmptyState
**Location:** `NoPMTDataEmptyState.jsx`

**Purpose:** Displayed when no PMT data is available for the selected child.

**Features:**
- Calendar icon with green gradient background
- Clear explanation of what PMT is
- Informative box explaining the PMT program
- Feature list showing what users can do
- Call-to-action text pointing to the status card above
- Smooth entrance animations with staggered effects

**Props:** None

**Usage:**
```jsx
import NoPMTDataEmptyState from './NoPMTDataEmptyState';

<NoPMTDataEmptyState />
```

## Design Principles

The PMT empty state follows these principles:

1. **Educational:** Explains what PMT is for new users
2. **Feature Showcase:** Highlights the capabilities of PMT tracking
3. **Visual Hierarchy:** Icon → Heading → Description → Info Box → Features
4. **Encouraging Tone:** Positive language that motivates action
5. **Smooth Animations:** Framer Motion for entrance effects
6. **Consistent Styling:** Matches the overall design system

## Color Scheme

- **Primary:** Green-emerald gradient (health/nutrition theme)
- **Info Box:** Blue-purple gradient (informational)
- **Feature Cards:** White with colored icon backgrounds

## Animation Timing

- Initial fade-in: 0.4s
- Icon scale: 0.1s delay with spring animation
- Info box: 0.3s delay
- Feature list items: Staggered 0.1s intervals (0.4s, 0.5s, 0.6s)
- CTA text: 0.7s delay

## Integration

This component is integrated into:

1. **PMTCalendar:** Shows when no PMT logs exist for the month
2. **PMTStatsCard:** Shows when no statistics are available

## Content Structure

### Info Box
Explains what PMT (Pemberian Makanan Tambahan) is and why it's important.

### Feature List
1. **Catat Status Harian:** Record daily consumption status
2. **Lihat Kalender Bulanan:** View monthly calendar
3. **Statistik Konsumsi:** See consumption statistics

### Call-to-Action
Points users to the TodayStatusCard above to start logging.

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy
- Icon labels for screen readers
- Sufficient color contrast (WCAG AA compliant)

## Future Enhancements

- Add illustration showing PMT program
- Add video tutorial link
- Add success stories or testimonials
- Add link to PMT information resources
