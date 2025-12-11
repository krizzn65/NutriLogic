import React, { useState, useEffect, useRef } from "react";
import { X, Calendar, Clock, MapPin, FileText, Save, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { createPortal } from "react-dom";
import api from "../../lib/api";

export default function AddScheduleModal({ isOpen, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
    const [pickerDate, setPickerDate] = useState(new Date());

    const datePickerRef = useRef(null);
    const timePickerRef = useRef(null);
    const controls = useDragControls();

    const [formData, setFormData] = useState({
        type: "posyandu",
        title: "",
        scheduled_for: "",
        scheduled_time: "",
        location: "",
        notes: "",
    });

    useEffect(() => {
        if (isOpen) {
            // Reset form when modal opens
            setFormData({
                type: "posyandu",
                title: "",
                scheduled_for: "",
                scheduled_time: "",
                location: "",
                notes: "",
            });
            setError(null);
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

    // Date Picker Helpers
    const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const handleDateSelect = (day) => {
        const newDate = new Date(pickerDate.getFullYear(), pickerDate.getMonth(), day);
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
                        className="relative w-full md:max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-t-2xl md:rounded-2xl shadow-2xl"
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
                                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Tambah Jadwal Posyandu</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Buat jadwal kegiatan untuk semua anak di posyandu Anda
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="hidden md:flex p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5" />
                                    <span className="font-medium">{error}</span>
                                </div>
                            )}

                            {/* Title */}
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
                                    placeholder="Contoh: Imunisasi BCG, Pemberian Vitamin A, Penimbangan Rutin"
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Date Picker */}
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

                                {/* Time Picker */}
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

                            {/* Location */}
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

                            {/* Notes */}
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
