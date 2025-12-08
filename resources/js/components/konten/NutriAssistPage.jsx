import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import { formatAge } from "../../lib/utils";
import PageHeader from "../ui/PageHeader";
import NutriAssistSkeleton from "../loading/NutriAssistSkeleton";
import { useDataCache } from "../../contexts/DataCacheContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChefHat,
  Utensils,
  Calendar,
  FileText,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Search,
  ArrowRight,
  Leaf,
  Baby,
  Loader2,
  ChevronDown,
  Check,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// TODO: Integrate with AI/n8n for advanced recommendations in future version

export default function NutriAssistPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());
  const [ingredients, setIngredients] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [recommendations, setRecommendations] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [expandedCardIndex, setExpandedCardIndex] = useState(null);
  const { getCachedData, setCachedData } = useDataCache();

  useEffect(() => {
    fetchChildren();

    // Load cached recommendations if available
    const cachedRecommendations = getCachedData('nutriAssistRecommendations');
    if (cachedRecommendations) {
      setRecommendations(cachedRecommendations);
    }
  }, []);

  useEffect(() => {
    if (recommendations) {
      // Trigger animation after recommendations are set
      setTimeout(() => setShowRecommendations(true), 100);
    } else {
      setShowRecommendations(false);
    }
  }, [recommendations]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first (reuse children cache)
      const cachedData = getCachedData('children');
      if (cachedData) {
        setChildren(cachedData);
        if (cachedData.length > 0) {
          setSelectedChildId(cachedData[0].id.toString());
        }
        setLoading(false);
        return;
      }

      // Fetch from API if no cache
      const response = await api.get('/parent/children');
      const data = response.data.data;
      setChildren(data);
      setCachedData('children', data);

      // Auto-select first child if available
      if (data.length > 0) {
        setSelectedChildId(data[0].id.toString());
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
      // Don't clear recommendations here - keep them until new results arrive

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
      let newRecommendations = response.data.data;

      // Handle array response from n8n (it returns [{success: true, data: {...}}])
      if (Array.isArray(newRecommendations) && newRecommendations.length > 0) {
        newRecommendations = newRecommendations[0].data;
      }

      // Debug: Log the response structure
      console.log('Nutri-Assist Response:', newRecommendations);
      console.log('Recommendations array:', newRecommendations?.recommendations);

      // Normalize the recommendations structure
      if (newRecommendations?.recommendations) {
        newRecommendations.recommendations = newRecommendations.recommendations.map((rec, index) => {
          // Calculate match percentage if not provided
          let matchPercentage = rec.match_percentage || 0;

          if (!matchPercentage && rec.ingredients && payload.ingredients) {
            const recIngredientsLower = rec.ingredients.map(i => i.toLowerCase());
            const providedIngredientsLower = payload.ingredients.map(i => i.toLowerCase());
            const matchedCount = recIngredientsLower.filter(ing =>
              providedIngredientsLower.some(provided =>
                ing.includes(provided) || provided.includes(ing)
              )
            ).length;
            matchPercentage = (matchedCount / rec.ingredients.length) * 100;
          }

          return {
            ...rec,
            match_percentage: matchPercentage,
            // Normalize nutrition data
            calories: rec.nutrition?.calories || rec.calories || 0,
            protein: rec.nutrition?.protein || rec.protein || 0,
            carbs: rec.nutrition?.carbs || rec.carbs || 0,
            fat: rec.nutrition?.fat || rec.fat || 0,
          };
        });
      }

      setRecommendations(newRecommendations);
      setCachedData('nutriAssistRecommendations', newRecommendations);
      setExpandedCardIndex(null);

      // Scroll to recommendations smoothly
      setTimeout(() => {
        document.getElementById('recommendations-section')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 200);
    } catch (err) {
      console.error('Nutri-assist error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });

      if (err.response?.status === 403) {
        setError('Anda tidak memiliki akses untuk mendapatkan rekomendasi untuk anak ini.');
      } else if (err.response?.status === 404) {
        setError('Data anak tidak ditemukan.');
      } else {
        const errorMessage = err.response?.data?.message || 'Gagal mendapatkan rekomendasi. Silakan coba lagi.';
        setError(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state (initial fetch)
  if (loading) {
    return <NutriAssistSkeleton />;
  }

  return (
    <div className="flex flex-col flex-1 w-full h-full overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-50"
      >
        <PageHeader title="Nutri-Assist" subtitle="SMART MEAL PLANNER" />
      </motion.div>

      <div className="flex-1 w-full overflow-y-auto custom-scrollbar no-scrollbar md:scrollbar-auto">
        <div className="w-full p-4 md:p-8 lg:p-10">
          <div className="mb-8">
            <p className="text-gray-500 mt-2 max-w-2xl text-lg">
              Asisten pintar yang membantu Anda meracik menu bergizi dari bahan yang tersedia di rumah.
            </p>
          </div>

          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-full">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <p className="text-red-800 font-medium">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="p-2 hover:bg-red-100 rounded-full transition-colors text-red-500"
                  >
                    <ArrowRight className="w-5 h-5 rotate-45" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {children.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl text-center"
            >
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Baby className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Belum Ada Data Anak</h3>
              <p className="text-gray-500 max-w-md mb-8">
                Silakan daftarkan anak Anda terlebih dahulu untuk mulai menggunakan fitur Nutri-Assist dan dapatkan rekomendasi menu terbaik.
              </p>
              <button className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95">
                Daftarkan Anak
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* Left Column: Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-5 space-y-6 relative z-20"
              >
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/50 shadow-xl relative">
                  {/* Decorative Background Element */}
                  <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl" />
                  </div>

                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 text-white">
                      <ChefHat className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Racik Menu</h2>
                      <p className="text-sm text-gray-500">Isi detail untuk rekomendasi</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                    {/* Select Child */}
                    <div className="space-y-2">
                      <label htmlFor="child" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Baby className="w-4 h-4 text-blue-500" />
                        Pilih Anak
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-left text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                          disabled={submitting}
                        >
                          <span className={!selectedChildId ? "text-gray-500" : "font-medium"}>
                            {selectedChildId
                              ? (() => {
                                const child = children.find(c => c.id.toString() === selectedChildId);
                                return child ? `${child.full_name} (${formatAge(child.age_in_months)})` : "-- Pilih Anak --";
                              })()
                              : "-- Pilih Anak --"}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                        </button>

                        <AnimatePresence>
                          {isDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              className="absolute z-50 w-full mt-2 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar"
                            >
                              {children.length === 0 ? (
                                <div className="px-4 py-3 text-gray-500 text-center text-sm">
                                  Tidak ada data anak
                                </div>
                              ) : (
                                children.map((child) => (
                                  <div
                                    key={child.id}
                                    onClick={() => {
                                      setSelectedChildId(child.id.toString());
                                      setIsDropdownOpen(false);
                                    }}
                                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors flex items-center justify-between group border-b border-gray-50 last:border-0"
                                  >
                                    <span className={`text-sm ${selectedChildId === child.id.toString() ? 'text-blue-700 font-semibold' : 'text-gray-700 font-medium group-hover:text-blue-700'}`}>
                                      {child.full_name} <span className="text-gray-400 font-normal ml-1">({formatAge(child.age_in_months)})</span>
                                    </span>
                                    {selectedChildId === child.id.toString() && (
                                      <Check className="w-4 h-4 text-blue-600" />
                                    )}
                                  </div>
                                ))
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Backdrop to close dropdown when clicking outside */}
                        {isDropdownOpen && (
                          <div
                            className="fixed inset-0 z-40 bg-transparent"
                            onClick={() => setIsDropdownOpen(false)}
                          />
                        )}
                      </div>
                    </div>

                    {/* Ingredients Input */}
                    <div className="space-y-2">
                      <label htmlFor="ingredients" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-green-500" />
                        Bahan Tersedia
                      </label>
                      <div className="relative">
                        <textarea
                          id="ingredients"
                          value={ingredients}
                          onChange={(e) => setIngredients(e.target.value)}
                          placeholder="Contoh: beras, ayam, wortel, bayam..."
                          rows={4}
                          className="w-full p-4 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none placeholder:text-gray-400"
                          required
                          disabled={submitting}
                        />
                        <div className="absolute bottom-3 right-3">
                          <div className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                            Pisahkan dengan koma
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Date Input */}
                      <div className="space-y-2 relative">
                        <label htmlFor="date" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-purple-500" />
                          Tanggal
                        </label>

                        <button
                          type="button"
                          onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-left text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all flex items-center justify-between hover:bg-gray-50"
                          disabled={submitting}
                        >
                          <span className={!date ? "text-gray-400" : ""}>
                            {date ? new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "dd/mm/yyyy"}
                          </span>
                          <Calendar className="w-4 h-4 text-gray-400" />
                        </button>

                        <AnimatePresence>
                          {isDatePickerOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-40 bg-transparent"
                                onClick={() => setIsDatePickerOpen(false)}
                              />
                              <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="absolute z-50 bottom-full mb-2 p-4 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl w-full max-w-[320px]"
                              >
                                {/* Calendar Header */}
                                <div className="flex items-center justify-between mb-4">
                                  <button
                                    type="button"
                                    onClick={() => setPickerDate(prev => {
                                      const next = new Date(prev);
                                      next.setMonth(next.getMonth() - 1);
                                      return next;
                                    })}
                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                  >
                                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                                  </button>
                                  <span className="font-semibold text-gray-800">
                                    {pickerDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setPickerDate(prev => {
                                      const next = new Date(prev);
                                      next.setMonth(next.getMonth() + 1);
                                      return next;
                                    })}
                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                  >
                                    <ChevronRight className="w-5 h-5 text-gray-600" />
                                  </button>
                                </div>

                                {/* Days Header */}
                                <div className="grid grid-cols-7 mb-2">
                                  {['Mg', 'Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb'].map((day) => (
                                    <div key={day} className="text-xs font-medium text-gray-400 text-center py-1">
                                      {day}
                                    </div>
                                  ))}
                                </div>

                                {/* Calendar Grid */}
                                <div className="grid grid-cols-7 gap-1">
                                  {(() => {
                                    const daysInMonth = new Date(pickerDate.getFullYear(), pickerDate.getMonth() + 1, 0).getDate();
                                    const firstDay = new Date(pickerDate.getFullYear(), pickerDate.getMonth(), 1).getDay();
                                    const days = [];

                                    // Empty slots for previous month
                                    for (let i = 0; i < firstDay; i++) {
                                      days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
                                    }

                                    // Days of current month
                                    for (let i = 1; i <= daysInMonth; i++) {
                                      const currentDateStr = `${pickerDate.getFullYear()}-${String(pickerDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                                      const isSelected = date === currentDateStr;
                                      const isToday = new Date().toISOString().split('T')[0] === currentDateStr;

                                      days.push(
                                        <button
                                          key={i}
                                          type="button"
                                          onClick={() => {
                                            setDate(currentDateStr);
                                            setIsDatePickerOpen(false);
                                          }}
                                          className={`w-8 h-8 text-sm rounded-full flex items-center justify-center transition-all
                                            ${isSelected
                                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                                              : isToday
                                                ? 'text-blue-600 font-bold bg-blue-50'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                          {i}
                                        </button>
                                      );
                                    }
                                    return days;
                                  })()}
                                </div>

                                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDate("");
                                      setIsDatePickerOpen(false);
                                    }}
                                    className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                                  >
                                    Clear
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const today = new Date();
                                      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                                      setDate(todayStr);
                                      setPickerDate(today);
                                      setIsDatePickerOpen(false);
                                    }}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                                  >
                                    Today
                                  </button>
                                </div>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Notes Input */}
                      <div className="space-y-2">
                        <label htmlFor="notes" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-orange-500" />
                          Catatan
                        </label>
                        <input
                          type="text"
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Alergi, dll..."
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          disabled={submitting}
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full mt-4 group relative overflow-hidden px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                      <div className="relative flex items-center justify-center gap-2">
                        {submitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Meracik Menu...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5" />
                            <span>Buat Rekomendasi</span>
                          </>
                        )}
                      </div>
                    </button>
                  </form>
                </div>
              </motion.div>

              {/* Right Column: Results */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-7 relative z-10"
              >
                {!recommendations ? (
                  <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white/40 backdrop-blur-md rounded-3xl border border-white/40 border-dashed">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                      <Utensils className="w-12 h-12 text-blue-400/50" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Siap Meracik Menu?</h3>
                    <p className="text-gray-500 max-w-sm">
                      Masukkan bahan-bahan yang Anda miliki di panel sebelah kiri, dan kami akan menyarankan menu terbaik untuk si kecil.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="bg-green-100 text-green-700 p-2 rounded-lg">
                          <CheckCircle2 className="w-5 h-5" />
                        </span>
                        Hasil Rekomendasi
                      </h3>
                      <span className="text-sm text-gray-500 bg-white/50 px-3 py-1 rounded-full border border-gray-200">
                        Untuk: {recommendations.child.full_name}
                      </span>
                    </div>

                    {recommendations.recommendations.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/70 backdrop-blur-xl rounded-3xl p-10 text-center border border-white/50 shadow-lg"
                      >
                        <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Tidak Ada Menu yang Cocok</h4>
                        <p className="text-gray-500">
                          Maaf, kami tidak menemukan menu yang cocok dengan kombinasi bahan tersebut. Coba tambahkan bahan umum lainnya.
                        </p>
                      </motion.div>
                    ) : (
                      <div className="space-y-4">
                        {recommendations.recommendations.map((rec, index) => {
                          const isBest = index === 0 && rec.match_percentage >= 50;

                          // Safe access to menu data with fallbacks
                          const menuName = rec.menu?.name || rec.name || 'Menu Tidak Diketahui';
                          const menuCalories = rec.menu?.calories || rec.calories || 0;
                          const menuProtein = rec.menu?.protein || rec.protein || 0;
                          const menuDescription = rec.menu?.description || rec.description || 'Tidak ada deskripsi';
                          const matchPercentage = rec.match_percentage || 0;
                          const matchedIngredients = rec.matched_ingredients || [];

                          return (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-xl ${isBest
                                ? 'bg-gradient-to-br from-white to-blue-50/50 border-blue-200 shadow-lg shadow-blue-100'
                                : 'bg-white/80 border-white/60 hover:border-blue-200 shadow-sm'
                                }`}
                            >
                              {isBest && (
                                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10">
                                  BEST MATCH
                                </div>
                              )}

                              <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <h4 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                                      {menuName}
                                    </h4>
                                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                                      <span className="flex items-center gap-1 bg-orange-50 text-orange-700 px-2 py-0.5 rounded-md border border-orange-100">
                                        <span className="font-bold">{menuCalories}</span> kcal
                                      </span>
                                      <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100">
                                        <span className="font-bold">{menuProtein}g</span> Protein
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex flex-col items-end">
                                    <div className={`text-lg font-bold ${matchPercentage >= 70 ? 'text-green-600' :
                                      matchPercentage >= 50 ? 'text-yellow-600' : 'text-gray-400'
                                      }`}>
                                      {matchPercentage.toFixed(0)}%
                                    </div>
                                    <div className="text-xs text-gray-400">Kecocokan</div>
                                  </div>
                                </div>

                                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                                  {menuDescription}
                                </p>

                                {matchedIngredients && matchedIngredients.length > 0 && (
                                  <div className="pt-4 border-t border-gray-100">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                      Bahan Terpakai
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {matchedIngredients.map((ingredient, idx) => (
                                        <span
                                          key={idx}
                                          className="px-2.5 py-1 bg-green-100/50 text-green-700 text-xs font-medium rounded-lg border border-green-100 flex items-center gap-1"
                                        >
                                          <CheckCircle2 className="w-3 h-3" />
                                          {ingredient}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Expand/Collapse Button */}
                                <button
                                  onClick={() => setExpandedCardIndex(expandedCardIndex === index ? null : index)}
                                  className="w-full mt-4 py-2 px-4 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-blue-700 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200"
                                >
                                  {expandedCardIndex === index ? (
                                    <>
                                      <ChevronDown className="w-4 h-4 rotate-180 transition-transform" />
                                      Sembunyikan Detail
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="w-4 h-4 transition-transform" />
                                      Lihat Resep Lengkap
                                    </>
                                  )}
                                </button>

                                {/* Expanded Content */}
                                <AnimatePresence>
                                  {expandedCardIndex === index && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.3 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                                        {/* Full Ingredients List */}
                                        {rec.ingredients && rec.ingredients.length > 0 && (
                                          <div>
                                            <h5 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                                              <Leaf className="w-4 h-4 text-green-600" />
                                              Bahan-Bahan Lengkap
                                            </h5>
                                            <ul className="space-y-1">
                                              {rec.ingredients.map((ing, idx) => (
                                                <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                                  <span className="text-blue-500 mt-1">•</span>
                                                  <span>{ing}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}

                                        {/* Instructions */}
                                        {rec.instructions && (
                                          <div>
                                            <h5 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                                              <ChefHat className="w-4 h-4 text-orange-600" />
                                              Cara Membuat
                                            </h5>
                                            <div className="text-sm text-gray-600 whitespace-pre-line leading-relaxed bg-gray-50 p-3 rounded-lg">
                                              {rec.instructions}
                                            </div>
                                          </div>
                                        )}

                                        {/* Nutrition Details */}
                                        {(rec.carbs || rec.fat) && (
                                          <div>
                                            <h5 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                                              <Utensils className="w-4 h-4 text-purple-600" />
                                              Informasi Gizi Lengkap
                                            </h5>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                              <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                                                <div className="text-xs text-orange-600 font-medium">Kalori</div>
                                                <div className="text-lg font-bold text-orange-700">{menuCalories}</div>
                                                <div className="text-xs text-orange-500">kcal</div>
                                              </div>
                                              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                                <div className="text-xs text-blue-600 font-medium">Protein</div>
                                                <div className="text-lg font-bold text-blue-700">{menuProtein}</div>
                                                <div className="text-xs text-blue-500">gram</div>
                                              </div>
                                              {rec.carbs > 0 && (
                                                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                                  <div className="text-xs text-yellow-600 font-medium">Karbohidrat</div>
                                                  <div className="text-lg font-bold text-yellow-700">{rec.carbs}</div>
                                                  <div className="text-xs text-yellow-500">gram</div>
                                                </div>
                                              )}
                                              {rec.fat > 0 && (
                                                <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                                                  <div className="text-xs text-green-600 font-medium">Lemak</div>
                                                  <div className="text-lg font-bold text-green-700">{rec.fat}</div>
                                                  <div className="text-xs text-green-500">gram</div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        )}

                                        {/* Additional Info */}
                                        <div className="grid grid-cols-2 gap-3">
                                          {rec.portion && (
                                            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                                              <div className="text-xs text-purple-600 font-medium mb-1">Porsi</div>
                                              <div className="text-sm font-bold text-purple-700">{rec.portion}</div>
                                            </div>
                                          )}
                                          {rec.meal_type && (
                                            <div className="bg-pink-50 p-3 rounded-lg border border-pink-100">
                                              <div className="text-xs text-pink-600 font-medium mb-1">Waktu Makan</div>
                                              <div className="text-sm font-bold text-pink-700 capitalize">{rec.meal_type.replace(/_/g, ' ')}</div>
                                            </div>
                                          )}
                                        </div>

                                        {/* Notes */}
                                        {rec.notes && (
                                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                            <h5 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
                                              <AlertCircle className="w-4 h-4" />
                                              Catatan Penting
                                            </h5>
                                            <p className="text-sm text-blue-700 leading-relaxed">{rec.notes}</p>
                                          </div>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
