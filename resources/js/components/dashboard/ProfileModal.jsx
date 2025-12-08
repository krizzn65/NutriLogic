import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "../../lib/api";
import { fetchMe, getUser } from "../../lib/auth";
import { useDataCache } from "../../contexts/DataCacheContext";
import {
    Dialog,
    DialogContent,
} from "../ui/dialog";
import { Camera, X, Loader2, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useProfileModal } from "../../contexts/ProfileModalContext";

export default function ProfileModal({ isOpen, onClose }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const { notifyProfileUpdate } = useProfileModal();
    const [profileData, setProfileData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        rt: "",
        rw: "",
        posyandu_id: "",
        profile_photo_url: null,
    });
    const [posyandus, setPosyandus] = useState([]);
    const [isPosyanduDropdownOpen, setIsPosyanduDropdownOpen] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const fileInputRef = useRef(null);
    const { getCachedData, setCachedData, invalidateCache } = useDataCache();

    // Get user role to determine endpoint
    const user = getUser();
    const isKader = user?.role === 'kader';
    const isIbu = user?.role === 'ibu';
    const profileEndpoint = isKader ? '/kader/profile' : '/parent/profile';

    const fetchProfile = useCallback(async () => {
        try {
            setError(null);
            setSuccessMessage(null);

            const cachedData = getCachedData('profile');
            if (cachedData) {
                setProfileData(cachedData);
                setLoading(false);
            } else {
                setLoading(true);
            }

            const user = await fetchMe();
            const data = {
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                address: user.address || "",
                rt: user.rt || "",
                rw: user.rw || "",
                posyandu_id: user.posyandu?.id || "",
                profile_photo_url: user.profile_photo_url || null,
            };
            setProfileData(data);
            setCachedData('profile', data);
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                "Gagal memuat data profil. Silakan coba lagi.";
            setError(errorMessage);
            console.error("Error fetching profile:", err);
        } finally {
            setLoading(false);
        }
    }, [getCachedData, setCachedData]);

    const fetchPosyandus = useCallback(async () => {
        try {
            const cachedPosyandus = getCachedData('posyandus_list');
            if (cachedPosyandus) {
                setPosyandus(cachedPosyandus);
                return;
            }
            const response = await api.get('/posyandus');
            setPosyandus(response.data.data || []);
            setCachedData('posyandus_list', response.data.data || []);
        } catch (err) {
            console.error("Error fetching posyandus:", err);
        }
    }, [getCachedData, setCachedData]);

    useEffect(() => {
        if (isOpen) {
            fetchProfile();
            fetchPosyandus();
            setPhotoPreview(null);
            setSelectedPhoto(null);
        }
    }, [isOpen, fetchProfile, fetchPosyandus]);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError(null);
            setSuccessMessage(null);

            const formData = new FormData();
            formData.append('name', profileData.name);
            formData.append('email', profileData.email);
            if (profileData.phone) formData.append('phone', profileData.phone);
            if (profileData.address) formData.append('address', profileData.address);
            if (profileData.rt) formData.append('rt', profileData.rt);
            if (profileData.rw) formData.append('rw', profileData.rw);
            if (profileData.posyandu_id) formData.append('posyandu_id', profileData.posyandu_id);
            if (selectedPhoto) {
                formData.append('profile_photo', selectedPhoto);
            }
            formData.append('_method', 'PUT');

            const response = await api.post(profileEndpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setSuccessMessage("Profil berhasil diperbarui!");
            setProfileData(prev => ({
                ...prev,
                ...response.data.data,
                posyandu_id: response.data.data.posyandu?.id || "",
            }));
            setPhotoPreview(null);
            setSelectedPhoto(null);

            invalidateCache('profile');
            // CRITICAL FIX: Must fetch new data (update localStorage) BEFORE notifying listeners
            await fetchMe();
            notifyProfileUpdate();

            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                "Gagal memperbarui profil. Silakan coba lagi.";
            setError(errorMessage);
            console.error("Error updating profile:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (field, value) => {
        setProfileData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent hideClose={true} className={`w-[90%] md:w-full sm:max-w-2xl p-0 bg-white border-none shadow-2xl rounded-2xl ${isPosyanduDropdownOpen ? 'overflow-visible' : 'overflow-hidden'} max-h-[90vh]`}>
                {/* Profile Header Section - LEFT aligned */}
                <div className="px-8 pt-8 relative">
                    <div className="flex items-start gap-6 mb-6">
                        {/* Profile Photo - LEFT aligned */}
                        <div className="relative shrink-0">
                            <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                                <img
                                    src={photoPreview || profileData.profile_photo_url || `https://ui-avatars.com/api/?name=${profileData.name}&background=random`}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors border-2 border-white"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handlePhotoChange}
                            />
                        </div>

                        {/* Title & Email - RIGHT of photo */}
                        <div className="pt-6 flex-1">
                            <h2 className="text-2xl font-bold text-gray-900">{profileData.name || 'Pengguna'}</h2>
                            <p className="text-sm text-gray-500 mt-1">{profileData.email}</p>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="px-8 pb-8 overflow-y-auto max-h-[60vh]" style={{ overflow: isPosyanduDropdownOpen ? 'visible' : 'auto' }}>
                    {loading ? (
                        <div className="py-12 flex justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    ) : (
                        <form onSubmit={handleProfileSubmit} className="space-y-6 overflow-visible">
                            {successMessage && (
                                <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium flex items-center gap-2">
                                    <span>✓</span> {successMessage}
                                </div>
                            )}
                            {error && (
                                <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            {/* Form Fields */}
                            <div className="space-y-4 overflow-visible">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-900">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-sm text-gray-900 focus:text-blue-600 placeholder:text-gray-400"
                                        placeholder="Masukkan nama lengkap"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-900">Email</label>
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-sm text-gray-900 focus:text-blue-600 placeholder:text-gray-400"
                                        placeholder="Masukkan email"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-900">Nomor Telepon</label>
                                    <input
                                        type="text"
                                        value={profileData.phone}
                                        onChange={(e) => handleInputChange("phone", e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-sm text-gray-900 focus:text-blue-600 placeholder:text-gray-400"
                                        placeholder="Masukkan nomor telepon (opsional)"
                                    />
                                </div>

                                {/* Fields khusus untuk Orang Tua */}
                                {isIbu && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-900">Alamat</label>
                                            <textarea
                                                value={profileData.address}
                                                onChange={(e) => handleInputChange("address", e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-sm text-gray-900 focus:text-blue-600 placeholder:text-gray-400 resize-none"
                                                placeholder="Masukkan alamat lengkap"
                                                rows={2}
                                            />
                                        </div>

                                        <div className="flex gap-3">
                                            <div className="flex-1 space-y-2">
                                                <label className="text-sm font-bold text-gray-900">RT</label>
                                                <input
                                                    type="text"
                                                    value={profileData.rt}
                                                    onChange={(e) => handleInputChange("rt", e.target.value)}
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-sm text-gray-900 focus:text-blue-600 placeholder:text-gray-400"
                                                    placeholder="001"
                                                    maxLength={10}
                                                />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <label className="text-sm font-bold text-gray-900">RW</label>
                                                <input
                                                    type="text"
                                                    value={profileData.rw}
                                                    onChange={(e) => handleInputChange("rw", e.target.value)}
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-sm text-gray-900 focus:text-blue-600 placeholder:text-gray-400"
                                                    placeholder="002"
                                                    maxLength={10}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-900">Posyandu</label>
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    id="posyandu-button"
                                                    onClick={() => setIsPosyanduDropdownOpen(!isPosyanduDropdownOpen)}
                                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-left flex items-center justify-between focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                                                >
                                                    <span className={!profileData.posyandu_id ? "text-gray-400 text-sm" : "text-gray-900 text-sm"}>
                                                        {profileData.posyandu_id
                                                            ? posyandus.find(p => p.id === parseInt(profileData.posyandu_id))?.name || "Posyandu Terpilih"
                                                            : "Pilih Posyandu"}
                                                    </span>
                                                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isPosyanduDropdownOpen ? "rotate-180" : ""}`} />
                                                </button>

                                                <AnimatePresence>
                                                    {isPosyanduDropdownOpen && (
                                                        <>
                                                            <div className="fixed inset-0 z-50" onClick={() => setIsPosyanduDropdownOpen(false)} />
                                                            <motion.div
                                                                initial={{ opacity: 0, y: -10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -10 }}
                                                                className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto"
                                                                style={{ zIndex: 9999 }}
                                                            >
                                                                <div
                                                                    onClick={() => {
                                                                        handleInputChange("posyandu_id", "");
                                                                        setIsPosyanduDropdownOpen(false);
                                                                    }}
                                                                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between"
                                                                >
                                                                    <span className="text-sm text-gray-500">Tidak memilih</span>
                                                                </div>
                                                                {posyandus.map((posyandu) => (
                                                                    <div
                                                                        key={posyandu.id}
                                                                        onClick={() => {
                                                                            handleInputChange("posyandu_id", posyandu.id);
                                                                            setIsPosyanduDropdownOpen(false);
                                                                        }}
                                                                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between"
                                                                    >
                                                                        <span className={`text-sm ${parseInt(profileData.posyandu_id) === posyandu.id ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>
                                                                            {posyandu.name}
                                                                        </span>
                                                                        {parseInt(profileData.posyandu_id) === posyandu.id && (
                                                                            <Check className="w-4 h-4 text-blue-600" />
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </motion.div>
                                                        </>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#4481EB] to-[#04BEFE] text-white rounded-xl font-semibold hover:opacity-90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm shadow-lg shadow-blue-500/30"
                                >
                                    {saving ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                                        </span>
                                    ) : "Simpan Perubahan"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

