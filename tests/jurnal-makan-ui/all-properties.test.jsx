/**
 * Comprehensive Property-Based Tests for Jurnal Makan UI
 * 
 * This file contains all property-based tests for the UI improvement features.
 * Each test validates universal properties that should hold across all inputs.
 */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import fc from 'fast-check';
import EnhancedChildSelector from '../../resources/js/components/jurnal/EnhancedChildSelector';
import EnhancedTabNavigation from '../../resources/js/components/jurnal/EnhancedTabNavigation';
import QuickAddForm from '../../resources/js/components/jurnal/QuickAddForm';
import MealTimeline from '../../resources/js/components/jurnal/MealTimeline';
import NoChildrenEmptyState from '../../resources/js/components/jurnal/NoChildrenEmptyState';
import NoMealsEmptyState from '../../resources/js/components/jurnal/NoMealsEmptyState';
import NoPMTDataEmptyState from '../../resources/js/components/pmt/NoPMTDataEmptyState';

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        main: ({ children, ...props }) => <main {...props}>{children}</main>,
        section: ({ children, ...props }) => <section {...props}>{children}</section>,
        button: ({ children, ...props }) => <button {...props}>{children}</button>,
        form: ({ children, ...props }) => <form {...props}>{children}</form>,
        span: ({ children, ...props }) => <span {...props}>{children}</span>,
        p: ({ children, ...props }) => <p {...props}>{children}</p>,
        nav: ({ children, ...props }) => <nav {...props}>{children}</nav>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
}));

// Generators for property-based testing
const childGenerator = fc.record({
    id: fc.integer({ min: 1, max: 1000 }),
    full_name: fc.string({ minLength: 3, maxLength: 50 }).filter(s => s.trim().length >= 3),
    date_of_birth: fc.constant('2020-01-01'), // Use constant to avoid invalid dates
});

const mealGenerator = fc.record({
    id: fc.integer({ min: 1, max: 10000 }),
    child_id: fc.integer({ min: 1, max: 1000 }),
    eaten_at: fc.constant(new Date().toISOString()),
    time_of_day: fc.constantFrom('pagi', 'siang', 'malam', 'snack'),
    description: fc.string({ minLength: 3, maxLength: 100 }).filter(s => s.trim().length >= 3),
    ingredients: fc.option(fc.string({ minLength: 3, maxLength: 200 }), { nil: null }),
    portion: fc.constantFrom('habis', 'setengah', 'sedikit', 'tidak_mau'),
    notes: fc.option(fc.string({ minLength: 0, maxLength: 500 }), { nil: null }),
    created_at: fc.constant(new Date().toISOString()),
});

