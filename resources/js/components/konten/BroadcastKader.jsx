import React, { useState, useEffect, useCallback } from "react";
import api from "../../lib/api";
import { useDataCache } from "../../contexts/DataCacheContext";
import PageHeader from "../ui/PageHeader";
import DashboardLayout from "../dashboard/DashboardLayout";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

const COOLDOWN_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const COOLDOWN_STORAGE_KEY = 'broadcast_last_sent';

export default function BroadcastKader() {
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [broadcasts, setBroadcasts] = useState([]);
    const [expandedId, setExpandedId] = useState(null);

    // Cooldown state
    const [cooldownRemaining, setCooldownRemaining] = useState(0);

    const [formData, setFormData] = useState({
        type: "pengumuman_umum",
        message: "",
    });

    // Data caching
    const { getCachedData, setCachedData, invalidateCache } = useDataCache();

    // Calculate remaining cooldown
    const calculateCooldownRemaining = useCallback(() => {
        const lastSent = localStorage.getItem(COOLDOWN_STORAGE_KEY);
        if (!lastSent) return 0;

        const lastSentTime = parseInt(lastSent, 10);
        const now = Date.now();
        const elapsed = now - lastSentTime;
        const remaining = COOLDOWN_DURATION - elapsed;

        return remaining > 0 ? remaining : 0;
    }, []);

    // Format cooldown time to MM:SS
    const formatCooldown = (ms) => {
        const totalSeconds = Math.ceil(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Check and update cooldown on mount and periodically
    useEffect(() => {
        const updateCooldown = () => {
            const remaining = calculateCooldownRemaining();
            setCooldownRemaining(remaining);
        };

        updateCooldown();

        // Update every second while cooldown is active
        const interval = setInterval(updateCooldown, 1000);

        return () => clearInterval(interval);
    }, [calculateCooldownRemaining]);

    useEffect(() => {
        fetchBroadcasts();
    }, []);

    const fetchBroadcasts = async () => {
        // Check cache first
        const cachedBroadcasts = getCachedData('kader_broadcasts');
        if (cachedBroadcasts) {
            setBroadcasts(cachedBroadcasts);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/kader/broadcast');
            setBroadcasts(response.data.data);
            setCachedData('kader_broadcasts', response.data.data);
        } catch (err) {
            console.error('Failed to fetch broadcasts:', err);
            setError('Gagal memuat riwayat broadcast. Silakan coba lagi.');
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

        // Check cooldown before submitting
        if (cooldownRemaining > 0) {
            setError(`Harap tunggu ${formatCooldown(cooldownRemaining)} sebelum mengirim broadcast berikutnya.`);
            return;
        }

        setSending(true);
        setError(null);
        setSuccess(null);

        try {
            await api.post('/kader/broadcast', formData);

            // Set cooldown timestamp
            localStorage.setItem(COOLDOWN_STORAGE_KEY, Date.now().toString());
            setCooldownRemaining(COOLDOWN_DURATION);

            setSuccess('Broadcast berhasil dikirim!');
            setFormData({ type: "pengumuman_umum", message: "" });
            invalidateCache('kader_broadcasts');
            fetchBroadcasts(); // Refresh history

            // Auto hide success after 3s
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Gagal mengirim broadcast. Silakan coba lagi.';
            setError(errorMessage);
        } finally {
            setSending(false);
        }
    };

    const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

    const handleDelete = (id) => {
        setDeleteModal({ show: true, id });
    };

    const confirmDelete = async () => {
        if (!deleteModal.id) return;

        try {
            await api.delete(`/kader/broadcast/${deleteModal.id}`);
            setSuccess('Broadcast berhasil dihapus');
            invalidateCache('kader_broadcasts');
            fetchBroadcasts();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Failed to delete broadcast:', err);
            setError('Gagal menghapus broadcast');
            setTimeout(() => setError(null), 3000);
        } finally {
            setDeleteModal({ show: false, id: null });
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
            jadwal_posyandu: 'bg-blue-50 text-blue-600 border-blue-200',
            info_gizi: 'bg-green-50 text-green-600 border-green-200',
            pengumuman_umum: 'bg-purple-50 text-purple-600 border-purple-200',
            lainnya: 'bg-gray-50 text-gray-600 border-gray-200',
        };
        return colors[type] || colors.lainnya;
    };

    const getTypeIcon = (type) => {
        const icons = {
            jadwal_posyandu: 'lucide:calendar',
            info_gizi: 'lucide:info',
            pengumuman_umum: 'lucide:megaphone',
            lainnya: 'lucide:file-text',
        };
        return icons[type] || 'lucide:file-text';
    };

    return (
        <DashboardLayout
            header={
                <PageHeader title="Broadcast Pengumuman" subtitle="Portal Kader" showProfile={true} />
            }
        >

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">
                {/* Send Broadcast Form - 8 columns */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 h-full flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Icon icon="lucide:send" className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Buat Pengumuman</h2>
                                    <p className="text-sm text-gray-500">Kirim notifikasi ke semua orang tua terdaftar</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Success Alert */}
                                <AnimatePresence>
                                    {success && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="bg-emerald-50 border border-emerald-100 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3"
                                        >
                                            <Icon icon="lucide:check-circle-2" className="w-5 h-5 text-emerald-600" />
                                            <span className="font-medium text-sm">{success}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Error Alert */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="bg-red-50 border border-red-100 text-red-800 px-4 py-3 rounded-xl flex items-center gap-3"
                                        >
                                            <Icon icon="lucide:alert-circle" className="w-5 h-5 text-red-600" />
                                            <span className="font-medium text-sm">{error}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Jenis Pengumuman
                                        </label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {[
                                                { id: 'pengumuman_umum', label: 'Umum', icon: 'lucide:megaphone' },
                                                { id: 'jadwal_posyandu', label: 'Jadwal', icon: 'lucide:calendar' },
                                                { id: 'info_gizi', label: 'Info Gizi', icon: 'lucide:info' },
                                                { id: 'lainnya', label: 'Lainnya', icon: 'lucide:file-text' },
                                            ].map((type) => {
                                                const isSelected = formData.type === type.id;
                                                return (
                                                    <button
                                                        key={type.id}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, type: type.id }))}
                                                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${isSelected
                                                            ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200'
                                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <Icon icon={type.icon} className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                                                        <span className="text-xs font-medium">{type.label}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Isi Pesan
                                        </label>
                                        <div className="relative">
                                            <textarea
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                required
                                                rows="4"
                                                maxLength="1000"
                                                placeholder="Tulis pesan pengumuman anda disini..."
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none text-gray-900 placeholder:text-gray-400 text-sm leading-relaxed"
                                            ></textarea>
                                            <div className="absolute bottom-3 right-3">
                                                <span className={`text-xs font-medium px-2 py-1 rounded-md ${formData.message.length > 900
                                                    ? 'bg-red-50 text-red-600'
                                                    : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {formData.message.length}/1000
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={sending || !formData.message.trim() || cooldownRemaining > 0}
                                        className="w-full md:w-auto md:px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                                    >
                                        {sending ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Mengirim...</span>
                                            </>
                                        ) : cooldownRemaining > 0 ? (
                                            <>
                                                <Icon icon="lucide:timer" className="w-4 h-4" />
                                                <span>Tunggu {formatCooldown(cooldownRemaining)}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Icon icon="lucide:send" className="w-4 h-4" />
                                                <span>Kirim Broadcast</span>
                                            </>
                                        )}
                                    </button>
                                    {cooldownRemaining > 0 && (
                                        <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                                            <Icon icon="lucide:info" className="w-3 h-3" />
                                            Anda dapat mengirim broadcast lagi dalam {formatCooldown(cooldownRemaining)}
                                        </p>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Stats & Info - 4 columns */}
                <div className="lg:col-span-4 flex flex-col gap-6 h-full">
                    {/* Stats Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex-1 flex flex-col justify-between">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Icon icon="lucide:activity" className="w-4 h-4 text-gray-500" />
                            Ringkasan Aktivitas
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="text-2xl font-bold text-gray-900 mb-1">{broadcasts.length}</div>
                                <div className="text-xs text-gray-500 font-medium">Total Terkirim</div>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <div className="text-2xl font-bold text-blue-700 mb-1">
                                    {broadcasts.filter(b => new Date(b.created_at).toDateString() === new Date().toDateString()).length}
                                </div>
                                <div className="text-xs text-blue-600 font-medium">Hari Ini</div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-3">
                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Distribusi Tipe</div>
                            {[
                                { label: 'Umum', count: broadcasts.filter(b => b.type === 'pengumuman_umum').length, color: 'bg-purple-500' },
                                { label: 'Jadwal', count: broadcasts.filter(b => b.type === 'jadwal_posyandu').length, color: 'bg-blue-500' },
                                { label: 'Info Gizi', count: broadcasts.filter(b => b.type === 'info_gizi').length, color: 'bg-green-500' },
                            ].map((stat, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${stat.color}`} />
                                        <span className="text-gray-600">{stat.label}</span>
                                    </div>
                                    <span className="font-medium text-gray-900">{stat.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Tips */}
                    <div className="bg-blue-600 rounded-2xl shadow-sm p-6 text-white">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Icon icon="lucide:alert-circle" className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm mb-1">Tips Efektif</h3>
                                <p className="text-xs text-blue-50 leading-relaxed">
                                    Gunakan bahasa yang singkat dan jelas. Pilih tipe pengumuman yang sesuai agar orang tua lebih mudah memfilter informasi penting.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* History Section */}
            <div className="mt-2">
                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-lg font-bold text-gray-900">Riwayat Pesan</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Icon icon="lucide:clock" className="w-4 h-4" />
                        <span>Terurut dari yang terbaru</span>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[0.1, 0.15, 0.2, 0.25, 0.3, 0.35].map((delay, i) => (
                            <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="h-8 w-8 rounded-lg bg-gray-200 overflow-hidden relative">
                                        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/60 to-transparent" style={{ animationDelay: `${delay}s` }}></div>
                                    </div>
                                    <div className="h-5 w-20 rounded-full bg-gray-200 overflow-hidden relative">
                                        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/60 to-transparent" style={{ animationDelay: `${delay + 0.05}s` }}></div>
                                    </div>
                                </div>
                                <div className="space-y-2 mb-4">
                                    <div className="h-4 w-full rounded bg-gray-200 overflow-hidden relative">
                                        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/60 to-transparent" style={{ animationDelay: `${delay + 0.1}s` }}></div>
                                    </div>
                                    <div className="h-4 w-3/4 rounded bg-gray-200 overflow-hidden relative">
                                        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/60 to-transparent" style={{ animationDelay: `${delay + 0.15}s` }}></div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                                    <div className="h-3 w-3 rounded-full bg-gray-200 overflow-hidden relative">
                                        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/60 to-transparent" style={{ animationDelay: `${delay + 0.2}s` }}></div>
                                    </div>
                                    <div className="h-3 w-24 rounded bg-gray-200 overflow-hidden relative">
                                        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-white/60 to-transparent" style={{ animationDelay: `${delay + 0.25}s` }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : broadcasts.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 border-dashed p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Icon icon="lucide:megaphone" className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-gray-900 font-medium mb-1">Belum ada riwayat</h3>
                        <p className="text-gray-500 text-sm">Broadcast yang Anda kirim akan muncul di sini</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {broadcasts.map((broadcast, index) => {
                            const iconName = getTypeIcon(broadcast.type);
                            return (
                                <motion.div
                                    key={broadcast.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col h-full"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-2 rounded-lg ${getTypeBadgeColor(broadcast.type)} bg-opacity-50`}>
                                            <Icon icon={iconName} className="w-4 h-4" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-400 font-medium font-mono">
                                                {new Date(broadcast.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short'
                                                })}
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(broadcast.id);
                                                }}
                                                className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                title="Hapus Broadcast"
                                            >
                                                <Icon icon="lucide:trash-2" className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <div className="mb-2">
                                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md border ${getTypeBadgeColor(broadcast.type)}`}>
                                                {getTypeLabel(broadcast.type)}
                                            </span>
                                        </div>
                                        <p className="text-gray-800 text-sm leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">
                                            {broadcast.message}
                                        </p>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">
                                                {broadcast.sender?.name?.charAt(0) || 'U'}
                                            </div>
                                            <span className="text-xs text-gray-500 truncate max-w-[100px]">
                                                {broadcast.sender?.name || 'Unknown'}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-gray-400">
                                            {new Date(broadcast.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteModal.show && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDeleteModal({ show: false, id: null })}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-sm relative z-10 overflow-hidden"
                        >
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Icon icon="lucide:alert-circle" className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Broadcast?</h3>
                                <p className="text-gray-500 text-sm mb-6">
                                    Pesan yang dihapus tidak dapat dikembalikan. Apakah Anda yakin ingin melanjutkan?
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDeleteModal({ show: false, id: null })}
                                        className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium text-sm hover:bg-red-700 transition-colors"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
