import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, Filter, Plus, ChevronDown, MoreHorizontal, User, Calendar, Activity } from "lucide-react";
import api from "../../lib/api";
import { formatAge, getStatusColor, getStatusLabel } from "../../lib/utils";
import GenericListSkeleton from "../loading/GenericListSkeleton";
import TableSkeleton from "../loading/TableSkeleton";
import PageHeader from "../dashboard/PageHeader";
import { assets } from "../../assets/assets";
import EditChildModal from "./EditChildModal";

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

    useEffect(() => {
        if (location.state?.message) {
            setSuccessMessage(location.state.message);
            window.history.replaceState({}, document.title);
            setTimeout(() => setSuccessMessage(null), 5000);
        }
    }, [location]);

    useEffect(() => {
        fetchChildren();
    }, [filterStatus, filterActive]);

    const fetchChildren = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (filterStatus) params.status = filterStatus;
            if (filterActive) params.is_active = filterActive;

            const response = await api.get('/kader/children', { params });
            setChildren(response.data.data);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Gagal memuat data anak. Silakan coba lagi.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchChildren();
    };

    if (loading && children.length === 0) {
        return <TableSkeleton itemCount={6} />;
    }

    return (
        <div className="flex flex-1 w-full h-full overflow-auto bg-gray-50/50">
            <div className="w-full flex flex-col gap-6 p-4">
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

                <PageHeader title="Data Anak" subtitle="Portal Kader" />

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
                            <div className="flex-1 w-full">
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

                            <div className="w-full md:w-48">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">Status Gizi</label>
                                <div className="relative">
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-xl focus:ring-4 focus:ring-blue-500/10 transition-all outline-none appearance-none cursor-pointer text-gray-700"
                                    >
                                        <option value="">Semua Status</option>
                                        <option value="normal">Normal</option>
                                        <option value="pendek">Pendek</option>
                                        <option value="sangat_pendek">Sangat Pendek</option>
                                        <option value="kurang">Kurang</option>
                                        <option value="sangat_kurang">Sangat Kurang</option>
                                        <option value="kurus">Kurus</option>
                                        <option value="sangat_kurus">Sangat Kurus</option>
                                    </select>
                                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="w-full md:w-40">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">Status Aktif</label>
                                <div className="relative">
                                    <select
                                        value={filterActive}
                                        onChange={(e) => setFilterActive(e.target.value)}
                                        className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-xl focus:ring-4 focus:ring-blue-500/10 transition-all outline-none appearance-none cursor-pointer text-gray-700"
                                    >
                                        <option value="">Semua</option>
                                        <option value="1">Aktif</option>
                                        <option value="0">Tidak Aktif</option>
                                    </select>
                                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </form>

                        <div className="w-full xl:w-auto flex-shrink-0">
                            <label className="text-xs font-semibold text-transparent uppercase tracking-wider mb-1.5 block ml-1 select-none">Action</label>
                            <button
                                className="w-full xl:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 flex items-center justify-center gap-2 font-medium"
                                onClick={() => navigate('/dashboard/data-anak/tambah')}
                            >
                                <Plus className="w-5 h-5" />
                                <span className="whitespace-nowrap">Tambah Anak</span>
                            </button>
                        </div>
                    </div>
                </div>

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
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada data anak</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-8">
                            Data anak yang terdaftar akan muncul di sini. Mulai dengan menambahkan data anak baru.
                        </p>
                        <button
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 flex items-center gap-2 font-medium"
                            onClick={() => navigate('/dashboard/data-anak/tambah')}
                        >
                            <Plus className="w-5 h-5" />
                            Tambah Anak Pertama
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
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
                )}

                <EditChildModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={(msg) => {
                        setSuccessMessage(msg);
                        fetchChildren();
                    }}
                    childId={selectedChildId}
                />
            </div>
        </div>
    );
}
