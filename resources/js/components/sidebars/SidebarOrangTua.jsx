import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../ui/sidebar";
import {
    Home,
    FileText,
    Baby,
    UtensilsCrossed,
    MessageCircle,
    Award,
    ArrowLeft,
} from "lucide-react";
import { assets } from "../../assets/assets";

export default function SidebarOrangTua() {
    const [open, setOpen] = useState(false);

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
    ];

    const backLink = {
        label: "Kembali",
        href: "/",
        icon: (
            <ArrowLeft className="text-white h-5 w-5 shrink-0" />
        ),
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
                            <div className="mt-4 border-t border-white/20 pt-4">
                                <SidebarLink link={backLink} />
                            </div>
                        </div>
                    </div>
                </SidebarBody>
            </Sidebar>
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
