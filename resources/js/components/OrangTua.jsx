import React from "react";
import { Routes, Route } from "react-router-dom";
import SidebarOrangTua from "./sidebars/SidebarOrangTua";
import DashboardOrangTuaContent from "./konten/DashboardOrangTua";
import DataAnakList from "./konten/DataAnakList";
import DataAnakDetail from "./konten/DataAnakDetail";
import NutriAssistPage from "./konten/NutriAssistPage";
import ConsultationList from "./konten/ConsultationList";
import ConsultationDetail from "./konten/ConsultationDetail";
import CreateConsultation from "./konten/CreateConsultation";
import PointsAndBadgesPage from "./konten/PointsAndBadgesPage";

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
          <Route path="konsultasi" element={<ConsultationList />} />
          <Route path="konsultasi/new" element={<CreateConsultation />} />
          <Route path="konsultasi/:id" element={<ConsultationDetail />} />
          <Route path="gamification" element={<PointsAndBadgesPage />} />
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



