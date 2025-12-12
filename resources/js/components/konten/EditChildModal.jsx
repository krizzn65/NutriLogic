import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Check, Calendar, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import api from "../../lib/api";

export default function EditChildModal({ isOpen, onClose, onSuccess, childId }) {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Form Data State
    const [formData, setFormData] = useState({
        full_name: "",
        nik: "",
        birth_date: "",
        gender: "",
        birth_weight_kg: "",
        birth_height_cm: "",
        notes: "",
        is_active: true,
    });
    const [childData, setChildData] = useState(null);
    const [errors, setErrors] = useState({});

    // UI States for Custom Inputs
    const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [pickerDate, setPickerDate] = useState(new Date());
    const dateButtonRef = useRef(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

    // Deactivate modal state
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [deactivating, setDeactivating] = useState(false);

    useEffect(() => {
        if (isOpen && childId) {
            fetchChildData();
        }
    }, [isOpen, childId]);

    const fetchChildData = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/kader/children/${childId}`);
            const child = response.data.data;

            setChildData(child);
            setFormData({
                full_name: child.full_name || "",
                nik: child.nik || "",
                birth_date: child.birth_date || "",
                gender: child.gender || "",
                birth_weight_kg: child.birth_weight_kg || "",
                birth_height_cm: child.birth_height_cm || "",
                notes: child.notes || "",
                is_active: child.is_active ?? true,
            });

            if (child.birth_date) {
                setPickerDate(new Date(child.birth_date));
            }
        } catch (err) {
            console.error('Failed to fetch child data:', err);
            setError(err.response?.data?.message || 'Gagal memuat data anak');
        } finally {
            setLoading(false);
        }
    };

    const toggleDatePicker = () => {
        if (!isDatePickerOpen && dateButtonRef.current) {
            const rect = dateButtonRef.current.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + 8,
                left: rect.left
            });
        }
        setIsDatePickerOpen(!isDatePickerOpen);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
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

        setSubmitting(true);
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
                is_active: formData.is_active,
            };

            await api.put(`/kader/children/${childId}`, dataToSubmit);
            onSuccess('Data anak berhasil diperbarui!');
            onClose();
        } catch (err) {
            console.error('Submit error:', err);

            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                setError(err.response?.data?.message || 'Gagal memperbarui data anak. Silakan coba lagi.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = () => {
        setShowDeactivateModal(true);
    };

    const confirmToggleActive = async () => {
        try {
            setDeactivating(true);
            const isCurrentlyActive = childData?.is_active;

            if (isCurrentlyActive) {
                // Deactivate
                await api.delete(`/kader/children/${childId}`);
                onSuccess('Data anak berhasil dinonaktifkan!');
            } else {
                // Activate - use PUT to update is_active to true
                await api.put(`/kader/children/${childId}`, { ...formData, is_active: true });
                onSuccess('Data anak berhasil diaktifkan!');
            }

            setShowDeactivateModal(false);
            onClose();
        } catch (err) {
            console.error('Toggle active error:', err);
            const action = childData?.is_active ? 'menonaktifkan' : 'mengaktifkan';
            setError(err.response?.data?.message || `Gagal ${action} data anak`);
            setShowDeactivateModal(false);
        } finally {
            setDeactivating(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9990]"
                    />
                    <div className="fixed inset-0 z-[9991] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Edit Data Anak</h2>
                                    <p className="text-sm text-gray-500">Perbarui informasi data anak</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                                        <p className="text-gray-500">Memuat data...</p>
                                    </div>
                                ) : (
                                    <>
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
                                            {/* Parent Info (Read-only) */}
                                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                                <h3 className="text-sm font-semibold text-blue-800 mb-3">Data Orang Tua</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-xs text-gray-500">Nama Orang Tua</p>
                                                        <p className="text-sm font-medium text-gray-900">{childData?.parent?.name || '-'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">No. Telepon</p>
                                                        <p className="text-sm font-medium text-gray-900">{childData?.parent?.phone || '-'}</p>
                                                    </div>
                                                </div>
                                            </div>

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
                                                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 ${errors.full_name ? 'border-red-500' : 'border-gray-200'
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
                                                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 ${errors.nik ? 'border-red-500' : 'border-gray-200'
                                                        }`}
                                                    placeholder="Masukkan 16 digit NIK"
                                                />
                                                {errors.nik && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.nik}</p>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                {/* Tanggal Lahir */}
                                                <div className="relative">
                                                    <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-2">
                                                        Tanggal Lahir <span className="text-red-500">*</span>
                                                    </label>

                                                    <button
                                                        type="button"
                                                        ref={dateButtonRef}
                                                        onClick={toggleDatePicker}
                                                        className={`w-full px-4 py-2.5 bg-white border rounded-xl text-left text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all flex items-center justify-between hover:bg-gray-50 ${errors.birth_date ? 'border-red-500' : 'border-gray-200'}`}
                                                    >
                                                        <span className={!formData.birth_date ? "text-gray-400" : ""}>
                                                            {formData.birth_date ? new Date(formData.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "dd/mm/yyyy"}
                                                        </span>
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                    </button>

                                                    {isDatePickerOpen && createPortal(
                                                        <>
                                                            <div
                                                                className="fixed inset-0 z-[9998] bg-transparent"
                                                                onClick={() => setIsDatePickerOpen(false)}
                                                            />
                                                            <motion.div
                                                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                transition={{ duration: 0.2 }}
                                                                style={{
                                                                    top: dropdownPos.top,
                                                                    left: dropdownPos.left
                                                                }}
                                                                className="fixed z-[9999] p-4 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl w-[360px]"
                                                            >
                                                                {/* Calendar Header */}
                                                                <div className="flex items-center justify-between mb-4">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setPickerDate(new Date(pickerDate.setMonth(pickerDate.getMonth() - 1)))}
                                                                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                                                    >
                                                                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                                                                    </button>
                                                                    <span className="font-semibold text-gray-800">
                                                                        {pickerDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setPickerDate(new Date(pickerDate.setMonth(pickerDate.getMonth() + 1)))}
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

                                                                        for (let i = 0; i < firstDay; i++) {
                                                                            days.push(<div key={`empty-${i}`} className="w-10 h-10" />);
                                                                        }

                                                                        for (let i = 1; i <= daysInMonth; i++) {
                                                                            const currentDateStr = `${pickerDate.getFullYear()}-${String(pickerDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                                                                            const isSelected = formData.birth_date === currentDateStr;
                                                                            const isToday = new Date().toISOString().split('T')[0] === currentDateStr;

                                                                            days.push(
                                                                                <button
                                                                                    key={i}
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        handleChange({ target: { name: 'birth_date', value: currentDateStr } });
                                                                                        setIsDatePickerOpen(false);
                                                                                    }}
                                                                                    className={`w-10 h-10 text-sm rounded-full flex items-center justify-center transition-all
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
                                                                            handleChange({ target: { name: 'birth_date', value: "" } });
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
                                                                            handleChange({ target: { name: 'birth_date', value: todayStr } });
                                                                            setPickerDate(today);
                                                                            setIsDatePickerOpen(false);
                                                                        }}
                                                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                                                                    >
                                                                        Today
                                                                    </button>
                                                                </div>
                                                            </motion.div>
                                                        </>,
                                                        document.body
                                                    )}

                                                    {errors.birth_date && (
                                                        <p className="mt-1 text-sm text-red-600">{errors.birth_date}</p>
                                                    )}
                                                </div>

                                                {/* Jenis Kelamin */}
                                                <div className="relative">
                                                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                                                        Jenis Kelamin <span className="text-red-500">*</span>
                                                    </label>

                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                            setDropdownPos({
                                                                top: rect.bottom + 8,
                                                                left: rect.left
                                                            });
                                                            setIsGenderDropdownOpen(!isGenderDropdownOpen);
                                                        }}
                                                        className={`w-full px-4 py-2.5 bg-white border rounded-xl text-left text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all flex items-center justify-between hover:bg-gray-50 ${errors.gender ? 'border-red-500' : 'border-gray-200'}`}
                                                    >
                                                        <span className={!formData.gender ? "text-gray-400" : ""}>
                                                            {formData.gender === 'L' ? 'Laki-laki' : formData.gender === 'P' ? 'Perempuan' : 'Pilih...'}
                                                        </span>
                                                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isGenderDropdownOpen ? "rotate-180" : ""}`} />
                                                    </button>

                                                    <AnimatePresence>
                                                        {isGenderDropdownOpen && createPortal(
                                                            <>
                                                                <div
                                                                    className="fixed inset-0 z-[9998] bg-transparent"
                                                                    onClick={() => setIsGenderDropdownOpen(false)}
                                                                />
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                                    transition={{ duration: 0.2 }}
                                                                    style={{
                                                                        top: dropdownPos.top,
                                                                        left: dropdownPos.left,
                                                                        width: 200
                                                                    }}
                                                                    className="fixed z-[9999] mt-2 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl shadow-xl overflow-hidden"
                                                                >
                                                                    {[
                                                                        { value: 'L', label: 'Laki-laki' },
                                                                        { value: 'P', label: 'Perempuan' }
                                                                    ].map((option) => (
                                                                        <div
                                                                            key={option.value}
                                                                            onClick={() => {
                                                                                handleChange({ target: { name: 'gender', value: option.value } });
                                                                                setIsGenderDropdownOpen(false);
                                                                            }}
                                                                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors flex items-center justify-between group border-b border-gray-50 last:border-0"
                                                                        >
                                                                            <span className={`text-sm ${formData.gender === option.value ? 'text-blue-700 font-semibold' : 'text-gray-700 font-medium group-hover:text-blue-700'}`}>
                                                                                {option.label}
                                                                            </span>
                                                                            {formData.gender === option.value && (
                                                                                <Check className="w-4 h-4 text-blue-600" />
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </motion.div>
                                                            </>,
                                                            document.body
                                                        )}
                                                    </AnimatePresence>

                                                    {errors.gender && (
                                                        <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
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
                                                        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 ${errors.birth_weight_kg ? 'border-red-500' : 'border-gray-200'
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
                                                        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 ${errors.birth_height_cm ? 'border-red-500' : 'border-gray-200'
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
                                    </>
                                )}
                            </div>

                            {/* Footer / Actions */}
                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className={`px-4 py-2 font-medium rounded-lg transition-colors text-sm ${childData?.is_active
                                            ? 'text-red-600 hover:bg-red-50'
                                            : 'text-emerald-600 hover:bg-emerald-50'
                                        }`}
                                    disabled={submitting || loading}
                                >
                                    {childData?.is_active ? 'Nonaktifkan Data Anak' : 'Aktifkan Data Anak'}
                                </button>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors text-sm"
                                        disabled={submitting}
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={submitting || loading}
                                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2 text-sm shadow-lg shadow-blue-600/20"
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Simpan Perubahan
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}

            {/* Toggle Active Confirmation Modal */}
            {showDeactivateModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => !deactivating && setShowDeactivateModal(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-sm relative z-10 overflow-hidden"
                    >
                        <div className="p-6 text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${childData?.is_active ? 'bg-amber-100' : 'bg-emerald-100'
                                }`}>
                                {childData?.is_active ? (
                                    <AlertTriangle className="w-8 h-8 text-amber-600" />
                                ) : (
                                    <Check className="w-8 h-8 text-emerald-600" />
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                {childData?.is_active ? 'Nonaktifkan Data Anak?' : 'Aktifkan Data Anak?'}
                            </h3>
                            <p className="text-gray-500 text-sm mb-6">
                                {childData?.is_active ? (
                                    <>Data anak <span className="font-semibold text-gray-700">{formData.full_name}</span> akan dinonaktifkan dan tidak akan muncul dalam daftar anak aktif. Anda dapat mengaktifkannya kembali nanti.</>
                                ) : (
                                    <>Data anak <span className="font-semibold text-gray-700">{formData.full_name}</span> akan diaktifkan kembali dan akan muncul dalam daftar anak aktif.</>
                                )}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeactivateModal(false)}
                                    disabled={deactivating}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmToggleActive}
                                    disabled={deactivating}
                                    className={`flex-1 px-4 py-2.5 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${childData?.is_active
                                            ? 'bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-200'
                                            : 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200'
                                        }`}
                                >
                                    {deactivating ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Memproses...</span>
                                        </>
                                    ) : (
                                        <span>{childData?.is_active ? 'Ya, Nonaktifkan' : 'Ya, Aktifkan'}</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
