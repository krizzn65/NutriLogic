import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../ui/sidebar";
import {
    Home,
    User,
    Settings,
    Users,
    Building2,
    UserCog,
    BarChart3,
    Shield,
    Database,
    LogOut,
    FileText,
    Activity,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import { logoutWithApi } from "../../lib/auth";

export default function SidebarSuperAdmin() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const links = [
        {
            label: "Dashboard",
            href: "/dashboard",
            icon: (
                <Home className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
            ),
        },
        {
            label: "Manajemen Posyandu",
            href: "/dashboard/posyandu",
            icon: (
                <Building2 className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
            ),
        },
        {
            label: "Manajemen Kader",
            href: "/dashboard/kader",
            icon: (
                <UserCog className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
            ),
        },
        {
            label: "Manajemen Orang Tua",
            href: "/dashboard/orang-tua",
            icon: (
                <Users className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
            ),
        },
        {
            label: "Data Anak",
            href: "/dashboard/anak",
            icon: (
                <Database className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
            ),
        },
        {
            label: "Laporan Sistem",
            href: "/dashboard/laporan",
            icon: (
                <BarChart3 className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
            ),
        },
        {
            label: "Konten",
            href: "/dashboard/konten",
            icon: (
                <FileText className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
            ),
        },
        {
            label: "Log Aktivitas",
            href: "/dashboard/logs",
            icon: (
                <Activity className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
            ),
        },
        {
            label: "Pengaturan Sistem",
            href: "/dashboard/settings",
            icon: (
                <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
            ),
        },
        {
            label: "Profil",
            href: "/dashboard/profile",
            icon: (
                <User className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
            ),
        },
        {
            label: "Keluar",
            href: "#",
            icon: (
                <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
            ),
            onClick: async () => {
                if (window.confirm('Apakah Anda yakin ingin keluar?')) {
                    await logoutWithApi();
                    navigate("/");
                }
            },
        },
    ];

    return (
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
                            label: "Super Admin",
                            href: "#",
                            icon: (
                                <Shield className="h-7 w-7 shrink-0 text-amber-500" />
                            ),
                        }}
                    />
                </div>
            </SidebarBody>
        </Sidebar>
    );
}

const Logo = () => {
    return (
        <a
            href="#"
            className="font-normal flex flex-col space-y-1 items-start text-sm text-black py-1 relative z-20"
        >
            <div className="flex space-x-2 items-center">
                <img src={assets.logo_das} alt="NutriLogic" className="h-8 w-8 shrink-0" />
                <span className="font-bold text-black whitespace-pre">
                    NutriLogic
                </span>
            </div>
            <span className="text-xs text-gray-600 ml-10 -mt-3">
                Super Admin Panel
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
