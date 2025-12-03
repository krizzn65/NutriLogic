import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import PageHeader from '../dashboard/PageHeader';
import DashboardLayout from '../dashboard/DashboardLayout';
import QuickAddForm from '../jurnal/QuickAddForm';
import MealTimeline from '../jurnal/MealTimeline';
import TodayStatusCard from '../pmt/TodayStatusCard';
import PMTCalendar from '../pmt/PMTCalendar';
import PMTStatsCard from '../pmt/PMTStatsCard';
import EnhancedChildSelector from '../jurnal/EnhancedChildSelector';
import EnhancedTabNavigation from '../jurnal/EnhancedTabNavigation';
import NoChildrenEmptyState from '../jurnal/NoChildrenEmptyState';
import ChildSelectorSkeleton from '../jurnal/ChildSelectorSkeleton';
import TimelineSkeleton from '../jurnal/TimelineSkeleton';
import StatsSkeleton from '../pmt/StatsSkeleton';
import CalendarSkeleton from '../pmt/CalendarSkeleton';
import TodayStatusSkeleton from '../pmt/TodayStatusSkeleton';
import ErrorBoundary from '../ErrorBoundary';

function JurnalMakanPageContent() {
    const [activeTab, setActiveTab] = useState('jurnal'); // 'jurnal' or 'pmt'
    const [children, setChildren] = useState([]);
    const [selectedChildId, setSelectedChildId] = useState('');
    const [loading, setLoading] = useState(true);
    const [meals, setMeals] = useState([]);
    const [mealsLoading, setMealsLoading] = useState(false);
    const [pmtRefreshKey, setPmtRefreshKey] = useState(0);

    useEffect(() => {
        fetchChildren();
    }, []);

    useEffect(() => {
        if (selectedChildId && activeTab === 'jurnal') {
            fetchMeals();
        }
    }, [selectedChildId, activeTab]);

    const fetchChildren = async () => {
        try {
            const response = await api.get('/parent/children');
            const childrenData = response.data.data || [];
            setChildren(childrenData);
            if (childrenData.length > 0) {
                setSelectedChildId(childrenData[0].id);
            }
        } catch (error) {
            console.error('Error fetching children:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMeals = useCallback(async () => {
        if (!selectedChildId) return;

        setMealsLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await api.get(`/meal-logs/child/${selectedChildId}`);
            const allMeals = response.data.data || [];

            // Filter today's meals
            const todayMeals = allMeals.filter(meal => {
                const mealDate = new Date(meal.eaten_at).toISOString().split('T')[0];
                return mealDate === today;
            });

            setMeals(todayMeals);
        } catch (error) {
            console.error('Error fetching meals:', error);
        } finally {
            setMealsLoading(false);
        }
    }, [selectedChildId]);

    const handleMealAdded = useCallback(() => {
        fetchMeals(); // Refresh the list
    }, [fetchMeals]);

    const handleDeleteMeal = useCallback(async (mealId) => {
        if (!confirm('Yakin ingin menghapus data ini?')) return;

        try {
            await api.delete(`/meal-logs/${mealId}`);
            fetchMeals(); // Refresh the list
        } catch (error) {
            console.error('Error deleting meal:', error);
            alert('Gagal menghapus data. Silakan coba lagi.');
        }
    }, [fetchMeals]);

    const selectedChild = children.find(c => c.id === parseInt(selectedChildId));

    if (loading) {
        return (
            <DashboardLayout>
                <motion.div 
                    className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white p-4 sm:p-6 md:p-8 lg:p-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <PageHeader
                                title="Jurnal Makan"
                                subtitle="Catat makanan harian dan pantau konsumsi PMT"
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            role="status"
                            aria-label="Memuat data anak"
                        >
                            <ChildSelectorSkeleton />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl shadow-md border border-gray-100 p-4"
                        >
                            <div className="flex gap-4">
                                <div className="h-12 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
                                <div className="h-12 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8"
                        >
                            <div className="lg:col-span-4">
                                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 md:p-8 space-y-4">
                                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                            </div>

                            <div className="lg:col-span-8">
                                <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 md:p-8">
                                    <TimelineSkeleton />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </DashboardLayout>
        );
    }

    // Show empty state if no children
    if (children.length === 0) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white p-4 md:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <PageHeader
                            title="Jurnal Makan"
                            subtitle="Catat makanan harian dan pantau konsumsi PMT"
                        />
                        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 md:p-6 mt-4 md:mt-6">
                            <NoChildrenEmptyState />
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { 
            opacity: 1, 
            y: 0,
            transition: {
                duration: 0.4,
                staggerChildren: 0.1
            }
        },
        exit: { opacity: 0, y: -20 }
    };

    const sectionVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 }
    };

    return (
        <DashboardLayout>
            {/* Mobile-first responsive container with consistent spacing and cohesive color palette */}
            <motion.main 
                className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white p-4 sm:p-6 md:p-8 lg:p-10"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                role="main"
                aria-label="Halaman Jurnal Makan"
            >
                {/* Constrain max width on large screens for better readability */}
                <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
                    <motion.div variants={sectionVariants}>
                        <PageHeader
                            title="Jurnal Makan"
                            subtitle="Catat makanan harian dan pantau konsumsi PMT"
                        />
                    </motion.div>

                    {/* Enhanced Child Selector with proper spacing */}
                    <motion.div 
                        className="mt-6 md:mt-8"
                        variants={sectionVariants}
                    >
                        <EnhancedChildSelector
                            children={children}
                            selectedChildId={selectedChildId}
                            onChange={setSelectedChildId}
                            loading={loading}
                        />
                    </motion.div>

                    {/* Enhanced Tab Navigation with proper spacing */}
                    <motion.div 
                        className="mt-6 md:mt-8"
                        variants={sectionVariants}
                    >
                        <EnhancedTabNavigation
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            mealCount={meals.length}
                            pmtStatus={null}
                        />
                    </motion.div>

                    {/* Tab Content with proper spacing */}
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: activeTab === 'jurnal' ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: activeTab === 'jurnal' ? 20 : -20 }}
                        transition={{ 
                            duration: 0.3,
                            ease: "easeInOut"
                        }}
                        className="mt-6 md:mt-8"
                        role="tabpanel"
                        id={`${activeTab}-panel`}
                        aria-labelledby={`${activeTab}-tab`}
                    >
                        {activeTab === 'jurnal' ? (
                            /* Single column layout on mobile, multi-column on desktop */
                            <motion.div 
                                className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8"
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: {
                                        opacity: 1,
                                        transition: {
                                            staggerChildren: 0.15
                                        }
                                    }
                                }}
                            >
                                {/* Quick Add Form - Full width on mobile, sidebar on desktop */}
                                <motion.div 
                                    className="lg:col-span-4"
                                    variants={{
                                        hidden: { opacity: 0, x: -20 },
                                        visible: { opacity: 1, x: 0 }
                                    }}
                                >
                                    <QuickAddForm
                                        childId={selectedChildId}
                                        onSuccess={handleMealAdded}
                                    />
                                </motion.div>

                                {/* Meal Timeline - Full width on mobile, main content on desktop */}
                                <motion.div 
                                    className="lg:col-span-8"
                                    variants={{
                                        hidden: { opacity: 0, x: 20 },
                                        visible: { opacity: 1, x: 0 }
                                    }}
                                >
                                    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 md:p-8">
                                        <MealTimeline
                                            meals={meals}
                                            loading={mealsLoading}
                                            onDelete={handleDeleteMeal}
                                        />
                                    </div>
                                </motion.div>
                            </motion.div>
                        ) : (
                            /* Single column on mobile, responsive grid on tablet/desktop */
                            <motion.div 
                                className="space-y-6 md:space-y-8"
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: {
                                        opacity: 1,
                                        transition: {
                                            staggerChildren: 0.15
                                        }
                                    }
                                }}
                            >
                                {/* Today Status Card - Full width */}
                                <motion.div
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 }
                                    }}
                                >
                                    <TodayStatusCard
                                        childId={selectedChildId}
                                        childName={selectedChild?.full_name || 'Anak'}
                                        onSuccess={() => {
                                            setPmtRefreshKey(prev => prev + 1);
                                        }}
                                    />
                                </motion.div>

                                {/* Stats and Calendar - Stacked on mobile, side-by-side on desktop */}
                                <motion.div 
                                    className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8"
                                    variants={{
                                        hidden: { opacity: 0 },
                                        visible: {
                                            opacity: 1,
                                            transition: {
                                                staggerChildren: 0.1
                                            }
                                        }
                                    }}
                                >
                                    {/* Stats Card */}
                                    <motion.div
                                        variants={{
                                            hidden: { opacity: 0, x: -20 },
                                            visible: { opacity: 1, x: 0 }
                                        }}
                                    >
                                        <PMTStatsCard
                                            key={`stats-${pmtRefreshKey}`}
                                            childId={selectedChildId}
                                        />
                                    </motion.div>

                                    {/* Calendar */}
                                    <motion.div
                                        variants={{
                                            hidden: { opacity: 0, x: 20 },
                                            visible: { opacity: 1, x: 0 }
                                        }}
                                    >
                                        <PMTCalendar
                                            key={`calendar-${pmtRefreshKey}`}
                                            childId={selectedChildId}
                                        />
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </motion.main>
        </DashboardLayout>
    );
}

// Wrap with ErrorBoundary for graceful error handling
export default function JurnalMakanPage() {
    return (
        <ErrorBoundary>
            <JurnalMakanPageContent />
        </ErrorBoundary>
    );
}
