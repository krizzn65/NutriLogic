import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import api from "../../lib/api";
import CreditCard from "../credit-card-1";
import logoScroll from '../../assets/logo_scroll.svg';
import { assets } from '../../assets/assets';

export default function AddChildModal({ isOpen, onClose, onSuccess, initialData = null }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [posyandus, setPosyandus] = useState([]);
    const [formData, setFormData] = useState({
        full_name: "",
        nik: "",
        birth_date: "",
        gender: "",
        posyandu_id: "",
        birth_weight_kg: "",
        birth_height_cm: "",
        notes: "",
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            fetchPosyandus();
            if (initialData) {
                // Edit mode: populate form with initialData
                setFormData({
                    full_name: initialData.full_name || "",
                    nik: initialData.nik || "",
                    birth_date: initialData.birth_date ? new Date(initialData.birth_date).toISOString().split('T')[0] : "",
                    gender: initialData.gender || "",
                    posyandu_id: initialData.posyandu?.id || initialData.posyandu_id || "",
                    birth_weight_kg: initialData.birth_weight_kg || "",
                    birth_height_cm: initialData.birth_height_cm || "",
                    notes: initialData.notes || "",
                });
            } else {
                // Add mode: fetch user data to auto-fill posyandu if needed
                fetchUserData();
                // Reset form
                setFormData({
                    full_name: "",
                    nik: "",
                    birth_date: "",
                    gender: "",
                    posyandu_id: "",
                    birth_weight_kg: "",
                    birth_height_cm: "",
                    notes: "",
                });
            }
            setErrors({});
            setError(null);
        }
    }, [isOpen, initialData]);

    const fetchPosyandus = async () => {
        try {
            const response = await api.get('/posyandus');
            setPosyandus(response.data.data || response.data);
        } catch (err) {
            console.error('Failed to fetch posyandus:', err);
        }
    };

    const fetchUserData = async () => {
        try {
            const response = await api.get('/me');
            const user = response.data.data || response.data;

            // Auto-fill posyandu if user has one
            if (user.posyandu_id) {
                setFormData(prev => ({
                    ...prev,
                    posyandu_id: user.posyandu_id
                }));
            }
        } catch (err) {
            console.error('Failed to fetch user data:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.full_name.trim()) {
            newErrors.full_name = "Nama lengkap wajib diisi";
        }

        if (!formData.birth_date) {
            newErrors.birth_date = "Tanggal lahir wajib diisi";
        }

        if (!formData.gender) {
            newErrors.gender = "Jenis kelamin wajib dipilih";
        }

        if (!formData.posyandu_id) {
            newErrors.posyandu_id = "Posyandu wajib dipilih";
        }

        if (formData.birth_weight_kg && (parseFloat(formData.birth_weight_kg) < 0 || parseFloat(formData.birth_weight_kg) > 10)) {
            newErrors.birth_weight_kg = "Berat lahir harus antara 0-10 kg";
        }

        if (formData.birth_height_cm && (parseFloat(formData.birth_height_cm) < 0 || parseFloat(formData.birth_height_cm) > 100)) {
            newErrors.birth_height_cm = "Tinggi lahir harus antara 0-100 cm";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const dataToSubmit = {
                ...formData,
                posyandu_id: parseInt(formData.posyandu_id),
                birth_weight_kg: formData.birth_weight_kg ? parseFloat(formData.birth_weight_kg) : null,
                birth_height_cm: formData.birth_height_cm ? parseFloat(formData.birth_height_cm) : null,
                nik: formData.nik || null,
                notes: formData.notes || null,
            };

            // If adding new child, we need parent_id
            if (!initialData) {
                const response = await api.get('/me');
                const user = response.data.data || response.data;
                dataToSubmit.parent_id = user.id;
            }

            if (initialData) {
                // Edit mode
                await api.put(`/children/${initialData.id}`, dataToSubmit);
            } else {
                // Add mode
                await api.post('/children', dataToSubmit);
            }

            if (onSuccess) {
                onSuccess(initialData ? 'Data anak berhasil diperbarui!' : 'Data anak berhasil ditambahkan!');
            }
            onClose();
        } catch (err) {
            console.error('Submit error:', err);

            if (err.response?.data?.errors) {
                // Validation errors from backend
                setErrors(err.response.data.errors);
            } else {
                setError(err.response?.data?.message || 'Gagal menyimpan data anak. Silakan coba lagi.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Helper to format date for card expiry
    const getFormattedDate = (dateString) => {
        if (!dateString) return "00/00";
        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${month}/${year}`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">{initialData ? 'Edit Data Anak' : 'Tambah Data Anak'}</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8">
                            <div className="flex flex-col gap-8 items-center">
                                {/* Top - Card Preview */}
                                <div className="w-full max-w-md flex flex-col items-center">
                                    <div className="w-full aspect-[1.586/1]">
                                        <CreditCard
                                            cardNumber={formData.nik ? formData.nik.replace(/(\d{4})(?=\d)/g, '$1 ') : "0000 0000 0000 0000"}
                                            cardHolder={formData.full_name || "NAMA ANAK"}
                                            expiryDate={getFormattedDate(formData.birth_date)}
                                            cvv={formData.gender === 'L' ? '001' : formData.gender === 'P' ? '002' : 'XXX'}
                                            variant="gradient"
                                            labelName="NAMA ANAK"
                                            labelExpiry="TGL LAHIR"
                                            brandLogo={logoScroll}
                                            chipImage={formData.gender === 'L' ? assets.kepala_bayi : formData.gender === 'P' ? assets.kepala_bayi_cewe : null}
                                        />
                                    </div>
                                </div>

                                {/* Bottom - Form */}
                                <div className="w-full max-w-3xl">
                                    {/* Error Alert */}
                                    {error && (
                                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                                <span>{error}</span>
                                            </div>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        {/* Nama Lengkap */}
                                        <div>
                                            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                                                Nama Lengkap <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="full_name"
                                                name="full_name"
                                                value={formData.full_name}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 ${errors.full_name ? 'border-red-500' : 'border-gray-200'
                                                    }`}
                                                placeholder="Masukkan nama lengkap anak"
                                            />
                                            {errors.full_name && (
                                                <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
                                            )}
                                        </div>

                                        {/* NIK */}
                                        <div>
                                            <label htmlFor="nik" className="block text-sm font-medium text-gray-700 mb-2">
                                                NIK (Opsional)
                                            </label>
                                            <input
                                                type="text"
                                                id="nik"
                                                name="nik"
                                                value={formData.nik}
                                                onChange={handleChange}
                                                maxLength="16"
                                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 ${errors.nik ? 'border-red-500' : 'border-gray-200'
                                                    }`}
                                                placeholder="Masukkan 16 digit NIK"
                                            />
                                            {errors.nik && (
                                                <p className="mt-1 text-sm text-red-600">{errors.nik}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-5">
                                            {/* Tanggal Lahir */}
                                            <div>
                                                <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Tanggal Lahir <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    id="birth_date"
                                                    name="birth_date"
                                                    value={formData.birth_date}
                                                    onChange={handleChange}
                                                    max={new Date().toISOString().split('T')[0]}
                                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 ${errors.birth_date ? 'border-red-500' : 'border-gray-200'
                                                        }`}
                                                />
                                                {errors.birth_date && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.birth_date}</p>
                                                )}
                                            </div>

                                            {/* Jenis Kelamin */}
                                            <div>
                                                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Jenis Kelamin <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    id="gender"
                                                    name="gender"
                                                    value={formData.gender}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 ${errors.gender ? 'border-red-500' : 'border-gray-200'
                                                        }`}
                                                >
                                                    <option value="">Pilih...</option>
                                                    <option value="L">Laki-laki</option>
                                                    <option value="P">Perempuan</option>
                                                </select>
                                                {errors.gender && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Posyandu */}
                                        <div>
                                            <label htmlFor="posyandu_id" className="block text-sm font-medium text-gray-700 mb-2">
                                                Posyandu <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                id="posyandu_id"
                                                name="posyandu_id"
                                                value={formData.posyandu_id}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 ${errors.posyandu_id ? 'border-red-500' : 'border-gray-200'
                                                    }`}
                                            >
                                                <option value="">Pilih posyandu terdekat</option>
                                                {posyandus.map((posyandu) => (
                                                    <option key={posyandu.id} value={posyandu.id}>
                                                        {posyandu.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.posyandu_id && (
                                                <p className="mt-1 text-sm text-red-600">{errors.posyandu_id}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-5">
                                            {/* Berat Lahir */}
                                            <div>
                                                <label htmlFor="birth_weight_kg" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Berat Lahir (kg)
                                                </label>
                                                <input
                                                    type="number"
                                                    id="birth_weight_kg"
                                                    name="birth_weight_kg"
                                                    value={formData.birth_weight_kg}
                                                    onChange={handleChange}
                                                    step="0.1"
                                                    min="0"
                                                    max="10"
                                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 ${errors.birth_weight_kg ? 'border-red-500' : 'border-gray-200'
                                                        }`}
                                                    placeholder="0.0"
                                                />
                                                {errors.birth_weight_kg && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.birth_weight_kg}</p>
                                                )}
                                            </div>

                                            {/* Tinggi Lahir */}
                                            <div>
                                                <label htmlFor="birth_height_cm" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Tinggi Lahir (cm)
                                                </label>
                                                <input
                                                    type="number"
                                                    id="birth_height_cm"
                                                    name="birth_height_cm"
                                                    value={formData.birth_height_cm}
                                                    onChange={handleChange}
                                                    step="0.1"
                                                    min="0"
                                                    max="100"
                                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 ${errors.birth_height_cm ? 'border-red-500' : 'border-gray-200'
                                                        }`}
                                                    placeholder="0.0"
                                                />
                                                {errors.birth_height_cm && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.birth_height_cm}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Catatan */}
                                        <div>
                                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                                                Catatan (Opsional)
                                            </label>
                                            <textarea
                                                id="notes"
                                                name="notes"
                                                value={formData.notes}
                                                onChange={handleChange}
                                                rows="3"
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900"
                                                placeholder="Tambahkan catatan khusus mengenai kondisi anak..."
                                            />
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Footer - Actions */}
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-white transition-colors"
                                disabled={loading}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-600/20"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Simpan Data
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
