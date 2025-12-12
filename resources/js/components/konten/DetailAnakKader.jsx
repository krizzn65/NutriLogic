import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../lib/api";
import { useDataCache } from "../../contexts/DataCacheContext";
import { formatAge, getStatusColor, getStatusLabel } from "../../lib/utils";
import PageHeader from "../ui/PageHeader";
import { assets } from "../../assets/assets";
import { ChevronLeft } from "lucide-react";
import DetailAnakKaderSkeleton from "../loading/DetailAnakKaderSkeleton";

export default function DetailAnakKader() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [childData, setChildData] = useState(null);

    // Tab navigation state
    const [activeTab, setActiveTab] = useState('weighing'); // weighing, vitamin, immunization, meals, pmt

    // Show more states (kept for backward compatibility if needed)
    const [showAllVitamin, setShowAllVitamin] = useState(false);
    const [showAllImmunization, setShowAllImmunization] = useState(false);

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
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <p className="text-xs text-gray-500 mb-1">Lingkar Kepala</p>
                                        <p className="text-base font-bold text-gray-900">
                                            {latestWeighing.head_circumference_cm ? `${latestWeighing.head_circumference_cm} cm` : '-'}
                                        </p>
                                    </div>
                                    <div className="lg:col-span-1 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <p className="text-xs text-gray-500 mb-2">Status Gizi</p>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(latestWeighing.nutritional_status)}`}>
                                            {getStatusLabel(latestWeighing.nutritional_status)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab Navigation for History Data */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1">
                            <div className="grid grid-cols-2 md:flex gap-1 md:gap-2 p-1 bg-gray-100/80 rounded-xl w-full md:w-fit overflow-x-auto no-scrollbar">
                                {[
                                    { id: 'weighing', label: 'Penimbangan', icon: '⚖️' },
                                    { id: 'vitamin', label: 'Vitamin', icon: '💊' },
                                    { id: 'immunization', label: 'Imunisasi', icon: '💉' },
                                    { id: 'meals', label: 'Makanan', icon: '🍽️' },
                                    { id: 'pmt', label: 'PMT', icon: '📦' },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                                            px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all flex items-center justify-center gap-2
                                            ${activeTab === tab.id
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}
                                        `}
                                    >
                                        <span>{tab.icon}</span>
                                        <span className="truncate">{tab.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Weighing History */}
                        {activeTab === 'weighing' && childData.weighing_logs && childData.weighing_logs.length > 0 && (
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
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                                                <div className="bg-white p-2 rounded border border-gray-100">
                                                    <p className="text-[10px] text-gray-500 uppercase">Berat</p>
                                                    <p className="font-semibold text-gray-900 text-sm">{log.weight_kg} kg</p>
                                                </div>
                                                <div className="bg-white p-2 rounded border border-gray-100">
                                                    <p className="text-[10px] text-gray-500 uppercase">Tinggi</p>
                                                    <p className="font-semibold text-gray-900 text-sm">{log.height_cm} cm</p>
                                                </div>
                                                <div className="bg-white p-2 rounded border border-gray-100">
                                                    <p className="text-[10px] text-gray-500 uppercase">Lengan</p>
                                                    <p className="font-semibold text-gray-900 text-sm">{log.muac_cm || '-'}</p>
                                                </div>
                                                <div className="bg-white p-2 rounded border border-gray-100">
                                                    <p className="text-[10px] text-gray-500 uppercase">Kepala</p>
                                                    <p className="font-semibold text-gray-900 text-sm">{log.head_circumference_cm || '-'}</p>
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
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Lengan (cm)</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kepala (cm)</th>
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
                                                    <td className="px-4 py-3 text-sm text-gray-600">{log.head_circumference_cm || '-'}</td>
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

                        {/* Vitamin Distribution History */}
                        {activeTab === 'vitamin' && childData.vitamin_distributions && childData.vitamin_distributions.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                    Riwayat Pemberian Vitamin
                                </h3>

                                {/* Mobile View (Cards) */}
                                <div className="md:hidden flex flex-col gap-3">
                                    {childData.vitamin_distributions.slice(0, showAllVitamin ? undefined : 5).map((vitamin) => (
                                        <div key={vitamin.id} className="bg-green-50 rounded-lg p-4 border border-green-100">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">
                                                        {new Date(vitamin.distribution_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </p>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        {vitamin.vitamin_type === 'vitamin_a_blue' ? '🔵 Vitamin A Biru (100.000 IU)' :
                                                            vitamin.vitamin_type === 'vitamin_a_red' ? '🔴 Vitamin A Merah (200.000 IU)' :
                                                                '📦 Lainnya'}
                                                    </p>
                                                </div>
                                            </div>
                                            {vitamin.dosage && (
                                                <div className="bg-white p-2 rounded border border-green-100 mb-2">
                                                    <p className="text-[10px] text-gray-500 uppercase mb-1">Dosis</p>
                                                    <p className="font-medium text-gray-900 text-sm">{vitamin.dosage}</p>
                                                </div>
                                            )}
                                            {vitamin.notes && (
                                                <div className="bg-white p-2 rounded border border-green-100">
                                                    <p className="text-[10px] text-gray-500 uppercase mb-1">Catatan</p>
                                                    <p className="text-gray-700 text-xs">{vitamin.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop View (Table) */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Jenis Vitamin</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Dosis</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Catatan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {childData.vitamin_distributions.slice(0, showAllVitamin ? undefined : 5).map((vitamin) => (
                                                <tr key={vitamin.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                        {new Date(vitamin.distribution_date).toLocaleDateString('id-ID')}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">
                                                        {vitamin.vitamin_type === 'vitamin_a_blue' ? '🔵 Vitamin A Biru (100.000 IU)' :
                                                            vitamin.vitamin_type === 'vitamin_a_red' ? '🔴 Vitamin A Merah (200.000 IU)' :
                                                                '📦 Lainnya'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">{vitamin.dosage || '-'}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">{vitamin.notes || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Show More Button */}
                                {childData.vitamin_distributions.length > 5 && (
                                    <div className="mt-4 text-center">
                                        <button
                                            onClick={() => setShowAllVitamin(!showAllVitamin)}
                                            className="px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors inline-flex items-center gap-2"
                                        >
                                            {showAllVitamin ? (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                    </svg>
                                                    Tampilkan Lebih Sedikit
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                    Lihat Semua ({childData.vitamin_distributions.length} riwayat)
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Immunization Records History */}
                        {activeTab === 'immunization' && childData.immunization_records && childData.immunization_records.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    Riwayat Imunisasi
                                </h3>

                                {/* Mobile View (Cards) */}
                                <div className="md:hidden flex flex-col gap-3">
                                    {childData.immunization_records.slice(0, showAllImmunization ? undefined : 5).map((record) => (
                                        <div key={record.id} className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">
                                                        {new Date(record.immunization_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </p>
                                                    <p className="text-xs text-gray-600 mt-1 font-medium">
                                                        {record.vaccine_type === 'bcg' ? '💉 BCG - Tuberkulosis' :
                                                            record.vaccine_type.startsWith('hepatitis_b') ? `💉 Hepatitis B ${record.vaccine_type.split('_').pop()}` :
                                                                record.vaccine_type.startsWith('polio') ? `💉 Polio ${record.vaccine_type.split('_').pop()}` :
                                                                    record.vaccine_type.startsWith('dpt') ? `💉 DPT-HiB-HepB ${record.vaccine_type.split('_').pop()}` :
                                                                        record.vaccine_type.startsWith('ipv') ? `💉 IPV ${record.vaccine_type.split('_').pop()} (Polio Suntik)` :
                                                                            record.vaccine_type.startsWith('campak') ? `💉 Campak-Rubella ${record.vaccine_type.split('_').pop()}` :
                                                                                '💉 Vaksin Lainnya'}
                                                    </p>
                                                </div>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                                                    ✓ Selesai
                                                </span>
                                            </div>
                                            {record.notes && (
                                                <div className="bg-white p-2 rounded border border-purple-100">
                                                    <p className="text-[10px] text-gray-500 uppercase mb-1">Catatan</p>
                                                    <p className="text-gray-700 text-xs">{record.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop View (Table) */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Jenis Vaksin</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Catatan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {childData.immunization_records.slice(0, showAllImmunization ? undefined : 5).map((record) => (
                                                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                        {new Date(record.immunization_date).toLocaleDateString('id-ID')}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">
                                                        {record.vaccine_type === 'bcg' ? '💉 BCG - Tuberkulosis' :
                                                            record.vaccine_type.startsWith('hepatitis_b') ? `💉 Hepatitis B ${record.vaccine_type.split('_').pop()}` :
                                                                record.vaccine_type.startsWith('polio') ? `💉 Polio ${record.vaccine_type.split('_').pop()}` :
                                                                    record.vaccine_type.startsWith('dpt') ? `💉 DPT-HiB-HepB ${record.vaccine_type.split('_').pop()}` :
                                                                        record.vaccine_type.startsWith('ipv') ? `💉 IPV ${record.vaccine_type.split('_').pop()} (Polio Suntik)` :
                                                                            record.vaccine_type.startsWith('campak') ? `💉 Campak-Rubella ${record.vaccine_type.split('_').pop()}` :
                                                                                '💉 Vaksin Lainnya'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                                                            ✓ Selesai
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">{record.notes || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Show More Button */}
                                {childData.immunization_records.length > 5 && (
                                    <div className="mt-4 text-center">
                                        <button
                                            onClick={() => setShowAllImmunization(!showAllImmunization)}
                                            className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors inline-flex items-center gap-2"
                                        >
                                            {showAllImmunization ? (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                    </svg>
                                                    Tampilkan Lebih Sedikit
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                    Lihat Semua ({childData.immunization_records.length} riwayat)
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Meal Journal / Jurnal Makan */}
                        {activeTab === 'meals' && childData.meal_logs && childData.meal_logs.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    Jurnal Makan dari Orang Tua
                                </h3>

                                {/* Mobile View (Cards) */}
                                <div className="md:hidden flex flex-col gap-3">
                                    {childData.meal_logs.slice(0, 10).map((meal) => (
                                        <div key={meal.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">
                                                        {new Date(meal.eaten_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {new Date(meal.eaten_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                {meal.time_of_day && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800 capitalize">
                                                        {meal.time_of_day}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <div className="bg-white p-2 rounded border border-gray-100">
                                                    <p className="text-[10px] text-gray-500 uppercase mb-1">Menu</p>
                                                    <p className="font-medium text-gray-900 text-sm">{meal.description}</p>
                                                </div>
                                                {meal.ingredients && (
                                                    <div className="bg-white p-2 rounded border border-gray-100">
                                                        <p className="text-[10px] text-gray-500 uppercase mb-1">Bahan</p>
                                                        <p className="text-gray-700 text-xs">{meal.ingredients}</p>
                                                    </div>
                                                )}
                                                {meal.portion && (
                                                    <div className="bg-white p-2 rounded border border-gray-100">
                                                        <p className="text-[10px] text-gray-500 uppercase mb-1">Porsi</p>
                                                        <p className="text-gray-700 text-xs capitalize">{meal.portion.replace('_', ' ')}</p>
                                                    </div>
                                                )}
                                                {meal.notes && (
                                                    <div className="bg-yellow-50 p-2 rounded border border-yellow-100">
                                                        <p className="text-[10px] text-yellow-600 uppercase mb-1">Catatan</p>
                                                        <p className="text-gray-700 text-xs">{meal.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop View (Table) */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal & Waktu</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Waktu Makan</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Menu</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Porsi</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Catatan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {childData.meal_logs.slice(0, 10).map((meal) => (
                                                <tr key={meal.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                        <div>
                                                            <p>{new Date(meal.eaten_at).toLocaleDateString('id-ID')}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {new Date(meal.eaten_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">
                                                        {meal.time_of_day ? (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                                                {meal.time_of_day}
                                                            </span>
                                                        ) : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">
                                                        <div>
                                                            <p className="font-medium">{meal.description}</p>
                                                            {meal.ingredients && (
                                                                <p className="text-xs text-gray-500 mt-1">{meal.ingredients}</p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                                                        {meal.portion ? meal.portion.replace('_', ' ') : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">
                                                        {meal.notes || '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {childData.meal_logs.length > 10 && (
                                    <div className="mt-4 text-center">
                                        <p className="text-sm text-gray-500">
                                            Menampilkan 10 dari {childData.meal_logs.length} catatan jurnal makan
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* PMT Tracking */}
                        {activeTab === 'pmt' && childData.pmt_logs && childData.pmt_logs.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                    Riwayat PMT dari Orang Tua
                                </h3>

                                {/* Mobile View (Cards) */}
                                <div className="md:hidden flex flex-col gap-3">
                                    {childData.pmt_logs.slice(0, 15).map((pmt) => (
                                        <div key={pmt.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">
                                                        {new Date(pmt.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </p>
                                                </div>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${pmt.status === 'consumed'
                                                    ? 'bg-green-50 text-green-700 border-green-200'
                                                    : pmt.status === 'partial'
                                                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                        : 'bg-red-50 text-red-700 border-red-200'
                                                    }`}>
                                                    {pmt.status === 'consumed' ? 'Habis' : pmt.status === 'partial' ? 'Sebagian' : 'Ditolak'}
                                                </span>
                                            </div>
                                            {pmt.notes && (
                                                <div className="bg-white p-2 rounded border border-gray-100">
                                                    <p className="text-[10px] text-gray-500 uppercase mb-1">Catatan</p>
                                                    <p className="text-gray-700 text-xs">{pmt.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop View (Table) */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status Konsumsi</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Catatan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {childData.pmt_logs.slice(0, 15).map((pmt) => (
                                                <tr key={pmt.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                        {new Date(pmt.date).toLocaleDateString('id-ID', {
                                                            weekday: 'long',
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        })}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${pmt.status === 'consumed'
                                                            ? 'bg-green-50 text-green-700 border-green-200'
                                                            : pmt.status === 'partial'
                                                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                                : 'bg-red-50 text-red-700 border-red-200'
                                                            }`}>
                                                            {pmt.status === 'consumed' ? '✓ Habis' : pmt.status === 'partial' ? '◐ Sebagian' : '✗ Ditolak'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-600">
                                                        {pmt.notes || '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {childData.pmt_logs.length > 15 && (
                                    <div className="mt-4 text-center">
                                        <p className="text-sm text-gray-500">
                                            Menampilkan 15 dari {childData.pmt_logs.length} catatan PMT
                                        </p>
                                    </div>
                                )}

                                {/* PMT Statistics Summary */}
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Ringkasan Konsumsi PMT</h4>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                                            <p className="text-xs text-green-600 mb-1">Habis</p>
                                            <p className="text-2xl font-bold text-green-700">
                                                {childData.pmt_logs.filter(p => p.status === 'consumed').length}
                                            </p>
                                        </div>
                                        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
                                            <p className="text-xs text-yellow-600 mb-1">Sebagian</p>
                                            <p className="text-2xl font-bold text-yellow-700">
                                                {childData.pmt_logs.filter(p => p.status === 'partial').length}
                                            </p>
                                        </div>
                                        <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                                            <p className="text-xs text-red-600 mb-1">Ditolak</p>
                                            <p className="text-2xl font-bold text-red-700">
                                                {childData.pmt_logs.filter(p => p.status === 'refused').length}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-3 bg-blue-50 rounded-lg p-3 border border-blue-100">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-blue-600">Tingkat Kepatuhan</span>
                                            <span className="text-lg font-bold text-blue-700">
                                                {childData.pmt_logs.length > 0
                                                    ? Math.round((childData.pmt_logs.filter(p => p.status === 'consumed').length / childData.pmt_logs.length) * 100)
                                                    : 0}%
                                            </span>
                                        </div>
                                    </div>
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
