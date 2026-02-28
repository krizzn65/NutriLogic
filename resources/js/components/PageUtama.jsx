import React, { useEffect, useState, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, isAuthenticated } from "../lib/auth";
import DashboardOrangTuaSkeleton from "./loading/DashboardOrangTuaSkeleton";
import DashboardKaderSkeleton from "./loading/DashboardKaderSkeleton";
import SidebarKader from "./sidebars/SidebarKader";
import SidebarSuperAdmin from "./sidebars/SidebarSuperAdmin";
import SessionMonitor from "./dashboard/SessionMonitor";
import MaintenancePage from "./dashboard/MaintenancePage";
import { getMaintenanceMode } from "../lib/sessionTimeout";

const OrangTua = lazy(() => import("./OrangTua"));
const Kader = lazy(() => import("./Kader"));
const Admin = lazy(() => import("./Admin"));

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check authentication
        if (!isAuthenticated()) {
            navigate("/auth");
            return;
        }

        // Get user data from localStorage
        const userData = getUser();
        if (!userData) {
            navigate("/auth");
            return;
        }

        setUser(userData);

        // Check maintenance mode (admin is not affected)
        if (userData.role !== "admin") {
            setIsMaintenanceMode(getMaintenanceMode());
        }

        setLoading(false);
    }, [navigate]);

    // Check maintenance mode periodically for non-admin users
    useEffect(() => {
        if (!user || user.role === "admin") return;

        const checkMaintenance = () => {
            setIsMaintenanceMode(getMaintenanceMode());
        };

        // Check every 5 seconds
        const interval = setInterval(checkMaintenance, 5000);

        return () => clearInterval(interval);
    }, [user]);

    // Show loading state while checking auth
    if (loading) {
        // Determine which skeleton to show based on stored user role
        const userData = getUser();
        const isKader = userData?.role === "kader";
        const isAdmin = userData?.role === "admin";

        return (
            <div className="flex flex-col md:flex-row bg-white w-full h-screen overflow-hidden">
                {isAdmin ? (
                    <SidebarSuperAdmin />
                ) : isKader ? (
                    <SidebarKader />
                ) : (
                    <div className="hidden md:block h-full w-[300px] bg-[#006AA6]" />
                )}
                {isKader || isAdmin ? (
                    <DashboardKaderSkeleton />
                ) : (
                    <DashboardOrangTuaSkeleton />
                )}
            </div>
        );
    }

    // Show maintenance page for non-admin users when maintenance mode is enabled
    if (isMaintenanceMode && user?.role !== "admin") {
        return <MaintenancePage />;
    }

    const role = user?.role;
    const isAdmin = role === "admin";
    const isKader = role === "kader";

    const roleLoadingFallback = (
        <div className="flex flex-col md:flex-row bg-white w-full h-screen overflow-hidden">
            {isAdmin ? (
                <SidebarSuperAdmin />
            ) : isKader ? (
                <SidebarKader />
            ) : (
                <div className="hidden md:block h-full w-[300px] bg-[#006AA6]" />
            )}
            {isAdmin || isKader ? (
                <DashboardKaderSkeleton />
            ) : (
                <DashboardOrangTuaSkeleton />
            )}
        </div>
    );

    // Render based on user role with SessionMonitor for auto-logout
    return (
        <SessionMonitor>
            <Suspense fallback={roleLoadingFallback}>
                {isAdmin ? <Admin /> : isKader ? <Kader /> : <OrangTua />}
            </Suspense>
        </SessionMonitor>
    );
}
