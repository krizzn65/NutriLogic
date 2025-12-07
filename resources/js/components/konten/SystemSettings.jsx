import React, { useState, useEffect } from "react";
import { Settings, Save } from "lucide-react";
import PageHeader from "../ui/PageHeader";
import api from "../../lib/api";

export default function SystemSettings() {
    const [settings, setSettings] = useState({
        app_name: 'NutriLogic',
        maintenance_mode: false,
        allow_registration: true,
        max_file_size: '5',
        session_timeout: '60',
    });
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/settings');
            const data = response.data.data;
            setSettings({
                app_name: data.app_name || 'NutriLogic',
                maintenance_mode: data.maintenance_mode || false,
                allow_registration: data.allow_registration !== false,
                session_timeout: (data.session_timeout || 60).toString(),
                max_file_size: (data.max_file_size || 5).toString(),
            });
        } catch (err) {
            console.error('Failed to load settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/admin/settings', {
                app_name: settings.app_name,
                maintenance_mode: settings.maintenance_mode,
                allow_registration: settings.allow_registration,
                session_timeout: parseInt(settings.session_timeout, 10),
                max_file_size: parseInt(settings.max_file_size, 10),
            });
            alert('Pengaturan berhasil disimpan!');
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menyimpan pengaturan.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-4 md:p-10 w-full h-full bg-gray-50">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 w-full h-full bg-gray-50/50 overflow-hidden font-montserrat">
            <PageHeader title="Pengaturan Sistem" subtitle="Konfigurasi sistem NutriLogic">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </button>
            </PageHeader>
            <div className="flex-1 overflow-auto p-6 space-y-6">

                {/* Settings Form */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Pengaturan Umum
                    </h2>

                    <div className="space-y-4 max-w-2xl">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nama Aplikasi
                            </label>
                            <input
                                type="text"
                                value={settings.app_name}
                                onChange={(e) => setSettings({ ...settings, app_name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ukuran File Maksimal (MB)
                            </label>
                            <input
                                type="number"
                                value={settings.max_file_size}
                                onChange={(e) => setSettings({ ...settings, max_file_size: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="maintenance_mode"
                                checked={settings.maintenance_mode}
                                onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="maintenance_mode" className="text-sm text-gray-700">
                                Mode Maintenance
                            </label>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="allow_registration"
                                checked={settings.allow_registration}
                                onChange={(e) => setSettings({ ...settings, allow_registration: e.target.checked })}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="allow_registration" className="text-sm text-gray-700">
                                Izinkan Registrasi Baru
                            </label>
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                        <strong>Catatan:</strong> Pengaturan ini akan mempengaruhi seluruh sistem. Pastikan Anda memahami dampak dari setiap perubahan sebelum menyimpan.
                    </p>
                </div>
            </div>
        </div>
    );
}
