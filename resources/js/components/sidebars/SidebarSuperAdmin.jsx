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
                <Home className="text-white dark:text-neutral-200 h-5 w-5 shrink-0" />
            ),
        },
        {
            label: "Manajemen Posyandu",
            href: "/dashboard/posyandu",
            icon: (
                <Building2 className="text-white dark:text-neutral-200 h-5 w-5 shrink-0" />
            ),
        },
        {
            label: "Manajemen Pengguna",
            href: "/dashboard/kader",
            icon: (
                <UserCog className="text-white dark:text-neutral-200 h-5 w-5 shrink-0" />
            ),
        },
        {
            label: "Data Anak",
            href: "/dashboard/anak",
            icon: (
                <Database className="text-white dark:text-neutral-200 h-5 w-5 shrink-0" />
            ),
        },
        {
            label: "Laporan Sistem",
            href: "/dashboard/laporan",
            icon: (
                <BarChart3 className="text-white dark:text-neutral-200 h-5 w-5 shrink-0" />
            ),
        },
        {
            label: "Log Aktivitas",
            href: "/dashboard/logs",
            icon: (
                <Activity className="text-white dark:text-neutral-200 h-5 w-5 shrink-0" />
            ),
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
                </div>
            </SidebarBody>
        </Sidebar>
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
            <span className="text-xs text-gray-200 ml-10 -mt-3">
                Super Admin Panel
            </span>
        </a>
    );
};

const LogoIcon = () => {
    return (
        <a
            href="#"
            className="font-normal flex space-x-2 items-center text-sm text-white py-1 relative z-20"
        >
            <img src={assets.logo_das} alt="NutriLogic" className="h-8 w-8 shrink-0" />
        </a>
    );
};
