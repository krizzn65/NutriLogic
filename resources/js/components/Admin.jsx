import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { DataCacheProvider } from "../contexts/DataCacheContext";
import { ProfileModalProvider } from "../contexts/ProfileModalContext";
import { SettingsModalProvider } from "../contexts/SettingsModalContext";
import SidebarSuperAdmin from "./sidebars/SidebarSuperAdmin";
import MobileBottomNavAdmin from "./sidebars/MobileBottomNavAdmin";

const DashboardAdmin = lazy(() => import("./konten/DashboardAdmin"));
const PosyanduManagement = lazy(() => import("./konten/PosyanduManagement"));
const UserManagement = lazy(() => import("./konten/UserManagement"));
const ChildrenMonitoring = lazy(() => import("./konten/ChildrenMonitoring"));
const SystemReports = lazy(() => import("./konten/SystemReports"));
const SystemSettings = lazy(() => import("./konten/SystemSettings"));
const ActivityLogs = lazy(() => import("./konten/ActivityLogs"));
const AdminProfile = lazy(() => import("./konten/AdminProfile"));

const PageLoader = () => (
    <div
        className="flex flex-1 w-full h-full items-center justify-center bg-gray-50"
        role="status"
        aria-live="polite"
    >
        <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">Memuat...</p>
        </div>
    </div>
);

export default function Admin() {
    return (
        <DataCacheProvider>
            <ProfileModalProvider>
                <SettingsModalProvider>
                    <div className="flex flex-col md:flex-row bg-white w-full h-screen overflow-hidden font-montserrat">
                        <a
                            href="#main-content-admin"
                            className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[10000] bg-white text-blue-700 border border-blue-200 rounded-lg px-3 py-2 text-sm font-medium shadow"
                        >
                            Lewati ke konten utama
                        </a>
                        <div className="hidden md:block h-full">
                            <SidebarSuperAdmin />
                        </div>

                        <MobileBottomNavAdmin />

                        <main
                            id="main-content-admin"
                            role="main"
                            className="flex-1 overflow-auto pb-24 md:pb-0"
                        >
                            <Suspense fallback={<PageLoader />}>
                                <Routes>
                                    <Route index element={<DashboardAdmin />} />
                                    <Route
                                        path="posyandu"
                                        element={<PosyanduManagement />}
                                    />
                                    <Route
                                        path="kader"
                                        element={<UserManagement />}
                                    />
                                    <Route
                                        path="orang-tua"
                                        element={<UserManagement />}
                                    />
                                    <Route
                                        path="anak"
                                        element={<ChildrenMonitoring />}
                                    />
                                    <Route
                                        path="laporan"
                                        element={<SystemReports />}
                                    />
                                    <Route
                                        path="settings"
                                        element={<SystemSettings />}
                                    />
                                    <Route
                                        path="logs"
                                        element={<ActivityLogs />}
                                    />
                                    <Route
                                        path="profile"
                                        element={<AdminProfile />}
                                    />
                                </Routes>
                            </Suspense>
                        </main>
                    </div>
                </SettingsModalProvider>
            </ProfileModalProvider>
        </DataCacheProvider>
    );
}
