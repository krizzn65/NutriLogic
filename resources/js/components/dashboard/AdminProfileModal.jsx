import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import {
    User,
    Mail,
    Phone,
    Shield,
    Save,
    Key,
    X,
    Loader2,
    Eye,
    EyeOff,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "../ui/dialog";

import ConfirmationModal from "../ui/ConfirmationModal";
import SuccessModal from "../ui/SuccessModal";
import logger from "../../lib/logger";

export default function AdminProfileModal({ isOpen, onClose }) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [profileError, setProfileError] = useState("");
    const [passwordError, setPasswordError] = useState("");
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
    const [activeTab, setActiveTab] = useState("profile"); // 'profile' or 'password'
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Success Modal State
    const [successModal, setSuccessModal] = useState({
        isOpen: false,
        title: "",
        message: "",
    });

    // Confirmation Modal State
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({
        title: "",
        description: "",
        action: null,
        variant: "primary",
        confirmText: "Ya, Simpan",
    });

    useEffect(() => {
        if (isOpen) {
            fetchProfile();
            setActiveTab("profile");
            setProfileError("");
            setPasswordError("");
            setPasswordData({
                current_password: "",
                new_password: "",
                confirm_password: "",
            });
        }
    }, [isOpen]);

    const fetchProfile = async () => {
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
        } catch (err) {
            logger.error("Profile fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = (e) => {
        e.preventDefault();
        setProfileError("");
        setConfirmConfig({
            title: "Simpan Perubahan Profil?",
            description:
                "Apakah Anda yakin ingin memperbarui informasi profil Anda?",
            action: executeUpdateProfile,
            variant: "primary",
            confirmText: "Ya, Simpan",
        });
        setConfirmOpen(true);
    };

    const executeUpdateProfile = async () => {
        setSaving(true);
        setConfirmOpen(false);

        try {
            const response = await api.put("/admin/profile", {
                name: formData.name,
                email: formData.email,
                phone: formData.phone || null,
            });

            const updated = response.data?.data || {};
            setUser((prev) => ({ ...prev, ...updated }));
            setFormData((prev) => ({
                ...prev,
                name: updated.name ?? prev.name,
                email: updated.email ?? prev.email,
                phone: updated.phone ?? prev.phone,
            }));

            setSuccessModal({
                isOpen: true,
                title: "Profil Berhasil Diperbarui",
                message: "Perubahan profil admin telah disimpan.",
            });
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                "Gagal menyimpan perubahan profil.";
            setProfileError(errorMessage);
            logger.error("Profile update error:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = (e) => {
        e.preventDefault();
        setPasswordError("");

        if (passwordData.new_password !== passwordData.confirm_password) {
            setPasswordError("Password baru dan konfirmasi tidak cocok.");
            return;
        }

        setConfirmConfig({
            title: "Ubah Password?",
            description:
                "Apakah Anda yakin ingin mengubah password akun Anda? Anda harus login ulang setelah ini.",
            action: executeChangePassword,
            variant: "warning",
            confirmText: "Ya, Ubah Password",
        });
        setConfirmOpen(true);
    };

    const executeChangePassword = async () => {
        setChangingPassword(true);
        setConfirmOpen(false);
        setPasswordError("");

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
            setSuccessModal({
                isOpen: true,
                title: "Password Berhasil Diubah",
                message: "Password Anda telah berhasil diperbarui.",
            });
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                "Gagal mengubah password. Silakan coba lagi.";
            setPasswordError(errorMessage);
            logger.error("Password update error:", err);
        } finally {
            setChangingPassword(false);
        }
    };

    return (
        <>
            <Dialog open={isOpen && !confirmOpen} onOpenChange={onClose}>
                <DialogContent
                    size="xl"
                    hideClose={true}
                    className="w-[90%] md:w-full p-0 bg-white border-none shadow-2xl rounded-2xl overflow-hidden"
                >
                    <DialogTitle className="sr-only">
                        Profil SuperAdmin
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Kelola informasi profil dan keamanan akun super admin.
                    </DialogDescription>
                    {/* Header */}
                    <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Shield className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    Profil SuperAdmin
                                </h2>
                                <p className="text-xs text-gray-500">
                                    Kelola informasi akun Anda
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-100 px-6">
                        <button
                            onClick={() => setActiveTab("profile")}
                            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === "profile"
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Informasi Profil
                        </button>
                        <button
                            onClick={() => setActiveTab("password")}
                            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === "password"
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Keamanan
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            </div>
                        ) : (
                            <>
                                {activeTab === "profile" && (
                                    <form
                                        onSubmit={handleUpdateProfile}
                                        className="space-y-4"
                                    >
                                        {profileError && (
                                            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                                                {profileError}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-4 mb-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white shadow-md">
                                                <Shield className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">
                                                    {user?.name}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {user?.email}
                                                </p>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 mt-1">
                                                    Super Administrator
                                                </span>
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
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    id="admin-profile-email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            email: e.target
                                                                .value,
                                                        })
                                                    }
                                                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white outline-none"
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
                                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    id="admin-profile-phone"
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            phone: e.target
                                                                .value,
                                                        })
                                                    }
                                                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                                            >
                                                {saving ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Save className="w-4 h-4" />
                                                )}
                                                {saving
                                                    ? "Menyimpan..."
                                                    : "Simpan Perubahan"}
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {activeTab === "password" && (
                                    <form
                                        onSubmit={handleChangePassword}
                                        className="space-y-4"
                                    >
                                        {passwordError && (
                                            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                                                {passwordError}
                                            </div>
                                        )}
                                        <div>
                                            <label
                                                htmlFor="admin-current-password"
                                                className="block text-sm font-medium text-gray-700 mb-1"
                                            >
                                                Password Saat Ini
                                            </label>
                                            <div className="relative">
                                                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    id="admin-current-password"
                                                    type={
                                                        showCurrentPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    value={
                                                        passwordData.current_password
                                                    }
                                                    onChange={(e) =>
                                                        setPasswordData({
                                                            ...passwordData,
                                                            current_password:
                                                                e.target.value,
                                                        })
                                                    }
                                                    className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white outline-none"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowCurrentPassword(
                                                            !showCurrentPassword,
                                                        )
                                                    }
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    aria-label={
                                                        showCurrentPassword
                                                            ? "Sembunyikan password saat ini"
                                                            : "Tampilkan password saat ini"
                                                    }
                                                >
                                                    {showCurrentPassword ? (
                                                        <EyeOff className="w-4 h-4" />
                                                    ) : (
                                                        <Eye className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="admin-new-password"
                                                className="block text-sm font-medium text-gray-700 mb-1"
                                            >
                                                Password Baru
                                            </label>
                                            <div className="relative">
                                                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    id="admin-new-password"
                                                    type={
                                                        showNewPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    value={
                                                        passwordData.new_password
                                                    }
                                                    onChange={(e) =>
                                                        setPasswordData({
                                                            ...passwordData,
                                                            new_password:
                                                                e.target.value,
                                                        })
                                                    }
                                                    className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white outline-none"
                                                    required
                                                    minLength={8}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowNewPassword(
                                                            !showNewPassword,
                                                        )
                                                    }
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    aria-label={
                                                        showNewPassword
                                                            ? "Sembunyikan password baru"
                                                            : "Tampilkan password baru"
                                                    }
                                                >
                                                    {showNewPassword ? (
                                                        <EyeOff className="w-4 h-4" />
                                                    ) : (
                                                        <Eye className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="admin-confirm-password"
                                                className="block text-sm font-medium text-gray-700 mb-1"
                                            >
                                                Konfirmasi Password Baru
                                            </label>
                                            <div className="relative">
                                                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    id="admin-confirm-password"
                                                    type={
                                                        showConfirmPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    value={
                                                        passwordData.confirm_password
                                                    }
                                                    onChange={(e) =>
                                                        setPasswordData({
                                                            ...passwordData,
                                                            confirm_password:
                                                                e.target.value,
                                                        })
                                                    }
                                                    className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white outline-none"
                                                    required
                                                    minLength={8}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowConfirmPassword(
                                                            !showConfirmPassword,
                                                        )
                                                    }
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    aria-label={
                                                        showConfirmPassword
                                                            ? "Sembunyikan konfirmasi password"
                                                            : "Tampilkan konfirmasi password"
                                                    }
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="w-4 h-4" />
                                                    ) : (
                                                        <Eye className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <button
                                                type="submit"
                                                disabled={changingPassword}
                                                className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                                            >
                                                {changingPassword ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Save className="w-4 h-4" />
                                                )}
                                                {changingPassword
                                                    ? "Mengubah..."
                                                    : "Ubah Password"}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <ConfirmationModal
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={confirmConfig.action}
                title={confirmConfig.title}
                description={confirmConfig.description}
                confirmText={confirmConfig.confirmText}
                variant={confirmConfig.variant}
            />

            <SuccessModal
                isOpen={successModal.isOpen}
                onClose={() => {
                    setSuccessModal({ isOpen: false, title: "", message: "" });
                    onClose();
                }}
                title={successModal.title}
                message={successModal.message}
            />
        </>
    );
}
