import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowLeft, AlertTriangle, TrendingDown, Clock, Filter, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
    const [filterReason, setFilterReason] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Data caching
    const { getCachedData, setCachedData } = useDataCache();

    useEffect(() => {
        fetchPriorityChildren();

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchPriorityChildren = async () => {
        // Check cache first
        const cachedData = getCachedData('kader_priority_children');
        if (cachedData) {
            setPriorityChildren(cachedData.children);
            setSummary(cachedData.summary);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
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


    const getReasonBadge = (reason) => {
        const styles = {
            bad_nutritional_status: {
                bg: 'bg-red-50',
                text: 'text-red-700',
                border: 'border-red-200',
                icon: AlertTriangle
            },
            weight_stagnation: {
                bg: 'bg-orange-50',
                text: 'text-orange-700',
                border: 'border-orange-200',
                icon: TrendingDown
            },
            long_absence: {
                bg: 'bg-yellow-50',
                text: 'text-yellow-700',
                border: 'border-yellow-200',
                icon: Clock
            },
        };

        const style = styles[reason.type] || styles.bad_nutritional_status;
        const Icon = style.icon;

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
                <Icon className="w-3 h-3" />
                {reason.label}
            </span>
        );
    };

    const filterOptions = [
        { value: "", label: "Semua Kategori" },
        { value: "bad_nutritional_status", label: "Status Gizi Buruk" },
        { value: "weight_stagnation", label: "Berat Stagnan" },
        { value: "long_absence", label: "Tidak Ditimbang Lama" }
    ];

    const filteredChildren = priorityChildren.filter(child => {
        const matchesFilter = filterReason
            ? child.priority_reasons.some(r => r.type === filterReason)
            : true;
        const matchesSearch = child.full_name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (loading) {
        return <AnakPrioritasSkeleton cardCount={6} />;
    }

    return (
        <div className="flex flex-1 w-full h-full overflow-auto no-scrollbar bg-gray-50/50">
            <div className="w-full flex flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Anak Prioritas</h1>
                        <p className="text-gray-500 mt-1">Daftar anak yang memerlukan perhatian khusus</p>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                            <div className="relative z-10">
                                <p className="text-xs md:text-sm font-medium text-gray-500 mb-1">Total Prioritas</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{summary.total_priority}</h3>
                                    <span className="text-xs md:text-sm text-gray-500">Anak</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="p-1 bg-red-100 rounded-lg">
                                        <AlertTriangle className="w-3 md:w-3.5 h-3 md:h-3.5 text-red-600" />
                                    </div>
                                    <p className="text-xs md:text-sm font-medium text-gray-500">Gizi Buruk</p>
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900">{summary.by_reason.bad_nutritional_status}</h3>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="p-1 bg-orange-100 rounded-lg">
                                        <TrendingDown className="w-3 md:w-3.5 h-3 md:h-3.5 text-orange-600" />
                                    </div>
                                    <p className="text-xs md:text-sm font-medium text-gray-500">Berat Stagnan</p>
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900">{summary.by_reason.weight_stagnation}</h3>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="p-1 bg-yellow-100 rounded-lg">
                                        <Clock className="w-3 md:w-3.5 h-3 md:h-3.5 text-yellow-600" />
                                    </div>
                                    <p className="text-xs md:text-sm font-medium text-gray-500">Jarang Hadir</p>
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900">{summary.by_reason.long_absence}</h3>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters & Search */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center z-20 relative">
                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari nama anak..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm"
                        />
                    </div>

                    <div className="relative w-full md:w-64" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        >
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-400" />
                                <span className="truncate">
                                    {filterOptions.find(opt => opt.value === filterReason)?.label || "Semua Kategori"}
                                </span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 8 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50"
                                >
                                    {filterOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                setFilterReason(option.value);
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-gray-50 transition-colors ${filterReason === option.value ? 'text-blue-600 bg-blue-50/50' : 'text-gray-700'
                                                }`}
                                        >
                                            <span>{option.label}</span>
                                            {filterReason === option.value && (
                                                <Check className="w-4 h-4" />
                                            )}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
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
                            {searchQuery || filterReason
                                ? "Coba ubah kata kunci pencarian atau filter kategori."
                                : "Tidak ada anak yang masuk dalam kategori prioritas saat ini."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 z-0">
                        {filteredChildren.map((child) => (
                            <div
                                key={child.id}
                                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
                                onClick={() => navigate(`/dashboard/data-anak/${child.id}`)}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border border-blue-200 shadow-sm shrink-0">
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
                                </div>

                                {/* Badges */}
                                <div className="flex flex-wrap gap-2 mb-4 min-h-[28px]">
                                    {child.priority_reasons.map((reason, index) => (
                                        <div key={index}>
                                            {getReasonBadge(reason)}
                                        </div>
                                    ))}
                                </div>

                                {/* Latest Data */}
                                <div className="bg-gray-50/80 rounded-xl p-3 mb-4 border border-gray-100">
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
                                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
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
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
