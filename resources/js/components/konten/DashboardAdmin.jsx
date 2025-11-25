import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import { Users, Building2, Baby, UserCog, TrendingUp, AlertTriangle } from "lucide-react";

export default function DashboardAdmin() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/admin/dashboard');
            setStats(response.data.data);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Gagal memuat data dashboard.';
            setError(errorMessage);
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-4 md:p-10 w-full h-full bg-gray-50">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 md:p-10 w-full h-full bg-gray-50">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{error}</p>
                    <button
                        onClick={fetchDashboardData}
                        className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    const statCards = [
        {
            title: "Total Posyandu",
            value: stats?.total_posyandu || 0,
            icon: Building2,
            color: "blue",
            bgColor: "bg-blue-100",
            iconColor: "text-blue-600",
        },
        {
            title: "Total Kader",
            value: stats?.total_kader || 0,
            icon: UserCog,
            color: "green",
            bgColor: "bg-green-100",
            iconColor: "text-green-600",
        },
        {
            title: "Total Orang Tua",
            value: stats?.total_ibu || 0,
            icon: Users,
            color: "purple",
            bgColor: "bg-purple-100",
            iconColor: "text-purple-600",
        },
        {
            title: "Total Anak",
            value: stats?.total_anak || 0,
            icon: Baby,
            color: "orange",
            bgColor: "bg-orange-100",
            iconColor: "text-orange-600",
        },
    ];

    const getStatusColor = (status) => {
        if (status === 'normal') return 'bg-green-100 text-green-800';
        if (status.includes('sangat')) return 'bg-red-100 text-red-800';
        if (status.includes('kurang') || status.includes('kurus') || status.includes('pendek')) {
            return 'bg-orange-100 text-orange-800';
        }
        return 'bg-yellow-100 text-yellow-800';
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

    return (
        <div className="flex flex-1 w-full h-full overflow-auto">
            <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard SuperAdmin</h1>
                    <p className="text-gray-600 mt-2">Ringkasan sistem NutriLogic</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((card, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">{card.title}</p>
                                    <p className="text-3xl font-bold text-gray-800 mt-2">{card.value}</p>
                                </div>
                                <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                                    <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Nutritional Status Distribution */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Distribusi Status Gizi</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {stats?.status_distribution && Object.entries(stats.status_distribution).map(([status, count]) => (
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

                {/* Top Risk Posyandu */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        <h2 className="text-lg font-semibold text-gray-800">
                            Posyandu dengan Anak Berisiko Terbanyak
                        </h2>
                    </div>
                    {stats?.top_risk_posyandu && stats.top_risk_posyandu.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                                            Posyandu
                                        </th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                                            Jumlah Anak Berisiko
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.top_risk_posyandu.map((posyandu, index) => (
                                        <tr key={posyandu.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {index + 1}.
                                                    </span>
                                                    <span className="text-sm text-gray-800">{posyandu.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                    {posyandu.risk_count} anak
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">Tidak ada data anak berisiko</p>
                    )}
                </div>
            </div>
        </div>
    );
}
