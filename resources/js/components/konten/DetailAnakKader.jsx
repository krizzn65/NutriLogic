import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../lib/api";
import { useDataCache } from "../../contexts/DataCacheContext";
import { formatAge, getStatusColor, getStatusLabel } from "../../lib/utils";
import PageHeader from "../dashboard/PageHeader";
import { assets } from "../../assets/assets";
import { ChevronLeft, Pencil } from "lucide-react";
import DetailAnakKaderSkeleton from "../loading/DetailAnakKaderSkeleton";

export default function DetailAnakKader() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [childData, setChildData] = useState(null);

    // Data caching
    const { getCachedData, setCachedData } = useDataCache();

    useEffect(() => {
        fetchChildData();
    }, [id]);

    const fetchChildData = async () => {
        // Check cache first with ID-based key
        const cacheKey = `kader_child_${id}`;
        const cachedChild = getCachedData(cacheKey);
        if (cachedChild) {
            setChildData(cachedChild);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await api.get(`/kader/children/${id}`);
            setChildData(response.data.data);
            setCachedData(cacheKey, response.data.data);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Gagal memuat data anak. Silakan coba lagi.';
            setError(errorMessage);
            console.error('Child fetch error:', err);
        } finally {
            setLoading(false);
        }
    };


    if (loading) {
        return <DetailAnakKaderSkeleton />;
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
        <div className="flex flex-1 w-full h-full overflow-auto no-scrollbar bg-gray-50">
            <div className="p-4 md:p-10 w-full h-full flex flex-col gap-6">
                <PageHeader
                    title={
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate('/dashboard/data-anak')}
                                className="md:hidden -ml-2 p-1 text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <span>Detail Anak</span>
                        </div>
                    }
                    subtitle="Portal Kader"
                >
                    <div className="hidden md:flex gap-3">
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
                </PageHeader>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Child Info Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 relative">
                            {/* Mobile Edit Button */}
                            <button
                                onClick={() => navigate(`/dashboard/data-anak/edit/${id}`)}
                                className="md:hidden absolute top-4 right-4 p-2 text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 rounded-full border border-gray-100"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>

                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6 text-center sm:text-left">
                                <div className="shrink-0 h-24 w-24 sm:h-20 sm:w-20 bg-blue-50 rounded-full flex items-center justify-center overflow-hidden border-4 sm:border-2 border-white shadow-sm mx-auto sm:mx-0">
                                    <img
                                        src={childData.gender === 'L' ? assets.kepala_bayi : childData.gender === 'P' ? assets.kepala_bayi_cewe : `https://api.dicebear.com/9.x/adventurer/svg?seed=${childData.full_name}&backgroundColor=b6e3f4`}
                                        alt={childData.full_name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">{childData.full_name}</h2>
                                    <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 sm:gap-4 mt-2 text-gray-600 text-sm md:text-base">
                                        <span>{childData.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                                        <span className="hidden sm:inline">•</span>
                                        <span>{formatAge(childData.age_in_months)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">NIK</p>
                                    <p className="text-sm md:text-base font-semibold text-gray-900">{childData.nik || '-'}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tanggal Lahir</p>
                                    <p className="text-sm md:text-base font-semibold text-gray-900">
                                        {new Date(childData.birth_date).toLocaleDateString('id-ID', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Berat Lahir</p>
                                    <p className="text-sm md:text-base font-semibold text-gray-900">
                                        {childData.birth_weight_kg ? `${childData.birth_weight_kg} kg` : '-'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tinggi Lahir</p>
                                    <p className="text-sm md:text-base font-semibold text-gray-900">
                                        {childData.birth_height_cm ? `${childData.birth_height_cm} cm` : '-'}
                                    </p>
                                </div>
                                {childData.notes && (
                                    <div className="sm:col-span-2 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                        <p className="text-xs text-yellow-600 uppercase tracking-wider mb-1">Catatan</p>
                                        <p className="text-sm md:text-base font-medium text-gray-800">{childData.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Latest Nutritional Status */}
                        {latestWeighing && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    Status Gizi Terakhir
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <p className="text-xs text-gray-500 mb-1">Tanggal Ukur</p>
                                        <p className="text-base font-bold text-gray-900">
                                            {new Date(latestWeighing.measured_at).toLocaleDateString('id-ID')}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <p className="text-xs text-gray-500 mb-1">Berat Badan</p>
                                        <p className="text-base font-bold text-gray-900">{latestWeighing.weight_kg} kg</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <p className="text-xs text-gray-500 mb-1">Tinggi Badan</p>
                                        <p className="text-base font-bold text-gray-900">{latestWeighing.height_cm} cm</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <p className="text-xs text-gray-500 mb-1">Lingkar Lengan</p>
                                        <p className="text-base font-bold text-gray-900">
                                            {latestWeighing.muac_cm ? `${latestWeighing.muac_cm} cm` : '-'}
                                        </p>
                                    </div>
                                    <div className="sm:col-span-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <p className="text-xs text-gray-500 mb-2">Status Gizi</p>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(latestWeighing.nutritional_status)}`}>
                                            {getStatusLabel(latestWeighing.nutritional_status)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Weighing History */}
                        {childData.weighing_logs && childData.weighing_logs.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Riwayat Penimbangan
                                </h3>

                                {/* Mobile View (Cards) */}
                                <div className="md:hidden flex flex-col gap-3">
                                    {childData.weighing_logs.slice(0, 5).map((log) => (
                                        <div key={log.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">
                                                        {new Date(log.measured_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </p>
                                                </div>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(log.nutritional_status)}`}>
                                                    {getStatusLabel(log.nutritional_status)}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                <div className="bg-white p-2 rounded border border-gray-100">
                                                    <p className="text-[10px] text-gray-500 uppercase">Berat</p>
                                                    <p className="font-semibold text-gray-900 text-sm">{log.weight_kg} kg</p>
                                                </div>
                                                <div className="bg-white p-2 rounded border border-gray-100">
                                                    <p className="text-[10px] text-gray-500 uppercase">Tinggi</p>
                                                    <p className="font-semibold text-gray-900 text-sm">{log.height_cm} cm</p>
                                                </div>
                                                <div className="bg-white p-2 rounded border border-gray-100">
                                                    <p className="text-[10px] text-gray-500 uppercase">Lila</p>
                                                    <p className="font-semibold text-gray-900 text-sm">{log.muac_cm || '-'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop View (Table) */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Berat (kg)</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tinggi (cm)</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Lingkar Lengan (cm)</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {childData.weighing_logs.slice(0, 5).map((log) => (
                                                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                        {new Date(log.measured_at).toLocaleDateString('id-ID')}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">{log.weight_kg}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">{log.height_cm}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">{log.muac_cm || '-'}</td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(log.nutritional_status)}`}>
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
