import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import {
    Dialog,
    DialogContent,
} from "../ui/dialog";
import SuccessModal from "../ui/SuccessModal";
import {
    X,
    Loader2,
    Lock,
    Settings as SettingsIcon,
    Eye,
    EyeOff
} from "lucide-react";

export default function SettingsModal({ isOpen, onClose }) {
    const [loading, setLoading] = useState(false);

    // Password Form State
    const [passwordForm, setPasswordForm] = useState({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
    });
    const [passwordError, setPasswordError] = useState(null);
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [successModal, setSuccessModal] = useState({
        isOpen: false,
        title: '',
        message: ''
    });

    useEffect(() => {
        if (isOpen) {
            setPasswordForm({
                current_password: "",
                new_password: "",
                new_password_confirmation: "",
            });
            setPasswordError(null);
        }
    }, [isOpen]);

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        try {
            setPasswordSaving(true);
            setPasswordError(null);

            await api.put("/parent/profile/password", {
                current_password: passwordForm.current_password,
                new_password: passwordForm.new_password,
                new_password_confirmation: passwordForm.new_password_confirmation,
            });

            setPasswordForm({
                current_password: "",
                new_password: "",
                new_password_confirmation: "",
            });

            setSuccessModal({
                isOpen: true,
                title: 'Password Berhasil Diubah',
                message: 'Password Anda telah berhasil diperbarui.'
            });

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

    const handlePasswordInputChange = (field, value) => {
        setPasswordForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent hideClose={true} className="w-[90%] md:w-full sm:max-w-2xl p-0 bg-white border-none shadow-2xl rounded-3xl md:rounded-[40px] overflow-hidden">
                    {/* Header */}
                    <div className="px-8 py-6 bg-white flex items-start gap-4 border-b border-gray-100">
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <SettingsIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Pengaturan</h2>
                            <p className="text-sm text-gray-500 mt-1">Kelola keamanan akun Anda</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="ml-auto p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Tab Header - Security Only */}
                    <div className="border-b border-gray-100 px-8">
                        <div className="flex gap-6">
                            <div className="pb-4 px-1 border-b-2 border-blue-600 font-semibold text-sm text-blue-600">
                                <div className="flex items-center gap-2">
                                    <Lock className="w-4 h-4" />
                                    Keamanan
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 max-h-[60vh] overflow-y-auto">
                        {loading ? (
                            <div className="py-12 flex justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
                            </div>
                        ) : (
                            <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Ubah Password</h3>
                                    <p className="text-sm text-gray-500">Perbarui password akun Anda</p>
                                </div>

                                {passwordError && (
                                    <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium">
                                        {passwordError}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-900">Password Saat Ini</label>
                                        <div className="relative">
                                            <input
                                                type={showCurrentPassword ? "text" : "password"}
                                                value={passwordForm.current_password}
                                                onChange={(e) => handlePasswordInputChange("current_password", e.target.value)}
                                                className="w-full px-4 py-3 pr-10 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400"
                                                placeholder="Masukkan password saat ini"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-900">Password Baru</label>
                                        <div className="relative">
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                value={passwordForm.new_password}
                                                onChange={(e) => handlePasswordInputChange("new_password", e.target.value)}
                                                className="w-full px-4 py-3 pr-10 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400"
                                                placeholder="Minimal 8 karakter"
                                                required
                                                minLength={8}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-900">Konfirmasi Password Baru</label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={passwordForm.new_password_confirmation}
                                                onChange={(e) => handlePasswordInputChange("new_password_confirmation", e.target.value)}
                                                className="w-full px-4 py-3 pr-10 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400"
                                                placeholder="Ulangi password baru"
                                                required
                                                minLength={8}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={passwordSaving}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-[#4481EB] to-[#04BEFE] text-white rounded-xl font-semibold hover:opacity-90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm shadow-lg shadow-blue-500/30"
                                >
                                    {passwordSaving ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" /> Memproses...
                                        </span>
                                    ) : "Update Password"}
                                </button>
                            </form>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <SuccessModal
                isOpen={successModal.isOpen}
                onClose={() => {
                    setSuccessModal({ isOpen: false, title: '', message: '' });
                    onClose();
                }}
                title={successModal.title}
                message={successModal.message}
            />
        </>
    );
}
