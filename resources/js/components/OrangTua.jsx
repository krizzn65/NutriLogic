import React from "react";
import { Routes, Route } from "react-router-dom";
import SidebarOrangTua from "./sidebars/SidebarOrangTua";
import DashboardOrangTuaContent from "./konten/DashboardOrangTua";
import DataAnakList from "./konten/DataAnakList";
import DataAnakDetail from "./konten/DataAnakDetail";
import TambahAnakForm from "./konten/TambahAnakForm";
import EditAnakForm from "./konten/EditAnakForm";
import NutriAssistPage from "./konten/NutriAssistPage";
import ConsultationList from "./konten/ConsultationList";
import ConsultationDetail from "./konten/ConsultationDetail";
import CreateConsultation from "./konten/CreateConsultation";
import PointsAndBadgesPage from "./konten/PointsAndBadgesPage";
import HistoryPage from "./konten/HistoryPage";
import SettingsPage from "./konten/SettingsPage";
import ProfilePage from "./konten/ProfilePage";
import { DataCacheProvider } from "../contexts/DataCacheContext";

export default function OrangTua() {
  return (
    <DataCacheProvider>
      <div className="flex flex-col md:flex-row bg-white w-full h-screen overflow-hidden">
        <SidebarOrangTua />
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route index element={<DashboardOrangTuaContent />} />
            <Route path="anak" element={<DataAnakList />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="riwayat" element={<HistoryPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </div>
    </DataCacheProvider>
  );
}



