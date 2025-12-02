import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import SidebarKader from "./sidebars/SidebarKader";
import { ProfileModalProvider } from "../contexts/ProfileModalContext";
import { SettingsModalProvider } from "../contexts/SettingsModalContext";
import { DataCacheProvider } from "../contexts/DataCacheContext";
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
    <DataCacheProvider>
      <ProfileModalProvider>
        <SettingsModalProvider>
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
            </Routes>
          </div>
        </div>
      </SettingsModalProvider>
    </ProfileModalProvider>
    </DataCacheProvider>
  );
}
