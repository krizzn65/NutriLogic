import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import { getUser } from "../../lib/auth";
import { getStatusColor, getStatusLabel, formatAge } from "../../lib/utils";

export default function DashboardOrangTuaContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/parent/dashboard');
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
      <div className="flex flex-1 w-full h-full overflow-auto">
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
      <div className="flex flex-1 w-full h-full overflow-auto">
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
                onClick={fetchDashboard}
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

  // No data state
  if (!dashboardData) {
    return null;
  }

  const { user, summary, children, upcoming_schedules } = dashboardData;

  return (
    <div className="flex flex-1 w-full h-full overflow-auto">
      <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-6">
        {/* Greeting Section */}
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-gray-800">
            Selamat datang, {user.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Pantau perkembangan kesehatan buah hati Anda.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-blue-500 rounded-lg mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Jumlah Anak</h3>
            <p className="text-2xl font-bold text-gray-800 mt-1">{summary.total_children}</p>
          </div>

          <div className={`bg-white rounded-lg p-6 shadow-sm border ${
            summary.at_risk_count > 0 
              ? 'border-yellow-300 bg-yellow-50' 
              : 'border-gray-200'
          }`}>
            <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center ${
              summary.at_risk_count > 0 ? 'bg-yellow-500' : 'bg-green-500'
            }`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Anak Berisiko</h3>
            <p className={`text-2xl font-bold mt-1 ${
              summary.at_risk_count > 0 ? 'text-yellow-800' : 'text-gray-800'
            }`}>
              {summary.at_risk_count}
            </p>
            {summary.at_risk_count > 0 && (
              <p className="text-xs text-yellow-700 mt-1">Perlu perhatian khusus</p>
            )}
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-purple-500 rounded-lg mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Jadwal Terdekat</h3>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {upcoming_schedules?.length || 0}
            </p>
          </div>
        </div>

        {/* Children Cards List */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Data Anak</h2>
          {children.length === 0 ? (
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-gray-600">Belum ada data anak terdaftar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {children.map((child) => {
                const status = child.latest_nutritional_status;
                const isAtRisk = status.is_at_risk;
                
                return (
                  <div
                    key={child.id}
                    className={`bg-white rounded-lg p-6 shadow-sm border ${
                      isAtRisk 
                        ? 'border-yellow-300 bg-yellow-50' 
                        : 'border-gray-200'
                    }`}
                  >
                    {isAtRisk && (
                      <div className="mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium text-yellow-800">Perlu Perhatian</span>
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{child.full_name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatAge(child.age_in_months)} • {child.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs text-gray-500 mb-2">Status Gizi Terakhir</p>
                      {status.status === 'tidak_diketahui' || !status.measured_at ? (
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                          Belum ada data pengukuran
                        </div>
                      ) : (
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status.status)}`}>
                          {getStatusLabel(status.status)}
                        </div>
                      )}
                      {status.measured_at && (
                        <p className="text-xs text-gray-500 mt-2">
                          Diukur: {new Date(status.measured_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Schedules Section */}
        {upcoming_schedules && upcoming_schedules.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Jadwal Terdekat</h2>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="space-y-3">
                {upcoming_schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border ${
                      schedule.is_urgent
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      schedule.is_urgent
                        ? 'bg-red-100'
                        : 'bg-blue-100'
                    }`}>
                      <svg className={`w-6 h-6 ${
                        schedule.is_urgent ? 'text-red-600' : 'text-blue-600'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-800">{schedule.title}</span>
                        {schedule.is_urgent && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                            Urgent
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {schedule.child_name} • {schedule.type}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(schedule.scheduled_for).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })} • {schedule.days_until === 0 
                          ? 'Hari ini' 
                          : schedule.days_until === 1 
                          ? 'Besok' 
                          : `${schedule.days_until} hari lagi`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {(!upcoming_schedules || upcoming_schedules.length === 0) && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Jadwal Terdekat</h2>
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600">Tidak ada jadwal terdekat</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
