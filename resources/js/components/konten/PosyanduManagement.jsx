import React, { useState, useEffect, useCallback } from "react";
import api from "../../lib/api";
import { useDataCache } from "../../contexts/DataCacheContext";
import { Building2, Plus, Edit2, Power, MapPin, Users, Baby } from "lucide-react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import GenericListSkeleton from "../loading/GenericListSkeleton";
import PageHeader from "../ui/PageHeader";

export default function PosyanduManagement() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [posyandus, setPosyandus] = useState([]);
    const [filterStatus, setFilterStatus] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const [editingPosyandu, setEditingPosyandu] = useState(null);
    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        posyandu: null,
        action: null // 'aktifkan' or 'nonaktifkan'
    });

    // Data caching
    const { getCachedData, setCachedData, invalidateCache } = useDataCache();

    // Track if this is initial mount and latest in-flight request
    const isInitialMount = React.useRef(true);
    const activeRequestId = React.useRef(0);

    // Preload all filter data for instant tab switching
    const preloadAllFilters = useCallback(async () => {
        const filters = ['all', 'active', 'inactive'];

        for (const filter of filters) {
            const cacheKey = `admin_posyandus_${filter}`;
            // Skip if already cached
            if (getCachedData(cacheKey)) continue;

            try {
                const params = filter !== 'all' ? { status: filter } : {};
                const response = await api.get('/admin/posyandus', { params });
                setCachedData(cacheKey, response.data.data);

                // Also update "all" cache for other pages
                if (filter === 'all') {
                    setCachedData('admin_posyandus', response.data.data);
                }
            } catch (err) {
                console.error(`Preload ${filter} error:`, err);
            }
        }
    }, [getCachedData, setCachedData]);

    const fetchPosyandus = useCallback(async (targetFilter, { forceRefresh = false, showLoader = false } = {}) => {
        const cacheKey = `admin_posyandus_${targetFilter}`;

        if (!forceRefresh) {
            const cachedPosyandus = getCachedData(cacheKey);
            if (cachedPosyandus) {
                setPosyandus(cachedPosyandus);
                setLoading(false);
                return;
            }
        }

        if (showLoader) {
            setLoading(true);
        }

        setError(null);
        const params = targetFilter !== "all" ? { status: targetFilter } : {};
        const requestId = ++activeRequestId.current;

        try {
            const response = await api.get('/admin/posyandus', { params });

            // Ignore stale responses that belong to an older request
            if (activeRequestId.current !== requestId) {
                return;
            }

            setPosyandus(response.data.data);
            setCachedData(cacheKey, response.data.data);

            if (targetFilter === "all") {
                setCachedData('admin_posyandus', response.data.data);
            }
        } catch (err) {
            if (activeRequestId.current !== requestId) {
                return;
            }

            const errorMessage = err.response?.data?.message || 'Gagal memuat data posyandu.';
            setError(errorMessage);
            console.error('Posyandus fetch error:', err);
        } finally {
            if (activeRequestId.current === requestId) {
                setLoading(false);
            }
        }
    }, [getCachedData, setCachedData]);

    useEffect(() => {
        const cacheKey = `admin_posyandus_${filterStatus}`;
        const cachedPosyandus = getCachedData(cacheKey);

        if (cachedPosyandus) {
            setPosyandus(cachedPosyandus);
            setLoading(false);
        }

        if (isInitialMount.current) {
            isInitialMount.current = false;
            fetchPosyandus(filterStatus, {
                forceRefresh: !cachedPosyandus,
                showLoader: !cachedPosyandus,
            });
            preloadAllFilters();
            return;
        }

        fetchPosyandus(filterStatus, {
            forceRefresh: true,
            showLoader: !cachedPosyandus,
        });
    }, [filterStatus, fetchPosyandus, preloadAllFilters, getCachedData]);

    // Handler for filter tab changes - show cached data instantly, refresh in background
    const handleFilterChange = (newFilter) => {
        if (newFilter === filterStatus) return;

        const cacheKey = `admin_posyandus_${newFilter}`;
        const cachedPosyandus = getCachedData(cacheKey);

        if (cachedPosyandus) {
            setPosyandus(cachedPosyandus);
            setLoading(false);
        } else {
            setLoading(true);
        }

        setFilterStatus(newFilter);
    };


    const handleAddNew = () => {
        setEditingPosyandu(null);
        setShowModal(true);
    };

    const handleEdit = (posyandu) => {
        setEditingPosyandu(posyandu);
        setShowModal(true);
    };

    const handleToggleActive = (posyandu) => {
        const action = posyandu.is_active ? 'nonaktifkan' : 'aktifkan';
        setConfirmationModal({
            isOpen: true,
            posyandu,
            action
        });
    };

    const confirmToggle = async () => {
        const { posyandu, action } = confirmationModal;
        if (!posyandu) return;

        // Optimistic update - update UI immediately
        const previousPosyandus = [...posyandus];
        setPosyandus(prev => prev.map(p =>
            p.id === posyandu.id ? { ...p, is_active: !p.is_active } : p
        ));

        // Close modal immediately
        setConfirmationModal({ isOpen: false, posyandu: null, action: null });

        try {
            await api.patch(`/admin/posyandus/${posyandu.id}/toggle-active`);
            // Invalidate all posyandu caches
            invalidateCache('admin_posyandus');
            invalidateCache('admin_posyandus_all');
            invalidateCache('admin_posyandus_active');
            invalidateCache('admin_posyandus_inactive');
            invalidateCache('admin_dashboard');
            // Fetch fresh data to ensure consistency
            fetchPosyandus(filterStatus, { forceRefresh: true, showLoader: false });
        } catch (err) {
            // Revert on error
            setPosyandus(previousPosyandus);
            alert(err.response?.data?.message || 'Gagal mengubah status posyandu.');
        }
    };



    if (loading) {
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
            <PageHeader title="Manajemen Posyandu" subtitle="Kelola data posyandu di sistem" />

            <div className="flex-1 overflow-auto p-6 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">

                {/* Filter Tabs with Add Button */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between border-b border-gray-200"
                >
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleFilterChange('all')}
                            className={`px-4 py-2 font-medium transition-colors ${filterStatus === 'all'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            Semua
                        </button>
                        <button
                            onClick={() => handleFilterChange('active')}
                            className={`px-4 py-2 font-medium transition-colors ${filterStatus === 'active'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            Aktif
                        </button>
                        <button
                            onClick={() => handleFilterChange('inactive')}
                            className={`px-4 py-2 font-medium transition-colors ${filterStatus === 'inactive'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            Nonaktif
                        </button>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="hidden md:flex px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:scale-95 transition-all items-center gap-2 shadow-sm mb-0.5"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Posyandu
                    </button>
                </motion.div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">{error}</p>
                        <button
                            onClick={fetchPosyandus}
                            className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                            Coba Lagi
                        </button>
                    </div>
                )}

                {/* Desktop Table */}
                <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Nama Posyandu</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Lokasi</th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Kader</th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Anak</th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posyandus.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-gray-500">
                                            Tidak ada data posyandu
                                        </td>
                                    </tr>
                                ) : (
                                    posyandus.map((posyandu, index) => (
                                        <motion.tr
                                            key={posyandu.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05, duration: 0.3 }}
                                            className="border-b border-gray-100 hover:bg-gray-50"
                                        >
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-5 h-5 text-blue-600" />
                                                    <span className="font-medium text-gray-800">{posyandu.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-start gap-1 text-sm text-gray-600">
                                                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                                                    <div>
                                                        <div>{posyandu.village}, {posyandu.city}</div>
                                                        {posyandu.rt_rw && <div className="text-xs text-gray-500">RT/RW: {posyandu.rt_rw}</div>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Users className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm text-gray-700">{posyandu.kader_count}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Baby className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm text-gray-700">{posyandu.children_count}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${posyandu.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {posyandu.is_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(posyandu)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleActive(posyandu)}
                                                        className={`p-1.5 rounded transition-colors ${posyandu.is_active
                                                            ? 'text-red-600 hover:bg-red-50'
                                                            : 'text-green-600 hover:bg-green-50'
                                                            }`}
                                                        title={posyandu.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                                    >
                                                        <Power className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile Card List */}
                <div className="md:hidden space-y-3">
                    {posyandus.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
                            Tidak ada data posyandu
                        </div>
                    ) : (
                        posyandus.map((posyandu, index) => (
                            <motion.div
                                key={posyandu.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.3 }}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <Building2 className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{posyandu.name}</h3>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium mt-1 ${posyandu.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {posyandu.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleEdit(posyandu)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleToggleActive(posyandu)}
                                            className={`p-2 rounded-lg transition-colors ${posyandu.is_active
                                                ? 'text-red-600 hover:bg-red-50'
                                                : 'text-green-600 hover:bg-green-50'
                                                }`}
                                        >
                                            <Power className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-3">
                                    <div className="flex items-start gap-2 text-sm text-gray-600">
                                        <MapPin className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                                        <div>
                                            <div>{posyandu.village}, {posyandu.city}</div>
                                            {posyandu.rt_rw && <div className="text-xs text-gray-500">RT/RW: {posyandu.rt_rw}</div>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                                    <div className="flex items-center gap-1.5">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-700">{posyandu.kader_count} Kader</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Baby className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-700">{posyandu.children_count} Anak</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Mobile FAB */}
            <button
                onClick={handleAddNew}
                className="md:hidden fixed bottom-24 right-4 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 active:scale-90 transition-all z-40"
            >
                <Plus className="w-6 h-6" />
            </button>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmationModal.isOpen}
                action={confirmationModal.action}
                posyandu={confirmationModal.posyandu}
                onConfirm={confirmToggle}
                onCancel={() => setConfirmationModal({ isOpen: false, posyandu: null, action: null })}
            />

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <PosyanduModal
                        posyandu={editingPosyandu}
                        onClose={() => setShowModal(false)}
                        onSuccess={() => {
                            setShowModal(false);
                            // Invalidate all posyandu caches first
                            invalidateCache('admin_posyandus');
                            invalidateCache('admin_posyandus_all');
                            invalidateCache('admin_posyandus_active');
                            invalidateCache('admin_posyandus_inactive');
                            invalidateCache('admin_dashboard');
                            // Force refresh current filter to bypass cache
                            fetchPosyandus(filterStatus, { forceRefresh: true, showLoader: false });
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// Modal Component
function PosyanduModal({ posyandu, onClose, onSuccess }) {
    const controls = useDragControls();
    const [formData, setFormData] = useState({
        name: '',
        village: '',
        city: '',
        address: '',
        rt_rw: '',
        latitude: '',
        longitude: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Reset form when modal opens or posyandu changes
    useEffect(() => {
        setFormData({
            name: posyandu?.name || '',
            village: posyandu?.village || '',
            city: posyandu?.city || '',
            address: posyandu?.address || '',
            rt_rw: posyandu?.rt_rw || '',
            latitude: posyandu?.latitude || '',
            longitude: posyandu?.longitude || '',
        });
        setError(null);
        setSubmitting(false);
    }, [posyandu]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            if (posyandu) {
                await api.put(`/admin/posyandus/${posyandu.id}`, formData);
            } else {
                await api.post('/admin/posyandus', formData);
            }
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menyimpan data posyandu.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4">
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
                className="bg-white rounded-t-2xl md:rounded-xl w-full md:max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
            >
                {/* Drag Handle */}
                <div
                    className="w-full h-6 flex items-center justify-center md:hidden cursor-grab active:cursor-grabbing pt-2 pb-1"
                    onPointerDown={(e) => controls.start(e)}
                >
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                </div>
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {posyandu ? 'Edit Posyandu' : 'Tambah Posyandu Baru'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Posyandu <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                            placeholder="Contoh: Posyandu Melati"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Desa <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.village}
                                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                                placeholder="Nama desa"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Kota/Kabupaten <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                                placeholder="Nama kota/kabupaten"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Alamat Lengkap
                        </label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                            rows="2"
                            placeholder="Alamat lengkap posyandu"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            RT/RW
                        </label>
                        <input
                            type="text"
                            value={formData.rt_rw}
                            onChange={(e) => setFormData({ ...formData, rt_rw: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                            placeholder="Contoh: 001/002"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Latitude
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={formData.latitude}
                                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                                placeholder="-6.200000"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Longitude
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={formData.longitude}
                                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                                placeholder="106.816666"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={submitting}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            disabled={submitting}
                        >
                            {submitting ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

// Confirmation Modal Component
function ConfirmationModal({ isOpen, action, posyandu, onConfirm, onCancel }) {
    const controls = useDragControls();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-[60] p-0 md:p-4">
                    <motion.div
                        key="confirmation-modal"
                        drag="y"
                        dragControls={controls}
                        dragListener={false}
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0, bottom: 0.2 }}
                        onDragEnd={(event, info) => {
                            if (info.offset.y > 100) {
                                onCancel();
                            }
                        }}
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-white rounded-t-2xl md:rounded-xl shadow-xl w-full md:max-w-md overflow-hidden"
                    >
                        {/* Drag Handle */}
                        <div
                            className="w-full h-6 flex items-center justify-center md:hidden cursor-grab active:cursor-grabbing pt-2 pb-1"
                            onPointerDown={(e) => controls.start(e)}
                        >
                            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                        </div>

                        <div className="p-6 text-center pt-2 md:pt-6">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${action === 'nonaktifkan' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                }`}>
                                <Power className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Konfirmasi {action === 'nonaktifkan' ? 'Nonaktifkan' : 'Aktifkan'}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Apakah Anda yakin ingin {action} posyandu <span className="font-semibold">{posyandu?.name}</span>?
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={onCancel}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className={`px-4 py-2 text-white rounded-lg transition-colors font-medium ${action === 'nonaktifkan'
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : 'bg-green-600 hover:bg-green-700'
                                        }`}
                                >
                                    Ya, {action === 'nonaktifkan' ? 'Nonaktifkan' : 'Aktifkan'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

