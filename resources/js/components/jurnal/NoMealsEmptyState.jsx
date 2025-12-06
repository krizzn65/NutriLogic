import React from 'react';
import { motion } from 'framer-motion';
import { Utensils } from 'lucide-react';

export default function NoMealsEmptyState() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-row items-center gap-6 py-4"
        >
            <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center animate-pulse shrink-0">
                <Utensils className="w-10 h-10 text-blue-400/50" />
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-600 mb-1">Belum Ada Catatan</h3>
                <p className="text-gray-500 max-w-lg text-sm leading-relaxed">
                    Jurnal makan hari ini masih kosong. Yuk, mulai catat apa yang dimakan si kecil!
                </p>
            </div>
        </motion.div>
    );
}
