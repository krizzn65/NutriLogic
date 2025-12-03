import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { User, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import ChildSelectorSkeleton from './ChildSelectorSkeleton';

const EnhancedChildSelector = memo(function EnhancedChildSelector({ 
    children, 
    selectedChildId, 
    onChange, 
    loading = false 
}) {
    const selectedChild = children.find(c => c.id === parseInt(selectedChildId));

    // Generate a color based on child name for avatar background - cohesive palette
    const getAvatarColor = (name) => {
        const colors = [
            'bg-blue-600',
            'bg-purple-600',
            'bg-indigo-600',
            'bg-pink-600',
            'bg-teal-600',
            'bg-cyan-600',
            'bg-violet-600',
            'bg-fuchsia-600',
        ];
        const index = name ? name.charCodeAt(0) % colors.length : 0;
        return colors[index];
    };

    // Get initials from name
    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    if (loading) {
        return <ChildSelectorSkeleton />;
    }

    if (children.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
        >
            <label 
                htmlFor="child-selector"
                className="block text-sm font-medium text-gray-700 mb-2"
            >
                Pilih Anak
            </label>
            <motion.div 
                className="relative"
                whileHover={{ scale: 1.01 }}
            >
                <select
                    id="child-selector"
                    value={selectedChildId}
                    onChange={(e) => onChange(e.target.value)}
                    aria-label="Pilih anak untuk melihat jurnal makan"
                    className={cn(
                        "w-full md:w-auto min-w-[280px]",
                        "pl-14 pr-10 py-3.5",
                        "bg-white",
                        "border-2 border-gray-200",
                        "rounded-xl",
                        "shadow-md hover:shadow-lg",
                        "focus:ring-4 focus:ring-blue-600 focus:ring-offset-2 focus:border-blue-600 focus:outline-none",
                        "transition-all duration-200",
                        "appearance-none",
                        "cursor-pointer",
                        "text-base font-semibold text-gray-900",
                        // Ensure minimum touch target size on mobile
                        "min-h-[44px]"
                    )}
                >
                    {children.map((child) => (
                        <option key={child.id} value={child.id}>
                            {child.full_name}
                        </option>
                    ))}
                </select>

                {/* Avatar Icon */}
                <motion.div
                    key={selectedChildId}
                    initial={{ scale: 0.8, opacity: 0, rotate: -180 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ 
                        type: "spring",
                        stiffness: 260,
                        damping: 20
                    }}
                    className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2",
                        "w-8 h-8",
                        "rounded-full",
                        "flex items-center justify-center",
                        "text-white text-xs font-bold",
                        "pointer-events-none",
                        getAvatarColor(selectedChild?.full_name || '')
                    )}
                >
                    {selectedChild ? getInitials(selectedChild.full_name) : <User className="w-4 h-4" />}
                </motion.div>

                {/* Chevron Icon */}
                <motion.div 
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    animate={{ y: [0, 2, 0] }}
                    transition={{ 
                        repeat: Infinity, 
                        duration: 1.5,
                        ease: "easeInOut"
                    }}
                >
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                </motion.div>
            </motion.div>
        </motion.div>
    );
});

export default EnhancedChildSelector;


