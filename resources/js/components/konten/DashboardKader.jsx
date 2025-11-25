import React, { useState, useEffect } from "react";
import api from "../../lib/api";

export default function DashboardKaderContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/kader/dashboard');
      setDashboardData(response.data.data);
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
    return (
      <div className="flex flex-1 w-full h-full overflow-auto font-montserrat">
        <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat data dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-1 w-full h-full overflow-auto font-montserrat">
        <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-800 font-medium mb-2">Terjadi Kesalahan</p>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchDashboardData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { posyandu, statistics, highlights } = dashboardData;

  // Calculate total with issues (non-normal status)
  const totalWithIssues =
    (statistics.nutritional_status.pendek || 0) +
    (statistics.nutritional_status.sangat_pendek || 0) +
    (statistics.nutritional_status.kurang || 0) +
    (statistics.nutritional_status.sangat_kurang || 0) +
    (statistics.nutritional_status.kurus || 0) +
    (statistics.nutritional_status.sangat_kurus || 0);

  return (
    <div className="flex flex-1 w-full h-full overflow-auto font-montserrat">
      <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard Kader
          </h1>
          <p className="text-gray-600 mt-2">
            {posyandu.name} - {posyandu.village}, {posyandu.district}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Anak Aktif */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-600 text-sm font-medium">Total Anak Aktif</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">{statistics.active_children}</p>
                <p className="text-xs text-gray-500 mt-1">dari {statistics.total_children} total</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Gizi Normal */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-600 text-sm font-medium">Gizi Normal</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">{statistics.nutritional_status.normal}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {statistics.active_children > 0
                    ? Math.round((statistics.nutritional_status.normal / statistics.active_children) * 100)
                    : 0}% dari total
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Perlu Perhatian */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-600 text-sm font-medium">Perlu Perhatian</h3>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{totalWithIssues}</p>
                <p className="text-xs text-gray-500 mt-1">Gizi kurang/pendek</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Anak Prioritas */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-600 text-sm font-medium">Anak Prioritas</h3>
                <p className="text-3xl font-bold text-red-600 mt-2">{statistics.priority_children}</p>
                <p className="text-xs text-gray-500 mt-1">Butuh intervensi</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Highlights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Distribusi Status Gizi */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Distribusi Status Gizi</h2>
            <div className="space-y-3">
              {[
                { label: 'Normal', value: statistics.nutritional_status.normal, color: 'bg-green-500' },
                { label: 'Pendek', value: statistics.nutritional_status.pendek, color: 'bg-yellow-500' },
                { label: 'Sangat Pendek', value: statistics.nutritional_status.sangat_pendek, color: 'bg-red-500' },
                { label: 'Kurang', value: statistics.nutritional_status.kurang, color: 'bg-yellow-500' },
                { label: 'Sangat Kurang', value: statistics.nutritional_status.sangat_kurang, color: 'bg-red-500' },
                { label: 'Kurus', value: statistics.nutritional_status.kurus, color: 'bg-yellow-500' },
                { label: 'Sangat Kurus', value: statistics.nutritional_status.sangat_kurus, color: 'bg-red-500' },
                { label: 'Belum Diketahui', value: statistics.nutritional_status.tidak_diketahui, color: 'bg-gray-400' },
              ].filter(item => item.value > 0).map((item, index) => {
                const percentage = statistics.active_children > 0
                  ? (item.value / statistics.active_children) * 100
                  : 0;

                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      <span className="text-sm text-gray-600">{item.value} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${item.color} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Highlights */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Highlights</h2>
            <div className="space-y-4">
              {/* Next Schedule */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">Jadwal Terdekat</h3>
                    {highlights.next_schedule ? (
                      <div className="mt-1">
                        <p className="text-sm text-gray-700">{highlights.next_schedule.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {highlights.next_schedule.child_name} - {new Date(highlights.next_schedule.scheduled_for).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mt-1">Tidak ada jadwal mendatang</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Open Consultations */}
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">Konsultasi Terbuka</h3>
                    <p className="text-sm text-gray-700 mt-1">
                      {highlights.open_consultations} konsultasi menunggu respons
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
