import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import GenericFormSkeleton from "../loading/GenericFormSkeleton";
import { useDataCache } from "../../contexts/DataCacheContext";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [settings, setSettings] = useState({
    notification_channel: "none",
  });
  const { getCachedData, setCachedData, invalidateCache } = useDataCache();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Check cache first
      const cachedData = getCachedData('settings');
      if (cachedData) {
        setSettings(cachedData);
        setLoading(false);
        return;
      }

      // Fetch from API if no cache
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await api.put("/parent/settings", {
        notification_channel: settings.notification_channel,
      });

      setSuccessMessage("Pengaturan berhasil disimpan!");
      const data = response.data.data;
      setSettings(data);

      // Update cache
      setCachedData('settings', data);
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

  const handleNotificationChannelChange = (value) => {
    setSettings((prev) => ({
      ...prev,
      notification_channel: value,
    }));
  };

  // Loading state
  if (loading) {
    return <GenericFormSkeleton fieldCount={1} />;
  }

  return (
    <div className="flex flex-1 w-full h-full overflow-auto">
      <div className="p-4 md:p-10 w-full h-full bg-gray-50">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Pengaturan</h1>
          <p className="text-gray-600 mt-2">
            Kelola preferensi notifikasi dan pengaturan akun Anda
          </p>
        </div>

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

        {/* Settings Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit}>
            {/* Notification Preferences */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Preferensi Notifikasi
              </h2>
              <p className="text-gray-600 mb-4">
                Pilih saluran notifikasi yang Anda inginkan untuk menerima
                pemberitahuan dari sistem.
              </p>

              <div className="space-y-3">
                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="notification_channel"
                    value="none"
                    checked={settings.notification_channel === "none"}
                    onChange={(e) =>
                      handleNotificationChannelChange(e.target.value)
                    }
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      Tidak Ada
                    </div>
                    <div className="text-sm text-gray-500">
                      Tidak menerima notifikasi
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="notification_channel"
                    value="whatsapp"
                    checked={settings.notification_channel === "whatsapp"}
                    onChange={(e) =>
                      handleNotificationChannelChange(e.target.value)
                    }
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      WhatsApp
                    </div>
                    <div className="text-sm text-gray-500">
                      Menerima notifikasi melalui WhatsApp
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="notification_channel"
                    value="email"
                    checked={settings.notification_channel === "email"}
                    onChange={(e) =>
                      handleNotificationChannelChange(e.target.value)
                    }
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      Email
                    </div>
                    <div className="text-sm text-gray-500">
                      Menerima notifikasi melalui Email
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "Menyimpan..." : "Simpan Pengaturan"}
              </button>
            </div>
          </form>
        </div>

        {/* Info Note */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Catatan:</strong> Pengaturan notifikasi ini akan digunakan
            untuk mengirimkan pemberitahuan penting terkait kesehatan dan
            perkembangan anak Anda. Pengaturan ini dapat dikaitkan dengan
            workflow otomatis di tahap selanjutnya.
          </p>
        </div>
      </div>
    </div>
  );
}

