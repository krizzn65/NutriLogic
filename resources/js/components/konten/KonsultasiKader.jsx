import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import GenericListSkeleton from "../loading/GenericListSkeleton";

export default function KonsultasiKader() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [consultations, setConsultations] = useState([]);
    const [activeTab, setActiveTab] = useState("open");
    const navigate = useNavigate();

    useEffect(() => {
        fetchConsultations();
    }, [activeTab]);

    const fetchConsultations = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get(`/kader/consultations?status=${activeTab}`);
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
        if (diffMins < 60) return `${diffMins} menit lalu`;
        if (diffHours < 24) return `${diffHours} jam lalu`;
        if (diffDays < 7) return `${diffDays} hari lalu`;
        return past.toLocaleDateString('id-ID');
    };

    return (
        <div className="flex flex-1 w-full h-full overflow-auto">
            <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Konsultasi</h1>
                    <p className="text-gray-600 mt-2">Kelola konsultasi dari orang tua</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('open')}
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === 'open'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        Aktif
                    </button>
                    <button
                        onClick={() => setActiveTab('closed')}
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === 'closed'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        Selesai
                    </button>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Consultations List */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Memuat konsultasi...</p>
                        </div>
                    </div>
                ) : consultations.length === 0 ? (
                    <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-gray-800 font-medium mb-2">Tidak Ada Konsultasi</p>
                        <p className="text-gray-600">
                            {activeTab === 'open' ? 'Belum ada konsultasi aktif' : 'Belum ada konsultasi yang selesai'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {consultations.map((consultation) => (
                            <div
                                key={consultation.id}
                                onClick={() => navigate(`/dashboard/konsultasi/${consultation.id}`)}
                                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{consultation.title}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <span className="font-medium">{consultation.parent?.name || 'Unknown'}</span>
                                            {consultation.child && (
                                                <>
                                                    <span>•</span>
                                                    <span>Anak: {consultation.child.full_name}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${consultation.status === 'open'
                                            ? 'bg-green-100 text-green-800 border border-green-200'
                                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                                        }`}>
                                        {consultation.status === 'open' ? 'Aktif' : 'Selesai'}
                                    </span>
                                </div>

                                {consultation.last_message && (
                                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                        <p className="text-sm text-gray-700 line-clamp-2">
                                            <span className="font-medium">{consultation.last_message.sender_name}:</span>{' '}
                                            {consultation.last_message.message}
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>{getTimeAgo(consultation.updated_at)}</span>
                                    {consultation.kader && (
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Ditangani: {consultation.kader.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
