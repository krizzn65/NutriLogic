import React from "react";
import { Routes, Route } from "react-router-dom";
import SidebarKader from "./sidebars/SidebarKader";
import DashboardKaderContent from "./konten/DashboardKader";
import DataAnakKader from "./konten/DataAnakKader";
import TambahAnakKaderForm from "./konten/TambahAnakKaderForm";
import EditAnakKaderForm from "./konten/EditAnakKaderForm";
import DetailAnakKader from "./konten/DetailAnakKader";
import PenimbanganMassal from "./konten/PenimbanganMassal";
import AnakPrioritas from "./konten/AnakPrioritas";
import JadwalPosyandu from "./konten/JadwalPosyandu";
import TambahJadwalForm from "./konten/TambahJadwalForm";
import KonsultasiKader from "./konten/KonsultasiKader";
import DetailKonsultasiKader from "./konten/DetailKonsultasiKader";
import LaporanKader from "./konten/LaporanKader";
import BroadcastKader from "./konten/BroadcastKader";
import ProfilKader from "./konten/ProfilKader";

export default function Kader() {
  return (
    <div className="flex flex-col md:flex-row bg-white w-full h-screen overflow-hidden font-montserrat">
      <SidebarKader />
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route index element={<DashboardKaderContent />} />
          <Route path="data-anak" element={<DataAnakKader />} />
          <Route path="data-anak/tambah" element={<TambahAnakKaderForm />} />
          <Route path="data-anak/edit/:id" element={<EditAnakKaderForm />} />
          <Route path="data-anak/:id" element={<DetailAnakKader />} />
          <Route path="penimbangan" element={<PenimbanganMassal />} />
          <Route path="anak-prioritas" element={<AnakPrioritas />} />
          <Route path="jadwal" element={<JadwalPosyandu />} />
          <Route path="jadwal/tambah" element={<TambahJadwalForm />} />
          <Route path="konsultasi" element={<KonsultasiKader />} />
          <Route path="konsultasi/:id" element={<DetailKonsultasiKader />} />
          <Route path="laporan" element={<LaporanKader />} />
          <Route path="broadcast" element={<BroadcastKader />} />
          <Route path="profile" element={<ProfilKader />} />
          <Route path="input-data" element={<InputDataPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
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
