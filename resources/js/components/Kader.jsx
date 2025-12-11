import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import SidebarKader from "./sidebars/SidebarKader";
import MobileBottomNavKader from "./sidebars/MobileBottomNavKader";
import { ProfileModalProvider, useProfileModal } from "../contexts/ProfileModalContext";
import { SettingsModalProvider } from "../contexts/SettingsModalContext";
import { DataCacheProvider } from "../contexts/DataCacheContext";
import ProfileModal from "./dashboard/ProfileModal";
import DashboardKaderContent from "./konten/DashboardKader";
import DataAnakKader from "./konten/DataAnakKader";
import TambahAnakKaderForm from "./konten/TambahAnakKaderForm";
import EditAnakKaderForm from "./konten/EditAnakKaderForm";
import DetailAnakKader from "./konten/DetailAnakKader";
import KegiatanPosyandu from "./konten/PenimbanganMassal";
import AnakPrioritas from "./konten/AnakPrioritas";
import JadwalPosyandu from "./konten/JadwalPosyandu";
import TambahJadwalForm from "./konten/TambahJadwalForm";
import KonsultasiKader from "./konten/KonsultasiKader";
import DetailKonsultasiKader from "./konten/DetailKonsultasiKader";
import LaporanKader from "./konten/LaporanKader";
import BroadcastKader from "./konten/BroadcastKader";
import ProfilKader from "./konten/ProfilKader";

function KaderContent() {
  const { isOpen, closeProfileModal } = useProfileModal();

  return (
    <>
      <div className="flex flex-col md:flex-row bg-white w-full h-screen overflow-hidden font-montserrat">
        {/* Sidebar - Hidden on Mobile */}
        <div className="hidden md:block h-full">
          <SidebarKader />
        </div>

        {/* Mobile Bottom Nav - Visible only on Mobile */}
        <MobileBottomNavKader />

        <div className="flex-1 overflow-auto pb-24 md:pb-0 no-scrollbar">
          <Routes>
            <Route index element={<DashboardKaderContent />} />
            <Route path="data-anak" element={<DataAnakKader />} />
            <Route path="data-anak/tambah" element={<TambahAnakKaderForm />} />
            <Route path="data-anak/edit/:id" element={<EditAnakKaderForm />} />
            <Route path="data-anak/:id" element={<DetailAnakKader />} />
            <Route path="kegiatan" element={<KegiatanPosyandu />} />
            <Route path="anak-prioritas" element={<AnakPrioritas />} />
            <Route path="jadwal" element={<JadwalPosyandu />} />
            <Route path="jadwal/tambah" element={<TambahJadwalForm />} />
            <Route path="konsultasi" element={<KonsultasiKader />} />
            <Route path="konsultasi/:id" element={<KonsultasiKader />} />
            <Route path="laporan" element={<LaporanKader />} />
            <Route path="broadcast" element={<BroadcastKader />} />
            <Route path="profile" element={<ProfilKader />} />
          </Routes>
        </div>
      </div>
      <ProfileModal isOpen={isOpen} onClose={closeProfileModal} />
    </>
  );
}

export default function Kader() {
  return (
    <ProfileModalProvider>
      <DataCacheProvider>
        <SettingsModalProvider>
          <KaderContent />
        </SettingsModalProvider>
      </DataCacheProvider>
    </ProfileModalProvider>
  );
}

