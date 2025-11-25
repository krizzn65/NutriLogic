import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { formatAge, getStatusColor, getStatusLabel } from "../../lib/utils";

export default function PenimbanganMassal() {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [children, setChildren] = useState([]);
    const [weighingDate, setWeighingDate] = useState(new Date().toISOString().split('T')[0]);
    const [weighingData, setWeighingData] = useState({});
    const [results, setResults] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchChildren();
    }, []);

    const fetchChildren = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get('/kader/weighings/today');
            const childrenData = response.data.data;
            setChildren(childrenData);

            // Initialize weighing data state
            const initialData = {};
            childrenData.forEach(child => {
                initialData[child.id] = {
                    weight_kg: '',
                    height_cm: '',
                    notes: '',
                };
            });
            setWeighingData(initialData);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Gagal memuat data anak. Silakan coba lagi.';
            setError(errorMessage);
            console.error('Children fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (childId, field, value) => {
        setWeighingData(prev => ({
            ...prev,
            [childId]: {
                ...prev[childId],
                [field]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prepare weighings array (only include children with data)
        const weighings = [];
        Object.keys(weighingData).forEach(childId => {
            const data = weighingData[childId];
            if (data.weight_kg && data.height_cm) {
                weighings.push({
                    child_id: parseInt(childId),
                    measured_at: weighingDate,
                    weight_kg: parseFloat(data.weight_kg),
                    height_cm: parseFloat(data.height_cm),
                    notes: data.notes || null,
                });
            }
        });

        if (weighings.length === 0) {
            setError('Silakan isi minimal satu data penimbangan.');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const response = await api.post('/kader/weighings/bulk', { weighings });
            setResults(response.data);

            // Clear form
            const clearedData = {};
            children.forEach(child => {
                clearedData[child.id] = {
                    weight_kg: '',
                    height_cm: '',
                    notes: '',
                };
            });
            setWeighingData(clearedData);

            // Refresh children data to show latest weighing
            fetchChildren();
        } catch (err) {
            console.error('Submit error:', err);
            setError(err.response?.data?.message || 'Gagal menyimpan data penimbangan. Silakan coba lagi.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-1 w-full h-full overflow-auto">
                <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-4">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Memuat data anak...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 w-full h-full overflow-auto">
            <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Penimbangan Massal</h1>
                        <p className="text-gray-600 mt-2">Input data penimbangan anak-anak di posyandu</p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard/data-anak')}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Kembali
                    </button>
                </div>

                {/* Success Results */}
                {results && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <h3 className="text-lg font-semibold text-green-800">{results.message}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {results.data.map((weighing) => {
                                const child = children.find(c => c.id === weighing.child_id);
                                return (
                                    <div key={weighing.id} className="bg-white p-3 rounded-lg border border-green-200">
                                        <p className="font-medium text-gray-900">{child?.full_name}</p>
                                        <p className="text-sm text-gray-600">{weighing.weight_kg} kg / {weighing.height_cm} cm</p>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border mt-2 ${getStatusColor(weighing.nutritional_status)}`}>
                                            {getStatusLabel(weighing.nutritional_status)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setResults(null)}
                            className="mt-4 text-green-700 hover:text-green-900 text-sm font-medium"
                        >
                            Tutup
                        </button>
                    </div>
                )}

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

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Petunjuk Pengisian:</h3>
                    <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                        <li>Pilih tanggal penimbangan (default: hari ini)</li>
                        <li>Isi berat badan (kg) dan tinggi badan (cm) untuk setiap anak</li>
                        <li>Catatan bersifat opsional</li>
                        <li>Anda tidak perlu mengisi semua anak, hanya yang hadir saja</li>
                        <li>Klik "Simpan Semua Data" setelah selesai</li>
                    </ul>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    {/* Date Selector */}
                    <div className="mb-6">
                        <label htmlFor="weighing_date" className="block text-sm font-medium text-gray-700 mb-2">
                            Tanggal Penimbangan
                        </label>
                        <input
                            type="date"
                            id="weighing_date"
                            value={weighingDate}
                            onChange={(e) => setWeighingDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Children Table */}
                    {children.length === 0 ? (
                        <div className="text-center py-8">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <p className="text-gray-600">Tidak ada anak aktif di posyandu</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Anak</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Umur</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Terakhir</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Berat (kg)</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tinggi (cm)</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catatan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {children.map((child, index) => (
                                        <tr key={child.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm font-medium text-gray-900">{child.full_name}</div>
                                                <div className="text-xs text-gray-500">{child.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">{formatAge(child.age_in_months)}</td>
                                            <td className="px-4 py-3">
                                                {child.latest_weighing ? (
                                                    <div className="text-xs text-gray-600">
                                                        <div>{child.latest_weighing.weight_kg} kg</div>
                                                        <div>{child.latest_weighing.height_cm} cm</div>
                                                        <div className="text-gray-500">{new Date(child.latest_weighing.measured_at).toLocaleDateString('id-ID')}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Belum ada data</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    max="100"
                                                    value={weighingData[child.id]?.weight_kg || ''}
                                                    onChange={(e) => handleInputChange(child.id, 'weight_kg', e.target.value)}
                                                    className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                    placeholder="0.0"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    max="200"
                                                    value={weighingData[child.id]?.height_cm || ''}
                                                    onChange={(e) => handleInputChange(child.id, 'height_cm', e.target.value)}
                                                    className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                    placeholder="0.0"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="text"
                                                    value={weighingData[child.id]?.notes || ''}
                                                    onChange={(e) => handleInputChange(child.id, 'notes', e.target.value)}
                                                    className="w-32 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                    placeholder="Catatan..."
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Submit Button */}
                    {children.length > 0 && (
                        <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Simpan Semua Data
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
