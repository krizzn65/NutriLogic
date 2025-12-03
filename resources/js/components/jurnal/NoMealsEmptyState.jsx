import React from 'react';
import { motion } from 'framer-motion';
import { Utensils, Sparkles } from 'lucide-react';

export default function NoMealsEmptyState() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-12 px-4"
        >
            {/* Icon Container with Animation */}
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 150 }}
                className="relative w-20 h-20 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mb-6 shadow-md"
            >
                <Utensils className="w-10 h-10 text-orange-600" />
                
                {/* Sparkle decoration */}
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                    className="absolute -top-1 -right-1"
                >
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                </motion.div>
            </motion.div>

            {/* Heading */}
            <h4 className="text-xl font-bold text-gray-800 mb-2 text-center">
                Belum Ada Catatan Hari Ini
            </h4>

            {/* Encouraging Message */}
            <p className="text-gray-600 text-center max-w-sm mb-4 leading-relaxed">
                Yuk, mulai catat makanan yang sudah dikonsumsi hari ini! Setiap catatan membantu memantau nutrisi anak dengan lebih baik.
            </p>

            {/* Motivational Tips */}
            <div className="flex flex-col gap-2 mt-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-2 text-sm text-gray-500"
                >
                    <span className="text-lg">🍎</span>
                    <span>Catat setiap waktu makan</span>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-2 text-sm text-gray-500"
                >
                    <span className="text-lg">📝</span>
                    <span>Tambahkan detail porsi dan bahan</span>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-2 text-sm text-gray-500"
                >
                    <span className="text-lg">⭐</span>
                    <span>Pantau perkembangan nutrisi</span>
                </motion.div>
            </div>

            {/* Decorative Element */}
            <div className="mt-6 text-4xl opacity-20">
                🍽️
            </div>
        </motion.div>
    );
}
