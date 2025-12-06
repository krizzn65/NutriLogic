import React from "react";
import { Routes, Route } from "react-router-dom";
import { DataCacheProvider } from "../contexts/DataCacheContext";
import SidebarSuperAdmin from "./sidebars/SidebarSuperAdmin";
import MobileBottomNavAdmin from "./sidebars/MobileBottomNavAdmin";
import DashboardAdmin from "./konten/DashboardAdmin";
import PosyanduManagement from "./konten/PosyanduManagement";
import UserManagement from "./konten/UserManagement";
import ChildrenMonitoring from "./konten/ChildrenMonitoring";
import SystemReports from "./konten/SystemReports";

import SystemSettings from "./konten/SystemSettings";
import ActivityLogs from "./konten/ActivityLogs";
import AdminProfile from "./konten/AdminProfile";

export default function Admin() {
    return (
        <DataCacheProvider>
            <div className="flex flex-col md:flex-row bg-white w-full h-screen overflow-hidden font-montserrat">
                <div className="hidden md:block h-full">
                    <SidebarSuperAdmin />
                </div>

                <MobileBottomNavAdmin />

                <div className="flex-1 overflow-auto pb-24 md:pb-0">
                    <Routes>
                        <Route index element={<DashboardAdmin />} />
                        <Route path="posyandu" element={<PosyanduManagement />} />
                        <Route path="kader" element={<UserManagement />} />
                        <Route path="orang-tua" element={<UserManagement />} />
                        <Route path="anak" element={<ChildrenMonitoring />} />
                        <Route path="laporan" element={<SystemReports />} />

                        <Route path="settings" element={<SystemSettings />} />
                        <Route path="logs" element={<ActivityLogs />} />
                        <Route path="profile" element={<AdminProfile />} />
                    </Routes>
                </div>
            </div>
        </DataCacheProvider>
    );
}
