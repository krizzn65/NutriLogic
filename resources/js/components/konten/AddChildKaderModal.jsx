import React, { useState, useEffect, useRef } from "react";
import { User, Calendar, Ruler, Weight, FileText, Save, X, ChevronDown, Search, Phone, Mail, AlertCircle, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../lib/api";
import { useDataCache } from "../../contexts/DataCacheContext";

export default function AddChildKaderModal({ isOpen, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [parentsLoading, setParentsLoading] = useState(true);
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

    // Custom Input States
    const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [isParentDropdownOpen, setIsParentDropdownOpen] = useState(false);
    const [parentSearch, setParentSearch] = useState("");
    const [pickerDate, setPickerDate] = useState(new Date());
    const dateWrapperRef = useRef(null);
    const genderWrapperRef = useRef(null);
    const parentWrapperRef = useRef(null);

    // Data caching
    const { invalidateCache } = useDataCache();

    useEffect(() => {
        if (isOpen) {
            fetchParents();
            resetForm();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event) => {
            if (dateWrapperRef.current && !dateWrapperRef.current.contains(event.target)) {
                setIsDatePickerOpen(false);
            }
            if (genderWrapperRef.current && !genderWrapperRef.current.contains(event.target)) {
                setIsGenderDropdownOpen(false);
            }
            if (parentWrapperRef.current && !parentWrapperRef.current.contains(event.target)) {
                setIsParentDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const resetForm = () => {
        setFormData({
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
        setErrors({});
        setError(null);
        setUseExistingParent(true);
    };

    const fetchParents = async () => {
        try {
            setParentsLoading(true);
            const response = await api.get('/kader/parents');
            setParents(response.data.data);
        } catch (err) {
            console.error('Failed to fetch parents:', err);
            setError('Gagal memuat data orang tua. Silakan refresh halaman.');
        } finally {
            setParentsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (useExistingParent) {
            if (!formData.parent_id) newErrors.parent_id = "Silakan pilih orang tua";
        } else {
            if (!formData.parent_name.trim()) newErrors.parent_name = "Nama orang tua wajib diisi";
        }
        if (!formData.full_name.trim()) newErrors.full_name = "Nama lengkap anak wajib diisi";
        if (!formData.birth_date) newErrors.birth_date = "Tanggal lahir wajib diisi";
        if (!formData.gender) newErrors.gender = "Jenis kelamin wajib dipilih";
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
        if (!validateForm()) return;

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

            // Invalidate relevant caches
            invalidateCache('kader_children_all');
            invalidateCache('kader_children_active');
            invalidateCache('kader_dashboard');
            invalidateCache('kader_priority_children');

            onSuccess?.('Data anak berhasil ditambahkan!');
            onClose();
        } catch (err) {
            console.error('Submit error:', err);
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                setError(err.response?.data?.message || 'Gagal menambahkan data anak. Silakan coba lagi.');
            }
        } finally {
            setLoading(false);
        }
    };

    const InputField = ({ label, name, type = "text", placeholder, icon: Icon, required = false, ...props }) => (
        <div className="w-full">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative group">
                {Icon && (
                    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                )}
                <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-2.5 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-xl focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-gray-900 placeholder:text-gray-400 ${errors[name] ? 'border-red-500 bg-red-50/50' : ''}`}
                    {...props}
                />
            </div>
            {errors[name] && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 ml-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors[name]}
                </p>
            )}
        </div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="modal-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl w-full md:max-w-2xl max-h-[95vh] md:max-h-[90vh] overflow-hidden md:m-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Mobile Drag Handle */}
                        <div className="md:hidden flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 bg-gray-300 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-3 md:py-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-lg md:text-xl font-bold text-gray-900">Tambah Data Anak</h2>
                                <p className="text-xs md:text-sm text-gray-500 mt-0.5">Formulir Pendaftaran</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto max-h-[calc(95vh-160px)] md:max-h-[calc(90vh-140px)] p-4 md:p-6">

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 mb-6">
                                    <AlertCircle className="w-5 h-5" />
                                    <span className="font-medium">{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                                {/* Parent Section */}
                                <div className="bg-gray-50/50 rounded-xl p-5 border border-gray-100">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                <User className="w-4 h-4 text-blue-500" />
                                                Data Orang Tua
                                            </h3>
                                        </div>
                                        <div className="flex bg-gray-100 p-1 rounded-lg">
                                            <button
                                                type="button"
                                                onClick={() => setUseExistingParent(true)}
                                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${useExistingParent ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                Pilih Existing
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setUseExistingParent(false)}
                                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${!useExistingParent ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                Buat Baru
                                            </button>
                                        </div>
                                    </div>

                                    {useExistingParent ? (
                                        <div className="w-full" ref={parentWrapperRef}>
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">
                                                Pilih Orang Tua <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsParentDropdownOpen(!isParentDropdownOpen)}
                                                    disabled={parentsLoading}
                                                    className={`w-full px-4 py-2.5 bg-white border rounded-xl text-left text-gray-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all flex items-center justify-between disabled:opacity-50 ${errors.parent_id ? 'border-red-500' : 'border-gray-200'}`}
                                                >
                                                    <span className={!formData.parent_id ? "text-gray-400" : ""}>
                                                        {parentsLoading ? "Memuat..." : formData.parent_id ? parents.find(p => p.id === parseInt(formData.parent_id))?.name || "Orang Tua Terpilih" : "-- Pilih Orang Tua --"}
                                                    </span>
                                                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isParentDropdownOpen ? "rotate-180" : ""}`} />
                                                </button>

                                                <AnimatePresence>
                                                    {isParentDropdownOpen && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: 10 }}
                                                            className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
                                                        >
                                                            <div className="p-2 border-b border-gray-100">
                                                                <div className="relative">
                                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Cari nama orang tua..."
                                                                        value={parentSearch}
                                                                        onChange={(e) => setParentSearch(e.target.value)}
                                                                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="max-h-48 overflow-y-auto">
                                                                {parents.filter(p => p.name.toLowerCase().includes(parentSearch.toLowerCase())).map((parent) => (
                                                                    <div
                                                                        key={parent.id}
                                                                        onClick={() => {
                                                                            handleChange({ target: { name: 'parent_id', value: parent.id } });
                                                                            setIsParentDropdownOpen(false);
                                                                        }}
                                                                        className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer flex items-center justify-between"
                                                                    >
                                                                        <span className={`text-sm ${parseInt(formData.parent_id) === parent.id ? 'text-blue-700 font-semibold' : 'text-gray-700'}`}>
                                                                            {parent.name}
                                                                        </span>
                                                                        {parseInt(formData.parent_id) === parent.id && <Check className="w-4 h-4 text-blue-600" />}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                            {errors.parent_id && (
                                                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 ml-1">
                                                    <AlertCircle className="w-3 h-3" />
                                                    {errors.parent_id}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="md:col-span-2">
                                                <InputField label="Nama Orang Tua" name="parent_name" placeholder="Masukkan nama lengkap" icon={User} required />
                                            </div>
                                            <InputField label="Email" name="parent_email" type="email" placeholder="email@example.com" icon={Mail} />
                                            <InputField label="No. Telepon" name="parent_phone" type="tel" placeholder="08xxxxxxxxxx" icon={Phone} />
                                        </div>
                                    )}
                                </div>

                                {/* Child Section */}
                                <div className="bg-gray-50/50 rounded-xl p-5 border border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                                        <User className="w-4 h-4 text-pink-500" />
                                        Data Anak
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <InputField label="Nama Lengkap Anak" name="full_name" placeholder="Masukkan nama lengkap" icon={User} required />
                                        </div>

                                        <InputField label="NIK" name="nik" placeholder="Nomor Induk Kependudukan" icon={FileText} maxLength="16" />

                                        {/* Date Picker */}
                                        <div className="relative" ref={dateWrapperRef}>
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">
                                                Tanggal Lahir <span className="text-red-500">*</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                                                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-left flex items-center justify-between ${errors.birth_date ? 'border-red-500' : 'border-gray-200'}`}
                                            >
                                                <span className={!formData.birth_date ? "text-gray-400" : "text-gray-900"}>
                                                    {formData.birth_date ? new Date(formData.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "dd/mm/yyyy"}
                                                </span>
                                                <Calendar className="w-5 h-5 text-gray-400" />
                                            </button>

                                            <AnimatePresence>
                                                {isDatePickerOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 10 }}
                                                        className="absolute z-50 mt-2 p-4 bg-white border border-gray-200 rounded-xl shadow-xl w-[280px]"
                                                    >
                                                        <div className="flex items-center justify-between mb-3">
                                                            <button type="button" onClick={() => setPickerDate(new Date(pickerDate.setMonth(pickerDate.getMonth() - 1)))} className="p-1 hover:bg-gray-100 rounded-full">
                                                                <ChevronLeft className="w-5 h-5 text-gray-600" />
                                                            </button>
                                                            <span className="font-semibold text-gray-800 text-sm">
                                                                {pickerDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                                                            </span>
                                                            <button type="button" onClick={() => setPickerDate(new Date(pickerDate.setMonth(pickerDate.getMonth() + 1)))} className="p-1 hover:bg-gray-100 rounded-full">
                                                                <ChevronRight className="w-5 h-5 text-gray-600" />
                                                            </button>
                                                        </div>

                                                        <div className="grid grid-cols-7 mb-2">
                                                            {['Mg', 'Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb'].map((day) => (
                                                                <div key={day} className="text-xs font-medium text-gray-400 text-center py-1">{day}</div>
                                                            ))}
                                                        </div>

                                                        <div className="grid grid-cols-7 gap-1">
                                                            {(() => {
                                                                const daysInMonth = new Date(pickerDate.getFullYear(), pickerDate.getMonth() + 1, 0).getDate();
                                                                const firstDay = new Date(pickerDate.getFullYear(), pickerDate.getMonth(), 1).getDay();
                                                                const days = [];
                                                                for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
                                                                for (let i = 1; i <= daysInMonth; i++) {
                                                                    const currentDateStr = `${pickerDate.getFullYear()}-${String(pickerDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                                                                    const isSelected = formData.birth_date === currentDateStr;
                                                                    days.push(
                                                                        <button key={i} type="button" onClick={() => { handleChange({ target: { name: 'birth_date', value: currentDateStr } }); setIsDatePickerOpen(false); }}
                                                                            className={`w-8 h-8 text-sm rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                                                                            {i}
                                                                        </button>
                                                                    );
                                                                }
                                                                return days;
                                                            })()}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            {errors.birth_date && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.birth_date}</p>}
                                        </div>

                                        {/* Gender Dropdown */}
                                        <div className="relative" ref={genderWrapperRef}>
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">
                                                Jenis Kelamin <span className="text-red-500">*</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setIsGenderDropdownOpen(!isGenderDropdownOpen)}
                                                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-left flex items-center justify-between ${errors.gender ? 'border-red-500' : 'border-gray-200'}`}
                                            >
                                                <span className={!formData.gender ? "text-gray-400" : "text-gray-900"}>
                                                    {formData.gender === 'L' ? 'Laki-laki' : formData.gender === 'P' ? 'Perempuan' : 'Pilih jenis kelamin'}
                                                </span>
                                                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isGenderDropdownOpen ? "rotate-180" : ""}`} />
                                            </button>

                                            <AnimatePresence>
                                                {isGenderDropdownOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 10 }}
                                                        className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
                                                    >
                                                        {[{ value: 'L', label: 'Laki-laki' }, { value: 'P', label: 'Perempuan' }].map((option) => (
                                                            <div key={option.value} onClick={() => { handleChange({ target: { name: 'gender', value: option.value } }); setIsGenderDropdownOpen(false); }}
                                                                className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer flex items-center justify-between">
                                                                <span className={`text-sm ${formData.gender === option.value ? 'text-blue-700 font-semibold' : 'text-gray-700'}`}>{option.label}</span>
                                                                {formData.gender === option.value && <Check className="w-4 h-4 text-blue-600" />}
                                                            </div>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            {errors.gender && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.gender}</p>}
                                        </div>

                                        <InputField label="Berat Lahir (kg)" name="birth_weight_kg" type="number" placeholder="0.0" step="0.1" icon={Weight} />
                                        <InputField label="Tinggi Lahir (cm)" name="birth_height_cm" type="number" placeholder="0.0" step="0.1" icon={Ruler} />

                                        <div className="md:col-span-2">
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">Catatan</label>
                                            <textarea
                                                name="notes"
                                                value={formData.notes}
                                                onChange={handleChange}
                                                rows="2"
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-gray-900 placeholder:text-gray-400 resize-none"
                                                placeholder="Catatan khusus (opsional)..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                            <button type="button" onClick={onClose} disabled={loading}
                                className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-medium">
                                Batal
                            </button>
                            <button onClick={handleSubmit} disabled={loading}
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2 font-medium disabled:opacity-70">
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Simpan</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
