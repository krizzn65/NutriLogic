import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Baby } from 'lucide-react';

export default function NoChildrenEmptyState({ onAddChild }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-16 px-4"
        >
            {/* Icon Container */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6 shadow-lg"
            >
                <Baby className="w-12 h-12 text-blue-600" />
            </motion.div>

            {/* Heading */}
            <h3 className="text-2xl font-bold text-gray-800 mb-3 text-center">
                Belum Ada Data Anak
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-center max-w-md mb-8 leading-relaxed">
                Untuk mulai mencatat jurnal makan dan memantau PMT, silakan tambahkan data anak terlebih dahulu.
            </p>

            {/* Call to Action Button */}
            {onAddChild && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onAddChild}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                    <UserPlus className="w-5 h-5" />
                    Tambah Data Anak
                </motion.button>
            )}

            {/* Additional Info */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100 max-w-md">
                <p className="text-sm text-blue-800 text-center">
                    💡 <span className="font-semibold">Tips:</span> Anda dapat menambahkan data anak melalui menu Profil atau Dashboard
                </p>
            </div>
        </motion.div>
    );
}
