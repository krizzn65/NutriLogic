import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import GenericFormSkeleton from "../loading/GenericFormSkeleton";
import { useDataCache } from "../../contexts/DataCacheContext";
import { ArrowLeft, MessageSquare, User, AlertCircle, CheckCircle, Users } from "lucide-react";
import { motion } from "framer-motion";
import { formatAge } from "../../lib/utils";

export default function CreateConsultation() {
  const navigate = useNavigate();
  const { invalidateCache } = useDataCache();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [children, setChildren] = useState([]);
  const [kaders, setKaders] = useState([]);
  const [title, setTitle] = useState("");
  const [selectedChildId, setSelectedChildId] = useState("");
  const [selectedKaderId, setSelectedKaderId] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [childrenRes, kadersRes] = await Promise.all([
        api.get('/parent/children'),
        api.get('/parent/kaders')
      ]);

      setChildren(childrenRes.data.data);
      setKaders(kadersRes.data.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Gagal memuat data. Silakan coba lagi.';
      setError(errorMessage);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-select kader when child is selected
  useEffect(() => {
    if (selectedChildId && children.length > 0 && kaders.length > 0) {
      const child = children.find(c => c.id === parseInt(selectedChildId));
      if (child && child.posyandu_id) {
        // Find kader in the same posyandu
        const recommendedKader = kaders.find(k => k.posyandu_id === child.posyandu_id);
        if (recommendedKader) {
          setSelectedKaderId(recommendedKader.id);
        } else {
          // If no kader found in the same posyandu, clear selected kader
          setSelectedKaderId("");
        }
      } else {
        // If child has no posyandu_id or child not found, clear selected kader
        setSelectedKaderId("");
      }
    } else if (!selectedChildId) {
      // If no child is selected, clear selected kader
      setSelectedKaderId("");
    }
  }, [selectedChildId, children, kaders]);

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

      // Invalidate cache to ensure list is updated
      invalidateCache('consultations_all');
      invalidateCache('consultations_open');
      invalidateCache('consultations_closed');

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
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto w-full flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/konsultasi')}
            className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Buat Konsultasi Baru</h1>
            <p className="text-xs text-slate-500">Mulai percakapan dengan kader</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-2xl mx-auto w-full">
          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 mb-6"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-800 text-sm font-medium">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          )}

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title Input */}
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
                  Topik Konsultasi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-3.5 text-slate-400">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Pertanyaan tentang MPASI..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
                    required
                    disabled={submitting}
                    maxLength={255}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Jelaskan secara singkat apa yang ingin Anda tanyakan.
                </p>
              </div>

              {/* Child Selection */}
              <div>
                <label htmlFor="child" className="block text-sm font-semibold text-slate-700 mb-2">
                  Terkait Anak (Opsional)
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-3.5 text-slate-400">
                    <User className="w-5 h-5" />
                  </div>
                  <select
                    id="child"
                    value={selectedChildId}
                    onChange={(e) => setSelectedChildId(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800 appearance-none"
                    disabled={submitting}
                  >
                    <option value="">-- Pilih Anak --</option>
                    {children.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.full_name} ({formatAge(child.age_in_months)})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-3.5 pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Kader akan otomatis disesuaikan dengan posyandu anak, namun Anda dapat mengubahnya.
                </p>
              </div>

              {/* Kader Selection (Dynamic) */}
              <div>
                <label htmlFor="kader" className="block text-sm font-semibold text-slate-700 mb-2">
                  Pilih Kader
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-3.5 text-slate-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <select
                    id="kader"
                    value={selectedKaderId}
                    onChange={(e) => setSelectedKaderId(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800 appearance-none"
                    disabled={submitting}
                  >
                    <option value="">-- Pilih Kader --</option>
                    {kaders.map((kader) => (
                      <option key={kader.id} value={kader.id}>
                        {kader.name} {kader.posyandu ? `(${kader.posyandu.name})` : ''} {kader.is_online ? '🟢 Online' : ''}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-3.5 pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Pilih kader yang ingin Anda ajak berkonsultasi.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/konsultasi')}
                  className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                  disabled={submitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 transform active:scale-95 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <span>Mulai Konsultasi</span>
                      <ArrowLeft className="w-5 h-5 rotate-180" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

