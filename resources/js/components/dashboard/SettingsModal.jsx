import React, { useState, useEffect, useCallback } from "react";
import api from "../../lib/api";
import { getUser } from "../../lib/auth";
import { useDataCache } from "../../contexts/DataCacheContext";
import {
    Dialog,
    DialogContent,
} from "../ui/dialog";
import { Switch } from "../ui/switch";
import {
    X,
    Loader2,
    Bell,
    Lock,
    Settings as SettingsIcon
} from "lucide-react";

export default function SettingsModal({ isOpen, onClose }) {
    const user = getUser();
    const isKader = user?.role === 'kader';
    const [activeTab, setActiveTab] = useState(isKader ? 'security' : 'notifications');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);

    // Notification Settings State
    const [settings, setSettings] = useState({
        email_notifications: false,
        push_notifications: false,
        sms_notifications: false,
        marketing_emails: false,
    });

    // Password Form State
    const [passwordForm, setPasswordForm] = useState({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
    });
    const [passwordError, setPasswordError] = useState(null);
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(null);

    const { getCachedData, setCachedData } = useDataCache();

    const fetchSettings = useCallback(async () => {
        try {
            setError(null);
            setSuccessMessage(null);

            const cachedData = getCachedData('settings');
            if (cachedData) {
                setSettings(cachedData);
                setLoading(false);
            } else {
                setLoading(true);
            }

            const response = await api.get("/parent/settings");
            const data = response.data.data;
            setSettings(data);
            setCachedData('settings', data);
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                "Gagal memuat pengaturan. Silakan coba lagi.";
            setError(errorMessage);
            console.error("Error fetching settings:", err);
        } finally {
            setLoading(false);
        }
    }, [getCachedData, setCachedData]);

    useEffect(() => {
        if (isOpen) {
            fetchSettings();
            setActiveTab(isKader ? 'security' : 'notifications');
            setPasswordForm({
                current_password: "",
                new_password: "",
                new_password_confirmation: "",
            });
            setPasswordError(null);
            setPasswordSuccess(null);
        }
    }, [isOpen, fetchSettings, isKader]);

    const handleSettingsSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError(null);
            setSuccessMessage(null);

            const response = await api.put("/parent/settings", settings);

            setSuccessMessage("Pengaturan berhasil disimpan!");
            const data = response.data.data;
            setSettings(data);
            setCachedData('settings', data);

            setTimeout(() => {
                setSuccessMessage(null);
                onClose();
            }, 1500);

        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                "Gagal menyimpan pengaturan. Silakan coba lagi.";
            setError(errorMessage);
            console.error("Error saving settings:", err);
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

            setTimeout(() => {
                setPasswordSuccess(null);
                onClose();
            }, 1500);

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

    const handleToggle = (key) => {
        setSettings((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };



    const handlePasswordInputChange = (field, value) => {
        setPasswordForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent hideClose={true} className="w-[90%] md:w-full sm:max-w-2xl p-0 bg-white border-none shadow-2xl rounded-3xl md:rounded-[40px] overflow-hidden">
                {/* Header */}
                <div className="px-8 py-6 bg-white flex items-start gap-4 border-b border-gray-100">
                    <div className="p-3 bg-blue-50 rounded-xl">
                        <SettingsIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Pengaturan</h2>
                        <p className="text-sm text-gray-500 mt-1">Kelola preferensi dan keamanan akun Anda</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-auto p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-100 px-8">
                    <div className="flex gap-6">
                        {!isKader && (
                            <button
                                onClick={() => setActiveTab('notifications')}
                                className={`pb-4 px-1 border-b-2 font-semibold text-sm transition-colors ${activeTab === 'notifications'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <Bell className="w-4 h-4" />
                                    Notifikasi
                                </div>
                            </button>
                        )}
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`pb-4 px-1 border-b-2 font-semibold text-sm transition-colors ${activeTab === 'security'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                Keamanan
                            </div>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="py-12 flex justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
                        </div>
                    ) : (
                        <>
                            {/* Notifications Tab */}
                            {activeTab === 'notifications' && (
                                <form onSubmit={handleSettingsSubmit} className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">Preferensi Notifikasi</h3>
                                        <p className="text-sm text-gray-500">Pilih cara Anda ingin menerima pemberitahuan</p>
                                    </div>

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

                                    <div className="space-y-4">
                                        {/* Email Notifications */}
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div>
                                                <div className="font-semibold text-gray-900 text-sm">Email Notifications</div>
                                                <div className="text-xs text-gray-500 mt-0.5">Terima notifikasi penting via email</div>
                                            </div>
                                            <Switch
                                                checked={settings.email_notifications}
                                                onCheckedChange={() => handleToggle('email_notifications')}
                                            />
                                        </div>

                                        {/* Push Notifications */}
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div>
                                                <div className="font-semibold text-gray-900 text-sm">Push Notifications</div>
                                                <div className="text-xs text-gray-500 mt-0.5">Terima notifikasi push di perangkat Anda</div>
                                            </div>
                                            <Switch
                                                checked={settings.push_notifications}
                                                onCheckedChange={() => handleToggle('push_notifications')}
                                            />
                                        </div>

                                        {/* SMS Notifications */}
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div>
                                                <div className="font-semibold text-gray-900 text-sm">SMS Notifications</div>
                                                <div className="text-xs text-gray-500 mt-0.5">Terima notifikasi via pesan teks</div>
                                            </div>
                                            <Switch
                                                checked={settings.sms_notifications}
                                                onCheckedChange={() => handleToggle('sms_notifications')}
                                            />
                                        </div>
                                    </div>


                                    {/* Save Button */}
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="w-full px-6 py-3 bg-gradient-to-r from-[#4481EB] to-[#04BEFE] text-white rounded-xl font-semibold hover:opacity-90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm shadow-lg shadow-blue-500/30"
                                    >
                                        {saving ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                                            </span>
                                        ) : "Simpan Pengaturan"}
                                    </button>
                                </form>
                            )}

                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">Ubah Password</h3>
                                        <p className="text-sm text-gray-500">Perbarui password akun Anda</p>
                                    </div>

                                    {passwordSuccess && (
                                        <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium flex items-center gap-2">
                                            <span>✓</span> {passwordSuccess}
                                        </div>
                                    )}

                                    {passwordError && (
                                        <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium">
                                            {passwordError}
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-900">Password Saat Ini</label>
                                            <input
                                                type="password"
                                                value={passwordForm.current_password}
                                                onChange={(e) => handlePasswordInputChange("current_password", e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all text-sm text-gray-900 focus:text-blue-600 placeholder:text-gray-400"
                                                placeholder="Masukkan password saat ini"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-900">Password Baru</label>
                                            <input
                                                type="password"
                                                value={passwordForm.new_password}
                                                onChange={(e) => handlePasswordInputChange("new_password", e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all text-sm text-gray-900 focus:text-blue-600 placeholder:text-gray-400"
                                                placeholder="Minimal 8 karakter"
                                                required
                                                minLength={8}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-900">Konfirmasi Password Baru</label>
                                            <input
                                                type="password"
                                                value={passwordForm.new_password_confirmation}
                                                onChange={(e) => handlePasswordInputChange("new_password_confirmation", e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all text-sm text-gray-900 focus:text-blue-600 placeholder:text-gray-400"
                                                placeholder="Ulangi password baru"
                                                required
                                                minLength={8}
                                            />
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
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
