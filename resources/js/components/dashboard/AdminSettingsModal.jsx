import React, { useState, useEffect } from "react";
import { Settings, Save, X, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
} from "../ui/dialog";
import api from "../../lib/api";

import ConfirmationModal from "../ui/ConfirmationModal";

export default function AdminSettingsModal({ isOpen, onClose }) {
    const [settings, setSettings] = useState({
        session_timeout: '60',
    });
    const [saving, setSaving] = useState(false);

    // Confirmation Modal State
    const [confirmOpen, setConfirmOpen] = useState(false);

    // Load settings from backend when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchSettings();
        }
    }, [isOpen]);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/admin/settings');
            const data = response.data.data;
            setSettings({
                session_timeout: (data.session_timeout || 60).toString(),
            });
        } catch (err) {
            console.error('Failed to load settings:', err);
        }
    };

    const handleSave = () => {
        setConfirmOpen(true);
    };

    const executeSave = async () => {
        setSaving(true);
        setConfirmOpen(false);

        try {
            // Save to backend
            await api.put('/admin/settings', {
                session_timeout: parseInt(settings.session_timeout, 10),
            });

            // Sync to localStorage for client-side checks (read-only)
            localStorage.setItem('nutrilogic_session_timeout', settings.session_timeout);

            // Trigger storage event for other tabs/components
            window.dispatchEvent(new Event('storage'));

            setSaving(false);
            onClose();
        } catch (err) {
            console.error('Failed to save settings:', err);
            alert(err.response?.data?.message || 'Gagal menyimpan pengaturan.');
            setSaving(false);
        }
    };


    return (
        <>
            <Dialog open={isOpen && !confirmOpen} onOpenChange={onClose}>
                <DialogContent hideClose={true} className="w-[90%] md:w-full sm:max-w-md p-0 bg-white border-none shadow-2xl rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Settings className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Pengaturan Sistem</h2>
                                <p className="text-xs text-gray-500">Konfigurasi sistem NutriLogic</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Timeout Sesi (menit)
                                </label>
                                <p className="text-xs text-gray-500 mb-2">
                                    Durasi waktu tidak aktif sebelum sesi pengguna berakhir otomatis.
                                </p>
                                <input
                                    type="number"
                                    min="5"
                                    max="1440"
                                    value={settings.session_timeout}
                                    onChange={(e) => setSettings({ ...settings, session_timeout: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white outline-none"
                                    placeholder="Masukkan durasi dalam menit"
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                                </button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <ConfirmationModal
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={executeSave}
                title="Simpan Pengaturan?"
                description="Apakah Anda yakin ingin menyimpan perubahan pengaturan sistem ini?"
                confirmText="Ya, Simpan"
                variant="primary"
            />
        </>
    );
}
