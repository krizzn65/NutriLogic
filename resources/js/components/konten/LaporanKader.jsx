import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import { getStatusColor, getStatusLabel } from "../../lib/utils";
import PageHeader from "../dashboard/PageHeader";
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
    });
    const [children, setChildren] = useState([]);

    useEffect(() => {
        fetchChildren();
        fetchHistory(1);
    }, []);

    useEffect(() => {
        fetchHistory(1);
    }, [filters]);

    const fetchChildren = async () => {
        try {
            const response = await api.get("/kader/children");
            setChildren(response.data.data || []);
        } catch (err) {
            console.error("Error fetching children:", err);
        }
    };

    const fetchHistory = async (page = 1) => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                page,
                per_page: pagination.per_page,
            };

            if (filters.child_id) params.child_id = filters.child_id;
            if (filters.start_date) params.start_date = filters.start_date;
            if (filters.end_date) params.end_date = filters.end_date;

            const response = await api.get("/kader/report/history", { params });
            setHistoryData(response.data.data);
            setPagination(response.data.meta);
        } catch (err) {
            const errorMessage =
                err.response?.data?.message || "Gagal memuat riwayat. Silakan coba lagi.";
            setError(errorMessage);
            console.error("History fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters((prev) => {
            const newFilters = {
                ...prev,
                [field]: value,
            };

            // Validate date range
            if (field === "start_date" && newFilters.end_date) {
                const startDate = new Date(value);
                const endDate = new Date(newFilters.end_date);
                if (startDate > endDate) {
                    newFilters.end_date = "";
                }
            }

            if (field === "end_date" && newFilters.start_date) {
                const startDate = new Date(newFilters.start_date);
                const endDate = new Date(value);
                if (endDate < startDate) {
                    newFilters.start_date = "";
                }
            }

            return newFilters;
        });
    };

    const handlePageChange = (page) => {
        fetchHistory(page);
    };

    const handleExportChildren = async () => {
        try {
            const response = await api.get('/kader/report/export/children', {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `data_anak_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Gagal mengunduh data. Silakan coba lagi.');
            console.error('Export error:', err);
        }
    };

    const handleExportWeighings = async () => {
        if (!filters.start_date || !filters.end_date) {
            alert('Silakan pilih rentang tanggal terlebih dahulu.');
            return;
        }

        try {
            const response = await api.get(`/kader/report/export/weighings?date_from=${filters.start_date}&date_to=${filters.end_date}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `riwayat_penimbangan_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Gagal mengunduh data. Silakan coba lagi.');
            console.error('Export error:', err);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const months = [
            "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
            "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
        ];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const formatTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    // Mobile Card View
    const renderMobileCard = (item) => {
        const { datetime, child_name, child_gender, data } = item;

        return (
            <div
                key={`mobile-${item.id}`}
                className="bg-white p-4 border-b border-gray-100 last:border-0"
            >
                <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 shrink-0">
                        <img
                            src={child_gender === 'L' ? kepalaBayi : kepalaBayiCewe}
                            alt={child_name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{child_name}</h4>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Icon icon="lucide:calendar" className="w-3 h-3" />
                            {formatDate(datetime)} • {formatTime(datetime)}
                        </p>
                    </div>
                    {data.nutritional_status && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(data.nutritional_status)}`}>
                            {getStatusLabel(data.nutritional_status)}
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 rounded-xl p-3">
                    <div>
                        <p className="text-xs text-gray-500 mb-0.5">Berat</p>
                        <p className="text-sm font-bold text-gray-900">{data.weight_kg} kg</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-0.5">Tinggi</p>
                        <p className="text-sm font-bold text-gray-900">{data.height_cm ? `${data.height_cm} cm` : '-'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-0.5">Lengan</p>
                        <p className="text-sm font-bold text-gray-900">{data.muac_cm ? `${data.muac_cm} cm` : '-'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-0.5">Kepala</p>
                        <p className="text-sm font-bold text-gray-900">{data.head_circumference_cm ? `${data.head_circumference_cm} cm` : '-'}</p>
                    </div>
                </div>

                {data.notes && (
                    <div className="mt-3 flex items-start gap-2 text-xs text-gray-500 bg-yellow-50/50 p-2 rounded-lg">
                        <Icon icon="lucide:sticky-note" className="w-3.5 h-3.5 mt-0.5 text-yellow-600" />
                        <p className="italic">{data.notes}</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col w-full h-full bg-white overflow-x-hidden">
            {/* Header */}
            <div className="px-4 pt-5 md:px-10 md:pt-10 pb-2 bg-white z-20">
                <PageHeader title="Laporan & Ekspor" subtitle="Portal Kader" />

                {/* Filter Bar */}
                <div className="mt-6 flex flex-col md:flex-row gap-3 items-center justify-between pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
                        {/* Child Filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-full text-sm font-medium text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100">
                                    <Icon icon="lucide:users" className="text-gray-500 w-4 h-4" />
                                    <span>
                                        {filters.child_id
                                            ? children.find(c => c.id == filters.child_id)?.full_name || "Semua Anak"
                                            : "Semua Anak"}
                                    </span>
                                    <Icon icon="lucide:chevron-down" className="text-gray-400 w-4 h-4 ml-1" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-1">
                                <DropdownMenuItem
                                    onClick={() => handleFilterChange("child_id", "")}
                                    className="rounded-lg cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
                                >
                                    <span className="font-medium">Semua Anak</span>
                                </DropdownMenuItem>
                                {children.map((child) => (
                                    <DropdownMenuItem
                                        key={child.id}
                                        onClick={() => handleFilterChange("child_id", child.id)}
                                        className="rounded-lg cursor-pointer hover:bg-gray-50 focus:bg-gray-50 gap-2"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-600 font-bold">
                                            {child.full_name.charAt(0)}
                                        </div>
                                        <span>{child.full_name}</span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Export Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 rounded-full text-sm font-medium text-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-100">
                                    <Icon icon="lucide:download" className="w-4 h-4" />
                                    <span>Ekspor</span>
                                    <Icon icon="lucide:chevron-down" className="text-emerald-600 w-4 h-4 ml-1" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-1">
                                <DropdownMenuItem
                                    onClick={handleExportChildren}
                                    className="rounded-lg cursor-pointer hover:bg-gray-50 focus:bg-gray-50 gap-2"
                                >
                                    <Icon icon="lucide:file-spreadsheet" className="w-4 h-4 text-emerald-600" />
                                    <span>Data Anak</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={handleExportWeighings}
                                    className="rounded-lg cursor-pointer hover:bg-gray-50 focus:bg-gray-50 gap-2"
                                >
                                    <Icon icon="lucide:history" className="w-4 h-4 text-blue-600" />
                                    <span>Riwayat Penimbangan</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Date Range */}
                    <div className="flex items-center gap-2 w-full md:w-auto flex-wrap md:flex-nowrap">
                        <div className="flex items-center gap-2 flex-1 md:flex-none">
                            <DatePicker
                                value={filters.start_date}
                                onChange={(date) => handleFilterChange("start_date", date)}
                                placeholder="Mulai"
                                className="w-full md:w-auto"
                            />
                            <span className="text-gray-300">-</span>
                            <DatePicker
                                value={filters.end_date}
                                onChange={(date) => handleFilterChange("end_date", date)}
                                placeholder="Selesai"
                                className="w-full md:w-auto"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Error State */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mx-4 md:mx-10 mt-4 bg-red-50 border border-red-100 text-red-800 px-4 py-3 rounded-xl flex items-center gap-3"
                    >
                        <Icon icon="lucide:alert-circle" className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-medium">{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content */}
            <div className="flex-1 overflow-auto bg-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                {loading && historyData.length === 0 ? (
                    <LaporanKaderSkeleton rowCount={6} />
                ) : historyData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <div className="text-4xl mb-3">⚖️</div>
                        <p>Tidak ada riwayat penimbangan ditemukan</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block px-10 pb-4">
                            <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Anak</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal & Waktu</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Berat</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Tinggi</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Lengan</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Kepala</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status Gizi</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Catatan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 bg-white">
                                        {historyData.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="group hover:bg-blue-50/30 transition-colors duration-200"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-100 shadow-sm shrink-0">
                                                            <img
                                                                src={item.child_gender === 'L' ? kepalaBayi : kepalaBayiCewe}
                                                                alt={item.child_name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                                            {item.child_name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-gray-900">{formatDate(item.datetime)}</span>
                                                        <span className="text-xs text-gray-500">{formatTime(item.datetime)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className="text-sm font-bold text-gray-900">{item.data.weight_kg} kg</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className="text-sm font-bold text-gray-900">
                                                        {item.data.height_cm ? `${item.data.height_cm} cm` : '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className="text-sm font-bold text-gray-900">
                                                        {item.data.muac_cm ? `${item.data.muac_cm} cm` : '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className="text-sm font-bold text-gray-900">
                                                        {item.data.head_circumference_cm ? `${item.data.head_circumference_cm} cm` : '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {item.data.nutritional_status ? (
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.data.nutritional_status)}`}>
                                                            {getStatusLabel(item.data.nutritional_status)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-500 truncate max-w-[200px]" title={item.data.notes}>
                                                        {item.data.notes || '-'}
                                                    </p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-gray-50">
                            {historyData.map((item) => renderMobileCard(item))}
                        </div>
                    </>
                )}

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="py-6 flex justify-center">
                        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                            <button
                                onClick={() => handlePageChange(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                            >
                                ←
                            </button>

                            <span className="px-3 text-sm font-medium text-gray-600">
                                Halaman {pagination.current_page} dari {pagination.last_page}
                            </span>

                            <button
                                onClick={() => handlePageChange(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.last_page}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                            >
                                →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
