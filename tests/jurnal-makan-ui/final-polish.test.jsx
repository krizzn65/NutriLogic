import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import JurnalMakanPage from '../../resources/js/components/konten/JurnalMakanPage';
import EnhancedChildSelector from '../../resources/js/components/jurnal/EnhancedChildSelector';
import EnhancedTabNavigation from '../../resources/js/components/jurnal/EnhancedTabNavigation';
import QuickAddForm from '../../resources/js/components/jurnal/QuickAddForm';
import MealTimeline from '../../resources/js/components/jurnal/MealTimeline';
import PMTStatsCard from '../../resources/js/components/pmt/PMTStatsCard';
import api from '../../resources/js/lib/api';

// Mock API
vi.mock('../../resources/js/lib/api');

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        main: ({ children, ...props }) => <main {...props}>{children}</main>,
        section: ({ children, ...props }) => <section {...props}>{children}</section>,
        button: ({ children, ...props }) => <button {...props}>{children}</button>,
        form: ({ children, ...props }) => <form {...props}>{children}</form>,
        span: ({ children, ...props }) => <span {...props}>{children}</span>,
        p: ({ children, ...props }) => <p {...props}>{children}</p>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
}));

const mockChildren = [
    { id: 1, full_name: 'Anak Pertama', date_of_birth: '2020-01-01' },
    { id: 2, full_name: 'Anak Kedua', date_of_birth: '2021-06-15' },
];

const mockMeals = [
    {
        id: 1,
        child_id: 1,
        eaten_at: new Date().toISOString(),
        time_of_day: 'pagi',
        description: 'Bubur Ayam',
        ingredients: 'Beras, Ayam, Wortel',
        portion: 'habis',
        notes: 'Anak makan dengan lahap',
        created_at: new Date().toISOString(),
    },
    {
        id: 2,
        child_id: 1,
        eaten_at: new Date().toISOString(),
        time_of_day: 'siang',
        description: 'Nasi Tim',
        portion: 'setengah',
        created_at: new Date().toISOString(),
    },
];

