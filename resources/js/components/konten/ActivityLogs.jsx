import React, { useState, useEffect, useCallback } from "react";
import api from "../../lib/api";
import { useDataCache } from "../../contexts/DataCacheContext";
import { Activity, Calendar, User, Filter, Download, RefreshCw, ChevronLeft, ChevronRight, Database, X } from "lucide-react";
import GenericListSkeleton from "../loading/GenericListSkeleton";
import PageHeader from "../ui/PageHeader";
import { motion, AnimatePresence } from "framer-motion";

export default function ActivityLogs() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [logs, setLogs] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [filters, setFilters] = useState({
        action: '',
        model: '',
        user_id: '',
        date_from: '',
        date_to: '',
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        perPage: 20,
        total: 0,
    });
    const [autoRefresh, setAutoRefresh] = useState(false);

    // Data caching
    const { getCachedData, setCachedData } = useDataCache();
    const hasHydratedLogs = React.useRef(false);
    const activeLogsRequestId = React.useRef(0);

    const fetchLogs = useCallback(async ({ forceRefresh = false, showLoader = false } = {}) => {
        const hasFilter = filters.action || filters.model || filters.user_id || filters.date_from || filters.date_to;

        if (!hasFilter && !forceRefresh) {
            const cachedLogs = getCachedData('admin_logs');
            if (cachedLogs) {
                setLogs(cachedLogs);
                setPagination(prev => ({ ...prev, total: cachedLogs.length }));
                setLoading(false);
                return;
            }
        }

        if (showLoader) {
            setLoading(true);
        }

        setError(null);
        const params = {};
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
            setLogs(logsData);
            setPagination(prev => ({ ...prev, total: logsData.length }));

            if (!hasFilter) {
                setCachedData('admin_logs', logsData, 60);
            }

            setLoading(false);
        } catch (err) {
            if (requestId !== activeLogsRequestId.current) {
                return;
            }

            setError(err.response?.data?.message || 'Gagal memuat log aktivitas');
            setLoading(false);
        }
    }, [filters, getCachedData, setCachedData]);

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
            setLogs(cachedLogs);
            setPagination(prev => ({ ...prev, total: cachedLogs.length }));
            setLoading(false);
            fetchLogs({ forceRefresh: true, showLoader: false });
        } else {
            fetchLogs({ forceRefresh: false, showLoader: true });
        }
    }, [fetchLogs, getCachedData]);

    // Pagination logic
    const paginatedLogs = logs.slice(
        (pagination.currentPage - 1) * pagination.perPage,
        pagination.currentPage * pagination.perPage
    );
    const totalPages = Math.ceil(pagination.total / pagination.perPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setPagination(prev => ({ ...prev, currentPage: page }));
        }
    };

    const handleClearFilters = () => {
        setFilters({
            action: '',
            model: '',
            user_id: '',
            date_from: '',
            date_to: '',
        });
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleExportCSV = () => {
        const headers = ['Waktu', 'User', 'Aksi', 'Model', 'Deskripsi', 'IP Address'];
        const rows = logs.map(log => [
            new Date(log.created_at).toLocaleString('id-ID'),
            log.user?.name || 'System',
            log.action,
            log.model || '-',
            log.description,
            log.ip_address || '-'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `activity-logs-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
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
            <div className="flex-1 overflow-auto p-6 space-y-6">

                {/* Filters & Controls */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            Filter & Kontrol
                        </h3>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setAutoRefresh(!autoRefresh)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    autoRefresh 
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                                Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
                            </button>
                            <button
                                onClick={handleExportCSV}
                                disabled={logs.length === 0}
                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Export CSV
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Aksi
                            </label>
                            <select
                                value={filters.action}
                                onChange={(e) => {
                                    setFilters({ ...filters, action: e.target.value });
                                    setPagination(prev => ({ ...prev, currentPage: 1 }));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                                <option value="">Semua Aksi</option>
                                <option value="login">Login</option>
                                <option value="logout">Logout</option>
                                <option value="create">Create</option>
                                <option value="update">Update</option>
                                <option value="delete">Delete</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Model
                            </label>
                            <select
                                value={filters.model}
                                onChange={(e) => {
                                    setFilters({ ...filters, model: e.target.value });
                                    setPagination(prev => ({ ...prev, currentPage: 1 }));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                                <option value="">Semua Model</option>
                                <option value="User">User</option>
                                <option value="Child">Child</option>
                                <option value="Article">Article</option>
                                <option value="Posyandu">Posyandu</option>
                                <option value="WeighingLog">Weighing Log</option>
                                <option value="MealLog">Meal Log</option>
                                <option value="Consultation">Consultation</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                User
                            </label>
                            <select
                                value={filters.user_id}
                                onChange={(e) => {
                                    setFilters({ ...filters, user_id: e.target.value });
                                    setPagination(prev => ({ ...prev, currentPage: 1 }));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            >
                                <option value="">Semua User</option>
                                {allUsers.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.role})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Dari Tanggal
                            </label>
                            <input
                                type="date"
                                value={filters.date_from}
                                onChange={(e) => {
                                    setFilters({ ...filters, date_from: e.target.value });
                                    setPagination(prev => ({ ...prev, currentPage: 1 }));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sampai Tanggal
                            </label>
                            <input
                                type="date"
                                value={filters.date_to}
                                onChange={(e) => {
                                    setFilters({ ...filters, date_to: e.target.value });
                                    setPagination(prev => ({ ...prev, currentPage: 1 }));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                                <AnimatePresence mode="popLayout">
                                    {paginatedLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-8 text-center text-gray-500">
                                                {hasActiveFilters ? 'Tidak ada log yang sesuai dengan filter' : 'Belum ada log aktivitas'}
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedLogs.map((log) => (
                                            <motion.tr
                                                key={log.id}
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
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
                                            </motion.tr>
                                        ))
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
                            <div className="text-sm text-gray-600">
                                Halaman {pagination.currentPage} dari {totalPages} ({pagination.total} total log)
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    disabled={pagination.currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <div className="flex items-center gap-1">
                                    {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = idx + 1;
                                        } else if (pagination.currentPage <= 3) {
                                            pageNum = idx + 1;
                                        } else if (pagination.currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + idx;
                                        } else {
                                            pageNum = pagination.currentPage - 2 + idx;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                                    pagination.currentPage === pageNum
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={pagination.currentPage === totalPages}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <strong>Catatan:</strong> Halaman ini menampilkan maksimal 100 log aktivitas terbaru dari sistem. 
                            Gunakan filter untuk mempersempit pencarian. Auto-refresh dapat diaktifkan untuk pemantauan real-time setiap 30 detik.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
