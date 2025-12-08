import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import api from '../../lib/api';
import PageHeader from '../ui/PageHeader';
import QuickAddForm from '../jurnal/QuickAddForm';
import NoMealsEmptyState from '../jurnal/NoMealsEmptyState';
import TodayStatusCard from '../pmt/TodayStatusCard';
import PMTCalendar from '../pmt/PMTCalendar';
import PMTStatsCard from '../pmt/PMTStatsCard';
import EnhancedChildSelector from '../jurnal/EnhancedChildSelector';
import JurnalViewSelector from '../jurnal/JurnalViewSelector';
import NoChildrenEmptyState from '../jurnal/NoChildrenEmptyState';
import ErrorBoundary from '../ErrorBoundary';
import MealDataTable from '../jurnal/MealDataTable';

function JurnalMakanPageContent() {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('jurnal'); // 'jurnal' or 'pmt'
    const [children, setChildren] = useState([]);
    const [selectedChildId, setSelectedChildId] = useState('');
    const [loading, setLoading] = useState(true);
    const [meals, setMeals] = useState([]);
    const [mealsLoading, setMealsLoading] = useState(false);
    const [pmtRefreshKey, setPmtRefreshKey] = useState(0);
    const [isAddMealModalOpen, setIsAddMealModalOpen] = useState(false);

    // Get prefilled meal data from navigation state (from NutriAssistPage)
    const prefilledMeal = location.state?.prefilledMeal || null;

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
                // If we have prefilled meal data, select that child; otherwise select first
                if (prefilledMeal?.childId) {
                    const targetChild = childrenData.find(c => c.id === prefilledMeal.childId);
                    setSelectedChildId(targetChild ? targetChild.id : childrenData[0].id);
                } else {
                    setSelectedChildId(childrenData[0].id);
                }
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
            <div className="flex flex-col h-full w-full bg-gray-50/50 font-sans">
                <div className="relative z-50">
                    <PageHeader title="Jurnal Makan" subtitle="Portal Orang Tua" />
                </div>
                <div className="flex-1 overflow-auto p-6 md:p-10">
                    <div className="max-w-6xl mx-auto animate-pulse space-y-8">
                        <div className="h-8 w-48 bg-gray-200 rounded"></div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            <div className="space-y-4">
                                <div className="h-12 w-full bg-gray-200 rounded"></div>
                                <div className="h-64 w-full bg-gray-200 rounded"></div>
                            </div>
                            <div className="lg:col-span-2 space-y-4">
                                <div className="h-32 w-full bg-gray-200 rounded"></div>
                                <div className="h-64 w-full bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full bg-gray-50/50 font-sans text-gray-900">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative z-50"
            >
                <PageHeader title="Jurnal Makan" subtitle="Portal Orang Tua" />
            </motion.div>

            <div className="flex-1 w-full overflow-y-auto custom-scrollbar no-scrollbar md:scrollbar-auto">
                <div className="p-4 md:p-8">
                    {children.length === 0 ? (
                        <div className="max-w-6xl mx-auto mt-8">
                            <NoChildrenEmptyState />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-10">
                            {/* Left Sidebar: Navigation & Stats */}
                            <div className="lg:col-span-4 space-y-4 lg:space-y-6">
                                <div className="mb-2">
                                    <p className="text-gray-500 mt-1 text-lg">Pantau asupan nutrisi {selectedChild?.full_name?.split(' ')[0] || 'anak'}.</p>
                                </div>

                                <div className="pt-4 space-y-4 lg:space-y-6">
                                    <EnhancedChildSelector
                                        children={children}
                                        selectedChildId={selectedChildId}
                                        onChange={setSelectedChildId}
                                        loading={loading}
                                    />
                                    <JurnalViewSelector
                                        activeTab={activeTab}
                                        onTabChange={setActiveTab}
                                    />
                                </div>

                                {/* Contextual Info / Stats */}
                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                    <h3 className="font-semibold text-gray-900 mb-4">Ringkasan Hari Ini</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                            <span className="text-gray-600 text-sm">Total Makan</span>
                                            <span className="font-bold text-gray-900">{meals.length}x</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                            <span className="text-gray-600 text-sm">Terakhir</span>
                                            <span className="font-bold text-gray-900">
                                                {meals.length > 0
                                                    ? new Date(meals[0].created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                                                    : '-'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Content: Feed & Actions */}
                            <div className="lg:col-span-8">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-8 mt-4 lg:mt-0"
                                >
                                    {activeTab === 'jurnal' ? (
                                        <>
                                            <div className="hidden lg:block">
                                                <QuickAddForm
                                                    childId={selectedChildId}
                                                    onSuccess={handleMealAdded}
                                                    initialData={prefilledMeal}
                                                />
                                            </div>

                                            <div className="pt-4">
                                                {meals.length === 0 && !mealsLoading && (
                                                    <NoMealsEmptyState />
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-8">
                                            <TodayStatusCard
                                                childId={selectedChildId}
                                                childName={selectedChild?.full_name || 'Anak'}
                                                onSuccess={() => setPmtRefreshKey(prev => prev + 1)}
                                            />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <PMTStatsCard
                                                    key={`stats-${pmtRefreshKey}`}
                                                    childId={selectedChildId}
                                                />
                                                <PMTCalendar
                                                    key={`calendar-${pmtRefreshKey}`}
                                                    childId={selectedChildId}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Full Width Data Table (Outside Padded Area) */}
                {activeTab === 'jurnal' && meals.length > 0 && (
                    <MealDataTable
                        meals={meals}
                        loading={mealsLoading}
                        onDelete={handleDeleteMeal}
                    />
                )}

                {/* Mobile FAB & Modal */}
                {activeTab === 'jurnal' && (
                    <>
                        {/* FAB */}
                        <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            onClick={() => setIsAddMealModalOpen(true)}
                            className="fixed bottom-24 right-6 lg:hidden z-40 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all"
                        >
                            <Plus className="w-6 h-6" />
                        </motion.button>

                        {/* Modal */}
                        <AnimatePresence>
                            {isAddMealModalOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
                                        onClick={() => setIsAddMealModalOpen(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: '100%' }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: '100%' }}
                                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                        className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl p-6 lg:hidden max-h-[90vh] overflow-y-auto"
                                    >
                                        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
                                        <QuickAddForm
                                            childId={selectedChildId}
                                            onSuccess={() => {
                                                handleMealAdded();
                                                setIsAddMealModalOpen(false);
                                            }}
                                            initialData={prefilledMeal}
                                        />
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </>
                )}

            </div>
        </div>
    );
}

export default function JurnalMakanPage() {
    return (
        <ErrorBoundary>
            <JurnalMakanPageContent />
        </ErrorBoundary>
    );
}