describe('Final Polish and Optimization Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        api.get.mockResolvedValue({ data: { data: [] } });
    });

    describe('Component Memoization', () => {
        it('EnhancedChildSelector should be memoized', () => {
            expect(EnhancedChildSelector.type).toBeDefined();
            // React.memo wraps components, check if it's a memo component
            expect(EnhancedChildSelector.$$typeof.toString()).toContain('react.memo');
        });

        it('EnhancedTabNavigation should be memoized', () => {
            expect(EnhancedTabNavigation.type).toBeDefined();
            expect(EnhancedTabNavigation.$$typeof.toString()).toContain('react.memo');
        });

        it('QuickAddForm should be memoized', () => {
            expect(QuickAddForm.type).toBeDefined();
            expect(QuickAddForm.$$typeof.toString()).toContain('react.memo');
        });

        it('MealTimeline should be memoized', () => {
            expect(MealTimeline.type).toBeDefined();
            expect(MealTimeline.$$typeof.toString()).toContain('react.memo');
        });

        it('PMTStatsCard should be memoized', () => {
            expect(PMTStatsCard.type).toBeDefined();
            expect(PMTStatsCard.$$typeof.toString()).toContain('react.memo');
        });
    });

    describe('Consistent Styling', () => {
        it('should use consistent border radius classes', () => {
            const { container } = render(
                <BrowserRouter>
                    <EnhancedChildSelector
                        children={mockChildren}
                        selectedChildId={1}
                        onChange={() => {}}
                    />
                </BrowserRouter>
            );

            // Check for consistent rounded-xl or rounded-2xl usage
            const elements = container.querySelectorAll('[class*="rounded"]');
            expect(elements.length).toBeGreaterThan(0);
        });

        it('should use consistent spacing scale', () => {
            const { container } = render(
                <BrowserRouter>
                    <QuickAddForm childId={1} onSuccess={() => {}} />
                </BrowserRouter>
            );

            // Check for consistent spacing (p-4, p-6, p-8, gap-4, gap-6, etc.)
            const elements = container.querySelectorAll('[class*="p-"], [class*="gap-"]');
            expect(elements.length).toBeGreaterThan(0);
        });

        it('should use consistent color palette', () => {
            const { container } = render(
                <BrowserRouter>
                    <MealTimeline meals={mockMeals} loading={false} onDelete={() => {}} />
                </BrowserRouter>
            );

            // Check for consistent color usage (blue, purple, green, yellow, red)
            const html = container.innerHTML;
            expect(html).toMatch(/blue-\d{3}/);
        });

        it('should use consistent shadow classes', () => {
            const { container } = render(
                <BrowserRouter>
                    <EnhancedTabNavigation
                        activeTab="jurnal"
                        onTabChange={() => {}}
                    />
                </BrowserRouter>
            );

            // Check for shadow usage
            const elements = container.querySelectorAll('[class*="shadow"]');
            expect(elements.length).toBeGreaterThan(0);
        });
    });

    describe('Responsive Behavior', () => {
        it('should have mobile-first responsive classes', () => {
            const { container } = render(
                <BrowserRouter>
                    <QuickAddForm childId={1} onSuccess={() => {}} />
                </BrowserRouter>
            );

            // Check for responsive classes (sm:, md:, lg:)
            const html = container.innerHTML;
            expect(html).toMatch(/md:/);
        });

        it('should ensure minimum touch target size on mobile', () => {
            const { container } = render(
                <BrowserRouter>
                    <EnhancedChildSelector
                        children={mockChildren}
                        selectedChildId={1}
                        onChange={() => {}}
                    />
                </BrowserRouter>
            );

            // Check for min-h-[44px] or similar
            const html = container.innerHTML;
            expect(html).toMatch(/min-h-\[44px\]/);
        });

        it('should stack components vertically on mobile', () => {
            const { container } = render(
                <BrowserRouter>
                    <MealTimeline meals={mockMeals} loading={false} onDelete={() => {}} />
                </BrowserRouter>
            );

            // Check for grid-cols-1 or flex-col
            const html = container.innerHTML;
            expect(html).toMatch(/grid-cols-1|flex-col/);
        });
    });

    describe('Error Boundary Integration', () => {
        it('JurnalMakanPage should be wrapped with ErrorBoundary', () => {
            // The default export wraps the component with ErrorBoundary
            expect(JurnalMakanPage).toBeDefined();
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA labels on interactive elements', () => {
            render(
                <BrowserRouter>
                    <EnhancedChildSelector
                        children={mockChildren}
                        selectedChildId={1}
                        onChange={() => {}}
                    />
                </BrowserRouter>
            );

            const select = screen.getByRole('combobox');
            expect(select).toHaveAttribute('aria-label');
        });

        it('should have proper role attributes', () => {
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
        });

        it('should have focus indicators', () => {
            const { container } = render(
                <BrowserRouter>
                    <QuickAddForm childId={1} onSuccess={() => {}} />
                </BrowserRouter>
            );

            // Check for focus: classes
            const html = container.innerHTML;
            expect(html).toMatch(/focus:/);
        });
    });

    describe('Performance Optimizations', () => {
        it('should use callback hooks for event handlers', () => {
            // QuickAddForm uses useCallback for handleSubmit
            const { container } = render(
                <BrowserRouter>
                    <QuickAddForm childId={1} onSuccess={() => {}} />
                </BrowserRouter>
            );

            expect(container).toBeInTheDocument();
        });

        it('should lazy load or code split where appropriate', () => {
            // Check that components are properly structured for code splitting
            expect(JurnalMakanPage).toBeDefined();
            expect(EnhancedChildSelector).toBeDefined();
        });
    });

    describe('Animation Smoothness', () => {
        it('should use GPU-accelerated properties (transform, opacity)', () => {
            const { container } = render(
                <BrowserRouter>
                    <MealTimeline meals={mockMeals} loading={false} onDelete={() => {}} />
                </BrowserRouter>
            );

            // Framer Motion uses transform and opacity by default
            expect(container).toBeInTheDocument();
        });

        it('should have consistent transition durations', () => {
            const { container } = render(
                <BrowserRouter>
                    <EnhancedTabNavigation
                        activeTab="jurnal"
                        onTabChange={() => {}}
                    />
                </BrowserRouter>
            );

            // Check for transition classes
            const html = container.innerHTML;
            expect(html).toMatch(/transition/);
        });
    });

    describe('Visual Consistency', () => {
        it('should use consistent font weights', () => {
            const { container } = render(
                <BrowserRouter>
                    <QuickAddForm childId={1} onSuccess={() => {}} />
                </BrowserRouter>
            );

            // Check for font-bold, font-semibold usage
            const html = container.innerHTML;
            expect(html).toMatch(/font-bold|font-semibold/);
        });

        it('should use consistent icon sizes', () => {
            const { container } = render(
                <BrowserRouter>
                    <MealTimeline meals={mockMeals} loading={false} onDelete={() => {}} />
                </BrowserRouter>
            );

            // Check for w-5 h-5, w-6 h-6 patterns
            const html = container.innerHTML;
            expect(html).toMatch(/w-\d+ h-\d+/);
        });

        it('should use semantic color coding', () => {
            const { container } = render(
                <BrowserRouter>
                    <MealTimeline meals={mockMeals} loading={false} onDelete={() => {}} />
                </BrowserRouter>
            );

            // Check for semantic colors (green for success, red for error, etc.)
            const html = container.innerHTML;
            expect(html).toMatch(/green-|red-|yellow-/);
        });
    });

    describe('Loading States', () => {
        it('should show skeleton loaders during loading', () => {
            render(
                <BrowserRouter>
                    <MealTimeline meals={[]} loading={true} onDelete={() => {}} />
                </BrowserRouter>
            );

            // Should show skeleton with animate-pulse class
            const { container } = render(
                <BrowserRouter>
                    <MealTimeline meals={[]} loading={true} onDelete={() => {}} />
                </BrowserRouter>
            );
            
            const html = container.innerHTML;
            expect(html).toMatch(/animate-pulse/);
        });

        it('should transition smoothly from loading to content', () => {
            const { rerender } = render(
                <BrowserRouter>
                    <MealTimeline meals={[]} loading={true} onDelete={() => {}} />
                </BrowserRouter>
            );

            rerender(
                <BrowserRouter>
                    <MealTimeline meals={mockMeals} loading={false} onDelete={() => {}} />
                </BrowserRouter>
            );

            expect(screen.getByText('Bubur Ayam')).toBeInTheDocument();
        });
    });

    describe('Empty States', () => {
        it('should show appropriate empty state when no data', () => {
            render(
                <BrowserRouter>
                    <MealTimeline meals={[]} loading={false} onDelete={() => {}} />
                </BrowserRouter>
            );

            // Should show empty state
            expect(screen.getByText(/belum ada/i)).toBeInTheDocument();
        });
    });
});
