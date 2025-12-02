import React, { useState } from "react";
import api from "../../lib/api";

export default function LaporanKader() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [summary, setSummary] = useState(null);
    const [dateFrom, setDateFrom] = useState(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
    );
    const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

    const fetchSummary = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get(`/kader/report/summary?date_from=${dateFrom}&date_to=${dateTo}`);
            setSummary(response.data.data);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Gagal memuat ringkasan. Silakan coba lagi.';
            setError(errorMessage);
            console.error('Summary fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExportChildren = async () => {
        try {
            const response = await api.get('/kader/report/export/children', {
                responseType: 'blob'
            });
            
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `data_anak_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Gagal mengunduh data. Silakan coba lagi.');
            console.error('Export error:', err);
        }
    };

    const handleExportWeighings = async () => {
        if (!dateFrom || !dateTo) {
            alert('Silakan pilih rentang tanggal terlebih dahulu.');
            return;
        }
        
        try {
            const response = await api.get(`/kader/report/export/weighings?date_from=${dateFrom}&date_to=${dateTo}`, {
                responseType: 'blob'
            });
            
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `riwayat_penimbangan_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Gagal mengunduh data. Silakan coba lagi.');
            console.error('Export error:', err);
        }
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

    const getStatusColor = (status) => {
        if (status === 'normal') return 'bg-green-100 text-green-800';
        if (status.includes('sangat')) return 'bg-red-100 text-red-800';
        if (status.includes('kurang') || status.includes('kurus') || status.includes('pendek')) {
            return 'bg-orange-100 text-orange-800';
        }
        return 'bg-yellow-100 text-yellow-800';
    };

    return (
        <div className="flex flex-1 w-full h-full overflow-auto">
            <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Laporan & Ekspor</h1>
                    <p className="text-gray-600 mt-2">Lihat ringkasan dan unduh data dalam format CSV</p>
                </div>

                {/* Date Range Filter */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Pilih Periode</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={fetchSummary}
                                disabled={loading}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {loading ? 'Memuat...' : 'Lihat Ringkasan'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Summary Display */}
                {summary && (
                    <div className="space-y-6">
                        {/* Overview Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Penimbangan</p>
                                        <p className="text-3xl font-bold text-gray-800 mt-2">{summary.total_weighings}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Anak Baru</p>
                                        <p className="text-3xl font-bold text-gray-800 mt-2">{summary.new_children}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Anak Aktif</p>
                                        <p className="text-3xl font-bold text-gray-800 mt-2">{summary.total_active_children}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Periode</p>
                                        <p className="text-sm font-medium text-gray-800 mt-2">
                                            {new Date(summary.period.from).toLocaleDateString('id-ID')}
                                        </p>
                                        <p className="text-xs text-gray-500">s/d</p>
                                        <p className="text-sm font-medium text-gray-800">
                                            {new Date(summary.period.to).toLocaleDateString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Breakdown */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribusi Status Gizi</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                {Object.entries(summary.children_by_status).map(([status, count]) => (
                                    <div key={status} className={`p-4 rounded-lg ${getStatusColor(status)}`}>
                                        <p className="text-xs font-medium">{getStatusLabel(status)}</p>
                                        <p className="text-2xl font-bold mt-1">{count}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Export Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Unduh Data</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={handleExportChildren}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download Data Anak (CSV)
                        </button>

                        <button
                            onClick={handleExportWeighings}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download Riwayat Penimbangan (CSV)
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                        * Download riwayat penimbangan akan menggunakan rentang tanggal yang dipilih di atas
                    </p>
                </div>
            </div>
        </div>
    );
}
