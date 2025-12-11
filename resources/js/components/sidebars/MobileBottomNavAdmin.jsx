import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { useNavigate, useLocation } from "react-router-dom";
import { logoutWithApi } from "../../lib/auth";

const MobileBottomNavAdmin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [active, setActive] = useState(0);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showMoreModal, setShowMoreModal] = useState(false);

    // Main navigation items (5 items)
    const mainItems = [
        { id: 0, icon: "lucide:home", label: "Home", href: "/dashboard" },
        { id: 1, icon: "lucide:building-2", label: "Posyandu", href: "/dashboard/posyandu" },
        { id: 2, icon: "lucide:user-cog", label: "Pengguna", href: "/dashboard/kader" },
        { id: 3, icon: "lucide:database", label: "Data Anak", href: "/dashboard/anak" },
        { id: 4, icon: "lucide:more-horizontal", label: "More", isMore: true },
    ];

    // More submenu items
    const moreItems = [
        { id: 5, icon: "lucide:bar-chart-3", label: "Laporan", href: "/dashboard/laporan" },
        { id: 6, icon: "lucide:activity", label: "Log", href: "/dashboard/logs" },
    ];

    useEffect(() => {
        const currentPath = location.pathname;

        // Check main items
        const activeMainItem = mainItems.find(item =>
            item.href && (currentPath === item.href || (item.href !== "/dashboard" && currentPath.startsWith(item.href)))
        );

        // Check more items
        const activeMoreItem = moreItems.find(item =>
            currentPath === item.href || currentPath.startsWith(item.href)
        );

        if (activeMainItem) {
            setActive(activeMainItem.id);
        } else if (activeMoreItem) {
            setActive(4); // Set "More" as active
        } else if (currentPath === "/dashboard") {
            setActive(0);
        }
    }, [location.pathname]);

    const handleItemClick = (index, item) => {
        if (item.isMore) {
            setShowMoreModal(true);
        } else if (item.isLogout) {
            setShowLogoutConfirm(true);
        } else {
            setActive(index);
            navigate(item.href);
        }
    };

    const handleMoreItemClick = (item) => {
        setShowMoreModal(false);
        setActive(4); // Keep "More" active
        navigate(item.href);
    };

    const handleLogout = async () => {
        await logoutWithApi();
        navigate("/auth");
    };

    return (
        <>
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-md md:hidden">
                <div
                    className="relative flex items-center justify-between bg-white/90 backdrop-blur-xl rounded-2xl px-1 py-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20"
                >
                    {mainItems.map((item, index) => {
                        const isActive = index === active;
                        return (
                            <motion.div key={item.id} className="relative flex flex-col items-center flex-1">
                                {/* Top Indicator Line */}
                                {isActive && (
                                    <motion.div
                                        layoutId="active-indicator-admin"
                                        className="absolute -top-2 w-8 h-1 bg-blue-500 rounded-b-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}

                                <motion.button
                                    onClick={() => handleItemClick(index, item)}
                                    animate={{
                                        scale: isActive ? 1.1 : 1,
                                    }}
                                    className={`flex flex-col items-center justify-center w-full py-1.5 rounded-xl transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <Icon icon={item.icon} width={20} height={20} />
                                    <span className="text-[9px] font-medium mt-0.5 truncate w-full text-center px-0.5">{item.label}</span>
                                </motion.button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* More Modal */}
            <AnimatePresence>
                {showMoreModal && (
                    <div className="fixed inset-0 flex items-end justify-center z-[60] md:hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowMoreModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative bg-white rounded-t-3xl shadow-2xl w-full max-w-md pb-6"
                        >
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900">Menu Lainnya</h3>
                                <button
                                    onClick={() => setShowMoreModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <Icon icon="lucide:x" className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* More Items */}
                            <div className="px-6 py-4 space-y-2">
                                {moreItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleMoreItemClick(item)}
                                        className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-all group"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-white group-hover:bg-blue-100 flex items-center justify-center transition-colors shadow-sm">
                                            <Icon icon={item.icon} className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{item.label}</div>
                                        </div>
                                        <Icon icon="lucide:chevron-right" className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 flex items-center justify-center z-[60] px-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                            Konfirmasi Logout
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Apakah yakin Anda ingin keluar aplikasi?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 shadow-lg shadow-red-200 transition-colors"
                            >
                                Ya, Keluar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MobileBottomNavAdmin;
