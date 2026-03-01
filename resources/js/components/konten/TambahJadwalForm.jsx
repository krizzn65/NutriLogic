import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Calendar,
    Clock,
    MapPin,
    FileText,
    User,
    Activity,
    Save,
    AlertCircle,
} from "lucide-react";
import api from "../../lib/api";
import logger from "../../lib/logger";

export default function TambahJadwalForm() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [childrenLoading, setChildrenLoading] = useState(true);
    const [error, setError] = useState(null);
    const [children, setChildren] = useState([]);
    const [existingSchedules, setExistingSchedules] = useState([]);

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
        fetchChildren();
        fetchSchedules();
    }, []);

    const fetchChildren = async () => {
        try {
            setChildrenLoading(true);
            const response = await api.get("/kader/children?is_active=1");
            setChildren(response.data.data);
        } catch (err) {
            logger.error("Failed to fetch children:", err);
            setError("Gagal memuat data anak.");
        } finally {
            setChildrenLoading(false);
        }
    };

    const fetchSchedules = async () => {
        try {
            const response = await api.get("/kader/schedules");
            setExistingSchedules(response.data.data || []);
        } catch (err) {
            logger.error("Failed to fetch schedules:", err);
            setExistingSchedules([]);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (error) {
            setError(null);
        }
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const conflictingSchedules = useMemo(() => {
        if (!formData.scheduled_for || !formData.scheduled_time) {
            return [];
        }

        const selectedTime = formData.scheduled_time.slice(0, 5);
        return existingSchedules.filter((schedule) => {
            if (schedule.status === "completed") return false;
            if (schedule.scheduled_for !== formData.scheduled_for) return false;
            const scheduleTime = (schedule.scheduled_time || "").slice(0, 5);
            return scheduleTime === selectedTime;
        });
    }, [existingSchedules, formData.scheduled_for, formData.scheduled_time]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (conflictingSchedules.length > 0) {
            setError(
                "Jadwal bentrok dengan kegiatan lain di tanggal dan jam yang sama. Silakan pilih waktu berbeda.",
            );
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await api.post("/kader/schedules", formData);
            navigate("/dashboard/jadwal");
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                "Gagal menyimpan jadwal. Silakan coba lagi.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-1 w-full h-full overflow-auto bg-gray-50/50">
            <div className="w-full max-w-4xl mx-auto p-4 md:p-8 flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                            Tambah Jadwal
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Buat jadwal kegiatan baru untuk anak
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/dashboard/jadwal")}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali
                    </button>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <form
                        onSubmit={handleSubmit}
                        className="p-6 md:p-8 space-y-8"
                    >
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3">
                                <AlertCircle className="w-5 h-5" />
                                <span className="font-medium">{error}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column */}
                            <div className="space-y-6">
                                <div>
                                    <label
                                        htmlFor="jadwal-child-id"
                                        className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                                    >
                                        <User className="w-4 h-4 text-blue-500" />
                                        Pilih Anak{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="jadwal-child-id"
                                            name="child_id"
                                            value={formData.child_id}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                                            disabled={childrenLoading}
                                        >
                                            <option value="">
                                                -- Pilih Anak --
                                            </option>
                                            {children.map((child) => (
                                                <option
                                                    key={child.id}
                                                    value={child.id}
                                                >
                                                    {child.full_name} (
                                                    {child.gender === "L"
                                                        ? "L"
                                                        : "P"}{" "}
                                                    - {child.parent?.name})
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                            <svg
                                                className="w-4 h-4 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                    {childrenLoading && (
                                        <p className="text-xs text-gray-500 mt-1 ml-1">
                                            Memuat data anak...
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="jadwal-type"
                                        className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                                    >
                                        <Activity className="w-4 h-4 text-blue-500" />
                                        Jenis Kegiatan{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="jadwal-type"
                                            name="type"
                                            value={formData.type}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="imunisasi">
                                                Imunisasi
                                            </option>
                                            <option value="vitamin">
                                                Vitamin
                                            </option>
                                            <option value="posyandu">
                                                Posyandu
                                            </option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                            <svg
                                                className="w-4 h-4 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="jadwal-title"
                                        className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                                    >
                                        <FileText className="w-4 h-4 text-blue-500" />
                                        Judul Kegiatan{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="jadwal-title"
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
                                    <div>
                                        <label
                                            htmlFor="jadwal-date"
                                            className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                                        >
                                            <Calendar className="w-4 h-4 text-blue-500" />
                                            Tanggal{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            id="jadwal-date"
                                            type="date"
                                            name="scheduled_for"
                                            value={formData.scheduled_for}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="jadwal-time"
                                            className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                                        >
                                            <Clock className="w-4 h-4 text-blue-500" />
                                            Jam{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            id="jadwal-time"
                                            type="time"
                                            name="scheduled_time"
                                            value={formData.scheduled_time}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>

                                {conflictingSchedules.length > 0 && (
                                    <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 mt-0.5" />
                                        <div>
                                            <p className="font-medium">
                                                Peringatan jadwal bentrok
                                            </p>
                                            <p className="text-sm">
                                                Sudah ada{" "}
                                                {conflictingSchedules.length}{" "}
                                                jadwal pada waktu yang sama.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label
                                        htmlFor="jadwal-location"
                                        className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                                    >
                                        <MapPin className="w-4 h-4 text-blue-500" />
                                        Lokasi{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="jadwal-location"
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
                                    <label
                                        htmlFor="jadwal-notes"
                                        className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                                    >
                                        <FileText className="w-4 h-4 text-blue-500" />
                                        Catatan
                                    </label>
                                    <textarea
                                        id="jadwal-notes"
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
                                onClick={() => navigate("/dashboard/jadwal")}
                                className="px-6 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={loading || childrenLoading}
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
                </div>
            </div>
        </div>
    );
}

