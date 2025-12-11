import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Check, Clock, AlertTriangle } from "lucide-react";
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
            const cachedData = getCachedData('kader_priority_children');
            if (cachedData) {
                setPriorityChildren(cachedData.children);
                setSummary(cachedData.summary);
                setLoading(false);
                return;
            }
        }

        try {
            // Only show loading on initial load
            if (!forceRefresh) {
                setLoading(true);
            }
            setError(null);

            const response = await api.get('/kader/children/priorities');
            setPriorityChildren(response.data.data);
            setSummary(response.data.summary);

            // Cache both children and summary
            setCachedData('kader_priority_children', {
                children: response.data.data,
                summary: response.data.summary
            });
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Gagal memuat data anak prioritas. Silakan coba lagi.';
            setError(errorMessage);
            console.error('Priority children fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredChildren = priorityChildren.filter(child => {
        const matchesSearch = child.full_name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    if (loading) {
        return <AnakPrioritasSkeleton cardCount={6} />;
    }

    return (
        <DashboardLayout
            header={
                <PageHeader
                    title="Antrian Prioritas"
                    subtitle="Portal Kader"
                    description="Daftar anak yang berhak mendapat antrian prioritas karena patuh konsumsi PMT"
                    showProfile={true}
                />
            }
        >

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <p className="text-xs md:text-sm font-medium text-gray-500 mb-1">Total Anak Berhak Antrian Prioritas</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{summary.total_priority}</h3>
                                <span className="text-xs md:text-sm text-gray-500">Anak</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search Bar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari nama anak..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all sm:text-sm"
                    />
                </div>
            </div>

            {/* Children List */}
            {filteredChildren.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-200 text-center z-0">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Tidak ada data ditemukan</h3>
                    <p className="text-gray-500">
                        {searchQuery
                            ? "Coba ubah kata kunci pencarian."
                            : "Belum ada anak yang memenuhi syarat antrian prioritas saat ini."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 z-0">
                    {filteredChildren.map((child) => {
                        // Use real data from backend
                        const pmtCompliance = child.pmt_compliance_percentage || 0;
                        const isEligible = child.is_eligible_priority || false;

                        return (
                            <div
                                key={child.id}
                                className={`bg-white rounded-2xl p-5 shadow-sm border-2 transition-all cursor-pointer group ${isEligible
                                    ? 'border-green-200 hover:border-green-300 hover:shadow-lg hover:shadow-green-100'
                                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                    }`}
                                onClick={() => navigate(`/dashboard/data-anak/${child.id}`)}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-full overflow-hidden border-2 shadow-sm shrink-0 ${isEligible ? 'border-green-300' : 'border-gray-300'
                                            }`}>
                                            <img
                                                src={child.gender === 'L' ? kepalaBayi : kepalaBayiCewe}
                                                alt={child.full_name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h3 className={`font-bold line-clamp-1 transition-colors ${isEligible ? 'text-gray-900 group-hover:text-green-600' : 'text-gray-900 group-hover:text-gray-700'
                                                }`}>
                                                {child.full_name}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {child.gender === 'L' ? 'Laki-laki' : 'Perempuan'} • {formatAge(child.age_in_months)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* PMT Compliance Badge */}
                                <div className={`rounded-xl p-4 mb-4 ${isEligible ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                                    }`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                                            Konsumsi PMT Bulan Ini
                                        </span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isEligible
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-200 text-gray-600'
                                            }`}>
                                            {pmtCompliance}%
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                                        <div
                                            className={`h-full transition-all duration-500 ${isEligible ? 'bg-green-500' : 'bg-gray-400'
                                                }`}
                                            style={{ width: `${pmtCompliance}%` }}
                                        ></div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className={`flex items-center gap-2 justify-center py-1.5 rounded-lg ${isEligible
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-200 text-gray-600'
                                        }`}>
                                        {isEligible ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                <span className="text-xs font-bold">BERHAK ANTRIAN PRIORITAS</span>
                                            </>
                                        ) : (
                                            <>
                                                <Clock className="w-4 h-4" />
                                                <span className="text-xs font-bold">BELUM MEMENUHI SYARAT</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Latest Data */}
                                <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Data Terakhir</span>
                                        <span className="text-[10px] text-gray-400">
                                            {child.latest_weighing
                                                ? new Date(child.latest_weighing.measured_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                                                : '-'}
                                        </span>
                                    </div>

                                    {child.latest_weighing ? (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-0.5">Berat</p>
                                                <p className="text-sm font-bold text-gray-900">{child.latest_weighing.weight_kg} kg</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-0.5">Tinggi</p>
                                                <p className="text-sm font-bold text-gray-900">{child.latest_weighing.height_cm} cm</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-0.5">Lengan</p>
                                                <p className="text-sm font-bold text-gray-900">{child.latest_weighing.muac_cm ? `${child.latest_weighing.muac_cm} cm` : '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-0.5">Kepala</p>
                                                <p className="text-sm font-bold text-gray-900">{child.latest_weighing.head_circumference_cm ? `${child.latest_weighing.head_circumference_cm} cm` : '-'}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400 italic text-center py-1">Belum ada data penimbangan</p>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-400">Orang Tua</span>
                                        <span className="text-xs font-medium text-gray-700 truncate max-w-[120px]">
                                            {child.parent?.name || '-'}
                                        </span>
                                    </div>
                                    <button className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                                        Lihat Detail
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </DashboardLayout>
    );
}
