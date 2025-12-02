import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { formatAge } from "../../lib/utils";
import GenericListSkeleton from "../loading/GenericListSkeleton";

export default function JadwalPosyandu() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [filters, setFilters] = useState({
        type: "",
        status: "",
        date_from: "",
        date_to: "",
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchSchedules();
    }, [filters]);

    const fetchSchedules = async () => {
        try {
            setLoading(true);
            setError(null);

            // Build query string
            const queryParams = new URLSearchParams();
            if (filters.type) queryParams.append('type', filters.type);
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.date_from) queryParams.append('date_from', filters.date_from);
            if (filters.date_to) queryParams.append('date_to', filters.date_to);

            const response = await api.get(`/kader/schedules?${queryParams.toString()}`);
            setSchedules(response.data.data);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Gagal memuat jadwal. Silakan coba lagi.';
            setError(errorMessage);
            console.error('Schedules fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleMarkComplete = async (id) => {
        if (!window.confirm('Apakah Anda yakin ingin menandai jadwal ini sebagai selesai?')) return;

        try {
            await api.put(`/kader/schedules/${id}`, {
                completed_at: new Date().toISOString()
            });
            fetchSchedules(); // Refresh list
        } catch (err) {
            alert('Gagal mengupdate status jadwal.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;

        try {
            await api.delete(`/kader/schedules/${id}`);
            fetchSchedules(); // Refresh list
        } catch (err) {
            alert('Gagal menghapus jadwal.');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            completed: 'bg-green-100 text-green-800 border-green-200',
            upcoming: 'bg-blue-100 text-blue-800 border-blue-200',
            overdue: 'bg-red-100 text-red-800 border-red-200',
        };

        const labels = {
            completed: 'Selesai',
            upcoming: 'Akan Datang',
            overdue: 'Terlewat',
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const getTypeLabel = (type) => {
        const labels = {
            imunisasi: 'Imunisasi',
            vitamin: 'Vitamin',
            posyandu: 'Posyandu',
        };
        return labels[type] || type;
    };

    return (
        <div className="flex flex-1 w-full h-full overflow-auto">
            <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Jadwal Kegiatan</h1>
                        <p className="text-gray-600 mt-2">Jadwal kegiatan posyandu dan imunisasi yang akan datang</p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard/jadwal/tambah')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah Jadwal
                    </button>
                </div>

                {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kegiatan</label>
                    <select
                        name="type"
                        value={filters.type}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="">Semua Jenis</option>
                        <option value="imunisasi">Imunisasi</option>
                        <option value="vitamin">Vitamin</option>
                        <option value="posyandu">Posyandu</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="">Semua Status</option>
                        <option value="upcoming">Akan Datang</option>
                        <option value="overdue">Terlewat</option>
                        <option value="completed">Selesai</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
                    <input
                        type="date"
                        name="date_from"
                        value={filters.date_from}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
                    <input
                        type="date"
                        name="date_to"
                        value={filters.date_to}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Anak</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kegiatan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catatan</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                                        Memuat data...
                                    </td>
                                </tr>
                            ) : schedules.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                                        Tidak ada jadwal ditemukan
                                    </td>
                                </tr>
                            ) : (
                                schedules.map((schedule) => (
                                    <tr key={schedule.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(schedule.scheduled_for).toLocaleDateString('id-ID', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{schedule.child.full_name}</div>
                                            <div className="text-xs text-gray-500">
                                                {schedule.child.gender === 'L' ? 'Laki-laki' : 'Perempuan'} • {formatAge(schedule.child.age_in_months)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 font-medium">{schedule.title}</div>
                                            <div className="text-xs text-gray-500 capitalize">{getTypeLabel(schedule.type)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(schedule.status)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                            {schedule.notes || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                {schedule.status !== 'completed' && (
                                                    <button
                                                        onClick={() => handleMarkComplete(schedule.id)}
                                                        className="text-green-600 hover:text-green-900"
                                                        title="Tandai Selesai"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(schedule.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Hapus"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
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
        </div>
    );
}
