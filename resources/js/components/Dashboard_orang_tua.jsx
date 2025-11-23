import React from "react";
import SidebarOrangTua from "./sidebars/SidebarOrangTua";
import DashboardOrangTuaContent from "./dashboards/DashboardOrangTuaContent";

export default function Dashboard_orang_tua() {
  return (
    <div className="flex flex-col md:flex-row bg-white w-full h-screen overflow-hidden">
      <SidebarOrangTua />
      <DashboardOrangTuaContent />
    </div>
  );
}
