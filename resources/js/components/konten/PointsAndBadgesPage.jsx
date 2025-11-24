import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import PointsBadgesSkeleton from "../loading/PointsBadgesSkeleton";
import { useDataCache } from "../../contexts/DataCacheContext";

export default function PointsAndBadgesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pointsData, setPointsData] = useState(null);
  const { getCachedData, setCachedData } = useDataCache();

  useEffect(() => {
    fetchPoints();
  }, []);

  const fetchPoints = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cachedData = getCachedData('points');
      if (cachedData) {
        setPointsData(cachedData);
        setLoading(false);
        return;
      }

      // Fetch from API if no cache
      const response = await api.get('/parent/points');
      const data = response.data.data;
      setPointsData(data);
      setCachedData('points', data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Gagal memuat data poin dan badge';
      setError(errorMessage);
      console.error('Error fetching points:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PointsBadgesSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4 md:p-10 w-full h-full bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchPoints}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!pointsData) {
    return (
      <div className="p-4 md:p-10 w-full h-full bg-gray-50">
        <div className="text-gray-500">Tidak ada data</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 w-full h-full bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Poin & Badge</h1>
        <p className="text-gray-600 mt-2">
          Lihat poin dan badge yang telah Anda dapatkan dari aktivitas rutin update data, membaca artikel edukasi, dan patuh jadwal posyandu.
        </p>
      </div>

      {/* Points Display */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium mb-2">Total Poin Anda</p>
              <h2 className="text-5xl font-bold text-white">{pointsData.total_points || 0}</h2>
            </div>
            <div className="text-6xl">⭐</div>
          </div>
        </div>
      </div>

      {/* Earned Badges Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Badge yang Sudah Didapat</h2>
        {pointsData.badges && pointsData.badges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pointsData.badges.map((badge) => (
              <div
                key={badge.id}
                className="bg-white rounded-lg p-6 shadow-md border-2 border-green-500"
              >
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{badge.icon || '🏆'}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">{badge.badge_name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{badge.badge_description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Didapat: {new Date(badge.earned_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-6 shadow-md text-center text-gray-500">
            Belum ada badge yang didapat. Mulai aktivitas untuk mendapatkan badge pertama!
          </div>
        )}
      </div>

      {/* All Badge Definitions Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Semua Badge Tersedia</h2>
        {pointsData.badge_definitions && pointsData.badge_definitions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pointsData.badge_definitions.map((badge) => (
              <div
                key={badge.code}
                className={`bg-white rounded-lg p-6 shadow-md border-2 ${badge.is_earned
                  ? 'border-green-500'
                  : 'border-gray-200 opacity-60'
                  }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{badge.icon || '🏆'}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-bold text-gray-800">{badge.name}</h3>
                      {badge.is_earned && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          ✓ Didapat
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{badge.description}</p>
                    {!badge.is_earned && (
                      <p className="text-xs text-gray-400 mt-2 italic">Belum didapat</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-6 shadow-md text-center text-gray-500">
            Tidak ada badge tersedia
          </div>
        )}
      </div>
    </div>
  );
}

