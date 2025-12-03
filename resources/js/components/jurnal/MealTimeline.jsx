import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sunrise, Sun, Moon, Cookie, Trash2, Edit } from 'lucide-react';
import TimelineSkeleton from './TimelineSkeleton';
import NoMealsEmptyState from './NoMealsEmptyState';

const MealTimeline = memo(function MealTimeline({ meals, loading, onDelete, onEdit }) {
    // Enhanced time icons with distinct colors and background colors
    const timeIcons = {
        pagi: { 
            icon: Sunrise, 
            label: 'Pagi', 
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
            hoverBg: 'hover:bg-orange-100'
        },
        siang: { 
            icon: Sun, 
            label: 'Siang', 
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            hoverBg: 'hover:bg-yellow-100'
        },
        malam: { 
            icon: Moon, 
            label: 'Malam', 
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            borderColor: 'border-indigo-200',
            hoverBg: 'hover:bg-indigo-100'
        },
        snack: { 
            icon: Cookie, 
            label: 'Snack', 
            color: 'text-pink-600',
            bgColor: 'bg-pink-50',
            borderColor: 'border-pink-200',
            hoverBg: 'hover:bg-pink-100'
        },
    };

    // Enhanced portion badges with better styling
    const portionBadges = {
        habis: { 
            label: 'Habis', 
            color: 'bg-green-100 text-green-800 border-green-300',
            shadow: 'shadow-green-100'
        },
        setengah: { 
            label: 'Setengah', 
            color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            shadow: 'shadow-yellow-100'
        },
        sedikit: { 
            label: 'Sedikit', 
            color: 'bg-orange-100 text-orange-800 border-orange-300',
            shadow: 'shadow-orange-100'
        },
        tidak_mau: { 
            label: 'Tidak Mau', 
            color: 'bg-red-100 text-red-800 border-red-300',
            shadow: 'shadow-red-100'
        },
    };

    // Group meals by time_of_day
    const groupedMeals = meals.reduce((acc, meal) => {
        const timeKey = meal.time_of_day || 'snack';
        if (!acc[timeKey]) acc[timeKey] = [];
        acc[timeKey].push(meal);
        return acc;
    }, {});

    const timeOrder = ['pagi', 'snack', 'siang', 'malam'];

    if (loading) {
        return <TimelineSkeleton />;
    }

    if (meals.length === 0) {
        return <NoMealsEmptyState />;
    }

    return (
        <section className="space-y-8" aria-labelledby="timeline-heading">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-1 flex-1 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full shadow-sm"></div>
                <h3 id="timeline-heading" className="text-sm md:text-base font-bold text-gray-800 uppercase tracking-wider">
                    Timeline Hari Ini
                </h3>
                <div className="h-1 flex-1 bg-gradient-to-r from-purple-300 to-blue-300 rounded-full shadow-sm"></div>
            </div>

            <AnimatePresence>
                {timeOrder.map((timeKey) => {
                    const mealsInTime = groupedMeals[timeKey];
                    if (!mealsInTime || mealsInTime.length === 0) return null;

                    const TimeIcon = timeIcons[timeKey].icon;

                    return (
                        <motion.div
                            key={timeKey}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                        >
                            {/* Enhanced Time Header with distinct colors */}
                            <div className="flex items-center gap-3 md:gap-4">
                                <motion.div 
                                    className={`p-3 ${timeIcons[timeKey].bgColor} rounded-xl shadow-md border-2 ${timeIcons[timeKey].borderColor} ${timeIcons[timeKey].hoverBg} transition-colors`}
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 400 }}
                                >
                                    <TimeIcon className={`w-5 h-5 md:w-6 md:h-6 ${timeIcons[timeKey].color}`} />
                                </motion.div>
                                <h4 className="text-base md:text-xl font-bold text-gray-900">
                                    {timeIcons[timeKey].label}
                                </h4>
                                <div className="flex-1 h-0.5 bg-gradient-to-r from-gray-300 to-transparent rounded-full"></div>
                            </div>

                            {/* Enhanced Meals List with better mobile optimization */}
                            <div className="space-y-3 ml-0 md:ml-14">
                                {mealsInTime.map((meal, index) => (
                                    <motion.div
                                        key={meal.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ 
                                            delay: index * 0.05,
                                            duration: 0.3,
                                            ease: "easeOut"
                                        }}
                                        whileHover={{ 
                                            y: -2,
                                            transition: { duration: 0.2 }
                                        }}
                                        className="group bg-white rounded-xl p-4 md:p-6 border-2 border-gray-100 hover:border-blue-400 hover:shadow-lg transition-all duration-200 shadow-md"
                                    >
                                        <div className="flex items-start justify-between gap-3 md:gap-4">
                                            <div className="flex-1 space-y-3">
                                                <h5 className="text-sm md:text-lg font-bold text-gray-900 leading-tight">
                                                    {meal.description}
                                                </h5>

                                                {meal.ingredients && (
                                                    <p className="text-xs md:text-base text-gray-600 leading-relaxed">
                                                        🥘 {meal.ingredients}
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                                                    {/* Enhanced Portion Badge with shadow */}
                                                    {meal.portion && (
                                                        <motion.span 
                                                            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold border-2 shadow-sm ${portionBadges[meal.portion]?.color || 'bg-gray-100 text-gray-700 border-gray-300'}`}
                                                            whileHover={{ scale: 1.05 }}
                                                            transition={{ type: "spring", stiffness: 400 }}
                                                        >
                                                            {portionBadges[meal.portion]?.label || meal.portion}
                                                        </motion.span>
                                                    )}

                                                    {/* Time with better styling */}
                                                    <span className="text-xs md:text-sm text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-md">
                                                        🕐 {new Date(meal.created_at).toLocaleTimeString('id-ID', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>

                                                {meal.notes && (
                                                    <motion.p 
                                                        className="text-xs md:text-base text-gray-700 italic bg-gray-50 p-3 rounded-lg border border-gray-200"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: 0.1 }}
                                                    >
                                                        💭 {meal.notes}
                                                    </motion.p>
                                                )}
                                            </div>

                                            {/* Enhanced Action Buttons with better mobile visibility */}
                                            <div className="flex flex-col md:flex-row gap-1 opacity-70 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                {onEdit && (
                                                    <motion.button
                                                        onClick={() => onEdit(meal)}
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1"
                                                        aria-label={`Edit makanan ${meal.description}`}
                                                    >
                                                        <Edit className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
                                                    </motion.button>
                                                )}
                                                {onDelete && (
                                                    <motion.button
                                                        onClick={() => onDelete(meal.id)}
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-1"
                                                        aria-label={`Hapus makanan ${meal.description}`}
                                                    >
                                                        <Trash2 className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
                                                    </motion.button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </section>
    );
});

export default MealTimeline;
