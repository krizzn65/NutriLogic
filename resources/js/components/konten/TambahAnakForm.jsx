import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import PageHeader from "../dashboard/PageHeader";
import CreditCard from "../credit-card-1";
import logoScroll from '../../assets/logo_scroll.svg';
import { assets } from '../../assets/assets';

export default function TambahAnakForm() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
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
        fetchUserData();
    }, []);

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

        // Nama lengkap - trim dan minimal 2 karakter
        const trimmedName = formData.full_name.trim();
        if (!trimmedName) {
            newErrors.full_name = "Nama lengkap wajib diisi";
        } else if (trimmedName.length < 2) {
            newErrors.full_name = "Nama minimal 2 karakter";
        }

        // NIK - jika diisi, harus 16 digit numerik
        if (formData.nik) {
            const nikTrimmed = formData.nik.trim();
            if (!/^\d{16}$/.test(nikTrimmed)) {
                newErrors.nik = "NIK harus 16 digit angka";
            }
        }

        // Tanggal lahir - wajib dan tidak boleh masa depan atau terlalu lama
        if (!formData.birth_date) {
            newErrors.birth_date = "Tanggal lahir wajib diisi";
        } else {
            const birthDate = new Date(formData.birth_date);
            const today = new Date();
            const maxAge = new Date();
            maxAge.setFullYear(maxAge.getFullYear() - 18); // Maksimal 18 tahun (anak posyandu)
            
            if (birthDate > today) {
                newErrors.birth_date = "Tanggal lahir tidak boleh di masa depan";
            } else if (birthDate < maxAge) {
                newErrors.birth_date = "Usia anak melebihi batas maksimal (18 tahun)";
            }
        }

        if (!formData.gender) {
            newErrors.gender = "Jenis kelamin wajib dipilih";
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
            const response = await api.get('/me');
            const user = response.data.data || response.data;

            // Pastikan user memiliki posyandu_id
            if (!user.posyandu_id) {
                setError('Akun Anda belum terdaftar di posyandu. Silakan hubungi admin.');
                setLoading(false);
                return;
            }

            const dataToSubmit = {
                ...formData,
                full_name: formData.full_name.trim(),
                nik: formData.nik ? formData.nik.trim() : null,
                parent_id: user.id,
                posyandu_id: parseInt(user.posyandu_id), // Ambil dari user, bukan formData
                birth_weight_kg: formData.birth_weight_kg ? parseFloat(formData.birth_weight_kg) : null,
                birth_height_cm: formData.birth_height_cm ? parseFloat(formData.birth_height_cm) : null,
                notes: formData.notes ? formData.notes.trim() : null,
            };

            await api.post('/children', dataToSubmit);

            // Navigate back to list with success message
            navigate('/dashboard/anak', {
                state: { message: 'Data anak berhasil ditambahkan!' }
            });
        } catch (err) {
            console.error('Submit error:', err);

            if (err.response?.data?.errors) {
                // Validation errors from backend
                setErrors(err.response.data.errors);
            } else {
                setError(err.response?.data?.message || 'Gagal menambahkan data anak. Silakan coba lagi.');
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
        <div className="flex flex-1 w-full h-full overflow-auto bg-gray-50">
            <div className="p-4 md:p-8 w-full max-w-5xl mx-auto flex flex-col gap-8">
                {/* Header */}
                <PageHeader title="Tambah Anak" subtitle="Portal Orang Tua">
                    <button
                        onClick={() => navigate('/dashboard/anak')}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </PageHeader>

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

                        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-6">Informasi Anak</h3>

                            <div className="space-y-5">
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
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.full_name ? 'border-red-500' : 'border-gray-200'
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
                                        pattern="[0-9]*"
                                        inputMode="numeric"
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.nik ? 'border-red-500' : 'border-gray-200'
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
                                            min={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.birth_date ? 'border-red-500' : 'border-gray-200'
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
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.gender ? 'border-red-500' : 'border-gray-200'
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
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.birth_weight_kg ? 'border-red-500' : 'border-gray-200'
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
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${errors.birth_height_cm ? 'border-red-500' : 'border-gray-200'
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
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        placeholder="Tambahkan catatan khusus mengenai kondisi anak..."
                                    />
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => navigate('/dashboard/anak')}
                                    className="px-6 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                                    disabled={loading}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
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
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