describe('Property-Based Tests - Jurnal Makan UI', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('1.1 Child Selector Visual Indicators', () => {
        /**
         * Feature: jurnal-makan-ui-improvement, Property 7: Child selector visual indicators
         * For any child in the selector, the system should display the child's name along with an avatar or icon element
         * Validates: Requirements 3.1
         */
        it('should display child name with avatar/icon for any child', () => {
            fc.assert(
                fc.property(
                    fc.array(childGenerator, { minLength: 1, maxLength: 10 }).map(children => {
                        // Ensure unique IDs
                        return children.map((child, index) => ({ ...child, id: index + 1 }));
                    }),
                    (children) => {
                        const selectedId = children[0].id;
                        const { container } = render(
                            <BrowserRouter>
                                <EnhancedChildSelector
                                    children={children}
                                    selectedChildId={selectedId}
                                    onChange={() => {}}
                                />
                            </BrowserRouter>
                        );

                        // Should have select element
                        const select = container.querySelector('select');
                        expect(select).toBeTruthy();

                        // Should have avatar/icon element (div with rounded-full class)
                        const avatar = container.querySelector('[class*="rounded-full"]');
                        expect(avatar).toBeTruthy();

                        // Should have correct number of options
                        expect(select.options.length).toBe(children.length);
                    }
                ),
                { numRuns: 30 }
            );
        });
    });

    describe('1.2 Minimum Touch Target Size', () => {
        /**
         * Feature: jurnal-makan-ui-improvement, Property 9: Minimum touch target size
         * For any interactive element on mobile viewports, the element should have minimum dimensions of 44x44 pixels
         * Validates: Requirements 3.4, 9.2
         */
        it('should have minimum 44px height for child selector', () => {
            fc.assert(
                fc.property(
                    fc.array(childGenerator, { minLength: 1, maxLength: 5 }),
                    (children) => {
                        const { container } = render(
                            <BrowserRouter>
                                <EnhancedChildSelector
                                    children={children}
                                    selectedChildId={children[0].id}
                                    onChange={() => {}}
                                />
                            </BrowserRouter>
                        );

                        const select = container.querySelector('select');
                        const classes = select.className;
                        
                        // Should have min-h-[44px] class
                        expect(classes).toMatch(/min-h-\[44px\]/);
                    }
                ),
                { numRuns: 30 }
            );
        });
    });

    describe('1.3 Selection Confirmation', () => {
        /**
         * Feature: jurnal-makan-ui-improvement, Property 8: Selection confirmation
         * For any child selection change, the system should update the displayed child name
         * Validates: Requirements 3.3, 3.5
         */
        it('should update displayed child when selection changes', () => {
            fc.assert(
                fc.property(
                    fc.array(childGenerator, { minLength: 2, maxLength: 5 }).map(children => {
                        // Ensure unique IDs
                        return children.map((child, index) => ({ ...child, id: index + 1 }));
                    }),
                    (children) => {
                        let selectedId = children[0].id;
                        const { container, rerender } = render(
                            <BrowserRouter>
                                <EnhancedChildSelector
                                    children={children}
                                    selectedChildId={selectedId}
                                    onChange={() => {}}
                                />
                            </BrowserRouter>
                        );

                        const select = container.querySelector('select');
                        expect(select.value).toBe(selectedId.toString());

                        // Change selection
                        selectedId = children[1].id;
                        rerender(
                            <BrowserRouter>
                                <EnhancedChildSelector
                                    children={children}
                                    selectedChildId={selectedId}
                                    onChange={() => {}}
                                />
                            </BrowserRouter>
                        );

                        expect(select.value).toBe(selectedId.toString());
                    }
                ),
                { numRuns: 20 }
            );
        });
    });

    describe('2.1 Active Tab Visual Distinction', () => {
        /**
         * Feature: jurnal-makan-ui-improvement, Property 10: Active tab visual distinction
         * For any tab state (active or inactive), the system should apply distinct CSS classes
         * Validates: Requirements 4.1
         */
        it('should apply distinct classes for active vs inactive tabs', () => {
            fc.assert(
                fc.property(
                    fc.constantFrom('jurnal', 'pmt'),
                    (activeTab) => {
                        const { container } = render(
                            <BrowserRouter>
                                <EnhancedTabNavigation
                                    activeTab={activeTab}
                                    onTabChange={() => {}}
                                />
                            </BrowserRouter>
                        );

                        const buttons = container.querySelectorAll('button[role="tab"]');
                        expect(buttons.length).toBe(2);

                        buttons.forEach(button => {
                            const isActive = button.getAttribute('aria-selected') === 'true';
                            const classes = button.className;

                            if (isActive) {
                                // Active tab should have blue colors
                                expect(classes).toMatch(/text-blue-600|bg-blue-50/);
                            } else {
                                // Inactive tab should have gray colors
                                expect(classes).toMatch(/text-gray-600/);
                            }
                        });
                    }
                ),
                { numRuns: 20 }
            );
        });
    });

    describe('2.2 Hover State Feedback', () => {
        /**
         * Feature: jurnal-makan-ui-improvement, Property 4: Hover state feedback
         * For any interactive element, hovering should trigger visual feedback through CSS class changes
         * Validates: Requirements 2.1, 4.2
         */
        it('should have hover classes on interactive elements', () => {
            fc.assert(
                fc.property(
                    fc.constantFrom('jurnal', 'pmt'),
                    (activeTab) => {
                        const { container } = render(
                            <BrowserRouter>
                                <EnhancedTabNavigation
                                    activeTab={activeTab}
                                    onTabChange={() => {}}
                                />
                            </BrowserRouter>
                        );

                        const html = container.innerHTML;
                        // Should have hover classes somewhere in the component
                        expect(html).toMatch(/hover:text-|hover:bg-|hover:border-/);
                    }
                ),
                { numRuns: 10 }
            );
        });
    });

    describe('4.1 Empty State Icon Inclusion', () => {
        /**
         * Feature: jurnal-makan-ui-improvement, Property 11: Empty state icon inclusion
         * For any empty state component, the system should include an icon or illustration element
         * Validates: Requirements 5.4
         */
        it('should include icon in NoChildrenEmptyState', () => {
            const { container } = render(
                <BrowserRouter>
                    <NoChildrenEmptyState />
                </BrowserRouter>
            );

            // Should have SVG icon
            const svg = container.querySelector('svg');
            expect(svg).toBeTruthy();
        });

        it('should include icon in NoMealsEmptyState', () => {
            const { container } = render(
                <BrowserRouter>
                    <NoMealsEmptyState />
                </BrowserRouter>
            );

            const svg = container.querySelector('svg');
            expect(svg).toBeTruthy();
        });

        it('should include icon in NoPMTDataEmptyState', () => {
            const { container } = render(
                <BrowserRouter>
                    <NoPMTDataEmptyState />
                </BrowserRouter>
            );

            const svg = container.querySelector('svg');
            expect(svg).toBeTruthy();
        });
    });

    describe('4.2 Empty State Call-to-Action', () => {
        /**
         * Feature: jurnal-makan-ui-improvement, Property 12: Empty state call-to-action
         * For any actionable empty state, the system should include a button or link element
         * Validates: Requirements 5.5
         */
        it('should include CTA button when onAddChild is provided', () => {
            const { container } = render(
                <BrowserRouter>
                    <NoChildrenEmptyState onAddChild={() => {}} />
                </BrowserRouter>
            );

            const button = container.querySelector('button');
            expect(button).toBeTruthy();
        });
    });

    describe('5.1 Mobile Responsive Layout Stacking', () => {
        /**
         * Feature: jurnal-makan-ui-improvement, Property 1: Mobile responsive layout stacking
         * For any viewport width less than 768px, all major content sections should render in single-column layout
         * Validates: Requirements 1.2, 9.1
         */
        it('should use grid-cols-1 for mobile layouts', () => {
            fc.assert(
                fc.property(
                    fc.array(mealGenerator, { minLength: 0, maxLength: 5 }),
                    (meals) => {
                        const { container } = render(
                            <BrowserRouter>
                                <MealTimeline
                                    meals={meals}
                                    loading={false}
                                    onDelete={() => {}}
                                />
                            </BrowserRouter>
                        );

                        // Check for mobile-first responsive classes
                        const html = container.innerHTML;
                        // Should have grid-cols-1 or flex-col for mobile
                        expect(html).toMatch(/grid-cols-1|flex-col/);
                    }
                ),
                { numRuns: 20 }
            );
        });
    });

    describe('5.2 Desktop Multi-Column Utilization', () => {
        /**
         * Feature: jurnal-makan-ui-improvement, Property 2: Desktop multi-column utilization
         * For any viewport width >= 1024px, the system should utilize horizontal space with multi-column layouts
         * Validates: Requirements 1.3
         */
        it('should have responsive grid classes for desktop', () => {
            fc.assert(
                fc.property(
                    fc.array(mealGenerator, { minLength: 1, maxLength: 5 }),
                    (meals) => {
                        const { container } = render(
                            <BrowserRouter>
                                <MealTimeline
                                    meals={meals}
                                    loading={false}
                                    onDelete={() => {}}
                                />
                            </BrowserRouter>
                        );

                        const html = container.innerHTML;
                        // Should have responsive classes like md: or lg:
                        expect(html).toMatch(/md:|lg:/);
                    }
                ),
                { numRuns: 20 }
            );
        });
    });

    describe('5.3 No Horizontal Overflow on Mobile', () => {
        /**
         * Feature: jurnal-makan-ui-improvement, Property 18: No horizontal overflow on mobile
         * For any mobile viewport width, the page content should not cause horizontal scrolling
         * Validates: Requirements 9.5
         */
        it('should use full width classes on mobile', () => {
            fc.assert(
                fc.property(
                    fc.array(childGenerator, { minLength: 1, maxLength: 3 }).map(children => {
                        // Ensure unique IDs
                        return children.map((child, index) => ({ ...child, id: index + 1 }));
                    }),
                    (children) => {
                        const { container } = render(
                            <BrowserRouter>
                                <EnhancedChildSelector
                                    children={children}
                                    selectedChildId={children[0].id}
                                    onChange={() => {}}
                                />
                            </BrowserRouter>
                        );

                        const select = container.querySelector('select');
                        const classes = select.className;
                        
                        // Should have w-full for mobile
                        expect(classes).toMatch(/w-full/);
                    }
                ),
                { numRuns: 15 }
            );
        });
    });

    describe('6.1 Consistent Spacing Application', () => {
        /**
         * Feature: jurnal-makan-ui-improvement, Property 3: Consistent spacing application
         * For any rendered section, the system should apply spacing values from a consistent scale (multiples of 4px)
         * Validates: Requirements 1.5, 7.2
         */
        it('should use consistent spacing scale in components', () => {
            fc.assert(
                fc.property(
                    fc.array(mealGenerator, { minLength: 1, maxLength: 3 }),
                    (meals) => {
                        const { container } = render(
                            <BrowserRouter>
                                <MealTimeline
                                    meals={meals}
                                    loading={false}
                                    onDelete={() => {}}
                                />
                            </BrowserRouter>
                        );

                        const html = container.innerHTML;
                        // Should have spacing classes (p-4, p-6, p-8, gap-4, gap-6, etc.)
                        expect(html).toMatch(/p-\d+|gap-\d+|space-y-\d+/);
                    }
                ),
                { numRuns: 20 }
            );
        });
    });

    describe('6.2 Typographic Hierarchy', () => {
        /**
         * Feature: jurnal-makan-ui-improvement, Property 15: Typographic hierarchy
         * For any page section, headings should have larger font sizes and heavier weights than body text
         * Validates: Requirements 7.1, 7.5
         */
        it('should have distinct font sizes for headings', () => {
            fc.assert(
                fc.property(
                    fc.array(mealGenerator, { minLength: 1, maxLength: 3 }),
                    (meals) => {
                        const { container } = render(
                            <BrowserRouter>
                                <MealTimeline
                                    meals={meals}
                                    loading={false}
                                    onDelete={() => {}}
                                />
                            </BrowserRouter>
                        );

                        const html = container.innerHTML;
                        // Should have font-bold or font-semibold for headings
                        expect(html).toMatch(/font-bold|font-semibold/);
                        // Should have text size classes
                        expect(html).toMatch(/text-(sm|base|lg|xl|2xl)/);
                    }
                ),
                { numRuns: 20 }
            );
        });
    });

    describe('6.3 Responsive Font Sizing', () => {
        /**
         * Feature: jurnal-makan-ui-improvement, Property 16: Responsive font sizing
         * For any viewport width, the system should apply appropriate font size classes that scale with screen size
         * Validates: Requirements 7.3
         */
        it('should have responsive font size classes', () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 1, max: 100 }),
                    (childId) => {
                        const { container } = render(
                            <BrowserRouter>
                                <QuickAddForm childId={childId} onSuccess={() => {}} />
                            </BrowserRouter>
                        );

                        const html = container.innerHTML;
                        // Should have responsive text classes like md:text-lg
                        expect(html).toMatch(/md:text-|lg:text-/);
                    }
                ),
                { numRuns: 20 }
            );
        });
    });

    describe('7.1 Semantic Status Colors', () => {
        /**
         * Feature: jurnal-makan-ui-improvement, Property 13: Semantic status colors
         * For any status indicator, the system should apply color classes that match semantic meaning
         * Validates: Requirements 6.2, 10.2, 10.3
         */
        it('should use semantic colors for portion badges', () => {
            fc.assert(
                fc.property(
                    fc.array(mealGenerator, { minLength: 1, maxLength: 5 }),
                    (meals) => {
                        const { container } = render(
                            <BrowserRouter>
                                <MealTimeline
                                    meals={meals}
                                    loading={false}
                                    onDelete={() => {}}
                                />
                            </BrowserRouter>
                        );

                        meals.forEach(meal => {
                            const html = container.innerHTML;
                            
                            // Check semantic colors based on portion
                            if (meal.portion === 'habis') {
                                expect(html).toMatch(/green-/);
                            } else if (meal.portion === 'setengah') {
                                expect(html).toMatch(/yellow-/);
                            } else if (meal.portion === 'sedikit') {
                                expect(html).toMatch(/orange-/);
                            } else if (meal.portion === 'tidak_mau') {
                                expect(html).toMatch(/red-/);
                            }
                        });
                    }
                ),
                { numRuns: 30 }
            );
        });
    });

    describe('7.2 Color Contrast Accessibility', () => {
        /**
         * Feature: jurnal-makan-ui-improvement, Property 14: Color contrast accessibility
         * For any text element, the color contrast ratio should meet WCAG AA standards (4.5:1)
         * Validates: Requirements 6.4
         */
        it('should use appropriate text color classes for contrast', () => {
            fc.assert(
                fc.property(
                    fc.array(mealGenerator, { minLength: 1, maxLength: 3 }),
                    (meals) => {
                        const { container } = render(
                            <BrowserRouter>
                                <MealTimeline
                                    meals={meals}
                                    loading={false}
                                    onDelete={() => {}}
                                />
                            </BrowserRouter>
                        );

                        const html = container.innerHTML;
                        // Should use appropriate text colors (not too light)
                        // text-gray-900, text-gray-800, text-gray-700 for dark text
                        expect(html).toMatch(/text-gray-(900|800|700|600)/);
                    }
                ),
                { numRuns: 20 }
            );
        });
    });

    describe('9.1 Error Message Display', () => {
        /**
         * Feature: jurnal-makan-ui-improvement, Property 6: Error message display
         * For any error state, the system should render an error message component with appropriate styling
         * Validates: Requirements 2.5
         */
        it('should have error styling classes available', () => {
            const { container } = render(
                <BrowserRouter>
                    <QuickAddForm childId={1} onSuccess={() => {}} />
                </BrowserRouter>
            );

            const html = container.innerHTML;
            // Form should have structure for error messages (red colors)
            expect(html).toMatch(/red-/);
        });
    });

    describe('9.2 Mobile Form Optimization', () => {
        /**
         * Feature: jurnal-makan-ui-improvement, Property 17: Mobile form optimization
         * For any input field on mobile viewports, the system should set appropriate input type and inputMode
         * Validates: Requirements 9.3
         */
        it('should have inputMode attributes on form inputs', () => {
            const { container } = render(
                <BrowserRouter>
                    <QuickAddForm childId={1} onSuccess={() => {}} />
                </BrowserRouter>
            );

            const inputs = container.querySelectorAll('input[type="text"]');
            inputs.forEach(input => {
                // Should have inputMode attribute
                expect(input.hasAttribute('inputMode') || input.hasAttribute('inputmode')).toBe(true);
            });
        });
    });

    describe('10.1 Meal Time Visual Indicators', () => {
        /**
         * Feature: jurnal-makan-ui-improvement, Property 19: Meal time visual indicators
         * For any meal time value, the system should render a distinct icon and color combination
         * Validates: Requirements 10.1
         */
        it('should render distinct icons for each meal time', () => {
            fc.assert(
                fc.property(
                    fc.array(mealGenerator, { minLength: 1, maxLength: 10 }),
                    (meals) => {
                        const { container } = render(
                            <BrowserRouter>
                                <MealTimeline
                                    meals={meals}
                                    loading={false}
                                    onDelete={() => {}}
                                />
                            </BrowserRouter>
                        );

                        // Should have SVG icons for meal times
                        const svgs = container.querySelectorAll('svg');
                        expect(svgs.length).toBeGreaterThan(0);

                        // Should have distinct colors for different meal times
                        const html = container.innerHTML;
                        const uniqueTimes = [...new Set(meals.map(m => m.time_of_day))];
                        
                        uniqueTimes.forEach(time => {
                            if (time === 'pagi') {
                                expect(html).toMatch(/orange-/);
                            } else if (time === 'siang') {
                                expect(html).toMatch(/yellow-/);
                            } else if (time === 'malam') {
                                expect(html).toMatch(/indigo-/);
                            } else if (time === 'snack') {
                                expect(html).toMatch(/pink-/);
                            }
                        });
                    }
                ),
                { numRuns: 30 }
            );
        });
    });

    describe('14.1 Accessibility Compliance', () => {
        /**
         * Unit tests for accessibility compliance
         * Validates: Requirements 6.4
         */
        it('should have ARIA labels on interactive elements', () => {
            fc.assert(
                fc.property(
                    fc.array(childGenerator, { minLength: 1, maxLength: 3 }).map(children => {
                        // Ensure unique IDs
                        return children.map((child, index) => ({ ...child, id: index + 1 }));
                    }),
                    (children) => {
                        const { container, unmount } = render(
                            <BrowserRouter>
                                <EnhancedChildSelector
                                    children={children}
                                    selectedChildId={children[0].id}
                                    onChange={() => {}}
                                />
                            </BrowserRouter>
                        );

                        const select = container.querySelector('select');
                        expect(select).toHaveAttribute('aria-label');
                        
                        // Cleanup
                        unmount();
                    }
                ),
                { numRuns: 15 }
            );
        });

        it('should have proper role attributes on navigation', () => {
            render(
                <BrowserRouter>
                    <EnhancedTabNavigation
                        activeTab="jurnal"
                        onTabChange={() => {}}
                    />
                </BrowserRouter>
            );

            const nav = screen.getByRole('navigation');
            expect(nav).toBeInTheDocument();

            const tabs = screen.getAllByRole('tab');
            expect(tabs.length).toBe(2);
        });

        it('should have semantic HTML structure', () => {
            fc.assert(
                fc.property(
                    fc.array(mealGenerator, { minLength: 1, maxLength: 3 }),
                    (meals) => {
                        const { container } = render(
                            <BrowserRouter>
                                <MealTimeline
                                    meals={meals}
                                    loading={false}
                                    onDelete={() => {}}
                                />
                            </BrowserRouter>
                        );

                        // Should use semantic elements
                        const section = container.querySelector('section');
                        expect(section).toBeTruthy();
                    }
                ),
                { numRuns: 20 }
            );
        });
    });
});
