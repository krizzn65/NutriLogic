import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../lib/api";
import { useDataCache } from "../../contexts/DataCacheContext";
import { Search, Plus, MessageSquare, Clock, CheckCircle, User, ChevronRight, Filter, Trash2, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DetailKonsultasiKader from "./DetailKonsultasiKader";
import ConsultationListSkeleton from "../loading/ConsultationListSkeleton";

export default function KonsultasiKader() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [consultations, setConsultations] = useState([]);
    const [filterStatus, setFilterStatus] = useState("all");
    const [deletingId, setDeletingId] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const { getCachedData, setCachedData, invalidateCache } = useDataCache();

    useEffect(() => {
        fetchConsultations(filterStatus);
    }, [filterStatus]);

    // Auto-refresh to keep online status current
    useEffect(() => {
        // Poll every 30 seconds to refresh online status
        const intervalId = setInterval(() => {
            // Only refresh if document is visible (user is on the page)
            if (document.visibilityState === 'visible') {
                fetchConsultations(filterStatus, true); // Pass true to skip loading state
            }
        }, 30000); // 30 seconds

        // Cleanup on unmount
        return () => clearInterval(intervalId);
    }, [filterStatus]);

    const fetchConsultations = async (status = "all", silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }
            setError(null);

            const cacheKey = `kader_consultations_${status}`;
            const cachedData = getCachedData(cacheKey);
            if (cachedData && !silent) {
                setConsultations(cachedData);
                setLoading(false);
                return;
            }

            const params = status !== "all" ? { status } : {};
            const response = await api.get('/kader/consultations', { params });
            const data = response.data.data;
            setConsultations(data);
            setCachedData(cacheKey, data);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Gagal memuat data konsultasi. Silakan coba lagi.';
            setError(errorMessage);
            console.error('Consultations fetch error:', err);
        } finally {
            if (!silent) {
                setLoading(false);
            } else {
                setRefreshing(false);
            }
        }
    };

    const handleDeleteClick = (e, consultationId) => {
        e.stopPropagation();
        setDeleteModal({ show: true, id: consultationId });
    };

    const confirmDelete = async () => {
        const deleteId = deleteModal.id;
        if (!deleteId) return;

        try {
            setDeletingId(deleteId);
            setDeleteModal({ show: false, id: null }); // Close modal immediately

            await api.delete(`/kader/consultations/${deleteId}`);

            // Remove from local state immediately
            setConsultations(prev => prev.filter(c => c.id !== deleteId));

            // Invalidate cache
            invalidateCache('kader_consultations_all');
            invalidateCache('kader_consultations_open');
            invalidateCache('kader_consultations_closed');

            // If the deleted consultation was currently selected, navigate back to list
            if (id && parseInt(id) === deleteId) {
                navigate('/dashboard/konsultasi');
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert('Gagal menghapus percakapan.');
        } finally {
            setDeletingId(null);
        }
    };

    const getTimeAgo = (date) => {
        const now = new Date();
        const past = new Date(date);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Baru saja';
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}j`;
        if (diffDays < 7) return `${diffDays}h`;
        return past.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    const filteredConsultations = consultations.filter(c =>
        c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.parent?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && consultations.length === 0) {
        return <ConsultationListSkeleton />;
    }

    return (
        <div className="flex h-full bg-white overflow-hidden">
            {/* Sidebar List */}
            <div className={`flex-col h-full bg-white border-r border-slate-200 md:w-[400px] flex-shrink-0 ${id ? 'hidden md:flex' : 'flex w-full'}`}>
                {/* Header Section */}
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-bold text-slate-800">Konsultasi</h1>
                        <div className="flex items-center gap-2">
                            {refreshing && (
                                <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" title="Memperbarui..." />
                            )}
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari konsultasi atau orang tua..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex gap-1 bg-slate-200/50 p-1 rounded-lg w-full">
                        {['all', 'open', 'closed'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all duration-200 capitalize ${filterStatus === status
                                    ? 'bg-white text-slate-800 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {status === 'all' ? 'Semua' : status === 'open' ? 'Aktif' : 'Selesai'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex gap-3 items-center animate-pulse">
                                    <div className="w-12 h-12 bg-slate-200 rounded-full flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                                        <div className="h-3 bg-slate-200 rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredConsultations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="text-slate-500 text-sm">
                                {searchQuery ? 'Tidak ada hasil pencarian.' : 'Belum ada percakapan.'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filteredConsultations.map((consultation) => (
                                <div
                                    key={consultation.id}
                                    onClick={() => navigate(`/dashboard/konsultasi/${consultation.id}`)}
                                    className={`group p-4 hover:bg-slate-50 cursor-pointer transition-colors relative ${id && parseInt(id) === consultation.id ? 'bg-blue-50/60 hover:bg-blue-50' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Avatar */}
                                        <div className="relative flex-shrink-0">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold text-sm border border-blue-200">
                                                {consultation.parent?.name?.substring(0, 2).toUpperCase() || 'OR'}
                                            </div>
                                            {consultation.parent?.is_online && (
                                                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" title="Online" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className="text-sm font-bold text-slate-800 truncate pr-2">
                                                    {consultation.title || 'Konsultasi Tanpa Judul'}
                                                </h3>
                                                <span className="text-[10px] text-slate-400 flex-shrink-0">
                                                    {getTimeAgo(consultation.updated_at)}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-end">
                                                <p className="text-xs text-slate-500 line-clamp-1 mr-2">
                                                    {consultation.last_message ? (
                                                        <>
                                                            <span className="font-medium text-slate-700">
                                                                {consultation.last_message.sender_name?.split(' ')[0]}:
                                                            </span>
                                                            {consultation.last_message.attachment_type === 'image' ? (
                                                                <span className="flex items-center gap-1 text-slate-500">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                                                                    Foto
                                                                </span>
                                                            ) : (
                                                                consultation.last_message.message
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="italic text-slate-400">Belum ada pesan</span>
                                                    )}
                                                </p>

                                                {/* Status Badge */}
                                                {consultation.status === 'open' ? (
                                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" title="Aktif" />
                                                ) : (
                                                    <CheckCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" title="Selesai" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delete Button (Hover) */}
                                    <button
                                        onClick={(e) => handleDeleteClick(e, consultation.id)}
                                        className="absolute right-12 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-red-600 bg-white/90 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-slate-100 hover:border-red-100 z-10"
                                        title="Hapus"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content (Detail or Placeholder) */}
            <div className={`flex-1 flex-col h-full bg-slate-50 relative ${id ? 'flex' : 'hidden md:flex'}`}>
                {/* Background Pattern Overlay */}
                <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
                    style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }}
                />

                {id ? (
                    <DetailKonsultasiKader
                        selectedId={id}
                        onBack={() => navigate('/dashboard/konsultasi')}
                        onDeleteSuccess={() => {
                            navigate('/dashboard/konsultasi');
                            fetchConsultations(filterStatus);
                        }}
                        className="h-full z-10"
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 z-10">
                        <div className="w-80 h-80 mb-6 relative">
                            <div className="absolute inset-0 bg-blue-100/50 rounded-full blur-3xl opacity-50 animate-pulse" />
                            <img
                                src="/images/chat-placeholder.png?v=2"
                                alt="Select Chat"
                                className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
                            />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800 mb-3">Portal Kader</h2>
                        <p className="text-slate-500 max-w-md text-lg leading-relaxed">
                            Kelola konsultasi dengan orang tua secara real-time.
                            Pilih percakapan di sebelah kiri untuk memulai.
                        </p>
                        <div className="mt-8 flex items-center gap-2 text-slate-400 text-sm font-medium bg-white/50 px-4 py-2 rounded-full border border-slate-100">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span>Status Orang Tua Real-time</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal (List Level) */}
            <AnimatePresence>
                {deleteModal.show && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setDeleteModal({ show: false, id: null })}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-sm relative overflow-hidden z-50"
                        >
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertTriangle className="w-8 h-8 text-red-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus Percakapan?</h3>
                                <p className="text-slate-500 text-sm mb-6">
                                    Apakah Anda yakin ingin menghapus percakapan ini? Tindakan ini tidak dapat dibatalkan.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDeleteModal({ show: false, id: null })}
                                        className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-medium transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors shadow-lg shadow-red-200"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
