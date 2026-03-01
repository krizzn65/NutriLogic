import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    Check,
    Clock,
    AlertTriangle,
    X,
    Shield,
    ChevronRight,
    Award,
} from "lucide-react";
import PageHeader from "../ui/PageHeader";
import DashboardLayout from "../dashboard/DashboardLayout";
import api from "../../lib/api";
import { useDataCache } from "../../contexts/DataCacheContext";
import { formatAge } from "../../lib/utils";
import kepalaBayi from "../../assets/kepala_bayi.png";
import kepalaBayiCewe from "../../assets/kepala_bayi_cewe.png";
import AntrianPrioritasSkeleton from "../loading/AntrianPrioritasSkeleton";
import logger from "../../lib/logger";

export default function AntrianPrioritas() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [priorityChildren, setPriorityChildren] = useState([]);
    const [summary, setSummary] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    // Data caching
    const { getCachedData, setCachedData } = useDataCache();

    useEffect(() => {
        fetchPriorityChildren();
    }, []);

    const fetchPriorityChildren = async (forceRefresh = false) => {
        // Check cache first (skip if forceRefresh)
        if (!forceRefresh) {
            const cachedData = getCachedData("kader_priority_queue");
            if (cachedData) {
                setPriorityChildren(cachedData.children);
                setSummary(cachedData.summary);
                setLoading(false);
                return;
            }
        }

        try {
            if (!forceRefresh) {
                setLoading(true);
            }
            setError(null);

            const response = await api.get("/kader/children/priorities");
            setPriorityChildren(response.data.data);
            setSummary(response.data.summary);

            setCachedData("kader_priority_queue", {
                children: response.data.data,
                summary: response.data.summary,
            });
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                "Gagal memuat data antrian prioritas. Silakan coba lagi.";
            setError(errorMessage);
            logger.error("Priority queue fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredChildren = priorityChildren.filter((child) => {
        const matchesSearch = child.full_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    if (loading) {
        return <AntrianPrioritasSkeleton cardCount={6} />;
    }

    return (
        <DashboardLayout
            header={
                <PageHeader
                    title="Antrian Prioritas"
                    subtitle="Portal Kader"
                    description="Daftar anak yang berhak mendapat antrian prioritas karena patuh konsumsi PMT (â‰¥80%)"
                    showProfile={true}
                />
            }
        >
            <div className="flex flex-col gap-6 md:gap-8 w-full max-w-7xl mx-auto mb-10">
                {/* Error Alert â€” Admin style centered */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-md mx-auto">
                        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                        <p className="text-red-800 font-medium mb-4">{error}</p>
                        <button
                            onClick={() => fetchPriorityChildren(true)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
                        >
                            Coba Lagi
                        </button>
                    </div>
                )}

                {/* Summary Card â€” Admin style: white card, colored icon */}
                {summary && (
                    <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-1 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                                <Award className="w-6 h-6" />
                            </div>
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full text-emerald-600 bg-emerald-50">
                                Patuh PMT â‰¥80%
                            </span>
                        </div>
                        <div>
                            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-1">
                                {summary.total_priority}
                            </h3>
                            <p className="text-sm font-medium text-gray-500">
                                Total Anak Berhak Antrian Prioritas
                            </p>
                        </div>
                    </div>
                )}

                {/* Search Bar â€” Clean style tanpa wrapper */}
                <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari nama anak..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-sm shadow-sm"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Children Grid */}
                {filteredChildren.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                            Tidak ada data ditemukan
                        </h3>
                        <p className="text-gray-500 text-sm">
                            {searchQuery
                                ? "Coba ubah kata kunci pencarian."
                                : "Belum ada anak yang memenuhi syarat antrian prioritas saat ini."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {filteredChildren.map((child) => {
                            const pmtCompliance =
                                child.pmt_compliance_percentage || 0;
                            const isEligible =
                                child.is_eligible_priority || false;

                            return (
                                <div
                                    key={child.id}
                                    onClick={() =>
                                        navigate(
                                            `/dashboard/data-anak/${child.id}`,
                                        )
                                    }
                                    className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-1 transition-all cursor-pointer group"
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-5">
                                        <div className="flex items-center gap-3">
                                            {/* Queue Position Badge */}
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md shrink-0 ${
                                                    isEligible
                                                        ? "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-200"
                                                        : "bg-gradient-to-br from-gray-400 to-gray-500 shadow-gray-200"
                                                }`}
                                            >
                                                <span className="text-white font-bold text-sm">
                                                    #
                                                    {child.queue_position ||
                                                        "?"}
                                                </span>
                                            </div>
                                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md shrink-0 ring-2 ring-gray-100">
                                                <img
                                                    src={
                                                        child.gender === "L"
                                                            ? kepalaBayi
                                                            : kepalaBayiCewe
                                                    }
                                                    alt={child.full_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="font-bold line-clamp-1 text-gray-900 group-hover:text-blue-600 transition-colors">
                                                    {child.full_name}
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {child.gender === "L"
                                                        ? "Laki-laki"
                                                        : "Perempuan"}{" "}
                                                    •{" "}
                                                    {formatAge(
                                                        child.age_in_months,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* PMT Compliance â€” Subtle card style */}
                                    <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
                                        <div className="flex items-center justify-between mb-2.5">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                                Konsumsi PMT Bulan Lalu
                                            </span>
                                            <span
                                                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                                    isEligible
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-gray-200 text-gray-600"
                                                }`}
                                            >
                                                {pmtCompliance}%
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    isEligible
                                                        ? "bg-emerald-500"
                                                        : "bg-gray-400"
                                                }`}
                                                style={{
                                                    width: `${pmtCompliance}%`,
                                                }}
                                            ></div>
                                        </div>

                                        {/* Status Badge */}
                                        <div
                                            className={`flex items-center gap-2 justify-center py-2 rounded-lg ${
                                                isEligible
                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                                    : "bg-gray-100 text-gray-500 border border-gray-200"
                                            }`}
                                        >
                                            {isEligible ? (
                                                <>
                                                    <Check className="w-4 h-4" />
                                                    <span className="text-xs font-bold">
                                                        BERHAK ANTRIAN PRIORITAS
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <Clock className="w-4 h-4" />
                                                    <span className="text-xs font-bold">
                                                        BELUM MEMENUHI SYARAT
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Latest Data â€” Clean data grid */}
                                    <div className="bg-gray-50/60 rounded-xl p-4 border border-gray-100">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                                Data Terakhir
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-medium">
                                                {child.latest_weighing
                                                    ? new Date(
                                                          child.latest_weighing
                                                              .measured_at,
                                                      ).toLocaleDateString(
                                                          "id-ID",
                                                          {
                                                              day: "numeric",
                                                              month: "short",
                                                          },
                                                      )
                                                    : "-"}
                                            </span>
                                        </div>

                                        {child.latest_weighing ? (
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-medium mb-0.5">
                                                        Berat
                                                    </p>
                                                    <p className="text-sm font-bold text-gray-900">
                                                        {
                                                            child
                                                                .latest_weighing
                                                                .weight_kg
                                                        }{" "}
                                                        kg
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-medium mb-0.5">
                                                        Tinggi
                                                    </p>
                                                    <p className="text-sm font-bold text-gray-900">
                                                        {
                                                            child
                                                                .latest_weighing
                                                                .height_cm
                                                        }{" "}
                                                        cm
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-medium mb-0.5">
                                                        Lengan
                                                    </p>
                                                    <p className="text-sm font-bold text-gray-900">
                                                        {child.latest_weighing
                                                            .muac_cm
                                                            ? `${child.latest_weighing.muac_cm} cm`
                                                            : "-"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-medium mb-0.5">
                                                        Kepala
                                                    </p>
                                                    <p className="text-sm font-bold text-gray-900">
                                                        {child.latest_weighing
                                                            .head_circumference_cm
                                                            ? `${child.latest_weighing.head_circumference_cm} cm`
                                                            : "-"}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-400 italic text-center py-1">
                                                Belum ada data penimbangan
                                            </p>
                                        )}
                                    </div>

                                    {/* Footer â€” Clean with consistent button */}
                                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 font-medium">
                                                Orang Tua
                                            </span>
                                            <span className="text-xs font-semibold text-gray-700 truncate max-w-[120px]">
                                                {child.parent?.name || "-"}
                                            </span>
                                        </div>
                                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center gap-1">
                                            Lihat Detail
                                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
