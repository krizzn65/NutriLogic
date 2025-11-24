import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import { formatAge } from "../../lib/utils";

// TODO: Integrate with AI/n8n for advanced recommendations in future version

export default function NutriAssistPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [recommendations, setRecommendations] = useState(null);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/parent/children');
      setChildren(response.data.data);

      // Auto-select first child if available
      if (response.data.data.length > 0) {
        setSelectedChildId(response.data.data[0].id.toString());
      }
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

    // Validation
    if (!selectedChildId) {
      setError('Silakan pilih anak terlebih dahulu.');
      return;
    }

    if (!ingredients.trim()) {
      setError('Silakan masukkan bahan makanan yang tersedia.');
      return;
    }

    // Parse ingredients from string to array
    // Support both comma-separated and newline-separated
    const ingredientsArray = ingredients
      .split(/[,\n]/)
      .map(item => item.trim())
      .filter(item => item.length > 0);

    if (ingredientsArray.length === 0) {
      setError('Silakan masukkan minimal satu bahan makanan.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setRecommendations(null);

      const payload = {
        ingredients: ingredientsArray,
      };

      if (date) {
        payload.date = date;
      }

      if (notes.trim()) {
        payload.notes = notes.trim();
      }

      const response = await api.post(`/parent/children/${selectedChildId}/nutri-assist`, payload);
      setRecommendations(response.data.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Anda tidak memiliki akses untuk mendapatkan rekomendasi untuk anak ini.');
      } else if (err.response?.status === 404) {
        setError('Data anak tidak ditemukan.');
      } else {
        const errorMessage = err.response?.data?.message || 'Gagal mendapatkan rekomendasi. Silakan coba lagi.';
        setError(errorMessage);
      }
      console.error('Nutri-assist submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state (initial fetch)
  if (loading) {
    return (
      <div className="flex flex-1 w-full h-full overflow-auto">
        <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat data...</p>
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
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Nutri-Assist</h1>
          <p className="text-gray-600 mt-2">
            Input bahan makanan yang ada di rumah untuk mendapatkan rekomendasi menu MPASI yang sesuai gizi anak.
          </p>
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
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Empty State - No Children */}
        {children.length === 0 ? (
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-gray-600 mb-4">Belum ada data anak terdaftar</p>
            <p className="text-sm text-gray-500">Silakan daftarkan anak terlebih dahulu untuk menggunakan fitur Nutri-Assist.</p>
          </div>
        ) : (
          <>
            {/* Form Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Form Rekomendasi Menu</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Select Child */}
                <div>
                  <label htmlFor="child" className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih Anak <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="child"
                    value={selectedChildId}
                    onChange={(e) => setSelectedChildId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={submitting}
                  >
                    <option value="">-- Pilih Anak --</option>
                    {children.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.full_name} ({formatAge(child.age_in_months)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ingredients Input */}
                <div>
                  <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 mb-2">
                    Bahan Makanan yang Tersedia <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="ingredients"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    placeholder="Contoh: beras, ayam, wortel, bayam&#10;atau&#10;beras&#10;ayam&#10;wortel&#10;bayam"
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={submitting}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Pisahkan setiap bahan dengan koma atau baris baru. Contoh: beras, ayam, wortel
                  </p>
                </div>

                {/* Date Input (Optional) */}
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal (Opsional)
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={submitting}
                  />
                </div>

                {/* Notes Input (Optional) */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan Khusus (Opsional)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Anak sedang tidak nafsu makan, atau alergi tertentu"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={submitting}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span>Dapatkan Rekomendasi</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Recommendations Section */}
            {recommendations && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Rekomendasi Menu untuk {recommendations.child.full_name}
                </h2>

                {recommendations.recommendations.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-600">Tidak ada rekomendasi menu yang cocok dengan bahan yang tersedia.</p>
                    <p className="text-sm text-gray-500 mt-2">Coba masukkan bahan makanan lain atau konsultasikan dengan kader.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recommendations.recommendations.map((rec, index) => {
                      const isBest = index === 0 && rec.match_percentage >= 50;

                      return (
                        <div
                          key={index}
                          className={`p-5 rounded-lg border-2 ${isBest
                            ? 'bg-blue-50 border-blue-300'
                            : 'bg-gray-50 border-gray-200'
                            }`}
                        >
                          {isBest && (
                            <div className="flex items-center gap-2 mb-3">
                              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="text-sm font-semibold text-blue-800">Rekomendasi Terbaik</span>
                            </div>
                          )}

                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{rec.menu.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${rec.match_percentage >= 70
                              ? 'bg-green-100 text-green-800'
                              : rec.match_percentage >= 50
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                              }`}>
                              {rec.match_percentage.toFixed(1)}% Cocok
                            </span>
                          </div>

                          <p className="text-gray-700 mb-3">{rec.menu.description}</p>

                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span>Kalori: {rec.menu.calories} kcal</span>
                            <span>Protein: {rec.menu.protein} g</span>
                          </div>

                          {rec.matched_ingredients && rec.matched_ingredients.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">Bahan yang Cocok:</p>
                              <div className="flex flex-wrap gap-2">
                                {rec.matched_ingredients.map((ingredient, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                                  >
                                    {ingredient}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

