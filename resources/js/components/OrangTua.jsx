import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import SidebarOrangTua from "./sidebars/SidebarOrangTua";
import MobileBottomNav from "./sidebars/MobileBottomNav";
import { SettingsModalProvider } from "../contexts/SettingsModalContext";
import { DataCacheProvider } from "../contexts/DataCacheContext";
import { ProfileModalProvider, useProfileModal } from "../contexts/ProfileModalContext";
import ProfileModal from "./dashboard/ProfileModal";

// Lazy load all route components for better performance
const DashboardOrangTuaContent = lazy(() => import("./konten/DashboardOrangTua"));
const DataAnakList = lazy(() => import("./konten/DataAnakList"));
const DataAnakDetail = lazy(() => import("./konten/DataAnakDetail"));
const TambahAnakForm = lazy(() => import("./konten/TambahAnakForm"));
const EditAnakForm = lazy(() => import("./konten/EditAnakForm"));
const NutriAssistPage = lazy(() => import("./konten/NutriAssistPage"));
const JurnalMakanPage = lazy(() => import("./konten/JurnalMakanPage"));
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

// Content component that uses the ProfileModal context
function OrangTuaContent() {
  const { isOpen, closeProfileModal } = useProfileModal();

  return (
    <>
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
              <Route path="jurnal-makan" element={<JurnalMakanPage />} />
              <Route path="konsultasi" element={<ConsultationList />} />
              <Route path="konsultasi/create" element={<CreateConsultation />} />
              <Route path="konsultasi/:id" element={<ConsultationList />} />
              <Route path="gamification" element={<PointsAndBadgesPage />} />
              <Route path="riwayat" element={<HistoryPage />} />
            </Routes>
          </Suspense>
        </div>
      </div>

      {/* ProfileModal rendered outside the main layout */}
      <ProfileModal isOpen={isOpen} onClose={closeProfileModal} />
    </>
  );
}

export default function OrangTua() {
  return (
    <ProfileModalProvider>
      <DataCacheProvider>
        <SettingsModalProvider>
          <OrangTuaContent />
        </SettingsModalProvider>
      </DataCacheProvider>
    </ProfileModalProvider>
  );
}



