import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

export default function TambahJadwalForm() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [childrenLoading, setChildrenLoading] = useState(true);
    const [error, setError] = useState(null);
    const [children, setChildren] = useState([]);

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
    }, []);

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
            navigate('/dashboard/jadwal');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Gagal menyimpan jadwal. Silakan coba lagi.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-1 w-full h-full overflow-auto">
            <div className="p-4 md:p-10 w-full max-w-3xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800">Tambah Jadwal Kegiatan</h2>
                        <p className="text-gray-600 mt-1">Buat jadwal imunisasi atau posyandu baru</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Pilih Anak <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="child_id"
                                    value={formData.child_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    disabled={childrenLoading}
                                >
                                    <option value="">-- Pilih Anak --</option>
                                    {children.map(child => (
                                        <option key={child.id} value={child.id}>
                                            {child.full_name} ({child.gender === 'L' ? 'L' : 'P'} - {child.parent?.name})
                                        </option>
                                    ))}
                                </select>
                                {childrenLoading && <p className="text-xs text-gray-500 mt-1">Memuat data anak...</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Jenis Kegiatan <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="imunisasi">Imunisasi</option>
                                    <option value="vitamin">Vitamin</option>
                                    <option value="posyandu">Posyandu</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tanggal Kegiatan <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="scheduled_for"
                                    value={formData.scheduled_for}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Jam Kegiatan <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    name="scheduled_time"
                                    value={formData.scheduled_time}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Lokasi Posyandu <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="Contoh: Balai Desa Mawar, Posyandu Melati"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Judul Kegiatan <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Contoh: Imunisasi BCG, Vitamin A Bulan Februari"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Catatan Tambahan
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Catatan khusus untuk kegiatan ini..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                ></textarea>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard/jadwal')}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan Jadwal'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
