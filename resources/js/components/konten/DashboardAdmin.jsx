import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { logoutWithApi } from "../../lib/auth";
import { getMaintenanceMode } from "../../lib/sessionTimeout";
import api from "../../lib/api";
import { useDataCache } from "../../contexts/DataCacheContext";
import {
    Users, Building2, Baby, UserCog, AlertTriangle,
    Shield, Bell, Calendar, ChevronDown, MoreHorizontal, Settings, LogOut, TrendingUp, Check, ArrowUpRight, Activity
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import DashboardAdminSkeleton from "../loading/DashboardAdminSkeleton";
import AdminProfileModal from "../dashboard/AdminProfileModal";
import AdminSettingsModal from "../dashboard/AdminSettingsModal";

import ConfirmationModal from "../ui/ConfirmationModal";

// Static color maps to avoid re-creation on every render
const STATUS_COLOR_MAP = {
    'normal': '#10b981',
    'kurang': '#FDC700',
    'sangat_kurang': '#F43F5E',
    'pendek': '#FFE06D',
    'sangat_pendek': '#FE7189',
    'kurus': '#D9C990',
    'sangat_kurus': '#FB9FAF',
    'lebih': '#FFF8D2',
    'gemuk': '#FFCCD5',
};

const STATUS_BG_COLOR_MAP = {
    'normal': 'bg-emerald-500',
    'kurang': 'bg-[#FDC700]',
    'sangat_kurang': 'bg-[#F43F5E]',
    'pendek': 'bg-[#FFE06D]',
    'sangat_pendek': 'bg-[#FE7189]',
    'kurus': 'bg-[#D9C990]',
    'sangat_kurus': 'bg-[#FB9FAF]',
    'lebih': 'bg-[#FFF8D2]',
    'gemuk': 'bg-[#FFCCD5]',
};

const STATUS_LABELS = {
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

// Static card config (icons and gradients don't change)
const STAT_CARD_CONFIG = [
    { title: "Total Posyandu", key: 'total_posyandu', icon: Building2, gradient: "from-blue-500 to-blue-600", shadow: "shadow-blue-500/20", iconColor: "text-blue-100" },
    { title: "Total Kader", key: 'total_kader', icon: UserCog, gradient: "from-emerald-500 to-emerald-600", shadow: "shadow-emerald-500/20", iconColor: "text-emerald-100" },
    { title: "Total Orang Tua", key: 'total_ibu', icon: Users, gradient: "from-purple-500 to-purple-600", shadow: "shadow-purple-500/20", iconColor: "text-purple-100" },
    { title: "Total Anak", key: 'total_anak', icon: Baby, gradient: "from-orange-500 to-orange-600", shadow: "shadow-orange-500/20", iconColor: "text-orange-100" },
];

export default function DashboardAdmin() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [user, setUser] = useState(null); // For avatar
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [activeChartTab, setActiveChartTab] = useState('trend');
    const [isChartHovered, setIsChartHovered] = useState(false);

    // Posyandu Filter State
    const [posyandus, setPosyandus] = useState([]);
    const [selectedPosyandu, setSelectedPosyandu] = useState('all');
    const [isPosyanduDropdownOpen, setIsPosyanduDropdownOpen] = useState(false);
    const posyanduRef = React.useRef(null);

    // Interactive state for charts
    const [activeIndex, setActiveIndex] = useState(null);
    const [hoveredLegend, setHoveredLegend] = useState(null);

    // Motion & render controls
    const [shouldReduceMotion, setShouldReduceMotion] = useState(false);
    const [chartAnimationEnabled, setChartAnimationEnabled] = useState(false);
    const [showCharts, setShowCharts] = useState(false);

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

        // OPTIMIZED: Check every 30 seconds instead of every second
        const interval = setInterval(checkMaintenanceMode, 30000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    // Click outside handler for Posyandu dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (posyanduRef.current && !posyanduRef.current.contains(event.target)) {
                setIsPosyanduDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch posyandus list
    useEffect(() => {
        const fetchPosyandus = async () => {
            try {
                const response = await api.get('/admin/posyandus', { params: { status: 'active' } });
                setPosyandus(response.data.data || []);
            } catch (err) {
                console.error('Failed to fetch posyandus:', err);
            }
        };
        fetchPosyandus();
    }, []);

    // Data caching
    const { getCachedData, setCachedData } = useDataCache();
    const activeUserRequestId = React.useRef(0);
    const activeDashboardRequestId = React.useRef(0);

    // Keep-Alive Mechanism: Ping server every 5 minutes to prevent session timeout
    useEffect(() => {
        const heartbeat = setInterval(async () => {
            try {
                await api.get('/me'); // Menjaga sesi tetap aktif
            } catch (err) {
                console.error('Session heartbeat failed', err);
            }
        }, 5 * 60 * 1000); // 5 minutes

        return () => clearInterval(heartbeat);
    }, []);

    // Respect prefers-reduced-motion and disable mount animations on first paint
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const updateMotionPreference = () => setShouldReduceMotion(mediaQuery.matches);

        updateMotionPreference();
        mediaQuery.addEventListener('change', updateMotionPreference);

        return () => mediaQuery.removeEventListener('change', updateMotionPreference);
    }, []);

    // Enable chart animations only after initial paint (and only if motion allowed)
    useEffect(() => {
        if (shouldReduceMotion) {
            setChartAnimationEnabled(false);
            return;
        }
        const timer = setTimeout(() => setChartAnimationEnabled(true), 300);
        return () => clearTimeout(timer);
    }, [shouldReduceMotion]);

    // Defer rendering heavy charts to avoid blocking first paint
    useEffect(() => {
        const timer = setTimeout(() => setShowCharts(true), 250);
        return () => clearTimeout(timer);
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
        const cacheKey = `admin_dashboard_${selectedPosyandu}`;

        if (!forceRefresh) {
            const cachedStats = getCachedData(cacheKey);
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
            const params = {};
            if (selectedPosyandu !== 'all') params.posyandu_id = selectedPosyandu;

            const response = await api.get('/admin/dashboard', { params });

            if (activeDashboardRequestId.current !== requestId) {
                return;
            }

            setStats(response.data.data);
            setCachedData(cacheKey, response.data.data);
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
    }, [getCachedData, setCachedData, selectedPosyandu]);

    useEffect(() => {
        const cacheKey = `admin_dashboard_${selectedPosyandu}`;
        const cachedStats = getCachedData(cacheKey);
        const cachedUser = getCachedData('admin_user_profile');

        if (cachedStats) {
            setStats(cachedStats);
            setLoading(false);
        }

        if (cachedUser) {
            setUser(cachedUser);
        }

        // OPTIMIZED: Only force refresh if no cache exists
        const shouldForceRefresh = !cachedStats;
        fetchDashboardData({ forceRefresh: shouldForceRefresh, showLoader: shouldForceRefresh });

        // OPTIMIZED: Only fetch user if not cached
        if (!cachedUser) {
            fetchUserProfile({ forceRefresh: false });
        }
    }, [selectedPosyandu]); // OPTIMIZED: Removed fetchDashboardData and fetchUserProfile from deps

    // OPTIMIZED: Memoize notification generation to prevent recalculation
    const generateSmartNotifications = useMemo(() => (data) => {
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
    }, []);

    // OPTIMIZED: Generate notifications only when stats change, with memoization
    useEffect(() => {
        if (stats) {
            const allNotifications = generateSmartNotifications(stats);
            // OPTIMIZED: Get dismissed IDs once
            const dismissedIds = JSON.parse(localStorage.getItem('dismissedNotifications') || '[]');
            const filteredNotifications = allNotifications.filter(n => !dismissedIds.includes(n.id));
            setNotifications(prev => {
                // OPTIMIZED: Only update if changed
                const prevIds = prev.map(n => n.id).sort().join(',');
                const newIds = filteredNotifications.map(n => n.id).sort().join(',');
                return prevIds !== newIds ? filteredNotifications : prev;
            });
        }
    }, [stats, generateSmartNotifications]);

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
            gradient: "from-blue-500 to-blue-600",
            shadow: "shadow-blue-500/20",
            iconColor: "text-blue-100",
            link: "/dashboard/posyandu",
        },
        {
            title: "Total Kader",
            value: stats?.total_kader || 0,
            icon: UserCog,
            gradient: "from-emerald-500 to-emerald-600",
            shadow: "shadow-emerald-500/20",
            iconColor: "text-emerald-100",
            link: "/dashboard/kader",
        },
        {
            title: "Total Orang Tua",
            value: stats?.total_ibu || 0,
            icon: Users,
            gradient: "from-purple-500 to-purple-600",
            shadow: "shadow-purple-500/20",
            iconColor: "text-purple-100",
            link: "/dashboard/orang-tua",
        },
        {
            title: "Total Anak",
            value: stats?.total_anak || 0,
            icon: Baby,
            gradient: "from-orange-500 to-orange-600",
            shadow: "shadow-orange-500/20",
            iconColor: "text-orange-100",
            link: "/dashboard/anak",
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
            {/* Sticky Header - Mobile Optimized */}
            <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 md:px-6 md:py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-lg md:text-xl font-bold text-gray-800 tracking-tight">Dashboard</h1>
                    <p className="text-[10px] md:text-xs text-gray-500 font-medium mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span className="hidden md:inline">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        <span className="md:hidden">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </p>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
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
                            className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-gray-200 focus:outline-none"
                        >
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-semibold text-gray-800 leading-none">{user?.name || 'Super Admin'}</p>
                                <p className="text-xs text-gray-500 mt-1">Administrator</p>
                            </div>
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-linear-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white shadow-md ring-2 ring-white cursor-pointer hover:shadow-lg transition-shadow">
                                <Shield className="w-4 h-4 md:w-5 md:h-5" />
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
            <main className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                <div className="flex flex-col gap-6 md:gap-8 w-full max-w-7xl mx-auto">

                    {/* 1. Hero Section */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-10 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">Halo, Administrator! 👋</h2>
                            <p className="text-blue-100 text-lg max-w-2xl leading-relaxed">
                                Selamat datang kembali di panel kontrol utama. Berikut adalah ringkasan kinerja posyandu dan status kesehatan anak secara real-time.
                            </p>
                        </div>
                    </div>

                    {/* 2. Key Metrics - Cleaner Minimalist Look */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {statCards.map((card, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.2 }}
                                whileHover={{ y: -4 }}
                                onClick={() => navigate(card.link)}
                                className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:shadow-blue-500/5 transition-all cursor-pointer group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-2xl ${card.iconColor.replace('text-', 'bg-').replace('100', '50')} ${card.iconColor.replace('text-', 'text-').replace('100', '600')} group-hover:scale-110 transition-transform duration-300`}>
                                        <card.icon className="w-6 h-6" />
                                    </div>
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                        Active
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-1">
                                        {card.value}
                                    </h3>
                                    <p className="text-sm font-medium text-gray-500">{card.title}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* 3. Content Grid split 2/3 (Charts) and 1/3 (Risks) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

                        {/* LEFT COLUMN: Charts (2/3 width) */}
                        <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8 min-w-0">

                            {/* Status Distribution - Large Card */}
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Distribusi Status Gizi</h2>
                                        <p className="text-sm text-gray-500 mt-1">Gambaran status gizi anak di seluruh posyandu</p>
                                    </div>

                                    {/* Posyandu Filter Dropdown */}
                                    <div className="relative" ref={posyanduRef}>
                                        <button
                                            onClick={() => setIsPosyanduDropdownOpen(!isPosyanduDropdownOpen)}
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-medium text-gray-700 transition-colors border border-gray-200"
                                        >
                                            <span className="max-w-[150px] truncate">
                                                {selectedPosyandu === 'all'
                                                    ? 'Semua Posyandu'
                                                    : posyandus.find(p => p.id === parseInt(selectedPosyandu))?.name || 'Pilih Posyandu'}
                                            </span>
                                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isPosyanduDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {isPosyanduDropdownOpen && (
                                            <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden">
                                                <div className="max-h-64 overflow-y-auto p-1 custom-scrollbar">
                                                    <div
                                                        onClick={() => {
                                                            setSelectedPosyandu('all');
                                                            setIsPosyanduDropdownOpen(false);
                                                        }}
                                                        className="px-3 py-2.5 rounded-lg hover:bg-blue-50 cursor-pointer flex items-center justify-between group"
                                                    >
                                                        <span className={`text-sm ${selectedPosyandu === 'all' ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>
                                                            Semua Posyandu
                                                        </span>
                                                        {selectedPosyandu === 'all' && <Check className="w-4 h-4 text-blue-600" />}
                                                    </div>
                                                    {posyandus.map((posyandu) => (
                                                        <div
                                                            key={posyandu.id}
                                                            onClick={() => {
                                                                setSelectedPosyandu(posyandu.id);
                                                                setIsPosyanduDropdownOpen(false);
                                                            }}
                                                            className="px-3 py-2.5 rounded-lg hover:bg-blue-50 cursor-pointer flex items-center justify-between group"
                                                        >
                                                            <span className={`text-sm ${parseInt(selectedPosyandu) === posyandu.id ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>
                                                                {posyandu.name}
                                                            </span>
                                                            {parseInt(selectedPosyandu) === posyandu.id && <Check className="w-4 h-4 text-blue-600" />}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col lg:flex-row items-center gap-8">
                                    <div className="w-full lg:w-1/2 h-64 relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={stats?.status_distribution ? Object.entries(stats.status_distribution).map(([name, value]) => ({ name: getStatusLabel(name), value, rawName: name })) : []}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={80}
                                                    outerRadius={110}
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                    activeIndex={activeIndex}
                                                    activeShape={{
                                                        outerRadius: 118,
                                                        strokeWidth: 4,
                                                        stroke: '#fff',
                                                    }}
                                                    onMouseEnter={(_, index) => {
                                                        setActiveIndex(index);
                                                        setIsChartHovered(true);
                                                    }}
                                                    onMouseLeave={() => {
                                                        setActiveIndex(null);
                                                        setIsChartHovered(false);
                                                    }}
                                                    animationBegin={0}
                                                    animationDuration={800}
                                                    animationEasing="ease-out"
                                                    isAnimationActive={chartAnimationEnabled && !shouldReduceMotion}
                                                >
                                                    {stats?.status_distribution && Object.entries(stats.status_distribution).map(([name, value], index) => {
                                                        const colorMap = {
                                                            'normal': '#10b981',
                                                            'kurang': '#FDC700',
                                                            'sangat_kurang': '#F43F5E',
                                                            'pendek': '#FFE06D',
                                                            'sangat_pendek': '#FE7189',
                                                            'kurus': '#D9C990',
                                                            'sangat_kurus': '#FB9FAF',
                                                            'lebih': '#60A5FA',
                                                            'gemuk': '#818CF8',
                                                        };
                                                        return (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={colorMap[name] || '#94a3b8'}
                                                                strokeWidth={0}
                                                                opacity={hoveredLegend === null || hoveredLegend === name ? 1 : 0.3}
                                                                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                                                            />
                                                        );
                                                    })}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', padding: '12px 16px' }}
                                                    itemStyle={{ color: '#1e293b', fontWeight: '600', fontSize: '14px' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>

                                        {/* Center Label */}
                                        <AnimatePresence mode="wait">
                                            {!isChartHovered && (
                                                <motion.div
                                                    key={hoveredLegend || 'total'}
                                                    className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                >
                                                    <span className="text-4xl font-bold text-gray-800 tracking-tight">
                                                        {hoveredLegend && stats?.status_distribution
                                                            ? stats.status_distribution[hoveredLegend]
                                                            : (stats?.status_distribution ? Object.values(stats.status_distribution).reduce((a, b) => a + b, 0) : 0)
                                                        }
                                                    </span>
                                                    <span className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-wide">
                                                        {hoveredLegend ? getStatusLabel(hoveredLegend) : 'Total Anak'}
                                                    </span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Legend Grid */}
                                    <div className="w-full lg:w-1/2 grid grid-cols-2 gap-3">
                                        {stats?.status_distribution && Object.entries(stats.status_distribution).map(([status, count], index) => {
                                            const colorMap = {
                                                'normal': 'bg-emerald-500',
                                                'kurang': 'bg-[#FDC700]',
                                                'sangat_kurang': 'bg-[#F43F5E]',
                                                'pendek': 'bg-[#FFE06D]',
                                                'sangat_pendek': 'bg-[#FE7189]',
                                                'kurus': 'bg-[#D9C990]',
                                                'sangat_kurus': 'bg-[#FB9FAF]',
                                                'lebih': 'bg-blue-400',
                                                'gemuk': 'bg-indigo-400',
                                            };
                                            return (
                                                <motion.div
                                                    key={status}
                                                    whileHover={{ scale: 1.02 }}
                                                    onMouseEnter={() => { setHoveredLegend(status); setActiveIndex(index); }}
                                                    onMouseLeave={() => { setHoveredLegend(null); setActiveIndex(null); }}
                                                    className={`custom-legend-item flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-gray-100 hover:bg-gray-50 transition-all cursor-pointer ${hoveredLegend === status ? 'bg-gray-50 ring-1 ring-gray-100' : ''}`}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={`w-3 h-3 rounded-full ${colorMap[status] || 'bg-gray-400'}`} />
                                                        <span className="text-sm font-medium text-gray-600">{getStatusLabel(status)}</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900">{count}</span>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Secondary Charts Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

                                {/* Trend Chart */}
                                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col h-full">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                            <TrendingUp className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-gray-800">Tren Penimbangan</h3>
                                    </div>
                                    <div className="flex-1 min-h-[200px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={stats?.monthly_trend || []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorWeighings" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                                                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }} />
                                                <Area type="monotone" dataKey="weighings_count" name="Penimbangan" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorWeighings)" animationDuration={1000} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Monthly Stats Chart */}
                                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col h-full">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-gray-800">Statistik Bulanan</h3>
                                    </div>
                                    <div className="flex-1 min-h-[200px]">
                                        {!stats?.growth_by_posyandu || stats.growth_by_posyandu.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                                <Calendar className="w-8 h-8 mb-2 opacity-20" />
                                                <p className="text-sm">Belum ada data bulanan</p>
                                            </div>
                                        ) : (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={stats.growth_by_posyandu} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barGap={6}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                                                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }} cursor={{ fill: '#f8fafc' }} />
                                                    <Bar dataKey="children_count" name="Anak Ditimbang" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={40} animationDuration={1000} />
                                                    <Bar dataKey="weighings_count" name="Total Penimbangan" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} animationDuration={1000} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Risk Table (1/3 width) */}
                        <div className="lg:col-span-1 flex flex-col gap-6 h-full">
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-0 overflow-hidden flex flex-col h-full max-h-[800px]">
                                <div className="p-6 border-b border-gray-50 bg-gradient-to-r from-orange-50 to-red-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-xl shadow-sm text-orange-600">
                                            <AlertTriangle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 leading-none">Area Perhatian</h3>
                                            <p className="text-xs text-orange-600/80 font-medium mt-1">Posyandu dengan risiko tinggi</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                                    {stats?.top_risk_posyandu && stats.top_risk_posyandu.length > 0 ? (
                                        <div className="space-y-2">
                                            {stats.top_risk_posyandu.map((posyandu, index) => (
                                                <div
                                                    key={posyandu.id}
                                                    className="p-3 bg-white hover:bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-all group flex items-start gap-3 cursor-pointer"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-gray-50 text-gray-500 font-bold flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors">{posyandu.name}</h4>
                                                        <p className="text-[10px] text-gray-500 truncate">Perlu pemantauan intensif</p>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-lg font-bold text-orange-600 leading-none">{posyandu.risk_count}</span>
                                                        <span className="text-[9px] text-gray-400 font-medium mt-0.5">KASUS</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
                                            <Shield className="w-12 h-12 mb-3 opacity-20 text-green-500" />
                                            <h4 className="font-bold text-gray-600">Aman Terkendali</h4>
                                            <p className="text-xs mt-1">Tidak ada posyandu dengan risiko tinggi saat ini.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 bg-gray-50/50 border-t border-gray-50 text-center">
                                    <button
                                        onClick={() => navigate('/dashboard/laporan')}
                                        className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline uppercase tracking-wide"
                                    >
                                        Lihat Analisis Lengkap
                                    </button>
                                </div>
                            </div>

                            {/* Additional Widget (e.g., Quick Stats or System Status - Optional) */}
                            {/* Can be added here if needed */}
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
