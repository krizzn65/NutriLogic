import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Plus, ChevronDown, MoreHorizontal, User, Calendar, Activity, Check } from "lucide-react";
import api from "../../lib/api";
import { useDataCache } from "../../contexts/DataCacheContext";
import { formatAge, getStatusColor, getStatusLabel } from "../../lib/utils";
import GenericListSkeleton from "../loading/GenericListSkeleton";
import TableSkeleton from "../loading/TableSkeleton";
import PageHeader from "../ui/PageHeader";
import DashboardLayout from "../dashboard/DashboardLayout";
import { assets } from "../../assets/assets";
import EditChildModal from "./EditChildModal";
import AddChildKaderModal from "./AddChildKaderModal";

export default function DataAnakKader() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [children, setChildren] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterActive, setFilterActive] = useState("1");
    const [successMessage, setSuccessMessage] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedChildId, setSelectedChildId] = useState(null);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [isActiveDropdownOpen, setIsActiveDropdownOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 10,
        total: 0,
        last_page: 1,
    });


    const { getCachedData, setCachedData } = useDataCache();

    const statusOptions = [
        { value: "", label: "Semua Status" },
        { value: "normal", label: "Normal" },
        { value: "pendek", label: "Pendek" },
        { value: "sangat_pendek", label: "Sangat Pendek" },
        { value: "kurang", label: "Kurang" },
        { value: "sangat_kurang", label: "Sangat Kurang" },
        { value: "kurus", label: "Kurus" },
        { value: "sangat_kurus", label: "Sangat Kurus" },
        { value: "lebih", label: "Lebih" },
        { value: "gemuk", label: "Gemuk" },
    ];

    const activeOptions = [
        { value: "", label: "Semua" },
        { value: "1", label: "Aktif" },
        { value: "0", label: "Tidak Aktif" },
    ];

    useEffect(() => {
        if (location.state?.message) {
            setSuccessMessage(location.state.message);
            window.history.replaceState({}, document.title);
            setTimeout(() => setSuccessMessage(null), 5000);
        }
    }, [location]);

    useEffect(() => {
        setPagination(prev => ({ ...prev, current_page: 1 })); // Reset to page 1
        fetchChildren(1); // Always start from page 1 when filters change
    }, [filterStatus, filterActive]);

    const fetchChildren = async (page = 1, forceRefresh = false) => {
        // Cache key based on filters (no search to avoid too many cache entries)
        const cacheKey = `kader_children_status_${filterStatus || 'all'}_active_${filterActive || 'all'}`;

        // Only use cache when there's no search term and not force refreshing
        if (!searchTerm && page === 1 && !forceRefresh) {
            const cachedChildren = getCachedData(cacheKey);
            if (cachedChildren) {
                setChildren(cachedChildren);
                setLoading(false);
                return;
            }
        }

        try {
            setLoading(true);
            setError(null);

            const params = {
                page,
                per_page: pagination.per_page,
            };
            if (searchTerm) params.search = searchTerm;
            if (filterStatus) params.status = filterStatus;
            if (filterActive) params.is_active = filterActive;

            const response = await api.get('/kader/children', { params });

            setChildren(response.data.data || []);

            // Ensure pagination is always set from response
            if (response.data.meta) {
                setPagination(response.data.meta);
            } else {
                // Fallback: update pagination based on data length
                setPagination(prev => ({
                    ...prev,
                    current_page: page,
                    total: response.data.data?.length || 0,
                    last_page: response.data.data?.length > 0 ? 1 : 0
                }));
            }

            // Cache only when no search term and on first page
            if (!searchTerm && page === 1) {
                setCachedData(cacheKey, response.data.data);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Gagal memuat data anak. Silakan coba lagi.';
            setError(errorMessage);
            console.error('Error fetching children:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        fetchChildren(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, current_page: 1 })); // Reset ke halaman 1
        fetchChildren(1); // Always fetch from page 1 when searching
    };

    if (loading && children.length === 0) {
        return <TableSkeleton itemCount={6} />;
    }

    return (
        <DashboardLayout
            header={
                <PageHeader title="Data Anak" subtitle="Portal Kader" showProfile={true} />
            }
        >
            {/* Success Message */}
            {successMessage && (
                <div className="bg-green-50/80 backdrop-blur-sm border border-green-200 text-green-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-green-200 flex items-center justify-center">
                            <svg className="w-3 h-3 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <span className="font-medium">{successMessage}</span>
                    </div>
                    <button onClick={() => setSuccessMessage(null)} className="text-green-600 hover:text-green-800 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Filters & Search */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between mb-4 md:mb-0">
                    {/* This div wrapper is needed if we want to separate the form and the button,
                             but looking at the code below, the form is the container.
                             Let's just insert the button into the form or alongside it.
                             The user wants it "pantes". Putting it next to filters is standard.
                          */}
                </div>

                <div className="flex flex-col xl:flex-row gap-4 items-end xl:items-center justify-between">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end md:items-center flex-1 w-full">
                        <div className="w-full md:flex-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">Pencarian</label>
                            <div className="relative group">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Cari nama anak atau orang tua..."
                                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-xl focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-gray-700 placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        <div className="flex flex-row gap-4 w-full md:w-auto">
                            <div className="flex-1 md:w-48">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">Status Gizi</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                        className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-xl focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-left text-gray-700 flex items-center justify-between"
                                    >
                                        <span className="truncate text-sm">{statusOptions.find(opt => opt.value === filterStatus)?.label || "Semua Status"}</span>
                                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isStatusDropdownOpen ? "rotate-180" : ""}`} />
                                    </button>
                                    <AnimatePresence>
                                        {isStatusDropdownOpen && (
                                            <>
                                                <div className="fixed inset-0 z-30" onClick={() => setIsStatusDropdownOpen(false)} />
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                    className="absolute z-40 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                                                >
                                                    {statusOptions.map((option) => (
                                                        <div
                                                            key={option.value}
                                                            onClick={() => {
                                                                setFilterStatus(option.value);
                                                                setIsStatusDropdownOpen(false);
                                                            }}
                                                            className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors flex items-center justify-between group border-b border-gray-50 last:border-0"
                                                        >
                                                            <span className={`text-sm ${filterStatus === option.value ? 'text-blue-700 font-semibold' : 'text-gray-700 group-hover:text-blue-700'}`}>
                                                                {option.label}
                                                            </span>
                                                            {filterStatus === option.value && (
                                                                <Check className="w-4 h-4 text-blue-600" />
                                                            )}
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div className="flex-1 md:w-40">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">Status Aktif</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsActiveDropdownOpen(!isActiveDropdownOpen)}
                                        className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-xl focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-left text-gray-700 flex items-center justify-between"
                                    >
                                        <span className="truncate text-sm">{activeOptions.find(opt => opt.value === filterActive)?.label || "Semua"}</span>
                                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isActiveDropdownOpen ? "rotate-180" : ""}`} />
                                    </button>
                                    <AnimatePresence>
                                        {isActiveDropdownOpen && (
                                            <>
                                                <div className="fixed inset-0 z-30" onClick={() => setIsActiveDropdownOpen(false)} />
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                    className="absolute z-40 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                                                >
                                                    {activeOptions.map((option) => (
                                                        <div
                                                            key={option.value}
                                                            onClick={() => {
                                                                setFilterActive(option.value);
                                                                setIsActiveDropdownOpen(false);
                                                            }}
                                                            className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors flex items-center justify-between group border-b border-gray-50 last:border-0"
                                                        >
                                                            <span className={`text-sm ${filterActive === option.value ? 'text-blue-700 font-semibold' : 'text-gray-700 group-hover:text-blue-700'}`}>
                                                                {option.label}
                                                            </span>
                                                            {filterActive === option.value && (
                                                                <Check className="w-4 h-4 text-blue-600" />
                                                            )}
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </form>

                    <div className="hidden md:block w-full xl:w-auto flex-shrink-0">
                        <label className="text-xs font-semibold text-transparent uppercase tracking-wider mb-1.5 block ml-1 select-none">Action</label>
                        <button
                            className="w-full xl:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 flex items-center justify-center gap-2 font-medium"
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            <Plus className="w-5 h-5" />
                            <span className="whitespace-nowrap">Tambah Anak</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Floating Action Button */}
            <button
                onClick={() => setIsAddModalOpen(true)}
                className="md:hidden fixed bottom-24 right-4 z-40 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center hover:bg-blue-700 transition-all active:scale-95"
                aria-label="Tambah Anak"
            >
                <Plus className="w-8 h-8" />
            </button>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3">
                    <Activity className="w-5 h-5" />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            {/* Data List */}
            {children.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <User className="w-10 h-10 text-gray-300" />
                    </div>
                    {searchTerm || filterStatus || filterActive !== "1" ? (
                        <>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Data tidak ditemukan</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mb-8">
                                Tidak ada data anak yang sesuai dengan filter yang dipilih. Coba ubah filter atau kata kunci pencarian.
                            </p>
                            <button
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2 font-medium"
                                onClick={() => {
                                    setSearchTerm("");
                                    setFilterStatus("");
                                    setFilterActive("1");
                                }}
                            >
                                Reset Filter
                            </button>
                        </>
                    ) : (
                        <>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada data anak</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mb-8">
                                Data anak yang terdaftar akan muncul di sini. Mulai dengan menambahkan data anak baru.
                            </p>
                            <button
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 flex items-center gap-2 font-medium"
                                onClick={() => setIsAddModalOpen(true)}
                            >
                                <Plus className="w-5 h-5" />
                                Tambah Anak Pertama
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <>
                    {/* Mobile Card View */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {children.map((child) => {
                            const status = child.latest_nutritional_status || {};
                            return (
                                <div key={child.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-blue-50 p-0.5 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                                                <img
                                                    src={child.gender === 'L' ? assets.kepala_bayi : child.gender === 'P' ? assets.kepala_bayi_cewe : `https://api.dicebear.com/9.x/adventurer/svg?seed=${child.full_name}&backgroundColor=b6e3f4`}
                                                    alt={child.full_name}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{child.full_name}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                    {child.gender === 'L' ? (
                                                        <span className="text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded text-[10px] font-medium">Laki-laki</span>
                                                    ) : (
                                                        <span className="text-pink-500 bg-pink-50 px-1.5 py-0.5 rounded text-[10px] font-medium">Perempuan</span>
                                                    )}
                                                    <span className="text-gray-300">•</span>
                                                    <span>{formatAge(child.age_in_months)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${child.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                {child.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-gray-50">
                                        <div>
                                            <div className="text-xs text-gray-400 mb-1">Orang Tua</div>
                                            <div className="text-sm font-medium text-gray-900">{child.parent?.name || '-'}</div>
                                            <div className="text-xs text-gray-500">{child.parent?.phone || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 mb-1">Status Gizi</div>
                                            {status?.status === 'tidak_diketahui' || !status?.measured_at ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                                                    Belum ada data
                                                </span>
                                            ) : (
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status?.status)} shadow-sm`}>
                                                    {getStatusLabel(status?.status)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => navigate(`/dashboard/data-anak/${child.id}`)}
                                            className="flex-1 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                                        >
                                            Detail
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedChildId(child.id);
                                                setIsEditModalOpen(true);
                                            }}
                                            className="flex-1 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Anak</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Orang Tua</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Umur</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status Gizi</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status Aktif</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {children.map((child) => {
                                        const status = child.latest_nutritional_status || {};
                                        return (
                                            <tr key={child.id} className="group hover:bg-blue-50/30 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-blue-50 p-0.5 shadow-sm flex items-center justify-center overflow-hidden">
                                                            <img
                                                                src={child.gender === 'L' ? assets.kepala_bayi : child.gender === 'P' ? assets.kepala_bayi_cewe : `https://api.dicebear.com/9.x/adventurer/svg?seed=${child.full_name}&backgroundColor=b6e3f4`}
                                                                alt={child.full_name}
                                                                className="w-full h-full rounded-full object-cover"
                                                            />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{child.full_name}</div>
                                                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                                                {child.gender === 'L' ? (
                                                                    <span className="text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded text-[10px] font-medium">Laki-laki</span>
                                                                ) : (
                                                                    <span className="text-pink-500 bg-pink-50 px-1.5 py-0.5 rounded text-[10px] font-medium">Perempuan</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-gray-900">{child.parent?.name || '-'}</span>
                                                        <span className="text-xs text-gray-500">{child.parent?.phone || '-'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg w-fit">
                                                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                        <span className="text-sm font-medium">{formatAge(child.age_in_months)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {status?.status === 'tidak_diketahui' || !status?.measured_at ? (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                                                            Belum ada data
                                                        </span>
                                                    ) : (
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(status?.status)} shadow-sm`}>
                                                            {getStatusLabel(status?.status)}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${child.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                        {child.is_active ? 'Aktif' : 'Tidak Aktif'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => navigate(`/dashboard/data-anak/${child.id}`)}
                                                            className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                                        >
                                                            Detail
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedChildId(child.id);
                                                                setIsEditModalOpen(true);
                                                            }}
                                                            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Pagination */}
            {children.length > 0 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                    <button
                        onClick={() => handlePageChange(pagination.current_page - 1)}
                        disabled={pagination.current_page === 1}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm disabled:hover:bg-white"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div className="flex items-center gap-2">
                        {[...Array(pagination.last_page)].map((_, index) => {
                            const pageNum = index + 1;
                            const isCurrentPage = pageNum === pagination.current_page;

                            // Show first page, last page, current page, and pages around current
                            const showPage =
                                pageNum === 1 ||
                                pageNum === pagination.last_page ||
                                (pageNum >= pagination.current_page - 1 && pageNum <= pagination.current_page + 1);

                            if (!showPage) {
                                // Show ellipsis
                                if (pageNum === pagination.current_page - 2 || pageNum === pagination.current_page + 2) {
                                    return (
                                        <span key={pageNum} className="px-2 text-gray-400">
                                            ...
                                        </span>
                                    );
                                }
                                return null;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`min-w-[40px] h-10 rounded-xl font-medium transition-all ${isCurrentPage
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => handlePageChange(pagination.current_page + 1)}
                        disabled={pagination.current_page === pagination.last_page}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm disabled:hover:bg-white"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    <div className="ml-4 text-sm text-gray-600 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                        Halaman {pagination.current_page} dari {pagination.last_page} • Total: {pagination.total} anak
                    </div>
                </div>
            )}

            <EditChildModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={(msg) => {
                    setSuccessMessage(msg);
                    fetchChildren(1, true); // Force refresh from server
                    setTimeout(() => setSuccessMessage(null), 5000);
                }}
                childId={selectedChildId}
            />

            <AddChildKaderModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={(msg) => {
                    setSuccessMessage(msg);
                    fetchChildren(1, true); // Force refresh from server
                    setTimeout(() => setSuccessMessage(null), 5000);
                }}
            />
        </DashboardLayout>
    );
}
