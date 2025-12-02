import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import SidebarOrangTua from "./sidebars/SidebarOrangTua";
import MobileBottomNav from "./sidebars/MobileBottomNav";
import { SettingsModalProvider } from "../contexts/SettingsModalContext";
import { DataCacheProvider } from "../contexts/DataCacheContext";
import { ProfileModalProvider } from "../contexts/ProfileModalContext";

// Lazy load all route components for better performance
const DashboardOrangTuaContent = lazy(() => import("./konten/DashboardOrangTua"));
const DataAnakList = lazy(() => import("./konten/DataAnakList"));
const DataAnakDetail = lazy(() => import("./konten/DataAnakDetail"));
const TambahAnakForm = lazy(() => import("./konten/TambahAnakForm"));
const EditAnakForm = lazy(() => import("./konten/EditAnakForm"));
const NutriAssistPage = lazy(() => import("./konten/NutriAssistPage"));
const ConsultationList = lazy(() => import("./konten/ConsultationList"));
const CreateConsultation = lazy(() => import("./konten/CreateConsultation"));
const PointsAndBadgesPage = lazy(() => import("./konten/PointsAndBadgesPage"));
const HistoryPage = lazy(() => import("./konten/HistoryPage"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex flex-1 w-full h-full items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
      <p className="text-gray-500 text-sm font-medium">Memuat...</p>
    </div>
  </div>
);

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
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route index element={<DashboardOrangTuaContent />} />
                  <Route path="anak" element={<DataAnakList />} />
                  <Route path="anak/tambah" element={<TambahAnakForm />} />
                  <Route path="anak/edit/:id" element={<EditAnakForm />} />
                  <Route path="anak/:id" element={<DataAnakDetail />} />
                  <Route path="nutri-assist" element={<NutriAssistPage />} />
                  <Route path="konsultasi" element={<ConsultationList />} />
                  <Route path="konsultasi/create" element={<CreateConsultation />} />
                  <Route path="konsultasi/:id" element={<ConsultationList />} />
                  <Route path="gamification" element={<PointsAndBadgesPage />} />
                  <Route path="riwayat" element={<HistoryPage />} />
                </Routes>
              </Suspense>
            </div>
          </div>
        </SettingsModalProvider>
      </ProfileModalProvider>
    </DataCacheProvider>
  );
}



