import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../ui/sidebar";
import {
  Home,
  User,
  Settings,
  FileText,
  BarChart,
  Users,
  ClipboardList,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";

export default function SidebarKader() {
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
      label: "Data Anak",
      href: "/dashboard/data-anak",
      icon: (
        <Users className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
      ),
    },
    {
      label: "Input Data",
      href: "/dashboard/input-data",
      icon: (
        <ClipboardList className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
      ),
    },
    {
      label: "Laporan",
      href: "/dashboard/reports",
      icon: (
        <FileText className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
      ),
    },
    {
      label: "Statistik",
      href: "/dashboard/statistics",
      icon: (
        <BarChart className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
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
      label: "Pengaturan",
      href: "/dashboard/settings",
      icon: (
        <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
      ),
    },
    {
      label: "Keluar",
      href: "#",
      icon: (
        <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
      ),
      onClick: () => {
        // TODO: Clear authentication/localStorage
        navigate("/");
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
              label: "Kader Posyandu",
              href: "#",
              icon: (
                <img
                  src="https://ui-avatars.com/api/?name=Kader+Posyandu&background=667eea&color=fff"
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
      <span className="text-xs text-gray-500 ml-10">
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
