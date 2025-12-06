import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "../../lib/api";
import { useDataCache } from "../../contexts/DataCacheContext";
import {
    FileText, Download, Calendar, TrendingUp, BarChart3,
    Building2, Users, User, Baby, Scale, Activity, Filter,
    ChevronDown, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../ui/PageHeader";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from "recharts";

export default function SystemReports() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [posyandus, setPosyandus] = useState([]);
    const [selectedPosyandu, setSelectedPosyandu] = useState('all');
    const [dateRange, setDateRange] = useState({
        date_from: '',
        date_to: '',
    });

    // Custom UI States
    const [isPosyanduDropdownOpen, setIsPosyanduDropdownOpen] = useState(false);
    const [isDateFromOpen, setIsDateFromOpen] = useState(false);
    const [isDateToOpen, setIsDateToOpen] = useState(false);

    // Refs for click outside
    const posyanduRef = useRef(null);
    const dateFromRef = useRef(null);
    const dateToRef = useRef(null);

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
            if (dateFromRef.current && !dateFromRef.current.contains(event.target)) {
                setIsDateFromOpen(false);
            }
            if (dateToRef.current && !dateToRef.current.contains(event.target)) {
                setIsDateToOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchReportData = useCallback(async ({ forceRefresh = false, showLoader = false } = {}) => {
        const hasDateFilter = dateRange.date_from || dateRange.date_to;
        const cacheKey = `admin_reports_${selectedPosyandu}`;

        if (!hasDateFilter && !forceRefresh) {
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
        if (dateRange.date_from) params.date_from = dateRange.date_from;
        if (dateRange.date_to) params.date_to = dateRange.date_to;
        const requestId = ++activeReportRequestId.current;

        try {
            const response = await api.get('/admin/reports', { params });

            if (activeReportRequestId.current !== requestId) {
                return;
            }

            setReportData(response.data.data);

            if (!hasDateFilter) {
                setCachedData(cacheKey, response.data.data);
            }
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
    }, [dateRange, selectedPosyandu, getCachedData, setCachedData]);

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
        if (dateRange.date_from) params.append('date_from', dateRange.date_from);
        if (dateRange.date_to) params.append('date_to', dateRange.date_to);

        const token = localStorage.getItem('token');
        const url = `${import.meta.env.VITE_API_URL}/admin/reports/export?${params.toString()}`;
        window.open(url, '_blank');
    };

    const getStatusColor = (status) => {
        const colorMap = {
            'normal': 'bg-emerald-50 text-emerald-700 border-emerald-200',
            'kurang': 'bg-[#FDC700] text-gray-900 border-[#FDC700]',
            'sangat_kurang': 'bg-[#F43F5E] text-white border-[#F43F5E]',
            'pendek': 'bg-[#FFE06D] text-gray-900 border-[#FFE06D]',
            'sangat_pendek': 'bg-[#FE7189] text-white border-[#FE7189]',
            'kurus': 'bg-[#D9C990] text-gray-900 border-[#D9C990]',
            'sangat_kurus': 'bg-[#FB9FAF] text-rose-950 border-[#FB9FAF]',
            'lebih': 'bg-[#FFF8D2] text-gray-900 border-[#FFF8D2]',
            'gemuk': 'bg-[#FFCCD5] text-rose-900 border-[#FFCCD5]',
        };
        return colorMap[status] || 'bg-gray-100 text-gray-700 border-gray-200';
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

                {/* Posyandu Filter */}
                <div className="flex justify-start">
                    <div className="relative" ref={posyanduRef}>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">
                            Filter Posyandu
                        </label>
                        <button
                            onClick={() => setIsPosyanduDropdownOpen(!isPosyanduDropdownOpen)}
                            className="w-56 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-left flex items-center justify-between hover:bg-gray-50 transition-colors text-gray-900 shadow-sm"
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
                                    className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
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
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            <SummaryCard
                                title="Total Posyandu"
                                value={reportData.summary.total_posyandu}
                                icon={Building2}
                                color="blue"
                            />
                            <SummaryCard
                                title="Total Kader"
                                value={reportData.summary.total_kader}
                                icon={Users}
                                color="indigo"
                            />
                            <SummaryCard
                                title="Total Orang Tua"
                                value={reportData.summary.total_ibu}
                                icon={User}
                                color="violet"
                            />
                            <SummaryCard
                                title="Total Anak"
                                value={reportData.summary.total_anak}
                                icon={Baby}
                                color="pink"
                            />
                            <SummaryCard
                                title="Total Penimbangan"
                                value={reportData.summary.total_weighings}
                                icon={Scale}
                                color="emerald"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Nutritional Status Distribution */}
                            <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-800">Distribusi Status Gizi</h2>
                                </div>
                                <div className="flex flex-col md:flex-row items-center justify-between gap-8 h-full">
                                    <div className="w-full md:w-1/2 h-64 relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={Object.entries(reportData.status_distribution).map(([name, value]) => ({ name: getStatusLabel(name), value, rawName: name }))}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {Object.entries(reportData.status_distribution).map(([name, value], index) => {
                                                        const colorMap = {
                                                            normal: '#10b981', // emerald-500
                                                            kurang: '#FDC700',
                                                            sangat_kurang: '#F43F5E',
                                                            pendek: '#FFE06D',
                                                            sangat_pendek: '#FE7189',
                                                            kurus: '#D9C990',
                                                            sangat_kurus: '#FB9FAF',
                                                            lebih: '#FFF8D2',
                                                            gemuk: '#FFCCD5',
                                                        };
                                                        return <Cell key={`cell-${index}`} fill={colorMap[name] || '#94a3b8'} strokeWidth={0} />;
                                                    })}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                    itemStyle={{ color: '#1e293b', fontWeight: '600' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        {/* Center Text */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <span className="text-3xl font-bold text-gray-800">
                                                {Object.values(reportData.status_distribution).reduce((a, b) => a + b, 0)}
                                            </span>
                                            <span className="text-xs text-gray-500 font-medium">Total Anak</span>
                                        </div>
                                    </div>

                                    {/* Custom Legend */}
                                    <div className="w-full md:w-1/2 grid grid-cols-2 gap-3">
                                        {Object.entries(reportData.status_distribution).map(([status, count]) => {
                                            const colorMap = {
                                                normal: 'bg-emerald-500',
                                                kurang: 'bg-[#FDC700]',
                                                sangat_kurang: 'bg-[#F43F5E]',
                                                pendek: 'bg-[#FFE06D]',
                                                sangat_pendek: 'bg-[#FE7189]',
                                                kurus: 'bg-[#D9C990]',
                                                sangat_kurus: 'bg-[#FB9FAF]',
                                                lebih: 'bg-[#FFF8D2]',
                                                gemuk: 'bg-[#FFCCD5]',
                                            };
                                            return (
                                                <div key={status} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-3 h-3 rounded-full ${colorMap[status] || 'bg-gray-400'}`} />
                                                        <span className="text-sm text-gray-600 font-medium">{getStatusLabel(status)}</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900">{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Export Actions */}
                            <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                                        <Download className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-800">Export Data</h2>
                                </div>
                                <div className="flex flex-col gap-3 flex-1 justify-center">
                                    <ExportButton
                                        onClick={() => handleExport('summary')}
                                        label="Export Ringkasan"
                                        color="blue"
                                    />
                                    <ExportButton
                                        onClick={() => handleExport('children')}
                                        label="Export Data Anak"
                                        color="emerald"
                                    />
                                    <ExportButton
                                        onClick={() => handleExport('weighings')}
                                        label="Export Penimbangan"
                                        color="violet"
                                    />
                                </div>
                            </motion.div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Monthly Trend - Area Chart */}
                            <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-800">Tren Penimbangan</h2>
                                </div>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart
                                            data={reportData.monthly_trend}
                                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                        >
                                            <defs>
                                                <linearGradient id="colorWeighings" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                            <XAxis
                                                dataKey="month"
                                                tick={{ fontSize: 12, fill: '#64748b' }}
                                                tickLine={false}
                                                axisLine={{ stroke: '#e2e8f0' }}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 12, fill: '#64748b' }}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                                    backgroundColor: 'white'
                                                }}
                                                labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="weighings_count"
                                                name="Penimbangan"
                                                stroke="#3b82f6"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorWeighings)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>

                            {/* Monthly Statistics - Bar Chart */}
                            <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-800">Statistik Bulanan</h2>
                                </div>
                                <div className="h-72">
                                    {reportData.growth_by_posyandu.length === 0 ? (
                                        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                            Tidak ada data tersedia
                                        </div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={reportData.growth_by_posyandu}
                                                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                                                barGap={8}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                                <XAxis
                                                    dataKey="month"
                                                    tick={{ fontSize: 11, fill: '#64748b' }}
                                                    tickLine={false}
                                                    axisLine={{ stroke: '#e2e8f0' }}
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={60}
                                                />
                                                <YAxis
                                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                                    tickLine={false}
                                                    axisLine={false}
                                                />
                                                <Tooltip
                                                    cursor={{ fill: '#f8fafc' }}
                                                    contentStyle={{
                                                        borderRadius: '12px',
                                                        border: 'none',
                                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                                                        backgroundColor: 'white',
                                                        padding: '12px'
                                                    }}
                                                    labelStyle={{ fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}
                                                />
                                                <Legend
                                                    wrapperStyle={{ paddingTop: '20px' }}
                                                    iconType="circle"
                                                />
                                                <Bar
                                                    dataKey="children_count"
                                                    name="Anak Ditimbang"
                                                    fill="#8b5cf6"
                                                    radius={[6, 6, 0, 0]}
                                                    barSize={20}
                                                />
                                                <Bar
                                                    dataKey="weighings_count"
                                                    name="Total Penimbangan"
                                                    fill="#3b82f6"
                                                    radius={[6, 6, 0, 0]}
                                                    barSize={20}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
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

// Helper Components


function SummaryCard({ title, value, icon: Icon, color }) {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600",
        indigo: "bg-indigo-50 text-indigo-600",
        violet: "bg-violet-50 text-violet-600",
        pink: "bg-pink-50 text-pink-600",
        emerald: "bg-emerald-50 text-emerald-600",
    };

    return (
        <motion.div
            variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{value}</h3>
            </div>
        </motion.div>
    );
}

function ExportButton({ onClick, label, color }) {
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
            <FileText className="w-5 h-5 opacity-70 group-hover:scale-110 transition-transform" />
        </button>
    );
}
