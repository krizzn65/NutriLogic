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

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
    setLoading(false);
  }, [navigate]);

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

  // Render based on user role
  if (user?.role === 'admin') {
    return <Admin />;
  }

  if (user?.role === 'kader') {
    return <Kader />;
  }

  // Default to OrangTua (for role 'ibu' or any other role)
  return <OrangTua />;
}
