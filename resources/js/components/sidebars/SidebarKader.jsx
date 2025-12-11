import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../ui/sidebar";
import {
  Home,

  Settings,
  FileText,
  BarChart,
  Users,
  ClipboardList,
  Scale,
  AlertTriangle,
  Calendar,
  MessageSquare,
  Megaphone,
  ArrowLeft,
} from "lucide-react";

import { assets } from "../../assets/assets";


export default function SidebarKader() {

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
      href: "/dashboard/data-anak",
      icon: (
        <Users className="text-white h-5 w-5 shrink-0" />
      ),
    },
    {
      label: "Kegiatan",
      href: "/dashboard/kegiatan",
      icon: (
        <Scale className="text-white h-5 w-5 shrink-0" />
      ),
    },
    {
      label: "Anak Prioritas",
      href: "/dashboard/anak-prioritas",
      icon: (
        <AlertTriangle className="text-white h-5 w-5 shrink-0" />
      ),
    },
    {
      label: "Jadwal",
      href: "/dashboard/jadwal",
      icon: (
        <Calendar className="text-white h-5 w-5 shrink-0" />
      ),
    },
    {
      label: "Konsultasi",
      href: "/dashboard/konsultasi",
      icon: (
        <MessageSquare className="text-white h-5 w-5 shrink-0" />
      ),
    },
    {
      label: "Broadcast",
      href: "/dashboard/broadcast",
      icon: (
        <Megaphone className="text-white h-5 w-5 shrink-0" />
      ),
    },
    {
      label: "Laporan",
      href: "/dashboard/laporan",
      icon: (
        <FileText className="text-white h-5 w-5 shrink-0" />
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
        <span className="font-medium text-white whitespace-pre">
          NutriLogic
        </span>
      </div>
      <span className="text-xs text-gray-300 ml-10 -mt-3">
        Portal Kader
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
