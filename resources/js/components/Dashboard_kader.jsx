import React from "react";
import SidebarKader from "./sidebars/SidebarKader";
import DashboardKaderContent from "./dashboards/DashboardKaderContent";

export default function Dashboard_kader() {
  return (
    <div className="flex flex-col md:flex-row bg-white w-full h-screen overflow-hidden">
      <SidebarKader />
      <DashboardKaderContent />
    </div>
  );
}
