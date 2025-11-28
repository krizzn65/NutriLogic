import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import { fetchMe } from "../../lib/auth";
import GenericFormSkeleton from "../loading/GenericFormSkeleton";
import { useDataCache } from "../../contexts/DataCacheContext";
import PageHeader from "../dashboard/PageHeader";

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const [profileData, setProfileData] = useState({
        name: "",
        email: "",
        phone: "",
    });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
    });
    const [passwordError, setPasswordError] = useState(null);
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(null);
    const { getCachedData, setCachedData, invalidateCache } = useDataCache();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            setSuccessMessage(null);

            // Check cache first
            const cachedData = getCachedData('profile');
            if (cachedData) {
                setProfileData(cachedData);
                setLoading(false);
                return;
            }

            // Fetch from API if no cache
            const user = await fetchMe();
            const data = {
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
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
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError(null);
            setSuccessMessage(null);

            const response = await api.put("/parent/profile", {
                name: profileData.name,
                email: profileData.email,
                phone: profileData.phone,
            });

            setSuccessMessage("Profil berhasil diperbarui!");
            setProfileData(response.data.data);

            // Update cache and localStorage
            invalidateCache('profile');
            await fetchMe();
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

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        try {
            setPasswordSaving(true);
            setPasswordError(null);
            setPasswordSuccess(null);

            await api.put("/parent/profile/password", {
                current_password: passwordForm.current_password,
                new_password: passwordForm.new_password,
                new_password_confirmation: passwordForm.new_password_confirmation,
            });

            setPasswordSuccess("Password berhasil diubah!");
            setPasswordForm({
                current_password: "",
                new_password: "",
                new_password_confirmation: "",
            });

            // Close modal after 2 seconds
            setTimeout(() => {
                setShowPasswordModal(false);
                setPasswordSuccess(null);
            }, 2000);
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                "Gagal mengubah password. Silakan coba lagi.";
            setPasswordError(errorMessage);
            console.error("Error updating password:", err);
        } finally {
            setPasswordSaving(false);
        }
    };

    const openPasswordModal = () => {
        setShowPasswordModal(true);
        setPasswordError(null);
        setPasswordSuccess(null);
        setPasswordForm({
            current_password: "",
            new_password: "",
            new_password_confirmation: "",
        });
    };

    const closePasswordModal = () => {
        setShowPasswordModal(false);
        setPasswordError(null);
        setPasswordSuccess(null);
        setPasswordForm({
            current_password: "",
            new_password: "",
            new_password_confirmation: "",
        });
    };

    const handleInputChange = (field, value) => {
        setProfileData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handlePasswordInputChange = (field, value) => {
        setPasswordForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Loading state
    if (loading) {
        return <GenericFormSkeleton fieldCount={3} />;
    }

    return (
        <div className="flex flex-1 w-full h-full overflow-auto">
            <div className="p-4 md:p-10 w-full h-full bg-gray-50">
                {/* Header */}
                <PageHeader title="Profil" subtitle="Portal Orang Tua" />
                <p className="text-gray-600 mt-2 mb-6">
                    Kelola informasi profil dan akun Anda
                </p>

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-green-800">{successMessage}</p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Profile Form */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Informasi Profil
                    </h2>
                    <form onSubmit={handleProfileSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nomor Telepon
                                </label>
                                <input
                                    type="text"
                                    value={profileData.phone || ""}
                                    onChange={(e) => handleInputChange("phone", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Opsional"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {saving ? "Menyimpan..." : "Simpan Perubahan"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Password Change Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Keamanan Akun
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Ubah password Anda untuk menjaga keamanan akun
                    </p>
                    <button
                        onClick={openPasswordModal}
                        className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                    >
                        Ganti Password
                    </button>
                </div>

                {/* Password Change Modal */}
                {showPasswordModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
                        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                Ganti Password
                            </h3>

                            {/* Password Success Message */}
                            {passwordSuccess && (
                                <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                                    <p className="text-green-800 text-sm">{passwordSuccess}</p>
                                </div>
                            )}

                            {/* Password Error Message */}
                            {passwordError && (
                                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-red-800 text-sm">{passwordError}</p>
                                </div>
                            )}

                            <form onSubmit={handlePasswordSubmit}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Password Saat Ini
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordForm.current_password}
                                            onChange={(e) =>
                                                handlePasswordInputChange(
                                                    "current_password",
                                                    e.target.value
                                                )
                                            }
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Password Baru
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordForm.new_password}
                                            onChange={(e) =>
                                                handlePasswordInputChange("new_password", e.target.value)
                                            }
                                            required
                                            minLength={8}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Minimal 8 karakter
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Konfirmasi Password Baru
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordForm.new_password_confirmation}
                                            onChange={(e) =>
                                                handlePasswordInputChange(
                                                    "new_password_confirmation",
                                                    e.target.value
                                                )
                                            }
                                            required
                                            minLength={8}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={closePasswordModal}
                                        disabled={passwordSaving}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={passwordSaving}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {passwordSaving ? "Menyimpan..." : "Simpan"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

