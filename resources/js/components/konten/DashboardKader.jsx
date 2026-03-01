import React, { useState, useEffect, useMemo } from "react";
import { Users, AlertTriangle, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import DashboardKaderSkeleton from "../loading/DashboardKaderSkeleton";
import PageHeader from "../ui/PageHeader";
import DashboardLayout from "../dashboard/DashboardLayout";
import { STATUS_LABELS } from "../../constants/statusColors";
import KaderHeroSection from "./dashboard-kader/KaderHeroSection";
import KaderStatCards from "./dashboard-kader/KaderStatCards";
import KaderNutritionChartCard from "./dashboard-kader/KaderNutritionChartCard";
import KaderAgendaCard from "./dashboard-kader/KaderAgendaCard";
import KaderCalendarModal from "./dashboard-kader/KaderCalendarModal";
import KaderDashboardErrorState from "./dashboard-kader/KaderDashboardErrorState";
import logger from "../../lib/logger";

export default function DashboardKaderContent() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [allSchedules, setAllSchedules] = useState([]);
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [showMobileCalendar, setShowMobileCalendar] = useState(false);

    const [activeIndex, setActiveIndex] = useState(null);
    const [hoveredLegend, setHoveredLegend] = useState(null);
    const [isChartHovered, setIsChartHovered] = useState(false);

    useEffect(() => {
        fetchDashboardData();
        fetchAllSchedules();
    }, []);

    const generateSmartNotifications = useMemo(
        () => (data) => {
            const notifications = [];
            let idCounter = 1;

            if (!data || !data.statistics) return notifications;

            const { statistics, highlights } = data;

            if (statistics.priority_children > 0) {
                notifications.push({
                    id: `priority_children_${idCounter++}`,
                    title: "Perhatian: Anak Prioritas",
                    message: `Terdapat ${statistics.priority_children} anak yang membutuhkan perhatian khusus di posyandu Anda. Segera lakukan intervensi.`,
                    type: "danger",
                    link: "/dashboard/data-anak",
                    timestamp: "Baru saja",
                });
            }

            const severeMalnutrition =
                statistics.nutritional_status?.sangat_kurang || 0;
            if (severeMalnutrition > 0) {
                notifications.push({
                    id: `gizi_buruk_${idCounter++}`,
                    title: "Peringatan Gizi Buruk",
                    message: `${severeMalnutrition} anak terdeteksi dengan gizi sangat kurang. Diperlukan tindakan segera dan koordinasi dengan tenaga kesehatan.`,
                    type: "danger",
                    link: "/dashboard/data-anak",
                    timestamp: "30 menit yang lalu",
                });
            }

            const stunting = statistics.nutritional_status?.sangat_pendek || 0;
            if (stunting > 0) {
                notifications.push({
                    id: `stunting_${idCounter++}`,
                    title: "Kasus Stunting Ditemukan",
                    message: `${stunting} anak terindikasi sangat pendek (stunting). Perlu pemantauan pertumbuhan berkelanjutan dan edukasi nutrisi kepada orang tua.`,
                    type: "warning",
                    link: "/dashboard/data-anak",
                    timestamp: "1 jam yang lalu",
                });
            }

            const wasting = statistics.nutritional_status?.sangat_kurus || 0;
            if (wasting > 0) {
                notifications.push({
                    id: `wasting_${idCounter++}`,
                    title: "Peringatan Gizi Akut",
                    message: `${wasting} anak mengalami gizi kurang akut (wasting). Evaluasi asupan makanan dan kondisi kesehatan anak segera.`,
                    type: "warning",
                    link: "/dashboard/data-anak",
                    timestamp: "1 jam yang lalu",
                });
            }

            if (highlights?.unread_consultations > 0) {
                notifications.push({
                    id: `consultations_${idCounter++}`,
                    title: "Konsultasi Menunggu Respon",
                    message: `Ada ${highlights.unread_consultations} pesan konsultasi dari orang tua yang belum Anda balas. Berikan bantuan kepada mereka.`,
                    type: "info",
                    link: "/dashboard/konsultasi",
                    timestamp: "2 jam yang lalu",
                });
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const criticalSchedules = [];
            const upcomingSchedules = [];
            const earlyWarningSchedules = [];

            allSchedules.forEach((schedule) => {
                const scheduleDate = new Date(schedule.scheduled_for);
                scheduleDate.setHours(0, 0, 0, 0);
                const diffDays = Math.ceil(
                    (scheduleDate - today) / (1000 * 60 * 60 * 24),
                );

                if (diffDays >= 0 && diffDays <= 1) {
                    criticalSchedules.push({ ...schedule, diffDays });
                } else if (diffDays >= 2 && diffDays <= 3) {
                    upcomingSchedules.push({ ...schedule, diffDays });
                } else if (diffDays >= 4 && diffDays <= 7) {
                    earlyWarningSchedules.push({ ...schedule, diffDays });
                }
            });

            criticalSchedules.forEach((schedule) => {
                const isImmunization =
                    schedule.type === "imunisasi" ||
                    schedule.title.toLowerCase().includes("imunisasi");
                const isPMT =
                    schedule.type === "pmt" ||
                    schedule.title.toLowerCase().includes("pmt");

                let title = "Jadwal Posyandu Mendesak";
                let icon = "Jadwal";

                if (isImmunization) {
                    title = "Imunisasi Mendesak";
                    icon = "Imunisasi";
                } else if (isPMT) {
                    title = "PMT (Pemberian Makanan Tambahan)";
                    icon = "PMT";
                }

                notifications.push({
                    id: `critical_schedule_${schedule.id}`,
                    title: `${icon} ${title}`,
                    message: `${schedule.title} dijadwalkan ${schedule.diffDays === 0 ? "HARI INI" : "BESOK"}! Pastikan semua persiapan sudah lengkap dan informasikan kepada orang tua.`,
                    type: "danger",
                    link: "/dashboard/jadwal",
                    timestamp: schedule.diffDays === 0 ? "Hari ini" : "Besok",
                });
            });

            earlyWarningSchedules.forEach((schedule) => {
                const isImmunization =
                    schedule.type === "imunisasi" ||
                    schedule.title.toLowerCase().includes("imunisasi");
                const isPMT =
                    schedule.type === "pmt" ||
                    schedule.title.toLowerCase().includes("pmt");

                if (isImmunization || isPMT) {
                    notifications.push({
                        id: `early_warning_${schedule.id}`,
                        title: isImmunization
                            ? "Pengingat Imunisasi"
                            : "Pengingat PMT",
                        message: `${schedule.title} akan dilaksanakan ${schedule.diffDays} hari lagi. Mulai persiapkan bahan dan informasikan kepada orang tua agar anak hadir.`,
                        type: "info",
                        link: "/dashboard/jadwal",
                        timestamp: `${schedule.diffDays} hari lagi`,
                    });
                }
            });

            if (upcomingSchedules.length > 0 && notifications.length < 5) {
                const nearestSchedule = upcomingSchedules[0];
                notifications.push({
                    id: `upcoming_schedule_${nearestSchedule.id}`,
                    title: "Jadwal Posyandu Akan Datang",
                    message: `${nearestSchedule.title} dijadwalkan ${nearestSchedule.diffDays} hari lagi. Pastikan persiapan sudah lengkap.`,
                    type: "info",
                    link: "/dashboard/jadwal",
                    timestamp: `${nearestSchedule.diffDays} hari lagi`,
                });
            }

            const normalNutrition = statistics.nutritional_status?.normal || 0;
            const activeChildren = statistics.active_children || 0;
            if (activeChildren > 0 && normalNutrition > 0) {
                const normalPercentage = Math.round(
                    (normalNutrition / activeChildren) * 100,
                );
                if (normalPercentage >= 70) {
                    notifications.push({
                        id: "insight_positif",
                        title: "Insight Positif",
                        message: `Selamat! ${normalPercentage}% anak di posyandu Anda memiliki status gizi normal. Pertahankan kinerja baik ini!`,
                        type: "info",
                        link: "/dashboard",
                        timestamp: "Hari ini",
                    });
                }
            }

            return notifications;
        },
        [allSchedules],
    );

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get("/kader/dashboard");
            setDashboardData(response.data.data);
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                "Gagal memuat data dashboard. Silakan coba lagi.";
            setError(errorMessage);
            logger.error("Dashboard fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllSchedules = async () => {
        try {
            const response = await api.get("/kader/schedules");
            setAllSchedules(response.data.data || []);
        } catch (err) {
            logger.error("Schedules fetch error:", err);
            setAllSchedules([]);
        }
    };

    if (loading) {
        return <DashboardKaderSkeleton />;
    }

    if (error) {
        return (
            <KaderDashboardErrorState
                error={error}
                onRetry={fetchDashboardData}
            />
        );
    }

    const { statistics, highlights } = dashboardData;

    const pieChartData = statistics.nutritional_status
        ? Object.entries(statistics.nutritional_status)
              .filter(([_, value]) => value > 0)
              .map(([name, value]) => ({
                  name: STATUS_LABELS[name] || name,
                  value,
                  rawName: name,
              }))
        : [];

    const totalChildren = statistics.active_children || 0;

    const statCards = [
        {
            title: "Total Anak Terdaftar",
            value: statistics.active_children,
            icon: Users,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
            badge: "Active",
            badgeColor: "text-green-600 bg-green-50",
        },
        {
            title: "Perlu Perhatian",
            value: statistics.priority_children,
            icon: AlertTriangle,
            iconBg: "bg-orange-50",
            iconColor: "text-orange-600",
            badge: "! Penting",
            badgeColor: "text-orange-600 bg-orange-50",
            badgePulse: true,
            link: "/dashboard/anak-prioritas",
        },
        {
            title: "Pesan Belum Dibalas",
            value: highlights.unread_consultations || 0,
            icon: MessageSquare,
            iconBg: "bg-indigo-50",
            iconColor: "text-indigo-600",
            badge:
                highlights.unread_consultations > 0
                    ? `${highlights.unread_consultations} Baru`
                    : null,
            badgeColor: "text-white bg-indigo-500",
            link: "/dashboard/konsultasi",
        },
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
            <div className="flex flex-col gap-6 md:gap-8 w-full max-w-7xl mx-auto mb-10">
                <KaderHeroSection />

                <KaderStatCards
                    statCards={statCards}
                    onCardClick={(link) => navigate(link)}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    <KaderNutritionChartCard
                        statistics={statistics}
                        totalChildren={totalChildren}
                        pieChartData={pieChartData}
                        activeIndex={activeIndex}
                        setActiveIndex={setActiveIndex}
                        hoveredLegend={hoveredLegend}
                        setHoveredLegend={setHoveredLegend}
                        isChartHovered={isChartHovered}
                        setIsChartHovered={setIsChartHovered}
                    />

                    <KaderAgendaCard
                        allSchedules={allSchedules}
                        onNavigateJadwal={() => navigate("/dashboard/jadwal")}
                        onOpenCalendar={() => setShowMobileCalendar(true)}
                    />
                </div>
            </div>

            <KaderCalendarModal
                isOpen={showMobileCalendar}
                onClose={() => setShowMobileCalendar(false)}
                allSchedules={allSchedules}
                calendarDate={calendarDate}
                onMonthChange={setCalendarDate}
            />
        </DashboardLayout>
    );
}
