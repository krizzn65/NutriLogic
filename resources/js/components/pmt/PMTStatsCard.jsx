import React, { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import api from '../../lib/api';
import StatsSkeleton from './StatsSkeleton';
import NoPMTDataEmptyState from './NoPMTDataEmptyState';

const PMTStatsCard = memo(function PMTStatsCard({ childId }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (childId) {
            fetchStats();
        }
    }, [childId]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/pmt-logs/child/${childId}/stats`);
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching PMT stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <StatsSkeleton />;
    }

    if (!stats || stats.total_logged === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
                <NoPMTDataEmptyState />
            </div>
        );
    }

    const complianceRate = stats.compliance_rate || 0;
    const getComplianceColor = (rate) => {
        if (rate >= 80) return 'text-green-700';
        if (rate >= 60) return 'text-yellow-700';
        return 'text-red-700';
    };

    const getComplianceBgColor = (rate) => {
        if (rate >= 80) return 'bg-green-600';
        if (rate >= 60) return 'bg-yellow-600';
        return 'bg-red-600';
    };

    return (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg p-6 md:p-8 border-2 border-blue-200">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 md:mb-8">
                <div className="p-2.5 bg-blue-600 rounded-xl shadow-sm">
                    <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900">Statistik Bulan Ini</h3>
                    <p className="text-sm md:text-base text-gray-600 font-medium">{stats.month}</p>
                </div>
            </div>

            {/* Compliance Rate - Enhanced with better visual indicators */}
            <div className="mb-6 md:mb-8">
                <div className="flex items-end justify-between mb-4">
                    <span className="text-sm md:text-base font-bold text-gray-800">Tingkat Kepatuhan</span>
                    <motion.span 
                        className={`text-4xl md:text-5xl font-bold ${getComplianceColor(complianceRate)}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 150, damping: 10 }}
                    >
                        {complianceRate}%
                    </motion.span>
                </div>

                {/* Progress Bar - Enhanced with gradient and animation */}
                <div className="h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner border-2 border-gray-300 relative">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${complianceRate}%` }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        className={`h-full ${getComplianceBgColor(complianceRate)} rounded-full shadow-md relative overflow-hidden`}
                    >
                        {/* Shimmer effect */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        />
                    </motion.div>
                </div>

                <p className="text-xs md:text-sm text-gray-600 mt-3 font-semibold">
                    Berdasarkan {stats.total_logged} dari {stats.total_days} hari yang tercatat
                </p>
            </div>

            {/* Stats Grid - Enhanced with better visual indicators and animations */}
            <div className="grid grid-cols-3 gap-3 md:gap-5">
                {/* Consumed */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl p-4 md:p-6 border-2 border-green-200 shadow-md hover:shadow-xl transition-all"
                >
                    <div className="flex flex-col items-center text-center space-y-2 md:space-y-3">
                        <motion.div 
                            className="p-2.5 bg-green-100 rounded-xl"
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                        >
                            <CheckCircle className="w-5 h-5 md:w-7 md:h-7 text-green-600" />
                        </motion.div>
                        <motion.div 
                            className="text-3xl md:text-4xl font-bold text-green-600"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                        >
                            {stats.consumed}
                        </motion.div>
                        <div className="text-xs md:text-sm text-gray-700 font-bold">
                            Habis
                        </div>
                        {/* Visual indicator badge */}
                        <div className="w-full h-1.5 bg-green-600 rounded-full mt-1"></div>
                    </div>
                </motion.div>

                {/* Partial */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl p-4 md:p-6 border-2 border-yellow-200 shadow-md hover:shadow-xl transition-all"
                >
                    <div className="flex flex-col items-center text-center space-y-2 md:space-y-3">
                        <motion.div 
                            className="p-2.5 bg-yellow-100 rounded-xl"
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                        >
                            <AlertCircle className="w-5 h-5 md:w-7 md:h-7 text-yellow-600" />
                        </motion.div>
                        <motion.div 
                            className="text-3xl md:text-4xl font-bold text-yellow-600"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                        >
                            {stats.partial}
                        </motion.div>
                        <div className="text-xs md:text-sm text-gray-700 font-bold">
                            Sebagian
                        </div>
                        {/* Visual indicator badge */}
                        <div className="w-full h-1.5 bg-yellow-600 rounded-full mt-1"></div>
                    </div>
                </motion.div>

                {/* Refused */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl p-4 md:p-6 border-2 border-red-200 shadow-md hover:shadow-xl transition-all"
                >
                    <div className="flex flex-col items-center text-center space-y-2 md:space-y-3">
                        <motion.div 
                            className="p-2.5 bg-red-100 rounded-xl"
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                        >
                            <XCircle className="w-5 h-5 md:w-7 md:h-7 text-red-600" />
                        </motion.div>
                        <motion.div 
                            className="text-3xl md:text-4xl font-bold text-red-600"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                        >
                            {stats.refused}
                        </motion.div>
                        <div className="text-xs md:text-sm text-gray-700 font-bold">
                            Tidak Mau
                        </div>
                        {/* Visual indicator badge */}
                        <div className="w-full h-1.5 bg-red-600 rounded-full mt-1"></div>
                    </div>
                </motion.div>
            </div>

            {/* Insight */}
            {complianceRate >= 80 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 bg-green-50 border-2 border-green-300 rounded-xl p-4 shadow-sm"
                >
                    <p className="text-sm md:text-base text-green-800 font-bold">
                        🎉 Luar biasa! Tingkat kepatuhan sangat baik. Pertahankan!
                    </p>
                </motion.div>
            )}

            {complianceRate >= 60 && complianceRate < 80 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 shadow-sm"
                >
                    <p className="text-sm md:text-base text-yellow-800 font-bold">
                        💪 Cukup baik! Tingkatkan lagi agar anak mendapat nutrisi optimal.
                    </p>
                </motion.div>
            )}

            {complianceRate < 60 && stats.total_logged > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 bg-red-50 border-2 border-red-300 rounded-xl p-4 shadow-sm"
                >
                    <p className="text-sm md:text-base text-red-800 font-bold">
                        ⚠️ Perlu perhatian. Pastikan anak rutin mengonsumsi PMT dari Posyandu.
                    </p>
                </motion.div>
            )}
        </div>
    );
});

export default PMTStatsCard;
