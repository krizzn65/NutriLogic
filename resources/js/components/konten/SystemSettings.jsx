import React, { useState } from "react";
import { Settings, Save } from "lucide-react";

export default function SystemSettings() {
    const [settings, setSettings] = useState({
        app_name: 'NutriLogic',
        maintenance_mode: false,
        allow_registration: true,
        max_file_size: '5',
        session_timeout: '60',
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        // Simulate save
        setTimeout(() => {
            setSaving(false);
            alert('Pengaturan berhasil disimpan!');
        }, 1000);
    };

    return (
        <div className="flex flex-1 w-full h-full overflow-auto">
            <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Pengaturan Sistem</h1>
                    <p className="text-gray-600 mt-2">Konfigurasi sistem NutriLogic</p>
                </div>

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

                        <div className="pt-4">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                            </button>
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
