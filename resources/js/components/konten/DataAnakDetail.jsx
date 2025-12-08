import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../lib/api";
import { formatAge, getStatusColor, getStatusLabel } from "../../lib/utils";
import { useDataCache } from "../../contexts/DataCacheContext";
import PageHeader from "../dashboard/PageHeader";
import {
    ChevronLeft,
    Calendar,
    Weight,
    Ruler,
    Activity,
    Utensils,
    Syringe,
    Clock,
    FileText,
    CheckCircle2,
    AlertCircle,
    Info,
    User,
    Pencil,
    Trash2
} from "lucide-react";
import AddChildModal from "./AddChildModal";
import { assets } from '../../assets/assets';

export default function DataAnakDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { invalidateCache } = useDataCache();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [childData, setChildData] = useState(null);
    const [activeTab, setActiveTab] = useState('history'); // history, meals, immunization
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Pagination states
    const ITEMS_PER_PAGE = 5;
    const [historyPage, setHistoryPage] = useState(1);
    const [mealsPage, setMealsPage] = useState(1);
    const [immunizationPage, setImmunizationPage] = useState(1);

    useEffect(() => {
        if (id) {
            fetchChildDetail(id);
        }
    }, [id]);

    const fetchChildDetail = async (childId) => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get(`/parent/children/${childId}`);
            setChildData(response.data.data);
        } catch (err) {
            if (err.response?.status === 403) {
                setError('Anda tidak memiliki akses untuk melihat data anak ini.');
            } else if (err.response?.status === 404) {
                setError('Data anak tidak ditemukan.');
            } else {
                const errorMessage = err.response?.data?.message || 'Gagal memuat data anak. Silakan coba lagi.';
                setError(errorMessage);
            }
            console.error('Child detail fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Apakah Anda yakin ingin menghapus data anak ini? Data yang dihapus tidak dapat dikembalikan.')) {
            try {
                await api.delete(`/parent/children/${id}`);
                // Invalidate cache after successful delete
                invalidateCache('children');
                invalidateCache('dashboard');
                navigate('/dashboard/anak', { state: { message: 'Data anak berhasil dihapus.' } });
            } catch (err) {
                console.error('Delete error:', err);
                alert('Gagal menghapus data anak. Silakan coba lagi.');
            }
        }
    };

    const handleEditSuccess = (message) => {
        fetchChildDetail(id);
        // Optional: Show success message
    };

    // Pagination helper
    const paginate = (items, page) => {
        if (!items || items.length === 0) return { data: [], totalPages: 0, total: 0 };
        const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
        const start = (page - 1) * ITEMS_PER_PAGE;
        return {
            data: items.slice(start, start + ITEMS_PER_PAGE),
            totalPages,
            total: items.length,
        };
    };

    // Pagination UI Component
    const PaginationUI = ({ currentPage, totalPages, total, onPageChange, label }) => {
        if (total === 0) return null;

        return (
            <div className="flex flex-col items-center gap-3 mt-6 pt-6 border-t border-gray-100">
                {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm disabled:hover:bg-white"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => {
                                const pageNum = i + 1;
                                const show = pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - currentPage) <= 1;
                                if (!show && (pageNum === currentPage - 2 || pageNum === currentPage + 2)) {
                                    return <span key={i} className="px-1 text-gray-400 text-sm">...</span>;
                                }
                                if (!show) return null;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => onPageChange(pageNum)}
                                        className={`min-w-[32px] h-8 rounded-lg text-sm font-medium transition-all ${pageNum === currentPage
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm disabled:hover:bg-white"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}
                <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                    Halaman {currentPage} dari {totalPages || 1} • Total: <span className="font-bold text-gray-700">{total}</span> {label}
                </div>
            </div>
        );
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex flex-1 w-full h-full overflow-auto bg-gray-50">
                <div className="p-4 md:p-10 w-full h-full flex flex-col gap-4 items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 font-medium">Memuat data anak...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-1 w-full h-full overflow-auto bg-gray-50">
                <div className="p-4 md:p-10 w-full h-full flex flex-col gap-4 items-center justify-center text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4">
                        <AlertCircle className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Terjadi Kesalahan</h3>
                    <p className="text-gray-600 mb-6 max-w-md">{error}</p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/dashboard/anak')}
                            className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                        >
                            Kembali
                        </button>
                        <button
                            onClick={() => fetchChildDetail(id)}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                        >
                            Coba Lagi
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!childData) return null;

    // Get latest weighing data
    const latestWeighing = childData.weighing_logs?.[0]; // Assuming weighing_logs are sorted by date descending
    const currentWeight = latestWeighing?.weight_kg;
    const currentHeight = latestWeighing?.height_cm;

    return (
        <div className="flex flex-1 w-full h-full overflow-auto no-scrollbar bg-gray-50">
            <div className="p-4 md:p-8 w-full max-w-7xl mx-auto flex flex-col gap-6 md:gap-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard/anak')}
                        className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-600"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Detail Anak</h1>
                        <p className="text-gray-500 text-xs md:text-sm">Informasi lengkap tumbuh kembang</p>
                    </div>
                </div>

                {/* Hero Section */}
                <div className="relative bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-visible">
                    {/* Decorative Background Layer */}
                    <div className="absolute inset-0 overflow-hidden rounded-[24px] pointer-events-none">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-bl-full -mr-16 -mt-16 opacity-50" />
                    </div>

                    {/* Content Layer */}
                    <div className="relative z-10 p-5 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center min-h-[200px]">
                        {/* Profile Info */}
                        <div className="flex items-center gap-4 md:gap-6 flex-1 w-full min-w-0">

                            <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-blue-50 p-1.5 shadow-inner flex-shrink-0">
                                <img
                                    src={childData.gender === 'L' ? assets.kepala_bayi : childData.gender === 'P' ? assets.kepala_bayi_cewe : `https://api.dicebear.com/9.x/adventurer/svg?seed=${childData.full_name}&backgroundColor=b6e3f4`}
                                    alt={childData.full_name}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-1 md:mb-2">
                                    <h2 className="text-xl md:text-3xl font-bold text-gray-900 truncate">{childData.full_name}</h2>
                                    <span className="px-2 md:px-3 py-0.5 md:py-1 bg-green-50 text-green-600 text-[10px] md:text-xs font-bold rounded-full border border-green-100 flex items-center gap-1.5 shrink-0">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        Sehat
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2 md:gap-4 text-gray-500 text-xs md:text-sm font-medium">
                                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                                        <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                        {formatAge(childData.age_in_months)}
                                    </div>
                                    <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300 self-center" />
                                    <div className="whitespace-nowrap">
                                        {childData.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                                    </div>
                                    <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300 self-center" />
                                    <div className="whitespace-nowrap hidden md:block">
                                        {new Date(childData.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>
                                </div>
                                <div className="mt-3 md:mt-4 flex gap-2">
                                    <span className="px-2.5 py-1 md:px-3 md:py-1.5 bg-gray-100 text-gray-600 text-[10px] md:text-xs rounded-lg font-medium truncate max-w-full">
                                        Posyandu: {childData.posyandu?.name || '-'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex gap-3 md:gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                            <div className="bg-blue-50/50 p-3 md:p-4 rounded-2xl min-w-[120px] md:min-w-[140px] border border-blue-100 shrink-0">
                                <div className="flex items-center gap-2 text-blue-600 mb-1 md:mb-2">
                                    <Weight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    <span className="text-[10px] md:text-xs font-bold uppercase">Berat Badan</span>
                                </div>
                                <p className="text-xl md:text-2xl font-bold text-gray-900">
                                    {currentWeight ? `${currentWeight} kg` : '-'}
                                </p>
                            </div>
                            <div className="bg-purple-50/50 p-3 md:p-4 rounded-2xl min-w-[120px] md:min-w-[140px] border border-purple-100 shrink-0">
                                <div className="flex items-center gap-2 text-purple-600 mb-1 md:mb-2">
                                    <Ruler className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    <span className="text-[10px] md:text-xs font-bold uppercase">Tinggi Badan</span>
                                </div>
                                <p className="text-xl md:text-2xl font-bold text-gray-900">
                                    {currentHeight ? `${currentHeight} cm` : '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Tabs */}
                <div className="flex flex-col gap-4 md:gap-6">
                    {/* Tab Navigation */}
                    <div className="grid grid-cols-4 md:flex gap-1 md:gap-2 p-1 bg-gray-100/80 rounded-xl w-full md:w-fit overflow-x-auto no-scrollbar">
                        {[
                            { id: 'history', label: 'Riwayat', icon: Activity },
                            { id: 'meals', label: 'Makanan', icon: Utensils },
                            { id: 'immunization', label: 'Imunisasi', icon: Syringe },
                            { id: 'details', label: 'Info', icon: Info },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                            px-2 md:px-3 py-2 md:py-2.5 rounded-lg text-[10px] md:text-sm font-medium transition-all flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-2
                            ${activeTab === tab.id
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}
                        `}
                            >
                                <tab.icon className="w-4 h-4 md:w-4 md:h-4 shrink-0" />
                                <span className="truncate">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 min-h-[400px]">
                        {activeTab === 'details' && (
                            <div className="p-5 md:p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Informasi Lengkap Anak</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Identity Section */}
                                    <div className="space-y-4">
                                        <h4 className="font-bold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-100">
                                            <User className="w-4 h-4 text-blue-500" />
                                            Identitas Diri
                                        </h4>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                                <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Nama Lengkap</p>
                                                <p className="font-bold text-gray-900 text-base md:text-lg">{childData.full_name}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-gray-50 rounded-xl p-3 md:p-4 border border-gray-100">
                                                    <p className="text-[10px] md:text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">NIK</p>
                                                    <p className="font-bold text-gray-900 font-mono text-sm md:text-base truncate">{childData.nik || '-'}</p>
                                                </div>
                                                <div className="bg-gray-50 rounded-xl p-3 md:p-4 border border-gray-100">
                                                    <p className="text-[10px] md:text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Jenis Kelamin</p>
                                                    <p className="font-bold text-gray-900 text-sm md:text-base">{childData.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-gray-50 rounded-xl p-3 md:p-4 border border-gray-100">
                                                    <p className="text-[10px] md:text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Tanggal Lahir</p>
                                                    <p className="font-bold text-gray-900 text-sm md:text-base">
                                                        {new Date(childData.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </p>
                                                </div>
                                                <div className="bg-gray-50 rounded-xl p-3 md:p-4 border border-gray-100">
                                                    <p className="text-[10px] md:text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Usia</p>
                                                    <p className="font-bold text-gray-900 text-sm md:text-base">{formatAge(childData.age_in_months)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Birth Data & Additional Info */}
                                    <div className="space-y-8">
                                        {/* Birth Data */}
                                        <div className="space-y-4">
                                            <h4 className="font-bold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-100">
                                                <Weight className="w-4 h-4 text-purple-500" />
                                                Data Kelahiran
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-purple-50/50 rounded-xl p-3 md:p-4 border border-purple-100">
                                                    <p className="text-[10px] md:text-xs text-purple-600 mb-1 font-medium uppercase tracking-wider">Berat Lahir</p>
                                                    <p className="font-bold text-gray-900 text-base md:text-lg">
                                                        {childData.birth_weight_kg != null ? `${childData.birth_weight_kg} kg` : '-'}
                                                    </p>
                                                </div>
                                                <div className="bg-purple-50/50 rounded-xl p-3 md:p-4 border border-purple-100">
                                                    <p className="text-[10px] md:text-xs text-purple-600 mb-1 font-medium uppercase tracking-wider">Tinggi Lahir</p>
                                                    <p className="font-bold text-gray-900 text-base md:text-lg">
                                                        {childData.birth_height_cm != null ? `${childData.birth_height_cm} cm` : '-'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        <div className="space-y-4">
                                            <h4 className="font-bold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-100">
                                                <FileText className="w-4 h-4 text-yellow-500" />
                                                Catatan Tambahan
                                            </h4>
                                            <div className="bg-yellow-50/50 rounded-xl p-4 border border-yellow-100 min-h-[100px]">
                                                {childData.notes ? (
                                                    <p className="text-gray-700 leading-relaxed text-sm md:text-base">{childData.notes}</p>
                                                ) : (
                                                    <p className="text-gray-400 italic text-sm">Tidak ada catatan khusus.</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* System Info */}
                                        <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-100">
                                            <span>Terdaftar sejak: {new Date(childData.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                            <span className={`px-2 py-1 rounded-full ${childData.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                {childData.is_active ? 'Aktif' : 'Tidak Aktif'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'history' && (
                            <div className="p-5 md:p-6">
                                <div className="flex justify-between items-center mb-4 md:mb-6">
                                    <h3 className="text-lg font-bold text-gray-900">Riwayat Pertumbuhan</h3>
                                </div>

                                {childData.weighing_logs.length === 0 ? (
                                    <EmptyState message="Belum ada data penimbangan" />
                                ) : (() => {
                                    const historyData = paginate(childData.weighing_logs, historyPage);
                                    return (
                                        <>
                                            {/* Mobile View (Cards) */}
                                            <div className="md:hidden flex flex-col gap-4">
                                                {historyData.data.map((log) => (
                                                    <div key={log.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900">
                                                                    {new Date(log.measured_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                                </p>
                                                                <span className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(log.nutritional_status)}`}>
                                                                    {getStatusLabel(log.nutritional_status)}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-3 gap-2 py-2 border-y border-gray-200/50">
                                                            <div>
                                                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Berat</p>
                                                                <p className="font-semibold text-gray-900">{log.weight_kg} kg</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Tinggi</p>
                                                                <p className="font-semibold text-gray-900">{log.height_cm} cm</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Lila</p>
                                                                <p className="font-semibold text-gray-900">{log.muac_cm ? `${log.muac_cm} cm` : '-'}</p>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Z-Score</p>
                                                            <div className="flex gap-3 text-xs font-mono bg-white p-2 rounded-lg border border-gray-100">
                                                                <div className="flex flex-col">
                                                                    <span className="text-gray-400 text-[10px]">HFA</span>
                                                                    <span className={log.zscore_hfa < -2 || log.zscore_hfa > 2 ? 'text-red-500 font-bold' : 'text-gray-700'}>
                                                                        {log.zscore_hfa ? Number(log.zscore_hfa).toFixed(2) : '-'}
                                                                    </span>
                                                                </div>
                                                                <div className="w-px bg-gray-100"></div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-gray-400 text-[10px]">WFA</span>
                                                                    <span className={log.zscore_wfa < -2 || log.zscore_wfa > 2 ? 'text-red-500 font-bold' : 'text-gray-700'}>
                                                                        {log.zscore_wfa ? Number(log.zscore_wfa).toFixed(2) : '-'}
                                                                    </span>
                                                                </div>
                                                                <div className="w-px bg-gray-100"></div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-gray-400 text-[10px]">WFH</span>
                                                                    <span className={log.zscore_wfh < -2 || log.zscore_wfh > 2 ? 'text-red-500 font-bold' : 'text-gray-700'}>
                                                                        {log.zscore_wfh ? Number(log.zscore_wfh).toFixed(2) : '-'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Desktop View (Table) */}
                                            <div className="hidden md:block overflow-x-auto no-scrollbar">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="border-b border-gray-100">
                                                            <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">ANAK</th>
                                                            <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">TANGGAL</th>
                                                            <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">BERAT</th>
                                                            <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">TINGGI</th>
                                                            <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">LILA</th>
                                                            <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">LK</th>
                                                            <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">CATATAN</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        {historyData.data.map((log) => (
                                                            <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                                                <td className="py-4 px-4">
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className="text-sm font-bold text-gray-900">{childData.full_name}</span>
                                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border w-fit ${getStatusColor(log.nutritional_status)}`}>
                                                                            {getStatusLabel(log.nutritional_status)}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="py-4 px-4">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm font-bold text-gray-900">
                                                                            {new Date(log.measured_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                        </span>
                                                                        <span className="text-xs text-gray-500">
                                                                            {new Date(log.measured_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="py-4 px-4">
                                                                    <span className="text-sm font-bold text-gray-900">{log.weight_kg}</span>
                                                                    <span className="text-xs text-gray-500 ml-1">kg</span>
                                                                </td>
                                                                <td className="py-4 px-4">
                                                                    <span className="text-sm font-bold text-gray-900">{log.height_cm}</span>
                                                                    <span className="text-xs text-gray-500 ml-1">cm</span>
                                                                </td>
                                                                <td className="py-4 px-4">
                                                                    {log.muac_cm ? (
                                                                        <>
                                                                            <span className="text-sm font-bold text-gray-900">{log.muac_cm}</span>
                                                                            <span className="text-xs text-gray-500 ml-1">cm</span>
                                                                        </>
                                                                    ) : (
                                                                        <span className="text-gray-400">-</span>
                                                                    )}
                                                                </td>
                                                                <td className="py-4 px-4">
                                                                    {log.head_circumference_cm ? (
                                                                        <>
                                                                            <span className="text-sm font-bold text-gray-900">{log.head_circumference_cm}</span>
                                                                            <span className="text-xs text-gray-500 ml-1">cm</span>
                                                                        </>
                                                                    ) : (
                                                                        <span className="text-gray-400">-</span>
                                                                    )}
                                                                </td>
                                                                <td className="py-4 px-4">
                                                                    <div className="flex items-center gap-2 text-gray-500">
                                                                        {log.notes ? (
                                                                            <>
                                                                                <FileText className="w-4 h-4 text-yellow-500 shrink-0" />
                                                                                <span className="text-xs truncate max-w-[150px]">{log.notes}</span>
                                                                            </>
                                                                        ) : (
                                                                            <span className="text-gray-300">-</span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Pagination */}
                                            <PaginationUI
                                                currentPage={historyPage}
                                                totalPages={historyData.totalPages}
                                                total={historyData.total}
                                                onPageChange={setHistoryPage}
                                                label="penimbangan"
                                            />
                                        </>
                                    );
                                })()}
                            </div>
                        )}

                        {activeTab === 'meals' && (
                            <div className="p-5 md:p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Log Makanan Terakhir</h3>
                                {(!childData.meal_logs || childData.meal_logs.length === 0) ? (
                                    <EmptyState message="Belum ada log makanan" />
                                ) : (() => {
                                    const mealsData = paginate(childData.meal_logs, mealsPage);
                                    return (
                                        <>
                                            <div className="relative">
                                                {mealsData.data.map((log, index) => (
                                                    <div key={log.id} className="relative pl-8 pb-8 last:pb-0">
                                                        {/* Timeline Line */}
                                                        {index !== mealsData.data.length - 1 && (
                                                            <div className="absolute left-[11px] top-8 bottom-0 w-[2px] bg-gray-100" />
                                                        )}

                                                        {/* Dot */}
                                                        <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 z-10">
                                                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                                                        </div>

                                                        {/* Content Card */}
                                                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 hover:border-blue-200 transition-colors">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <span className="text-sm font-bold text-gray-900">
                                                                    {new Date(log.eaten_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                                </span>
                                                                {log.time_of_day && (
                                                                    <span className="px-2 py-1 bg-white rounded-lg text-xs font-medium text-gray-500 border border-gray-200">
                                                                        {log.time_of_day}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-gray-700 font-medium mb-2">{log.description}</p>
                                                            {(log.ingredients || log.source) && (
                                                                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200/50">
                                                                    {log.ingredients && (
                                                                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-200">
                                                                            Bahan: {log.ingredients}
                                                                        </span>
                                                                    )}
                                                                    {log.source && (
                                                                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-200">
                                                                            Sumber: {log.source}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Pagination */}
                                            <PaginationUI
                                                currentPage={mealsPage}
                                                totalPages={mealsData.totalPages}
                                                total={mealsData.total}
                                                onPageChange={setMealsPage}
                                                label="log makanan"
                                            />
                                        </>
                                    );
                                })()}
                            </div>
                        )}

                        {activeTab === 'immunization' && (
                            <div className="p-5 md:p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Jadwal Imunisasi</h3>
                                {(!childData.immunization_schedules || childData.immunization_schedules.length === 0) ? (
                                    <EmptyState message="Belum ada jadwal imunisasi" />
                                ) : (() => {
                                    const immunizationData = paginate(childData.immunization_schedules, immunizationPage);
                                    return (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {immunizationData.data.map((schedule) => (
                                                    <div
                                                        key={schedule.id}
                                                        className={`p-4 rounded-2xl border transition-all ${schedule.completed_at
                                                            ? 'bg-green-50/50 border-green-100'
                                                            : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm'
                                                            }`}
                                                    >
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`p-2 rounded-full ${schedule.completed_at ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                                                    <Syringe className="w-4 h-4" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-bold text-gray-900">{schedule.title}</h4>
                                                                    <p className="text-xs text-gray-500">{schedule.type}</p>
                                                                </div>
                                                            </div>
                                                            {schedule.completed_at ? (
                                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                            ) : (
                                                                <Clock className="w-5 h-5 text-gray-300" />
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Calendar className="w-4 h-4 text-gray-400" />
                                                            <span className={schedule.completed_at ? 'text-green-700 font-medium' : 'text-gray-600'}>
                                                                {new Date(schedule.scheduled_for).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                            </span>
                                                        </div>

                                                        {schedule.completed_at && (
                                                            <div className="mt-2 text-xs text-green-600 bg-green-100/50 px-2 py-1 rounded-lg w-fit">
                                                                Selesai: {new Date(schedule.completed_at).toLocaleDateString('id-ID')}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Pagination */}
                                            <PaginationUI
                                                currentPage={immunizationPage}
                                                totalPages={immunizationData.totalPages}
                                                total={immunizationData.total}
                                                onPageChange={setImmunizationPage}
                                                label="jadwal imunisasi"
                                            />
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Edit Modal */}
            <AddChildModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={handleEditSuccess}
                initialData={childData}
            />
        </div>
    );
}

function EmptyState({ message }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">{message}</p>
        </div>
    );
}

