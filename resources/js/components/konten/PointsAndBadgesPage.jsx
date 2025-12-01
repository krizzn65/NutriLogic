import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import PointsBadgesSkeleton from "../loading/PointsBadgesSkeleton";
import { useDataCache } from "../../contexts/DataCacheContext";
import PageHeader from "../dashboard/PageHeader";

export default function PointsAndBadgesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pointsData, setPointsData] = useState(null);
  const { getCachedData, setCachedData } = useDataCache();
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPoints();
  }, []);

  const fetchPoints = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cachedData = getCachedData('points_v2');
      if (cachedData) {
        setPointsData(cachedData);
        setLoading(false);
        return;
      }

      // Fetch from API if no cache
      const response = await api.get('/parent/points');
      const data = response.data.data;
      setPointsData(data);
      setCachedData('points_v2', data);
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
      <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-bold text-red-800 mb-2">Terjadi Kesalahan</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={fetchPoints}
            className="px-6 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!pointsData) {
    return (
      <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 font-medium">Tidak ada data tersedia</div>
      </div>
    );
  }

  // Calculate Level and Progress (Mock logic for visual)
  const currentPoints = pointsData.total_points || 0;
  const currentLevel = Math.floor(currentPoints / 1000) + 1;
  const nextLevelPoints = currentLevel * 1000;
  const progress = (currentPoints % 1000) / 1000 * 100;
  const pointsToNextLevel = 1000 - (currentPoints % 1000);

  // Filter badges based on selection
  const filteredBadges = pointsData?.badge_definitions?.filter(badge => {
    if (filter === 'earned') return badge.is_earned;
    if (filter === 'locked') return !badge.is_earned;
    return true;
  }) || [];

  return (
    <div className="p-4 md:p-10 w-full h-full bg-slate-50 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
      {/* Header - STRICTLY PRESERVED */}
      <PageHeader title="Poin & Badge" subtitle="Portal Orang Tua" />

      <div className="w-full space-y-8">

        {/* Top Section: Membership Card & Stats */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Membership Card */}
          <div className="lg:col-span-7">
            <div className="relative w-full aspect-[2.2/1] rounded-3xl overflow-hidden shadow-2xl transform transition-transform hover:scale-[1.01] duration-500 group">
              {/* Card Background - Sleek Indigo/Blue */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-blue-600"></div>

              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-gradient-to-l from-white/10 to-transparent skew-x-12"></div>
              <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-cyan-400/20 rounded-full blur-3xl"></div>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

              {/* Glass Overlay */}
              <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>

              {/* Card Content */}
              <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-between text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm md:text-base font-medium tracking-[0.2em] text-yellow-500 uppercase mb-1">NutriLogic Point</h3>
                    <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-white">
                      Pencapaian Saya
                    </h2>
                  </div>
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-yellow-500/50 flex items-center justify-center bg-yellow-500/10 backdrop-blur-md">
                    <span className="text-2xl md:text-3xl">⭐</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-end gap-3">
                    <span className="text-5xl md:text-7xl font-black tracking-tighter text-white drop-shadow-lg">
                      {currentPoints.toLocaleString()}
                    </span>
                    <span className="text-lg md:text-xl font-medium text-slate-400 mb-2">PTS</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs md:text-sm font-medium text-slate-400">
                      <span>Progress Target</span>
                      <span className="text-white font-bold">{currentPoints.toLocaleString()} / {nextLevelPoints.toLocaleString()} PTS</span>
                    </div>
                    <div className="h-3 w-full bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-200 shadow-[0_0_15px_rgba(234,179,8,0.5)] relative transition-all duration-1000 ease-out"
                        style={{ width: `${Math.min(Math.max(progress, 5), 100)}%` }}
                      >
                        <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                      </div>
                    </div>
                    <p className="text-right text-xs text-yellow-500 mt-1">
                      {pointsToNextLevel.toLocaleString()} poin lagi untuk target selanjutnya
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats / Benefits */}
          {/* Quick Stats / Benefits */}
          {/* Quick Stats / Benefits */}
          <div className="lg:col-span-5 grid grid-cols-2 lg:flex lg:flex-col gap-4 lg:gap-6 h-full">
            <div className="bg-white rounded-3xl p-4 md:p-8 border border-slate-100 shadow-lg flex flex-col md:flex-row items-center md:items-center gap-3 md:gap-6 hover:shadow-xl transition-shadow flex-1 text-center md:text-left">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl md:text-3xl text-blue-600 shadow-sm">
                📊
              </div>
              <div>
                <p className="text-slate-500 text-xs md:text-base font-medium mb-1">Total Aktivitas</p>
                <h4 className="text-xl md:text-3xl font-bold text-slate-800">{pointsData.total_activities || 0} <span className="text-xs md:text-sm font-normal text-slate-400">kali</span></h4>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-4 md:p-8 border border-slate-100 shadow-lg flex flex-col md:flex-row items-center md:items-center gap-3 md:gap-6 hover:shadow-xl transition-shadow flex-1 text-center md:text-left">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-purple-50 flex items-center justify-center text-2xl md:text-3xl text-purple-600 shadow-sm">
                🏆
              </div>
              <div>
                <p className="text-slate-500 text-xs md:text-base font-medium mb-1">Badge Dimiliki</p>
                <h4 className="text-xl md:text-3xl font-bold text-slate-800">{pointsData.badges?.length || 0} <span className="text-xs md:text-sm font-normal text-slate-400">badge</span></h4>
              </div>
            </div>
          </div>
        </div>

        {/* Badges Collection */}
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Badges</h2>
              <p className="text-slate-500 mt-1">Koleksi pencapaian eksklusif Anda</p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${filter === 'all'
                  ? 'bg-slate-800 text-white shadow-lg shadow-slate-200 scale-105'
                  : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
                  }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilter('earned')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${filter === 'earned'
                  ? 'bg-slate-800 text-white shadow-lg shadow-slate-200 scale-105'
                  : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
                  }`}
              >
                Terbuka
              </button>
              <button
                onClick={() => setFilter('locked')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${filter === 'locked'
                  ? 'bg-slate-800 text-white shadow-lg shadow-slate-200 scale-105'
                  : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
                  }`}
              >
                Terkunci
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {filteredBadges.map((badge) => (
              <div
                key={badge.code}
                className={`group relative aspect-[4/5] rounded-[2rem] transition-all duration-300 ${badge.is_earned
                  ? 'bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-12px_rgba(234,179,8,0.3)] hover:-translate-y-2 border border-slate-100 hover:border-yellow-200'
                  : 'bg-slate-50 border border-slate-200 opacity-80 hover:opacity-100'
                  }`}
              >
                <div className="relative h-full w-full rounded-[2rem] overflow-hidden flex flex-col items-center p-6 text-center">
                  {/* Rarity Tag */}
                  <div className={`absolute top-4 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${badge.is_earned
                    ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700'
                    : 'bg-slate-200 text-slate-500'
                    }`}>
                    {badge.is_earned ? 'Unlocked' : 'Locked'}
                  </div>

                  {/* Icon Container */}
                  <div className={`mt-6 mb-4 w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-lg transition-transform duration-500 group-hover:scale-110 ${badge.is_earned
                    ? 'bg-gradient-to-br from-yellow-100 to-white ring-4 ring-yellow-50'
                    : 'bg-slate-200 grayscale contrast-75 ring-4 ring-slate-100'
                    }`}>
                    {badge.icon || '🏆'}
                  </div>

                  {/* Text Content */}
                  <h3 className={`font-bold text-sm md:text-base mb-1 line-clamp-1 ${badge.is_earned ? 'text-slate-800' : 'text-slate-500'}`}>
                    {badge.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {badge.description}
                  </p>

                  {/* Bottom Status */}
                  <div className="mt-auto pt-4 w-full">
                    {badge.is_earned ? (
                      <div className="w-full py-1.5 bg-green-50 text-green-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        DIMILIKI
                      </div>
                    ) : (
                      <div className="w-full py-1.5 bg-slate-200 text-slate-500 rounded-xl text-xs font-bold flex items-center justify-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 0 00-2 2v6a2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        TERKUNCI
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
