import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import { useDataCache } from "../../contexts/DataCacheContext";
import DashboardOrangTuaSkeleton from "../loading/DashboardOrangTuaSkeleton";
import DashboardLayout from "../dashboard/DashboardLayout";
import MainSection from "../dashboard/MainSection";
import ChildProfileCard from "../dashboard/ChildProfileCard";
import { Calendar } from "../ui/calendar";
import GrowthChart from "../dashboard/GrowthChart";
import RightSection from "../dashboard/RightSection";

import { useProfileModal } from "../../contexts/ProfileModalContext";

export default function DashboardOrangTuaContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const { getCachedData, setCachedData, invalidateCache } = useDataCache();
  const { profileUpdateTrigger } = useProfileModal();

  useEffect(() => {
    if (profileUpdateTrigger > 0) {
      invalidateCache('dashboard');
    }
    fetchDashboard();
  }, [profileUpdateTrigger]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cachedData = getCachedData('dashboard');
      if (cachedData) {
        setDashboardData(cachedData);
        setLoading(false);
        return;
      }

      // Fetch from API if no cache
      const response = await api.get('/parent/dashboard');
      const data = response.data.data;
      setDashboardData(data);
      setCachedData('dashboard', data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Gagal memuat data dashboard. Silakan coba lagi.';
      setError(errorMessage);
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return <DashboardOrangTuaSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-1 w-full h-full overflow-auto items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-800 font-bold text-lg mb-2">Terjadi Kesalahan</p>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchDashboard}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!dashboardData) {
    return null;
  }

  const { user, summary, children } = dashboardData;

  // Get the first child or the one needing attention
  const featuredChild = children?.find(c => c.latest_nutritional_status.is_at_risk) || children?.[0];

  return (
    <DashboardLayout
      rightSidebar={
        <RightSection
          user={user}
          childrenData={children}
        />
      }
    >
      {/* Top Section: Stats Cards (MainSection) */}
      <MainSection
        user={user}
        summary={summary}
      />

      {/* Middle Section: Child & Calendar (Side-by-side on Mobile & Desktop) */}
      {/* User Request: "kartu anak dan jadwal sejajar" (side-by-side) on mobile */}
      {/* HIDDEN ON DESKTOP (xl) because it's in the sidebar */}
      <div className="grid grid-cols-2 gap-3 md:gap-6 xl:hidden">
        <div className="h-full">
          {featuredChild ? (
            <ChildProfileCard child={featuredChild} />
          ) : (
            <div className="bg-blue-50 rounded-[30px] p-8 text-center border border-blue-100 border-dashed h-full flex items-center justify-center">
              <p className="text-blue-600 font-medium">Belum ada data anak</p>
            </div>
          )}
        </div>
        <div className="h-full">
          <Calendar />
        </div>
      </div>

      {/* Bottom Section: Chart */}
      <GrowthChart />
    </DashboardLayout>
  );
}
