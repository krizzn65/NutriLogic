import React, { useState, useEffect, useRef } from "react";
import { X, Calendar, Clock, MapPin, FileText, User, Activity, Save, AlertCircle, Search, ChevronDown, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { createPortal } from "react-dom";
import api from "../../lib/api";

export default function AddScheduleModal({ isOpen, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [childrenLoading, setChildrenLoading] = useState(true);
    const [error, setError] = useState(null);
    const [children, setChildren] = useState([]);

    // Custom Input States
    const [isChildDropdownOpen, setIsChildDropdownOpen] = useState(false);
    const [childSearchQuery, setChildSearchQuery] = useState("");
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
    const [pickerDate, setPickerDate] = useState(new Date());

    const childDropdownRef = useRef(null);
    const typeDropdownRef = useRef(null);
    const datePickerRef = useRef(null);
    const timePickerRef = useRef(null);
    const controls = useDragControls();

    const [formData, setFormData] = useState({
        child_id: "",
        type: "imunisasi",
        title: "",
        scheduled_for: "",
        scheduled_time: "",
        location: "",
        notes: "",
    });

    useEffect(() => {
        if (isOpen) {
            fetchChildren();
            // Reset form when modal opens
            setFormData({
                child_id: "",
                type: "imunisasi",
                title: "",
                scheduled_for: "",
                scheduled_time: "",
                location: "",
                notes: "",
            });
            setError(null);
            setChildSearchQuery("");
            setPickerDate(new Date());
        }
    }, [isOpen]);

    // Close on ESC key and click outside
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };

        const handleClickOutside = (e) => {
            if (childDropdownRef.current && !childDropdownRef.current.contains(e.target)) {
                setIsChildDropdownOpen(false);
            }
            if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target)) {
                setIsTypeDropdownOpen(false);
            }
            if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
                setIsDatePickerOpen(false);
            }
            if (timePickerRef.current && !timePickerRef.current.contains(e.target)) {
                setIsTimePickerOpen(false);
            }
        };

        document.addEventListener("keydown", handleEscape);
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    const fetchChildren = async () => {
        try {
            setChildrenLoading(true);
            const response = await api.get('/kader/children?is_active=1');
            setChildren(response.data.data);
        } catch (err) {
            console.error('Failed to fetch children:', err);
            setError('Gagal memuat data anak.');
        } finally {
            setChildrenLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.post('/kader/schedules', formData);
            onSuccess?.();
            onClose();
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Gagal menyimpan jadwal. Silakan coba lagi.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Filter children based on search
    const filteredChildren = children.filter(child =>
        child.full_name.toLowerCase().includes(childSearchQuery.toLowerCase())
    );

    // Date Picker Helpers
    const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const handleDateSelect = (day) => {
        const newDate = new Date(pickerDate.getFullYear(), pickerDate.getMonth(), day);
        // Adjust for timezone offset to ensure correct date string YYYY-MM-DD
        const offset = newDate.getTimezoneOffset();
        const localDate = new Date(newDate.getTime() - (offset * 60 * 1000));
        setFormData(prev => ({ ...prev, scheduled_for: localDate.toISOString().split('T')[0] }));
        setIsDatePickerOpen(false);
    };

    const changeMonth = (offset) => {
        setPickerDate(new Date(pickerDate.getFullYear(), pickerDate.getMonth() + offset, 1));
    };

    // Time Picker Helpers
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

    const handleTimeSelect = (type, value) => {
        const currentTime = formData.scheduled_time || "09:00";
        const [currentHour, currentMinute] = currentTime.split(':');

        let newTime;
        if (type === 'hour') {
            newTime = `${value}:${currentMinute}`;
        } else {
            newTime = `${currentHour}:${value}`;
        }

        setFormData(prev => ({ ...prev, scheduled_time: newTime }));
    };

    const typeOptions = [
        { value: "imunisasi", label: "Imunisasi" },
        { value: "vitamin", label: "Vitamin" },
        { value: "posyandu", label: "Posyandu" },
    ];

    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        drag="y"
                        dragControls={controls}
                        dragListener={false}
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0, bottom: 0.2 }}
                        onDragEnd={(event, info) => {
                            if (info.offset.y > 100) {
                                onClose();
                            }
                        }}
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full md:max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-t-2xl md:rounded-2xl shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Drag Handle */}
                        <div
                            className="w-full h-6 flex items-center justify-center md:hidden cursor-grab active:cursor-grabbing pt-2 pb-1 sticky top-0 bg-white z-10 rounded-t-2xl"
                            onPointerDown={(e) => controls.start(e)}
                        >
                            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                        </div>
                        {/* Header */}
                        <div className="sticky top-0 md:top-0 z-10 flex items-center justify-between p-4 md:p-6 bg-white border-b border-gray-200 md:rounded-t-2xl">
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Tambah Jadwal Baru</h2>
                                <p className="text-sm text-gray-500 mt-1">Buat jadwal kegiatan untuk anak</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="hidden md:flex p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5" />
                                    <span className="font-medium">{error}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Column */}
                                <div className="space-y-6">
                                    {/* Custom Child Dropdown */}
                                    <div className="relative" ref={childDropdownRef}>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            <User className="w-4 h-4 text-blue-500" />
                                            Pilih Anak <span className="text-red-500">*</span>
                                        </label>
                                        <div
                                            onClick={() => !childrenLoading && setIsChildDropdownOpen(!isChildDropdownOpen)}
                                            className={`w-full px-4 py-3 bg-gray-50 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${isChildDropdownOpen ? 'border-blue-500 ring-2 ring-blue-500/20 bg-white' : 'border-gray-200 hover:bg-gray-100'
                                                }`}
                                        >
                                            <span className={formData.child_id ? "text-gray-900" : "text-gray-400"}>
                                                {formData.child_id
                                                    ? children.find(c => c.id === parseInt(formData.child_id))?.full_name
                                                    : "Cari nama anak..."}
                                            </span>
                                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isChildDropdownOpen ? 'rotate-180' : ''}`} />
                                        </div>

                                        <AnimatePresence>
                                            {isChildDropdownOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 8 }}
                                                    className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden"
                                                >
                                                    <div className="p-2 border-b border-gray-100">
                                                        <div className="relative">
                                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                            <input
                                                                type="text"
                                                                value={childSearchQuery}
                                                                onChange={(e) => setChildSearchQuery(e.target.value)}
                                                                placeholder="Cari nama anak..."
                                                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20"
                                                                autoFocus
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="max-h-60 overflow-y-auto">
                                                        {filteredChildren.length > 0 ? (
                                                            filteredChildren.map(child => (
                                                                <button
                                                                    key={child.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setFormData(prev => ({ ...prev, child_id: child.id }));
                                                                        setIsChildDropdownOpen(false);
                                                                    }}
                                                                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between group transition-colors ${parseInt(formData.child_id) === child.id ? 'bg-blue-50/50' : ''
                                                                        }`}
                                                                >
                                                                    <div>
                                                                        <p className={`font-medium ${parseInt(formData.child_id) === child.id ? 'text-blue-600' : 'text-gray-900'}`}>
                                                                            {child.full_name}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500">
                                                                            {child.gender === 'L' ? 'Laki-laki' : 'Perempuan'} • {child.parent?.name}
                                                                        </p>
                                                                    </div>
                                                                    {parseInt(formData.child_id) === child.id && (
                                                                        <Check className="w-4 h-4 text-blue-600" />
                                                                    )}
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <div className="p-4 text-center text-gray-500 text-sm">
                                                                Tidak ada anak ditemukan
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Custom Type Dropdown */}
                                    <div className="relative" ref={typeDropdownRef}>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            <Activity className="w-4 h-4 text-blue-500" />
                                            Jenis Kegiatan <span className="text-red-500">*</span>
                                        </label>
                                        <div
                                            onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                                            className={`w-full px-4 py-3 bg-gray-50 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${isTypeDropdownOpen ? 'border-blue-500 ring-2 ring-blue-500/20 bg-white' : 'border-gray-200 hover:bg-gray-100'
                                                }`}
                                        >
                                            <span className="text-gray-900 capitalize">
                                                {typeOptions.find(t => t.value === formData.type)?.label || formData.type}
                                            </span>
                                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
                                        </div>

                                        <AnimatePresence>
                                            {isTypeDropdownOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 8 }}
                                                    className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden"
                                                >
                                                    {typeOptions.map(option => (
                                                        <button
                                                            key={option.value}
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData(prev => ({ ...prev, type: option.value }));
                                                                setIsTypeDropdownOpen(false);
                                                            }}
                                                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between transition-colors ${formData.type === option.value ? 'bg-blue-50/50 text-blue-600' : 'text-gray-700'
                                                                }`}
                                                        >
                                                            <span>{option.label}</span>
                                                            {formData.type === option.value && <Check className="w-4 h-4" />}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-blue-500" />
                                            Judul Kegiatan <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            placeholder="Contoh: Imunisasi BCG"
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Custom Date Picker */}
                                        <div className="relative" ref={datePickerRef}>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-blue-500" />
                                                Tanggal <span className="text-red-500">*</span>
                                            </label>
                                            <div
                                                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                                                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${isDatePickerOpen ? 'border-blue-500 ring-2 ring-blue-500/20 bg-white' : 'border-gray-200 hover:bg-gray-100'
                                                    }`}
                                            >
                                                <span className={formData.scheduled_for ? "text-gray-900" : "text-gray-400"}>
                                                    {formData.scheduled_for
                                                        ? new Date(formData.scheduled_for).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                                        : "Pilih tanggal"}
                                                </span>
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                            </div>

                                            <AnimatePresence>
                                                {isDatePickerOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 8 }}
                                                        className="absolute z-20 left-0 mt-2 w-72 bg-white border border-gray-100 rounded-xl shadow-xl p-4"
                                                    >
                                                        <div className="flex items-center justify-between mb-4">
                                                            <button
                                                                type="button"
                                                                onClick={() => changeMonth(-1)}
                                                                className="p-1 hover:bg-gray-100 rounded-lg"
                                                            >
                                                                <ChevronLeft className="w-5 h-5 text-gray-600" />
                                                            </button>
                                                            <span className="font-semibold text-gray-800">
                                                                {pickerDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => changeMonth(1)}
                                                                className="p-1 hover:bg-gray-100 rounded-lg"
                                                            >
                                                                <ChevronRight className="w-5 h-5 text-gray-600" />
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-7 gap-1 mb-2">
                                                            {['M', 'S', 'S', 'R', 'K', 'J', 'S'].map((day, i) => (
                                                                <div key={i} className="text-center text-xs font-medium text-gray-400 py-1">
                                                                    {day}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="grid grid-cols-7 gap-1">
                                                            {Array.from({ length: firstDayOfMonth(pickerDate) }).map((_, i) => (
                                                                <div key={`empty-${i}`} />
                                                            ))}
                                                            {Array.from({ length: daysInMonth(pickerDate) }).map((_, i) => {
                                                                const day = i + 1;
                                                                const dateStr = new Date(pickerDate.getFullYear(), pickerDate.getMonth(), day).toISOString().split('T')[0];
                                                                const isSelected = formData.scheduled_for === dateStr;
                                                                const isToday = new Date().toDateString() === new Date(pickerDate.getFullYear(), pickerDate.getMonth(), day).toDateString();

                                                                return (
                                                                    <button
                                                                        key={day}
                                                                        type="button"
                                                                        onClick={() => handleDateSelect(day)}
                                                                        className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-colors ${isSelected
                                                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                                                            : isToday
                                                                                ? 'bg-blue-50 text-blue-600 font-bold'
                                                                                : 'text-gray-700 hover:bg-gray-100'
                                                                            }`}
                                                                    >
                                                                        {day}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Custom Time Picker */}
                                        <div className="relative" ref={timePickerRef}>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-blue-500" />
                                                Jam <span className="text-red-500">*</span>
                                            </label>
                                            <div
                                                onClick={() => setIsTimePickerOpen(!isTimePickerOpen)}
                                                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${isTimePickerOpen ? 'border-blue-500 ring-2 ring-blue-500/20 bg-white' : 'border-gray-200 hover:bg-gray-100'
                                                    }`}
                                            >
                                                <span className={formData.scheduled_time ? "text-gray-900" : "text-gray-400"}>
                                                    {formData.scheduled_time || "--:--"}
                                                </span>
                                                <Clock className="w-4 h-4 text-gray-400" />
                                            </div>

                                            <AnimatePresence>
                                                {isTimePickerOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 8 }}
                                                        className="absolute z-20 left-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden flex"
                                                    >
                                                        {/* Hours Column */}
                                                        <div className="flex-1 border-r border-gray-100 h-64 overflow-y-auto scrollbar-hide">
                                                            <div className="sticky top-0 bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-500 text-center border-b border-gray-100">
                                                                Jam
                                                            </div>
                                                            {hours.map(hour => (
                                                                <button
                                                                    key={hour}
                                                                    type="button"
                                                                    onClick={() => handleTimeSelect('hour', hour)}
                                                                    className={`w-full py-2 text-center text-sm hover:bg-gray-50 transition-colors ${formData.scheduled_time?.startsWith(hour)
                                                                            ? 'bg-blue-600 text-white font-bold hover:bg-blue-700'
                                                                            : 'text-gray-700'
                                                                        }`}
                                                                >
                                                                    {hour}
                                                                </button>
                                                            ))}
                                                        </div>

                                                        {/* Minutes Column */}
                                                        <div className="flex-1 h-64 overflow-y-auto scrollbar-hide">
                                                            <div className="sticky top-0 bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-500 text-center border-b border-gray-100">
                                                                Menit
                                                            </div>
                                                            {minutes.map(minute => (
                                                                <button
                                                                    key={minute}
                                                                    type="button"
                                                                    onClick={() => handleTimeSelect('minute', minute)}
                                                                    className={`w-full py-2 text-center text-sm hover:bg-gray-50 transition-colors ${formData.scheduled_time?.endsWith(minute)
                                                                            ? 'bg-blue-600 text-white font-bold hover:bg-blue-700'
                                                                            : 'text-gray-700'
                                                                        }`}
                                                                >
                                                                    {minute}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-blue-500" />
                                            Lokasi <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            placeholder="Contoh: Posyandu Melati"
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-blue-500" />
                                            Catatan
                                        </label>
                                        <textarea
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleChange}
                                            rows="3"
                                            placeholder="Catatan tambahan (opsional)..."
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all resize-none"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 transition-all"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Menyimpan...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            <span>Simpan Jadwal</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
