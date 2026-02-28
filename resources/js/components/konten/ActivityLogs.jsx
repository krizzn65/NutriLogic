import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import api from "../../lib/api";
import { useDataCache } from "../../contexts/DataCacheContext";
import {
    Activity, Calendar, User, Filter, Download, RefreshCw, X,
    ChevronDown, Check, ChevronLeft, ChevronRight
} from "lucide-react";
import GenericListSkeleton from "../loading/GenericListSkeleton";
import PageHeader from "../ui/PageHeader";
import { motion, AnimatePresence } from "framer-motion";
import { exportActivityLogsToExcel } from "../../utils/excelExportActivityLogs";

export default function ActivityLogs() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [logs, setLogs] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0,
        from: 0,
        to: 0,
    });
    const [filters, setFilters] = useState({
        action: '',
        model: '',
        user_id: '',
        date_from: '',
        date_to: '',
    });
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);

    // Data caching
    const { getCachedData, setCachedData } = useDataCache();
    const hasHydratedLogs = React.useRef(false);
    const activeLogsRequestId = React.useRef(0);

    const fetchLogs = useCallback(async ({ forceRefresh = false, showLoader = false, page = 1 } = {}) => {
        const hasFilter = filters.action || filters.model || filters.user_id || filters.date_from || filters.date_to;

        if (!hasFilter && !forceRefresh && page === 1) {
            const cachedLogs = getCachedData('admin_logs');
            if (cachedLogs) {
                setLogs(cachedLogs.data || []);
                setPagination(cachedLogs.pagination || pagination);
                setLoading(false);
                return;
            }
        }

        if (showLoader) {
            setLoading(true);
        }

        setError(null);
        const params = { page, per_page: pagination.per_page };
        if (filters.action) params.action = filters.action;
        if (filters.model) params.model = filters.model;
        if (filters.user_id) params.user_id = filters.user_id;
        if (filters.date_from) params.date_from = filters.date_from;
        if (filters.date_to) params.date_to = filters.date_to;

        const requestId = ++activeLogsRequestId.current;

        try {
            const response = await api.get('/admin/activity-logs', { params });

            if (requestId !== activeLogsRequestId.current) {
                return;
            }

            const logsData = response.data?.data || [];
            const paginationData = {
                current_page: response.data?.current_page || 1,
                last_page: response.data?.last_page || 1,
                per_page: response.data?.per_page || 20,
                total: response.data?.total || 0,
                from: response.data?.from || 0,
                to: response.data?.to || 0,
            };

            setLogs(logsData);
            setPagination(paginationData);

            if (!hasFilter && page === 1) {
                setCachedData('admin_logs', { data: logsData, pagination: paginationData }, 60);
            }

            setLoading(false);
        } catch (err) {
            if (requestId !== activeLogsRequestId.current) {
                return;
            }

            setError(err.response?.data?.message || 'Gagal memuat log aktivitas');
            setLoading(false);
        }
    }, [filters, pagination.per_page, getCachedData, setCachedData]);

    // Fetch users for filter dropdown
    const fetchUsers = useCallback(async () => {
        try {
            const response = await api.get('/admin/users');
            setAllUsers(response.data?.data || []);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Auto-refresh interval
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            fetchLogs({ forceRefresh: true, showLoader: false });
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [autoRefresh, fetchLogs]);

    useEffect(() => {
        if (hasHydratedLogs.current) return;
        hasHydratedLogs.current = true;

        const cachedLogs = getCachedData('admin_logs');
        if (cachedLogs) {
            setLogs(cachedLogs.data || []);
            setPagination(cachedLogs.pagination || pagination);
            setLoading(false);
            fetchLogs({ forceRefresh: true, showLoader: false });
        } else {
            fetchLogs({ forceRefresh: false, showLoader: true });
        }
    }, [fetchLogs, getCachedData]);

    // Auto-fetch when filters change
    useEffect(() => {
        if (!hasHydratedLogs.current) return; // Skip initial render

        const hasFilter = filters.action || filters.model || filters.user_id || filters.date_from || filters.date_to;
        if (hasFilter) {
            fetchLogs({ forceRefresh: true, showLoader: false });
        } else {
            // When all filters cleared, fetch all data
            fetchLogs({ forceRefresh: true, showLoader: false });
        }
    }, [filters, fetchLogs]);

    const handleClearFilters = () => {
        setFilters({
            action: '',
            model: '',
            user_id: '',
            date_from: '',
            date_to: '',
        });
    };

    const handleExportToExcel = async () => {
        // Validation
        if (!logs || logs.length === 0) {
            alert('Tidak ada data untuk diexport');
            return;
        }

        try {
            setIsExporting(true);

            // Prepare data - ensure all required fields exist
            const validLogs = logs.filter(log => log && log.created_at);

            if (validLogs.length === 0) {
                throw new Error('Tidak ada data valid untuk diexport');
            }

            // Export to Excel with current filters
            const result = await exportActivityLogsToExcel(validLogs, filters);

            if (result && result.success) {
                // Tampilkan notifikasi sukses
                setTimeout(() => {
                    setIsExporting(false);
                }, 1000);
            } else {
                throw new Error('Export gagal tanpa pesan error');
            }

        } catch (error) {
            console.error('Error exporting to Excel:', error);

            // User-friendly error message
            const errorMessage = error.message || 'Terjadi kesalahan saat mengexport data';
            alert(`Gagal mengexport data:\n${errorMessage}\n\nSilakan coba lagi atau hubungi administrator.`);

            setIsExporting(false);
        }
    };

    const getActionColor = (action) => {
        const colors = {
            login: 'bg-green-100 text-green-800',
            logout: 'bg-gray-100 text-gray-800',
            create: 'bg-blue-100 text-blue-800',
            update: 'bg-yellow-100 text-yellow-800',
            delete: 'bg-red-100 text-red-800',
        };
        return colors[action] || 'bg-gray-100 text-gray-800';
    };

    const getModelColor = (model) => {
        if (!model) return 'bg-gray-100 text-gray-600';
        return 'bg-purple-100 text-purple-800';
    };

    const hasActiveFilters = filters.action || filters.model || filters.user_id || filters.date_from || filters.date_to;

    // Dropdown Options
    const actionOptions = [
        { value: '', label: 'Semua Aksi' },
        { value: 'login', label: 'Login' },
        { value: 'logout', label: 'Logout' },
        { value: 'create', label: 'Create' },
        { value: 'update', label: 'Update' },
        { value: 'delete', label: 'Delete' },
    ];

    const modelOptions = [
        { value: '', label: 'Semua Model' },
        { value: 'User', label: 'User' },
        { value: 'Child', label: 'Anak' },
        { value: 'Posyandu', label: 'Posyandu' },
        { value: 'WeighingLog', label: 'Penimbangan' },
        { value: 'MealLog', label: 'Jurnal Makan' },
        { value: 'Consultation', label: 'Konsultasi' },
    ];

    const userOptions = [
        { value: '', label: 'Semua User' },
        ...allUsers.map(user => ({ value: user.id, label: `${user.name} (${user.role})` }))
    ];

    if (loading && logs.length === 0) {
        return (
            <div className="p-4 md:p-10 w-full h-full bg-gray-50">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 w-full h-full bg-gray-50/50 overflow-hidden font-montserrat">
            <PageHeader title="Log Aktivitas" subtitle="Riwayat aktivitas pengguna sistem" />
            <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

                {/* Filters & Controls */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-all duration-300">
                    <div className="flex items-center justify-between mb-0 md:mb-4">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="text-sm font-semibold text-gray-700 flex items-center gap-2 md:cursor-default"
                        >
                            <Filter className="w-4 h-4" />
                            <span>Filter & Kontrol</span>
                            <ChevronDown className={`w-4 h-4 md:hidden transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setAutoRefresh(!autoRefresh)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${autoRefresh
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                title="Auto Refresh"
                            >
                                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                                <span className="hidden md:inline">Auto Refresh {autoRefresh ? 'ON' : 'OFF'}</span>
                            </button>
                            <button
                                onClick={handleExportToExcel}
                                disabled={logs.length === 0 || isExporting}
                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                                title="Export Excel"
                            >
                                {isExporting ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                    <Download className="w-4 h-4" />
                                )}
                                <span className="hidden md:inline">{isExporting ? 'Exporting...' : 'Export Excel'}</span>
                            </button>
                        </div>
                    </div>

                    <div className={`grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mt-4 md:mt-0 ${isFilterOpen ? 'grid' : 'hidden md:grid'}`}>
                        <div className="relative col-span-2 md:col-span-1">
                            <CustomDropdown
                                label="Aksi"
                                value={filters.action}
                                options={actionOptions}
                                onChange={(value) => setFilters({ ...filters, action: value })}
                                isOpen={openDropdown === 'action'}
                                onToggle={(val) => setOpenDropdown(val ? 'action' : null)}
                            />
                        </div>

                        <div className="relative col-span-2 md:col-span-1">
                            <CustomDropdown
                                label="Model"
                                value={filters.model}
                                options={modelOptions}
                                onChange={(value) => setFilters({ ...filters, model: value })}
                                isOpen={openDropdown === 'model'}
                                onToggle={(val) => setOpenDropdown(val ? 'model' : null)}
                            />
                        </div>

                        <div className="relative col-span-2 md:col-span-1">
                            <CustomDropdown
                                label="User"
                                value={filters.user_id}
                                options={userOptions}
                                onChange={(value) => setFilters({ ...filters, user_id: value })}
                                isOpen={openDropdown === 'user'}
                                onToggle={(val) => setOpenDropdown(val ? 'user' : null)}
                            />
                        </div>

                        <div className="relative">
                            <CustomDatePicker
                                label="Dari Tanggal"
                                value={filters.date_from}
                                onChange={(value) => setFilters({ ...filters, date_from: value })}
                            />
                        </div>

                        <div className="relative">
                            <CustomDatePicker
                                label="Sampai Tanggal"
                                value={filters.date_to}
                                onChange={(value) => setFilters({ ...filters, date_to: value })}
                            />
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <div className="mt-4 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                {logs.length} log ditemukan
                            </div>
                            <button
                                onClick={handleClearFilters}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4" />
                                Reset Filter
                            </button>
                        </div>
                    )}
                </div>

                {/* Error State */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-200 rounded-lg p-4"
                    >
                        <p className="text-red-800">{error}</p>
                        <button
                            onClick={() => fetchLogs({ forceRefresh: true, showLoader: true })}
                            className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                            Coba Lagi
                        </button>
                    </motion.div>
                )}

                {/* Stats Summary */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
                    {[
                        { label: 'Login', count: logs.filter(l => l.action === 'login').length, color: 'green' },
                        { label: 'Logout', count: logs.filter(l => l.action === 'logout').length, color: 'gray' },
                        { label: 'Create', count: logs.filter(l => l.action === 'create').length, color: 'blue' },
                        { label: 'Update', count: logs.filter(l => l.action === 'update').length, color: 'yellow' },
                        { label: 'Delete', count: logs.filter(l => l.action === 'delete').length, color: 'red' },
                    ].map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                        >
                            <div className={`text-2xl font-bold text-${stat.color}-600`}>{stat.count}</div>
                            <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Mobile View: Cards */}
                <div className="md:hidden space-y-4">
                    {logs.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200 p-4">
                            {hasActiveFilters ? 'Tidak ada log yang sesuai dengan filter' : 'Belum ada log aktivitas'}
                        </div>
                    ) : (
                        logs.map((log) => (
                            <div key={log.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-gray-100 rounded-full">
                                            <User className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{log.user?.name || 'System'}</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(log.created_at).toLocaleString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                                        {log.action}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getModelColor(log.model)}`}>
                                            {log.model || '-'}
                                        </span>
                                        <span className="text-gray-400 text-xs">•</span>
                                        <span className="text-xs text-gray-500">{log.ip_address || '-'}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        {log.description}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Waktu</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">User</th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Aksi</th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Model</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Deskripsi</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">IP Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-gray-500">
                                            {hasActiveFilters ? 'Tidak ada log yang sesuai dengan filter' : 'Belum ada log aktivitas'}
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr
                                            key={log.id}
                                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    {new Date(log.created_at).toLocaleString('id-ID', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-1 text-sm text-gray-700">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    {log.user?.name || 'System'}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getModelColor(log.model)}`}>
                                                    {log.model || '-'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-700">
                                                {log.description}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-500">
                                                {log.ip_address || '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Unified Pagination for Both Mobile & Desktop */}
                <PaginationUI
                    currentPage={pagination.current_page}
                    totalPages={pagination.last_page}
                    total={pagination.total}
                    onPageChange={(page) => fetchLogs({ forceRefresh: true, page })}
                    label="log aktivitas"
                />
            </div>
        </div>
    );
}

// Helper Components

// Pagination UI Component (consistent with DataAnakDetail)
function PaginationUI({ currentPage, totalPages, total, onPageChange, label }) {
    if (total === 0) return null;

    return (
        <div className="flex flex-col items-center gap-3 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            {totalPages > 1 && (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm disabled:hover:bg-white"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="flex items-center gap-1">
                        {[...Array(totalPages)].map((_, i) => {
                            const pageNum = i + 1;
                            const show = pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - currentPage) <= 1;
                            if (!show && (pageNum === currentPage - 2 || pageNum === currentPage + 2)) {
                                return <span key={i} className="px-1 text-gray-400 text-sm">...</span>;
                            }
                            if (!show) return null;
                            return (
                                <button
                                    key={i}
                                    onClick={() => onPageChange(pageNum)}
                                    className={`min-w-[32px] h-8 rounded-lg text-sm font-medium transition-all ${pageNum === currentPage
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm disabled:hover:bg-white"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            )}
            <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                Halaman {currentPage} dari {totalPages || 1} • Total: <span className="font-bold text-gray-700">{total}</span> {label}
            </div>
        </div>
    );
}

function CustomDropdown({ label, value, options, onChange, isOpen, onToggle }) {
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

    // Calculate dropdown position when opened
    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width
            });
        }
    }, [isOpen]);

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen &&
                buttonRef.current && !buttonRef.current.contains(event.target) &&
                dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onToggle(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onToggle]);

    const selectedOption = options.find(opt => String(opt.value) === String(value));

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <button
                ref={buttonRef}
                type="button"
                onClick={() => onToggle(!isOpen)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-left flex items-center justify-between hover:bg-gray-50 transition-colors text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
                <span className="truncate">
                    {selectedOption ? selectedOption.label : `Pilih ${label}`}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && createPortal(
                <>
                    <div
                        className="fixed inset-0 z-[9998] bg-transparent"
                        onClick={() => onToggle(false)}
                    />
                    <motion.div
                        ref={dropdownRef}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: 'fixed',
                            top: dropdownPos.top,
                            left: dropdownPos.left,
                            width: dropdownPos.width,
                        }}
                        className="z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden"
                    >
                        <div className="max-h-60 overflow-y-auto p-1">
                            {options.map((option) => (
                                <div
                                    key={option.value}
                                    onClick={() => {
                                        onChange(option.value);
                                        onToggle(false);
                                    }}
                                    className="px-3 py-2 rounded-md hover:bg-blue-50 cursor-pointer flex items-center justify-between group transition-colors"
                                >
                                    <span className={`text-sm ${String(value) === String(option.value) ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>
                                        {option.label}
                                    </span>
                                    {String(value) === String(option.value) && <Check className="w-4 h-4 text-blue-600" />}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </>,
                document.body
            )}
        </div>
    );
}

function CustomDatePicker({ label, value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [pickerDate, setPickerDate] = useState(value ? new Date(value) : new Date());
    const containerRef = useRef(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

    const toggleDatePicker = (e) => {
        if (!isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + 5,
                left: rect.left
            });
        }
        setIsOpen(!isOpen);
    };

    // Update picker date when value changes externally
    useEffect(() => {
        if (value) {
            setPickerDate(new Date(value));
        }
    }, [value]);

    return (
        <div className="relative" ref={containerRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <button
                type="button"
                onClick={toggleDatePicker}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-left text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all flex items-center justify-between hover:bg-gray-50"
            >
                <span className={!value ? "text-gray-400" : ""}>
                    {value ? new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : "dd/mm/yyyy"}
                </span>
                <Calendar className="w-4 h-4 text-gray-400" />
            </button>

            {isOpen && createPortal(
                <>
                    <div
                        className="fixed inset-0 z-[9998] bg-transparent"
                        onClick={() => setIsOpen(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            top: dropdownPos.top,
                            left: dropdownPos.left,
                            position: 'fixed'
                        }}
                        className="z-[9999] p-4 bg-white border border-gray-200 rounded-xl shadow-xl w-[320px]"
                    >
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between mb-4">
                            <button
                                type="button"
                                onClick={() => setPickerDate(new Date(pickerDate.setMonth(pickerDate.getMonth() - 1)))}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <span className="font-semibold text-gray-800 text-sm">
                                {pickerDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                            </span>
                            <button
                                type="button"
                                onClick={() => setPickerDate(new Date(pickerDate.setMonth(pickerDate.getMonth() + 1)))}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ChevronRight className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        {/* Days Header */}
                        <div className="grid grid-cols-7 mb-2">
                            {['Mg', 'Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb'].map((day) => (
                                <div key={day} className="text-xs font-medium text-gray-400 text-center py-1">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {(() => {
                                const daysInMonth = new Date(pickerDate.getFullYear(), pickerDate.getMonth() + 1, 0).getDate();
                                const firstDay = new Date(pickerDate.getFullYear(), pickerDate.getMonth(), 1).getDay();
                                const days = [];

                                // Empty slots for previous month
                                for (let i = 0; i < firstDay; i++) {
                                    days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
                                }

                                // Days of current month
                                for (let i = 1; i <= daysInMonth; i++) {
                                    const currentDateStr = `${pickerDate.getFullYear()}-${String(pickerDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                                    const isSelected = value === currentDateStr;
                                    const isToday = new Date().toISOString().split('T')[0] === currentDateStr;

                                    days.push(
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => {
                                                onChange(currentDateStr);
                                                setIsOpen(false);
                                            }}
                                            className={`w-8 h-8 text-xs rounded-full flex items-center justify-center transition-all
                                                ${isSelected
                                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                                                    : isToday
                                                        ? 'text-blue-600 font-bold bg-blue-50'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            {i}
                                        </button>
                                    );
                                }
                                return days;
                            })()}
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
                            <button
                                type="button"
                                onClick={() => {
                                    onChange("");
                                    setIsOpen(false);
                                }}
                                className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                            >
                                Hapus
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const today = new Date();
                                    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                                    onChange(todayStr);
                                    setPickerDate(today);
                                    setIsOpen(false);
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                            >
                                Hari Ini
                            </button>
                        </div>
                    </motion.div>
                </>
                , document.body)}
        </div>
    );
}
