import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, Calendar, Ruler, Weight, FileText, Save, X, ChevronDown, Search, Phone, Mail, AlertCircle, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../lib/api";
import PageHeader from "../dashboard/PageHeader";

// InputField component defined outside to prevent re-creation on every render
const InputField = ({ label, name, type = "text", placeholder, icon: Icon, required = false, formData, handleChange, errors, ...props }) => (
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

export default function TambahAnakKaderForm() {
    const navigate = useNavigate();
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

    useEffect(() => {
        fetchParents();

        // Click outside handler
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
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchParents = async () => {
        try {
            setParentsLoading(true);
            const response = await api.get('/kader/parents');
            console.log('Parents API Response:', response.data);

            const parentsData = response.data.data || [];
            console.log('Parents Data:', parentsData);
            console.log('Parents Count:', parentsData.length);

            setParents(parentsData);

            if (parentsData.length === 0) {
                console.warn('No parents found in this posyandu');
            }
        } catch (err) {
            console.error('Failed to fetch parents:', err);
            console.error('Error response:', err.response?.data);
            setError('Gagal memuat data orang tua. Silakan refresh halaman.');
        } finally {
            setParentsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

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

            navigate('/dashboard/data-anak', {
                state: { message: 'Data anak berhasil ditambahkan!' }
            });
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

    return (
        <div className="flex flex-col flex-1 w-full h-full overflow-auto bg-gray-50/50">
            {/* Header - Full Width */}
            <div className="w-full px-4 md:px-8 pt-4 md:pt-8">
                <PageHeader title="Tambah Data Anak" subtitle="Formulir Pendaftaran" />
            </div>

            {/* Content - Centered with max-width */}
            <div className="w-full max-w-5xl mx-auto px-4 md:px-8 pb-4 md:pb-8 flex flex-col gap-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Parent Section */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-6">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-500" />
                                    Data Orang Tua
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">Informasi orang tua atau wali anak</p>
                            </div>

                            <div className="flex bg-gray-100 p-1 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setUseExistingParent(true)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${useExistingParent
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Pilih Existing
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUseExistingParent(false)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!useExistingParent
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
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
                                        className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-left text-gray-900 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed ${errors.parent_id ? 'border-red-500 bg-red-50/50' : 'border-transparent'}`}
                                    >
                                        <span className={!formData.parent_id ? "text-gray-400" : ""}>
                                            {parentsLoading
                                                ? "Memuat data orang tua..."
                                                : formData.parent_id
                                                    ? parents.find(p => p.id === parseInt(formData.parent_id))?.name || "Orang Tua Terpilih"
                                                    : "-- Pilih Orang Tua --"}
                                        </span>
                                        {parentsLoading ? (
                                            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                                        ) : (
                                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isParentDropdownOpen ? "rotate-180" : ""}`} />
                                        )}
                                    </button>

                                    <AnimatePresence>
                                        {isParentDropdownOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
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
                                                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="max-h-60 overflow-y-auto">
                                                    {parents.filter(p => p.name.toLowerCase().includes(parentSearch.toLowerCase())).length > 0 ? (
                                                        parents
                                                            .filter(p => p.name.toLowerCase().includes(parentSearch.toLowerCase()))
                                                            .map((parent) => (
                                                                <div
                                                                    key={parent.id}
                                                                    onClick={() => {
                                                                        handleChange({ target: { name: 'parent_id', value: parent.id } });
                                                                        setIsParentDropdownOpen(false);
                                                                    }}
                                                                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors flex items-center justify-between group border-b border-gray-50 last:border-0"
                                                                >
                                                                    <div>
                                                                        <span className={`block text-sm ${parseInt(formData.parent_id) === parent.id ? 'text-blue-700 font-semibold' : 'text-gray-700 font-medium group-hover:text-blue-700'}`}>
                                                                            {parent.name}
                                                                        </span>
                                                                        {parent.phone && (
                                                                            <span className="text-xs text-gray-400 group-hover:text-blue-400">
                                                                                {parent.phone}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {parseInt(formData.parent_id) === parent.id && (
                                                                        <Check className="w-4 h-4 text-blue-600" />
                                                                    )}
                                                                </div>
                                                            ))
                                                    ) : (
                                                        <div className="px-4 py-8 text-center">
                                                            <p className="text-gray-500 text-sm mb-2">
                                                                {parentSearch
                                                                    ? 'Tidak ada data orang tua yang sesuai dengan pencarian'
                                                                    : 'Belum ada data orang tua di posyandu ini'}
                                                            </p>
                                                            {!parentSearch && (
                                                                <p className="text-xs text-gray-400">
                                                                    Gunakan opsi "Buat Baru" untuk menambahkan orang tua baru
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <InputField
                                        label="Nama Orang Tua"
                                        name="parent_name"
                                        placeholder="Masukkan nama lengkap orang tua"
                                        icon={User}
                                        required
                                        formData={formData}
                                        handleChange={handleChange}
                                        errors={errors}
                                    />
                                </div>
                                <InputField
                                    label="Email"
                                    name="parent_email"
                                    type="email"
                                    placeholder="email@example.com"
                                    icon={Mail}
                                    formData={formData}
                                    handleChange={handleChange}
                                    errors={errors}
                                />
                                <InputField
                                    label="No. Telepon"
                                    name="parent_phone"
                                    type="tel"
                                    placeholder="08xxxxxxxxxx"
                                    icon={Phone}
                                    formData={formData}
                                    handleChange={handleChange}
                                    errors={errors}
                                />
                            </div>
                        )}
                    </div>

                    {/* Child Section */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                        <div className="mb-6 border-b border-gray-100 pb-6">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <User className="w-5 h-5 text-pink-500" />
                                Data Anak
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Informasi lengkap anak yang akan didaftarkan</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <InputField
                                    label="Nama Lengkap Anak"
                                    name="full_name"
                                    placeholder="Masukkan nama lengkap anak"
                                    icon={User}
                                    required
                                    formData={formData}
                                    handleChange={handleChange}
                                    errors={errors}
                                />
                            </div>

                            <InputField
                                label="NIK"
                                name="nik"
                                placeholder="Nomor Induk Kependudukan"
                                icon={FileText}
                                maxLength="16"
                                formData={formData}
                                handleChange={handleChange}
                                errors={errors}
                            />

                            {/* Custom Date Picker */}
                            <div className="relative" ref={dateWrapperRef}>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">
                                    Tanggal Lahir <span className="text-red-500">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-left text-gray-900 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all flex items-center justify-between ${errors.birth_date ? 'border-red-500 bg-red-50/50' : 'border-transparent'}`}
                                >
                                    <span className={!formData.birth_date ? "text-gray-400" : ""}>
                                        {formData.birth_date ? new Date(formData.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "dd/mm/yyyy"}
                                    </span>
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                </button>

                                <AnimatePresence>
                                    {isDatePickerOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute z-50 mt-2 p-4 bg-white border border-gray-200 rounded-2xl shadow-xl w-[320px]"
                                        >
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

                                            <div className="grid grid-cols-7 mb-2">
                                                {['Mg', 'Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb'].map((day) => (
                                                    <div key={day} className="text-xs font-medium text-gray-400 text-center py-1">
                                                        {day}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="grid grid-cols-7 gap-1">
                                                {(() => {
                                                    const daysInMonth = new Date(pickerDate.getFullYear(), pickerDate.getMonth() + 1, 0).getDate();
                                                    const firstDay = new Date(pickerDate.getFullYear(), pickerDate.getMonth(), 1).getDay();
                                                    const days = [];

                                                    for (let i = 0; i < firstDay; i++) {
                                                        days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
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
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                {errors.birth_date && (
                                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 ml-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.birth_date}
                                    </p>
                                )}
                            </div>

                            {/* Custom Gender Dropdown */}
                            <div className="relative" ref={genderWrapperRef}>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">
                                    Jenis Kelamin <span className="text-red-500">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setIsGenderDropdownOpen(!isGenderDropdownOpen)}
                                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-left text-gray-900 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all flex items-center justify-between ${errors.gender ? 'border-red-500 bg-red-50/50' : 'border-transparent'}`}
                                >
                                    <span className={!formData.gender ? "text-gray-400" : ""}>
                                        {formData.gender === 'L' ? 'Laki-laki' : formData.gender === 'P' ? 'Perempuan' : 'Pilih jenis kelamin'}
                                    </span>
                                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isGenderDropdownOpen ? "rotate-180" : ""}`} />
                                </button>

                                <AnimatePresence>
                                    {isGenderDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
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
                                    )}
                                </AnimatePresence>
                                {errors.gender && (
                                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 ml-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.gender}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <InputField
                                    label="Berat Lahir (kg)"
                                    name="birth_weight_kg"
                                    type="number"
                                    placeholder="0.0"
                                    step="0.1"
                                    icon={Weight}
                                    formData={formData}
                                    handleChange={handleChange}
                                    errors={errors}
                                />
                                <InputField
                                    label="Tinggi Lahir (cm)"
                                    name="birth_height_cm"
                                    type="number"
                                    placeholder="0.0"
                                    step="0.1"
                                    icon={Ruler}
                                    formData={formData}
                                    handleChange={handleChange}
                                    errors={errors}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">
                                    Catatan (Opsional)
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-xl focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-gray-900 placeholder:text-gray-400 resize-none"
                                    placeholder="Tambahkan catatan khusus mengenai kondisi anak..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard/data-anak')}
                            className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium"
                            disabled={loading}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 flex items-center gap-2 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>Simpan Data</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
