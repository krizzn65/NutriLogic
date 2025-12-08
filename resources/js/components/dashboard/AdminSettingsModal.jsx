import React, { useState, useEffect } from "react";
import { Settings, Save, X, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
} from "../ui/dialog";
import { Switch } from "../ui/switch";
import { getSessionTimeout, setSessionTimeout, getMaintenanceMode, setMaintenanceMode } from "../../lib/sessionTimeout";

import ConfirmationModal from "../ui/ConfirmationModal";

export default function AdminSettingsModal({ isOpen, onClose }) {
    const [settings, setSettings] = useState({
        app_name: 'NutriLogic',
        maintenance_mode: false,
        allow_registration: true,
        max_file_size: '5',
        session_timeout: '60',
    });
    const [saving, setSaving] = useState(false);

    // Confirmation Modal State
    const [confirmOpen, setConfirmOpen] = useState(false);

    // Reset state when modal opens - load current settings from global storage
    useEffect(() => {
        if (isOpen) {
            // Load current session timeout and maintenance mode from global storage
            const currentTimeout = getSessionTimeout();
            const currentMaintenance = getMaintenanceMode();
            setSettings(prev => ({
                ...prev,
                session_timeout: currentTimeout.toString(),
                maintenance_mode: currentMaintenance
            }));
        }
    }, [isOpen]);

    const handleSave = () => {
        setConfirmOpen(true);
    };

    const executeSave = async () => {
        setSaving(true);
        setConfirmOpen(false);

        // Save session timeout to global storage
        const timeoutValue = parseInt(settings.session_timeout, 10) || 60;
        setSessionTimeout(timeoutValue);

        // Save maintenance mode to global storage
        setMaintenanceMode(settings.maintenance_mode);

        setTimeout(() => {
            setSaving(false);
            // Removed native alert as requested
            onClose();
        }, 500);
    };


    return (
        <>
            <Dialog open={isOpen && !confirmOpen} onOpenChange={onClose}>
                <DialogContent hideClose={true} className="w-[90%] md:w-full sm:max-w-2xl p-0 bg-white border-none shadow-2xl rounded-2xl overflow-hidden">
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
                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                        <div className="space-y-5">
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                                <p className="text-sm text-blue-800 flex gap-2">
                                    <span className="font-bold">Info:</span>
                                    Pengaturan ini akan mempengaruhi seluruh sistem.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nama Aplikasi
                                </label>
                                <input
                                    type="text"
                                    value={settings.app_name}
                                    onChange={(e) => setSettings({ ...settings, app_name: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Timeout Sesi (menit)
                                </label>
                                <input
                                    type="number"
                                    value={settings.session_timeout}
                                    onChange={(e) => setSettings({ ...settings, session_timeout: e.target.value })}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white outline-none"
                                />
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                                    <label htmlFor="maintenance_mode" className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
                                        Mode Maintenance
                                        <p className="text-xs text-gray-500 font-normal mt-0.5">Aktifkan untuk menutup akses publik sementara</p>
                                    </label>
                                    <Switch
                                        id="maintenance_mode"
                                        checked={settings.maintenance_mode}
                                        onCheckedChange={(checked) => setSettings({ ...settings, maintenance_mode: checked })}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                                    <label htmlFor="allow_registration" className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
                                        Izinkan Registrasi Baru
                                        <p className="text-xs text-gray-500 font-normal mt-0.5">Pengguna baru dapat mendaftar akun</p>
                                    </label>
                                    <Switch
                                        id="allow_registration"
                                        checked={settings.allow_registration}
                                        onCheckedChange={(checked) => setSettings({ ...settings, allow_registration: checked })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
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
