
import React, { useState, useEffect, useMemo } from "react";
import { MapPin, Calendar as CalendarIcon, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { useDataCache } from "../../contexts/DataCacheContext";
import DashboardKaderSkeleton from "../loading/DashboardKaderSkeleton";
import PageHeader from "../ui/PageHeader";
import DashboardLayout from "../dashboard/DashboardLayout";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { Calendar } from "../ui/calendar";

export default function DashboardKaderContent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [allSchedules, setAllSchedules] = useState([]);
  const [calendarDate, setCalendarDate] = useState(new Date()); // Track calendar's current month
  const [showMobileCalendar, setShowMobileCalendar] = useState(false);

  // Data caching
  const { getCachedData, setCachedData } = useDataCache();

  useEffect(() => {
    fetchDashboardData();
    fetchAllSchedules();
  }, []);

  // Generate smart notifications for Kader based on dashboard data
  const generateSmartNotifications = useMemo(() => (data) => {
    const notifs = [];
    let idCounter = 1;

    if (!data || !data.statistics) return notifs;

    const { statistics, highlights } = data;

    // Priority Children Alert
    if (statistics.priority_children > 0) {
      notifs.push({
        id: `priority_children_${idCounter++}`,
        title: "Perhatian: Anak Prioritas",
        message: `Terdapat ${statistics.priority_children} anak yang membutuhkan perhatian khusus di posyandu Anda. Segera lakukan intervensi.`,
        type: 'danger',
        link: '/dashboard/data-anak',
        timestamp: 'Baru saja'
      });
    }

    // Severe Malnutrition Alert
    const severeMalnutrition = (statistics.nutritional_status?.sangat_kurang || 0);
    if (severeMalnutrition > 0) {
      notifs.push({
        id: `gizi_buruk_${idCounter++}`,
        title: "Peringatan Gizi Buruk",
        message: `${severeMalnutrition} anak terdeteksi dengan gizi sangat kurang. Diperlukan tindakan segera dan koordinasi dengan tenaga kesehatan.`,
        type: 'danger',
        link: '/dashboard/data-anak',
        timestamp: '30 menit yang lalu'
      });
    }

    // Stunting Alert
    const stunting = (statistics.nutritional_status?.sangat_pendek || 0);
    if (stunting > 0) {
      notifs.push({
        id: `stunting_${idCounter++}`,
        title: "Kasus Stunting Ditemukan",
        message: `${stunting} anak terindikasi sangat pendek (stunting). Perlu pemantauan pertumbuhan berkelanjutan dan edukasi nutrisi kepada orang tua.`,
        type: 'warning',
        link: '/dashboard/data-anak',
        timestamp: '1 jam yang lalu'
      });
    }

    // Wasting Alert
    const wasting = (statistics.nutritional_status?.sangat_kurus || 0);
    if (wasting > 0) {
      notifs.push({
        id: `wasting_${idCounter++}`,
        title: "Peringatan Gizi Akut",
        message: `${wasting} anak mengalami gizi kurang akut (wasting). Evaluasi asupan makanan dan kondisi kesehatan anak segera.`,
        type: 'warning',
        link: '/dashboard/data-anak',
        timestamp: '1 jam yang lalu'
      });
    }

    // Unanswered Consultations
    if (highlights?.open_consultations > 0) {
      notifs.push({
        id: `consultations_${idCounter++}`,
        title: "Konsultasi Menunggu Respon",
        message: `Ada ${highlights.open_consultations} pesan konsultasi dari orang tua yang belum Anda balas. Berikan bantuan kepada mereka.`,
        type: 'info',
        link: '/dashboard/konsultasi',
        timestamp: '2 jam yang lalu'
      });
    }

    // Upcoming Schedules (check for schedules in next 7 days for early warning)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Group schedules by urgency
    const criticalSchedules = []; // H-0 to H-1
    const upcomingSchedules = []; // H-2 to H-3
    const earlyWarningSchedules = []; // H-4 to H-7

    allSchedules.forEach(schedule => {
      const scheduleDate = new Date(schedule.scheduled_for);
      scheduleDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((scheduleDate - today) / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= 1) {
        criticalSchedules.push({ ...schedule, diffDays });
      } else if (diffDays >= 2 && diffDays <= 3) {
        upcomingSchedules.push({ ...schedule, diffDays });
      } else if (diffDays >= 4 && diffDays <= 7) {
        earlyWarningSchedules.push({ ...schedule, diffDays });
      }
    });

    // Critical schedules (today or tomorrow) - HIGH PRIORITY
    criticalSchedules.forEach(schedule => {
      const isImmunization = schedule.type === 'imunisasi' || schedule.title.toLowerCase().includes('imunisasi');
      const isPMT = schedule.type === 'pmt' || schedule.title.toLowerCase().includes('pmt');
      
      let title = "Jadwal Posyandu Mendesak";
      let icon = "📅";
      
      if (isImmunization) {
        title = "Imunisasi Mendesak";
        icon = "💉";
      } else if (isPMT) {
        title = "PMT (Pemberian Makanan Tambahan)";
        icon = "🍽️";
      }

      notifs.push({
        id: `critical_schedule_${schedule.id}`,
        title: `${icon} ${title}`,
        message: `${schedule.title} dijadwalkan ${schedule.diffDays === 0 ? 'HARI INI' : 'BESOK'}! Pastikan semua persiapan sudah lengkap dan informasikan kepada orang tua.`,
        type: 'danger',
        link: '/dashboard/jadwal',
        timestamp: schedule.diffDays === 0 ? 'Hari ini' : 'Besok'
      });
    });

    // Early warning for immunization/PMT (H-7 to H-4)
    earlyWarningSchedules.forEach(schedule => {
      const isImmunization = schedule.type === 'imunisasi' || schedule.title.toLowerCase().includes('imunisasi');
      const isPMT = schedule.type === 'pmt' || schedule.title.toLowerCase().includes('pmt');
      
      if (isImmunization || isPMT) {
        notifs.push({
          id: `early_warning_${schedule.id}`,
          title: isImmunization ? "💉 Pengingat Imunisasi" : "🍽️ Pengingat PMT",
          message: `${schedule.title} akan dilaksanakan ${schedule.diffDays} hari lagi. Mulai persiapkan bahan dan informasikan kepada orang tua agar anak hadir.`,
          type: 'info',
          link: '/dashboard/jadwal',
          timestamp: `${schedule.diffDays} hari lagi`
        });
      }
    });

    // Regular upcoming schedules (H-2 to H-3)
    if (upcomingSchedules.length > 0 && notifs.length < 5) {
      const nearestSchedule = upcomingSchedules[0];
      notifs.push({
        id: `upcoming_schedule_${nearestSchedule.id}`,
        title: "Jadwal Posyandu Akan Datang",
        message: `${nearestSchedule.title} dijadwalkan ${nearestSchedule.diffDays} hari lagi. Pastikan persiapan sudah lengkap.`,
        type: 'info',
        link: '/dashboard/jadwal',
        timestamp: `${nearestSchedule.diffDays} hari lagi`
      });
    }

    // Positive Insight
    const normalNutrition = statistics.nutritional_status?.normal || 0;
    const activeChildren = statistics.active_children || 0;
    if (activeChildren > 0 && normalNutrition > 0) {
      const normalPercentage = Math.round((normalNutrition / activeChildren) * 100);
      if (normalPercentage >= 70) {
        notifs.push({
          id: 'insight_positif',
          title: "Insight Positif",
          message: `Selamat! ${normalPercentage}% anak di posyandu Anda memiliki status gizi normal. Pertahankan kinerja baik ini!`,
          type: 'info',
          link: '/dashboard',
          timestamp: 'Hari ini'
        });
      }
    }

    return notifs;
  }, [allSchedules]);

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

  const fetchAllSchedules = async () => {
    try {
      const response = await api.get('/kader/schedules');
      const schedulesData = response.data.data || [];
      setAllSchedules(schedulesData);
    } catch (err) {
      console.error('Schedules fetch error:', err);
      setAllSchedules([]);
    }
  };


  // Loading state
  if (loading) {
    return <DashboardKaderSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-1 w-full min-h-full font-montserrat">
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

  // Prepare Chart Data
  const chartData = [
    {
      name: 'Normal',
      value: statistics.nutritional_status.normal || 0,
      color: '#10b981', // Green
      label: 'Gizi Normal'
    },
    {
      name: 'Stunting',
      value: (statistics.nutritional_status.pendek || 0) + (statistics.nutritional_status.sangat_pendek || 0),
      color: '#ef4444', // Red
      label: 'Pendek (Stunting)'
    },
    {
      name: 'Kurang Gizi',
      value: (statistics.nutritional_status.kurang || 0) + (statistics.nutritional_status.sangat_kurang || 0),
      color: '#f97316', // Orange
      label: 'Kurang Gizi'
    },
    {
      name: 'Wasting',
      value: (statistics.nutritional_status.kurus || 0) + (statistics.nutritional_status.sangat_kurus || 0),
      color: '#eab308', // Yellow
      label: 'Kurus (Wasting)'
    }
  ];

  return (
    <DashboardLayout
      header={
        <PageHeader
          title="Dashboard Kader"
          subtitle="Portal Kader"
          showProfile={true}
          dashboardData={dashboardData}
          generateNotifications={generateSmartNotifications}
        />
      }
    >
      {/* Bento Grid Layout - Compact Mode */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">

        {/* 1. Hero Section (Span 2) - Welcome & Total Active */}
        <div className="col-span-2 md:col-span-2 bg-gradient-to-br from-[#4481EB] to-[#04BEFE] rounded-3xl p-5 md:p-6 text-white shadow-lg shadow-blue-200/50 relative overflow-hidden group transition-all duration-500 hover:shadow-blue-300/50">
          {/* Abstract Shapes */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-black/5 rounded-full -ml-10 -mb-10 blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3 opacity-90">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold border border-white/30 tracking-wide">
                  DASHBOARD UTAMA
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-1 tracking-tight">Halo, Kader! </h2>
              <p className="text-blue-50 text-lg font-medium leading-relaxed max-w-md">
                Pantau kesehatan anak balita di posyandu Anda hari ini.
              </p>
            </div>

            <div className="mt-6 flex items-end gap-4">
              <div>
                <div className="text-5xl font-bold tracking-tighter drop-shadow-sm">
                  {statistics.active_children}
                </div>
                <div className="text-blue-100 font-medium text-lg mt-1">Total Anak Terdaftar</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Priority Action Card (Span 1) */}
        <div 
          onClick={() => navigate('/dashboard/anak-prioritas')}
          className="col-span-1 bg-red-50/80 backdrop-blur-sm rounded-3xl p-4 md:p-5 shadow-sm border border-red-100 hover:shadow-lg hover:shadow-red-100/50 hover:-translate-y-0.5 transition-all duration-300 flex flex-col relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
            <svg className="w-24 h-24 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Perlu Perhatian</h3>
              <p className="text-red-500 text-xs font-semibold uppercase tracking-wider mt-0.5">PENTING</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-end">
            <div className="text-4xl font-bold text-gray-900 tracking-tight">{statistics.priority_children}</div>
            <p className="text-gray-600 font-medium mt-2">Anak butuh intervensi</p>
          </div>

          <div className="mt-6 flex items-center text-red-600 font-semibold text-sm group-hover:gap-2 transition-all">
            Lihat Detail <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
          </div>
        </div>

        {/* 3. Consultation Action Card (Span 1) */}
        <div 
          onClick={() => navigate('/dashboard/konsultasi')}
          className="col-span-1 bg-purple-50/80 backdrop-blur-sm rounded-3xl p-4 md:p-5 shadow-sm border border-purple-100 hover:shadow-lg hover:shadow-purple-100/50 hover:-translate-y-0.5 transition-all duration-300 flex flex-col relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
            <svg className="w-24 h-24 text-purple-600" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Konsultasi</h3>
              <p className="text-purple-500 text-xs font-semibold uppercase tracking-wider mt-0.5">AKTIVITAS</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-end">
            <div className="text-4xl font-bold text-gray-900 tracking-tight">{highlights.open_consultations}</div>
            <p className="text-gray-600 font-medium mt-2">Pesan belum dibalas</p>
          </div>

          <div className="mt-6 flex items-center text-purple-600 font-semibold text-sm group-hover:gap-2 transition-all">
            Buka Chat <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
          </div>
        </div>

        {/* 4. Nutrition Distribution Chart (Span 2) */}
        <div className="col-span-2 md:col-span-2 bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-gray-100 flex flex-col h-full min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-xl text-gray-900">Status Gizi Anak</h3>
              <p className="text-gray-500 text-sm mt-1">Visualisasi distribusi status gizi saat ini</p>
            </div>
            <div className="px-4 py-1.5 bg-gray-50 rounded-full text-xs font-semibold text-gray-600 border border-gray-100">
              Total: {statistics.active_children} Anak
            </div>
          </div>

          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                barSize={40}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: '#f9fafb' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-xl">
                          <p className="font-bold text-gray-900 mb-1">{data.label}</p>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
                            <span className="text-sm text-gray-600">
                              {data.value} Anak ({statistics.active_children > 0 ? Math.round((data.value / statistics.active_children) * 100) : 0}%)
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={1500}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. Schedule Card (Span 2) - Sleek Redesign with Calendar */}
        <div className="col-span-2 md:col-span-2 bg-white rounded-3xl p-0 shadow-sm border border-gray-100 flex flex-col h-full relative overflow-hidden group hover:shadow-md transition-all duration-300">
          {/* Decorative Top Line */}
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400"></div>

          <div className="p-5 md:p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 leading-none">Agenda Posyandu</h3>
                  <p className="text-gray-400 text-xs font-medium mt-1">
                    {calendarDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMobileCalendar(true)}
                  className="lg:hidden p-2 bg-blue-50 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors"
                >
                  <CalendarIcon className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => navigate('/dashboard/jadwal')}
                  className="hidden lg:flex group/btn items-center gap-1 text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-wider"
                >
                  Lihat Semua
                  <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Side: All Monthly Schedules */}
              <div className="flex-1">
                {(() => {
                  // Filter schedules for selected calendar month
                  const currentMonthSchedules = allSchedules.filter(schedule => {
                    const scheduleDate = new Date(schedule.scheduled_for);
                    return scheduleDate.getMonth() === calendarDate.getMonth() &&
                      scheduleDate.getFullYear() === calendarDate.getFullYear();
                  });

                  return currentMonthSchedules.length > 0 ? (
                    <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
                      {currentMonthSchedules.map((schedule, index) => (
                        <div key={schedule.id} className="flex items-start gap-3 p-3 bg-gray-50/50 rounded-xl border border-gray-100 hover:bg-blue-50/30 hover:border-blue-200 transition-all">
                          {/* Compact Date */}
                          <div className="flex flex-col items-center justify-center min-w-[50px] bg-white rounded-lg px-2 py-1.5 border border-gray-200">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider leading-none">
                              {new Date(schedule.scheduled_for).toLocaleDateString('id-ID', { month: 'short' }).toUpperCase()}
                            </span>
                            <span className="text-2xl font-bold text-gray-900 tracking-tighter leading-none mt-0.5">
                              {new Date(schedule.scheduled_for).getDate()}
                            </span>
                            <span className="text-[8px] font-medium text-blue-600 leading-none mt-0.5">
                              {new Date(schedule.scheduled_for).toLocaleDateString('id-ID', { weekday: 'short' })}
                            </span>
                          </div>

                          {/* Schedule Details */}
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-bold text-gray-900 leading-tight truncate">
                              {schedule.title}
                            </h5>
                            <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">
                              {schedule.notes || 'Tidak ada deskripsi'}
                            </p>

                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              <div className="flex items-center gap-1 text-gray-600 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span className="text-[10px] font-medium">
                                  {new Date(schedule.scheduled_for).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                </span>
                              </div>
                              {schedule.location && (
                                <div className="flex items-center gap-1 text-gray-600 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                  <span className="text-[10px] font-medium truncate max-w-[100px]">{schedule.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-8 h-full">
                      <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mb-2 text-gray-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <p className="text-gray-900 font-bold text-sm">Tidak ada jadwal</p>
                      <p className="text-gray-400 text-xs">Belum ada kegiatan bulan ini</p>
                    </div>
                  );
                })()}
              </div>

              {/* Right Side: Calendar - Hidden on Mobile */}
              <div className="hidden lg:block w-px bg-gray-100"></div>
              <div className="hidden lg:flex flex-1 justify-center items-start">
                <div className="scale-90 origin-top">
                  <Calendar
                    mode="single"
                    selected={new Date()}
                    className="rounded-md border-0"
                    schedules={allSchedules}
                    currentDate={calendarDate}
                    onMonthChange={setCalendarDate}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
      {/* Mobile Calendar Modal */}
      {showMobileCalendar && (
        <div className="fixed inset-0 z-50 lg:hidden flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowMobileCalendar(false)}
              className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full mt-2">
              <Calendar
                mode="single"
                selected={new Date()}
                className="rounded-md border-0 w-full"
                classNames={{
                  month: "space-y-4 w-full",
                  table: "w-full",
                  head_row: "flex w-full justify-between",
                  row: "flex w-full mt-2 justify-between",
                  cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: "h-11 w-11 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-md flex items-center justify-center mx-auto text-base"
                }}
                schedules={allSchedules}
                currentDate={calendarDate}
                onMonthChange={setCalendarDate}
              />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
