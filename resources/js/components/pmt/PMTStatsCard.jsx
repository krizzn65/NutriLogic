import React, { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import api from '../../lib/api';
import StatsSkeleton from './StatsSkeleton';
import logger from "../../lib/logger";


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
            logger.error('Error fetching PMT stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <StatsSkeleton />;
    }

    // Default stats if no data
    const displayStats = stats || {
        month: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
        total_logged: 0,
        total_days: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate(),
        compliance_rate: 0,
        consumed: 0,
        partial: 0,
        refused: 0
    };

    const complianceRate = displayStats.compliance_rate || 0;
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
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Statistik Bulan Ini</h3>
                    <p className="text-sm text-gray-500">{displayStats.month}</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
            </div>

            {/* Compliance Rate */}
            <div className="mb-8">
                <div className="flex items-end justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Tingkat Kepatuhan</span>
                    <span className={`text-3xl font-bold ${getComplianceColor(complianceRate)}`}>
                        {complianceRate}%
                    </span>
                </div>

                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${complianceRate}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full ${getComplianceBgColor(complianceRate)} rounded-full`}
                    />
                </div>

                <p className="text-xs text-gray-400 mt-2">
                    {displayStats.total_logged} dari {displayStats.total_days} hari tercatat
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 md:gap-4">
                <div className="p-3 md:p-6 rounded-2xl bg-green-50 border border-green-200 flex flex-col items-center gap-2 text-green-800">
                    <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
                    <div className="text-2xl md:text-3xl font-bold">{displayStats.consumed}</div>
                    <div className="text-xs md:text-sm font-medium text-center leading-tight">Habis</div>
                </div>
                <div className="p-3 md:p-6 rounded-2xl bg-yellow-50 border border-yellow-200 flex flex-col items-center gap-2 text-yellow-800">
                    <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-yellow-600" />
                    <div className="text-2xl md:text-3xl font-bold">{displayStats.partial}</div>
                    <div className="text-xs md:text-sm font-medium text-center leading-tight">Sebagian</div>
                </div>
                <div className="p-3 md:p-6 rounded-2xl bg-red-50 border border-red-200 flex flex-col items-center gap-2 text-red-800">
                    <XCircle className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
                    <div className="text-2xl md:text-3xl font-bold">{displayStats.refused}</div>
                    <div className="text-xs md:text-sm font-medium text-center leading-tight">Tidak Mau</div>
                </div>
            </div>
        </div>
    );
});

export default PMTStatsCard;

