import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    ChevronDown,
    Check,
    Calendar,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import api from "../../lib/api";
import CreditCard from "../credit-card-1";
import logoScroll from "../../assets/logo_scroll.svg";
import { assets } from "../../assets/assets";
import logger from "../../lib/logger";

export default function AddChildModal({
    isOpen,
    onClose,
    onSuccess,
    initialData = null,
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        full_name: "",
        nik: "",
        birth_date: "",
        gender: "",
        posyandu_id: "",
        birth_weight_kg: "",
        birth_height_cm: "",
        notes: "",
    });
    const [errors, setErrors] = useState({});
    const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [pickerDate, setPickerDate] = useState(new Date());
    const dateButtonRef = useRef(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

    const toggleDatePicker = () => {
        if (!isDatePickerOpen && dateButtonRef.current) {
            const rect = dateButtonRef.current.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + 8,
                left: rect.left,
            });
        }
        setIsDatePickerOpen(!isDatePickerOpen);
    };

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Edit mode: populate form with initialData
                setFormData({
                    full_name: initialData.full_name || "",
                    nik: initialData.nik || "",
                    birth_date: initialData.birth_date
                        ? new Date(initialData.birth_date)
                              .toISOString()
                              .split("T")[0]
                        : "",
                    gender: initialData.gender || "",
                    posyandu_id:
                        initialData.posyandu?.id ||
                        initialData.posyandu_id ||
                        "",
                    birth_weight_kg: initialData.birth_weight_kg || "",
                    birth_height_cm: initialData.birth_height_cm || "",
                    notes: initialData.notes || "",
                });
            } else {
                // Add mode: fetch user data to auto-fill posyandu if needed
                fetchUserData();
                // Reset form
                setFormData({
                    full_name: "",
                    nik: "",
                    birth_date: "",
                    gender: "",
                    posyandu_id: "",
                    birth_weight_kg: "",
                    birth_height_cm: "",
                    notes: "",
                });
            }
            setErrors({});
            setError(null);
        }
    }, [isOpen, initialData]);

    const fetchUserData = async () => {
        try {
            const response = await api.get("/me");
            const user = response.data.data || response.data;

            // Auto-fill posyandu if user has one
            if (user.posyandu_id) {
                setFormData((prev) => ({
                    ...prev,
                    posyandu_id: user.posyandu_id,
                }));
            }
        } catch (err) {
            logger.error("Failed to fetch user data:", err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: null,
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.full_name.trim()) {
            newErrors.full_name = "Nama lengkap wajib diisi";
        }

        if (!formData.birth_date) {
            newErrors.birth_date = "Tanggal lahir wajib diisi";
        }

        if (!formData.gender) {
            newErrors.gender = "Jenis kelamin wajib dipilih";
        }

        if (
            formData.birth_weight_kg &&
            (parseFloat(formData.birth_weight_kg) < 0 ||
                parseFloat(formData.birth_weight_kg) > 10)
        ) {
            newErrors.birth_weight_kg = "Berat lahir harus antara 0-10 kg";
        }

        if (
            formData.birth_height_cm &&
            (parseFloat(formData.birth_height_cm) < 0 ||
                parseFloat(formData.birth_height_cm) > 100)
        ) {
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
            // Get user data for parent_id and posyandu_id
            const response = await api.get("/me");
            const user = response.data.data || response.data;

            // Pastikan user memiliki posyandu_id
            if (!user.posyandu_id && !initialData) {
                setError(
                    "Akun Anda belum terdaftar di posyandu. Silakan hubungi admin.",
                );
                setLoading(false);
                return;
            }

            const dataToSubmit = {
                ...formData,
                posyandu_id: initialData
                    ? parseInt(formData.posyandu_id)
                    : parseInt(user.posyandu_id), // Untuk edit gunakan yang ada, untuk add gunakan dari user
                birth_weight_kg: formData.birth_weight_kg
                    ? parseFloat(formData.birth_weight_kg)
                    : null,
                birth_height_cm: formData.birth_height_cm
                    ? parseFloat(formData.birth_height_cm)
                    : null,
                nik: formData.nik || null,
                notes: formData.notes || null,
            };

            // If adding new child, we need parent_id
            if (!initialData) {
                dataToSubmit.parent_id = user.id;
            }

            if (initialData) {
                // Edit mode
                await api.put(`/children/${initialData.id}`, dataToSubmit);
            } else {
                // Add mode
                await api.post("/children", dataToSubmit);
            }

            if (onSuccess) {
                onSuccess(
                    initialData
                        ? "Data anak berhasil diperbarui!"
                        : "Data anak berhasil ditambahkan!",
                );
            }
            onClose();
        } catch (err) {
            logger.error("Submit error:", err);

            if (err.response?.data?.errors) {
                // Validation errors from backend
                setErrors(err.response.data.errors);
            } else {
                setError(
                    err.response?.data?.message ||
                        "Gagal menyimpan data anak. Silakan coba lagi.",
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // Helper to format date for card expiry
    const getFormattedDate = (dateString) => {
        if (!dateString) return "00/00";
        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = String(date.getFullYear()).slice(-2);
        return `${month}/${year}`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-gray-100">
                            <h2 className="text-lg md:text-xl font-bold text-gray-800">
                                {initialData
                                    ? "Edit Data Anak"
                                    : "Tambah Data Anak"}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Content - Scrollable */}
                        <div
                            className="flex-1 overflow-y-auto p-3 md:p-8 no-scrollbar overflow-x-hidden"
                            onScroll={() => {
                                if (isDatePickerOpen)
                                    setIsDatePickerOpen(false);
                                if (isGenderDropdownOpen)
                                    setIsGenderDropdownOpen(false);
                            }}
                        >
                            <div className="flex flex-col gap-4 md:gap-8 items-center">
                                {/* Top - Card Preview */}
                                <div className="w-full flex flex-col items-center overflow-hidden h-[160px] md:h-[280px]">
                                    <div className="origin-top transform scale-[0.5] md:scale-[0.8] transition-transform duration-300">
                                        <div className="w-[500px] h-[315px]">
                                            <CreditCard
                                                cardNumber={
                                                    formData.nik
                                                        ? formData.nik.replace(
                                                              /(\d{4})(?=\d)/g,
                                                              "$1 ",
                                                          )
                                                        : "0000 0000 0000 0000"
                                                }
                                                cardHolder={
                                                    formData.full_name ||
                                                    "NAMA ANAK"
                                                }
                                                expiryDate={getFormattedDate(
                                                    formData.birth_date,
                                                )}
                                                cvv={
                                                    formData.gender === "L"
                                                        ? "001"
                                                        : formData.gender ===
                                                            "P"
                                                          ? "002"
                                                          : "XXX"
                                                }
                                                variant="gradient"
                                                labelName="NAMA ANAK"
                                                labelExpiry="TGL LAHIR"
                                                brandLogo={logoScroll}
                                                chipImage={
                                                    formData.gender === "L"
                                                        ? assets.kepala_bayi
                                                        : formData.gender ===
                                                            "P"
                                                          ? assets.kepala_bayi_cewe
                                                          : null
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom - Form */}
                                <div className="w-full max-w-3xl">
                                    {/* Error Alert */}
                                    {error && (
                                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
                                            <div className="flex items-center gap-2">
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                <span>{error}</span>
                                            </div>
                                        </div>
                                    )}

                                    <form
                                        onSubmit={handleSubmit}
                                        className="space-y-3 md:space-y-5"
                                    >
                                        {/* Nama Lengkap */}
                                        <div>
                                            <label
                                                htmlFor="full_name"
                                                className="block text-sm font-medium text-gray-700 mb-2"
                                            >
                                                Nama Lengkap{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                id="full_name"
                                                name="full_name"
                                                value={formData.full_name}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-2.5 md:py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 ${
                                                    errors.full_name
                                                        ? "border-red-500"
                                                        : "border-gray-200"
                                                }`}
                                                placeholder="Masukkan nama lengkap anak"
                                            />
                                            {errors.full_name && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.full_name}
                                                </p>
                                            )}
                                        </div>

                                        {/* NIK */}
                                        <div>
                                            <label
                                                htmlFor="nik"
                                                className="block text-sm font-medium text-gray-700 mb-2"
                                            >
                                                NIK (Opsional)
                                            </label>
                                            <input
                                                type="text"
                                                id="nik"
                                                name="nik"
                                                value={formData.nik}
                                                onChange={handleChange}
                                                maxLength="16"
                                                className={`w-full px-4 py-2.5 md:py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 ${
                                                    errors.nik
                                                        ? "border-red-500"
                                                        : "border-gray-200"
                                                }`}
                                                placeholder="Masukkan 16 digit NIK"
                                            />
                                            {errors.nik && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.nik}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 md:gap-5">
                                            {/* Tanggal Lahir */}
                                            <div className="relative">
                                                <label
                                                    htmlFor="birth_date"
                                                    className="block text-sm font-medium text-gray-700 mb-2"
                                                >
                                                    Tanggal Lahir{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>

                                                <button
                                                    type="button"
                                                    ref={dateButtonRef}
                                                    onClick={toggleDatePicker}
                                                    className={`w-full px-4 py-2.5 md:py-3 bg-white border rounded-xl text-left text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all flex items-center justify-between hover:bg-gray-50 ${errors.birth_date ? "border-red-500" : "border-gray-200"}`}
                                                >
                                                    <span
                                                        className={
                                                            !formData.birth_date
                                                                ? "text-gray-400"
                                                                : ""
                                                        }
                                                    >
                                                        {formData.birth_date
                                                            ? new Date(
                                                                  formData.birth_date,
                                                              ).toLocaleDateString(
                                                                  "id-ID",
                                                                  {
                                                                      day: "numeric",
                                                                      month: "long",
                                                                      year: "numeric",
                                                                  },
                                                              )
                                                            : "dd/mm/yyyy"}
                                                    </span>
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                </button>

                                                {isDatePickerOpen &&
                                                    createPortal(
                                                        <>
                                                            <div
                                                                className="fixed inset-0 z-[9998] bg-transparent"
                                                                onClick={() =>
                                                                    setIsDatePickerOpen(
                                                                        false,
                                                                    )
                                                                }
                                                            />
                                                            <motion.div
                                                                initial={{
                                                                    opacity: 0,
                                                                    y: -10,
                                                                    scale: 0.95,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    y: 0,
                                                                    scale: 1,
                                                                }}
                                                                transition={{
                                                                    duration: 0.2,
                                                                }}
                                                                style={{
                                                                    top: dropdownPos.top,
                                                                    left: dropdownPos.left,
                                                                }}
                                                                className="fixed z-[9999] p-4 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl w-[360px]"
                                                            >
                                                                {/* Calendar Header */}
                                                                <div className="flex items-center justify-between mb-4">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setPickerDate(
                                                                                new Date(
                                                                                    pickerDate.setMonth(
                                                                                        pickerDate.getMonth() -
                                                                                            1,
                                                                                    ),
                                                                                ),
                                                                            )
                                                                        }
                                                                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                                                    >
                                                                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                                                                    </button>
                                                                    <span className="font-semibold text-gray-800">
                                                                        {pickerDate.toLocaleDateString(
                                                                            "id-ID",
                                                                            {
                                                                                month: "long",
                                                                                year: "numeric",
                                                                            },
                                                                        )}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setPickerDate(
                                                                                new Date(
                                                                                    pickerDate.setMonth(
                                                                                        pickerDate.getMonth() +
                                                                                            1,
                                                                                    ),
                                                                                ),
                                                                            )
                                                                        }
                                                                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                                                    >
                                                                        <ChevronRight className="w-5 h-5 text-gray-600" />
                                                                    </button>
                                                                </div>

                                                                {/* Days Header */}
                                                                <div className="grid grid-cols-7 mb-2">
                                                                    {[
                                                                        "Mg",
                                                                        "Sn",
                                                                        "Sl",
                                                                        "Rb",
                                                                        "Km",
                                                                        "Jm",
                                                                        "Sb",
                                                                    ].map(
                                                                        (
                                                                            day,
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    day
                                                                                }
                                                                                className="text-xs font-medium text-gray-400 text-center py-1"
                                                                            >
                                                                                {
                                                                                    day
                                                                                }
                                                                            </div>
                                                                        ),
                                                                    )}
                                                                </div>

                                                                {/* Calendar Grid */}
                                                                <div className="grid grid-cols-7 gap-1">
                                                                    {(() => {
                                                                        const daysInMonth =
                                                                            new Date(
                                                                                pickerDate.getFullYear(),
                                                                                pickerDate.getMonth() +
                                                                                    1,
                                                                                0,
                                                                            ).getDate();
                                                                        const firstDay =
                                                                            new Date(
                                                                                pickerDate.getFullYear(),
                                                                                pickerDate.getMonth(),
                                                                                1,
                                                                            ).getDay();
                                                                        const days =
                                                                            [];

                                                                        // Empty slots for previous month
                                                                        for (
                                                                            let i = 0;
                                                                            i <
                                                                            firstDay;
                                                                            i++
                                                                        ) {
                                                                            days.push(
                                                                                <div
                                                                                    key={`empty-${i}`}
                                                                                    className="w-10 h-10"
                                                                                />,
                                                                            );
                                                                        }

                                                                        // Days of current month
                                                                        for (
                                                                            let i = 1;
                                                                            i <=
                                                                            daysInMonth;
                                                                            i++
                                                                        ) {
                                                                            const currentDateStr = `${pickerDate.getFullYear()}-${String(pickerDate.getMonth() + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
                                                                            const isSelected =
                                                                                formData.birth_date ===
                                                                                currentDateStr;
                                                                            const isToday =
                                                                                new Date()
                                                                                    .toISOString()
                                                                                    .split(
                                                                                        "T",
                                                                                    )[0] ===
                                                                                currentDateStr;

                                                                            days.push(
                                                                                <button
                                                                                    key={
                                                                                        i
                                                                                    }
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        handleChange(
                                                                                            {
                                                                                                target: {
                                                                                                    name: "birth_date",
                                                                                                    value: currentDateStr,
                                                                                                },
                                                                                            },
                                                                                        );
                                                                                        setIsDatePickerOpen(
                                                                                            false,
                                                                                        );
                                                                                    }}
                                                                                    className={`w-10 h-10 text-sm rounded-full flex items-center justify-center transition-all
                                                                                    ${
                                                                                        isSelected
                                                                                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                                                                                            : isToday
                                                                                              ? "text-blue-600 font-bold bg-blue-50"
                                                                                              : "text-gray-700 hover:bg-gray-100"
                                                                                    }`}
                                                                                >
                                                                                    {
                                                                                        i
                                                                                    }
                                                                                </button>,
                                                                            );
                                                                        }
                                                                        return days;
                                                                    })()}
                                                                </div>

                                                                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            handleChange(
                                                                                {
                                                                                    target: {
                                                                                        name: "birth_date",
                                                                                        value: "",
                                                                                    },
                                                                                },
                                                                            );
                                                                            setIsDatePickerOpen(
                                                                                false,
                                                                            );
                                                                        }}
                                                                        className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                                                                    >
                                                                        Clear
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const today =
                                                                                new Date();
                                                                            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
                                                                            handleChange(
                                                                                {
                                                                                    target: {
                                                                                        name: "birth_date",
                                                                                        value: todayStr,
                                                                                    },
                                                                                },
                                                                            );
                                                                            setPickerDate(
                                                                                today,
                                                                            );
                                                                            setIsDatePickerOpen(
                                                                                false,
                                                                            );
                                                                        }}
                                                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                                                                    >
                                                                        Today
                                                                    </button>
                                                                </div>
                                                            </motion.div>
                                                        </>,
                                                        document.body,
                                                    )}

                                                {errors.birth_date && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {errors.birth_date}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Jenis Kelamin */}
                                            <div className="relative">
                                                <label
                                                    htmlFor="gender"
                                                    className="block text-sm font-medium text-gray-700 mb-2"
                                                >
                                                    Jenis Kelamin{" "}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </label>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setIsGenderDropdownOpen(
                                                            !isGenderDropdownOpen,
                                                        )
                                                    }
                                                    className={`w-full px-4 py-2.5 md:py-3 bg-white border rounded-xl text-left text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all flex items-center justify-between hover:bg-gray-50 ${errors.gender ? "border-red-500" : "border-gray-200"}`}
                                                >
                                                    <span
                                                        className={
                                                            !formData.gender
                                                                ? "text-gray-400"
                                                                : ""
                                                        }
                                                    >
                                                        {formData.gender === "L"
                                                            ? "Laki-laki"
                                                            : formData.gender ===
                                                                "P"
                                                              ? "Perempuan"
                                                              : "Pilih..."}
                                                    </span>
                                                    <ChevronDown
                                                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isGenderDropdownOpen ? "rotate-180" : ""}`}
                                                    />
                                                </button>

                                                <AnimatePresence>
                                                    {isGenderDropdownOpen && (
                                                        <>
                                                            <div
                                                                className="fixed inset-0 z-40 bg-transparent"
                                                                onClick={() =>
                                                                    setIsGenderDropdownOpen(
                                                                        false,
                                                                    )
                                                                }
                                                            />
                                                            <motion.div
                                                                initial={{
                                                                    opacity: 0,
                                                                    y: -10,
                                                                    scale: 0.95,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    y: 0,
                                                                    scale: 1,
                                                                }}
                                                                exit={{
                                                                    opacity: 0,
                                                                    y: -10,
                                                                    scale: 0.95,
                                                                }}
                                                                transition={{
                                                                    duration: 0.2,
                                                                }}
                                                                className="absolute z-50 w-full mt-2 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl shadow-xl overflow-hidden"
                                                            >
                                                                {[
                                                                    {
                                                                        value: "L",
                                                                        label: "Laki-laki",
                                                                    },
                                                                    {
                                                                        value: "P",
                                                                        label: "Perempuan",
                                                                    },
                                                                ].map(
                                                                    (
                                                                        option,
                                                                    ) => (
                                                                        <button
                                                                            type="button"
                                                                            key={
                                                                                option.value
                                                                            }
                                                                            onClick={() => {
                                                                                handleChange(
                                                                                    {
                                                                                        target: {
                                                                                            name: "gender",
                                                                                            value: option.value,
                                                                                        },
                                                                                    },
                                                                                );
                                                                                setIsGenderDropdownOpen(
                                                                                    false,
                                                                                );
                                                                            }}
                                                                            className="w-full text-left px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors flex items-center justify-between group border-b border-gray-50 last:border-0"
                                                                        >
                                                                            <span
                                                                                className={`text-sm ${formData.gender === option.value ? "text-blue-700 font-semibold" : "text-gray-700 font-medium group-hover:text-blue-700"}`}
                                                                            >
                                                                                {
                                                                                    option.label
                                                                                }
                                                                            </span>
                                                                            {formData.gender ===
                                                                                option.value && (
                                                                                <Check className="w-4 h-4 text-blue-600" />
                                                                            )}
                                                                        </button>
                                                                    ),
                                                                )}
                                                            </motion.div>
                                                        </>
                                                    )}
                                                </AnimatePresence>

                                                {errors.gender && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {errors.gender}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 md:gap-5">
                                            {/* Berat Lahir */}
                                            <div>
                                                <label
                                                    htmlFor="birth_weight_kg"
                                                    className="block text-sm font-medium text-gray-700 mb-2"
                                                >
                                                    Berat Lahir (kg)
                                                </label>
                                                <input
                                                    type="number"
                                                    id="birth_weight_kg"
                                                    name="birth_weight_kg"
                                                    value={
                                                        formData.birth_weight_kg
                                                    }
                                                    onChange={handleChange}
                                                    step="0.1"
                                                    min="0"
                                                    max="10"
                                                    className={`w-full px-4 py-2.5 md:py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 ${
                                                        errors.birth_weight_kg
                                                            ? "border-red-500"
                                                            : "border-gray-200"
                                                    }`}
                                                    placeholder="0.0"
                                                />
                                                {errors.birth_weight_kg && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {errors.birth_weight_kg}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Tinggi Lahir */}
                                            <div>
                                                <label
                                                    htmlFor="birth_height_cm"
                                                    className="block text-sm font-medium text-gray-700 mb-2"
                                                >
                                                    Tinggi Lahir (cm)
                                                </label>
                                                <input
                                                    type="number"
                                                    id="birth_height_cm"
                                                    name="birth_height_cm"
                                                    value={
                                                        formData.birth_height_cm
                                                    }
                                                    onChange={handleChange}
                                                    step="0.1"
                                                    min="0"
                                                    max="100"
                                                    className={`w-full px-4 py-2.5 md:py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 ${
                                                        errors.birth_height_cm
                                                            ? "border-red-500"
                                                            : "border-gray-200"
                                                    }`}
                                                    placeholder="0.0"
                                                />
                                                {errors.birth_height_cm && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {errors.birth_height_cm}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Catatan */}
                                        <div>
                                            <label
                                                htmlFor="notes"
                                                className="block text-sm font-medium text-gray-700 mb-2"
                                            >
                                                Catatan (Opsional)
                                            </label>
                                            <textarea
                                                id="notes"
                                                name="notes"
                                                value={formData.notes}
                                                onChange={handleChange}
                                                rows="3"
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900"
                                                placeholder="Tambahkan catatan khusus mengenai kondisi anak..."
                                            />
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Footer - Actions */}
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-white transition-colors"
                                disabled={loading}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-600/20"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                        Simpan Data
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

