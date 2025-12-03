import React, { useRef, useEffect, useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Utensils, Apple } from 'lucide-react';

/**
 * Enhanced Tab Navigation Component
 * 
 * Features:
 * - Animated underline indicator that slides between tabs
 * - Improved hover states with background color transitions
 * - Minimum touch target size for mobile (48px)
 * - Smooth content transitions when switching tabs
 * - Distinct visual styling for active vs inactive tabs
 * 
 * @param {Object} props
 * @param {'jurnal' | 'pmt'} props.activeTab - Currently active tab
 * @param {Function} props.onTabChange - Callback when tab changes
 * @param {number} [props.mealCount] - Number of meals today (optional badge)
 * @param {'consumed' | 'partial' | 'refused' | null} [props.pmtStatus] - PMT status (optional badge)
 */
const EnhancedTabNavigation = memo(function EnhancedTabNavigation({ 
    activeTab, 
    onTabChange, 
    mealCount,
    pmtStatus 
}) {
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
    const jurnalRef = useRef(null);
    const pmtRef = useRef(null);

    // Update indicator position when active tab changes
    useEffect(() => {
        const activeRef = activeTab === 'jurnal' ? jurnalRef : pmtRef;
        if (activeRef.current) {
            const { offsetLeft, offsetWidth } = activeRef.current;
            setIndicatorStyle({
                left: offsetLeft,
                width: offsetWidth,
            });
        }
    }, [activeTab]);

    const tabs = [
        {
            id: 'jurnal',
            label: 'Jurnal Harian',
            icon: Utensils,
            ref: jurnalRef,
            badge: mealCount,
        },
        {
            id: 'pmt',
            label: 'Pantau PMT',
            icon: Apple,
            ref: pmtRef,
            badge: pmtStatus ? getStatusBadge(pmtStatus) : null,
        },
    ];

    return (
        <nav 
            className="relative mb-6"
            role="navigation"
            aria-label="Navigasi tab jurnal makan"
        >
            {/* Tab Container with border bottom */}
            <div className="relative border-b border-gray-200">
                <div className="flex gap-1" role="tablist">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <motion.button
                                key={tab.id}
                                ref={tab.ref}
                                onClick={() => onTabChange(tab.id)}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                role="tab"
                                aria-selected={isActive}
                                aria-controls={`${tab.id}-panel`}
                                tabIndex={isActive ? 0 : -1}
                                className={`
                                    relative flex items-center justify-center gap-2 
                                    px-4 sm:px-6 py-3 
                                    min-h-[48px] min-w-[120px]
                                    font-semibold text-sm sm:text-base
                                    transition-all duration-200
                                    rounded-t-lg
                                    focus:outline-none focus:ring-4 focus:ring-blue-600 focus:ring-offset-2
                                    ${isActive
                                        ? 'text-blue-600 bg-blue-50'
                                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                    }
                                `}
                                aria-label={tab.label}
                            >
                                <motion.div
                                    animate={{ 
                                        scale: isActive ? 1.1 : 1,
                                        rotate: isActive ? [0, -5, 5, 0] : 0
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Icon className="w-5 h-5" />
                                </motion.div>
                                <span className="font-semibold">{tab.label}</span>
                                
                                {/* Optional Badge */}
                                {tab.badge !== null && tab.badge !== undefined && (
                                    <motion.span 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className={`
                                            ml-1 px-2 py-0.5 rounded-full text-xs font-medium
                                            ${isActive 
                                                ? 'bg-blue-100 text-blue-700' 
                                                : 'bg-gray-100 text-gray-600'
                                            }
                                        `}
                                    >
                                        {tab.badge}
                                    </motion.span>
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Animated Underline Indicator */}
                <motion.div
                    className="absolute bottom-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-sm"
                    initial={false}
                    animate={{
                        left: indicatorStyle.left,
                        width: indicatorStyle.width,
                    }}
                    transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                    }}
                />
            </div>
        </nav>
    );
});

/**
 * Helper function to get status badge display
 */
function getStatusBadge(status) {
    const badges = {
        consumed: '✓',
        partial: '½',
        refused: '✗',
    };
    return badges[status] || null;
}

export default EnhancedTabNavigation;
