import React from "react";
import { Routes, Route } from "react-router-dom";
import SidebarOrangTua from "./sidebars/SidebarOrangTua";
import MobileBottomNav from "./sidebars/MobileBottomNav";
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
import { SettingsModalProvider } from "../contexts/SettingsModalContext";
import { DataCacheProvider } from "../contexts/DataCacheContext";
import { ProfileModalProvider } from "../contexts/ProfileModalContext";

export default function OrangTua() {
  return (
    <DataCacheProvider>
      <ProfileModalProvider>
        <SettingsModalProvider>
          <div className="flex flex-col md:flex-row bg-white w-full h-screen overflow-hidden">
            {/* Sidebar - Hidden on Mobile */}
            <div className="hidden md:block h-full">
              <SidebarOrangTua />
            </div>

            {/* Mobile Bottom Nav - Visible only on Mobile */}
            <MobileBottomNav />

            <div className="flex-1 overflow-auto pb-24 md:pb-0 no-scrollbar">
              <Routes>
                <Route index element={<DashboardOrangTuaContent />} />
                <Route path="anak" element={<DataAnakList />} />
                <Route path="anak/tambah" element={<TambahAnakForm />} />
                <Route path="anak/edit/:id" element={<EditAnakForm />} />
                <Route path="anak/:id" element={<DataAnakDetail />} />
                <Route path="nutri-assist" element={<NutriAssistPage />} />
                <Route path="konsultasi" element={<ConsultationList />} />
                <Route path="konsultasi/create" element={<CreateConsultation />} />
                <Route path="konsultasi/:id" element={<ConsultationDetail />} />
                <Route path="gamification" element={<PointsAndBadgesPage />} />
                <Route path="riwayat" element={<HistoryPage />} />
              </Routes>
            </div>
          </div>
        </SettingsModalProvider>
      </ProfileModalProvider>
    </DataCacheProvider>
  );
}



