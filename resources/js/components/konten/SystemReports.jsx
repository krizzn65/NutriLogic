import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import { useDataCache } from "../../contexts/DataCacheContext";
import { FileText, Download, Calendar, TrendingUp, BarChart3 } from "lucide-react";
import GenericListSkeleton from "../loading/GenericListSkeleton";

export default function SystemReports() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [dateRange, setDateRange] = useState({
        date_from: '',
        date_to: '',
    });

    // Data caching
    const { getCachedData, setCachedData } = useDataCache();

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async (forceRefresh = false) => {
        // Cache only when no date filter (skip if forceRefresh)
        const hasDateFilter = dateRange.date_from || dateRange.date_to;
        if (!hasDateFilter && !forceRefresh) {
            const cachedReports = getCachedData('admin_reports');
            if (cachedReports) {
                setReportData(cachedReports);
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
            const params = {};
            if (dateRange.date_from) params.date_from = dateRange.date_from;
            if (dateRange.date_to) params.date_to = dateRange.date_to;

            const response = await api.get('/admin/reports', { params });
            setReportData(response.data.data);

            // Cache only when no date filter
            if (!hasDateFilter) {
                setCachedData('admin_reports', response.data.data);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Gagal memuat data laporan.';
            setError(errorMessage);
            console.error('Report fetch error:', err);
        } finally {
            setLoading(false);
        }
    };


    const handleExport = (type) => {
        const params = new URLSearchParams();
        params.append('type', type);
        if (dateRange.date_from) params.append('date_from', dateRange.date_from);
        if (dateRange.date_to) params.append('date_to', dateRange.date_to);

        const token = localStorage.getItem('token');
        const url = `${import.meta.env.VITE_API_URL}/admin/reports/export?${params.toString()}`;

        // Open in new tab to trigger download
        window.open(url, '_blank');
    };

    const getStatusColor = (status) => {
        if (status === 'normal') return 'bg-green-100 text-green-800';
        if (status.includes('sangat')) return 'bg-red-100 text-red-800';
        return 'bg-orange-100 text-orange-800';
    };

    const getStatusLabel = (status) => {
        const labels = {
            normal: 'Normal',
            kurang: 'Kurang',
            sangat_kurang: 'Sangat Kurang',
            pendek: 'Pendek',
            sangat_pendek: 'Sangat Pendek',
            kurus: 'Kurus',
            sangat_kurus: 'Sangat Kurus',
            lebih: 'Lebih',
            gemuk: 'Gemuk',
        };
        return labels[status] || status;
    };

    if (loading) {
        return (
            <div className="p-4 md:p-10 w-full h-full bg-gray-50">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 w-full h-full overflow-auto">
            <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Laporan Sistem</h1>
                    <p className="text-gray-600 mt-2">Statistik dan laporan sistem NutriLogic</p>
                </div>

                {/* Date Range Filter */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-end gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Dari Tanggal
                            </label>
                            <input
                                type="date"
                                value={dateRange.date_from}
                                onChange={(e) => setDateRange({ ...dateRange, date_from: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sampai Tanggal
                            </label>
                            <input
                                type="date"
                                value={dateRange.date_to}
                                onChange={(e) => setDateRange({ ...dateRange, date_to: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <button
                            onClick={fetchReportData}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Filter
                        </button>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">{error}</p>
                        <button
                            onClick={fetchReportData}
                            className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                            Coba Lagi
                        </button>
                    </div>
                )}

                {reportData && (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <p className="text-sm text-gray-600">Total Posyandu</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">{reportData.summary.total_posyandu}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <p className="text-sm text-gray-600">Total Kader</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">{reportData.summary.total_kader}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <p className="text-sm text-gray-600">Total Orang Tua</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">{reportData.summary.total_ibu}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <p className="text-sm text-gray-600">Total Anak</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">{reportData.summary.total_anak}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <p className="text-sm text-gray-600">Total Penimbangan</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">{reportData.summary.total_weighings}</p>
                            </div>
                        </div>

                        {/* Export Buttons */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Download className="w-5 h-5" />
                                Export Data
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    onClick={() => handleExport('summary')}
                                    className="px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <FileText className="w-5 h-5" />
                                    Export Ringkasan
                                </button>
                                <button
                                    onClick={() => handleExport('children')}
                                    className="px-4 py-3 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <FileText className="w-5 h-5" />
                                    Export Data Anak
                                </button>
                                <button
                                    onClick={() => handleExport('weighings')}
                                    className="px-4 py-3 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <FileText className="w-5 h-5" />
                                    Export Penimbangan
                                </button>
                            </div>
                        </div>

                        {/* Nutritional Status Distribution */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5" />
                                Distribusi Status Gizi
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                {Object.entries(reportData.status_distribution).map(([status, count]) => (
                                    <div
                                        key={status}
                                        className={`p-4 rounded-lg ${getStatusColor(status)}`}
                                    >
                                        <p className="text-xs font-medium">{getStatusLabel(status)}</p>
                                        <p className="text-2xl font-bold mt-1">{count}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Monthly Trend */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Tren Penimbangan (6 Bulan Terakhir)
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Bulan</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Jumlah Penimbangan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.monthly_trend.map((item, index) => (
                                            <tr key={index} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4 text-gray-700">{item.month}</td>
                                                <td className="py-3 px-4 text-right text-gray-700 font-medium">{item.weighings_count}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Growth by Posyandu */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                Statistik per Posyandu
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Posyandu</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Jumlah Anak</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Jumlah Penimbangan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.growth_by_posyandu.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className="py-8 text-center text-gray-500">
                                                    Tidak ada data
                                                </td>
                                            </tr>
                                        ) : (
                                            reportData.growth_by_posyandu.map((item, index) => (
                                                <tr key={index} className="border-b hover:bg-gray-50">
                                                    <td className="py-3 px-4 text-gray-700">{item.posyandu_name}</td>
                                                    <td className="py-3 px-4 text-right text-gray-700">{item.children_count}</td>
                                                    <td className="py-3 px-4 text-right text-gray-700 font-medium">{item.weighings_count}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
