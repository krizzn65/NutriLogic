import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../ui/sidebar";
import {
    Home,
    User,
    Settings,
    FileText,
    Baby,
    LogOut,
    UtensilsCrossed,
    MessageCircle,
    Award,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import { logoutWithApi } from "../../lib/auth";

export default function SidebarOrangTua() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const links = [
        {
            label: "Dashboard",
            href: "/dashboard",
            icon: (
                <Home className="text-white h-5 w-5 shrink-0" />
            ),
        },
        {
            label: "Data Anak",
            href: "/dashboard/anak",
            icon: (
                <Baby className="text-white h-5 w-5 shrink-0" />
            ),
        },
        {
            label: "Nutri-Assist",
            href: "/dashboard/nutri-assist",
            icon: (
                <UtensilsCrossed className="text-white h-5 w-5 shrink-0" />
            ),
        },
        {
            label: "Konsultasi",
            href: "/dashboard/konsultasi",
            icon: (
                <MessageCircle className="text-white h-5 w-5 shrink-0" />
            ),
        },
        {
            label: "Poin & Badge",
            href: "/dashboard/gamification",
            icon: (
                <Award className="text-white h-5 w-5 shrink-0" />
            ),
        },
        {
            label: "Riwayat",
            href: "/dashboard/riwayat",
            icon: (
                <FileText className="text-white h-5 w-5 shrink-0" />
            ),
        },
        {
            label: "Profil",
            href: "/dashboard/profile",
            icon: (
                <User className="text-white h-5 w-5 shrink-0" />
            ),
        },
        {
            label: "Pengaturan",
            href: "/dashboard/settings",
            icon: (
                <Settings className="text-white h-5 w-5 shrink-0" />
            ),
        },
        {
            label: "Keluar",
            href: "#",
            icon: (
                <LogOut className="text-white h-5 w-5 shrink-0" />
            ),
            onClick: () => {
                setShowLogoutConfirm(true);
            },
        },
    ];

    const handleLogout = async () => {
        await logoutWithApi();
        navigate("/auth");
    };

    return (
        <>
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-10">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                        {open ? <Logo /> : <LogoIcon />}
                        <div className="mt-8 flex flex-col gap-2">
                            {links.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                        </div>
                    </div>
                    <div>
                        <SidebarLink
                            link={{
                                label: "Orang Tua",
                                href: "#",
                                icon: (
                                    <img
                                        src="https://ui-avatars.com/api/?name=Orang+Tua&background=00BFEF&color=fff"
                                        className="h-7 w-7 shrink-0 rounded-full"
                                        width={50}
                                        height={50}
                                        alt="Avatar"
                                    />
                                ),
                            }}
                        />
                    </div>
                </SidebarBody>
            </Sidebar>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            Konfirmasi Logout
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Apakah yakin Anda ingin keluar/logout?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                            >
                                Ya, Keluar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

const Logo = () => {
    return (
        <a
            href="#"
            className="font-normal flex flex-col space-y-1 items-start text-sm text-white py-1 relative z-20"
        >
            <div className="flex space-x-2 items-center">
                <img src={assets.logo_das} alt="NutriLogic" className="h-8 w-8 shrink-0" />
                <span className="font-bold text-white whitespace-pre">
                    NutriLogic
                </span>
            </div>
            <span className="text-xs text-gray-300 ml-10 -mt-3">
                Portal Orang Tua
            </span>
        </a>
    );
};

const LogoIcon = () => {
    return (
        <a
            href="#"
            className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
        >
            <img src={assets.logo_das} alt="NutriLogic" className="h-8 w-8 shrink-0" />
        </a>
    );
};
