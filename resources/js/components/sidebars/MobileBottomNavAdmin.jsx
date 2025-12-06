import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { useNavigate, useLocation } from "react-router-dom";
import { logoutWithApi } from "../../lib/auth";

const MobileBottomNavAdmin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [active, setActive] = useState(0);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Menu items untuk Admin
    const items = [
        { id: 0, icon: "lucide:home", label: "Home", href: "/dashboard" },
        { id: 1, icon: "lucide:building-2", label: "Posyandu", href: "/dashboard/posyandu" },
        { id: 2, icon: "lucide:user-cog", label: "Pengguna", href: "/dashboard/kader" },
        { id: 3, icon: "lucide:database", label: "Data Anak", href: "/dashboard/anak" },
        { id: 4, icon: "lucide:bar-chart-3", label: "Laporan", href: "/dashboard/laporan" },
        { id: 5, icon: "lucide:activity", label: "Log", href: "/dashboard/logs" },
        { id: 6, icon: "lucide:globe", label: "Web", href: "/" },
    ];

    useEffect(() => {
        const currentPath = location.pathname;
        const activeItem = items.find(item =>
            item.href !== "#" && (currentPath === item.href || (item.href !== "/dashboard" && currentPath.startsWith(item.href)))
        );
        if (activeItem) {
            setActive(activeItem.id);
        } else if (currentPath === "/dashboard") {
            setActive(0);
        }
    }, [location.pathname]);

    const handleItemClick = (index, item) => {
        if (item.isLogout) {
            setShowLogoutConfirm(true);
        } else {
            setActive(index);
            navigate(item.href);
        }
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
                    {items.map((item, index) => {
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
                                    <Icon icon={item.icon} width={18} height={18} />
                                    {/* Hide label on very small screens if needed, or keep it tiny */}
                                    <span className="text-[7px] font-medium mt-0.5 truncate w-full text-center px-0.5">{item.label}</span>
                                </motion.button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

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
