import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import GenericListSkeleton from "../loading/GenericListSkeleton";
import { useDataCache } from "../../contexts/DataCacheContext";

export default function ConsultationList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();
  const { getCachedData, setCachedData } = useDataCache();

  useEffect(() => {
    fetchConsultations(filterStatus);
  }, [filterStatus]);

  const fetchConsultations = async (status = "all") => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first (cache key includes filter status)
      const cacheKey = `consultations_${status}`;
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        setConsultations(cachedData);
        setLoading(false);
        return;
      }

      // Fetch from API if no cache
      const params = status !== "all" ? { status } : {};
      const response = await api.get('/parent/consultations', { params });
      const data = response.data.data;
      setConsultations(data);
      setCachedData(cacheKey, data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Gagal memuat data konsultasi. Silakan coba lagi.';
      setError(errorMessage);
      console.error('Consultations fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;

    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Loading state
  if (loading) {
    return <GenericListSkeleton itemCount={5} />;
  }

  return (
    <div className="flex flex-1 w-full h-full overflow-auto">
      <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Konsultasi</h1>
            <p className="text-gray-600 mt-2">Komunikasi dengan kader seputar gizi dan kesehatan anak</p>
          </div>
          <button
            onClick={() => navigate('/dashboard/konsultasi/create')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Buat Konsultasi Baru
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 font-medium transition-colors ${filterStatus === 'all'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilterStatus('open')}
            className={`px-4 py-2 font-medium transition-colors ${filterStatus === 'open'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            Aktif
          </button>
          <button
            onClick={() => setFilterStatus('closed')}
            className={`px-4 py-2 font-medium transition-colors ${filterStatus === 'closed'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            Selesai
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-800">{error}</p>
            </div>
            <button
              onClick={() => fetchConsultations(filterStatus)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* List View */}
        {consultations.length === 0 ? (
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-gray-600 mb-4">
              {filterStatus === 'all'
                ? 'Belum ada konsultasi'
                : filterStatus === 'open'
                  ? 'Tidak ada konsultasi aktif'
                  : 'Tidak ada konsultasi selesai'}
            </p>
            {filterStatus === 'all' && (
              <button
                onClick={() => navigate('/dashboard/konsultasi/create')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Buat Konsultasi Pertama
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {consultations.map((consultation) => (
              <div
                key={consultation.id}
                onClick={() => navigate(`/dashboard/konsultasi/${consultation.id}`)}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{consultation.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${consultation.status === 'open'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}>
                        {consultation.status === 'open' ? 'Aktif' : 'Selesai'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {consultation.child && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {consultation.child.full_name}
                        </span>
                      )}
                      {consultation.kader && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {consultation.kader.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {consultation.last_message && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      <span className="font-medium">{consultation.last_message.sender_name}:</span> {consultation.last_message.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(consultation.last_message.created_at)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

