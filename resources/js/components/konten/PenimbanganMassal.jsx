import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, Search, Save, ArrowLeft, Check } from "lucide-react";
import api from "../../lib/api";
import { useDataCache } from "../../contexts/DataCacheContext";
import { formatAge, getStatusColor, getStatusLabel } from "../../lib/utils";
import PageHeader from "../ui/PageHeader";
import DashboardLayout from "../dashboard/DashboardLayout";
import PenimbanganMassalSkeleton from "../loading/PenimbanganMassalSkeleton";

export default function PenimbanganMassal() {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [children, setChildren] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Date State
    const [weighingDate, setWeighingDate] = useState(new Date().toISOString().split('T')[0]);
    const [pickerDate, setPickerDate] = useState(new Date());
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const dateButtonRef = useRef(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

    const [weighingData, setWeighingData] = useState({});
    const [results, setResults] = useState(null);
    const navigate = useNavigate();

    // Data caching
    const { getCachedData, setCachedData, invalidateCache } = useDataCache();

    useEffect(() => {
        fetchChildren();
    }, []);

    const fetchChildren = async (forceRefresh = false) => {
        // Check cache first (skip if forceRefresh)
        if (!forceRefresh) {
            const cachedChildren = getCachedData('kader_weighing_children');
            if (cachedChildren) {
                setChildren(cachedChildren);
                // Initialize weighing data state
                const initialData = {};
                cachedChildren.forEach(child => {
                    initialData[child.id] = {
                        weight_kg: '',
                        height_cm: '',
                        muac_cm: '',
                        head_circumference_cm: '',
                        notes: '',
                    };
                });
                setWeighingData(initialData);
                setLoading(false);
                return;
            }
        }

        try {
            // Only show loading on initial load
            if (!forceRefresh) {
                setLoading(true);
            }
            setError(null);

            const response = await api.get('/kader/weighings/today');
            const childrenData = response.data.data;
            setChildren(childrenData);
            setCachedData('kader_weighing_children', childrenData);

            // Initialize weighing data state
            const initialData = {};
            childrenData.forEach(child => {
                initialData[child.id] = {
                    weight_kg: '',
                    height_cm: '',
                    muac_cm: '',
                    head_circumference_cm: '',
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

    const handleDateChange = (dateStr) => {
        setWeighingDate(dateStr);
        setPickerDate(new Date(dateStr));
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
                    muac_cm: data.muac_cm ? parseFloat(data.muac_cm) : null,
                    head_circumference_cm: data.head_circumference_cm ? parseFloat(data.head_circumference_cm) : null,
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

            // Invalidate related caches
            invalidateCache('kader_weighing_children');
            invalidateCache('kader_dashboard');
            invalidateCache('kader_priority_children');

            // Clear form
            const clearedData = {};
            children.forEach(child => {
                clearedData[child.id] = {
                    weight_kg: '',
                    height_cm: '',
                    muac_cm: '',
                    head_circumference_cm: '',
                    notes: '',
                };
            });
            setWeighingData(clearedData);

            // Refresh children data to show latest weighing
            fetchChildren(true);
        } catch (err) {
            console.error('Submit error:', err);
            setError(err.response?.data?.message || 'Gagal menyimpan data penimbangan. Silakan coba lagi.');
        } finally {
            setSubmitting(false);
        }
    };

    // Filter children based on search query
    const filteredChildren = children.filter(child =>
        child.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return <PenimbanganMassalSkeleton childCount={6} />;
    }

    return (
        <DashboardLayout
            header={
                <PageHeader
                    title="Penimbangan Massal"
                    subtitle="Portal Kader"
                    description="Input data penimbangan anak-anak di posyandu"
                    showProfile={true}
                />
            }
        >

            {/* Success Results */}
            {results && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 animate-in fade-in slide-in-from-top-2 flex-shrink-0">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="text-lg font-bold text-green-800">{results.message}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {results.data.map((weighing) => {
                            const child = children.find(c => c.id === weighing.child_id);
                            return (
                                <div key={weighing.id} className="bg-white p-4 rounded-xl border border-green-100 shadow-sm">
                                    <p className="font-bold text-gray-900">{child?.full_name}</p>
                                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                        <span>{weighing.weight_kg} kg</span>
                                        <span className="text-gray-300">•</span>
                                        <span>{weighing.height_cm} cm</span>
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border mt-3 ${getStatusColor(weighing.nutritional_status)}`}>
                                        {getStatusLabel(weighing.nutritional_status)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <button
                        onClick={() => setResults(null)}
                        className="mt-6 text-green-700 hover:text-green-900 text-sm font-semibold hover:underline"
                    >
                        Tutup Notifikasi
                    </button>
                </div>
            )}

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">{error}</span>
                </div>
            )}

            {/* Main Content Card - Scrollable */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col flex-1 min-h-0">
                {/* Toolbar - Fixed at top */}
                <div className="p-5 border-b border-gray-100 flex flex-col gap-4 bg-gray-50/50 flex-shrink-0">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center">
                        <div className="w-full md:w-auto">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                                Tanggal Penimbangan
                            </label>
                            <div className="relative">
                                <button
                                    type="button"
                                    ref={dateButtonRef}
                                    onClick={toggleDatePicker}
                                    className="w-full md:w-64 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-left text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all flex items-center justify-between hover:bg-gray-50 hover:border-gray-300"
                                >
                                    <span className="font-medium">
                                        {new Date(weighingDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                </button>

                                {isDatePickerOpen && createPortal(
                                    <>
                                        <div
                                            className="fixed inset-0 z-9998 bg-transparent"
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
                                            className="fixed z-9999 p-4 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl w-[320px]"
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
                                                        const isSelected = weighingDate === currentDateStr;
                                                        const isToday = new Date().toISOString().split('T')[0] === currentDateStr;

                                                        days.push(
                                                            <button
                                                                key={i}
                                                                type="button"
                                                                onClick={() => {
                                                                    handleDateChange(currentDateStr);
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
                                                        const today = new Date();
                                                        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                                                        handleDateChange(todayStr);
                                                        setPickerDate(today);
                                                        setIsDatePickerOpen(false);
                                                    }}
                                                    className="w-full text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1.5 rounded hover:bg-blue-50 transition-colors text-center"
                                                >
                                                    Pilih Hari Ini
                                                </button>
                                            </div>
                                        </motion.div>
                                    </>,
                                    document.body
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-500 bg-blue-50/50 px-4 py-2 rounded-lg border border-blue-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            Hanya isi data anak yang hadir
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="w-full">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                            Cari Anak
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari nama anak..."
                                className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        {searchQuery && (
                            <p className="mt-1.5 text-xs text-gray-500">
                                Menampilkan {filteredChildren.length} dari {children.length} anak
                            </p>
                        )}
                    </div>
                </div>

                {/* Form Content - Scrollable */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                    {/* Scrollable Table Area */}
                    <div className="flex-1 overflow-y-auto">
                        {/* Mobile Card View */}
                        <div className="md:hidden flex flex-col divide-y divide-gray-100">
                            {filteredChildren.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    {searchQuery ? `Tidak ada anak dengan nama "${searchQuery}"` : 'Belum ada data anak yang terdaftar.'}
                                </div>
                            ) : (
                                filteredChildren.map((child, index) => (
                                    <div key={child.id} className="p-4 bg-white flex flex-col gap-4">
                                        {/* Child Info */}
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-bold text-gray-900">{child.full_name}</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${child.gender === 'L' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                                                        {child.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                                                    </span>
                                                    <span className="text-xs text-gray-400">•</span>
                                                    <span className="text-xs text-gray-500">{formatAge(child.age_in_months)}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Data Terakhir</div>
                                                {child.latest_weighing ? (
                                                    <div className="flex flex-col items-end">
                                                        <div className="text-xs font-medium text-gray-700">
                                                            {child.latest_weighing.weight_kg} kg / {child.latest_weighing.height_cm} cm
                                                        </div>
                                                        <span className="text-[10px] text-gray-400">
                                                            {new Date(child.latest_weighing.measured_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">Belum ada data</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Inputs */}
                                        <div className="grid grid-cols-4 gap-3">
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Berat (kg)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="100"
                                                    value={weighingData[child.id]?.weight_kg || ''}
                                                    onChange={(e) => handleInputChange(child.id, 'weight_kg', e.target.value)}
                                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-sm font-medium text-gray-900 placeholder:text-gray-400"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Tinggi (cm)</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    max="200"
                                                    value={weighingData[child.id]?.height_cm || ''}
                                                    onChange={(e) => handleInputChange(child.id, 'height_cm', e.target.value)}
                                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-sm font-medium text-gray-900 placeholder:text-gray-400"
                                                    placeholder="0.0"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Lengan (cm)</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    max="50"
                                                    value={weighingData[child.id]?.muac_cm || ''}
                                                    onChange={(e) => handleInputChange(child.id, 'muac_cm', e.target.value)}
                                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-sm font-medium text-gray-900 placeholder:text-gray-400"
                                                    placeholder="0.0"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Kepala (cm)</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    max="60"
                                                    value={weighingData[child.id]?.head_circumference_cm || ''}
                                                    onChange={(e) => handleInputChange(child.id, 'head_circumference_cm', e.target.value)}
                                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-sm font-medium text-gray-900 placeholder:text-gray-400"
                                                    placeholder="0.0"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                value={weighingData[child.id]?.notes || ''}
                                                onChange={(e) => handleInputChange(child.id, 'notes', e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-sm text-gray-900 placeholder:text-gray-400"
                                                placeholder="Catatan tambahan..."
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-16">No</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider min-w-[200px]">Anak</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Data Terakhir</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Berat (kg)</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Tinggi (cm)</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Lengan (cm)</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Kepala (cm)</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider min-w-[200px]">Catatan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredChildren.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                                {searchQuery ? `Tidak ada anak dengan nama "${searchQuery}"` : 'Belum ada data anak yang terdaftar.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredChildren.map((child, index) => (
                                            <tr key={child.id} className="group hover:bg-blue-50/30 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                            {child.full_name}
                                                        </span>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${child.gender === 'L' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                                                                {child.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                                                            </span>
                                                            <span className="text-xs text-gray-400">•</span>
                                                            <span className="text-xs text-gray-500">{formatAge(child.age_in_months)}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {child.latest_weighing ? (
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                                                                <span>{child.latest_weighing.weight_kg} kg</span>
                                                                <span className="text-gray-300">/</span>
                                                                <span>{child.latest_weighing.height_cm} cm</span>
                                                            </div>
                                                            <span className="text-[10px] text-gray-400">
                                                                {new Date(child.latest_weighing.measured_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">Belum ada data</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        max="100"
                                                        value={weighingData[child.id]?.weight_kg || ''}
                                                        onChange={(e) => handleInputChange(child.id, 'weight_kg', e.target.value)}
                                                        className="w-full px-3 py-2 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium text-gray-900 placeholder:text-gray-400"
                                                        placeholder="0.00"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        min="0"
                                                        max="200"
                                                        value={weighingData[child.id]?.height_cm || ''}
                                                        onChange={(e) => handleInputChange(child.id, 'height_cm', e.target.value)}
                                                        className="w-full px-3 py-2 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium text-gray-900 placeholder:text-gray-400"
                                                        placeholder="0.0"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        min="0"
                                                        max="50"
                                                        value={weighingData[child.id]?.muac_cm || ''}
                                                        onChange={(e) => handleInputChange(child.id, 'muac_cm', e.target.value)}
                                                        className="w-full px-3 py-2 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium text-gray-900 placeholder:text-gray-400"
                                                        placeholder="0.0"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        min="0"
                                                        max="60"
                                                        value={weighingData[child.id]?.head_circumference_cm || ''}
                                                        onChange={(e) => handleInputChange(child.id, 'head_circumference_cm', e.target.value)}
                                                        className="w-full px-3 py-2 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium text-gray-900 placeholder:text-gray-400"
                                                        placeholder="0.0"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="text"
                                                        value={weighingData[child.id]?.notes || ''}
                                                        onChange={(e) => handleInputChange(child.id, 'notes', e.target.value)}
                                                        className="w-full px-3 py-2 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm text-gray-900 placeholder:text-gray-400"
                                                        placeholder="Catatan..."
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer / Submit - Fixed at bottom */}
                    <div className="p-6 border-t border-gray-100 bg-white flex-shrink-0">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                            {searchQuery && (
                                <p className="text-sm text-gray-600 text-center sm:text-left">
                                    <span className="font-semibold">{filteredChildren.length}</span> dari <span className="font-semibold">{children.length}</span> anak ditampilkan
                                </p>
                            )}
                            <button
                                type="submit"
                                disabled={submitting || children.length === 0}
                                className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:ml-auto"
                            >
                                {submitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Menyimpan Data...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Simpan Semua Data
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
