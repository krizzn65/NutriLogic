import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, AlertTriangle, AlertCircle, Clock, TrendingDown, X, Shield, ChevronRight } from "lucide-react";
import PageHeader from "../ui/PageHeader";
import DashboardLayout from "../dashboard/DashboardLayout";
import api from "../../lib/api";
import { useDataCache } from "../../contexts/DataCacheContext";
import { formatAge } from "../../lib/utils";
import kepalaBayi from "../../assets/kepala_bayi.png";
import kepalaBayiCewe from "../../assets/kepala_bayi_cewe.png";
import AnakPrioritasSkeleton from "../loading/AnakPrioritasSkeleton";

export default function AnakPrioritas() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [atRiskChildren, setAtRiskChildren] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterLevel, setFilterLevel] = useState("all");
    const navigate = useNavigate();

    // Data caching
    const { getCachedData, setCachedData } = useDataCache();

    useEffect(() => {
        fetchAtRiskChildren();
    }, []);

    const fetchAtRiskChildren = async (forceRefresh = false) => {
        if (!forceRefresh) {
            const cachedData = getCachedData('kader_at_risk_children');
            if (cachedData) {
                setAtRiskChildren(cachedData);
                setLoading(false);
                return;
            }
        }

        try {
            if (!forceRefresh) {
                setLoading(true);
            }
            setError(null);

            const response = await api.get('/kader/children/at-risk');
            setAtRiskChildren(response.data.data);
            setCachedData('kader_at_risk_children', response.data.data);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Gagal memuat data anak prioritas. Silakan coba lagi.';
            setError(errorMessage);
            console.error('At-risk children fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredChildren = atRiskChildren.filter(item => {
        const matchesSearch = item.child.full_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLevel = filterLevel === "all" || item.risk_level === filterLevel;
        return matchesSearch && matchesLevel;
    });

    const getRiskLevelStyle = (level) => {
        switch (level) {
            case 'high':
                return {
                    bg: 'bg-red-50',
                    border: 'border-red-100',
                    text: 'text-red-600',
                    badge: 'bg-red-100 text-red-700',
                    icon: 'text-red-500',
                    iconBg: 'bg-red-50',
                    label: 'RISIKO TINGGI',
                    dot: 'bg-red-500',
                };
            case 'medium':
                return {
                    bg: 'bg-orange-50',
                    border: 'border-orange-100',
                    text: 'text-orange-600',
                    badge: 'bg-orange-100 text-orange-700',
                    icon: 'text-orange-500',
                    iconBg: 'bg-orange-50',
                    label: 'PERLU PERHATIAN',
                    dot: 'bg-orange-500',
                };
            default:
                return {
                    bg: 'bg-amber-50',
                    border: 'border-amber-100',
                    text: 'text-amber-600',
                    badge: 'bg-amber-100 text-amber-700',
                    icon: 'text-amber-500',
                    iconBg: 'bg-amber-50',
                    label: 'PANTAU',
                    dot: 'bg-amber-500',
                };
        }
    };

    const getRiskIcon = (type) => {
        switch (type) {
            case 'zscore_drop':
                return <TrendingDown className="w-3.5 h-3.5" />;
            case 'status_worsening':
            case 'critical_status':
            case 'at_risk_status':
                return <AlertCircle className="w-3.5 h-3.5" />;
            case 'no_update':
            case 'no_data':
                return <Clock className="w-3.5 h-3.5" />;
            default:
                return <AlertTriangle className="w-3.5 h-3.5" />;
        }
    };

    // Count by risk level
    const countByLevel = {
        high: atRiskChildren.filter(c => c.risk_level === 'high').length,
        medium: atRiskChildren.filter(c => c.risk_level === 'medium').length,
        low: atRiskChildren.filter(c => c.risk_level === 'low').length,
    };

    // Summary card config — Admin style
    const summaryCards = [
        {
            key: 'high',
            title: 'Risiko Tinggi',
            value: countByLevel.high,
            icon: AlertTriangle,
            iconBg: 'bg-red-50',
            iconColor: 'text-red-600',
            badgeColor: 'text-red-600 bg-red-50',
            activeRing: 'ring-red-200',
        },
        {
            key: 'medium',
            title: 'Perlu Perhatian',
            value: countByLevel.medium,
            icon: AlertCircle,
            iconBg: 'bg-orange-50',
            iconColor: 'text-orange-600',
            badgeColor: 'text-orange-600 bg-orange-50',
            activeRing: 'ring-orange-200',
        },
        {
            key: 'low',
            title: 'Pantau',
            value: countByLevel.low,
            icon: Clock,
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-600',
            badgeColor: 'text-amber-600 bg-amber-50',
            activeRing: 'ring-amber-200',
        },
    ];

    if (loading) {
        return <AnakPrioritasSkeleton cardCount={6} />;
    }

    return (
        <DashboardLayout
            header={
                <PageHeader
                    title="Anak Prioritas"
                    subtitle="Portal Kader"
                    description="Daftar anak dengan kondisi gizi yang memerlukan perhatian khusus"
                    showProfile={true}
                />
            }
        >
            <div className="flex flex-col gap-6 md:gap-8 w-full max-w-7xl mx-auto mb-10">

                {/* Error Alert — Admin style centered */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-md mx-auto">
                        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                        <p className="text-red-800 font-medium mb-4">{error}</p>
                        <button
                            onClick={() => fetchAtRiskChildren(true)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
                        >
                            Coba Lagi
                        </button>
                    </div>
                )}

                {/* Summary Cards — Admin style: white cards, colored icons, motion */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                    {summaryCards.map((card, index) => (
                        <div
                            key={card.key}
                            onClick={() => setFilterLevel(filterLevel === card.key ? 'all' : card.key)}
                            className={`bg-white p-5 md:p-6 rounded-2xl shadow-sm border transition-all cursor-pointer group relative overflow-hidden hover:-translate-y-1 ${filterLevel === card.key
                                ? `border-gray-200 ring-2 ${card.activeRing}`
                                : 'border-gray-100 hover:shadow-lg hover:shadow-blue-500/5'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-2xl ${card.iconBg} ${card.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                                    <card.icon className="w-6 h-6" />
                                </div>
                                <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${card.badgeColor}`}>
                                    {card.title}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-1">
                                    {card.value}
                                </h3>
                                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                            </div>
                            {/* Active filter indicator */}
                            {filterLevel === card.key && (
                                <div className={`absolute bottom-0 left-0 right-0 h-1 ${card.iconBg.replace('bg-', 'bg-').replace('50', '500')}`}
                                    style={{ backgroundColor: card.key === 'high' ? '#ef4444' : card.key === 'medium' ? '#f97316' : '#f59e0b' }}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Search & Filter Bar — Clean integrated style */}
                <div className="flex flex-col sm:flex-row gap-3 items-center">
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

                    {/* Filter indicator */}
                    {filterLevel !== 'all' && (
                        <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-xs font-bold px-3 py-2 rounded-xl ${getRiskLevelStyle(filterLevel).badge} flex items-center gap-2`}>
                                {getRiskLevelStyle(filterLevel).label}
                                <button
                                    onClick={() => setFilterLevel('all')}
                                    className="hover:opacity-70 transition-opacity"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </span>
                        </div>
                    )}

                </div>

                {/* Children Grid */}
                {filteredChildren.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 text-center">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-10 h-10 text-emerald-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {searchQuery || filterLevel !== 'all' ? 'Tidak ada data ditemukan' : 'Semua anak dalam kondisi baik!'}
                        </h3>
                        <p className="text-gray-500 text-sm">
                            {searchQuery || filterLevel !== 'all'
                                ? "Coba ubah kata kunci pencarian atau filter."
                                : "Tidak ada anak yang memerlukan perhatian khusus saat ini."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {filteredChildren.map((item, index) => {
                            const { child, risks, risk_level, latest_weighing } = item;
                            const style = getRiskLevelStyle(risk_level);

                            return (
                                <div
                                    key={child.id}
                                    onClick={() => navigate(`/dashboard/data-anak/${child.id}`)}
                                    className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-1 transition-all cursor-pointer group"
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md shrink-0 ring-2 ring-gray-100">
                                                <img
                                                    src={child.gender === 'L' ? kepalaBayi : kepalaBayiCewe}
                                                    alt={child.full_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                                    {child.full_name}
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {child.gender === 'L' ? 'Laki-laki' : 'Perempuan'} • {formatAge(child.age_in_months)}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${style.badge}`}>
                                            {style.label}
                                        </span>
                                    </div>

                                    {/* Risk Indicators — Subtle card style */}
                                    <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2.5">
                                            Indikator Risiko
                                        </p>
                                        <div className="space-y-2">
                                            {risks.map((risk, idx) => (
                                                <div key={idx} className={`flex items-start gap-2 text-xs ${style.text}`}>
                                                    <div className={`mt-0.5 ${style.icon}`}>
                                                        {getRiskIcon(risk.type)}
                                                    </div>
                                                    <span className="leading-relaxed">{risk.message}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Latest Data — Clean data grid */}
                                    <div className="bg-gray-50/60 rounded-xl p-4 border border-gray-100">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Data Terakhir</span>
                                            <span className="text-[10px] text-gray-400 font-medium">
                                                {latest_weighing
                                                    ? new Date(latest_weighing.measured_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                                                    : '-'}
                                            </span>
                                        </div>

                                        {latest_weighing ? (
                                            <div className="grid grid-cols-3 gap-3">
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-medium mb-0.5">Berat</p>
                                                    <p className="text-sm font-bold text-gray-900">{latest_weighing.weight_kg} kg</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-medium mb-0.5">Tinggi</p>
                                                    <p className="text-sm font-bold text-gray-900">{latest_weighing.height_cm} cm</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-medium mb-0.5">Status</p>
                                                    <p className={`text-xs font-bold ${style.text}`}>
                                                        {latest_weighing.nutritional_status || '-'}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-400 italic text-center py-1">Belum ada data penimbangan</p>
                                        )}
                                    </div>

                                    {/* Footer — Clean with consistent button */}
                                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 font-medium">Orang Tua</span>
                                            <span className="text-xs font-semibold text-gray-700 truncate max-w-[120px]">
                                                {child.parent?.name || '-'}
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
