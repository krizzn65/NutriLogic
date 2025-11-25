import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { formatAge } from "../../lib/utils";

export default function AnakPrioritas() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [priorityChildren, setPriorityChildren] = useState([]);
    const [summary, setSummary] = useState(null);
    const [filterReason, setFilterReason] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchPriorityChildren();
    }, []);

    const fetchPriorityChildren = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get('/kader/children/priorities');
            setPriorityChildren(response.data.data);
            setSummary(response.data.summary);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Gagal memuat data anak prioritas. Silakan coba lagi.';
            setError(errorMessage);
            console.error('Priority children fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getReasonBadge = (reason) => {
        const colors = {
            bad_nutritional_status: 'bg-red-100 text-red-800 border-red-300',
            weight_stagnation: 'bg-orange-100 text-orange-800 border-orange-300',
            long_absence: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[reason.type]}`}>
                {reason.label}
            </span>
        );
    };

    const filteredChildren = filterReason
        ? priorityChildren.filter(child =>
            child.priority_reasons.some(r => r.type === filterReason)
        )
        : priorityChildren;

    if (loading) {
        return (
            <div className="flex flex-1 w-full h-full overflow-auto">
                <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-4">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Memuat data anak prioritas...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 w-full h-full overflow-auto">
            <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Anak Prioritas</h1>
                        <p className="text-gray-600 mt-2">Anak yang memerlukan perhatian khusus</p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Kembali
                    </button>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Prioritas</p>
                                    <p className="text-3xl font-bold text-gray-800 mt-2">{summary.total_priority}</p>
                                </div>
                                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                            <p className="text-sm text-gray-600">Status Gizi Buruk</p>
                            <p className="text-2xl font-bold text-red-600 mt-2">{summary.by_reason.bad_nutritional_status}</p>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                            <p className="text-sm text-gray-600">Berat Stagnan</p>
                            <p className="text-2xl font-bold text-orange-600 mt-2">{summary.by_reason.weight_stagnation}</p>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                            <p className="text-sm text-gray-600">Tidak Ditimbang Lama</p>
                            <p className="text-2xl font-bold text-yellow-600 mt-2">{summary.by_reason.long_absence}</p>
                        </div>
                    </div>
                )}

                {/* Filter */}
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4">
                        <label htmlFor="filter" className="text-sm font-medium text-gray-700">
                            Filter berdasarkan:
                        </label>
                        <select
                            id="filter"
                            value={filterReason}
                            onChange={(e) => setFilterReason(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Semua Alasan</option>
                            <option value="bad_nutritional_status">Status Gizi Buruk</option>
                            <option value="weight_stagnation">Berat Stagnan</option>
                            <option value="long_absence">Tidak Ditimbang Lama</option>
                        </select>
                    </div>
                </div>

                {/* Children List */}
                {filteredChildren.length === 0 ? (
                    <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center">
                        <svg className="w-16 h-16 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-gray-800 font-medium mb-2">Tidak Ada Anak Prioritas</p>
                        <p className="text-gray-600">Semua anak dalam kondisi baik!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredChildren.map((child) => (
                            <div
                                key={child.id}
                                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => navigate(`/dashboard/data-anak/${child.id}`)}
                            >
                                {/* Child Info */}
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 font-bold text-lg">
                                            {child.full_name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold text-gray-900 truncate">{child.full_name}</h3>
                                        <p className="text-sm text-gray-600">
                                            {child.gender === 'L' ? 'Laki-laki' : 'Perempuan'} • {formatAge(child.age_in_months)}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">Ibu: {child.parent.name || '-'}</p>
                                    </div>
                                </div>

                                {/* Priority Badges */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {child.priority_reasons.map((reason, index) => (
                                        <div key={index}>
                                            {getReasonBadge(reason)}
                                        </div>
                                    ))}
                                </div>

                                {/* Latest Weighing */}
                                {child.latest_weighing ? (
                                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                        <p className="text-xs text-gray-600 mb-2">Data Terakhir:</p>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <p className="text-gray-600">Berat</p>
                                                <p className="font-medium text-gray-900">{child.latest_weighing.weight_kg} kg</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Tinggi</p>
                                                <p className="font-medium text-gray-900">{child.latest_weighing.height_cm} cm</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            {new Date(child.latest_weighing.measured_at).toLocaleDateString('id-ID')}
                                            {child.days_since_last_weighing !== null && (
                                                <span> ({child.days_since_last_weighing} hari lalu)</span>
                                            )}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                        <p className="text-sm text-gray-600 text-center">Belum ada data penimbangan</p>
                                    </div>
                                )}

                                {/* Action Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/dashboard/data-anak/${child.id}`);
                                    }}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                    Lihat Detail
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
