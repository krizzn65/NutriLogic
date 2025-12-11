import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, Search, Save, ArrowLeft, Check, Scale, Pill, Syringe } from "lucide-react";
import api from "../../lib/api";
import { useDataCache } from "../../contexts/DataCacheContext";
import { formatAge, getStatusColor, getStatusLabel } from "../../lib/utils";
import PageHeader from "../ui/PageHeader";
import DashboardLayout from "../dashboard/DashboardLayout";
import PenimbanganMassalSkeleton from "../loading/PenimbanganMassalSkeleton";

export default function KegiatanPosyandu() {
    // Tab State
    const [activeTab, setActiveTab] = useState('penimbangan'); // penimbangan, vitamin, imunisasi

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
    const [warnings, setWarnings] = useState(null);

    // Vitamin State
    const [vitaminData, setVitaminData] = useState({});
    const [vitaminDate, setVitaminDate] = useState(new Date().toISOString().split('T')[0]);
    const [vitaminResults, setVitaminResults] = useState(null);
    const [vitaminWarnings, setVitaminWarnings] = useState(null);

    // Immunization State
    const [immunizationData, setImmunizationData] = useState({});
    const [immunizationDate, setImmunizationDate] = useState(new Date().toISOString().split('T')[0]);
    const [immunizationResults, setImmunizationResults] = useState(null);
    const [immunizationWarnings, setImmunizationWarnings] = useState(null);

    const navigate = useNavigate();

    // Data caching
    const { getCachedData, setCachedData, invalidateCache } = useDataCache();



    useEffect(() => {
        if (activeTab === 'penimbangan') {
            fetchChildren();
        } else if (activeTab === 'vitamin') {
            fetchChildrenForVitamin();
        } else if (activeTab === 'imunisasi') {
            fetchChildrenForImmunization();
        }
    }, [activeTab]);

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
        // Just update the value without validation during typing
        setWeighingData(prev => ({
            ...prev,
            [childId]: {
                ...prev[childId],
                [field]: value
            }
        }));
    };

    const handleInputBlur = (childId, field, value) => {
        // Validate only when user leaves the field
        let validatedValue = value;

        if (field === 'weight_kg' && value) {
            const weight = parseFloat(value);
            if (weight < 1) validatedValue = '1';
            if (weight > 30) validatedValue = '30';
        }

        if (field === 'height_cm' && value) {
            const height = parseFloat(value);
            if (height < 40) validatedValue = '40';
            if (height > 130) validatedValue = '130';
        }

        if (field === 'muac_cm' && value) {
            const muac = parseFloat(value);
            if (muac < 8) validatedValue = '8';
            if (muac > 25) validatedValue = '25';
        }

        if (field === 'head_circumference_cm' && value) {
            const head = parseFloat(value);
            if (head < 0) validatedValue = '0';
            if (head > 60) validatedValue = '60';
        }

        // Update with validated value
        setWeighingData(prev => ({
            ...prev,
            [childId]: {
                ...prev[childId],
                [field]: validatedValue
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

            // Set warnings if any
            if (response.data.warnings) {
                setWarnings(response.data.warnings);
            }

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

    // Vitamin Functions
    const fetchChildrenForVitamin = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get('/kader/vitamins/children');
            const childrenData = response.data.data;
            setChildren(childrenData);

            // Initialize vitamin data state
            const initialData = {};
            childrenData.forEach(child => {
                initialData[child.id] = {
                    vitamin_type: '',
                    dosage: '',
                    notes: '',
                };
            });
            setVitaminData(initialData);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Gagal memuat data anak. Silakan coba lagi.';
            setError(errorMessage);
            console.error('Children fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleVitaminInputChange = (childId, field, value) => {
        setVitaminData(prev => ({
            ...prev,
            [childId]: {
                ...prev[childId],
                [field]: value
            }
        }));
    };

    const handleVitaminSubmit = async (e) => {
        e.preventDefault();

        // Prepare distributions array (only include children with data)
        const distributions = [];
        Object.keys(vitaminData).forEach(childId => {
            const data = vitaminData[childId];
            if (data.vitamin_type) {
                distributions.push({
                    child_id: parseInt(childId),
                    vitamin_type: data.vitamin_type,
                    distribution_date: vitaminDate,
                    dosage: data.dosage || null,
                    notes: data.notes || null,
                });
            }
        });

        if (distributions.length === 0) {
            setError('Silakan pilih minimal satu anak dan jenis vitamin.');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const response = await api.post('/kader/vitamins/bulk', { distributions });
            setVitaminResults(response.data);

            // Set warnings if any
            if (response.data.warnings) {
                setVitaminWarnings(response.data.warnings);
            }

            // Invalidate related caches
            invalidateCache('kader_weighing_children');
            invalidateCache('kader_dashboard');

            // Clear form
            const clearedData = {};
            children.forEach(child => {
                clearedData[child.id] = {
                    vitamin_type: '',
                    dosage: '',
                    notes: '',
                };
            });
            setVitaminData(clearedData);

            // Refresh children data
            fetchChildrenForVitamin();
        } catch (err) {
            console.error('Submit error:', err);
            setError(err.response?.data?.message || 'Gagal menyimpan data vitamin. Silakan coba lagi.');
        } finally {
            setSubmitting(false);
        }
    };

    // Immunization Functions
    const fetchChildrenForImmunization = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get('/kader/immunizations/children');
            const childrenData = response.data.data;
            setChildren(childrenData);

            // Initialize immunization data state
            const initialData = {};
            childrenData.forEach(child => {
                initialData[child.id] = {
                    vaccine_type: '',
                    notes: '',
                };
            });
            setImmunizationData(initialData);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Gagal memuat data anak. Silakan coba lagi.';
            setError(errorMessage);
            console.error('Children fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleImmunizationInputChange = (childId, field, value) => {
        setImmunizationData(prev => ({
            ...prev,
            [childId]: {
                ...prev[childId],
                [field]: value
            }
        }));
    };

    const handleImmunizationSubmit = async (e) => {
        e.preventDefault();

        // Prepare records array (only include children with data)
        const records = [];
        Object.keys(immunizationData).forEach(childId => {
            const data = immunizationData[childId];
            if (data.vaccine_type) {
                records.push({
                    child_id: parseInt(childId),
                    vaccine_type: data.vaccine_type,
                    immunization_date: immunizationDate,
                    notes: data.notes || null,
                });
            }
        });

        if (records.length === 0) {
            setError('Silakan pilih minimal satu anak dan jenis vaksin.');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const response = await api.post('/kader/immunizations/bulk', { records });
            setImmunizationResults(response.data);

            // Set warnings if any
            if (response.data.warnings) {
                setImmunizationWarnings(response.data.warnings);
            }

            // Invalidate related caches
            invalidateCache('kader_weighing_children');
            invalidateCache('kader_dashboard');

            // Clear form
            const clearedData = {};
            children.forEach(child => {
                clearedData[child.id] = {
                    vaccine_type: '',
                    notes: '',
                };
            });
            setImmunizationData(clearedData);

            // Refresh children data
            fetchChildrenForImmunization();
        } catch (err) {
            console.error('Submit error:', err);
            setError(err.response?.data?.message || 'Gagal menyimpan data imunisasi. Silakan coba lagi.');
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
                    title="Kegiatan Posyandu"
                    subtitle="Portal Kader"
                    description="Input data kegiatan posyandu: penimbangan, vitamin, dan imunisasi"
                    showProfile={true}
                />
            }
        >
            {/* Tab Navigation */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 mb-6 flex-shrink-0">
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('penimbangan')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'penimbangan'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <Scale className="w-5 h-5" />
                        <span className="hidden sm:inline">Penimbangan</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('vitamin')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'vitamin'
                            ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <Pill className="w-5 h-5" />
                        <span className="hidden sm:inline">Vitamin</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('imunisasi')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'imunisasi'
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <Syringe className="w-5 h-5" />
                        <span className="hidden sm:inline">Imunisasi</span>
                    </button>
                </div>
            </div>


            {/* Success Results */}
            {results && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 animate-in fade-in slide-in-from-top-2 flex-shrink-0">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="text-lg font-bold text-green-800">{results.message}</h3>
                    </div>

                    {/* Warnings if any */}
                    {warnings && warnings.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                            <div className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <div className="flex-1">
                                    <p className="font-bold text-yellow-800 text-sm mb-2">Peringatan:</p>
                                    <ul className="space-y-1">
                                        {warnings.map((warning, idx) => (
                                            <li key={idx} className="text-xs text-yellow-700">• {warning}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

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
                        onClick={() => {
                            setResults(null);
                            setWarnings(null);
                        }}
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

            {/* Tab Content */}
            {activeTab === 'penimbangan' && (
                <>
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
                                                            min="1"
                                                            max="30"
                                                            value={weighingData[child.id]?.weight_kg || ''}
                                                            onChange={(e) => handleInputChange(child.id, 'weight_kg', e.target.value)}
                                                            onBlur={(e) => handleInputBlur(child.id, 'weight_kg', e.target.value)}
                                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-sm font-medium text-gray-900 placeholder:text-gray-400"
                                                            placeholder="1-30"
                                                        />
                                                        <p className="text-[9px] text-gray-400 mt-0.5">Min 1kg, Max 30kg</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Tinggi (cm)</label>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            min="40"
                                                            max="130"
                                                            value={weighingData[child.id]?.height_cm || ''}
                                                            onChange={(e) => handleInputChange(child.id, 'height_cm', e.target.value)}
                                                            onBlur={(e) => handleInputBlur(child.id, 'height_cm', e.target.value)}
                                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-sm font-medium text-gray-900 placeholder:text-gray-400"
                                                            placeholder="40-130"
                                                        />
                                                        <p className="text-[9px] text-gray-400 mt-0.5">Min 40cm, Max 130cm</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Lengan (cm)</label>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            min="8"
                                                            max="25"
                                                            value={weighingData[child.id]?.muac_cm || ''}
                                                            onChange={(e) => handleInputChange(child.id, 'muac_cm', e.target.value)}
                                                            onBlur={(e) => handleInputBlur(child.id, 'muac_cm', e.target.value)}
                                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-sm font-medium text-gray-900 placeholder:text-gray-400"
                                                            placeholder="8-25"
                                                        />
                                                        <p className="text-[9px] text-gray-400 mt-0.5">Min 8cm, Max 25cm</p>
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
                                                            onBlur={(e) => handleInputBlur(child.id, 'head_circumference_cm', e.target.value)}
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
                                                                onBlur={(e) => handleInputBlur(child.id, 'weight_kg', e.target.value)}
                                                                className="w-full px-3 py-2 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium text-gray-900 placeholder:text-gray-400"
                                                                placeholder="0.0"
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
                                                                onBlur={(e) => handleInputBlur(child.id, 'height_cm', e.target.value)}
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
                                                                onBlur={(e) => handleInputBlur(child.id, 'muac_cm', e.target.value)}
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
                                                                onBlur={(e) => handleInputBlur(child.id, 'head_circumference_cm', e.target.value)}
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
                </>
            )}

            {/* Vitamin Tab Content */}
            {activeTab === 'vitamin' && (
                <>
                    {/* Vitamin Success Results */}
                    {vitaminResults && (
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 animate-in fade-in slide-in-from-top-2 flex-shrink-0">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                    <Check className="w-5 h-5 text-green-600" />
                                </div>
                                <h3 className="text-lg font-bold text-green-800">{vitaminResults.message}</h3>
                            </div>

                            {vitaminWarnings && vitaminWarnings.length > 0 && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                                    <div className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <div className="flex-1">
                                            <p className="font-bold text-yellow-800 text-sm mb-2">Peringatan:</p>
                                            <ul className="space-y-1">
                                                {vitaminWarnings.map((warning, idx) => (
                                                    <li key={idx} className="text-xs text-yellow-700">• {warning}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {vitaminResults.data.map((distribution) => {
                                    const child = children.find(c => c.id === distribution.child_id);
                                    return (
                                        <div key={distribution.id} className="bg-white p-4 rounded-xl border border-green-100 shadow-sm">
                                            <p className="font-bold text-gray-900">{child?.full_name}</p>
                                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                                <Pill className="w-4 h-4" />
                                                <span>{distribution.vitamin_type === 'vitamin_a_blue' ? 'Vitamin A Biru' : distribution.vitamin_type === 'vitamin_a_red' ? 'Vitamin A Merah' : 'Lainnya'}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => {
                                    setVitaminResults(null);
                                    setVitaminWarnings(null);
                                }}
                                className="mt-6 text-green-700 hover:text-green-900 text-sm font-semibold hover:underline"
                            >
                                Tutup Notifikasi
                            </button>
                        </div>
                    )}

                    {/* Vitamin Form */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col flex-1 min-h-0">
                        {/* Toolbar */}
                        <div className="p-5 border-b border-gray-100 flex flex-col gap-4 bg-gray-50/50 flex-shrink-0">
                            <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center">
                                <div className="w-full md:w-auto">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                                        Tanggal Pemberian
                                    </label>
                                    <input
                                        type="date"
                                        value={vitaminDate}
                                        onChange={(e) => setVitaminDate(e.target.value)}
                                        className="w-full md:w-64 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                                    />
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-500 bg-green-50/50 px-4 py-2 rounded-lg border border-green-100">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                    Pilih jenis vitamin untuk setiap anak
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
                                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Form Content */}
                        <form onSubmit={handleVitaminSubmit} className="flex flex-col flex-1 min-h-0">
                            <div className="flex-1 overflow-y-auto">
                                {/* Mobile Card View */}
                                <div className="md:hidden flex flex-col divide-y divide-gray-100">
                                    {filteredChildren.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500">
                                            {searchQuery ? `Tidak ada anak dengan nama "${searchQuery}"` : 'Belum ada data anak yang terdaftar.'}
                                        </div>
                                    ) : (
                                        filteredChildren.map((child) => (
                                            <div key={child.id} className="p-4 bg-white flex flex-col gap-4">
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
                                                    {child.latest_vitamin && (
                                                        <div className="text-right">
                                                            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Terakhir</div>
                                                            <span className="text-xs text-gray-500">
                                                                {new Date(child.latest_vitamin.distribution_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 gap-3">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Jenis Vitamin *</label>
                                                        <select
                                                            value={vitaminData[child.id]?.vitamin_type || ''}
                                                            onChange={(e) => handleVitaminInputChange(child.id, 'vitamin_type', e.target.value)}
                                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/10 transition-all text-sm font-medium text-gray-900"
                                                        >
                                                            <option value="">Pilih Vitamin</option>
                                                            <option value="vitamin_a_blue">🔵 Vitamin A Biru (100.000 IU)</option>
                                                            <option value="vitamin_a_red">🔴 Vitamin A Merah (200.000 IU)</option>
                                                            <option value="other">📦 Lainnya</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Dosis (Opsional)</label>
                                                        <input
                                                            type="text"
                                                            value={vitaminData[child.id]?.dosage || ''}
                                                            onChange={(e) => handleVitaminInputChange(child.id, 'dosage', e.target.value)}
                                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/10 transition-all text-sm text-gray-900"
                                                            placeholder="Contoh: 1 kapsul"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Catatan</label>
                                                        <input
                                                            type="text"
                                                            value={vitaminData[child.id]?.notes || ''}
                                                            onChange={(e) => handleVitaminInputChange(child.id, 'notes', e.target.value)}
                                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/10 transition-all text-sm text-gray-900"
                                                            placeholder="Catatan tambahan..."
                                                        />
                                                    </div>
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
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Terakhir</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-64">Jenis Vitamin *</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-40">Dosis</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider min-w-[200px]">Catatan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filteredChildren.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                                        {searchQuery ? `Tidak ada anak dengan nama "${searchQuery}"` : 'Belum ada data anak yang terdaftar.'}
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredChildren.map((child, index) => (
                                                    <tr key={child.id} className="group hover:bg-green-50/30 transition-colors">
                                                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                                            {index + 1}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">
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
                                                            {child.latest_vitamin ? (
                                                                <div className="flex flex-col gap-1">
                                                                    <div className="text-xs font-medium text-gray-700">
                                                                        {child.latest_vitamin.vitamin_type === 'vitamin_a_blue' ? 'Vit A Biru' : child.latest_vitamin.vitamin_type === 'vitamin_a_red' ? 'Vit A Merah' : 'Lainnya'}
                                                                    </div>
                                                                    <span className="text-[10px] text-gray-400">
                                                                        {new Date(child.latest_vitamin.distribution_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-gray-400 italic">Belum ada data</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <select
                                                                value={vitaminData[child.id]?.vitamin_type || ''}
                                                                onChange={(e) => handleVitaminInputChange(child.id, 'vitamin_type', e.target.value)}
                                                                className="w-full px-3 py-2 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all text-sm font-medium text-gray-900"
                                                            >
                                                                <option value="">Pilih Vitamin</option>
                                                                <option value="vitamin_a_blue">🔵 Vitamin A Biru (100.000 IU)</option>
                                                                <option value="vitamin_a_red">🔴 Vitamin A Merah (200.000 IU)</option>
                                                                <option value="other">📦 Lainnya</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <input
                                                                type="text"
                                                                value={vitaminData[child.id]?.dosage || ''}
                                                                onChange={(e) => handleVitaminInputChange(child.id, 'dosage', e.target.value)}
                                                                className="w-full px-3 py-2 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all text-sm text-gray-900 placeholder:text-gray-400"
                                                                placeholder="1 kapsul"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <input
                                                                type="text"
                                                                value={vitaminData[child.id]?.notes || ''}
                                                                onChange={(e) => handleVitaminInputChange(child.id, 'notes', e.target.value)}
                                                                className="w-full px-3 py-2 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all text-sm text-gray-900 placeholder:text-gray-400"
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

                            {/* Footer / Submit */}
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
                                        className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:ml-auto"
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
                </>
            )}

            {/* Imunisasi Tab Content */}
            {activeTab === 'imunisasi' && (
                <>
                    {/* Immunization Success Results */}
                    {immunizationResults && (
                        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 animate-in fade-in slide-in-from-top-2 flex-shrink-0">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                    <Check className="w-5 h-5 text-purple-600" />
                                </div>
                                <h3 className="text-lg font-bold text-purple-800">{immunizationResults.message}</h3>
                            </div>

                            {immunizationWarnings && immunizationWarnings.length > 0 && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                                    <div className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <div className="flex-1">
                                            <p className="font-bold text-yellow-800 text-sm mb-2">Peringatan:</p>
                                            <ul className="space-y-1">
                                                {immunizationWarnings.map((warning, idx) => (
                                                    <li key={idx} className="text-xs text-yellow-700">• {warning}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {immunizationResults.data.map((record) => {
                                    const child = children.find(c => c.id === record.child_id);
                                    return (
                                        <div key={record.id} className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
                                            <p className="font-bold text-gray-900">{child?.full_name}</p>
                                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                                <Syringe className="w-4 h-4" />
                                                <span className="text-xs">{record.vaccine_type.replace(/_/g, ' ').toUpperCase()}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => {
                                    setImmunizationResults(null);
                                    setImmunizationWarnings(null);
                                }}
                                className="mt-6 text-purple-700 hover:text-purple-900 text-sm font-semibold hover:underline"
                            >
                                Tutup Notifikasi
                            </button>
                        </div>
                    )}

                    {/* Immunization Form */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col flex-1 min-h-0">
                        {/* Toolbar */}
                        <div className="p-5 border-b border-gray-100 flex flex-col gap-4 bg-gray-50/50 flex-shrink-0">
                            <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center">
                                <div className="w-full md:w-auto">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                                        Tanggal Imunisasi
                                    </label>
                                    <input
                                        type="date"
                                        value={immunizationDate}
                                        onChange={(e) => setImmunizationDate(e.target.value)}
                                        className="w-full md:w-64 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                    />
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-500 bg-purple-50/50 px-4 py-2 rounded-lg border border-purple-100">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                    Pilih jenis vaksin untuk setiap anak
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
                                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Form Content */}
                        <form onSubmit={handleImmunizationSubmit} className="flex flex-col flex-1 min-h-0">
                            <div className="flex-1 overflow-y-auto">
                                {/* Mobile Card View */}
                                <div className="md:hidden flex flex-col divide-y divide-gray-100">
                                    {filteredChildren.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500">
                                            {searchQuery ? `Tidak ada anak dengan nama "${searchQuery}"` : 'Belum ada data anak yang terdaftar.'}
                                        </div>
                                    ) : (
                                        filteredChildren.map((child) => (
                                            <div key={child.id} className="p-4 bg-white flex flex-col gap-4">
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
                                                    {child.latest_immunization && (
                                                        <div className="text-right">
                                                            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Terakhir</div>
                                                            <span className="text-xs text-gray-500">
                                                                {new Date(child.latest_immunization.immunization_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 gap-3">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Jenis Vaksin *</label>
                                                        <select
                                                            value={immunizationData[child.id]?.vaccine_type || ''}
                                                            onChange={(e) => handleImmunizationInputChange(child.id, 'vaccine_type', e.target.value)}
                                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all text-sm font-medium text-gray-900"
                                                        >
                                                            <option value="">Pilih Vaksin</option>
                                                            <optgroup label="BCG & Hepatitis B">
                                                                <option value="bcg">💉 BCG</option>
                                                                <option value="hepatitis_b_0">💉 Hepatitis B 0 (HB0)</option>
                                                                <option value="hepatitis_b_1">💉 Hepatitis B 1</option>
                                                                <option value="hepatitis_b_2">💉 Hepatitis B 2</option>
                                                                <option value="hepatitis_b_3">💉 Hepatitis B 3</option>
                                                            </optgroup>
                                                            <optgroup label="Polio">
                                                                <option value="polio_0">💧 Polio 0</option>
                                                                <option value="polio_1">💧 Polio 1</option>
                                                                <option value="polio_2">💧 Polio 2</option>
                                                                <option value="polio_3">💧 Polio 3</option>
                                                                <option value="polio_4">💧 Polio 4</option>
                                                            </optgroup>
                                                            <optgroup label="DPT-HiB-HepB (Pentavalent)">
                                                                <option value="dpt_hib_hep_b_1">💉 DPT-HiB-HepB 1</option>
                                                                <option value="dpt_hib_hep_b_2">💉 DPT-HiB-HepB 2</option>
                                                                <option value="dpt_hib_hep_b_3">💉 DPT-HiB-HepB 3</option>
                                                            </optgroup>
                                                            <optgroup label="IPV & Campak-Rubella">
                                                                <option value="ipv_1">💉 IPV 1 (Polio Suntik)</option>
                                                                <option value="ipv_2">💉 IPV 2 (Polio Suntik)</option>
                                                                <option value="campak_rubella_1">💉 Campak-Rubella 1 (MR1)</option>
                                                                <option value="campak_rubella_2">💉 Campak-Rubella 2 (MR2)</option>
                                                            </optgroup>
                                                            <option value="other">📦 Lainnya</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Catatan</label>
                                                        <input
                                                            type="text"
                                                            value={immunizationData[child.id]?.notes || ''}
                                                            onChange={(e) => handleImmunizationInputChange(child.id, 'notes', e.target.value)}
                                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 transition-all text-sm text-gray-900"
                                                            placeholder="Catatan tambahan..."
                                                        />
                                                    </div>
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
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Terakhir</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-64">Jenis Vaksin *</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider min-w-[200px]">Catatan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filteredChildren.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                        {searchQuery ? `Tidak ada anak dengan nama "${searchQuery}"` : 'Belum ada data anak yang terdaftar.'}
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredChildren.map((child, index) => (
                                                    <tr key={child.id} className="group hover:bg-purple-50/30 transition-colors">
                                                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                                            {index + 1}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
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
                                                            {child.latest_immunization ? (
                                                                <div className="flex flex-col gap-1">
                                                                    <div className="text-xs font-medium text-gray-700">
                                                                        {child.latest_immunization.vaccine_type.replace(/_/g, ' ').toUpperCase()}
                                                                    </div>
                                                                    <span className="text-[10px] text-gray-400">
                                                                        {new Date(child.latest_immunization.immunization_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-gray-400 italic">Belum ada data</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <select
                                                                value={immunizationData[child.id]?.vaccine_type || ''}
                                                                onChange={(e) => handleImmunizationInputChange(child.id, 'vaccine_type', e.target.value)}
                                                                className="w-full px-3 py-2 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all text-sm font-medium text-gray-900"
                                                            >
                                                                <option value="">Pilih Vaksin</option>
                                                                <optgroup label="BCG & Hepatitis B">
                                                                    <option value="bcg">💉 BCG</option>
                                                                    <option value="hepatitis_b_0">💉 Hepatitis B 0 (HB0)</option>
                                                                    <option value="hepatitis_b_1">💉 Hepatitis B 1</option>
                                                                    <option value="hepatitis_b_2">💉 Hepatitis B 2</option>
                                                                    <option value="hepatitis_b_3">💉 Hepatitis B 3</option>
                                                                </optgroup>
                                                                <optgroup label="Polio">
                                                                    <option value="polio_0">💧 Polio 0</option>
                                                                    <option value="polio_1">💧 Polio 1</option>
                                                                    <option value="polio_2">💧 Polio 2</option>
                                                                    <option value="polio_3">💧 Polio 3</option>
                                                                    <option value="polio_4">💧 Polio 4</option>
                                                                </optgroup>
                                                                <optgroup label="DPT-HiB-HepB (Pentavalent)">
                                                                    <option value="dpt_hib_hep_b_1">💉 DPT-HiB-HepB 1</option>
                                                                    <option value="dpt_hib_hep_b_2">💉 DPT-HiB-HepB 2</option>
                                                                    <option value="dpt_hib_hep_b_3">💉 DPT-HiB-HepB 3</option>
                                                                </optgroup>
                                                                <optgroup label="IPV & Campak-Rubella">
                                                                    <option value="ipv_1">💉 IPV 1 (Polio Suntik)</option>
                                                                    <option value="ipv_2">💉 IPV 2 (Polio Suntik)</option>
                                                                    <option value="campak_rubella_1">💉 Campak-Rubella 1 (MR1)</option>
                                                                    <option value="campak_rubella_2">💉 Campak-Rubella 2 (MR2)</option>
                                                                </optgroup>
                                                                <option value="other">📦 Lainnya</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <input
                                                                type="text"
                                                                value={immunizationData[child.id]?.notes || ''}
                                                                onChange={(e) => handleImmunizationInputChange(child.id, 'notes', e.target.value)}
                                                                className="w-full px-3 py-2 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all text-sm text-gray-900 placeholder:text-gray-400"
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

                            {/* Footer / Submit */}
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
                                        className="w-full sm:w-auto px-8 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20 disabled:bg-purple-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:ml-auto"
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
                </>
            )}

        </DashboardLayout>
    );
}
