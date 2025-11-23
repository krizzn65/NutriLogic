import React from "react";
import { Routes, Route } from "react-router-dom";
import SidebarOrangTua from "./sidebars/SidebarOrangTua";
import DashboardOrangTuaContent from "./konten/DashboardOrangTua";
import DataAnakList from "./konten/DataAnakList";
import DataAnakDetail from "./konten/DataAnakDetail";

export default function OrangTua() {
  return (
    <div className="flex flex-col md:flex-row bg-white w-full h-screen overflow-hidden">
      <SidebarOrangTua />
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route index element={<DashboardOrangTuaContent />} />
          <Route path="anak" element={<DataAnakList />} />
          <Route path="anak/:id" element={<DataAnakDetail />} />
          <Route path="nutri-assist" element={<NutriAssistPage />} />
          <Route path="konsultasi" element={<KonsultasiPage />} />
          <Route path="gamification" element={<GamificationPage />} />
          <Route path="riwayat" element={<RiwayatPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </div>
  );
}

const ProfilePage = () => (
  <div className="p-4 md:p-10 w-full h-full bg-gray-50">
    <h1 className="text-3xl font-bold text-gray-800">Profil</h1>
    <p className="text-gray-600 mt-2">Halaman profil orang tua</p>
  </div>
);

const RiwayatPage = () => (
  <div className="p-4 md:p-10 w-full h-full bg-gray-50">
    <h1 className="text-3xl font-bold text-gray-800">Riwayat</h1>
    <p className="text-gray-600 mt-2">Halaman riwayat kunjungan</p>
  </div>
);

const SettingsPage = () => (
  <div className="p-4 md:p-10 w-full h-full bg-gray-50">
    <h1 className="text-3xl font-bold text-gray-800">Pengaturan</h1>
    <p className="text-gray-600 mt-2">Halaman pengaturan</p>
  </div>
);

const NutriAssistPage = () => (
  <div className="p-4 md:p-10 w-full h-full bg-gray-50">
    <h1 className="text-3xl font-bold text-gray-800">Nutri-Assist</h1>
    <p className="text-gray-600 mt-2">
      Input bahan makanan yang ada di rumah untuk mendapatkan rekomendasi menu MPASI yang sesuai gizi anak.
    </p>
  </div>
);

const KonsultasiPage = () => (
  <div className="p-4 md:p-10 w-full h-full bg-gray-50">
    <h1 className="text-3xl font-bold text-gray-800">Konsultasi</h1>
    <p className="text-gray-600 mt-2">
      Tanya jawab singkat seputar gizi, jadwal posyandu, dan keluhan anak dengan kader.
    </p>
  </div>
);

const GamificationPage = () => (
  <div className="p-4 md:p-10 w-full h-full bg-gray-50">
    <h1 className="text-3xl font-bold text-gray-800">Poin & Badge</h1>
    <p className="text-gray-600 mt-2">
      Lihat poin dan badge yang telah Anda dapatkan dari aktivitas rutin update data, membaca artikel edukasi, dan patuh jadwal posyandu.
    </p>
  </div>
);
