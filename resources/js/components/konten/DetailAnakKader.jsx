import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../lib/api";
import { formatAge, getStatusColor, getStatusLabel } from "../../lib/utils";

export default function DetailAnakKader() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [childData, setChildData] = useState(null);

    useEffect(() => {
        fetchChildData();
    }, [id]);

    const fetchChildData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get(`/kader/children/${id}`);
            setChildData(response.data.data);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Gagal memuat data anak. Silakan coba lagi.';
            setError(errorMessage);
            console.error('Child fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-1 w-full h-full overflow-auto">
                <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-4">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Memuat data anak...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-1 w-full h-full overflow-auto">
                <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-4">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="text-red-600 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-gray-800 font-medium mb-2">Terjadi Kesalahan</p>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <button
                                onClick={fetchChildData}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Coba Lagi
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const latestWeighing = childData.weighing_logs?.[0];

    return (
        <div className="flex flex-1 w-full h-full overflow-auto">
            <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Detail Anak</h1>
                        <p className="text-gray-600 mt-2">Informasi lengkap data anak</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate(`/dashboard/data-anak/edit/${id}`)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </button>
                        <button
                            onClick={() => navigate('/dashboard/data-anak')}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Kembali
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Child Info Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="flex-shrink-0 h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 font-bold text-3xl">
                                        {childData.full_name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-gray-800">{childData.full_name}</h2>
                                    <div className="flex items-center gap-4 mt-2 text-gray-600">
                                        <span>{childData.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                                        <span>•</span>
                                        <span>{formatAge(childData.age_in_months)}</span>
                                        {childData.is_active ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Aktif
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                Tidak Aktif
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">NIK</p>
                                    <p className="text-base font-medium text-gray-900">{childData.nik || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Tanggal Lahir</p>
                                    <p className="text-base font-medium text-gray-900">
                                        {new Date(childData.birth_date).toLocaleDateString('id-ID', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Berat Lahir</p>
                                    <p className="text-base font-medium text-gray-900">
                                        {childData.birth_weight_kg ? `${childData.birth_weight_kg} kg` : '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Tinggi Lahir</p>
                                    <p className="text-base font-medium text-gray-900">
                                        {childData.birth_height_cm ? `${childData.birth_height_cm} cm` : '-'}
                                    </p>
                                </div>
                                {childData.notes && (
                                    <div className="md:col-span-2">
                                        <p className="text-sm text-gray-600">Catatan</p>
                                        <p className="text-base font-medium text-gray-900">{childData.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Latest Nutritional Status */}
                        {latestWeighing && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Gizi Terakhir</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Tanggal Ukur</p>
                                        <p className="text-base font-medium text-gray-900">
                                            {new Date(latestWeighing.measured_at).toLocaleDateString('id-ID')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Berat Badan</p>
                                        <p className="text-base font-medium text-gray-900">{latestWeighing.weight_kg} kg</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Tinggi Badan</p>
                                        <p className="text-base font-medium text-gray-900">{latestWeighing.height_cm} cm</p>
                                    </div>
                                    <div className="md:col-span-3">
                                        <p className="text-sm text-gray-600 mb-2">Status Gizi</p>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(latestWeighing.nutritional_status)}`}>
                                            {getStatusLabel(latestWeighing.nutritional_status)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Weighing History */}
                        {childData.weighing_logs && childData.weighing_logs.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Riwayat Penimbangan</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Berat (kg)</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tinggi (cm)</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {childData.weighing_logs.slice(0, 5).map((log) => (
                                                <tr key={log.id}>
                                                    <td className="px-4 py-3 text-sm text-gray-900">
                                                        {new Date(log.measured_at).toLocaleDateString('id-ID')}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{log.weight_kg}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{log.height_cm}</td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(log.nutritional_status)}`}>
                                                            {getStatusLabel(log.nutritional_status)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Parent & Posyandu Info */}
                    <div className="space-y-6">
                        {/* Parent Info */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Orang Tua</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600">Nama</p>
                                    <p className="text-base font-medium text-gray-900">{childData.parent?.name || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">No. Telepon</p>
                                    <p className="text-base font-medium text-gray-900">{childData.parent?.phone || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="text-base font-medium text-gray-900">{childData.parent?.email || '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Posyandu Info */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Posyandu</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600">Nama Posyandu</p>
                                    <p className="text-base font-medium text-gray-900">{childData.posyandu?.name || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Alamat</p>
                                    <p className="text-base font-medium text-gray-900">{childData.posyandu?.address || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Desa</p>
                                    <p className="text-base font-medium text-gray-900">{childData.posyandu?.village || '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Immunization Schedules */}
                        {childData.immunization_schedules && childData.immunization_schedules.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Jadwal Imunisasi</h3>
                                <div className="space-y-3">
                                    {childData.immunization_schedules.slice(0, 5).map((schedule) => (
                                        <div key={schedule.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{schedule.title}</p>
                                                <p className="text-sm text-gray-600">
                                                    {new Date(schedule.scheduled_for).toLocaleDateString('id-ID')}
                                                </p>
                                            </div>
                                            {schedule.completed_at ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Selesai
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
