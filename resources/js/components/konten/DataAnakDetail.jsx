import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../lib/api";
import { formatAge, getStatusColor, getStatusLabel } from "../../lib/utils";

export default function DataAnakDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [childData, setChildData] = useState(null);

  useEffect(() => {
    if (id) {
      fetchChildDetail(id);
    }
  }, [id]);

  const fetchChildDetail = async (childId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/parent/children/${childId}`);
      setChildData(response.data.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Anda tidak memiliki akses untuk melihat data anak ini.');
      } else if (err.response?.status === 404) {
        setError('Data anak tidak ditemukan.');
      } else {
        const errorMessage = err.response?.data?.message || 'Gagal memuat data anak. Silakan coba lagi.';
        setError(errorMessage);
      }
      console.error('Child detail fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-1 w-full h-full overflow-auto">
        <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat data anak...</p>
            </div>
          </div>
        </div>
      </div>
    );
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
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => navigate('/dashboard/anak')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Kembali ke List
                </button>
                <button
                  onClick={() => fetchChildDetail(id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!childData) {
    return null;
  }

  return (
    <div className="flex flex-1 w-full h-full overflow-auto">
      <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-6">
        {/* Header */}
        <PageHeader title={childData.full_name} subtitle="Portal Orang Tua">
          <button
            onClick={() => navigate('/dashboard/anak')}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </PageHeader>

        {/* Identitas Anak Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Identitas Anak</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nama Lengkap</label>
              <p className="text-gray-900 mt-1">{childData.full_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Umur</label>
              <p className="text-gray-900 mt-1">{formatAge(childData.age_in_months)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Jenis Kelamin</label>
              <p className="text-gray-900 mt-1">
                {childData.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Tanggal Lahir</label>
              <p className="text-gray-900 mt-1">
                {new Date(childData.birth_date).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Posyandu</label>
              <p className="text-gray-900 mt-1">
                {childData.posyandu?.name || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Riwayat Penimbangan Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Riwayat Penimbangan</h2>
          {childData.weighing_logs.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-gray-600">Belum ada data penimbangan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Berat (kg)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tinggi (cm)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status Gizi
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Z-Score HFA
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Z-Score WFA
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Z-Score WFH
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {childData.weighing_logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.measured_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.weight_kg ? `${log.weight_kg} kg` : '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.height_cm ? `${log.height_cm} cm` : '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(log.nutritional_status)}`}>
                          {getStatusLabel(log.nutritional_status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.zscore_hfa !== null ? log.zscore_hfa.toFixed(2) : '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.zscore_wfa !== null ? log.zscore_wfa.toFixed(2) : '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.zscore_wfh !== null ? log.zscore_wfh.toFixed(2) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Log Makanan Section */}
        {childData.meal_logs && childData.meal_logs.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Log Makanan (10 Terakhir)</h2>
            <div className="space-y-3">
              {childData.meal_logs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(log.eaten_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                      {log.time_of_day && (
                        <span className="text-xs text-gray-500">• {log.time_of_day}</span>
                      )}
                    </div>
                    {log.description && (
                      <p className="text-sm text-gray-700">{log.description}</p>
                    )}
                    {log.ingredients && (
                      <p className="text-xs text-gray-500 mt-1">Bahan: {log.ingredients}</p>
                    )}
                    {log.source && (
                      <p className="text-xs text-gray-500 mt-1">Sumber: {log.source}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Jadwal Imunisasi Section */}
        {childData.immunization_schedules && childData.immunization_schedules.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Jadwal Imunisasi</h2>
            <div className="space-y-3">
              {childData.immunization_schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border ${schedule.completed_at
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                    }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{schedule.title}</span>
                      {schedule.completed_at ? (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Selesai
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {schedule.type} • {new Date(schedule.scheduled_for).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    {schedule.completed_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        Selesai: {new Date(schedule.completed_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

