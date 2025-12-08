import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../lib/api";
import { formatAge, getStatusColor, getStatusLabel } from "../../lib/utils";
import DataAnakSkeleton from "../loading/DataAnakSkeleton";
import { useDataCache } from "../../contexts/DataCacheContext";
import PageHeader from "../dashboard/PageHeader";
import { DataAnakTable } from "./DataAnakTable";

export default function DataAnakList() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [children, setChildren] = useState([]);
    const [successMessage, setSuccessMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 20,
        total: 0,
        last_page: 1,
    });
    const navigate = useNavigate();
    const location = useLocation();
    const { invalidateCache } = useDataCache();

    useEffect(() => {
        fetchChildren();

        // Check for success message from navigation state
        if (location.state?.message) {
            setSuccessMessage(location.state.message);
            // Clear the message from location state
            window.history.replaceState({}, document.title);

            // Auto-hide success message after 5 seconds
            setTimeout(() => {
                setSuccessMessage(null);
            }, 5000);

            // Invalidate cache when coming back with success message (data was modified)
            invalidateCache('children');
            invalidateCache('dashboard');
        }
    }, [location]);

    const fetchChildren = async (page = 1) => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                page,
                per_page: pagination.per_page,
            };
            if (searchTerm) params.search = searchTerm;

            const response = await api.get('/children', { params });
            setChildren(response.data.data);
            setPagination(response.data.meta);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Gagal memuat data anak. Silakan coba lagi.';
            setError(errorMessage);
            console.error('Children fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchChildren();
    };

    const handlePageChange = (page) => {
        fetchChildren(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAddSuccess = (message) => {
        setSuccessMessage(message);
        fetchChildren(); // Refresh list
        invalidateCache('children');
        invalidateCache('dashboard');
        setTimeout(() => {
            setSuccessMessage(null);
        }, 5000);
    };

    // Loading state
    if (loading && children.length === 0) {
        return <DataAnakSkeleton itemCount={6} />;
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
                                onClick={() => fetchChildren()}
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

    return (
        <div className="flex flex-1 w-full h-full overflow-auto no-scrollbar md:scrollbar-auto">
            <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-6">
                {/* Success Message */}
                <AnimatePresence>
                    {successMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl flex items-center justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>{successMessage}</span>
                            </div>
                            <button
                                onClick={() => setSuccessMessage(null)}
                                className="text-green-600 hover:text-green-800"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <PageHeader title="Data Anak" subtitle="Portal Orang Tua" />
                </motion.div>

                {/* Search Box */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
                        <div className="flex-1 w-full">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">Pencarian</label>
                            <div className="relative group">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Cari nama anak..."
                                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-xl focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-gray-700 placeholder:text-gray-400"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300"
                        >
                            Cari
                        </button>
                    </form>
                </div>

                {/* Table/List View */}
                {children.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center"
                    >
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada data anak</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-6">
                            {searchTerm
                                ? `Tidak ada anak dengan nama "${searchTerm}"`
                                : "Data anak yang terdaftar akan muncul di sini."
                            }
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    fetchChildren();
                                }}
                                className="px-4 py-2 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors font-medium"
                            >
                                Reset Pencarian
                            </button>
                        )}
                    </motion.div>
                ) : (
                    <>
                        <DataAnakTable data={children} />

                        {/* Pagination & Info */}
                        {children.length > 0 && (
                            <div className="flex flex-col justify-center items-center gap-4 mt-6">
                                {/* Navigation Buttons - Only show if more than 1 page */}
                                {pagination.last_page > 1 && (
                                    <div className="flex items-center gap-2">
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
                                    </div>
                                )}

                                {/* Page Info - Always Visible */}
                                <div className="text-sm text-gray-500 bg-white/50 px-4 py-2 rounded-xl border border-gray-100">
                                    Halaman {pagination.current_page} dari {pagination.last_page} • Total: <span className="font-bold text-gray-900">{pagination.total}</span> anak
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
