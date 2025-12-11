import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Calendar,
    Clock,
    MapPin,
    Plus,
    Search,
    Filter,
    ChevronDown,
    Check,
    MoreVertical,
    Trash2,
    CheckCircle,
    AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../lib/api";
import { useDataCache } from "../../contexts/DataCacheContext";
import { formatAge } from "../../lib/utils";
import AddScheduleModal from "./AddScheduleModal";
import PageHeader from "../ui/PageHeader";
import DashboardLayout from "../dashboard/DashboardLayout";
import kepalaBayi from "../../assets/kepala_bayi.png";
import kepalaBayiCewe from "../../assets/kepala_bayi_cewe.png";
import JadwalPosyanduSkeleton from "../loading/JadwalPosyanduSkeleton";

export default function JadwalPosyandu() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({
        status: "",
    });

    // Dropdown states
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const statusDropdownRef = useRef(null);
    const navigate = useNavigate();

    // Data caching
    const { getCachedData, setCachedData, invalidateCache } = useDataCache();

    useEffect(() => {
        fetchSchedules();

        const handleClickOutside = (event) => {
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
                setIsStatusDropdownOpen(false);
            }
            if (childDropdownRef.current && !childDropdownRef.current.contains(event.target)) {
                setIsChildDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchSchedules = async (forceRefresh = false) => {
        // Check cache first (skip if forceRefresh)
        if (!forceRefresh) {
            const cachedSchedules = getCachedData('kader_schedules');
            if (cachedSchedules) {
                setSchedules(cachedSchedules);
                setLoading(false);
                return;
            }
        }

        try {
            // Only show loading on initial load
            if (!forceRefresh) {
                setLoading(true);
            }
            setError(null);
            const response = await api.get('/kader/schedules');
            setSchedules(response.data.data);
            setCachedData('kader_schedules', response.data.data);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Gagal memuat jadwal. Silakan coba lagi.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };



    const handleMarkComplete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Apakah Anda yakin ingin menandai jadwal ini sebagai selesai?')) return;

        // Optimistic update
        const previousSchedules = [...schedules];
        setSchedules(prev => prev.map(s =>
            s.id === id ? { ...s, status: 'completed', completed_at: new Date().toISOString() } : s
        ));

        try {
            await api.put(`/kader/schedules/${id}`, {
                completed_at: new Date().toISOString()
            });
            invalidateCache('kader_schedules');
            invalidateCache('kader_dashboard');
            fetchSchedules(true);
        } catch (err) {
            setSchedules(previousSchedules);
            alert('Gagal mengupdate status jadwal.');
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;

        // Optimistic update
        const previousSchedules = [...schedules];
        setSchedules(prev => prev.filter(s => s.id !== id));

        try {
            await api.delete(`/kader/schedules/${id}`);
            invalidateCache('kader_schedules');
            invalidateCache('kader_dashboard');
            fetchSchedules(true);
        } catch (err) {
            setSchedules(previousSchedules);
            alert('Gagal menghapus jadwal.');
        }
    };


    const getStatusConfig = (status) => {
        const configs = {
            completed: {
                bg: 'bg-green-50',
                text: 'text-green-700',
                border: 'border-green-200',
                label: 'Selesai',
                icon: CheckCircle
            },
            upcoming: {
                bg: 'bg-blue-50',
                text: 'text-blue-700',
                border: 'border-blue-200',
                label: 'Akan Datang',
                icon: Calendar
            },
            overdue: {
                bg: 'bg-red-50',
                text: 'text-red-700',
                border: 'border-red-200',
                label: 'Terlewat',
                icon: AlertCircle
            },
        };
        return configs[status] || configs.upcoming;
    };

    const getTypeLabel = (type) => {
        const labels = {
            imunisasi: 'Imunisasi',
            vitamin: 'Vitamin',
            posyandu: 'Posyandu',
        };
        return labels[type] || type;
    };


    const filteredSchedules = schedules.filter(schedule => {
        const matchesSearch =
            schedule.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            schedule.location?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = filters.status ? schedule.status === filters.status : true;

        return matchesSearch && matchesStatus;
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSchedules = filteredSchedules.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filters.status]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const statusOptions = [
        { value: "", label: "Semua Status" },
        { value: "upcoming", label: "Akan Datang" },
        { value: "overdue", label: "Terlewat" },
        { value: "completed", label: "Selesai" },
    ];

    if (loading) {
        return <JadwalPosyanduSkeleton scheduleCount={6} />;
    }

    return (
        <DashboardLayout
            header={
                <PageHeader title="Jadwal Kegiatan" subtitle="Portal Kader" showProfile={true} />
            }
        >

            {/* Filters & Search */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 grid grid-cols-2 lg:flex lg:flex-row gap-3 md:gap-4 z-10 relative">
                {/* Search */}
                <div className="relative col-span-2 lg:flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari judul kegiatan atau lokasi..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm"
                    />
                </div>


                {/* Status Filter */}
                <div className="relative w-full lg:w-48" ref={statusDropdownRef}>
                    <button
                        onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    >
                        <span className="truncate">
                            {statusOptions.find(opt => opt.value === filters.status)?.label || "Semua Status"}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                        {isStatusDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                transition={{ duration: 0.2 }}
                                className="absolute right-0 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50"
                            >
                                {statusOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setFilters(prev => ({ ...prev, status: option.value }));
                                            setIsStatusDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-gray-50 transition-colors ${filters.status === option.value ? 'text-blue-600 bg-blue-50/50' : 'text-gray-700'
                                            }`}
                                    >
                                        <span>{option.label}</span>
                                        {filters.status === option.value && <Check className="w-4 h-4" />}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>



                {/* Add Schedule Button */}
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="hidden md:flex col-span-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors items-center justify-center gap-2 shadow-lg shadow-blue-200 font-medium text-sm"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tambah</span>
                </button>
            </div>

            {/* Schedule List */}
            {filteredSchedules.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-200 text-center z-0">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Tidak ada jadwal ditemukan</h3>
                    <p className="text-gray-500">
                        {searchQuery || filters.type || filters.status
                            ? "Coba ubah filter atau kata kunci pencarian."
                            : "Belum ada jadwal kegiatan yang dibuat."}
                    </p>
                </div>
            ) : (
                <>
                    {/* Mobile View (Cards) */}
                    <div className="md:hidden flex flex-col gap-4">
                        {paginatedSchedules.map((schedule) => {
                            const statusConfig = getStatusConfig(schedule.status);
                            const StatusIcon = statusConfig.icon;
                            const scheduleDate = new Date(schedule.scheduled_for);

                            return (
                                <div key={schedule.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            {schedule.child ? (
                                                <>
                                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-blue-100 shrink-0">
                                                        <img
                                                            src={schedule.child.gender === 'L' ? kepalaBayi : kepalaBayiCewe}
                                                            alt={schedule.child.full_name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">
                                                            {schedule.child.full_name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {schedule.child.parent?.name || '-'}
                                                        </p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 shrink-0 flex items-center justify-center">
                                                        <Calendar className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">
                                                            Semua Anak
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Jadwal Umum Posyandu
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                                            <StatusIcon className="w-3 h-3" />
                                            {statusConfig.label}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-bold text-gray-900 text-sm">{schedule.title}</h4>
                                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                <span>{scheduleDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                <span>{schedule.scheduled_time?.substring(0, 5) || '-'} WIB</span>
                                            </div>
                                            <div className="flex items-center gap-2 col-span-2">
                                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="truncate">{schedule.location || '-'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {getTypeLabel(schedule.type)}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {schedule.status !== 'completed' && (
                                                <button
                                                    onClick={(e) => handleMarkComplete(schedule.id, e)}
                                                    className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                                                    title="Tandai Selesai"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => handleDelete(schedule.id, e)}
                                                className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                                title="Hapus Jadwal"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Desktop View (Table) */}
                    <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden z-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                        <th className="px-6 py-4">No</th>
                                        <th className="px-6 py-4">Nama Anak</th>
                                        <th className="px-6 py-4">Jenis</th>
                                        <th className="px-6 py-4">Judul</th>
                                        <th className="px-6 py-4">Waktu</th>
                                        <th className="px-6 py-4">Lokasi</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {paginatedSchedules.map((schedule, index) => {
                                        const statusConfig = getStatusConfig(schedule.status);
                                        const StatusIcon = statusConfig.icon;
                                        const scheduleDate = new Date(schedule.scheduled_for);

                                        return (
                                            <tr key={schedule.id} className="hover:bg-gray-50 transition-colors group">
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {schedule.child ? (
                                                            <>
                                                                <div className="w-8 h-8 rounded-full overflow-hidden border border-blue-100 shrink-0">
                                                                    <img
                                                                        src={schedule.child.gender === 'L' ? kepalaBayi : kepalaBayiCewe}
                                                                        alt={schedule.child.full_name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900">
                                                                        {schedule.child.full_name}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {schedule.child.parent?.name || '-'}
                                                                    </p>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 shrink-0 flex items-center justify-center">
                                                                    <Calendar className="w-4 h-4 text-blue-600" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900">
                                                                        Semua Anak
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        Jadwal Umum
                                                                    </p>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-700 capitalize">
                                                        {getTypeLabel(schedule.type)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-medium text-gray-900 line-clamp-1 max-w-[200px]">
                                                        {schedule.title}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col text-sm text-gray-600">
                                                        <span className="font-medium text-gray-900">
                                                            {scheduleDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {schedule.scheduled_time?.substring(0, 5) || '-'} WIB
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                                        <span className="truncate max-w-[150px]">{schedule.location || '-'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {statusConfig.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {schedule.status !== 'completed' && (
                                                            <button
                                                                onClick={(e) => handleMarkComplete(schedule.id, e)}
                                                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                title="Tandai Selesai"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => handleDelete(schedule.id, e)}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Hapus Jadwal"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Pagination */}
            {filteredSchedules.length > 0 && totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm disabled:hover:bg-white"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div className="flex items-center gap-2">
                        {[...Array(totalPages)].map((_, index) => {
                            const pageNum = index + 1;
                            const isCurrentPage = pageNum === currentPage;

                            // Show first page, last page, current page, and pages around current
                            const showPage =
                                pageNum === 1 ||
                                pageNum === totalPages ||
                                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);

                            if (!showPage) {
                                // Show ellipsis
                                if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                    return (
                                        <span key={pageNum} className="px-2 text-gray-400">
                                            ...
                                        </span>
                                    );
                                }
                                return null;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`min-w-[40px] h-10 rounded-xl font-medium transition-all ${isCurrentPage
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm disabled:hover:bg-white"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    <div className="ml-4 text-sm text-gray-600 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                        Halaman {currentPage} dari {totalPages} • Total: {filteredSchedules.length} jadwal
                    </div>
                </div>
            )}

            {/* Add Schedule Modal */}
            <AddScheduleModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    fetchSchedules(true); // Force refresh to bypass cache
                    setIsAddModalOpen(false);
                }}
            />

            {/* Floating Action Button for Mobile */}
            <button
                onClick={() => setIsAddModalOpen(true)}
                className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl shadow-blue-300 flex items-center justify-center z-50 hover:bg-blue-700 active:scale-95 transition-all"
            >
                <Plus className="w-7 h-7" />
            </button>
        </DashboardLayout>
    );
}
