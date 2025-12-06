import React, { useState, useEffect, useCallback } from "react";
import api from "../../lib/api";
import { useDataCache } from "../../contexts/DataCacheContext";
import { Building2, Plus, Edit2, Power, MapPin, Users, Baby } from "lucide-react";
import GenericListSkeleton from "../loading/GenericListSkeleton";
import PageHeader from "../ui/PageHeader";

export default function PosyanduManagement() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [posyandus, setPosyandus] = useState([]);
    const [filterStatus, setFilterStatus] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const [editingPosyandu, setEditingPosyandu] = useState(null);

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

    const handleToggleActive = async (posyandu) => {
        const action = posyandu.is_active ? 'nonaktifkan' : 'aktifkan';
        if (!window.confirm(`Apakah Anda yakin ingin ${action} posyandu ${posyandu.name}?`)) {
            return;
        }

        // Optimistic update - update UI immediately
        const previousPosyandus = [...posyandus];
        setPosyandus(prev => prev.map(p =>
            p.id === posyandu.id ? { ...p, is_active: !p.is_active } : p
        ));

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

            <div className="flex-1 overflow-auto p-6 space-y-6">

                {/* Filter Tabs with Add Button */}
                <div className="flex items-center justify-between border-b border-gray-200">
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
                        className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2 shadow-sm mb-0.5"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Posyandu
                    </button>
                </div>

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

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                                    posyandus.map((posyandu) => (
                                        <tr key={posyandu.id} className="border-b border-gray-100 hover:bg-gray-50">
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
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
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
        </div>
    );
}

// Modal Component
function PosyanduModal({ posyandu, onClose, onSuccess }) {
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
            </div>
        </div>
    );
}
