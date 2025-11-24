import React from "react";
import { Routes, Route } from "react-router-dom";
import SidebarKader from "./sidebars/SidebarKader";
import DashboardKaderContent from "./konten/DashboardKader";

export default function Kader() {
  return (
    <div className="flex flex-col md:flex-row bg-white w-full h-screen overflow-hidden font-montserrat">
      <SidebarKader />
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route index element={<DashboardKaderContent />} />
          <Route path="data-anak" element={<DataAnakPage />} />
          <Route path="input-data" element={<InputDataPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </div>
  );
}


const DataAnakPage = () => (
  <div className="p-4 md:p-10 w-full h-full bg-gray-50">
    <h1 className="text-3xl font-bold text-gray-800">Data Anak</h1>
    <p className="text-gray-600 mt-2">Halaman data semua anak di posyandu</p>
  </div>
);

const InputDataPage = () => (
  <div className="p-4 md:p-10 w-full h-full bg-gray-50">
    <h1 className="text-3xl font-bold text-gray-800">Input Data</h1>
    <p className="text-gray-600 mt-2">Halaman input data anak baru</p>
  </div>
);

const ReportsPage = () => (
  <div className="p-4 md:p-10 w-full h-full bg-gray-50">
    <h1 className="text-3xl font-bold text-gray-800">Laporan</h1>
    <p className="text-gray-600 mt-2">Halaman laporan dan dokumentasi</p>
  </div>
);

const StatisticsPage = () => (
  <div className="p-4 md:p-10 w-full h-full bg-gray-50">
    <h1 className="text-3xl font-bold text-gray-800">Statistik</h1>
    <p className="text-gray-600 mt-2">Halaman statistik dan analisis data</p>
  </div>
);

const ProfilePage = () => (
  <div className="p-4 md:p-10 w-full h-full bg-gray-50">
    <h1 className="text-3xl font-bold text-gray-800">Profil</h1>
    <p className="text-gray-600 mt-2">Halaman profil kader</p>
  </div>
);

const SettingsPage = () => (
  <div className="p-4 md:p-10 w-full h-full bg-gray-50">
    <h1 className="text-3xl font-bold text-gray-800">Pengaturan</h1>
    <p className="text-gray-600 mt-2">Halaman pengaturan aplikasi</p>
  </div>
);
