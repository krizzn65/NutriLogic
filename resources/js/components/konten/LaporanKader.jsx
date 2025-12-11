import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import { useDataCache } from "../../contexts/DataCacheContext";
import { getStatusColor, getStatusLabel } from "../../lib/utils";
import { exportKaderChildrenToExcel, exportKaderWeighingsToExcel } from "../../utils/excelExport";
import PageHeader from "../ui/PageHeader";
import DashboardLayout from "../dashboard/DashboardLayout";
import { DatePicker } from "../ui/date-picker";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import kepalaBayi from "../../assets/kepala_bayi.png";
import kepalaBayiCewe from "../../assets/kepala_bayi_cewe.png";
import LaporanKaderSkeleton from "../loading/LaporanKaderSkeleton";

export default function LaporanKader() {
    // --- State Management ---
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 20,
        total: 0,
        last_page: 1,
    });
    const [filters, setFilters] = useState({
        child_id: "",
        start_date: "",
        end_date: "",
        month: "",
        year: "",
        status: "",
    });
    const [children, setChildren] = useState([]);
    const [filterMode, setFilterMode] = useState("date_range"); // "date_range" or "month_year"
    const [posyanduName, setPosyanduName] = useState("Posyandu");
    const [loadingExport, setLoadingExport] = useState(false);
    const [tableMode, setTableMode] = useState("comfortable"); // "compact" or "comfortable"
    const [sortConfig, setSortConfig] = useState({ field: null, direction: 'asc' });

    // Data caching
    const { getCachedData, setCachedData } = useDataCache();

    // --- Effects ---
    useEffect(() => {
        fetchChildren();
        fetchHistory(1);
        fetchPosyanduInfo();
    }, []);

    useEffect(() => {
        fetchHistory(1);
    }, [filters]);

    // --- Data Fetching ---
    const fetchPosyanduInfo = async () => {
        try {
            const response = await api.get("/user/profile");
            if (response.data.user?.posyandu?.name) {
                setPosyanduName(response.data.user.posyandu.name);
            }
        } catch (err) {
            console.error("Error fetching posyandu info:", err);
        }
    };

    const fetchChildren = async () => {
        const cachedChildren = getCachedData('kader_children_all');
        if (cachedChildren) {
            setChildren(cachedChildren);
            return;
        }

        try {
            const response = await api.get("/kader/children");
            setChildren(response.data.data || []);
            setCachedData('kader_children_all', response.data.data || []);
        } catch (err) {
            console.error("Error fetching children:", err);
        }
    };

    const fetchHistory = async (page = 1) => {
        const hasFilters = filters.child_id || filters.start_date || filters.end_date || filters.month || filters.year || filters.status;
        const isFirstPage = page === 1;

        if (isFirstPage && !hasFilters) {
            const cachedHistory = getCachedData('kader_report_history');
            if (cachedHistory) {
                setHistoryData(cachedHistory.data);
                setPagination(cachedHistory.meta);
                setLoading(false);
                return;
            }
        }

        try {
            setLoading(true);
            setError(null);

            const params = {
                page,
                per_page: pagination.per_page,
            };

            if (filters.child_id) params.child_id = filters.child_id;
            if (filters.status) params.status = filters.status;

            if (filterMode === "month_year" && filters.month && filters.year) {
                params.month = filters.month;
                params.year = filters.year;
            } else if (filterMode === "date_range") {
                if (filters.start_date) params.start_date = filters.start_date;
                if (filters.end_date) params.end_date = filters.end_date;
            }

            const response = await api.get("/kader/report/history", { params });
            setHistoryData(response.data.data);
            setPagination(response.data.meta);

            if (isFirstPage && !hasFilters) {
                setCachedData('kader_report_history', {
                    data: response.data.data,
                    meta: response.data.meta
                });
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Gagal memuat riwayat.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // --- Handlers ---
    const handleFilterChange = (field, value) => {
        setFilters((prev) => {
            const newFilters = { ...prev, [field]: value };
            // Date validation logic
            if (field === "start_date" && newFilters.end_date) {
                if (new Date(value) > new Date(newFilters.end_date)) newFilters.end_date = "";
            }
            if (field === "end_date" && newFilters.start_date) {
                if (new Date(value) < new Date(newFilters.start_date)) newFilters.start_date = "";
            }
            return newFilters;
        });
    };

    const handlePageChange = (page) => fetchHistory(page);

    const handleExportChildren = async () => {
        setLoadingExport(true);
        try {
            const response = await api.get("/kader/children");
            const childrenData = response.data.data || [];
            const childrenWithWeighing = await Promise.all(
                childrenData.map(async (child) => {
                    try {
                        const weighingResponse = await api.get(`/kader/weighings/child/${child.id}/history`);
                        return { ...child, weighing_logs: weighingResponse.data.data?.weighings || [] };
                    } catch { return child; }
                })
            );
            exportKaderChildrenToExcel(childrenWithWeighing, posyanduName);
        } catch (err) {
            alert('Gagal mengunduh data.');
        } finally {
            setLoadingExport(false);
        }
    };

    const handleExportWeighings = async () => {
        if (filterMode === "date_range" && (!filters.start_date || !filters.end_date)) {
            alert('Pilih rentang tanggal terlebih dahulu.');
            return;
        }
        if (filterMode === "month_year" && (!filters.month || !filters.year)) {
            alert('Pilih bulan dan tahun terlebih dahulu.');
            return;
        }

        setLoadingExport(true);
        try {
            const params = { per_page: 1000 };
            let dateRange = {};

            if (filterMode === "month_year" && filters.month && filters.year) {
                params.month = filters.month;
                params.year = filters.year;
                const startDate = new Date(filters.year, filters.month - 1, 1);
                const endDate = new Date(filters.year, filters.month, 0);
                dateRange = { from: startDate.toISOString().split('T')[0], to: endDate.toISOString().split('T')[0] };
            } else if (filters.start_date && filters.end_date) {
                params.start_date = filters.start_date;
                params.end_date = filters.end_date;
                dateRange = { from: filters.start_date, to: filters.end_date };
            }

            if (filters.child_id) params.child_id = filters.child_id;
            if (filters.status) params.status = filters.status;

            const response = await api.get('/kader/report/history', { params });
            const weighingsData = response.data.data || [];

            if (weighingsData.length === 0) {
                alert('Tidak ada data untuk periode ini.');
                return;
            }

            exportKaderWeighingsToExcel(weighingsData, posyanduName, dateRange);
        } catch (err) {
            alert('Gagal mengunduh data.');
        } finally {
            setLoadingExport(false);
        }
    };

    // --- Helpers ---
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const formatTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    const handleSort = (field) => {
        setSortConfig(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const getSortedData = () => {
        if (!sortConfig.field) return historyData;
        return [...historyData].sort((a, b) => {
            let aValue, bValue;
            if (sortConfig.field === 'date') {
                aValue = new Date(a.datetime);
                bValue = new Date(b.datetime);
            }
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const renderSortIcon = (field) => {
        if (sortConfig.field !== field) return <Icon icon="lucide:chevrons-up-down" className="w-3.5 h-3.5 text-gray-300 ml-1" />;
        return sortConfig.direction === 'asc'
            ? <Icon icon="lucide:chevron-up" className="w-3.5 h-3.5 text-blue-600 ml-1" />
            : <Icon icon="lucide:chevron-down" className="w-3.5 h-3.5 text-blue-600 ml-1" />;
    };

    const getStatusIcon = (status) => {
        const criticalStatuses = ['sangat_kurus', 'sangat_pendek', 'kurus', 'pendek'];
        if (criticalStatuses.includes(status)) {
            return <Icon icon="lucide:alert-circle" className="w-3.5 h-3.5 text-red-500 mr-1" />;
        }
        return null;
    };

    return (
        <DashboardLayout
            header={
                <PageHeader title="Laporan & Ekspor" subtitle="Portal Kader" showProfile={true} />
            }
        >
            <div className="space-y-6">
                {/* Main Card Container */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">

                    {/* Toolbar Section */}
                    <div className="p-4 lg:p-6 border-b border-gray-100 bg-white z-10 relative">
                        <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">

                            {/* Left: Primary Filters */}
                            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                                {/* Child Filter */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 rounded-xl text-sm font-medium text-gray-700 border border-gray-200 shadow-sm transition-all flex-1 sm:flex-none sm:w-auto justify-between sm:justify-start group">
                                            <div className="flex items-center gap-2 truncate">
                                                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                                                    <Icon icon="lucide:users" className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="truncate max-w-[150px]">
                                                    {filters.child_id
                                                        ? children.find(c => c.id == filters.child_id)?.full_name || "Semua Anak"
                                                        : "Semua Anak"}
                                                </span>
                                            </div>
                                            <Icon icon="lucide:chevron-down" className="text-gray-400 w-4 h-4" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-[280px] p-2">
                                        <DropdownMenuItem onClick={() => handleFilterChange("child_id", "")} className="cursor-pointer font-medium">
                                            Semua Anak
                                        </DropdownMenuItem>
                                        <div className="h-px bg-gray-100 my-1" />
                                        <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
                                            {children.map((child) => (
                                                <DropdownMenuItem key={child.id} onClick={() => handleFilterChange("child_id", child.id)} className="cursor-pointer gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-700 font-bold">
                                                        {child.full_name.charAt(0)}
                                                    </div>
                                                    {child.full_name}
                                                </DropdownMenuItem>
                                            ))}
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* Status Filter */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 rounded-xl text-sm font-medium text-gray-700 border border-gray-200 shadow-sm transition-all flex-1 sm:flex-none sm:w-auto justify-between sm:justify-start group">
                                            <div className="flex items-center gap-2 truncate">
                                                <div className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-100 transition-colors">
                                                    <Icon icon="lucide:activity" className="w-3.5 h-3.5" />
                                                </div>
                                                <span>{filters.status ? getStatusLabel(filters.status) : "Semua Status"}</span>
                                            </div>
                                            <Icon icon="lucide:chevron-down" className="text-gray-400 w-4 h-4" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-[240px] p-2">
                                        <DropdownMenuItem onClick={() => handleFilterChange("status", "")} className="cursor-pointer font-medium">
                                            Semua Status
                                        </DropdownMenuItem>
                                        <div className="h-px bg-gray-100 my-1" />
                                        {[
                                            { value: "normal", label: "Normal", color: "bg-green-500" },
                                            { value: "kurang", label: "Kurang", color: "bg-yellow-500" },
                                            { value: "sangat_kurang", label: "Sangat Kurang", color: "bg-red-500" },
                                            { value: "pendek", label: "Pendek (Stunting)", color: "bg-yellow-500" },
                                            { value: "sangat_pendek", label: "Sangat Pendek", color: "bg-red-500" },
                                            { value: "kurus", label: "Kurus (Wasting)", color: "bg-yellow-500" },
                                            { value: "sangat_kurus", label: "Sangat Kurus", color: "bg-red-500" },
                                        ].map((status) => (
                                            <DropdownMenuItem key={status.value} onClick={() => handleFilterChange("status", status.value)} className="cursor-pointer gap-2">
                                                <span className={`w-2 h-2 rounded-full ${status.color}`} />
                                                {status.label}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Right: Date & Export */}
                            <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto items-stretch sm:items-center">
                                {/* Date Filter Group */}
                                <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-200 w-full sm:w-auto">
                                    <div className="flex gap-1 mr-2">
                                        <button
                                            onClick={() => setFilterMode("date_range")}
                                            className={`p-2 rounded-lg transition-all ${filterMode === "date_range" ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                            title="Rentang Tanggal"
                                        >
                                            <Icon icon="lucide:calendar-range" className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setFilterMode("month_year")}
                                            className={`p-2 rounded-lg transition-all ${filterMode === "month_year" ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                            title="Bulan & Tahun"
                                        >
                                            <Icon icon="lucide:calendar" className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {filterMode === "date_range" ? (
                                        <div className="flex items-center gap-1 px-1">
                                            <DatePicker
                                                value={filters.start_date}
                                                onChange={(date) => handleFilterChange("start_date", date)}
                                                placeholder="Mulai"
                                                className="h-9 w-auto min-w-[100px] text-sm border-0 bg-transparent focus:ring-0 px-2 justify-start hover:bg-gray-100 rounded-lg"
                                            />
                                            <span className="text-gray-300">→</span>
                                            <DatePicker
                                                value={filters.end_date}
                                                onChange={(date) => handleFilterChange("end_date", date)}
                                                placeholder="Selesai"
                                                className="h-9 w-auto min-w-[100px] text-sm border-0 bg-transparent focus:ring-0 px-2 justify-start hover:bg-gray-100 rounded-lg"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 px-1">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="text-sm font-medium text-gray-700 hover:text-blue-600 px-2">
                                                        {filters.month ? new Date(0, filters.month - 1).toLocaleString('id-ID', { month: 'long' }) : "Bulan"}
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="h-64 overflow-y-auto">
                                                    {[...Array(12)].map((_, i) => (
                                                        <DropdownMenuItem key={i} onClick={() => handleFilterChange("month", (i + 1).toString())}>
                                                            {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <span className="text-gray-300">/</span>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="text-sm font-medium text-gray-700 hover:text-blue-600 px-2">
                                                        {filters.year || "Tahun"}
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                                        <DropdownMenuItem key={year} onClick={() => handleFilterChange("year", year.toString())}>
                                                            {year}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    )}
                                </div>

                                {/* Export Button */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            disabled={loadingExport}
                                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed min-w-[140px]"
                                        >
                                            {loadingExport ? (
                                                <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Icon icon="lucide:download" className="w-4 h-4" />
                                            )}
                                            <span>Ekspor Data</span>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-64 p-2">
                                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase">Pilih Format</div>
                                        <DropdownMenuItem onClick={handleExportChildren} className="cursor-pointer p-3 gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <Icon icon="lucide:users" className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">Data Anak</div>
                                                <div className="text-xs text-gray-500">Semua data (.xlsx)</div>
                                            </div>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleExportWeighings} className="cursor-pointer p-3 gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <Icon icon="lucide:activity" className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">Riwayat Penimbangan</div>
                                                <div className="text-xs text-gray-500">Sesuai filter (.xlsx)</div>
                                            </div>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 bg-white relative">
                        {loading && historyData.length === 0 ? (
                            <div className="p-6">
                                <LaporanKaderSkeleton rowCount={6} />
                            </div>
                        ) : error ? (
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Icon icon="lucide:alert-circle" className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">Terjadi Kesalahan</h3>
                                <p className="text-gray-500">{error}</p>
                            </div>
                        ) : historyData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <Icon icon="lucide:clipboard-x" className="w-10 h-10 text-gray-300" />
                                </div>
                                <p className="text-gray-500 font-medium">Tidak ada data ditemukan</p>
                                <p className="text-sm text-gray-400 mt-1">Coba sesuaikan filter pencarian Anda</p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-gray-50/50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">ANAK</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-blue-600" onClick={() => handleSort('date')}>
                                                    <div className="flex items-center gap-1">
                                                        TANGGAL {renderSortIcon('date')}
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">BERAT</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">TINGGI</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">LILA</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">LK</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">CATATAN</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {getSortedData().map((item) => (
                                                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 shrink-0">
                                                                <img src={item.child_gender === 'L' ? kepalaBayi : kepalaBayiCewe} alt="" className="w-full h-full object-cover" />
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-gray-900 text-sm">{item.child_name}</div>
                                                                {item.data.nutritional_status && (
                                                                    <div className="mt-1">
                                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusColor(item.data.nutritional_status)}`}>
                                                                            {getStatusLabel(item.data.nutritional_status)}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-bold text-gray-900">{formatDate(item.datetime)}</div>
                                                        <div className="text-xs text-gray-500">{formatTime(item.datetime)}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm font-bold text-gray-900">{item.data.weight_kg}</span> <span className="text-xs text-gray-500">kg</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {item.data.height_cm ? <><span className="text-sm font-bold text-gray-900">{item.data.height_cm}</span> <span className="text-xs text-gray-500">cm</span></> : <span className="text-gray-300">-</span>}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {item.data.muac_cm ? <><span className="text-sm font-bold text-gray-900">{item.data.muac_cm}</span> <span className="text-xs text-gray-500">cm</span></> : <span className="text-gray-300">-</span>}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {item.data.head_circumference_cm ? <><span className="text-sm font-bold text-gray-900">{item.data.head_circumference_cm}</span> <span className="text-xs text-gray-500">cm</span></> : <span className="text-gray-300">-</span>}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {item.data.notes ? (
                                                            <div className="flex items-start gap-1.5 max-w-[200px]">
                                                                <Icon icon="lucide:sticky-note" className="w-3.5 h-3.5 text-yellow-500 mt-0.5 shrink-0" />
                                                                <p className="text-sm text-gray-600 truncate">{item.data.notes}</p>
                                                            </div>
                                                        ) : <span className="text-gray-300">-</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile List */}
                                <div className="md:hidden divide-y divide-gray-100">
                                    {getSortedData().map((item) => (
                                        <div key={item.id} className="p-4 bg-white">
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 shrink-0">
                                                    <img src={item.child_gender === 'L' ? kepalaBayi : kepalaBayiCewe} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-semibold text-gray-900 truncate">{item.child_name}</h4>
                                                        <span className="text-xs text-gray-500">{formatDate(item.datetime)}</span>
                                                    </div>
                                                    {item.data.nutritional_status && (
                                                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusColor(item.data.nutritional_status)}`}>
                                                            {getStatusLabel(item.data.nutritional_status)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-4 gap-2 bg-gray-50 rounded-lg p-3 mb-3">
                                                <div className="text-center">
                                                    <div className="text-[10px] text-gray-500 uppercase">Berat</div>
                                                    <div className="font-bold text-gray-900 text-sm">{item.data.weight_kg}</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-[10px] text-gray-500 uppercase">Tinggi</div>
                                                    <div className="font-bold text-gray-900 text-sm">{item.data.height_cm || '-'}</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-[10px] text-gray-500 uppercase">LILA</div>
                                                    <div className="font-bold text-gray-900 text-sm">{item.data.muac_cm || '-'}</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-[10px] text-gray-500 uppercase">LK</div>
                                                    <div className="font-bold text-gray-900 text-sm">{item.data.head_circumference_cm || '-'}</div>
                                                </div>
                                            </div>
                                            {item.data.notes && (
                                                <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded border border-yellow-100 flex gap-2">
                                                    <Icon icon="lucide:sticky-note" className="w-3.5 h-3.5 text-yellow-600 shrink-0" />
                                                    {item.data.notes}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer / Pagination */}
                    {pagination.last_page > 1 && (
                        <div className="p-4 border-t border-gray-100 bg-white flex justify-center">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(pagination.current_page - 1)}
                                    disabled={pagination.current_page === 1}
                                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                                >
                                    <Icon icon="lucide:chevron-left" className="w-5 h-5 text-gray-600" />
                                </button>
                                <span className="text-sm font-medium text-gray-600">
                                    Halaman {pagination.current_page} dari {pagination.last_page}
                                </span>
                                <button
                                    onClick={() => handlePageChange(pagination.current_page + 1)}
                                    disabled={pagination.current_page === pagination.last_page}
                                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                                >
                                    <Icon icon="lucide:chevron-right" className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
