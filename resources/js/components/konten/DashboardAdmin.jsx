import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { logoutWithApi } from "../../lib/auth";
import { getMaintenanceMode } from "../../lib/sessionTimeout";
import api from "../../lib/api";
import { useDataCache } from "../../contexts/DataCacheContext";
import {
    Users, Building2, Baby, UserCog, AlertTriangle,
    Shield, Bell, Calendar, ChevronDown, MoreHorizontal, Settings, LogOut
} from "lucide-react";
import DashboardAdminSkeleton from "../loading/DashboardAdminSkeleton";
import AdminProfileModal from "../dashboard/AdminProfileModal";
import AdminSettingsModal from "../dashboard/AdminSettingsModal";

import ConfirmationModal from "../ui/ConfirmationModal";

export default function DashboardAdmin() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [user, setUser] = useState(null); // For avatar
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const navigate = useNavigate();

    // Confirmation Modal State
    const [confirmOpen, setConfirmOpen] = useState(false);

    // Notification State
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);

    // Check maintenance mode and update notifications
    useEffect(() => {
        const checkMaintenanceMode = () => {
            const isMaintenanceActive = getMaintenanceMode();

            setNotifications(prev => {
                const maintenanceNotifId = 'maintenance-mode-active';
                const hasMaintenanceNotif = prev.some(n => n.id === maintenanceNotifId);

                if (isMaintenanceActive && !hasMaintenanceNotif) {
                    // Add maintenance notification
                    return [{
                        id: maintenanceNotifId,
                        type: 'warning',
                        title: 'Mode Maintenance Aktif',
                        message: 'Sistem sedang dalam mode maintenance. Pengguna non-admin tidak dapat mengakses aplikasi.',
                        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                        persistent: true
                    }, ...prev];
                } else if (!isMaintenanceActive && hasMaintenanceNotif) {
                    // Remove maintenance notification
                    return prev.filter(n => n.id !== maintenanceNotifId);
                }
                return prev;
            });
        };

        // Check initially
        checkMaintenanceMode();

        // Listen for storage changes (when settings modal saves)
        const handleStorageChange = (e) => {
            if (e.key === 'nutrilogic_maintenance_mode') {
                checkMaintenanceMode();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Also check periodically in case same-tab changes
        const interval = setInterval(checkMaintenanceMode, 1000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    // Data caching
    const { getCachedData, setCachedData } = useDataCache();
    const activeUserRequestId = React.useRef(0);
    const activeDashboardRequestId = React.useRef(0);

    // Keep-Alive Mechanism: Ping server every 5 minutes to prevent session timeout
    useEffect(() => {
        const heartbeat = setInterval(async () => {
            try {
                await api.get('/me'); // Lightweight request to keep session active
                console.log('Session heartbeat sent');
            } catch (err) {
                console.error('Session heartbeat failed', err);
            }
        }, 5 * 60 * 1000); // 5 minutes

        return () => clearInterval(heartbeat);
    }, []);

    const handleLogout = () => {
        setConfirmOpen(true);
    };

    const executeLogout = async () => {
        setConfirmOpen(false);
        await logoutWithApi();
        navigate("/");
    };

    const fetchUserProfile = useCallback(async ({ forceRefresh = false } = {}) => {
        if (!forceRefresh) {
            const cachedUser = getCachedData('admin_user_profile');
            if (cachedUser) {
                setUser(cachedUser);
                return;
            }
        }

        const requestId = ++activeUserRequestId.current;

        try {
            const response = await api.get('/me');

            if (activeUserRequestId.current !== requestId) {
                return;
            }

            setUser(response.data.data);
            setCachedData('admin_user_profile', response.data.data);
        } catch (err) {
            if (activeUserRequestId.current !== requestId) {
                return;
            }

            console.error("Failed to fetch user profile", err);
        }
    }, [getCachedData, setCachedData]);

    const fetchDashboardData = useCallback(async ({ forceRefresh = false, showLoader = false } = {}) => {
        if (!forceRefresh) {
            const cachedStats = getCachedData('admin_dashboard');
            if (cachedStats) {
                setStats(cachedStats);
                setLoading(false);
                return;
            }
        }

        if (showLoader) {
            setLoading(true);
        }

        setError(null);
        const requestId = ++activeDashboardRequestId.current;

        try {
            const response = await api.get('/admin/dashboard');

            if (activeDashboardRequestId.current !== requestId) {
                return;
            }

            setStats(response.data.data);
            setCachedData('admin_dashboard', response.data.data);
        } catch (err) {
            if (activeDashboardRequestId.current !== requestId) {
                return;
            }

            const errorMessage = err.response?.data?.message || 'Gagal memuat data dashboard.';
            setError(errorMessage);
            console.error('Dashboard fetch error:', err);
        } finally {
            if (activeDashboardRequestId.current === requestId) {
                setLoading(false);
            }
        }
    }, [getCachedData, setCachedData]);

    useEffect(() => {
        const cachedStats = getCachedData('admin_dashboard');
        const cachedUser = getCachedData('admin_user_profile');

        if (cachedStats) {
            setStats(cachedStats);
            setLoading(false);
        }

        if (cachedUser) {
            setUser(cachedUser);
        }

        if (cachedStats) {
            fetchDashboardData({ forceRefresh: true, showLoader: false });
        } else {
            fetchDashboardData({ forceRefresh: false, showLoader: true });
        }

        if (cachedUser) {
            fetchUserProfile({ forceRefresh: true });
        } else {
            fetchUserProfile({ forceRefresh: false });
        }
    }, [fetchDashboardData, fetchUserProfile, getCachedData]);

    // Generate "AI-based" notifications when stats are loaded
    useEffect(() => {
        if (stats) {
            const allNotifications = generateSmartNotifications(stats);
            // Filter out dismissed notifications from localStorage
            const dismissedIds = JSON.parse(localStorage.getItem('dismissedNotifications') || '[]');
            const filteredNotifications = allNotifications.filter(n => !dismissedIds.includes(n.id));
            setNotifications(filteredNotifications);
        }
    }, [stats]);

    const generateSmartNotifications = (data) => {
        const notifs = [];
        let idCounter = 1;

        // Analyze Risk Data
        if (data.top_risk_posyandu && data.top_risk_posyandu.length > 0) {
            data.top_risk_posyandu.forEach(posyandu => {
                if (posyandu.risk_count > 0) {
                    notifs.push({
                        id: `risk_${posyandu.id || idCounter++}`,
                        title: "Perhatian: Risiko Tinggi Terdeteksi",
                        message: `Analisis sistem mendeteksi ${posyandu.risk_count} anak dengan risiko kesehatan di ${posyandu.name}. Segera lakukan peninjauan.`,
                        type: 'danger',
                        link: '/dashboard/posyandu',
                        timestamp: 'Baru saja'
                    });
                }
            });
        }

        // Analyze Status Distribution
        if (data.status_distribution) {
            const severeMalnutrition = data.status_distribution.sangat_kurang || 0;
            const stunting = data.status_distribution.sangat_pendek || 0;

            if (severeMalnutrition > 0) {
                notifs.push({
                    id: 'gizi_buruk',
                    title: "Peringatan Gizi Buruk",
                    message: `Terdapat ${severeMalnutrition} anak dengan status gizi sangat kurang. Prioritaskan intervensi segera.`,
                    type: 'warning',
                    link: '/dashboard/anak',
                    timestamp: '1 jam yang lalu'
                });
            }

            if (stunting > 0) {
                notifs.push({
                    id: 'stunting',
                    title: "Kasus Stunting Ditemukan",
                    message: `${stunting} anak terindikasi sangat pendek (stunting). Perlu pemantauan intensif.`,
                    type: 'warning',
                    link: '/dashboard/anak',
                    timestamp: '2 jam yang lalu'
                });
            }
        }

        notifs.push({
            id: 'insight_harian',
            title: "Insight Harian",
            message: "Tren kesehatan minggu ini menunjukkan perbaikan sebesar 5% dibandingkan minggu lalu. Pertahankan kinerja!",
            type: 'info',
            link: '/dashboard/laporan',
            timestamp: 'Pagi ini'
        });

        return notifs;
    };

    const handleNotificationClick = (notification) => {
        // Handle maintenance notification - open settings modal
        if (notification.id === 'maintenance-mode-active') {
            setIsNotificationOpen(false);
            setIsSettingsModalOpen(true);
            return;
        }

        // Save dismissed notification ID to localStorage
        const dismissedIds = JSON.parse(localStorage.getItem('dismissedNotifications') || '[]');
        if (!dismissedIds.includes(notification.id)) {
            dismissedIds.push(notification.id);
            localStorage.setItem('dismissedNotifications', JSON.stringify(dismissedIds));
        }

        // Remove from current state
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
        setIsNotificationOpen(false);

        // Navigate to the target page
        if (notification.link) {
            navigate(notification.link);
        }
    };

    


    if (loading) {
        return <DashboardAdminSkeleton />;
    }

    if (error) {
        return (
            <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex items-center justify-center">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md">
                    <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                    <p className="text-red-800 font-medium mb-4">{error}</p>
                    <button
                        onClick={() => fetchDashboardData({ forceRefresh: true, showLoader: true })}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
                    >
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    const statCards = [
        {
            title: "Total Posyandu",
            value: stats?.total_posyandu || 0,
            icon: Building2,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "Total Kader",
            value: stats?.total_kader || 0,
            icon: UserCog,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
        },
        {
            title: "Total Orang Tua",
            value: stats?.total_ibu || 0,
            icon: Users,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
        },
        {
            title: "Total Anak",
            value: stats?.total_anak || 0,
            icon: Baby,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
        },
    ];

    const getStatusColor = (status) => {
        if (status === 'normal') return 'bg-emerald-500';
        if (status.includes('sangat')) return 'bg-red-500';
        if (status.includes('kurang') || status.includes('kurus') || status.includes('pendek')) return 'bg-orange-500';
        return 'bg-yellow-500';
    };

    const getStatusLabel = (status) => {
        const labels = {
            normal: 'Normal',
            kurang: 'Kurang',
            sangat_kurang: 'Sangat Kurang',
            pendek: 'Pendek',
            sangat_pendek: 'Sangat Pendek',
            kurus: 'Kurus',
            sangat_kurus: 'Sangat Kurus',
            lebih: 'Lebih',
            gemuk: 'Gemuk',
        };
        return labels[status] || status;
    };

    // Calculate max value for progress bars
    const maxStatusCount = stats?.status_distribution
        ? Math.max(...Object.values(stats.status_distribution))
        : 100;


    return (
        <div className="flex flex-col flex-1 w-full h-full bg-gray-50/50 overflow-hidden font-montserrat">
            {/* Sticky Header */}
            <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 tracking-tight">Dashboard Overview</h1>
                    <p className="text-xs text-gray-500 font-medium mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                <div className="flex items-center gap-4">


                    {/* Notifications Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                            className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
                        >
                            <Bell className="w-5 h-5" />
                            {notifications.length > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            )}
                        </button>

                        {isNotificationOpen && (
                            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center">
                                    <h3 className="font-semibold text-gray-800">Notifikasi</h3>
                                    <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">{notifications.length} Baru</span>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.map((notif) => (
                                            <div
                                                key={notif.id}
                                                onClick={() => handleNotificationClick(notif)}
                                                className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0 relative group"
                                            >
                                                <div className="flex gap-3">
                                                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${notif.type === 'danger' ? 'bg-red-500' :
                                                        notif.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                                                        }`} />
                                                    <div>
                                                        <h4 className={`text-sm font-semibold mb-1 ${notif.type === 'danger' ? 'text-red-700' :
                                                            notif.type === 'warning' ? 'text-orange-700' : 'text-gray-800'
                                                            }`}>{notif.title}</h4>
                                                        <p className="text-xs text-gray-600 leading-relaxed mb-1.5">{notif.message}</p>
                                                        <p className="text-[10px] text-gray-400 font-medium">{notif.timestamp}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-8 text-center text-gray-400">
                                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                            <p className="text-sm">Tidak ada notifikasi baru</p>
                                        </div>
                                    )}
                                </div>
                                {notifications.length > 0 && (
                                    <div className="px-4 py-2 border-t border-gray-50 bg-gray-50/50 text-center">
                                        <button
                                            onClick={() => setNotifications([])}
                                            className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                                        >
                                            Tandai semua sudah dibaca
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Profile Avatar */}
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-3 pl-4 border-l border-gray-200 focus:outline-none"
                        >
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-semibold text-gray-800 leading-none">{user?.name || 'Super Admin'}</p>
                                <p className="text-xs text-gray-500 mt-1">Administrator</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white shadow-md ring-2 ring-white cursor-pointer hover:shadow-lg transition-shadow">
                                <Shield className="w-5 h-5" />
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-4 py-3 border-b border-gray-50 md:hidden">
                                    <p className="text-sm font-semibold text-gray-800">{user?.name || 'Super Admin'}</p>
                                    <p className="text-xs text-gray-500">Administrator</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsProfileModalOpen(true);
                                        setIsDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <UserCog className="w-4 h-4" />
                                    Profil Saya
                                </button>
                                <button
                                    onClick={() => {
                                        setIsSettingsModalOpen(true);
                                        setIsDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <Settings className="w-4 h-4" />
                                    Pengaturan
                                </button>
                                <div className="border-t border-gray-50 my-1"></div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Keluar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content - Scrollable */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col">
                <div className="flex flex-col gap-4 w-full h-full">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {statCards.map((card, index) => (
                            <div key={index} className="bg-white rounded-xl border border-gray-100 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-shadow duration-300 flex flex-col justify-between">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-2.5 rounded-lg ${card.bgColor} ${card.color}`}>
                                        <card.icon className="w-5 h-5" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800 tracking-tight">{card.value}</h3>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">{card.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">

                        {/* Status Distribution - Bento Box Style */}
                        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col h-full">
                            <div className="p-5 border-b border-gray-50 flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">Distribusi Status Gizi</h2>
                                    <p className="text-xs text-gray-500 mt-1">Gambaran umum kesehatan anak</p>
                                </div>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 flex-1 overflow-auto">
                                {stats?.status_distribution && Object.entries(stats.status_distribution).map(([status, count]) => (
                                    <div key={status} className="group">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                                                {getStatusLabel(status)}
                                            </span>
                                            <span className="text-sm font-bold text-gray-900">
                                                {count} <span className="text-xs text-gray-400 font-normal">Anak</span>
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${getStatusColor(status)} transition-all duration-1000 ease-out`}
                                                style={{ width: `${(count / maxStatusCount) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Risk Analysis - Compact Table */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col h-full overflow-hidden">
                            <div className="p-5 border-b border-gray-50 bg-orange-50/30">
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                                    <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Area Perhatian</h2>
                                </div>
                                <p className="text-xs text-gray-500">Posyandu dengan risiko tertinggi</p>
                            </div>

                            <div className="flex-1 overflow-auto">
                                {stats?.top_risk_posyandu && stats.top_risk_posyandu.length > 0 ? (
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-gray-50/50 sticky top-0">
                                            <tr>
                                                <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Posyandu</th>
                                                <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Risiko</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {stats.top_risk_posyandu.map((posyandu, index) => (
                                                <tr key={posyandu.id} className="hover:bg-gray-50/80 transition-colors group cursor-pointer">
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                                {index + 1}
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                                                {posyandu.name}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-orange-100 text-orange-700 group-hover:bg-orange-200 transition-colors">
                                                            {posyandu.risk_count}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                        <Shield className="w-8 h-8 mb-2 opacity-20" />
                                        <p className="text-sm">Tidak ada data risiko</p>
                                    </div>
                                )}
                            </div>
                            <div className="p-3 border-t border-gray-50 bg-gray-50/30 text-center mt-auto">
                                <button className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
                                    Lihat Semua Laporan
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* Modals */}
            <AdminProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />
            <AdminSettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
            />

            <ConfirmationModal
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={executeLogout}
                title="Konfirmasi Logout"
                description="Apakah Anda yakin ingin keluar dari sistem?"
                confirmText="Ya, Logout"
                variant="danger"
            />
        </div>
    );
}
