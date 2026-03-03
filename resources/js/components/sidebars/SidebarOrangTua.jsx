import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../ui/sidebar";
import {
    Home,
    FileText,
    Baby,
    UtensilsCrossed,
    Utensils,
    MessageCircle,
    Award,
} from "lucide-react";
import { assets } from "../../assets/assets";
import { ORANG_TUA_SIDEBAR_NAV } from "../../constants/navigationConfigs";

const ORANG_TUA_ICON_MAP = {
    home: Home,
    "file-text": FileText,
    baby: Baby,
    "utensils-crossed": UtensilsCrossed,
    utensils: Utensils,
    "message-circle": MessageCircle,
    award: Award,
};

export default function SidebarOrangTua() {
    const [open, setOpen] = useState(false);

    const links = ORANG_TUA_SIDEBAR_NAV.map((item) => {
        const IconComponent = ORANG_TUA_ICON_MAP[item.icon];
        return {
            label: item.label,
            href: item.href,
            icon: <IconComponent className="text-white h-5 w-5 shrink-0" />,
        };
    });

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
                <img
                    src={assets.logo_das}
                    alt="NutriLogic"
                    className="h-8 w-8 shrink-0"
                />
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
            <img
                src={assets.logo_das}
                alt="NutriLogic"
                className="h-8 w-8 shrink-0"
            />
        </a>
    );
};
