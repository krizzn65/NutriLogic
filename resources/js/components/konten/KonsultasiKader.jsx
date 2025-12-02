import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { Search, MessageSquare, Clock, CheckCircle, User, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function KonsultasiKader() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [consultations, setConsultations] = useState([]);
    const [activeTab, setActiveTab] = useState("open");
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchConsultations();
    }, [activeTab]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchConsultations();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchConsultations = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            params.append('status', activeTab);
            if (searchTerm.trim()) {
                params.append('search', searchTerm.trim());
            }

            const response = await api.get(`/kader/consultations?${params.toString()}`);
            setConsultations(response.data.data);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Gagal memuat konsultasi. Silakan coba lagi.';
            setError(errorMessage);
            console.error('Consultations fetch error:', err);
        } finally {
            setLoading(false);
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
        if (diffMins < 60) return `${diffMins}m lalu`;
        if (diffHours < 24) return `${diffHours}j lalu`;
        if (diffDays < 7) return `${diffDays}h lalu`;
        return past.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
            {/* Header Section */}
            <div className="bg-white border-b border-slate-200 px-6 py-8">
                <div className="max-w-5xl mx-auto w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Konsultasi</h1>
                            <p className="text-slate-500 mt-1">Kelola pesan dan konsultasi dari orang tua</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Cari nama..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 w-full md:w-64 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
                        <button
                            onClick={() => setActiveTab('open')}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'open'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Aktif
                        </button>
                        <button
                            onClick={() => setActiveTab('closed')}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'closed'
                                    ? 'bg-white text-slate-800 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Selesai
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-5xl mx-auto w-full">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-pulse">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-200 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-slate-200 rounded w-1/4" />
                                            <div className="h-3 bg-slate-200 rounded w-1/2" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : consultations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-1">Tidak Ada Konsultasi</h3>
                            <p className="text-slate-500 max-w-xs mx-auto">
                                {activeTab === 'open'
                                    ? 'Belum ada konsultasi yang aktif saat ini.'
                                    : 'Belum ada riwayat konsultasi yang selesai.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {consultations.map((consultation, index) => (
                                <motion.div
                                    key={consultation.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => navigate(`/dashboard/konsultasi/${consultation.id}`)}
                                    className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all cursor-pointer relative overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="flex items-start gap-4">
                                        {/* Avatar */}
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-lg">
                                            {consultation.parent?.name?.substring(0, 2).toUpperCase() || 'OR'}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-1">
                                                <h3 className="text-base font-bold text-slate-800 truncate pr-2 group-hover:text-blue-700 transition-colors">
                                                    {consultation.title || 'Konsultasi Tanpa Judul'}
                                                </h3>
                                                <span className="text-xs font-medium text-slate-400 whitespace-nowrap flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-full">
                                                    <Clock className="w-3 h-3" />
                                                    {getTimeAgo(consultation.updated_at)}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                                                <span className="font-medium text-slate-700">{consultation.parent?.name}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    Anak: {consultation.child?.full_name || '-'}
                                                </span>
                                            </div>

                                            <div className="bg-slate-50 rounded-xl p-3 group-hover:bg-blue-50/50 transition-colors">
                                                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                                                    <span className="font-semibold text-slate-800 mr-1">
                                                        {consultation.last_message?.sender_name || 'User'}:
                                                    </span>
                                                    {consultation.last_message?.message || 'Belum ada pesan'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="self-center pl-2">
                                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-400 transition-colors" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
