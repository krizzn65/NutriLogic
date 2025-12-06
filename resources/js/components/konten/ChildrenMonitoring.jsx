import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import { useDataCache } from "../../contexts/DataCacheContext";
import { Baby, Search, X, Building2, User, Calendar, Weight, Ruler } from "lucide-react";
import { formatAge } from "../../lib/utils";

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

    // Data caching
    const { getCachedData, setCachedData } = useDataCache();

    useEffect(() => {
        fetchPosyandus();
        fetchChildren();
    }, []);

    const fetchPosyandus = async (forceRefresh = false) => {
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
    };


    const fetchChildren = async (forceRefresh = false) => {
        // Cache only when no filter (skip if forceRefresh)
        const hasFilter = filters.name || filters.posyandu_id || filters.nutritional_status;
        if (!hasFilter && !forceRefresh) {
            const cachedChildren = getCachedData('admin_children');
            if (cachedChildren) {
                setChildren(cachedChildren);
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
            const params = {};
            if (filters.name) params.name = filters.name;
            if (filters.posyandu_id) params.posyandu_id = filters.posyandu_id;
            if (filters.nutritional_status) params.nutritional_status = filters.nutritional_status;

            const response = await api.get('/admin/children', { params });
            setChildren(response.data.data);

            // Cache only when no filter
            if (!hasFilter) {
                setCachedData('admin_children', response.data.data);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Gagal memuat data anak.';
            setError(errorMessage);
            console.error('Children fetch error:', err);
        } finally {
            setLoading(false);
        }
    };


    const handleSearch = () => {
        fetchChildren();
    };

    const handleClearFilters = () => {
        setFilters({
            name: '',
            posyandu_id: '',
            nutritional_status: '',
        });
        setTimeout(() => fetchChildren(), 100);
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
        <div className="flex flex-1 w-full h-full overflow-auto">
            <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Monitoring Data Anak</h1>
                    <p className="text-gray-600 mt-2">Pantau data anak di seluruh posyandu</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nama Anak
                            </label>
                            <input
                                type="text"
                                value={filters.name}
                                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                                placeholder="Cari nama..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Posyandu
                            </label>
                            <select
                                value={filters.posyandu_id}
                                onChange={(e) => setFilters({ ...filters, posyandu_id: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Semua Posyandu</option>
                                {posyandus.map((posyandu) => (
                                    <option key={posyandu.id} value={posyandu.id}>
                                        {posyandu.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status Gizi
                            </label>
                            <select
                                value={filters.nutritional_status}
                                onChange={(e) => setFilters({ ...filters, nutritional_status: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Semua Status</option>
                                <option value="normal">Normal</option>
                                <option value="kurang">Kurang</option>
                                <option value="sangat_kurang">Sangat Kurang</option>
                                <option value="pendek">Pendek</option>
                                <option value="sangat_pendek">Sangat Pendek</option>
                                <option value="kurus">Kurus</option>
                                <option value="sangat_kurus">Sangat Kurus</option>
                                <option value="lebih">Lebih</option>
                                <option value="gemuk">Gemuk</option>
                            </select>
                        </div>

                        <div className="flex items-end gap-2">
                            <button
                                onClick={handleSearch}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Search className="w-4 h-4" />
                                Cari
                            </button>
                            <button
                                onClick={handleClearFilters}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                title="Clear Filters"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

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

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                                    children.map((child) => (
                                        <tr key={child.id} className="border-b border-gray-100 hover:bg-gray-50">
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
                                        </tr>
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
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">Detail Anak</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Nama Lengkap</label>
                            <p className="text-gray-800 font-medium">{child.full_name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Jenis Kelamin</label>
                            <p className="text-gray-800">{child.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Tanggal Lahir</label>
                            <p className="text-gray-800">{child.date_of_birth || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Umur</label>
                            <p className="text-gray-800">{child.age_months ? formatAge(child.age_months) : '-'}</p>
                        </div>
                    </div>

                    {/* Parent Info */}
                    {child.parent && (
                        <div className="border-t pt-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Informasi Orang Tua</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Nama</label>
                                    <p className="text-gray-800">{child.parent.name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                                    <p className="text-gray-800">{child.parent.email}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Telepon</label>
                                    <p className="text-gray-800">{child.parent.phone}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Posyandu Info */}
                    {child.posyandu && (
                        <div className="border-t pt-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Informasi Posyandu</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Nama Posyandu</label>
                                    <p className="text-gray-800">{child.posyandu.name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Lokasi</label>
                                    <p className="text-gray-800">{child.posyandu.village}, {child.posyandu.city}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Weighing History */}
                    <div className="border-t pt-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Riwayat Penimbangan (10 Terakhir)</h3>
                        {child.weighing_history && child.weighing_history.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="text-left py-2 px-3 font-medium text-gray-600">Tanggal</th>
                                            <th className="text-center py-2 px-3 font-medium text-gray-600">Berat (kg)</th>
                                            <th className="text-center py-2 px-3 font-medium text-gray-600">Tinggi (cm)</th>
                                            <th className="text-center py-2 px-3 font-medium text-gray-600">Status Gizi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {child.weighing_history.map((weighing) => (
                                            <tr key={weighing.id} className="border-b hover:bg-gray-50">
                                                <td className="py-2 px-3 text-gray-700">{weighing.weighing_date}</td>
                                                <td className="py-2 px-3 text-center text-gray-700">{weighing.weight}</td>
                                                <td className="py-2 px-3 text-center text-gray-700">{weighing.height}</td>
                                                <td className="py-2 px-3 text-center">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(weighing.nutritional_status)
                                                        }`}>
                                                        {getStatusLabel(weighing.nutritional_status)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">Belum ada riwayat penimbangan</p>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
