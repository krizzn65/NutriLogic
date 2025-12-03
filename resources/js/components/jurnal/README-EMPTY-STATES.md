# Empty State Components

This directory contains empty state components for the Jurnal Makan feature.

## Components

### NoChildrenEmptyState
**Location:** `NoChildrenEmptyState.jsx`

**Purpose:** Displayed when the user has no children registered in the system.

**Features:**
- Large baby icon with gradient background
- Clear heading and descriptive text
- Optional call-to-action button to add a child
- Helpful tip box with guidance
- Smooth entrance animations

**Props:**
- `onAddChild` (optional): Callback function when "Add Child" button is clicked

**Usage:**
```jsx
import NoChildrenEmptyState from './NoChildrenEmptyState';

<NoChildrenEmptyState onAddChild={() => navigate('/add-child')} />
```

### NoMealsEmptyState
**Location:** `NoMealsEmptyState.jsx`

**Purpose:** Displayed when no meal logs exist for the selected day.

**Features:**
- Utensils icon with sparkle decoration
- Encouraging message to start logging meals
- Motivational tips list with icons
- Staggered entrance animations
- Decorative emoji element

**Props:** None

**Usage:**
```jsx
import NoMealsEmptyState from './NoMealsEmptyState';

<NoMealsEmptyState />
```

## Design Principles

All empty state components follow these principles:

1. **Visual Hierarchy:** Large icon → Heading → Description → Action/Tips
2. **Encouraging Tone:** Positive, motivational language
3. **Clear Guidance:** Explain what the feature does and how to use it
4. **Smooth Animations:** Framer Motion for entrance effects
5. **Consistent Styling:** Gradient backgrounds, rounded corners, shadows
6. **Accessibility:** Semantic HTML and proper color contrast

## Color Scheme

- **NoChildrenEmptyState:** Blue-purple gradient (matches baby/child theme)
- **NoMealsEmptyState:** Orange-yellow gradient (matches food theme)

## Animation Timing

- Initial fade-in: 0.4s
- Icon scale: 0.2s delay with spring animation
- List items: Staggered 0.1s intervals

## Integration

These components are integrated into:

1. **JurnalMakanPage:** Shows `NoChildrenEmptyState` when no children exist
2. **MealTimeline:** Shows `NoMealsEmptyState` when no meals logged
3. **PMTCalendar:** Shows `NoPMTDataEmptyState` when no PMT data exists
4. **PMTStatsCard:** Shows `NoPMTDataEmptyState` when no stats available

## Future Enhancements

- Add illustration images instead of icons
- Add animation on hover
- Add more contextual tips based on user behavior
- Add quick action shortcuts
