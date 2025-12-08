import React, { useState, useEffect, useMemo } from "react";
import api from "../../lib/api";
import { useDataCache } from "../../contexts/DataCacheContext";
import DashboardOrangTuaSkeleton from "../loading/DashboardOrangTuaSkeleton";
import DashboardLayout from "../dashboard/DashboardLayout";
import MainSection from "../dashboard/MainSection";
import ChildProfileCard from "../dashboard/ChildProfileCard";
import { Calendar } from "../ui/calendar";
import GrowthChart from "../dashboard/GrowthChart";
import RightSection from "../dashboard/RightSection";
import PageHeader from "../ui/PageHeader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Icon } from "@iconify/react";
import { useIsDesktop } from "../../hooks/useMediaQuery";

import { useProfileModal } from "../../contexts/ProfileModalContext";

export default function DashboardOrangTuaContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const { getCachedData, setCachedData, invalidateCache } = useDataCache();
  const { profileUpdateTrigger } = useProfileModal();
  const isDesktop = useIsDesktop(); // xl breakpoint (1280px)

  useEffect(() => {
    if (profileUpdateTrigger > 0) {
      invalidateCache('dashboard');
      // Reset selected child when cache is invalidated
      setSelectedChildId(null);
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
        
        // Validate and reset selectedChildId if child no longer exists
        if (selectedChildId && cachedData.children) {
          const childExists = cachedData.children.some(c => c.id === selectedChildId);
          if (!childExists) {
            setSelectedChildId(null);
          }
        }
        
        setLoading(false);
        return;
      }

      // Fetch from API if no cache
      const response = await api.get('/parent/dashboard');
      const data = response.data.data;
      setDashboardData(data);
      setCachedData('dashboard', data);

      // Set initial selected child if not already set
      if (!selectedChildId && data.children && data.children.length > 0) {
        const featuredChild = data.children?.find(c => c.latest_nutritional_status?.is_at_risk) || data.children?.[0];
        setSelectedChildId(featuredChild?.id);
      } else if (selectedChildId && data.children) {
        // Validate selected child still exists after fetch
        const childExists = data.children.some(c => c.id === selectedChildId);
        if (!childExists) {
          const featuredChild = data.children?.find(c => c.latest_nutritional_status?.is_at_risk) || data.children?.[0];
          setSelectedChildId(featuredChild?.id || null);
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Gagal memuat data dashboard. Silakan coba lagi.';
      setError(errorMessage);
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate smart notifications for Parent based on dashboard data
  const generateSmartNotifications = useMemo(() => (data) => {
    const notifs = [];

    if (!data || !data.children) return notifs;

    data.children.forEach(child => {
      const status = child.latest_nutritional_status;
      if (!status) return;

      // Stunting Alert
      if (status.status_tb_u === 'sangat_pendek' || status.status_tb_u === 'pendek') {
        notifs.push({
          id: `stunting_${child.id}`,
          title: "Perhatian Pertumbuhan",
          message: `Tinggi badan ${child.full_name} tergolong ${status.status_tb_u.replace('_', ' ')}. Konsultasikan dengan kader atau ahli gizi.`,
          type: 'warning',
          link: '/dashboard/data-anak',
          timestamp: 'Baru saja'
        });
      }

      // Wasting Alert
      if (status.status_bb_tb === 'sangat_kurus' || status.status_bb_tb === 'kurus') {
        notifs.push({
          id: `wasting_${child.id}`,
          title: "Perhatian Berat Badan",
          message: `Berat badan ${child.full_name} tergolong ${status.status_bb_tb.replace('_', ' ')}. Perhatikan asupan nutrisinya.`,
          type: 'warning',
          link: '/dashboard/data-anak',
          timestamp: 'Baru saja'
        });
      }

      // Underweight Alert
      if (status.status_bb_u === 'sangat_kurang' || status.status_bb_u === 'kurang') {
        notifs.push({
          id: `underweight_${child.id}`,
          title: "Berat Badan Kurang",
          message: `Berat badan ${child.full_name} di bawah standar usianya. Pastikan asupan kalori tercukupi.`,
          type: 'warning',
          link: '/dashboard/data-anak',
          timestamp: 'Baru saja'
        });
      }
    });

    return notifs;
  }, []);

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
    return (
      <div className="flex flex-1 w-full h-full overflow-auto items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          </div>
          <p className="text-gray-800 font-bold text-lg mb-2">Data Tidak Tersedia</p>
          <p className="text-gray-600 mb-6">Tidak dapat memuat data dashboard</p>
          <button
            onClick={fetchDashboard}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  const { user, summary, children } = dashboardData;

  // Empty state for parent without children
  const hasNoChildren = !children || children.length === 0;

  // Get selected child or featured child
  const selectedChild = selectedChildId
    ? children?.find(c => c.id === selectedChildId)
    : (children?.find(c => c.latest_nutritional_status?.is_at_risk) || children?.[0]);

  return (
    <DashboardLayout
      rightSidebar={
        <RightSection
          user={user}
          childrenData={children}
          selectedChildId={selectedChildId}
          onSelectChild={setSelectedChildId}
        />
      }
      header={
        <PageHeader
          title="Dashboard"
          subtitle={new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          showProfile={true}
          dashboardData={dashboardData}
          generateNotifications={generateSmartNotifications}
        />
      }
    >
      {/* Top Section: Stats Cards (MainSection) */}
      <MainSection
        user={user}
        summary={summary}
      />

      {hasNoChildren ? (
        /* Empty State for Parent without Children */
        <div className="bg-white rounded-[24px] p-8 md:p-12 text-center border-2 border-dashed border-blue-200 shadow-sm">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Data Anak</h3>
            <p className="text-gray-600 mb-6">
              Tambahkan data anak Anda untuk mulai memantau tumbuh kembang dan status gizi mereka.
            </p>
            <button
              onClick={() => navigate('/dashboard/anak/tambah')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Tambah Anak Pertama
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Middle Section: Child & Calendar (Side-by-side on Mobile & Desktop) */}
          {/* Only render on non-desktop to avoid duplicate render with RightSection */}
          {!isDesktop && (
            <>
              {/* Child Selector Dropdown - Visible ONLY on Mobile/Tablet */}
              {children && children.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-700">Kartu Anak</h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-sm">
                          <Icon icon="lucide:users" className="text-gray-500 w-4 h-4" />
                          <span className="truncate max-w-[120px]">{selectedChild?.full_name || "Pilih Anak"}</span>
                          <Icon icon="lucide:chevron-down" className="text-gray-400 w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-1">
                        {children.map((child) => (
                          <DropdownMenuItem
                            key={child.id}
                            onClick={() => setSelectedChildId(child.id)}
                            className="rounded-lg cursor-pointer hover:bg-gray-50 focus:bg-gray-50 gap-2"
                          >
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-600 font-bold">
                              {(child.full_name || '?')[0]}
                            </div>
                            <span className="truncate">{child.full_name}</span>
                            {child.id === selectedChildId && (
                              <Icon icon="lucide:check" className="ml-auto text-blue-600 w-4 h-4" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )}

              {/* Child card and calendar grid - Only on Mobile/Tablet */}
              <div className="grid grid-cols-2 gap-3 md:gap-6">
                <div className="h-full">
                  {selectedChild ? (
                    <ChildProfileCard child={selectedChild} />
                  ) : (
                    <div className="bg-blue-50 rounded-3xl p-8 text-center border border-blue-100 border-dashed h-full flex items-center justify-center">
                      <p className="text-blue-600 font-medium">Belum ada data anak</p>
                    </div>
                  )}
                </div>
                <div className="h-full">
                  <Calendar />
                </div>
              </div>
            </>
          )}

          {/* Bottom Section: Chart */}
          <GrowthChart childId={selectedChildId} />
        </>
      )}
    </DashboardLayout >
  );
}
