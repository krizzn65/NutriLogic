import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Info, TrendingUp } from 'lucide-react';

export default function NoPMTDataEmptyState() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-12 px-4"
        >
            {/* Icon Container */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 180 }}
                className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-md"
            >
                <Calendar className="w-10 h-10 text-green-600" />
            </motion.div>

            {/* Heading */}
            <h4 className="text-xl font-bold text-gray-800 mb-2 text-center">
                Belum Ada Data PMT
            </h4>

            {/* Description */}
            <p className="text-gray-600 text-center max-w-md mb-6 leading-relaxed">
                Pantau konsumsi PMT (Pemberian Makanan Tambahan) anak Anda setiap hari untuk memastikan nutrisi yang optimal.
            </p>

            {/* Info Box */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-100 max-w-md mb-6"
            >
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        <Info className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h5 className="font-semibold text-gray-800 mb-1">
                            Apa itu PMT?
                        </h5>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            PMT adalah program pemberian makanan tambahan untuk mendukung pertumbuhan dan perkembangan anak. Catat status konsumsi PMT setiap hari untuk monitoring yang lebih baik.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Features List */}
            <div className="w-full max-w-md space-y-3">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100"
                >
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">✓</span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-800">Catat Status Harian</p>
                        <p className="text-xs text-gray-500">Habis, Sebagian, atau Tidak Mau</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100"
                >
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-800">Lihat Kalender Bulanan</p>
                        <p className="text-xs text-gray-500">Pantau konsistensi konsumsi PMT</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100"
                >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-800">Statistik Konsumsi</p>
                        <p className="text-xs text-gray-500">Lihat persentase dan tren konsumsi</p>
                    </div>
                </motion.div>
            </div>

            {/* Call to Action Text */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-6 text-center"
            >
                <p className="text-sm text-gray-500">
                    👆 Mulai dengan mengisi status PMT hari ini di atas
                </p>
            </motion.div>
        </motion.div>
    );
}
