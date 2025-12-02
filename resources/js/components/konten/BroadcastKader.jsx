import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import GenericListSkeleton from "../loading/GenericListSkeleton";
import PageHeader from "../dashboard/PageHeader";

export default function BroadcastKader() {
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [broadcasts, setBroadcasts] = useState([]);
    const [expandedId, setExpandedId] = useState(null);

    const [formData, setFormData] = useState({
        type: "pengumuman_umum",
        message: "",
    });

    useEffect(() => {
        fetchBroadcasts();
    }, []);

    const fetchBroadcasts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/kader/broadcast');
            setBroadcasts(response.data.data);
        } catch (err) {
            console.error('Failed to fetch broadcasts:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        setError(null);
        setSuccess(null);

        try {
            await api.post('/kader/broadcast', formData);
            setSuccess('Broadcast berhasil dikirim!');
            setFormData({ type: "pengumuman_umum", message: "" });
            fetchBroadcasts(); // Refresh history
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Gagal mengirim broadcast. Silakan coba lagi.';
            setError(errorMessage);
        } finally {
            setSending(false);
        }
    };

    const getTypeLabel = (type) => {
        const labels = {
            jadwal_posyandu: 'Jadwal Posyandu',
            info_gizi: 'Info Gizi',
            pengumuman_umum: 'Pengumuman Umum',
            lainnya: 'Lainnya',
        };
        return labels[type] || type;
    };

    const getTypeBadgeColor = (type) => {
        const colors = {
            jadwal_posyandu: 'bg-blue-100 text-blue-800 border-blue-200',
            info_gizi: 'bg-green-100 text-green-800 border-green-200',
            pengumuman_umum: 'bg-purple-100 text-purple-800 border-purple-200',
            lainnya: 'bg-gray-100 text-gray-800 border-gray-200',
        };
        return colors[type] || colors.lainnya;
    };

    return (
        <div className="flex flex-1 w-full h-full overflow-auto">
            <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-6">
                <PageHeader title="Broadcast Pengumuman" subtitle="Portal Kader" />

                {/* Send Broadcast Form */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Kirim Broadcast Baru</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Success Alert */}
                        {success && (
                            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                                {success}
                            </div>
                        )}

                        {/* Error Alert */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Jenis Pengumuman <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="pengumuman_umum">Pengumuman Umum</option>
                                <option value="jadwal_posyandu">Jadwal Posyandu</option>
                                <option value="info_gizi">Info Gizi</option>
                                <option value="lainnya">Lainnya</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pesan <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows="6"
                                maxLength="1000"
                                placeholder="Ketik pesan pengumuman Anda di sini..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            ></textarea>
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-gray-500">Maksimal 1000 karakter</p>
                                <p className="text-xs text-gray-500">{formData.message.length}/1000</p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={sending || !formData.message.trim()}
                            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                        >
                            {sending ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Mengirim...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                    </svg>
                                    Kirim Broadcast
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Broadcast History */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Riwayat Broadcast</h2>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Memuat riwayat...</p>
                        </div>
                    ) : broadcasts.length === 0 ? (
                        <div className="text-center py-8">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                            <p className="text-gray-600">Belum ada broadcast yang dikirim</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {broadcasts.map((broadcast) => (
                                <div key={broadcast.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeBadgeColor(broadcast.type)}`}>
                                                {getTypeLabel(broadcast.type)}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(broadcast.created_at).toLocaleString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setExpandedId(expandedId === broadcast.id ? null : broadcast.id)}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            {expandedId === broadcast.id ? 'Tutup' : 'Lihat'}
                                        </button>
                                    </div>

                                    <p className={`text-gray-700 ${expandedId === broadcast.id ? '' : 'line-clamp-2'}`}>
                                        {broadcast.message}
                                    </p>

                                    <p className="text-xs text-gray-500 mt-2">
                                        Dikirim oleh: {broadcast.sender?.name || 'Unknown'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
