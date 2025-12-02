import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

export default function TambahAnakKaderForm() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [parents, setParents] = useState([]);
    const [useExistingParent, setUseExistingParent] = useState(true);
    const [formData, setFormData] = useState({
        parent_id: "",
        parent_name: "",
        parent_email: "",
        parent_phone: "",
        full_name: "",
        nik: "",
        birth_date: "",
        gender: "",
        birth_weight_kg: "",
        birth_height_cm: "",
        notes: "",
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchParents();
    }, []);

    const fetchParents = async () => {
        try {
            // Use dedicated parents endpoint (lightweight)
            const response = await api.get('/kader/parents');
            setParents(response.data.data);
        } catch (err) {
            console.error('Failed to fetch parents:', err);
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

        if (useExistingParent) {
            if (!formData.parent_id) {
                newErrors.parent_id = "Silakan pilih orang tua";
            }
        } else {
            if (!formData.parent_name.trim()) {
                newErrors.parent_name = "Nama orang tua wajib diisi";
            }
        }

        if (!formData.full_name.trim()) {
            newErrors.full_name = "Nama lengkap anak wajib diisi";
        }

        if (!formData.birth_date) {
            newErrors.birth_date = "Tanggal lahir wajib diisi";
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
            const dataToSubmit = {
                full_name: formData.full_name,
                nik: formData.nik || null,
                birth_date: formData.birth_date,
                gender: formData.gender,
                birth_weight_kg: formData.birth_weight_kg ? parseFloat(formData.birth_weight_kg) : null,
                birth_height_cm: formData.birth_height_cm ? parseFloat(formData.birth_height_cm) : null,
                notes: formData.notes || null,
            };

            if (useExistingParent) {
                dataToSubmit.parent_id = parseInt(formData.parent_id);
            } else {
                dataToSubmit.parent_name = formData.parent_name;
                dataToSubmit.parent_email = formData.parent_email || null;
                dataToSubmit.parent_phone = formData.parent_phone || null;
            }

            await api.post('/kader/children', dataToSubmit);

            // Navigate back to list with success message
            navigate('/dashboard/data-anak', {
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

    return (
        <div className="flex flex-1 w-full h-full overflow-auto">
            <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Tambah Data Anak</h1>
                        <p className="text-gray-600 mt-2">Tambahkan data anak baru ke posyandu</p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard/data-anak')}
                        className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Batal
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    {/* Parent Selection */}
                    <div className="mb-6 pb-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Data Orang Tua</h2>

                        {/* Toggle */}
                        <div className="flex items-center gap-4 mb-4">
                            <button
                                type="button"
                                onClick={() => setUseExistingParent(true)}
                                className={`px-4 py-2 rounded-lg transition-colors ${useExistingParent
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Pilih Orang Tua Existing
                            </button>
                            <button
                                type="button"
                                onClick={() => setUseExistingParent(false)}
                                className={`px-4 py-2 rounded-lg transition-colors ${!useExistingParent
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Tambah Orang Tua Baru
                            </button>
                        </div>

                        {useExistingParent ? (
                            /* Select Existing Parent */
                            <div>
                                <label htmlFor="parent_id" className="block text-sm font-medium text-gray-700 mb-2">
                                    Pilih Orang Tua <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="parent_id"
                                    name="parent_id"
                                    value={formData.parent_id}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.parent_id ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">-- Pilih Orang Tua --</option>
                                    {parents.map((parent) => (
                                        <option key={parent.id} value={parent.id}>
                                            {parent.name} {parent.phone ? `(${parent.phone})` : ''}
                                        </option>
                                    ))}
                                </select>
                                {errors.parent_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.parent_id}</p>
                                )}
                            </div>
                        ) : (
                            /* New Parent Form */
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label htmlFor="parent_name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Orang Tua <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="parent_name"
                                        name="parent_name"
                                        value={formData.parent_name}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.parent_name ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Masukkan nama orang tua"
                                    />
                                    {errors.parent_name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.parent_name}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="parent_email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email (Opsional)
                                    </label>
                                    <input
                                        type="email"
                                        id="parent_email"
                                        name="parent_email"
                                        value={formData.parent_email}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.parent_email ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="email@example.com"
                                    />
                                    {errors.parent_email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.parent_email}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="parent_phone" className="block text-sm font-medium text-gray-700 mb-2">
                                        No. Telepon (Opsional)
                                    </label>
                                    <input
                                        type="tel"
                                        id="parent_phone"
                                        name="parent_phone"
                                        value={formData.parent_phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="08xxxxxxxxxx"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Child Data */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Data Anak</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nama Lengkap */}
                            <div className="md:col-span-2">
                                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Nama Lengkap Anak <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="full_name"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.full_name ? 'border-red-500' : 'border-gray-300'
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
                                    maxLength="32"
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.nik ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Masukkan NIK anak"
                                />
                                {errors.nik && (
                                    <p className="mt-1 text-sm text-red-600">{errors.nik}</p>
                                )}
                            </div>

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
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.birth_date ? 'border-red-500' : 'border-gray-300'
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
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.gender ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">Pilih jenis kelamin</option>
                                    <option value="L">Laki-laki</option>
                                    <option value="P">Perempuan</option>
                                </select>
                                {errors.gender && (
                                    <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                                )}
                            </div>

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
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.birth_weight_kg ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Contoh: 3.2"
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
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.birth_height_cm ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Contoh: 48.5"
                                />
                                {errors.birth_height_cm && (
                                    <p className="mt-1 text-sm text-red-600">{errors.birth_height_cm}</p>
                                )}
                            </div>

                            {/* Catatan */}
                            <div className="md:col-span-2">
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                                    Catatan (Opsional)
                                </label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Tambahkan catatan jika diperlukan"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard/data-anak')}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
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
    );
}
