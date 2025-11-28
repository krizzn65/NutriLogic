import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import GenericFormSkeleton from "../loading/GenericFormSkeleton";
import PageHeader from "../dashboard/PageHeader";

export default function CreateConsultation() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [children, setChildren] = useState([]);
  const [title, setTitle] = useState("");
  const [selectedChildId, setSelectedChildId] = useState("");
  const [selectedKaderId, setSelectedKaderId] = useState("");

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/parent/children');
      setChildren(response.data.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Gagal memuat data anak. Silakan coba lagi.';
      setError(errorMessage);
      console.error('Children fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Judul konsultasi harus diisi.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        title: title.trim(),
      };

      if (selectedChildId) {
        payload.child_id = parseInt(selectedChildId);
      }

      if (selectedKaderId) {
        payload.kader_id = parseInt(selectedKaderId);
      }

      const response = await api.post('/parent/consultations', payload);

      // Navigate to consultation detail
      navigate(`/dashboard/konsultasi/${response.data.data.id}`);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Anda tidak memiliki akses untuk membuat konsultasi.');
      } else {
        const errorMessage = err.response?.data?.message || 'Gagal membuat konsultasi. Silakan coba lagi.';
        setError(errorMessage);
      }
      console.error('Create consultation error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return <GenericFormSkeleton fieldCount={3} />;
  }

  return (
    <div className="flex flex-1 w-full h-full overflow-auto">
      <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-6">

        {/* Header */}
        <PageHeader title="Buat Konsultasi Baru" subtitle="Portal Orang Tua">
          <button
            onClick={() => navigate('/dashboard/konsultasi')}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </PageHeader>

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
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Judul Konsultasi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Pertanyaan tentang MPASI untuk anak 8 bulan"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={submitting}
                maxLength={255}
              />
              <p className="mt-1 text-xs text-gray-500">
                Jelaskan topik atau pertanyaan yang ingin Anda konsultasikan
              </p>
            </div>

            {/* Child Selection (Optional) */}
            <div>
              <label htmlFor="child" className="block text-sm font-medium text-gray-700 mb-2">
                Anak (Opsional)
              </label>
              <select
                id="child"
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={submitting}
              >
                <option value="">-- Pilih Anak (Opsional) --</option>
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.full_name} ({child.age_in_months} bulan)
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Pilih anak jika konsultasi terkait dengan anak tertentu. Kader akan otomatis di-assign dari posyandu anak.
              </p>
            </div>

            {/* Kader Selection (Optional) */}
            <div>
              <label htmlFor="kader" className="block text-sm font-medium text-gray-700 mb-2">
                Kader (Opsional)
              </label>
              <input
                type="text"
                id="kader"
                placeholder="Akan di-assign otomatis jika memilih anak"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                disabled
              />
              <p className="mt-1 text-xs text-gray-500">
                Kader akan otomatis di-assign dari posyandu anak yang dipilih. Jika tidak memilih anak, konsultasi akan dibuat tanpa kader.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard/konsultasi')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Membuat...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Buat Konsultasi</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

