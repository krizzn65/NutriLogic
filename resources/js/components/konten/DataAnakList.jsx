import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import api from "../../lib/api";
import { formatAge, getStatusColor, getStatusLabel } from "../../lib/utils";
import DataAnakSkeleton from "../loading/DataAnakSkeleton";
import { useDataCache } from "../../contexts/DataCacheContext";
import PageHeader from "../ui/PageHeader";
import { useToast } from "../../contexts/ToastContext";

import { DataAnakTable } from "./DataAnakTable";
import logger from "../../lib/logger";

export default function DataAnakList() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [children, setChildren] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const { getCachedData, setCachedData, invalidateCache } = useDataCache();
    const toast = useToast();

    useEffect(() => {
        fetchChildren();

        // Check for success message from navigation state
        if (location.state?.message) {
            toast.success(location.state.message);
            // Clear the message from location state
            window.history.replaceState({}, document.title);

            // Invalidate cache when coming back with success message (data was modified)
            invalidateCache("children");
            invalidateCache("dashboard");
        }
    }, [location, invalidateCache, toast]);

    const fetchChildren = async () => {
        try {
            setLoading(true);
            setError(null);

            // Check cache first
            const cachedData = getCachedData("children");
            if (cachedData) {
                setChildren(cachedData);
                setLoading(false);
                return;
            }

            // Fetch from API if no cache
            const response = await api.get("/parent/children");
            const data = response.data.data;
            setChildren(data);
            setCachedData("children", data);
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                "Gagal memuat data anak. Silakan coba lagi.";
            setError(errorMessage);
            logger.error("Children fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSuccess = (message) => {
        toast.success(message);
        fetchChildren(); // Refresh list
        invalidateCache("children");
        invalidateCache("dashboard");
    };

    // Loading state
    if (loading) {
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
                                <svg
                                    className="w-16 h-16 mx-auto"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <p className="text-gray-800 font-medium mb-2">
                                Terjadi Kesalahan
                            </p>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <button
                                onClick={fetchChildren}
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
        <div className="flex flex-col flex-1 w-full h-full bg-gray-50 overflow-hidden">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative z-50"
            >
                <PageHeader
                    title="Data Anak"
                    subtitle="Portal Orang Tua"
                    showProfile={true}
                />
            </motion.div>

            <div className="flex-1 overflow-auto no-scrollbar md:scrollbar-auto p-4 md:p-10 flex flex-col gap-6">
                {/* Table/List View */}
                {children.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center"
                    >
                        <svg
                            className="w-16 h-16 text-gray-400 mx-auto mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                        </svg>
                        <p className="text-gray-600 mb-4">
                            Belum ada data anak terdaftar
                        </p>
                    </motion.div>
                ) : (
                    <DataAnakTable data={children} />
                )}
            </div>
        </div>
    );
}
