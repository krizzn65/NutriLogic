import React, { useState, useEffect, useCallback } from "react";
import api from "../../lib/api";
import { useDataCache } from "../../contexts/DataCacheContext";
import { Baby, Search, X, Building2, User, Calendar, Weight, Ruler, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { formatAge } from "../../lib/utils";
import PageHeader from "../ui/PageHeader";

export default function ChildrenMonitoring() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [children, setChildren] = useState([]);
    const [posyandus, setPosyandus] = useState([]);
    const [filters, setFilters] = useState({
        name: '',
        posyandu_id: '',
        nutritional_status: '',
    });
    const [selectedChild, setSelectedChild] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [isPosyanduDropdownOpen, setIsPosyanduDropdownOpen] = useState(false);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

    const statusOptions = [
        { value: "", label: "Semua Status" },
        { value: "normal", label: "Normal" },
        { value: "kurang", label: "Kurang" },
        { value: "sangat_kurang", label: "Sangat Kurang" },
        { value: "pendek", label: "Pendek" },
        { value: "sangat_pendek", label: "Sangat Pendek" },
        { value: "kurus", label: "Kurus" },
        { value: "sangat_kurus", label: "Sangat Kurus" },
        { value: "lebih", label: "Lebih" },
        { value: "gemuk", label: "Gemuk" },
    ];

    // Data caching
    const { getCachedData, setCachedData } = useDataCache();
    const activeChildrenRequestId = React.useRef(0);
    const hasHydratedOnce = React.useRef(false);

    const fetchPosyandus = useCallback(async (forceRefresh = false) => {
        // Check cache first (skip if forceRefresh)
        if (!forceRefresh) {
            const cachedPosyandus = getCachedData('admin_posyandus');
            if (cachedPosyandus) {
                setPosyandus(cachedPosyandus);
                return;
            }
        }

        try {
            const response = await api.get('/admin/posyandus');
            setPosyandus(response.data.data);
            setCachedData('admin_posyandus', response.data.data);
        } catch (err) {
            console.error('Posyandus fetch error:', err);
        }
    }, [getCachedData, setCachedData]);


    const fetchChildren = useCallback(async ({ forceRefresh = false, showLoader = false } = {}) => {
        const hasFilter = filters.name || filters.posyandu_id || filters.nutritional_status;

        if (!hasFilter && !forceRefresh) {
            const cachedChildren = getCachedData('admin_children');
            if (cachedChildren) {
                setChildren(cachedChildren);
                setLoading(false);
                return;
            }
        }

        if (showLoader) {
            setLoading(true);
        }

        setError(null);
        const params = {};
        if (filters.name) params.name = filters.name;
        if (filters.posyandu_id) params.posyandu_id = filters.posyandu_id;
        if (filters.nutritional_status) params.nutritional_status = filters.nutritional_status;
        const requestId = ++activeChildrenRequestId.current;

        try {
            const response = await api.get('/admin/children', { params });

            if (activeChildrenRequestId.current !== requestId) {
                return;
            }

            setChildren(response.data.data);

            if (!hasFilter) {
                setCachedData('admin_children', response.data.data);
            }
        } catch (err) {
            if (activeChildrenRequestId.current !== requestId) {
                return;
            }

            const errorMessage = err.response?.data?.message || 'Gagal memuat data anak.';
            setError(errorMessage);
            console.error('Children fetch error:', err);
        } finally {
            if (activeChildrenRequestId.current === requestId) {
                setLoading(false);
            }
        }
    }, [filters, getCachedData, setCachedData]);

    useEffect(() => {
        if (hasHydratedOnce.current) return;
        hasHydratedOnce.current = true;

        const cachedPosyandus = getCachedData('admin_posyandus');
        if (cachedPosyandus) {
            setPosyandus(cachedPosyandus);
        }

        const cachedChildren = getCachedData('admin_children');
        if (cachedChildren) {
            setChildren(cachedChildren);
            setLoading(false);
            fetchChildren({ forceRefresh: true, showLoader: false });
        } else {
            fetchChildren({ forceRefresh: true, showLoader: true });
        }

        fetchPosyandus();
    }, [fetchPosyandus, fetchChildren, getCachedData]);


    useEffect(() => {
        const timer = setTimeout(() => {
            fetchChildren({ forceRefresh: true, showLoader: false });
        }, 500);

        return () => clearTimeout(timer);
    }, [fetchChildren]);

    const handleSearch = () => {
        fetchChildren({ forceRefresh: true, showLoader: true });
    };

    const handleClearFilters = () => {
        setFilters({
            name: '',
            posyandu_id: '',
            nutritional_status: '',
        });
    };

    const handleViewDetail = async (childId) => {
        try {
            const response = await api.get(`/admin/children/${childId}`);
            setSelectedChild(response.data.data);
            setShowDetailModal(true);
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal memuat detail anak.');
        }
    };

    const getStatusColor = (status) => {
        if (!status) return 'bg-gray-100 text-gray-800';
        if (status === 'normal') return 'bg-green-100 text-green-800';
        if (status.includes('sangat')) return 'bg-red-100 text-red-800';
        return 'bg-orange-100 text-orange-800';
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
        return labels[status] || status || '-';
    };

    if (loading && children.length === 0) {
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
            <PageHeader title="Monitoring Data Anak" subtitle="Pantau data anak di seluruh posyandu" />

            <div className="flex-1 overflow-auto p-6 space-y-6">

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nama Anak
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={filters.name}
                                    onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                                    placeholder="Cari nama..."
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                                />
                            </div>
                        </div>

                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Posyandu
                            </label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsPosyanduDropdownOpen(!isPosyanduDropdownOpen)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                >
                                    <span className="text-gray-900 truncate text-sm">
                                        {filters.posyandu_id
                                            ? posyandus.find(p => p.id === parseInt(filters.posyandu_id))?.name || "Posyandu"
                                            : "Semua"}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isPosyanduDropdownOpen ? "rotate-180" : ""}`} />
                                </button>

                                <AnimatePresence>
                                    {isPosyanduDropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setIsPosyanduDropdownOpen(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
                                            >
                                                <div
                                                    onClick={() => {
                                                        setFilters({ ...filters, posyandu_id: '' });
                                                        setIsPosyanduDropdownOpen(false);
                                                    }}
                                                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between group"
                                                >
                                                    <span className={`text-sm ${filters.posyandu_id === '' ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>
                                                        Semua
                                                    </span>
                                                    {filters.posyandu_id === '' && (
                                                        <Check className="w-4 h-4 text-blue-600" />
                                                    )}
                                                </div>
                                                {posyandus.map((posyandu) => (
                                                    <div
                                                        key={posyandu.id}
                                                        onClick={() => {
                                                            setFilters({ ...filters, posyandu_id: posyandu.id });
                                                            setIsPosyanduDropdownOpen(false);
                                                        }}
                                                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between group"
                                                    >
                                                        <span className={`text-sm ${parseInt(filters.posyandu_id) === posyandu.id ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>
                                                            {posyandu.name}
                                                        </span>
                                                        {parseInt(filters.posyandu_id) === posyandu.id && (
                                                            <Check className="w-4 h-4 text-blue-600" />
                                                        )}
                                                    </div>
                                                ))}
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status Gizi
                            </label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                >
                                    <span className="text-gray-900 truncate text-sm">
                                        {statusOptions.find(opt => opt.value === filters.nutritional_status)?.label || "Semua"}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isStatusDropdownOpen ? "rotate-180" : ""}`} />
                                </button>

                                <AnimatePresence>
                                    {isStatusDropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setIsStatusDropdownOpen(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
                                            >
                                                {statusOptions.map((option) => (
                                                    <div
                                                        key={option.value}
                                                        onClick={() => {
                                                            setFilters({ ...filters, nutritional_status: option.value });
                                                            setIsStatusDropdownOpen(false);
                                                        }}
                                                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between group"
                                                    >
                                                        <span className={`text-sm ${filters.nutritional_status === option.value ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>
                                                            {option.label}
                                                        </span>
                                                        {filters.nutritional_status === option.value && (
                                                            <Check className="w-4 h-4 text-blue-600" />
                                                        )}
                                                    </div>
                                                ))}
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="col-span-2 md:col-span-1 flex items-end">
                            <button
                                onClick={handleClearFilters}
                                className="w-full md:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                title="Clear Filters"
                            >
                                <X className="w-5 h-5" />
                                <span className="md:hidden text-sm font-medium">Reset Filter</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">{error}</p>
                        <button
                            onClick={fetchChildren}
                            className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                            Coba Lagi
                        </button>
                    </div>
                )}

                {/* Mobile View (Cards) */}
                <div className="md:hidden flex flex-col gap-4">
                    {children.length === 0 ? (
                        <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Baby className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Tidak ada data anak</h3>
                            <p className="text-gray-500 text-sm mt-1">Belum ada data yang tersedia.</p>
                        </div>
                    ) : (
                        children.map((child, index) => (
                            <motion.div
                                key={child.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.3 }}
                                className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-4"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${child.gender === 'L' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                                            <Baby className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{child.full_name}</h3>
                                            <p className="text-xs text-gray-500">{child.gender === 'L' ? 'Laki-laki' : 'Perempuan'} • {child.age_months ? formatAge(child.age_months) : '-'}</p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusColor(child.latest_weighing?.nutritional_status)}`}>
                                        {getStatusLabel(child.latest_weighing?.nutritional_status)}
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm text-gray-600">
                                    {child.parent && (
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium text-gray-900">{child.parent.name}</span>
                                        </div>
                                    )}
                                    {child.posyandu && (
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium text-gray-900">{child.posyandu.name}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-3 border-t border-gray-100">
                                    <button
                                        onClick={() => handleViewDetail(child.id)}
                                        className="w-full py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
                                    >
                                        Lihat Detail
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Table */}
                <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Nama Anak</th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Umur</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Orang Tua</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Posyandu</th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Status Gizi</th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {children.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-gray-500">
                                            Tidak ada data anak
                                        </td>
                                    </tr>
                                ) : (
                                    children.map((child, index) => (
                                        <motion.tr
                                            key={child.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05, duration: 0.3 }}
                                            className="border-b border-gray-100 hover:bg-gray-50"
                                        >
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Baby className="w-5 h-5 text-blue-600" />
                                                    <div>
                                                        <div className="font-medium text-gray-800">{child.full_name}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {child.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-center text-sm text-gray-600">
                                                {child.age_months ? formatAge(child.age_months) : '-'}
                                            </td>
                                            <td className="py-3 px-4">
                                                {child.parent ? (
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        <User className="w-4 h-4 text-gray-500" />
                                                        {child.parent.name}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                {child.posyandu ? (
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        <Building2 className="w-4 h-4 text-gray-500" />
                                                        {child.posyandu.name}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(child.latest_weighing?.nutritional_status)
                                                    }`}>
                                                    {getStatusLabel(child.latest_weighing?.nutritional_status)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() => handleViewDetail(child.id)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    Lihat Detail
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedChild && (
                <ChildDetailModal
                    child={selectedChild}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedChild(null);
                    }}
                    getStatusColor={getStatusColor}
                    getStatusLabel={getStatusLabel}
                />
            )}
        </div>
    );
}

// Child Detail Modal
function ChildDetailModal({ child, onClose, getStatusColor, getStatusLabel }) {
    const controls = useDragControls();
    const [activeTab, setActiveTab] = useState('weighing');

    // Helper for date formatting
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const tabs = [
        { id: 'weighing', label: 'Penimbangan', icon: '⚖️' },
        { id: 'vitamin', label: 'Vitamin', icon: '💊' },
        { id: 'immunization', label: 'Imunisasi', icon: '💉' },
        { id: 'meal', label: 'Makanan', icon: '🍽️' },
        { id: 'pmt', label: 'PMT', icon: '🥛' },
    ];

    // Get PMT status color
    const getPmtStatusColor = (status) => {
        const colors = {
            consumed: 'bg-green-100 text-green-700',
            partial: 'bg-yellow-100 text-yellow-700',
            refused: 'bg-red-100 text-red-700',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getPmtStatusLabel = (status) => {
        const labels = {
            consumed: 'Habis',
            partial: 'Sebagian',
            refused: 'Tidak Mau',
        };
        return labels[status] || status || '-';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
                drag="y"
                dragControls={controls}
                dragListener={false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.2 }}
                onDragEnd={(event, info) => {
                    if (info.offset.y > 100) {
                        onClose();
                    }
                }}
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative bg-white rounded-t-2xl md:rounded-2xl shadow-xl w-full md:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                {/* Drag Handle */}
                <div
                    className="w-full h-6 flex items-center justify-center md:hidden cursor-grab active:cursor-grabbing pt-2 pb-1 bg-white z-10"
                    onPointerDown={(e) => controls.start(e)}
                >
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                </div>

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
                    <h2 className="text-xl font-bold text-gray-800">Detail Anak</h2>
                    <button
                        onClick={onClose}
                        className="hidden md:flex p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Basic Info */}
                    <section>
                        <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4">Informasi Dasar</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Nama Lengkap</label>
                                <p className="text-base font-medium text-gray-900">{child.full_name}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Jenis Kelamin</label>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${child.gender === 'L' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
                                        {child.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal Lahir</label>
                                <p className="text-base text-gray-900">{formatDate(child.birth_date)}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Umur</label>
                                <p className="text-base text-gray-900">{child.age_months ? formatAge(child.age_months) : '-'}</p>
                            </div>
                        </div>
                    </section>

                    {/* Parent Info */}
                    {child.parent && (
                        <section className="border-t border-gray-100 pt-6">
                            <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4">Informasi Orang Tua</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Nama Orang Tua</label>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <p className="text-base font-medium text-gray-900">{child.parent.name}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                                    <p className="text-base text-gray-900">{child.parent.email || '-'}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Nomor Telepon</label>
                                    <p className="text-base text-gray-900">{child.parent.phone || '-'}</p>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Posyandu Info */}
                    {child.posyandu && (
                        <section className="border-t border-gray-100 pt-6">
                            <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4">Lokasi Posyandu</h3>
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <Building2 className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">{child.posyandu.name}</h4>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {child.posyandu.address && `${child.posyandu.address}, `}
                                            {child.posyandu.village}, {child.posyandu.city}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Tab Navigation */}
                    <section className="border-t border-gray-100 pt-6">
                        <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4">Riwayat Anak</h3>

                        <div className="flex gap-1 overflow-x-auto pb-2 mb-4">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    <span>{tab.icon}</span>
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">

                            {/* Weighing Tab */}
                            {activeTab === 'weighing' && (
                                <>
                                    {child.weighing_logs && child.weighing_logs.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                                    <tr>
                                                        <th className="text-left py-3 px-4 font-medium text-gray-500">Tanggal</th>
                                                        <th className="text-center py-3 px-4 font-medium text-gray-500">Berat (kg)</th>
                                                        <th className="text-center py-3 px-4 font-medium text-gray-500">Tinggi (cm)</th>
                                                        <th className="text-center py-3 px-4 font-medium text-gray-500">Status Gizi</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {child.weighing_logs.slice(0, 10).map((weighing) => (
                                                        <tr key={weighing.id} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="py-3 px-4 text-gray-900 font-medium">
                                                                {formatDate(weighing.measured_at)}
                                                            </td>
                                                            <td className="py-3 px-4 text-center text-gray-700">{weighing.weight_kg}</td>
                                                            <td className="py-3 px-4 text-center text-gray-700">{weighing.height_cm}</td>
                                                            <td className="py-3 px-4 text-center">
                                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(weighing.nutritional_status)}`}>
                                                                    {getStatusLabel(weighing.nutritional_status)}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center">
                                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                                                <Weight className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <p className="text-gray-500 font-medium">Belum ada riwayat penimbangan</p>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Vitamin Tab */}
                            {activeTab === 'vitamin' && (
                                <>
                                    {child.vitamin_distributions && child.vitamin_distributions.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                                    <tr>
                                                        <th className="text-left py-3 px-4 font-medium text-gray-500">Tanggal</th>
                                                        <th className="text-left py-3 px-4 font-medium text-gray-500">Jenis Vitamin</th>
                                                        <th className="text-left py-3 px-4 font-medium text-gray-500">Catatan</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {child.vitamin_distributions.slice(0, 10).map((vitamin) => (
                                                        <tr key={vitamin.id} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="py-3 px-4 text-gray-900 font-medium">
                                                                {formatDate(vitamin.distribution_date)}
                                                            </td>
                                                            <td className="py-3 px-4 text-gray-700">
                                                                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                                                    {vitamin.vitamin_type}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4 text-gray-600">{vitamin.notes || '-'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center">
                                            <div className="text-4xl mb-3">💊</div>
                                            <p className="text-gray-500 font-medium">Belum ada riwayat vitamin</p>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Immunization Tab */}
                            {activeTab === 'immunization' && (
                                <>
                                    {child.immunization_records && child.immunization_records.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                                    <tr>
                                                        <th className="text-left py-3 px-4 font-medium text-gray-500">Tanggal</th>
                                                        <th className="text-left py-3 px-4 font-medium text-gray-500">Jenis Imunisasi</th>
                                                        <th className="text-left py-3 px-4 font-medium text-gray-500">Catatan</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {child.immunization_records.slice(0, 10).map((record) => (
                                                        <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="py-3 px-4 text-gray-900 font-medium">
                                                                {formatDate(record.immunization_date)}
                                                            </td>
                                                            <td className="py-3 px-4 text-gray-700">
                                                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                                                    {record.vaccine_type}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4 text-gray-600">{record.notes || '-'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center">
                                            <div className="text-4xl mb-3">💉</div>
                                            <p className="text-gray-500 font-medium">Belum ada riwayat imunisasi</p>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Meal Tab */}
                            {activeTab === 'meal' && (
                                <>
                                    {child.meal_logs && child.meal_logs.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                                    <tr>
                                                        <th className="text-left py-3 px-4 font-medium text-gray-500">Tanggal</th>
                                                        <th className="text-left py-3 px-4 font-medium text-gray-500">Waktu Makan</th>
                                                        <th className="text-left py-3 px-4 font-medium text-gray-500">Menu</th>
                                                        <th className="text-left py-3 px-4 font-medium text-gray-500">Catatan</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {child.meal_logs.slice(0, 10).map((meal) => (
                                                        <tr key={meal.id} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="py-3 px-4 text-gray-900 font-medium">
                                                                {formatDate(meal.eaten_at)}
                                                            </td>
                                                            <td className="py-3 px-4 text-gray-700">
                                                                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium capitalize">
                                                                    {meal.time_of_day}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4 text-gray-700">{meal.description || '-'}</td>
                                                            <td className="py-3 px-4 text-gray-600">{meal.notes || '-'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center">
                                            <div className="text-4xl mb-3">🍽️</div>
                                            <p className="text-gray-500 font-medium">Belum ada riwayat jurnal makan</p>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* PMT Tab */}
                            {activeTab === 'pmt' && (
                                <>
                                    {child.pmt_logs && child.pmt_logs.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                                    <tr>
                                                        <th className="text-left py-3 px-4 font-medium text-gray-500">Tanggal</th>
                                                        <th className="text-center py-3 px-4 font-medium text-gray-500">Status Konsumsi</th>
                                                        <th className="text-left py-3 px-4 font-medium text-gray-500">Catatan</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {child.pmt_logs.slice(0, 10).map((pmt) => (
                                                        <tr key={pmt.id} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="py-3 px-4 text-gray-900 font-medium">
                                                                {formatDate(pmt.date)}
                                                            </td>
                                                            <td className="py-3 px-4 text-center">
                                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPmtStatusColor(pmt.status)}`}>
                                                                    {getPmtStatusLabel(pmt.status)}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4 text-gray-600">{pmt.notes || '-'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center">
                                            <div className="text-4xl mb-3">🥛</div>
                                            <p className="text-gray-500 font-medium">Belum ada riwayat PMT</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm w-full md:w-auto"
                    >
                        Tutup
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

