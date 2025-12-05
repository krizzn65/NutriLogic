import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OrangTua from "./OrangTua";
import Kader from "./Kader";
import Admin from "./Admin";
import { getUser, isAuthenticated } from "../lib/auth";
import DashboardOrangTuaSkeleton from "./loading/DashboardOrangTuaSkeleton";
import DashboardKaderSkeleton from "./loading/DashboardKaderSkeleton";
import SidebarOrangTua from "./sidebars/SidebarOrangTua";
import SidebarKader from "./sidebars/SidebarKader";
import SidebarSuperAdmin from "./sidebars/SidebarSuperAdmin";
import SessionMonitor from "./dashboard/SessionMonitor";
import MaintenancePage from "./dashboard/MaintenancePage";
import { getMaintenanceMode } from "../lib/sessionTimeout";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      navigate('/auth');
      return;
    }

    // Get user data from localStorage
    const userData = getUser();
    if (!userData) {
      navigate('/auth');
      return;
    }

    setUser(userData);

    // Check maintenance mode (admin is not affected)
    if (userData.role !== 'admin') {
      setIsMaintenanceMode(getMaintenanceMode());
    }

    setLoading(false);
  }, [navigate]);

  // Check maintenance mode periodically for non-admin users
  useEffect(() => {
    if (!user || user.role === 'admin') return;

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
    const isKader = userData?.role === 'kader';
    const isAdmin = userData?.role === 'admin';

    return (
      <div className="flex flex-col md:flex-row bg-white w-full h-screen overflow-hidden">
        {isAdmin ? <SidebarSuperAdmin /> : isKader ? <SidebarKader /> : <SidebarOrangTua />}
        {isKader || isAdmin ? <DashboardKaderSkeleton /> : <DashboardOrangTuaSkeleton />}
      </div>
    );
  }

  // Show maintenance page for non-admin users when maintenance mode is enabled
  if (isMaintenanceMode && user?.role !== 'admin') {
    return <MaintenancePage />;
  }

  // Render based on user role with SessionMonitor for auto-logout
  if (user?.role === 'admin') {
    return (
      <SessionMonitor>
        <Admin />
      </SessionMonitor>
    );
  }

  if (user?.role === 'kader') {
    return (
      <SessionMonitor>
        <Kader />
      </SessionMonitor>
    );
  }

  // Default to OrangTua (for role 'ibu' or any other role)
  return (
    <SessionMonitor>
      <OrangTua />
    </SessionMonitor>
  );
}


