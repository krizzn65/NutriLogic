import React from "react";
import { Routes, Route } from "react-router-dom";
import SidebarSuperAdmin from "./sidebars/SidebarSuperAdmin";
import DashboardAdmin from "./konten/DashboardAdmin";
import PosyanduManagement from "./konten/PosyanduManagement";
import UserManagement from "./konten/UserManagement";
import ChildrenMonitoring from "./konten/ChildrenMonitoring";
import SystemReports from "./konten/SystemReports";
import ContentManagement from "./konten/ContentManagement";
import SystemSettings from "./konten/SystemSettings";
import ActivityLogs from "./konten/ActivityLogs";
import AdminProfile from "./konten/AdminProfile";

export default function Admin() {
    return (
        <div className="flex flex-col md:flex-row bg-white w-full h-screen overflow-hidden font-montserrat">
            <SidebarSuperAdmin />
            <div className="flex-1 overflow-auto">
                <Routes>
                    <Route index element={<DashboardAdmin />} />
                    <Route path="posyandu" element={<PosyanduManagement />} />
                    <Route path="kader" element={<UserManagement />} />
                    <Route path="orang-tua" element={<UserManagement />} />
                    <Route path="anak" element={<ChildrenMonitoring />} />
                    <Route path="laporan" element={<SystemReports />} />
                    <Route path="konten" element={<ContentManagement />} />
                    <Route path="settings" element={<SystemSettings />} />
                    <Route path="logs" element={<ActivityLogs />} />
                    <Route path="profile" element={<AdminProfile />} />
                </Routes>
            </div>
        </div>
    );
}
