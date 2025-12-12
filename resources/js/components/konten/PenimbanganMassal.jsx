import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, Search, Save, ArrowLeft, Check, Scale, Pill, Syringe, FileText, X, Edit2, Lock, Unlock, Clock, ChevronDown, ChevronUp } from "lucide-react";
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
    const [vitaminPickerDate, setVitaminPickerDate] = useState(new Date());
    const [isVitaminDatePickerOpen, setIsVitaminDatePickerOpen] = useState(false);
    const vitaminDateButtonRef = useRef(null);
    const [vitaminDropdownPos, setVitaminDropdownPos] = useState({ top: 0, left: 0 });
    const [vitaminResults, setVitaminResults] = useState(null);
    const [vitaminWarnings, setVitaminWarnings] = useState(null);
    const [expandedVitaminData, setExpandedVitaminData] = useState({});

    // Immunization State
    const [immunizationData, setImmunizationData] = useState({});
    const [immunizationDate, setImmunizationDate] = useState(new Date().toISOString().split('T')[0]);
    const [immunizationPickerDate, setImmunizationPickerDate] = useState(new Date());
    const [isImmunizationDatePickerOpen, setIsImmunizationDatePickerOpen] = useState(false);
    const immunizationDateButtonRef = useRef(null);
    const [immunizationDropdownPos, setImmunizationDropdownPos] = useState({ top: 0, left: 0 });
    const [immunizationResults, setImmunizationResults] = useState(null);
    const [immunizationWarnings, setImmunizationWarnings] = useState(null);
    const [expandedImmunizationData, setExpandedImmunizationData] = useState({});

    // WHO Standards Modal - type: null | 'weight' | 'height' | 'muac' | 'head'
    const [whoModalType, setWhoModalType] = useState(null);

    // Edit mode - track which children are in edit mode (for today's data)
    const [editMode, setEditMode] = useState({});
    const [vitaminEditMode, setVitaminEditMode] = useState({}); // New state for Vitamin edit mode
    const [imunisasiEditMode, setImunisasiEditMode] = useState({}); // New state for Imunisasi edit mode
    const [expandedData, setExpandedData] = useState({});

    const toggleExpandedData = (childId) => {
        setExpandedData(prev => ({
            ...prev,
            [childId]: !prev[childId]
        }));
    };

    const toggleExpandedVitaminData = (childId) => {
        setExpandedVitaminData(prev => ({
            ...prev,
            [childId]: !prev[childId]
        }));
    };

    const toggleVitaminDatePicker = () => {
        if (!isVitaminDatePickerOpen && vitaminDateButtonRef.current) {
            const rect = vitaminDateButtonRef.current.getBoundingClientRect();
            setVitaminDropdownPos({
                top: rect.bottom + 8,
                left: rect.left
            });
        }
        setIsVitaminDatePickerOpen(!isVitaminDatePickerOpen);
    };

    const handleVitaminDateChange = (dateStr) => {
        setVitaminDate(dateStr);
        setVitaminPickerDate(new Date(dateStr));
    };

    const toggleExpandedImmunizationData = (childId) => {
        setExpandedImmunizationData(prev => ({
            ...prev,
            [childId]: !prev[childId]
        }));
    };

    const toggleImmunizationDatePicker = () => {
        if (!isImmunizationDatePickerOpen && immunizationDateButtonRef.current) {
            const rect = immunizationDateButtonRef.current.getBoundingClientRect();
            setImmunizationDropdownPos({
                top: rect.bottom + 8,
                left: rect.left
            });
        }
        setIsImmunizationDatePickerOpen(!isImmunizationDatePickerOpen);
    };

    const handleImmunizationDateChange = (dateStr) => {
        setImmunizationDate(dateStr);
        setImmunizationPickerDate(new Date(dateStr));
    };

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
                // Initialize weighing data state with today's data if exists
                const initialData = {};
                cachedChildren.forEach(child => {
                    if (child.today_weighing) {
                        initialData[child.id] = {
                            weight_kg: child.today_weighing.weight_kg || '',
                            height_cm: child.today_weighing.height_cm || '',
                            muac_cm: child.today_weighing.muac_cm || '',
                            head_circumference_cm: child.today_weighing.head_circumference_cm || '',
                            notes: child.today_weighing.notes || '',
                        };
                    } else {
                        initialData[child.id] = {
                            weight_kg: '',
                            height_cm: '',
                            muac_cm: '',
                            head_circumference_cm: '',
                            notes: '',
                        };
                    }
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

            // Initialize weighing data state with today's data if exists
            const initialData = {};
            childrenData.forEach(child => {
                if (child.today_weighing) {
                    initialData[child.id] = {
                        weight_kg: child.today_weighing.weight_kg || '',
                        height_cm: child.today_weighing.height_cm || '',
                        muac_cm: child.today_weighing.muac_cm || '',
                        head_circumference_cm: child.today_weighing.head_circumference_cm || '',
                        notes: child.today_weighing.notes || '',
                    };
                } else {
                    initialData[child.id] = {
                        weight_kg: '',
                        height_cm: '',
                        muac_cm: '',
                        head_circumference_cm: '',
                        notes: '',
                    };
                }
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
            if (head < 30) validatedValue = '30';
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

    // Toggle edit mode for a specific child
    const toggleEditMode = (childId) => {
        setEditMode(prev => ({
            ...prev,
            [childId]: !prev[childId]
        }));
    };

    // Check if a child's inputs should be disabled
    const isInputDisabled = (child) => {
        return child.today_weighing && !editMode[child.id];
    };

    // Update existing weighing record
    const updateWeighing = async (child) => {
        const data = weighingData[child.id];
        if (!data) return;

        try {
            setSubmitting(true);
            await api.put(`/kader/weighings/${child.today_weighing.id}`, {
                weight_kg: data.weight_kg || null,
                height_cm: data.height_cm || null,
                muac_cm: data.muac_cm || null,
                head_circumference_cm: data.head_circumference_cm || null,
                notes: data.notes || null,
            });

            // Update local state
            setChildren(prev => prev.map(c => {
                if (c.id === child.id) {
                    return {
                        ...c,
                        today_weighing: {
                            ...c.today_weighing,
                            weight_kg: data.weight_kg || null,
                            height_cm: data.height_cm || null,
                            muac_cm: data.muac_cm || null,
                            head_circumference_cm: data.head_circumference_cm || null,
                            notes: data.notes || null,
                        }
                    };
                }
                return c;
            }));

            // Exit edit mode
            setEditMode(prev => ({
                ...prev,
                [child.id]: false
            }));

            // Invalidate cache
            invalidateCache('kader_weighing_children');

            // Show success feedback
            const successDiv = document.createElement('div');
            successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2 flex items-center gap-2';
            successDiv.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span>Data penimbangan berhasil diperbarui!</span>`;
            document.body.appendChild(successDiv);
            setTimeout(() => successDiv.remove(), 3000);

        } catch (err) {
            console.error('Update weighing error:', err);
            alert(err.response?.data?.message || 'Gagal memperbarui data penimbangan');
        } finally {
            setSubmitting(false);
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
                if (child.today_vitamin) {
                    initialData[child.id] = {
                        vitamin_type: child.today_vitamin.vitamin_type,
                        dosage: child.today_vitamin.dosage || '',
                        notes: child.today_vitamin.notes || '',
                    };
                } else {
                    initialData[child.id] = {
                        vitamin_type: '',
                        dosage: '',
                        notes: '',
                    };
                }
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
        // Special handling for dosage - only allow numbers
        if (field === 'dosage') {
            const numericValue = value.replace(/\D/g, '');
            setVitaminData(prev => ({
                ...prev,
                [childId]: {
                    ...prev[childId],
                    [field]: numericValue
                }
            }));
        } else {
            setVitaminData(prev => ({
                ...prev,
                [childId]: {
                    ...prev[childId],
                    [field]: value
                }
            }));
        }
    };

    // Check if vitamin inputs should be disabled
    const isVitaminInputDisabled = (child) => {
        return child.today_vitamin && !vitaminEditMode[child.id];
    };

    // Toggle vitamin edit mode
    const toggleVitaminEditMode = (childId) => {
        setVitaminEditMode(prev => ({
            ...prev,
            [childId]: !prev[childId]
        }));
    };

    // Update vitamin data
    const updateVitamin = async (child) => {
        const data = vitaminData[child.id];
        if (!data || !child.today_vitamin) return;

        try {
            setSubmitting(true);
            const response = await api.put(`/kader/vitamins/${child.today_vitamin.id}`, {
                vitamin_type: data.vitamin_type,
                dosage: data.dosage,
                notes: data.notes
            });

            if (response.data.success) {
                // Update local state
                setChildren(prev => prev.map(c => {
                    if (c.id === child.id) {
                        return {
                            ...c,
                            today_vitamin: response.data.data
                        };
                    }
                    return c;
                }));

                // Exit edit mode
                setVitaminEditMode(prev => ({ ...prev, [child.id]: false }));

                // Show success feedback
                const successDiv = document.createElement('div');
                successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2 flex items-center gap-2';
                successDiv.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span>Data vitamin berhasil diperbarui!</span>`;
                document.body.appendChild(successDiv);
                setTimeout(() => successDiv.remove(), 3000);
            }
        } catch (error) {
            console.error("Error updating vitamin:", error);
            alert("Gagal memperbarui data vitamin.");
        } finally {
            setSubmitting(false);
        }
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
                if (child.today_immunization) {
                    initialData[child.id] = {
                        vaccine_type: child.today_immunization.vaccine_type,
                        notes: child.today_immunization.notes || '',
                    };
                } else {
                    initialData[child.id] = {
                        vaccine_type: '',
                        notes: '',
                    };
                }
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

    // Check if immunization inputs should be disabled
    const isImunisasiInputDisabled = (child) => {
        return child.today_immunization && !imunisasiEditMode[child.id];
    };

    // Toggle immunization edit mode
    const toggleImunisasiEditMode = (childId) => {
        setImunisasiEditMode(prev => ({
            ...prev,
            [childId]: !prev[childId]
        }));
    };

    // Update immunization data
    const updateImunisasi = async (child) => {
        const data = immunizationData[child.id];
        if (!data || !child.today_immunization) return;

        try {
            setSubmitting(true);
            const response = await api.put(`/kader/immunizations/${child.today_immunization.id}`, {
                vaccine_type: data.vaccine_type,
                notes: data.notes
            });

            if (response.data.success) {
                // Update local state
                setChildren(prev => prev.map(c => {
                    if (c.id === child.id) {
                        return {
                            ...c,
                            today_immunization: response.data.data
                        };
                    }
                    return c;
                }));

                // Exit edit mode
                setImunisasiEditMode(prev => ({ ...prev, [child.id]: false }));

                // Show success feedback
                const successDiv = document.createElement('div');
                successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2 flex items-center gap-2';
                successDiv.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span>Data imunisasi berhasil diperbarui!</span>`;
                document.body.appendChild(successDiv);
                setTimeout(() => successDiv.remove(), 3000);
            }
        } catch (error) {
            console.error("Error updating immunization:", error);
            alert(error.response?.data?.message || "Gagal memperbarui data imunisasi.");
        } finally {
            setSubmitting(false);
        }
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
                                    <p className="font-bold text-yellow-800 text-sm">
                                        {warnings.length} anak sudah ditimbang hari ini
                                    </p>
                                    <p className="text-xs text-yellow-700 mt-1">
                                        Gunakan tombol <span className="font-semibold">Edit</span> untuk memperbarui data.
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {warnings.map((warning, idx) => {
                                            // Extract child name from warning message
                                            const match = warning.match(/Anak '([^']+)'/);
                                            const childName = match ? match[1] : `Anak ${idx + 1}`;
                                            return (
                                                <span key={idx} className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                                                    {childName}
                                                </span>
                                            );
                                        })}
                                    </div>
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
                                            <div key={child.id} className={`p-4 flex flex-col gap-3 border-b border-gray-100 last:border-b-0 ${child.today_weighing && !editMode[child.id] ? 'bg-blue-50/40' : 'bg-white'}`}>
                                                {/* Child Info */}
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-bold text-gray-900">{child.full_name}</span>
                                                            {child.today_weighing && (
                                                                <span className="px-1.5 py-0.5 text-[9px] font-medium bg-blue-100 text-blue-700 rounded-full flex items-center gap-0.5">
                                                                    <Check className="w-2.5 h-2.5" />
                                                                    Sudah
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${child.gender === 'L' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                                                                {child.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                                                            </span>
                                                            <span className="text-xs text-gray-400">•</span>
                                                            <span className="text-xs text-gray-500">{formatAge(child.age_in_months)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        {/* Edit button for today's data */}
                                                        {child.today_weighing && (
                                                            <button
                                                                type="button"
                                                                onClick={() => editMode[child.id] ? updateWeighing(child) : toggleEditMode(child.id)}
                                                                className={`p-2 rounded-lg transition-colors mb-2 ${editMode[child.id]
                                                                    ? 'bg-green-500 text-white hover:bg-green-600 shadow-sm'
                                                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                                                    }`}
                                                                title={editMode[child.id] ? 'Simpan' : 'Edit'}
                                                            >
                                                                {editMode[child.id] ? (
                                                                    <Check className="w-4 h-4" />
                                                                ) : (
                                                                    <Edit2 className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                        )}

                                                        {/* Last Data Toggle */}
                                                        {child.latest_weighing && (
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleExpandedData(child.id)}
                                                                className="flex items-center gap-1 text-[10px] font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors ml-auto"
                                                            >
                                                                {expandedData[child.id] ? 'Tutup' : 'Data Terakhir'}
                                                                {expandedData[child.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                            </button>
                                                        )}

                                                    </div>
                                                </div>

                                                {/* Expanded Last Data Summary */}
                                                <AnimatePresence>
                                                    {child.latest_weighing && expandedData[child.id] && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="bg-gray-50/80 rounded-lg p-3 border border-gray-100/50 mb-3">
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                                                        <Clock className="w-3 h-3 text-gray-400" />
                                                                        Data Terakhir ({new Date(child.latest_weighing.measured_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })})
                                                                    </span>
                                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium border ${getStatusColor(child.latest_weighing.nutritional_status)}`}>
                                                                        {getStatusLabel(child.latest_weighing.nutritional_status)}
                                                                    </span>
                                                                </div>
                                                                <div className="grid grid-cols-4 gap-2 text-center divide-x divide-gray-200">
                                                                    <div className="px-1 first:pl-0">
                                                                        <span className="block text-[9px] text-gray-400 uppercase mb-0.5">Berat</span>
                                                                        <span className="block text-xs font-bold text-gray-700">{child.latest_weighing.weight_kg} kg</span>
                                                                    </div>
                                                                    <div className="px-1">
                                                                        <span className="block text-[9px] text-gray-400 uppercase mb-0.5">Tinggi</span>
                                                                        <span className="block text-xs font-bold text-gray-700">{child.latest_weighing.height_cm} cm</span>
                                                                    </div>
                                                                    <div className="px-1">
                                                                        <span className="block text-[9px] text-gray-400 uppercase mb-0.5">Lengan</span>
                                                                        <span className="block text-xs font-bold text-gray-700">{child.latest_weighing.muac_cm || '-'}</span>
                                                                    </div>
                                                                    <div className="px-1 last:pr-0">
                                                                        <span className="block text-[9px] text-gray-400 uppercase mb-0.5">Kepala</span>
                                                                        <span className="block text-xs font-bold text-gray-700">{child.latest_weighing.head_circumference_cm || '-'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                                {/* Inputs - 2x2 grid on mobile */}
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <div className="flex items-center gap-1 mb-1">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase block">Berat (kg)</label>
                                                            <button
                                                                type="button"
                                                                onClick={() => setWhoModalType('weight')}
                                                                className="p-0.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                                                title="Lihat Standar WHO"
                                                            >
                                                                <FileText className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="1"
                                                            max="30"
                                                            disabled={isInputDisabled(child)}
                                                            value={weighingData[child.id]?.weight_kg || ''}
                                                            onChange={(e) => handleInputChange(child.id, 'weight_kg', e.target.value)}
                                                            onBlur={(e) => handleInputBlur(child.id, 'weight_kg', e.target.value)}
                                                            className={`w-full px-3 py-2 border rounded-lg transition-all text-sm font-medium placeholder:text-gray-400 ${isInputDisabled(child)
                                                                ? 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                                                                : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10'
                                                                }`}
                                                            placeholder="1-30"
                                                        />
                                                        <p className="text-[9px] text-gray-400 mt-0.5">Min 1kg, Max 30kg</p>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-1 mb-1">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase block">Tinggi (cm)</label>
                                                            <button
                                                                type="button"
                                                                onClick={() => setWhoModalType('height')}
                                                                className="p-0.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                                                title="Lihat Standar WHO"
                                                            >
                                                                <FileText className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            min="40"
                                                            max="130"
                                                            disabled={isInputDisabled(child)}
                                                            value={weighingData[child.id]?.height_cm || ''}
                                                            onChange={(e) => handleInputChange(child.id, 'height_cm', e.target.value)}
                                                            onBlur={(e) => handleInputBlur(child.id, 'height_cm', e.target.value)}
                                                            className={`w-full px-3 py-2 border rounded-lg transition-all text-sm font-medium placeholder:text-gray-400 ${isInputDisabled(child)
                                                                ? 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                                                                : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10'
                                                                }`}
                                                            placeholder="40-130"
                                                        />
                                                        <p className="text-[9px] text-gray-400 mt-0.5">Min 40cm, Max 130cm</p>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-1 mb-1">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase block">Lengan (cm)</label>
                                                            <button
                                                                type="button"
                                                                onClick={() => setWhoModalType('muac')}
                                                                className="p-0.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                                                title="Lihat Standar WHO"
                                                            >
                                                                <FileText className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            min="8"
                                                            max="25"
                                                            disabled={isInputDisabled(child)}
                                                            value={weighingData[child.id]?.muac_cm || ''}
                                                            onChange={(e) => handleInputChange(child.id, 'muac_cm', e.target.value)}
                                                            onBlur={(e) => handleInputBlur(child.id, 'muac_cm', e.target.value)}
                                                            className={`w-full px-3 py-2 border rounded-lg transition-all text-sm font-medium placeholder:text-gray-400 ${isInputDisabled(child)
                                                                ? 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                                                                : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10'
                                                                }`}
                                                            placeholder="8-25"
                                                        />
                                                        <p className="text-[9px] text-gray-400 mt-0.5">Min 8cm, Max 25cm</p>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-1 mb-1">
                                                            <label className="text-[10px] font-bold text-gray-500 uppercase block">Kepala (cm)</label>
                                                            <button
                                                                type="button"
                                                                onClick={() => setWhoModalType('head')}
                                                                className="p-0.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                                                title="Lihat Standar WHO"
                                                            >
                                                                <FileText className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            min="30"
                                                            max="60"
                                                            disabled={isInputDisabled(child)}
                                                            value={weighingData[child.id]?.head_circumference_cm || ''}
                                                            onChange={(e) => handleInputChange(child.id, 'head_circumference_cm', e.target.value)}
                                                            onBlur={(e) => handleInputBlur(child.id, 'head_circumference_cm', e.target.value)}
                                                            className={`w-full px-3 py-2 border rounded-lg transition-all text-sm font-medium placeholder:text-gray-400 ${isInputDisabled(child)
                                                                ? 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                                                                : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10'
                                                                }`}
                                                            placeholder="30-60"
                                                        />
                                                        <p className="text-[9px] text-gray-400 mt-0.5">Min 30cm, Max 60cm (WHO)</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <input
                                                        type="text"
                                                        disabled={isInputDisabled(child)}
                                                        value={weighingData[child.id]?.notes || ''}
                                                        onChange={(e) => handleInputChange(child.id, 'notes', e.target.value)}
                                                        className={`w-full px-3 py-2 border rounded-lg transition-all text-sm placeholder:text-gray-400 ${isInputDisabled(child)
                                                            ? 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                                                            : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10'
                                                            }`}
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
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32">
                                                    <div className="flex items-center gap-1">
                                                        Berat (kg)
                                                        <button
                                                            type="button"
                                                            onClick={() => setWhoModalType('weight')}
                                                            className="p-0.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                                            title="Lihat Standar WHO"
                                                        >
                                                            <FileText className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32">
                                                    <div className="flex items-center gap-1">
                                                        Tinggi (cm)
                                                        <button
                                                            type="button"
                                                            onClick={() => setWhoModalType('height')}
                                                            className="p-0.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                                            title="Lihat Standar WHO"
                                                        >
                                                            <FileText className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32">
                                                    <div className="flex items-center gap-1">
                                                        Lengan (cm)
                                                        <button
                                                            type="button"
                                                            onClick={() => setWhoModalType('muac')}
                                                            className="p-0.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                                            title="Lihat Standar WHO"
                                                        >
                                                            <FileText className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32">
                                                    <div className="flex items-center gap-1">
                                                        Kepala (cm)
                                                        <button
                                                            type="button"
                                                            onClick={() => setWhoModalType('head')}
                                                            className="p-0.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                                            title="Lihat Standar WHO"
                                                        >
                                                            <FileText className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider min-w-[200px]">Catatan</th>
                                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filteredChildren.length === 0 ? (
                                                <tr>
                                                    <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                                                        {searchQuery ? `Tidak ada anak dengan nama "${searchQuery}"` : 'Belum ada data anak yang terdaftar.'}
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredChildren.map((child, index) => (
                                                    <tr key={child.id} className={`group transition-colors ${child.today_weighing && !editMode[child.id] ? 'bg-blue-50/40 hover:bg-blue-100/50' : 'hover:bg-blue-50/30'}`}>
                                                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                                            {index + 1}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                                        {child.full_name}
                                                                    </span>
                                                                    {child.today_weighing && (
                                                                        <span className="px-1.5 py-0.5 text-[9px] font-medium bg-blue-100 text-blue-700 rounded-full flex items-center gap-0.5">
                                                                            <Check className="w-2.5 h-2.5" />
                                                                            Sudah
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${child.gender === 'L' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                                                                        {child.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                                                                    </span>
                                                                    <span className="text-xs text-gray-400">•</span>
                                                                    <span className="text-xs text-gray-500">{formatAge(child.age_in_months)}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 cursor-pointer align-top" onClick={() => toggleExpandedData(child.id)}>
                                                            {child.latest_weighing ? (
                                                                expandedData[child.id] ? (
                                                                    <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100 min-w-[200px] shadow-sm animate-in fade-in zoom-in-95 duration-200">
                                                                        <div className="flex justify-between items-start mb-2 pb-2 border-b border-gray-200/60">
                                                                            <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                                                                                <Clock className="w-3 h-3 text-gray-400" />
                                                                                {new Date(child.latest_weighing.measured_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                            </span>
                                                                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium border ${getStatusColor(child.latest_weighing.nutritional_status)}`}>
                                                                                {getStatusLabel(child.latest_weighing.nutritional_status)}
                                                                            </span>
                                                                        </div>
                                                                        <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
                                                                            <div className="flex justify-between items-center text-xs">
                                                                                <span className="text-gray-400 text-[10px] uppercase font-medium">BB</span>
                                                                                <span className="font-bold text-gray-700">{child.latest_weighing.weight_kg} kg</span>
                                                                            </div>
                                                                            <div className="flex justify-between items-center text-xs">
                                                                                <span className="text-gray-400 text-[10px] uppercase font-medium">TB</span>
                                                                                <span className="font-bold text-gray-700">{child.latest_weighing.height_cm} cm</span>
                                                                            </div>
                                                                            <div className="flex justify-between items-center text-xs">
                                                                                <span className="text-gray-400 text-[10px] uppercase font-medium">LILA</span>
                                                                                <span className="font-bold text-gray-700">{child.latest_weighing.muac_cm || '-'}</span>
                                                                            </div>
                                                                            <div className="flex justify-between items-center text-xs">
                                                                                <span className="text-gray-400 text-[10px] uppercase font-medium">LK</span>
                                                                                <span className="font-bold text-gray-700">{child.latest_weighing.head_circumference_cm || '-'}</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="mt-2 pt-1 border-t border-gray-100 text-center">
                                                                            <span className="text-[10px] text-blue-500 hover:text-blue-700 flex items-center justify-center gap-1">
                                                                                <ChevronUp className="w-3 h-3" /> Tutup
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex flex-col gap-1 group">
                                                                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                                                                            <span>{child.latest_weighing.weight_kg} kg</span>
                                                                            <span className="text-gray-300">/</span>
                                                                            <span>{child.latest_weighing.height_cm} cm</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="text-[10px] text-gray-400">
                                                                                {new Date(child.latest_weighing.measured_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                                            </span>
                                                                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400">
                                                                                <ChevronDown className="w-3 h-3" />
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            ) : (
                                                                <span className="text-xs text-gray-400 italic px-2">Belum ada data</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                max="100"
                                                                disabled={isInputDisabled(child)}
                                                                value={weighingData[child.id]?.weight_kg || ''}
                                                                onChange={(e) => handleInputChange(child.id, 'weight_kg', e.target.value)}
                                                                onBlur={(e) => handleInputBlur(child.id, 'weight_kg', e.target.value)}
                                                                className={`w-full px-3 py-2 border rounded-lg transition-all text-sm font-medium placeholder:text-gray-400 ${isInputDisabled(child)
                                                                    ? 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                                                                    : 'bg-gray-50 border-transparent text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                                                                    }`}
                                                                placeholder="1"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                min="0"
                                                                max="200"
                                                                disabled={isInputDisabled(child)}
                                                                value={weighingData[child.id]?.height_cm || ''}
                                                                onChange={(e) => handleInputChange(child.id, 'height_cm', e.target.value)}
                                                                onBlur={(e) => handleInputBlur(child.id, 'height_cm', e.target.value)}
                                                                className={`w-full px-3 py-2 border rounded-lg transition-all text-sm font-medium placeholder:text-gray-400 ${isInputDisabled(child)
                                                                    ? 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                                                                    : 'bg-gray-50 border-transparent text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                                                                    }`}
                                                                placeholder="40"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                min="0"
                                                                max="50"
                                                                disabled={isInputDisabled(child)}
                                                                value={weighingData[child.id]?.muac_cm || ''}
                                                                onChange={(e) => handleInputChange(child.id, 'muac_cm', e.target.value)}
                                                                onBlur={(e) => handleInputBlur(child.id, 'muac_cm', e.target.value)}
                                                                className={`w-full px-3 py-2 border rounded-lg transition-all text-sm font-medium placeholder:text-gray-400 ${isInputDisabled(child)
                                                                    ? 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                                                                    : 'bg-gray-50 border-transparent text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                                                                    }`}
                                                                placeholder="8"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                min="30"
                                                                max="60"
                                                                disabled={isInputDisabled(child)}
                                                                value={weighingData[child.id]?.head_circumference_cm || ''}
                                                                onChange={(e) => handleInputChange(child.id, 'head_circumference_cm', e.target.value)}
                                                                onBlur={(e) => handleInputBlur(child.id, 'head_circumference_cm', e.target.value)}
                                                                className={`w-full px-3 py-2 border rounded-lg transition-all text-sm font-medium placeholder:text-gray-400 ${isInputDisabled(child)
                                                                    ? 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                                                                    : 'bg-gray-50 border-transparent text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                                                                    }`}
                                                                placeholder="30"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <input
                                                                type="text"
                                                                disabled={isInputDisabled(child)}
                                                                value={weighingData[child.id]?.notes || ''}
                                                                onChange={(e) => handleInputChange(child.id, 'notes', e.target.value)}
                                                                className={`w-full px-3 py-2 border rounded-lg transition-all text-sm placeholder:text-gray-400 ${isInputDisabled(child)
                                                                    ? 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                                                                    : 'bg-gray-50 border-transparent text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                                                                    }`}
                                                                placeholder="Catatan..."
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            {child.today_weighing ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => editMode[child.id] ? updateWeighing(child) : toggleEditMode(child.id)}
                                                                    className={`p-2 rounded-lg transition-colors flex items-center justify-center mx-auto shadow-sm ${editMode[child.id]
                                                                        ? 'bg-green-500 text-white hover:bg-green-600'
                                                                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                                                        }`}
                                                                    title={editMode[child.id] ? 'Simpan' : 'Edit'}
                                                                >
                                                                    {editMode[child.id] ? (
                                                                        <Check className="w-4 h-4" />
                                                                    ) : (
                                                                        <Edit2 className="w-4 h-4" />
                                                                    )}
                                                                </button>
                                                            ) : (
                                                                <span className="text-xs text-gray-400">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Footer / Submit - Fixed at bottom */}
                            < div className="p-6 border-t border-gray-100 bg-white flex-shrink-0" >
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
                                        Tanggal Pemberian Vitamin
                                    </label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            ref={vitaminDateButtonRef}
                                            onClick={toggleVitaminDatePicker}
                                            className="w-full md:w-64 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-left text-gray-900 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all flex items-center justify-between hover:bg-gray-50 hover:border-gray-300"
                                        >
                                            <span className="font-medium">
                                                {new Date(vitaminDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                        </button>

                                        {isVitaminDatePickerOpen && createPortal(
                                            <>
                                                <div
                                                    className="fixed inset-0 z-9998 bg-transparent"
                                                    onClick={() => setIsVitaminDatePickerOpen(false)}
                                                />
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    transition={{ duration: 0.2 }}
                                                    style={{
                                                        top: vitaminDropdownPos.top,
                                                        left: vitaminDropdownPos.left
                                                    }}
                                                    className="fixed z-9999 p-4 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl w-[320px]"
                                                >
                                                    {/* Calendar Header */}
                                                    <div className="flex items-center justify-between mb-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => setVitaminPickerDate(new Date(vitaminPickerDate.setMonth(vitaminPickerDate.getMonth() - 1)))}
                                                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                                        >
                                                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                                                        </button>
                                                        <span className="font-semibold text-gray-800">
                                                            {vitaminPickerDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setVitaminPickerDate(new Date(vitaminPickerDate.setMonth(vitaminPickerDate.getMonth() + 1)))}
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
                                                            const daysInMonth = new Date(vitaminPickerDate.getFullYear(), vitaminPickerDate.getMonth() + 1, 0).getDate();
                                                            const firstDay = new Date(vitaminPickerDate.getFullYear(), vitaminPickerDate.getMonth(), 1).getDay();
                                                            const days = [];

                                                            for (let i = 0; i < firstDay; i++) {
                                                                days.push(<div key={`empty-${i}`} className="w-10 h-10" />);
                                                            }

                                                            for (let i = 1; i <= daysInMonth; i++) {
                                                                const currentDateStr = `${vitaminPickerDate.getFullYear()}-${String(vitaminPickerDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                                                                const isSelected = vitaminDate === currentDateStr;
                                                                const isToday = new Date().toISOString().split('T')[0] === currentDateStr;

                                                                days.push(
                                                                    <button
                                                                        key={i}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            handleVitaminDateChange(currentDateStr);
                                                                            setIsVitaminDatePickerOpen(false);
                                                                        }}
                                                                        className={`w-10 h-10 text-sm rounded-full flex items-center justify-center transition-all
                                                                    ${isSelected
                                                                                ? 'bg-green-600 text-white shadow-md shadow-green-500/30'
                                                                                : isToday
                                                                                    ? 'text-green-600 font-bold bg-green-50'
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
                                                                handleVitaminDateChange(todayStr);
                                                                setVitaminPickerDate(today);
                                                                setIsVitaminDatePickerOpen(false);
                                                            }}
                                                            className="w-full text-xs text-green-600 hover:text-green-800 font-medium px-2 py-1.5 rounded hover:bg-green-50 transition-colors text-center"
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

                                <div className="flex items-center gap-2 text-sm text-gray-500 bg-green-50/50 px-4 py-2 rounded-lg border border-green-100">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
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
                                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
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
                                            <div key={child.id} className="p-4 bg-white flex flex-col gap-3 border-b border-gray-100 last:border-b-0">
                                                {/* Child Info */}
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-bold text-gray-900">{child.full_name}</span>
                                                            {child.today_vitamin && (
                                                                <span className="px-1.5 py-0.5 text-[9px] font-medium bg-green-100 text-green-700 rounded-full flex items-center gap-0.5">
                                                                    <Check className="w-2.5 h-2.5" />
                                                                    Sudah
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${child.gender === 'L' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                                                                {child.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                                                            </span>
                                                            <span className="text-xs text-gray-400">•</span>
                                                            <span className="text-xs text-gray-500">{formatAge(child.age_in_months)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        {/* Edit button for today's data */}
                                                        {child.today_vitamin && (
                                                            <button
                                                                type="button"
                                                                onClick={() => vitaminEditMode[child.id] ? updateVitamin(child) : toggleVitaminEditMode(child.id)}
                                                                className={`p-2 rounded-lg transition-colors mb-2 ${vitaminEditMode[child.id]
                                                                    ? 'bg-green-500 text-white hover:bg-green-600 shadow-sm'
                                                                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                                                    }`}
                                                                title={vitaminEditMode[child.id] ? 'Simpan' : 'Edit'}
                                                            >
                                                                {vitaminEditMode[child.id] ? (
                                                                    <Check className="w-4 h-4" />
                                                                ) : (
                                                                    <Edit2 className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                        )}

                                                        {/* Last Data Toggle */}
                                                        {child.latest_vitamin && (
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleExpandedVitaminData(child.id)}
                                                                className="flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-50 hover:bg-green-100 px-2 py-1 rounded-lg transition-colors ml-auto"
                                                            >
                                                                {expandedVitaminData[child.id] ? 'Tutup' : 'Data Terakhir'}
                                                                {expandedVitaminData[child.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Expanded Last Data Summary */}
                                                <AnimatePresence>
                                                    {child.latest_vitamin && expandedVitaminData[child.id] && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="bg-green-50/80 rounded-lg p-3 border border-green-100/50 mb-2">
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                                                        <Clock className="w-3 h-3 text-gray-400" />
                                                                        Data Terakhir ({new Date(child.latest_vitamin.distribution_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })})
                                                                    </span>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-2 text-center divide-x divide-green-200">
                                                                    <div className="px-1 first:pl-0">
                                                                        <span className="block text-[9px] text-gray-400 uppercase mb-0.5">Jenis</span>
                                                                        <span className="block text-xs font-bold text-gray-700">
                                                                            {child.latest_vitamin.vitamin_type === 'vitamin_a_blue' ? 'Vit A Biru' : child.latest_vitamin.vitamin_type === 'vitamin_a_red' ? 'Vit A Merah' : 'Lainnya'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="px-1">
                                                                        <span className="block text-[9px] text-gray-400 uppercase mb-0.5">Dosis</span>
                                                                        <span className="block text-xs font-bold text-gray-700">{child.latest_vitamin.dosage || '-'}</span>
                                                                    </div>
                                                                </div>
                                                                {child.latest_vitamin.notes && (
                                                                    <div className="mt-2 pt-2 border-t border-green-200">
                                                                        <span className="text-[9px] text-gray-400 uppercase">Catatan:</span>
                                                                        <p className="text-xs text-gray-600 mt-0.5">{child.latest_vitamin.notes}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                {/* Inputs - 2x2 grid on mobile */}
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="col-span-2">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Jenis Vitamin *</label>
                                                        <select
                                                            disabled={isVitaminInputDisabled(child)}
                                                            value={vitaminData[child.id]?.vitamin_type || ''}
                                                            onChange={(e) => handleVitaminInputChange(child.id, 'vitamin_type', e.target.value)}
                                                            className={`w-full px-3 py-2 border rounded-lg transition-all text-sm font-medium ${isVitaminInputDisabled(child)
                                                                ? 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                                                                : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/10'
                                                                }`}
                                                        >
                                                            <option value="">Pilih Vitamin</option>
                                                            <option value="vitamin_a_blue">🔵 Vitamin A Biru (100.000 IU)</option>
                                                            <option value="vitamin_a_red">🔴 Vitamin A Merah (200.000 IU)</option>
                                                            <option value="other">📦 Lainnya</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Dosis</label>
                                                        <input
                                                            type="text"
                                                            disabled={isVitaminInputDisabled(child)}
                                                            value={vitaminData[child.id]?.dosage || ''}
                                                            onChange={(e) => handleVitaminInputChange(child.id, 'dosage', e.target.value)}
                                                            className={`w-full px-3 py-2 border rounded-lg transition-all text-sm ${isVitaminInputDisabled(child)
                                                                ? 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                                                                : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/10'
                                                                }`}
                                                            placeholder="1"
                                                            inputMode="numeric"
                                                            pattern="[0-9]*"
                                                        />
                                                        <p className="text-[9px] text-gray-400 mt-0.5">Opsional</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Catatan</label>
                                                        <input
                                                            type="text"
                                                            disabled={isVitaminInputDisabled(child)}
                                                            value={vitaminData[child.id]?.notes || ''}
                                                            onChange={(e) => handleVitaminInputChange(child.id, 'notes', e.target.value)}
                                                            className={`w-full px-3 py-2 border rounded-lg transition-all text-sm ${isVitaminInputDisabled(child)
                                                                ? 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
                                                                : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/10'
                                                                }`}
                                                            placeholder="Catatan..."
                                                        />
                                                        <p className="text-[9px] text-gray-400 mt-0.5">Opsional</p>
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
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Data Terakhir</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-64">Jenis Vitamin *</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Dosis</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider min-w-[200px]">Catatan</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Aksi</th>
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
                                                    <tr key={child.id} className={`group transition-colors ${child.today_vitamin ? 'bg-green-50/60 hover:bg-green-100/60' : 'hover:bg-green-50/30'}`}>
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
                                                        <td className="px-6 py-4 cursor-pointer align-top" onClick={() => toggleExpandedVitaminData(child.id)}>
                                                            {child.latest_vitamin ? (
                                                                expandedVitaminData[child.id] ? (
                                                                    <div className="bg-green-50 rounded-lg p-2.5 border border-green-100 min-w-[200px] shadow-sm animate-in fade-in zoom-in-95 duration-200">
                                                                        <div className="flex justify-between items-start mb-2 pb-2 border-b border-green-200/60">
                                                                            <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                                                                                <Clock className="w-3 h-3 text-gray-400" />
                                                                                {new Date(child.latest_vitamin.distribution_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                            </span>
                                                                        </div>
                                                                        <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
                                                                            <div className="flex justify-between items-center text-xs">
                                                                                <span className="text-gray-400 text-[10px] uppercase font-medium">Jenis</span>
                                                                                <span className="font-bold text-gray-700">
                                                                                    {child.latest_vitamin.vitamin_type === 'vitamin_a_blue' ? 'Vit A Biru' : child.latest_vitamin.vitamin_type === 'vitamin_a_red' ? 'Vit A Merah' : 'Lainnya'}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex justify-between items-center text-xs">
                                                                                <span className="text-gray-400 text-[10px] uppercase font-medium">Dosis</span>
                                                                                <span className="font-bold text-gray-700">{child.latest_vitamin.dosage || '-'}</span>
                                                                            </div>
                                                                        </div>
                                                                        {child.latest_vitamin.notes && (
                                                                            <div className="mt-2 pt-1.5 border-t border-green-200/60">
                                                                                <span className="text-[9px] text-gray-400 uppercase">Catatan:</span>
                                                                                <p className="text-xs text-gray-600 mt-0.5">{child.latest_vitamin.notes}</p>
                                                                            </div>
                                                                        )}
                                                                        <div className="mt-2 pt-1 border-t border-green-100 text-center">
                                                                            <span className="text-[10px] text-green-500 hover:text-green-700 flex items-center justify-center gap-1">
                                                                                <ChevronUp className="w-3 h-3" /> Tutup
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex flex-col gap-1 group">
                                                                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 group-hover:text-green-600 transition-colors">
                                                                            <Pill className="w-3.5 h-3.5" />
                                                                            <span>{child.latest_vitamin.vitamin_type === 'vitamin_a_blue' ? 'Vit A Biru' : child.latest_vitamin.vitamin_type === 'vitamin_a_red' ? 'Vit A Merah' : 'Lainnya'}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="text-[10px] text-gray-400">
                                                                                {new Date(child.latest_vitamin.distribution_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                                            </span>
                                                                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-green-400">
                                                                                <ChevronDown className="w-3 h-3" />
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            ) : (
                                                                <span className="text-xs text-gray-400 italic px-2">Belum ada data</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <select
                                                                disabled={isVitaminInputDisabled(child)}
                                                                value={vitaminData[child.id]?.vitamin_type || ''}
                                                                onChange={(e) => handleVitaminInputChange(child.id, 'vitamin_type', e.target.value)}
                                                                className={`w-full px-3 py-2 border rounded-lg transition-all text-sm font-medium ${isVitaminInputDisabled(child)
                                                                    ? 'bg-transparent border-transparent text-gray-600 cursor-not-allowed'
                                                                    : 'bg-gray-50 border-transparent text-gray-900 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10'
                                                                    }`}
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
                                                                disabled={isVitaminInputDisabled(child)}
                                                                value={vitaminData[child.id]?.dosage || ''}
                                                                onChange={(e) => handleVitaminInputChange(child.id, 'dosage', e.target.value)}
                                                                className={`w-full px-3 py-2 border rounded-lg transition-all text-sm ${isVitaminInputDisabled(child)
                                                                    ? 'bg-transparent border-transparent text-gray-600 cursor-not-allowed'
                                                                    : 'bg-gray-50 border-transparent text-gray-900 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 placeholder:text-gray-400'
                                                                    }`}
                                                                placeholder="1"
                                                                inputMode="numeric"
                                                                pattern="[0-9]*"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <input
                                                                type="text"
                                                                disabled={isVitaminInputDisabled(child)}
                                                                value={vitaminData[child.id]?.notes || ''}
                                                                onChange={(e) => handleVitaminInputChange(child.id, 'notes', e.target.value)}
                                                                className={`w-full px-3 py-2 border rounded-lg transition-all text-sm ${isVitaminInputDisabled(child)
                                                                    ? 'bg-transparent border-transparent text-gray-600 cursor-not-allowed'
                                                                    : 'bg-gray-50 border-transparent text-gray-900 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 placeholder:text-gray-400'
                                                                    }`}
                                                                placeholder="Catatan..."
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {child.today_vitamin && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => vitaminEditMode[child.id] ? updateVitamin(child) : toggleVitaminEditMode(child.id)}
                                                                    className={`p-2 rounded-lg transition-all shadow-sm ${vitaminEditMode[child.id]
                                                                        ? 'bg-green-500 text-white hover:bg-green-600 hover:shadow-green-500/30'
                                                                        : 'bg-white border border-amber-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300'
                                                                        }`}
                                                                    title={vitaminEditMode[child.id] ? 'Simpan Perubahan' : 'Edit Data'}
                                                                >
                                                                    {vitaminEditMode[child.id] ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                                                                </button>
                                                            )}
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
                                    <div className="relative">
                                        <button
                                            type="button"
                                            ref={immunizationDateButtonRef}
                                            onClick={toggleImmunizationDatePicker}
                                            className="w-full md:w-64 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-left text-gray-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all flex items-center justify-between hover:bg-gray-50 hover:border-gray-300"
                                        >
                                            <span className="font-medium">
                                                {new Date(immunizationDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                        </button>

                                        {isImmunizationDatePickerOpen && createPortal(
                                            <>
                                                <div
                                                    className="fixed inset-0 z-9998 bg-transparent"
                                                    onClick={() => setIsImmunizationDatePickerOpen(false)}
                                                />
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    transition={{ duration: 0.2 }}
                                                    style={{
                                                        top: immunizationDropdownPos.top,
                                                        left: immunizationDropdownPos.left
                                                    }}
                                                    className="fixed z-9999 p-4 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl w-[320px]"
                                                >
                                                    {/* Calendar Header */}
                                                    <div className="flex items-center justify-between mb-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => setImmunizationPickerDate(new Date(immunizationPickerDate.setMonth(immunizationPickerDate.getMonth() - 1)))}
                                                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                                        >
                                                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                                                        </button>
                                                        <span className="font-semibold text-gray-800">
                                                            {immunizationPickerDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setImmunizationPickerDate(new Date(immunizationPickerDate.setMonth(immunizationPickerDate.getMonth() + 1)))}
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
                                                            const daysInMonth = new Date(immunizationPickerDate.getFullYear(), immunizationPickerDate.getMonth() + 1, 0).getDate();
                                                            const firstDay = new Date(immunizationPickerDate.getFullYear(), immunizationPickerDate.getMonth(), 1).getDay();
                                                            const days = [];

                                                            for (let i = 0; i < firstDay; i++) {
                                                                days.push(<div key={`empty-${i}`} className="w-10 h-10" />);
                                                            }

                                                            for (let i = 1; i <= daysInMonth; i++) {
                                                                const currentDateStr = `${immunizationPickerDate.getFullYear()}-${String(immunizationPickerDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                                                                const isSelected = immunizationDate === currentDateStr;
                                                                const isToday = new Date().toISOString().split('T')[0] === currentDateStr;

                                                                days.push(
                                                                    <button
                                                                        key={i}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            handleImmunizationDateChange(currentDateStr);
                                                                            setIsImmunizationDatePickerOpen(false);
                                                                        }}
                                                                        className={`w-10 h-10 text-sm rounded-full flex items-center justify-center transition-all
                                                                    ${isSelected
                                                                                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                                                                                : isToday
                                                                                    ? 'text-purple-600 font-bold bg-purple-50'
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
                                                                handleImmunizationDateChange(todayStr);
                                                                setImmunizationPickerDate(today);
                                                                setIsImmunizationDatePickerOpen(false);
                                                            }}
                                                            className="w-full text-xs text-purple-600 hover:text-purple-800 font-medium px-2 py-1.5 rounded hover:bg-purple-50 transition-colors text-center"
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

                                <div className="flex items-center gap-2 text-sm text-gray-500 bg-purple-50/50 px-4 py-2 rounded-lg border border-purple-100">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
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
                                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
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
                                            <div key={child.id} className="p-4 bg-white flex flex-col gap-3 border-b border-gray-100 last:border-b-0">
                                                {/* Child Info */}
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-bold text-gray-900">{child.full_name}</span>
                                                            {child.today_immunization && (
                                                                <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-purple-200">
                                                                    <Check className="w-3 h-3" /> Sudah
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${child.gender === 'L' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                                                                {child.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                                                            </span>
                                                            <span className="text-xs text-gray-400">•</span>
                                                            <span className="text-xs text-gray-500">{formatAge(child.age_in_months)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        {/* Last Data Toggle */}
                                                        {child.today_immunization && (
                                                            <button
                                                                type="button"
                                                                onClick={() => imunisasiEditMode[child.id] ? updateImunisasi(child) : toggleImunisasiEditMode(child.id)}
                                                                className={`p-2 rounded-lg transition-colors mb-2 ml-auto ${imunisasiEditMode[child.id]
                                                                    ? 'bg-green-500 text-white hover:bg-green-600 shadow-sm'
                                                                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                                                    }`}
                                                                title={imunisasiEditMode[child.id] ? 'Simpan' : 'Edit'}
                                                            >
                                                                {imunisasiEditMode[child.id] ? (
                                                                    <Check className="w-4 h-4" />
                                                                ) : (
                                                                    <Edit2 className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                        )}
                                                        {child.latest_immunization && (
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleExpandedImmunizationData(child.id)}
                                                                className="flex items-center gap-1 text-[10px] font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded-lg transition-colors ml-auto"
                                                            >
                                                                {expandedImmunizationData[child.id] ? 'Tutup' : 'Data Terakhir'}
                                                                {expandedImmunizationData[child.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Expanded Last Data Summary */}
                                                <AnimatePresence>
                                                    {child.latest_immunization && expandedImmunizationData[child.id] && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="bg-purple-50/80 rounded-lg p-3 border border-purple-100/50 mb-2">
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                                                        <Clock className="w-3 h-3 text-gray-400" />
                                                                        Data Terakhir ({new Date(child.latest_immunization.immunization_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })})
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Syringe className="w-4 h-4 text-purple-600" />
                                                                    <span className="text-xs font-bold text-gray-700">
                                                                        {child.latest_immunization.vaccine_type.replace(/_/g, ' ').toUpperCase()}
                                                                    </span>
                                                                </div>
                                                                {child.latest_immunization.notes && (
                                                                    <div className="mt-2 pt-2 border-t border-purple-200">
                                                                        <span className="text-[9px] text-gray-400 uppercase">Catatan:</span>
                                                                        <p className="text-xs text-gray-600 mt-0.5">{child.latest_immunization.notes}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                {/* Inputs */}
                                                <div className="grid grid-cols-1 gap-2">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Jenis Vaksin *</label>
                                                        <select
                                                            value={immunizationData[child.id]?.vaccine_type || ''}
                                                            onChange={(e) => handleImmunizationInputChange(child.id, 'vaccine_type', e.target.value)}
                                                            disabled={isImunisasiInputDisabled(child)}
                                                            className={`w-full px-3 py-2 border rounded-lg transition-all text-sm font-medium ${isImunisasiInputDisabled(child)
                                                                ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                                                                : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10'
                                                                }`}
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
                                                            disabled={isImunisasiInputDisabled(child)}
                                                            className={`w-full px-3 py-2 border rounded-lg transition-all text-sm ${isImunisasiInputDisabled(child)
                                                                ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                                                                : 'bg-gray-50 border-gray-200 text-gray-900 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10'
                                                                }`}
                                                            placeholder="Catatan tambahan..."
                                                        />
                                                        <p className="text-[9px] text-gray-400 mt-0.5">Opsional</p>
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
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Data Terakhir</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-64">Jenis Vaksin *</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider min-w-[200px]">Catatan</th>
                                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Aksi</th>
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
                                                    <tr key={child.id} className={`group transition-colors ${child.today_immunization ? 'bg-purple-50/60' : 'hover:bg-purple-50/30'}`}>
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
                                                        <td className="px-6 py-4 cursor-pointer align-top" onClick={() => toggleExpandedImmunizationData(child.id)}>
                                                            {child.latest_immunization ? (
                                                                expandedImmunizationData[child.id] ? (
                                                                    <div className="bg-purple-50 rounded-lg p-2.5 border border-purple-100 min-w-[200px] shadow-sm animate-in fade-in zoom-in-95 duration-200">
                                                                        <div className="flex justify-between items-start mb-2 pb-2 border-b border-purple-200/60">
                                                                            <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                                                                                <Clock className="w-3 h-3 text-gray-400" />
                                                                                {new Date(child.latest_immunization.immunization_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <Syringe className="w-4 h-4 text-purple-600" />
                                                                            <span className="text-xs font-bold text-gray-700">
                                                                                {child.latest_immunization.vaccine_type.replace(/_/g, ' ').toUpperCase()}
                                                                            </span>
                                                                        </div>
                                                                        {child.latest_immunization.notes && (
                                                                            <div className="mt-2 pt-1.5 border-t border-purple-200/60">
                                                                                <span className="text-[9px] text-gray-400 uppercase">Catatan:</span>
                                                                                <p className="text-xs text-gray-600 mt-0.5">{child.latest_immunization.notes}</p>
                                                                            </div>
                                                                        )}
                                                                        <div className="mt-2 pt-1 border-t border-purple-100 text-center">
                                                                            <span className="text-[10px] text-purple-500 hover:text-purple-700 flex items-center justify-center gap-1">
                                                                                <ChevronUp className="w-3 h-3" /> Tutup
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex flex-col gap-1 group">
                                                                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 group-hover:text-purple-600 transition-colors">
                                                                            <Syringe className="w-3.5 h-3.5" />
                                                                            <span className="truncate max-w-[150px]">{child.latest_immunization.vaccine_type.replace(/_/g, ' ').toUpperCase()}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="text-[10px] text-gray-400">
                                                                                {new Date(child.latest_immunization.immunization_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                                            </span>
                                                                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-400">
                                                                                <ChevronDown className="w-3 h-3" />
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            ) : (
                                                                <span className="text-xs text-gray-400 italic px-2">Belum ada data</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <select
                                                                value={immunizationData[child.id]?.vaccine_type || ''}
                                                                onChange={(e) => handleImmunizationInputChange(child.id, 'vaccine_type', e.target.value)}
                                                                disabled={isImunisasiInputDisabled(child)}
                                                                className={`w-full px-3 py-2 border rounded-lg transition-all text-sm font-medium ${isImunisasiInputDisabled(child)
                                                                    ? 'bg-transparent border-transparent text-gray-500 cursor-not-allowed'
                                                                    : 'bg-gray-50 border-transparent text-gray-900 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'
                                                                    }`}
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
                                                                disabled={isImunisasiInputDisabled(child)}
                                                                className={`w-full px-3 py-2 border rounded-lg transition-all text-sm placeholder:text-gray-400 ${isImunisasiInputDisabled(child)
                                                                    ? 'bg-transparent border-transparent text-gray-500 cursor-not-allowed'
                                                                    : 'bg-gray-50 border-transparent text-gray-900 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'
                                                                    }`}
                                                                placeholder="Catatan..."
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            {child.today_immunization ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => imunisasiEditMode[child.id] ? updateImunisasi(child) : toggleImunisasiEditMode(child.id)}
                                                                    className={`p-2 rounded-lg transition-colors flex items-center justify-center mx-auto shadow-sm ${imunisasiEditMode[child.id]
                                                                        ? 'bg-green-500 text-white hover:bg-green-600'
                                                                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                                                        }`}
                                                                    title={imunisasiEditMode[child.id] ? 'Simpan' : 'Edit'}
                                                                >
                                                                    {imunisasiEditMode[child.id] ? (
                                                                        <Check className="w-4 h-4" />
                                                                    ) : (
                                                                        <Edit2 className="w-4 h-4" />
                                                                    )}
                                                                </button>
                                                            ) : (
                                                                <span className="text-xs text-gray-400">-</span>
                                                            )}
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

            {/* WHO Standards Modal */}
            <AnimatePresence>
                {whoModalType && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setWhoModalType(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative z-10 overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            {/* Header */}
                            <div className={`px-6 py-4 border-b flex items-center justify-between ${whoModalType === 'weight' ? 'bg-green-50 border-green-100' :
                                whoModalType === 'height' ? 'bg-purple-50 border-purple-100' :
                                    whoModalType === 'muac' ? 'bg-teal-50 border-teal-100' :
                                        'bg-blue-50 border-blue-100'
                                }`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${whoModalType === 'weight' ? 'bg-green-100' :
                                        whoModalType === 'height' ? 'bg-purple-100' :
                                            whoModalType === 'muac' ? 'bg-teal-100' :
                                                'bg-blue-100'
                                        }`}>
                                        <FileText className={`w-5 h-5 ${whoModalType === 'weight' ? 'text-green-600' :
                                            whoModalType === 'height' ? 'text-purple-600' :
                                                whoModalType === 'muac' ? 'text-teal-600' :
                                                    'text-blue-600'
                                            }`} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {whoModalType === 'weight' && 'Standar Berat Badan WHO'}
                                            {whoModalType === 'height' && 'Standar Tinggi/Panjang Badan WHO'}
                                            {whoModalType === 'muac' && 'Standar Lingkar Lengan Atas WHO'}
                                            {whoModalType === 'head' && 'Standar Lingkar Kepala WHO'}
                                        </h3>
                                        <p className="text-xs text-gray-500">Referensi Anak 0-5 Tahun</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setWhoModalType(null)}
                                    className="p-2 hover:bg-white/50 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto">
                                {/* Weight Standards */}
                                {whoModalType === 'weight' && (
                                    <div className="space-y-4">
                                        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                                            <h4 className="font-bold text-green-800 mb-3">Berat Badan berdasarkan Usia</h4>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="border-b border-green-200">
                                                            <th className="py-2 px-3 text-left text-green-700 font-semibold">Usia</th>
                                                            <th className="py-2 px-3 text-center text-green-700 font-semibold">Laki-laki</th>
                                                            <th className="py-2 px-3 text-center text-green-700 font-semibold">Perempuan</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="text-gray-700">
                                                        <tr className="border-b border-green-100">
                                                            <td className="py-2 px-3 font-medium">Lahir</td>
                                                            <td className="py-2 px-3 text-center">2.5 - 4.4 kg</td>
                                                            <td className="py-2 px-3 text-center">2.4 - 4.2 kg</td>
                                                        </tr>
                                                        <tr className="border-b border-green-100">
                                                            <td className="py-2 px-3 font-medium">3 bulan</td>
                                                            <td className="py-2 px-3 text-center">5.0 - 8.0 kg</td>
                                                            <td className="py-2 px-3 text-center">4.5 - 7.5 kg</td>
                                                        </tr>
                                                        <tr className="border-b border-green-100">
                                                            <td className="py-2 px-3 font-medium">6 bulan</td>
                                                            <td className="py-2 px-3 text-center">6.4 - 9.8 kg</td>
                                                            <td className="py-2 px-3 text-center">5.8 - 9.2 kg</td>
                                                        </tr>
                                                        <tr className="border-b border-green-100">
                                                            <td className="py-2 px-3 font-medium">12 bulan</td>
                                                            <td className="py-2 px-3 text-center">7.8 - 11.8 kg</td>
                                                            <td className="py-2 px-3 text-center">7.1 - 11.3 kg</td>
                                                        </tr>
                                                        <tr className="border-b border-green-100">
                                                            <td className="py-2 px-3 font-medium">2 tahun</td>
                                                            <td className="py-2 px-3 text-center">9.8 - 15.1 kg</td>
                                                            <td className="py-2 px-3 text-center">9.2 - 14.6 kg</td>
                                                        </tr>
                                                        <tr className="border-b border-green-100">
                                                            <td className="py-2 px-3 font-medium">3 tahun</td>
                                                            <td className="py-2 px-3 text-center">11.3 - 18.3 kg</td>
                                                            <td className="py-2 px-3 text-center">10.8 - 17.9 kg</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="py-2 px-3 font-medium">5 tahun</td>
                                                            <td className="py-2 px-3 text-center">14.0 - 24.2 kg</td>
                                                            <td className="py-2 px-3 text-center">13.5 - 24.0 kg</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                                            <p className="font-medium">📌 Catatan:</p>
                                            <p className="text-xs mt-1">Rentang input yang diterima sistem: <span className="font-bold">1 - 30 kg</span></p>
                                        </div>
                                    </div>
                                )}

                                {/* Height Standards */}
                                {whoModalType === 'height' && (
                                    <div className="space-y-4">
                                        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                                            <h4 className="font-bold text-purple-800 mb-3">Tinggi/Panjang Badan berdasarkan Usia</h4>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="border-b border-purple-200">
                                                            <th className="py-2 px-3 text-left text-purple-700 font-semibold">Usia</th>
                                                            <th className="py-2 px-3 text-center text-purple-700 font-semibold">Laki-laki</th>
                                                            <th className="py-2 px-3 text-center text-purple-700 font-semibold">Perempuan</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="text-gray-700">
                                                        <tr className="border-b border-purple-100">
                                                            <td className="py-2 px-3 font-medium">Lahir</td>
                                                            <td className="py-2 px-3 text-center">46.1 - 53.7 cm</td>
                                                            <td className="py-2 px-3 text-center">45.4 - 52.9 cm</td>
                                                        </tr>
                                                        <tr className="border-b border-purple-100">
                                                            <td className="py-2 px-3 font-medium">3 bulan</td>
                                                            <td className="py-2 px-3 text-center">57.3 - 65.5 cm</td>
                                                            <td className="py-2 px-3 text-center">55.6 - 64.0 cm</td>
                                                        </tr>
                                                        <tr className="border-b border-purple-100">
                                                            <td className="py-2 px-3 font-medium">6 bulan</td>
                                                            <td className="py-2 px-3 text-center">63.3 - 71.9 cm</td>
                                                            <td className="py-2 px-3 text-center">61.2 - 70.3 cm</td>
                                                        </tr>
                                                        <tr className="border-b border-purple-100">
                                                            <td className="py-2 px-3 font-medium">12 bulan</td>
                                                            <td className="py-2 px-3 text-center">71.0 - 80.5 cm</td>
                                                            <td className="py-2 px-3 text-center">68.9 - 79.2 cm</td>
                                                        </tr>
                                                        <tr className="border-b border-purple-100">
                                                            <td className="py-2 px-3 font-medium">2 tahun</td>
                                                            <td className="py-2 px-3 text-center">81.7 - 93.9 cm</td>
                                                            <td className="py-2 px-3 text-center">80.0 - 92.9 cm</td>
                                                        </tr>
                                                        <tr className="border-b border-purple-100">
                                                            <td className="py-2 px-3 font-medium">3 tahun</td>
                                                            <td className="py-2 px-3 text-center">88.7 - 103.5 cm</td>
                                                            <td className="py-2 px-3 text-center">87.4 - 102.7 cm</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="py-2 px-3 font-medium">5 tahun</td>
                                                            <td className="py-2 px-3 text-center">100.7 - 119.2 cm</td>
                                                            <td className="py-2 px-3 text-center">99.9 - 118.9 cm</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                                            <p className="font-medium">📌 Catatan:</p>
                                            <p className="text-xs mt-1">Rentang input yang diterima sistem: <span className="font-bold">40 - 130 cm</span></p>
                                            <p className="text-xs mt-1">Anak &lt;2 tahun diukur berbaring (panjang), ≥2 tahun berdiri (tinggi)</p>
                                        </div>
                                    </div>
                                )}

                                {/* MUAC Standards */}
                                {whoModalType === 'muac' && (
                                    <div className="space-y-4">
                                        <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
                                            <h4 className="font-bold text-teal-800 mb-3">Klasifikasi Status Gizi (LILA)</h4>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="border-b border-teal-200">
                                                            <th className="py-2 px-3 text-left text-teal-700 font-semibold">Kategori</th>
                                                            <th className="py-2 px-3 text-center text-teal-700 font-semibold">Ukuran LILA</th>
                                                            <th className="py-2 px-3 text-center text-teal-700 font-semibold">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="text-gray-700">
                                                        <tr className="border-b border-teal-100">
                                                            <td className="py-2 px-3 font-medium">Gizi Normal</td>
                                                            <td className="py-2 px-3 text-center">≥ 12.5 cm</td>
                                                            <td className="py-2 px-3 text-center">
                                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">Normal</span>
                                                            </td>
                                                        </tr>
                                                        <tr className="border-b border-teal-100">
                                                            <td className="py-2 px-3 font-medium">Gizi Kurang</td>
                                                            <td className="py-2 px-3 text-center">11.5 - 12.4 cm</td>
                                                            <td className="py-2 px-3 text-center">
                                                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">Waspada</span>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="py-2 px-3 font-medium">Gizi Buruk</td>
                                                            <td className="py-2 px-3 text-center">&lt; 11.5 cm</td>
                                                            <td className="py-2 px-3 text-center">
                                                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">Bahaya</span>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        <div className="bg-teal-50 rounded-lg p-3 text-sm text-gray-600 border border-teal-100">
                                            <p className="font-medium text-teal-800">📌 Catatan:</p>
                                            <p className="text-xs mt-1">Rentang input yang diterima sistem: <span className="font-bold">8 - 25 cm</span></p>
                                            <p className="text-xs mt-1">Pengukuran dilakukan di lengan kiri, titik tengah antara bahu dan siku</p>
                                        </div>
                                    </div>
                                )}

                                {/* Head Circumference Standards */}
                                {whoModalType === 'head' && (
                                    <div className="space-y-4">
                                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                            <h4 className="font-bold text-blue-800 mb-3">Lingkar Kepala berdasarkan Usia</h4>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="border-b border-blue-200">
                                                            <th className="py-2 px-3 text-left text-blue-700 font-semibold">Usia</th>
                                                            <th className="py-2 px-3 text-center text-blue-700 font-semibold">Laki-laki</th>
                                                            <th className="py-2 px-3 text-center text-blue-700 font-semibold">Perempuan</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="text-gray-700">
                                                        <tr className="border-b border-blue-100">
                                                            <td className="py-2 px-3 font-medium">Lahir</td>
                                                            <td className="py-2 px-3 text-center">31.9 - 37.0 cm</td>
                                                            <td className="py-2 px-3 text-center">31.5 - 36.2 cm</td>
                                                        </tr>
                                                        <tr className="border-b border-blue-100">
                                                            <td className="py-2 px-3 font-medium">3 bulan</td>
                                                            <td className="py-2 px-3 text-center">38.1 - 42.9 cm</td>
                                                            <td className="py-2 px-3 text-center">37.1 - 42.0 cm</td>
                                                        </tr>
                                                        <tr className="border-b border-blue-100">
                                                            <td className="py-2 px-3 font-medium">6 bulan</td>
                                                            <td className="py-2 px-3 text-center">40.9 - 45.8 cm</td>
                                                            <td className="py-2 px-3 text-center">39.6 - 44.4 cm</td>
                                                        </tr>
                                                        <tr className="border-b border-blue-100">
                                                            <td className="py-2 px-3 font-medium">12 bulan</td>
                                                            <td className="py-2 px-3 text-center">43.5 - 48.6 cm</td>
                                                            <td className="py-2 px-3 text-center">42.0 - 47.0 cm</td>
                                                        </tr>
                                                        <tr className="border-b border-blue-100">
                                                            <td className="py-2 px-3 font-medium">2 tahun</td>
                                                            <td className="py-2 px-3 text-center">45.8 - 51.0 cm</td>
                                                            <td className="py-2 px-3 text-center">44.4 - 49.5 cm</td>
                                                        </tr>
                                                        <tr className="border-b border-blue-100">
                                                            <td className="py-2 px-3 font-medium">3 tahun</td>
                                                            <td className="py-2 px-3 text-center">46.9 - 52.3 cm</td>
                                                            <td className="py-2 px-3 text-center">45.5 - 50.8 cm</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="py-2 px-3 font-medium">5 tahun</td>
                                                            <td className="py-2 px-3 text-center">48.4 - 54.0 cm</td>
                                                            <td className="py-2 px-3 text-center">47.0 - 52.5 cm</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                                            <p className="font-medium">📌 Catatan:</p>
                                            <p className="text-xs mt-1">Rentang input yang diterima sistem: <span className="font-bold">30 - 60 cm</span></p>
                                            <p className="text-xs mt-1">Lingkar kepala penting untuk memantau perkembangan otak anak</p>
                                        </div>
                                    </div>
                                )}

                                <p className="text-[10px] text-gray-500 text-center mt-4">
                                    Sumber: WHO Child Growth Standards (2006)
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </DashboardLayout>
    );
}
