
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
      {/* Main Grid Layout - Spacious 3 Column Mode */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-10">

        {/* 1. Hero Section (Full Width) */}
        <div className="col-span-1 lg:col-span-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-200/50 relative overflow-hidden group">
          {/* Abstract Shapes */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-black/10 rounded-full -ml-10 -mb-10 blur-3xl"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold border border-white/30 tracking-wide uppercase">
                  Selamat Datang
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">Halo, Kader Posyandu! 👋</h2>
              <p className="text-blue-50 text-lg leading-relaxed opacity-90">
                Siap memantau tumbuh kembang anak hari ini? Cek ringkasan di bawah untuk melihat area yang perlu perhatian segera.
              </p>
            </div>
            {/* Date/Time or decorative element could go here */}
            <div className="hidden md:block text-right opacity-80">
              <p className="text-sm font-medium uppercase tracking-wider mb-1">Hari ini</p>
              <p className="text-2xl font-bold">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* 2. Key Statistics Row (3 Columns) */}
        {/* Card A: Total Children */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100 hover:shadow-lg hover:shadow-blue-100/50 hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
              + Aktif
            </span>
          </div>
          <div className="mt-2">
            <h3 className="text-4xl font-bold text-gray-900 tracking-tight mb-1">{statistics.active_children}</h3>
            <p className="text-gray-500 font-medium">Total Anak Terdaftar</p>
          </div>
        </div>

        {/* Card B: Priority Children */}
        <div
          onClick={() => navigate('/dashboard/anak-prioritas')}
          className="bg-white rounded-3xl p-6 shadow-sm border border-red-100 hover:shadow-lg hover:shadow-red-100/50 hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform scale-150">
            <svg className="w-full h-full text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full animate-pulse">
              ! Penting
            </span>
          </div>
          <div className="mt-2 relative z-10">
            <h3 className="text-4xl font-bold text-gray-900 tracking-tight mb-1">{statistics.priority_children}</h3>
            <p className="text-gray-500 font-medium flex items-center gap-1">
              Perlu Perhatian
              <svg className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </p>
          </div>
        </div>

        {/* Card C: Consultations */}
        <div
          onClick={() => navigate('/dashboard/konsultasi')}
          className="bg-white rounded-3xl p-6 shadow-sm border border-purple-100 hover:shadow-lg hover:shadow-purple-100/50 hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform scale-150">
            <svg className="w-full h-full text-purple-600" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </div>
            {highlights.open_consultations > 0 && (
              <span className="flex items-center text-xs font-bold text-white bg-purple-500 px-2.5 py-1 rounded-full">
                {highlights.open_consultations} Baru
              </span>
            )}
          </div>
          <div className="mt-2 relative z-10">
            <h3 className="text-4xl font-bold text-gray-900 tracking-tight mb-1">{highlights.open_consultations}</h3>
            <p className="text-gray-500 font-medium flex items-center gap-1">
              Pesan Belum Dibalas
              <svg className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </p>
          </div>
        </div>

        {/* 3. Nutrition Chart (Span 2) */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col h-[500px]">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h3 className="font-bold text-xl text-gray-900">Status Gizi Anak</h3>
              <p className="text-gray-500 mt-1">Distribusi status gizi anak-anak di posyandu</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm font-semibold text-gray-700">Total: {statistics.active_children}</span>
            </div>
          </div>

          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 0, left: 0, bottom: 20 }}
                barSize={60}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }}
                  dy={16}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-4 border border-gray-100 shadow-xl rounded-2xl">
                          <p className="font-bold text-gray-900 mb-1.5">{data.label}</p>
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: data.color }} />
                            <span className="text-base font-semibold text-gray-700">
                              {data.value} Anak
                            </span>
                            <span className="text-sm text-gray-400 font-medium">
                              ({statistics.active_children > 0 ? Math.round((data.value / statistics.active_children) * 100) : 0}%)
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[12, 12, 0, 0]} animationDuration={1000}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Agenda / Schedule (Span 1) */}
        <div className="col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-xl text-gray-900">Agenda</h3>
              <p className="text-gray-500 mt-1 text-sm">Jadwal kegiatan terdekat</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/jadwal')}
              className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
            >
              LIHAT SEMUA
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {allSchedules
              .filter(s => s.status !== 'completed' && new Date(s.scheduled_for) >= new Date(new Date().setHours(0, 0, 0, 0)))
              .sort((a, b) => new Date(a.scheduled_for) - new Date(b.scheduled_for))
              .slice(0, 5)
              .map((schedule) => {
                const isToday = new Date(schedule.scheduled_for).toDateString() === new Date().toDateString();
                return (
                  <div key={schedule.id} className={`group p-4 rounded-2xl border transition-all duration-300 ${isToday ? 'bg-blue-50/50 border-blue-100 hover:border-blue-200' : 'bg-white border-gray-100 hover:border-blue-100 hover:shadow-md'}`}>
                    <div className="flex items-start gap-4">
                      {/* Date Box */}
                      <div className={`flex flex-col items-center justify-center min-w-[60px] h-[60px] rounded-xl border ${isToday ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-700 border-gray-100 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                        <span className="text-[10px] font-bold uppercase tracking-wider leading-none mb-0.5">
                          {new Date(schedule.scheduled_for).toLocaleDateString('id-ID', { month: 'short' })}
                        </span>
                        <span className="text-2xl font-bold leading-none">
                          {new Date(schedule.scheduled_for).getDate()}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 py-0.5">
                        {isToday && (
                          <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold tracking-wide mb-1.5">
                            HARI INI
                          </span>
                        )}
                        <h4 className={`font-bold text-sm leading-tight mb-1 ${isToday ? 'text-blue-900' : 'text-gray-900'}`}>
                          {schedule.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                            {new Date(schedule.scheduled_for).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {schedule.location && (
                            <span className="truncate max-w-[120px] flex items-center gap-1 before:content-['•'] before:mx-1">
                              {schedule.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

            {allSchedules.filter(s => s.status !== 'completed' && new Date(s.scheduled_for) >= new Date(new Date().setHours(0, 0, 0, 0))).length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-8">
                <CalendarIcon className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium">Tidak ada jadwal mendatang</p>
                <p className="text-sm mt-1">Istirahat sejenak! 😊</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <button
              onClick={() => setShowMobileCalendar(true)}
              className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2 w-full"
            >
              <CalendarIcon className="w-4 h-4" />
              Buka Kalender Lengkap
            </button>
          </div>
        </div>

      </div>

      {/* Mobile Calendar Modal - Keep existing logic */}
      {showMobileCalendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
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
