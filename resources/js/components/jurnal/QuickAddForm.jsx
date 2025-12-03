import React, { useState, useRef, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../lib/api';

const QuickAddForm = memo(function QuickAddForm({ childId, onSuccess }) {
    const [formData, setFormData] = useState({
        time_of_day: 'pagi',
        description: '',
        ingredients: '',
        portion: 'habis',
        notes: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    
    const descriptionRef = useRef(null);

    const timeOptions = [
        { value: 'pagi', label: '🌅 Pagi', emoji: '🌅' },
        { value: 'siang', label: '🌞 Siang', emoji: '🌞' },
        { value: 'malam', label: '🌙 Malam', emoji: '🌙' },
        { value: 'snack', label: '🍪 Snack', emoji: '🍪' },
    ];

    const portionOptions = [
        { value: 'habis', label: 'Habis', color: 'bg-green-100 text-green-800 border-green-300', hoverColor: 'hover:bg-green-50' },
        { value: 'setengah', label: 'Setengah', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', hoverColor: 'hover:bg-yellow-50' },
        { value: 'sedikit', label: 'Sedikit', color: 'bg-orange-100 text-orange-800 border-orange-300', hoverColor: 'hover:bg-orange-50' },
        { value: 'tidak_mau', label: 'Tidak Mau', color: 'bg-red-100 text-red-800 border-red-300', hoverColor: 'hover:bg-red-50' },
    ];

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!formData.description.trim()) {
            setError('Nama makanan harus diisi');
            // Focus on the description field for better UX
            if (descriptionRef.current) {
                descriptionRef.current.focus();
            }
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            await api.post('/meal-logs', {
                child_id: childId,
                eaten_at: new Date().toISOString().split('T')[0], // Today's date
                time_of_day: formData.time_of_day,
                description: formData.description,
                ingredients: formData.ingredients || null,
                portion: formData.portion,
                notes: formData.notes || null,
                source: 'ortu',
            });

            // Show success animation
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2500);

            // Reset form
            setFormData({
                time_of_day: 'pagi',
                description: '',
                ingredients: '',
                portion: 'habis',
                notes: '',
            });

            // Notify parent component
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error('Error adding meal log:', err);
            setError(err.response?.data?.message || 'Gagal menyimpan data. Silakan coba lagi.');
        } finally {
            setSubmitting(false);
        }
    }, [childId, formData, onSuccess]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl p-6 md:p-8 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow duration-300"
            aria-labelledby="quick-add-heading"
        >
            {/* Enhanced Header with better visual hierarchy */}
            <div className="flex items-center gap-3 mb-6 md:mb-8 pb-4 border-b-2 border-blue-100">
                <motion.div 
                    className="p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-md"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                >
                    <Plus className="w-6 h-6 text-white" aria-hidden="true" />
                </motion.div>
                <div>
                    <h3 id="quick-add-heading" className="text-xl md:text-2xl font-bold text-gray-900">Tambah Makanan</h3>
                    <p className="text-xs md:text-sm text-gray-600 mt-0.5">Catat makanan anak hari ini</p>
                </div>
            </div>

            <motion.form 
                onSubmit={handleSubmit} 
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                aria-label="Form tambah makanan"
            >

                {/* Time of Day - Enhanced with better visual hierarchy */}
                <motion.div variants={itemVariants} className="space-y-3">
                    <label className="block text-sm md:text-base font-bold text-gray-900 mb-3">
                        Waktu Makan
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {timeOptions.map((option) => (
                            <motion.button
                                key={option.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, time_of_day: option.value })}
                                whileHover={{ scale: 1.05, y: -3 }}
                                whileTap={{ scale: 0.95 }}
                                aria-label={`Pilih waktu makan ${option.label.replace(option.emoji, '').trim()}`}
                                aria-pressed={formData.time_of_day === option.value}
                                className={`min-h-[44px] p-3 md:p-4 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-600 focus:ring-offset-2 ${formData.time_of_day === option.value
                                    ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-900 font-bold shadow-lg ring-2 ring-blue-200'
                                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md active:bg-blue-100'
                                    }`}
                            >
                                <div className="text-2xl md:text-3xl mb-1">{option.emoji}</div>
                                <div className="text-xs md:text-sm font-semibold">{option.label.replace(option.emoji, '').trim()}</div>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Food Name - Enhanced focus states */}
                <motion.div variants={itemVariants} className="space-y-3">
                    <label className="block text-sm md:text-base font-bold text-gray-900 mb-3">
                        Nama Makanan <span className="text-red-600 font-bold">*</span>
                    </label>
                    <div className="relative">
                        <input
                            ref={descriptionRef}
                            id="meal-description"
                            type="text"
                            value={formData.description}
                            onChange={(e) => {
                                setFormData({ ...formData, description: e.target.value });
                                if (error) setError(null); // Clear error on input
                            }}
                            onFocus={() => setFocusedField('description')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="Contoh: Bubur Ayam, Nasi Tim, dll"
                            inputMode="text"
                            aria-required="true"
                            aria-invalid={error && !formData.description.trim()}
                            aria-describedby={error && !formData.description.trim() ? "description-error" : undefined}
                            className={`w-full min-h-[44px] px-4 py-3 md:py-3.5 text-base md:text-lg border-2 rounded-xl transition-all duration-200 shadow-sm focus:outline-none ${
                                error && !formData.description.trim()
                                    ? 'border-red-400 bg-red-50 focus:ring-4 focus:ring-red-200 focus:border-red-500'
                                    : focusedField === 'description'
                                    ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-200 shadow-md'
                                    : 'border-gray-300 bg-white hover:border-blue-400 focus:ring-4 focus:ring-blue-200 focus:border-blue-500'
                            }`}
                        />
                        {focusedField === 'description' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600"
                            >
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Ingredients (Optional) - Enhanced focus states */}
                <motion.div variants={itemVariants} className="space-y-3">
                    <label className="block text-sm md:text-base font-bold text-gray-900 mb-3">
                        Bahan-bahan <span className="text-gray-500 text-xs md:text-sm font-medium">(Opsional)</span>
                    </label>
                    <div className="relative">
                        <input
                            id="meal-ingredients"
                            type="text"
                            value={formData.ingredients}
                            onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                            onFocus={() => setFocusedField('ingredients')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="Contoh: Beras, Ayam, Wortel"
                            inputMode="text"
                            aria-label="Bahan-bahan makanan (opsional)"
                            className={`w-full min-h-[44px] px-4 py-3 md:py-3.5 text-base md:text-lg border-2 rounded-xl transition-all duration-200 shadow-sm focus:outline-none ${
                                focusedField === 'ingredients'
                                    ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-200 shadow-md'
                                    : 'border-gray-300 bg-white hover:border-blue-400 focus:ring-4 focus:ring-blue-200 focus:border-blue-500'
                            }`}
                        />
                        {focusedField === 'ingredients' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600"
                            >
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Portion - Enhanced button states */}
                <motion.div variants={itemVariants} className="space-y-3">
                    <label className="block text-sm md:text-base font-bold text-gray-900 mb-3">
                        Porsi
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {portionOptions.map((option) => (
                            <motion.button
                                key={option.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, portion: option.value })}
                                whileHover={{ scale: 1.05, y: -3 }}
                                whileTap={{ scale: 0.95 }}
                                aria-label={`Pilih porsi ${option.label}`}
                                aria-pressed={formData.portion === option.value}
                                className={`min-h-[44px] p-3 md:p-4 rounded-xl border-2 transition-all duration-200 font-semibold text-sm md:text-base focus:outline-none focus:ring-4 focus:ring-blue-600 focus:ring-offset-2 ${formData.portion === option.value
                                    ? `${option.color} shadow-lg ring-2 ring-offset-1`
                                    : `border-gray-200 bg-white text-gray-700 ${option.hoverColor} hover:border-gray-300 hover:shadow-md active:shadow-sm`
                                    }`}
                            >
                                {option.label}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Notes - Enhanced focus states */}
                <motion.div variants={itemVariants} className="space-y-3">
                    <label className="block text-sm md:text-base font-bold text-gray-900 mb-3">
                        Catatan <span className="text-gray-500 text-xs md:text-sm font-medium">(Opsional)</span>
                    </label>
                    <div className="relative">
                        <textarea
                            id="meal-notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            onFocus={() => setFocusedField('notes')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="Contoh: Anak makan dengan lahap, suka sekali"
                            rows={3}
                            maxLength={500}
                            aria-label="Catatan tambahan (opsional)"
                            aria-describedby="notes-counter"
                            className={`w-full px-4 py-3 md:py-3.5 text-base md:text-lg border-2 rounded-xl transition-all duration-200 resize-none shadow-sm focus:outline-none ${
                                focusedField === 'notes'
                                    ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-200 shadow-md'
                                    : 'border-gray-300 bg-white hover:border-blue-400 focus:ring-4 focus:ring-blue-200 focus:border-blue-500'
                            }`}
                        />
                        {focusedField === 'notes' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute right-3 top-3 text-blue-600"
                            >
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                            </motion.div>
                        )}
                    </div>
                    <div 
                        id="notes-counter"
                        className={`text-xs md:text-sm mt-2 text-right font-semibold transition-colors ${
                            formData.notes.length > 450 ? 'text-orange-600' : 'text-gray-500'
                        }`}
                        aria-live="polite"
                    >
                        {formData.notes.length}/500
                    </div>
                </motion.div>

                {/* Error Message - Enhanced styling */}
                <AnimatePresence>
                    {error && (
                        <motion.div 
                            id="description-error"
                            role="alert"
                            aria-live="assertive"
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-400 text-red-900 px-4 py-3.5 rounded-xl text-sm md:text-base font-bold shadow-lg flex items-center gap-3"
                        >
                            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" aria-hidden="true" />
                            <span>{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Success Message - Enhanced animation */}
                <AnimatePresence>
                    {showSuccess && (
                        <motion.div
                            role="status"
                            aria-live="polite"
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ 
                                opacity: 1, 
                                scale: 1, 
                                y: 0,
                                transition: {
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 20
                                }
                            }}
                            exit={{ 
                                opacity: 0, 
                                scale: 0.8,
                                transition: { duration: 0.2 }
                            }}
                            className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-400 text-green-900 px-4 py-3.5 rounded-xl text-sm md:text-base font-bold shadow-lg flex items-center gap-3"
                        >
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ 
                                    scale: 1, 
                                    rotate: 0,
                                    transition: {
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 15,
                                        delay: 0.1
                                    }
                                }}
                            >
                                <CheckCircle2 className="w-5 h-5 text-green-600" aria-hidden="true" />
                            </motion.div>
                            <span>Data berhasil disimpan!</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Submit Button - Enhanced hover and active states */}
                <motion.div variants={itemVariants}>
                    <motion.button
                        type="submit"
                        disabled={submitting}
                        whileHover={{ scale: submitting ? 1 : 1.02, y: submitting ? 0 : -2 }}
                        whileTap={{ scale: submitting ? 1 : 0.98 }}
                        className={`w-full min-h-[52px] md:min-h-[56px] bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 text-white py-4 rounded-xl text-base md:text-lg font-bold transition-all shadow-lg flex items-center justify-center gap-2.5 ${
                            submitting 
                                ? 'opacity-70 cursor-not-allowed' 
                                : 'hover:from-blue-700 hover:via-blue-800 hover:to-purple-700 hover:shadow-xl active:shadow-md active:from-blue-800 active:to-purple-800'
                        }`}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
                                <span>Menyimpan...</span>
                            </>
                        ) : (
                            <>
                                <Plus className="w-5 h-5 md:w-6 md:h-6" />
                                <span>Simpan</span>
                            </>
                        )}
                    </motion.button>
                </motion.div>
            </motion.form>
        </motion.section>
    );
});

export default QuickAddForm;
