import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "../../lib/api";
import { useDataCache } from "../../contexts/DataCacheContext";
import {
    FileText, Download, Calendar, TrendingUp,
    Activity, ChevronDown, Check, Users, Home, Baby, Scale
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../ui/PageHeader";
import { exportSystemReportsToExcel } from "../../utils/excelExport";
import { exportChildrenToExcel } from "../../utils/excelExportChildren";
import { exportWeighingsToExcel } from "../../utils/excelExportWeighings";
// Charts removed in favor of table-centric layout

export default function SystemReports() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [posyandus, setPosyandus] = useState([]);
    const [selectedPosyandu, setSelectedPosyandu] = useState('all');
    const [activeTab, setActiveTab] = useState('status_gizi'); // 'status_gizi', 'tren', 'statistik'

    // Custom UI States
    const [isPosyanduDropdownOpen, setIsPosyanduDropdownOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportError, setExportError] = useState(null);
    const [isExportingChildren, setIsExportingChildren] = useState(false);
    const [isExportingWeighings, setIsExportingWeighings] = useState(false);

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

    // Initial load effect
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

    // Effect to re-fetch data when posyandu filter changes
    useEffect(() => {
        if (!hasHydratedReports.current) return; // Skip if not hydrated yet
        fetchReportData({ forceRefresh: true, showLoader: true });
    }, [selectedPosyandu]);

    const handleExport = (type) => {
        const params = new URLSearchParams();
        params.append('type', type);
        if (selectedPosyandu !== 'all') params.append('posyandu_id', selectedPosyandu);

        const url = `${import.meta.env.VITE_API_URL}/admin/reports/export?${params.toString()}`;
        window.open(url, '_blank');
    };

    const handleExportToExcel = () => {
        if (!reportData) {
            setExportError('Tidak ada data yang tersedia untuk di-export. Pastikan data sudah dimuat.');
            setTimeout(() => setExportError(null), 5000);
            return;
        }

        try {
            setIsExporting(true);
            setExportError(null);

            const posyanduName = selectedPosyandu === 'all'
                ? 'Semua Posyandu'
                : posyandus.find(p => p.id === parseInt(selectedPosyandu))?.name || 'Semua Posyandu';

            exportSystemReportsToExcel(reportData, posyanduName);

            // Show success message
            setTimeout(() => {
                setIsExporting(false);
            }, 1000);

        } catch (error) {
            console.error('Error exporting to Excel:', error);
            setExportError('Gagal mengexport data: ' + error.message);
            setIsExporting(false);
            setTimeout(() => setExportError(null), 5000);
        }
    };

    const handleExportChildrenToExcel = async () => {
        try {
            setIsExportingChildren(true);
            setExportError(null);

            // Fetch children data from API
            const params = {};
            if (selectedPosyandu !== 'all') {
                params.posyandu_id = selectedPosyandu;
            }

            const response = await api.get('/admin/children', { params });
            const childrenData = response.data.data;

            if (!childrenData || childrenData.length === 0) {
                setExportError('Tidak ada data anak yang tersedia untuk di-export.');
                setTimeout(() => setExportError(null), 5000);
                setIsExportingChildren(false);
                return;
            }

            const posyanduName = selectedPosyandu === 'all'
                ? 'Semua Posyandu'
                : posyandus.find(p => p.id === parseInt(selectedPosyandu))?.name || 'Semua Posyandu';

            // Export to Excel
            exportChildrenToExcel(childrenData, posyanduName);

            setTimeout(() => {
                setIsExportingChildren(false);
            }, 1000);

        } catch (error) {
            console.error('Error exporting children to Excel:', error);
            setExportError('Gagal mengexport data anak: ' + (error.message || 'Terjadi kesalahan'));
            setIsExportingChildren(false);
            setTimeout(() => setExportError(null), 5000);
        }
    };

    const handleExportWeighingsToExcel = async () => {
        try {
            setIsExportingWeighings(true);
            setExportError(null);

            // Fetch weighing data from API with filters
            const params = {};
            if (selectedPosyandu !== 'all') {
                params.posyandu_id = selectedPosyandu;
            }

            // Use the weighing endpoint directly for better control
            const weighingResponse = await api.get('/admin/weighings', { params });
            const weighingData = weighingResponse.data.data;

            if (!weighingData || weighingData.length === 0) {
                setExportError('Tidak ada data penimbangan yang tersedia untuk di-export.');
                setTimeout(() => setExportError(null), 5000);
                setIsExportingWeighings(false);
                return;
            }

            const posyanduName = selectedPosyandu === 'all'
                ? 'Semua Posyandu'
                : posyandus.find(p => p.id === parseInt(selectedPosyandu))?.name || 'Semua Posyandu';

            // Export to Excel
            exportWeighingsToExcel(weighingData, posyanduName);

            setTimeout(() => {
                setIsExportingWeighings(false);
            }, 1000);

        } catch (error) {
            console.error('Error exporting weighings to Excel:', error);
            setExportError('Gagal mengexport data penimbangan: ' + (error.message || 'Terjadi kesalahan'));
            setIsExportingWeighings(false);
            setTimeout(() => setExportError(null), 5000);
        }
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
            <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

                {/* Filter Bar */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 lg:p-5">
                    <div>
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Filter Posyandu</p>
                        <p className="text-sm text-gray-600">Saring laporan berdasarkan posyandu yang ingin dianalisis.</p>
                    </div>

                    <div className="mt-3 flex flex-col md:block gap-3">
                        <div className="flex items-end gap-3">
                            <div className="relative flex-1 md:w-64" ref={posyanduRef}>
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

                            {/* Mobile Export Icons */}
                            <div className="flex md:hidden gap-2">
                                <button
                                    onClick={handleExportToExcel}
                                    disabled={isExporting}
                                    className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors"
                                    title="Export Ringkasan"
                                >
                                    {isExporting ? <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /> : <FileText className="w-5 h-5" />}
                                </button>
                                <button
                                    onClick={handleExportChildrenToExcel}
                                    disabled={isExportingChildren}
                                    className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-colors"
                                    title="Export Data Anak"
                                >
                                    {isExportingChildren ? <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" /> : <FileText className="w-5 h-5" />}
                                </button>
                                <button
                                    onClick={handleExportWeighingsToExcel}
                                    disabled={isExportingWeighings}
                                    className="p-2.5 bg-violet-50 text-violet-600 rounded-xl border border-violet-200 hover:bg-violet-100 transition-colors"
                                    title="Export Penimbangan"
                                >
                                    {isExportingWeighings ? <div className="w-5 h-5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" /> : <FileText className="w-5 h-5" />}
                                </button>
                            </div>
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

                {exportError && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-orange-50 border-l-4 border-orange-500 rounded-xl p-4 flex items-start gap-3"
                    >
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-orange-900 mb-1">Gagal Export Data</h4>
                            <p className="text-sm text-orange-800">{exportError}</p>
                            <p className="text-xs text-orange-600 mt-2">Jika masalah berlanjut, silakan refresh halaman atau hubungi administrator.</p>
                        </div>
                        <button
                            onClick={() => setExportError(null)}
                            className="text-orange-400 hover:text-orange-600 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </motion.div>
                )}

                {reportData && (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-8"
                    >
                        {/* Summary Stats - Sleek Stat Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {/* Total Posyandu */}
                            <motion.div
                                variants={itemVariants}
                                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow group"
                            >
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition-colors">
                                    <Home className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Posyandu</p>
                                    <p className="text-2xl font-bold text-gray-800">{reportData?.summary?.total_posyandu ?? 0}</p>
                                </div>
                            </motion.div>

                            {/* Total Kader */}
                            <motion.div
                                variants={itemVariants}
                                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow group"
                            >
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-100 transition-colors">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Kader</p>
                                    <p className="text-2xl font-bold text-gray-800">{reportData?.summary?.total_kader ?? 0}</p>
                                </div>
                            </motion.div>

                            {/* Total Orang Tua */}
                            <motion.div
                                variants={itemVariants}
                                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow group"
                            >
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-100 transition-colors">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Orang Tua</p>
                                    <p className="text-2xl font-bold text-gray-800">{reportData?.summary?.total_ibu ?? 0}</p>
                                </div>
                            </motion.div>

                            {/* Total Anak */}
                            <motion.div
                                variants={itemVariants}
                                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow group"
                            >
                                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-100 transition-colors">
                                    <Baby className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Anak</p>
                                    <p className="text-2xl font-bold text-gray-800">{reportData?.summary?.total_anak ?? 0}</p>
                                </div>
                            </motion.div>

                            {/* Total Penimbangan */}
                            <motion.div
                                variants={itemVariants}
                                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow group col-span-2 md:col-span-1"
                            >
                                <div className="p-3 bg-pink-50 text-pink-600 rounded-xl group-hover:bg-pink-100 transition-colors">
                                    <Scale className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Penimbangan</p>
                                    <p className="text-2xl font-bold text-gray-800">{reportData?.summary?.total_weighings ?? 0}</p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Mobile Tab Navigation */}
                        <div className="md:hidden bg-white p-1 rounded-xl border border-gray-200 flex">
                            <button
                                onClick={() => setActiveTab('status_gizi')}
                                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${activeTab === 'status_gizi' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                Status Gizi
                            </button>
                            <button
                                onClick={() => setActiveTab('tren')}
                                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${activeTab === 'tren' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                Tren
                            </button>
                            <button
                                onClick={() => setActiveTab('statistik')}
                                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${activeTab === 'statistik' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                Statistik
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Nutritional Status Distribution - Table */}
                            <motion.div
                                variants={itemVariants}
                                className={`lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 ${activeTab === 'status_gizi' ? 'block' : 'hidden md:block'}`}
                            >
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

                            {/* Export Actions - Desktop Only */}
                            <motion.div variants={itemVariants} className="hidden md:flex bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                                        <Download className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-800">Export Data</h2>
                                        <p className="text-xs text-gray-500">Unduh data sesuai filter yang dipilih.</p>
                                    </div>
                                </div>

                                <ExportButton
                                    onClick={handleExportToExcel}
                                    label="Export Ringkasan"
                                    color="blue"
                                    icon={FileText}
                                    disabled={isExporting}
                                    isLoading={isExporting}
                                />
                                <ExportButton
                                    onClick={handleExportChildrenToExcel}
                                    label="Export Data Anak"
                                    color="emerald"
                                    icon={FileText}
                                    disabled={isExportingChildren}
                                    isLoading={isExportingChildren}
                                />
                                <ExportButton
                                    onClick={handleExportWeighingsToExcel}
                                    label="Export Penimbangan"
                                    color="violet"
                                    icon={FileText}
                                    disabled={isExportingWeighings}
                                    isLoading={isExportingWeighings}
                                />
                            </motion.div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Monthly Trend - Table */}
                            <motion.div
                                variants={itemVariants}
                                className={`bg-white rounded-3xl shadow-sm border border-gray-100 p-6 ${activeTab === 'tren' ? 'block' : 'hidden md:block'}`}
                            >
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
                            <motion.div
                                variants={itemVariants}
                                className={`bg-white rounded-3xl shadow-sm border border-gray-100 p-6 ${activeTab === 'statistik' ? 'block' : 'hidden md:block'}`}
                            >
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

function ExportButton({ onClick, label, color, icon: Icon, disabled = false, isLoading = false }) {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200",
        emerald: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200",
        violet: "bg-violet-50 text-violet-700 hover:bg-violet-100 border-violet-200",
    };

    const disabledClass = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";

    return (
        <button
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
            className={`w-full px-4 py-3 rounded-xl border transition-all flex items-center justify-between group ${colorClasses[color]} ${disabledClass}`}
        >
            <span className="font-medium">{label}</span>
            {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
            ) : (
                <Icon className="w-5 h-5 opacity-70 group-hover:scale-110 transition-transform" />
            )}
        </button>
    );
}
