import React, { useState, useEffect } from "react";
import { Calendar, Bell, Shield, UserCog, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUser, logoutWithApi } from "../../lib/auth";
import { getMaintenanceMode } from "../../lib/sessionTimeout";
import AdminProfileModal from "../dashboard/AdminProfileModal";
import SettingsModal from "../dashboard/SettingsModal";
import ConfirmationModal from "../ui/ConfirmationModal";

export default function PageHeader({ title, subtitle, children, showProfile = true }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const userData = getUser();
        setUser(userData);
    }, []);

    // Check maintenance mode notifications
    useEffect(() => {
        const checkMaintenanceMode = () => {
            const isMaintenanceActive = getMaintenanceMode();

            setNotifications(prev => {
                const maintenanceNotifId = 'maintenance-mode-active';
                const hasMaintenanceNotif = prev.some(n => n.id === maintenanceNotifId);

                if (isMaintenanceActive && !hasMaintenanceNotif) {
                    return [{
                        id: maintenanceNotifId,
                        type: 'warning',
                        title: 'Mode Maintenance Aktif',
                        message: 'Sistem sedang dalam mode maintenance. Pengguna non-admin tidak dapat mengakses aplikasi.',
                        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                        persistent: true
                    }, ...prev];
                } else if (!isMaintenanceActive && hasMaintenanceNotif) {
                    return prev.filter(n => n.id !== maintenanceNotifId);
                }
                return prev;
            });
        };

        checkMaintenanceMode();
        const handleStorageChange = (e) => {
            if (e.key === 'nutrilogic_maintenance_mode') {
                checkMaintenanceMode();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        const interval = setInterval(checkMaintenanceMode, 1000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    const handleNotificationClick = (notification) => {
        if (notification.id === 'maintenance-mode-active') {
            setIsNotificationOpen(false);
            setIsSettingsModalOpen(true);
            return;
        }
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
        setIsNotificationOpen(false);
        if (notification.link) {
            navigate(notification.link);
        }
    };

    const handleLogout = async () => {
        await logoutWithApi();
        navigate("/auth");
    };

    return (
        <>
            <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 tracking-tight">{title}</h1>
                    <p className="text-xs text-gray-500 font-medium mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {subtitle || new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {children}

                    {showProfile && (
                        <>
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
                                    <div className="h-px bg-gray-100 my-1"></div>
                                    <button
                                        onClick={() => {
                                            setConfirmOpen(true);
                                            setIsDropdownOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Keluar
                                    </button>
                                </div>
                            )}
                        </div>
                        </>
                    )}
                </div>
            </header>

            {/* Modals */}
            <AdminProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
            <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
            <ConfirmationModal
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleLogout}
                title="Konfirmasi Logout"
                description="Apakah Anda yakin ingin keluar dari sistem?"
                confirmText="Keluar"
                cancelText="Batal"
                variant="danger"
            />
        </>
    );
}
