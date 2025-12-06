import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "../../lib/api";
import { useDataCache } from "../../contexts/DataCacheContext";
import {
    FileText, Download, Calendar, TrendingUp,
    Activity, ChevronDown, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../ui/PageHeader";
import { exportSystemReportsToExcel } from "../../utils/excelExport";
// Charts removed in favor of table-centric layout

export default function SystemReports() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [posyandus, setPosyandus] = useState([]);
    const [selectedPosyandu, setSelectedPosyandu] = useState('all');

    // Custom UI States
    const [isPosyanduDropdownOpen, setIsPosyanduDropdownOpen] = useState(false);

    // Refs for click outside
    const posyanduRef = useRef(null);

    // Data caching
    const { getCachedData, setCachedData } = useDataCache();
    const hasHydratedReports = React.useRef(false);
    const activeReportRequestId = React.useRef(0);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (posyanduRef.current && !posyanduRef.current.contains(event.target)) {
                setIsPosyanduDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchReportData = useCallback(async ({ forceRefresh = false, showLoader = false } = {}) => {
        const cacheKey = `admin_reports_${selectedPosyandu}`;

        if (!forceRefresh) {
            const cachedReports = getCachedData(cacheKey);
            if (cachedReports) {
                setReportData(cachedReports);
                setLoading(false);
                return;
            }
        }

        if (showLoader) {
            setLoading(true);
        }

        setError(null);
        const params = {};
        if (selectedPosyandu !== 'all') params.posyandu_id = selectedPosyandu;
        const requestId = ++activeReportRequestId.current;

        try {
            const response = await api.get('/admin/reports', { params });

            if (activeReportRequestId.current !== requestId) {
                return;
            }

            setReportData(response.data.data);
            setCachedData(cacheKey, response.data.data);
        } catch (err) {
            if (activeReportRequestId.current !== requestId) {
                return;
            }

            const errorMessage = err.response?.data?.message || 'Gagal memuat data laporan.';
            setError(errorMessage);
            console.error('Report fetch error:', err);
        } finally {
            if (activeReportRequestId.current === requestId) {
                setLoading(false);
            }
        }
    }, [selectedPosyandu, getCachedData, setCachedData]);

    // Fetch posyandus list
    useEffect(() => {
        const fetchPosyandus = async () => {
            try {
                const response = await api.get('/admin/posyandus');
                setPosyandus(response.data.data || []);
            } catch (err) {
                console.error('Failed to fetch posyandus:', err);
            }
        };
        fetchPosyandus();
    }, []);

    useEffect(() => {
        if (hasHydratedReports.current) return;
        hasHydratedReports.current = true;

        const cacheKey = `admin_reports_${selectedPosyandu}`;
        const cachedReports = getCachedData(cacheKey);
        if (cachedReports) {
            setReportData(cachedReports);
            setLoading(false);
            fetchReportData({ forceRefresh: true, showLoader: false });
        } else {
            fetchReportData({ forceRefresh: false, showLoader: true });
        }
    }, [fetchReportData, getCachedData, selectedPosyandu]);

    const handleExport = (type) => {
        const params = new URLSearchParams();
        params.append('type', type);
        if (selectedPosyandu !== 'all') params.append('posyandu_id', selectedPosyandu);

        const url = `${import.meta.env.VITE_API_URL}/admin/reports/export?${params.toString()}`;
        window.open(url, '_blank');
    };

    const handleExportToExcel = () => {
        if (!reportData) {
            alert('Tidak ada data yang tersedia untuk di-export');
            return;
        }

        const posyanduName = selectedPosyandu === 'all' 
            ? 'Semua Posyandu' 
            : posyandus.find(p => p.id === parseInt(selectedPosyandu))?.name || 'Semua Posyandu';

        exportSystemReportsToExcel(reportData, posyanduName);
    };

    const handleClearFilters = () => {
        setSelectedPosyandu('all');
        hasHydratedReports.current = false;
    };

    const getStatusLabel = (status) => {
        const labels = {
            normal: 'Normal',
            kurang: 'Kurang',
            sangat_kurang: 'Sangat Kurang',
            pendek: 'Pendek',
            sangat_pendek: 'Sangat Pendek',
            kurus: 'Kurus',
            sangat_kurus: 'Sangat Kurus',
            lebih: 'Lebih',
            gemuk: 'Gemuk',
        };
        return labels[status] || status;
    };

    const statusDistribution = reportData?.status_distribution || {};
    const monthlyTrend = reportData?.monthly_trend || [];
    const growthByPosyandu = reportData?.growth_by_posyandu || [];

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="p-4 md:p-10 w-full h-full bg-gray-50">
                <div className="animate-pulse space-y-6">
                    <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                        ))}
                    </div>
                    <div className="h-64 bg-gray-200 rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 w-full h-full bg-gray-50/50 overflow-hidden font-montserrat">
            <PageHeader title="Laporan Sistem" subtitle="Ringkasan statistik dan performa NutriLogic" />
            <div className="flex-1 overflow-auto p-6 space-y-6">

                {/* Filter Bar */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 lg:p-5">
                    <div>
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Filter Posyandu</p>
                        <p className="text-sm text-gray-600">Saring laporan berdasarkan posyandu yang ingin dianalisis.</p>
                    </div>

                    <div className="mt-3">
                        <div className="relative w-64" ref={posyanduRef}>
                            <label className="text-[11px] font-semibold text-gray-500 mb-1 block">Posyandu</label>
                            <button
                                onClick={() => setIsPosyanduDropdownOpen(!isPosyanduDropdownOpen)}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-left flex items-center justify-between hover:bg-white transition-colors text-gray-900 shadow-sm"
                            >
                                <span className="truncate">
                                    {selectedPosyandu === 'all'
                                        ? 'Semua Posyandu'
                                        : posyandus.find(p => p.id === parseInt(selectedPosyandu))?.name || 'Pilih Posyandu'}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isPosyanduDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isPosyanduDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
                                    >
                                        <div className="max-h-64 overflow-y-auto p-1">
                                            <div
                                                onClick={() => {
                                                    setSelectedPosyandu('all');
                                                    setIsPosyanduDropdownOpen(false);
                                                    hasHydratedReports.current = false;
                                                }}
                                                className="px-3 py-2 rounded-lg hover:bg-blue-50 cursor-pointer flex items-center justify-between group"
                                            >
                                                <span className={`text-sm ${selectedPosyandu === 'all' ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>
                                                    Semua Posyandu
                                                </span>
                                                {selectedPosyandu === 'all' && <Check className="w-4 h-4 text-blue-600" />}
                                            </div>
                                            {posyandus.map((posyandu) => (
                                                <div
                                                    key={posyandu.id}
                                                    onClick={() => {
                                                        setSelectedPosyandu(posyandu.id);
                                                        setIsPosyanduDropdownOpen(false);
                                                        hasHydratedReports.current = false;
                                                    }}
                                                    className="px-3 py-2 rounded-lg hover:bg-blue-50 cursor-pointer flex items-center justify-between group"
                                                >
                                                    <span className={`text-sm ${parseInt(selectedPosyandu) === posyandu.id ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>
                                                        {posyandu.name}
                                                    </span>
                                                    {parseInt(selectedPosyandu) === posyandu.id && <Check className="w-4 h-4 text-blue-600" />}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-800 flex items-center justify-between"
                    >
                        <span>{error}</span>
                        <button onClick={fetchReportData} className="text-sm font-bold underline">Coba Lagi</button>
                    </motion.div>
                )}

                {reportData && (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-8"
                    >
                        {/* Summary Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200 rounded-2xl overflow-hidden">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Keterangan</th>
                                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Jumlah</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    <tr className="hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium text-gray-800">Total Posyandu</td>
                                        <td className="py-3 px-4 text-gray-700">{reportData?.summary?.total_posyandu ?? 0}</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium text-gray-800">Total Kader</td>
                                        <td className="py-3 px-4 text-gray-700">{reportData?.summary?.total_kader ?? 0}</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium text-gray-800">Total Orang Tua</td>
                                        <td className="py-3 px-4 text-gray-700">{reportData?.summary?.total_ibu ?? 0}</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium text-gray-800">Total Anak</td>
                                        <td className="py-3 px-4 text-gray-700">{reportData?.summary?.total_anak ?? 0}</td>
                                    </tr>
                                    <tr className="hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium text-gray-800">Total Penimbangan</td>
                                        <td className="py-3 px-4 text-gray-700">{reportData?.summary?.total_weighings ?? 0}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Nutritional Status Distribution - Table */}
                            <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-800">Distribusi Status Gizi</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="text-left px-4 py-2 font-semibold text-gray-600">Status</th>
                                                <th className="text-left px-4 py-2 font-semibold text-gray-600">Jumlah</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {Object.entries(statusDistribution).map(([status, count]) => (
                                                <tr key={status} className="hover:bg-gray-50">
                                                    <td className="px-4 py-2 font-medium text-gray-800">{getStatusLabel(status)}</td>
                                                    <td className="px-4 py-2 text-gray-700">{count}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-gray-50">
                                                <td className="px-4 py-2 font-bold text-gray-800">Total Anak</td>
                                                <td className="px-4 py-2 font-bold text-gray-900">{Object.values(statusDistribution).reduce((a, b) => a + b, 0)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </motion.div>

                            {/* Export Actions */}
                            <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                                        <Download className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-800">Export Data</h2>
                                        <p className="text-xs text-gray-500">Unduh data sesuai filter yang dipilih.</p>
                                    </div>
                                </div>
                                <ExportButton onClick={handleExportToExcel} label="Export Ringkasan" color="blue" icon={FileText} />
                                <ExportButton onClick={() => handleExport('children')} label="Export Data Anak" color="emerald" icon={FileText} />
                                <ExportButton onClick={() => handleExport('weighings')} label="Export Penimbangan" color="violet" icon={FileText} />
                            </motion.div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Monthly Trend - Table */}
                            <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-800">Tren Penimbangan</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="text-left px-4 py-2 font-semibold text-gray-600">Bulan</th>
                                                <th className="text-left px-4 py-2 font-semibold text-gray-600">Jumlah Penimbangan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {monthlyTrend.map((row) => (
                                                <tr key={row.month} className="hover:bg-gray-50">
                                                    <td className="px-4 py-2 font-medium text-gray-800">{row.month}</td>
                                                    <td className="px-4 py-2 text-gray-700">{row.weighings_count}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>

                            {/* Monthly Statistics - Table */}
                            <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-800">Statistik Bulanan</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    {growthByPosyandu.length === 0 ? (
                                        <div className="py-8 text-center text-gray-400 text-sm">Tidak ada data tersedia</div>
                                    ) : (
                                        <table className="min-w-full text-sm">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    <th className="text-left px-4 py-2 font-semibold text-gray-600">Bulan</th>
                                                    <th className="text-left px-4 py-2 font-semibold text-gray-600">Anak Ditimbang</th>
                                                    <th className="text-left px-4 py-2 font-semibold text-gray-600">Total Penimbangan</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {growthByPosyandu.map((row) => (
                                                    <tr key={`${row.month}-${row.children_count}`} className="hover:bg-gray-50">
                                                        <td className="px-4 py-2 font-medium text-gray-800">{row.month}</td>
                                                        <td className="px-4 py-2 text-gray-700">{row.children_count}</td>
                                                        <td className="px-4 py-2 text-gray-700">{row.weighings_count}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

function ExportButton({ onClick, label, color, icon: Icon }) {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200",
        emerald: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200",
        violet: "bg-violet-50 text-violet-700 hover:bg-violet-100 border-violet-200",
    };

    return (
        <button
            onClick={onClick}
            className={`w-full px-4 py-3 rounded-xl border transition-all flex items-center justify-between group ${colorClasses[color]}`}
        >
            <span className="font-medium">{label}</span>
            <Icon className="w-5 h-5 opacity-70 group-hover:scale-110 transition-transform" />
        </button>
    );
}
