import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import { useDataCache } from "../../contexts/DataCacheContext";
import { User, Mail, Phone, Shield, Save, Key } from "lucide-react";
import PageHeader from "../ui/PageHeader";
import GenericFormSkeleton from "../loading/GenericFormSkeleton";
import { useToast } from "../../contexts/ToastContext";
import logger from "../../lib/logger";

export default function AdminProfile() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    });
    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        confirm_password: "",
    });
    const [saving, setSaving] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const toast = useToast();

    // Data caching
    const { getCachedData, setCachedData, invalidateCache } = useDataCache();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        // Check cache first
        const cachedProfile = getCachedData("admin_profile");
        if (cachedProfile) {
            setUser(cachedProfile);
            setFormData({
                name: cachedProfile.name,
                email: cachedProfile.email,
                phone: cachedProfile.phone || "",
            });
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await api.get("/me");
            const userData = response.data.user;
            setUser(userData);
            setFormData({
                name: userData.name || "",
                email: userData.email || "",
                phone: userData.phone || "",
            });
            setCachedData("admin_profile", userData);
        } catch (err) {
            logger.error("Profile fetch error:", err);
            toast.error("Gagal memuat profil admin.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const response = await api.put("/admin/profile", {
                name: formData.name,
                email: formData.email,
                phone: formData.phone || null,
            });

            const updatedUser = response.data?.data || {};
            setUser((prev) => ({ ...prev, ...updatedUser }));
            setFormData((prev) => ({
                ...prev,
                name: updatedUser.name ?? prev.name,
                email: updatedUser.email ?? prev.email,
                phone: updatedUser.phone ?? prev.phone,
            }));

            invalidateCache("admin_profile");
            invalidateCache("admin_user_profile");
            setCachedData("admin_profile", {
                ...(user || {}),
                ...updatedUser,
            });
            toast.success("Profil berhasil diperbarui!");
        } catch (err) {
            logger.error("Profile update error:", err);
            toast.error(
                err.response?.data?.message || "Gagal memperbarui profil.",
            );
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (passwordData.new_password !== passwordData.confirm_password) {
            toast.error("Password baru dan konfirmasi tidak cocok!");
            return;
        }

        setChangingPassword(true);

        try {
            await api.put("/admin/profile/password", {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password,
                new_password_confirmation: passwordData.confirm_password,
            });

            setPasswordData({
                current_password: "",
                new_password: "",
                confirm_password: "",
            });
            toast.success("Password berhasil diubah!");
        } catch (err) {
            logger.error("Password update error:", err);
            toast.error(
                err.response?.data?.message || "Gagal mengubah password.",
            );
        } finally {
            setChangingPassword(false);
        }
    };

    if (loading) {
        return <GenericFormSkeleton fieldCount={6} />;
    }

    return (
        <div className="flex flex-col flex-1 w-full h-full bg-gray-50/50 overflow-hidden font-montserrat">
            <PageHeader
                title="Profil SuperAdmin"
                subtitle="Kelola informasi profil Anda"
            />
            <div className="flex-1 overflow-auto p-6 space-y-6">
                {/* Profile Info Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Shield className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">
                                {user?.name}
                            </h2>
                            <p className="text-sm text-gray-600">
                                {user?.email}
                            </p>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 mt-1">
                                Super Administrator
                            </span>
                        </div>
                    </div>

                    <form
                        onSubmit={handleUpdateProfile}
                        className="space-y-4 max-w-2xl"
                    >
                        <div>
                            <label
                                htmlFor="admin-profile-name"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Nama Lengkap
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="admin-profile-name"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="admin-profile-email"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="admin-profile-email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        })
                                    }
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="admin-profile-phone"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Telepon
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="admin-profile-phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            phone: e.target.value,
                                        })
                                    }
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? "Menyimpan..." : "Simpan Perubahan"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Change Password Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Key className="w-5 h-5" />
                        Ubah Password
                    </h2>

                    <form
                        onSubmit={handleChangePassword}
                        className="space-y-4 max-w-2xl"
                    >
                        <div>
                            <label
                                htmlFor="admin-current-password"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Password Saat Ini
                            </label>
                            <input
                                id="admin-current-password"
                                type="password"
                                value={passwordData.current_password}
                                onChange={(e) =>
                                    setPasswordData({
                                        ...passwordData,
                                        current_password: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="admin-new-password"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Password Baru
                            </label>
                            <input
                                id="admin-new-password"
                                type="password"
                                value={passwordData.new_password}
                                onChange={(e) =>
                                    setPasswordData({
                                        ...passwordData,
                                        new_password: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                                minLength={8}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="admin-confirm-password"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Konfirmasi Password Baru
                            </label>
                            <input
                                id="admin-confirm-password"
                                type="password"
                                value={passwordData.confirm_password}
                                onChange={(e) =>
                                    setPasswordData({
                                        ...passwordData,
                                        confirm_password: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                                minLength={8}
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={changingPassword}
                                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                <Key className="w-4 h-4" />
                                {changingPassword
                                    ? "Mengubah..."
                                    : "Ubah Password"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
