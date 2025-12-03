import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NoChildrenEmptyState from '../../resources/js/components/jurnal/NoChildrenEmptyState';
import NoMealsEmptyState from '../../resources/js/components/jurnal/NoMealsEmptyState';
import NoPMTDataEmptyState from '../../resources/js/components/pmt/NoPMTDataEmptyState';
import MealTimeline from '../../resources/js/components/jurnal/MealTimeline';
import PMTCalendar from '../../resources/js/components/pmt/PMTCalendar';
import PMTStatsCard from '../../resources/js/components/pmt/PMTStatsCard';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        button: ({ children, ...props }) => <button {...props}>{children}</button>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock API
vi.mock('../../resources/js/lib/api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        delete: vi.fn(),
    },
}));

describe('Empty States Integration', () => {
    describe('NoChildrenEmptyState', () => {
        it('should render with all required elements', () => {
            render(<NoChildrenEmptyState />);
            
            // Check for heading
            expect(screen.getByText('Belum Ada Data Anak')).toBeInTheDocument();
            
            // Check for description
            expect(screen.getByText(/Untuk mulai mencatat jurnal makan/i)).toBeInTheDocument();
            
            // Check for tip section
            expect(screen.getByText(/Tips:/i)).toBeInTheDocument();
        });

        it('should render call-to-action button when onAddChild is provided', () => {
            const mockOnAddChild = vi.fn();
            render(<NoChildrenEmptyState onAddChild={mockOnAddChild} />);
            
            const button = screen.getByRole('button', { name: /Tambah Data Anak/i });
            expect(button).toBeInTheDocument();
        });

        it('should not render button when onAddChild is not provided', () => {
            render(<NoChildrenEmptyState />);
            
            const button = screen.queryByRole('button', { name: /Tambah Data Anak/i });
            expect(button).not.toBeInTheDocument();
        });
    });

    describe('NoMealsEmptyState', () => {
        it('should render with all required elements', () => {
            render(<NoMealsEmptyState />);
            
            // Check for heading
            expect(screen.getByText('Belum Ada Catatan Hari Ini')).toBeInTheDocument();
            
            // Check for encouraging message
            expect(screen.getByText(/Yuk, mulai catat makanan/i)).toBeInTheDocument();
            
            // Check for motivational tips
            expect(screen.getByText(/Catat setiap waktu makan/i)).toBeInTheDocument();
            expect(screen.getByText(/Tambahkan detail porsi dan bahan/i)).toBeInTheDocument();
            expect(screen.getByText(/Pantau perkembangan nutrisi/i)).toBeInTheDocument();
        });

        it('should include icon elements', () => {
            const { container } = render(<NoMealsEmptyState />);
            
            // Check for icon container
            const iconContainer = container.querySelector('.bg-gradient-to-br.from-orange-100.to-yellow-100');
            expect(iconContainer).toBeInTheDocument();
        });
    });

    describe('NoPMTDataEmptyState', () => {
        it('should render with all required elements', () => {
            render(<NoPMTDataEmptyState />);
            
            // Check for heading
            expect(screen.getByText('Belum Ada Data PMT')).toBeInTheDocument();
            
            // Check for description
            expect(screen.getByText(/Pantau konsumsi PMT/i)).toBeInTheDocument();
            
            // Check for info box
            expect(screen.getByText('Apa itu PMT?')).toBeInTheDocument();
            
            // Check for feature list
            expect(screen.getByText('Catat Status Harian')).toBeInTheDocument();
            expect(screen.getByText('Lihat Kalender Bulanan')).toBeInTheDocument();
            expect(screen.getByText('Statistik Konsumsi')).toBeInTheDocument();
        });

        it('should include call-to-action text', () => {
            render(<NoPMTDataEmptyState />);
            
            expect(screen.getByText(/Mulai dengan mengisi status PMT hari ini/i)).toBeInTheDocument();
        });
    });

    describe('MealTimeline Integration', () => {
        it('should show NoMealsEmptyState when meals array is empty', () => {
            render(
                <MealTimeline 
                    meals={[]} 
                    loading={false} 
                    onDelete={vi.fn()} 
                />
            );
            
            expect(screen.getByText('Belum Ada Catatan Hari Ini')).toBeInTheDocument();
        });
    });

    describe('Visual Consistency', () => {
        it('all empty states should have consistent structure', () => {
            const { container: container1 } = render(<NoChildrenEmptyState />);
            const { container: container2 } = render(<NoMealsEmptyState />);
            const { container: container3 } = render(<NoPMTDataEmptyState />);
            
            // All should have icon containers with gradient backgrounds
            expect(container1.querySelector('.bg-gradient-to-br')).toBeInTheDocument();
            expect(container2.querySelector('.bg-gradient-to-br')).toBeInTheDocument();
            expect(container3.querySelector('.bg-gradient-to-br')).toBeInTheDocument();
            
            // All should have centered flex layouts
            expect(container1.querySelector('.flex.flex-col.items-center')).toBeInTheDocument();
            expect(container2.querySelector('.flex.flex-col.items-center')).toBeInTheDocument();
            expect(container3.querySelector('.flex.flex-col.items-center')).toBeInTheDocument();
        });

        it('all empty states should use consistent font styling', () => {
            const { container: container1 } = render(<NoChildrenEmptyState />);
            const { container: container2 } = render(<NoMealsEmptyState />);
            const { container: container3 } = render(<NoPMTDataEmptyState />);
            
            // Check for bold headings
            expect(container1.querySelector('.font-bold')).toBeInTheDocument();
            expect(container2.querySelector('.font-bold')).toBeInTheDocument();
            expect(container3.querySelector('.font-bold')).toBeInTheDocument();
        });
    });
});
