import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import SidebarKader from "./sidebars/SidebarKader";
import MobileBottomNavKader from "./sidebars/MobileBottomNavKader";
import {
    ProfileModalProvider,
    useProfileModal,
} from "../contexts/ProfileModalContext";
import { SettingsModalProvider } from "../contexts/SettingsModalContext";
import { DataCacheProvider } from "../contexts/DataCacheContext";
import ProfileModal from "./dashboard/ProfileModal";

const DashboardKaderContent = lazy(() => import("./konten/DashboardKader"));
const DataAnakKader = lazy(() => import("./konten/DataAnakKader"));
const TambahAnakKaderForm = lazy(() => import("./konten/TambahAnakKaderForm"));
const EditAnakKaderForm = lazy(() => import("./konten/EditAnakKaderForm"));
const DetailAnakKader = lazy(() => import("./konten/DetailAnakKader"));
const KegiatanPosyandu = lazy(() => import("./konten/PenimbanganMassal"));
const AnakPrioritas = lazy(() => import("./konten/AnakPrioritas"));
const AntrianPrioritas = lazy(() => import("./konten/AntrianPrioritas"));
const JadwalPosyandu = lazy(() => import("./konten/JadwalPosyandu"));
const TambahJadwalForm = lazy(() => import("./konten/TambahJadwalForm"));
const KonsultasiKader = lazy(() => import("./konten/KonsultasiKader"));
const LaporanKader = lazy(() => import("./konten/LaporanKader"));
const BroadcastKader = lazy(() => import("./konten/BroadcastKader"));
const ProfilKader = lazy(() => import("./konten/ProfilKader"));

const PageLoader = () => (
    <div
        className="flex flex-1 w-full h-full items-center justify-center bg-gray-50"
        role="status"
        aria-live="polite"
    >
        <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-gray-500 text-sm font-medium">Memuat...</p>
        </div>
    </div>
);

function KaderContent() {
    const { isOpen, closeProfileModal } = useProfileModal();

    return (
        <>
            <div className="flex flex-col md:flex-row bg-white w-full h-screen overflow-hidden font-montserrat">
                <a
                    href="#main-content-kader"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[10000] bg-white text-blue-700 border border-blue-200 rounded-lg px-3 py-2 text-sm font-medium shadow"
                >
                    Lewati ke konten utama
                </a>
                {/* Sidebar - Hidden on Mobile */}
                <div className="hidden md:block h-full">
                    <SidebarKader />
                </div>

                {/* Mobile Bottom Nav - Visible only on Mobile */}
                <MobileBottomNavKader />

                <main
                    id="main-content-kader"
                    role="main"
                    className="flex-1 overflow-auto pb-24 md:pb-0 no-scrollbar"
                >
                    <Suspense fallback={<PageLoader />}>
                        <Routes>
                            <Route index element={<DashboardKaderContent />} />
                            <Route
                                path="data-anak"
                                element={<DataAnakKader />}
                            />
                            <Route
                                path="data-anak/tambah"
                                element={<TambahAnakKaderForm />}
                            />
                            <Route
                                path="data-anak/edit/:id"
                                element={<EditAnakKaderForm />}
                            />
                            <Route
                                path="data-anak/:id"
                                element={<DetailAnakKader />}
                            />
                            <Route
                                path="kegiatan"
                                element={<KegiatanPosyandu />}
                            />
                            <Route
                                path="anak-prioritas"
                                element={<AnakPrioritas />}
                            />
                            <Route
                                path="antrian-prioritas"
                                element={<AntrianPrioritas />}
                            />
                            <Route path="jadwal" element={<JadwalPosyandu />} />
                            <Route
                                path="jadwal/tambah"
                                element={<TambahJadwalForm />}
                            />
                            <Route
                                path="konsultasi"
                                element={<KonsultasiKader />}
                            />
                            <Route
                                path="konsultasi/:id"
                                element={<KonsultasiKader />}
                            />
                            <Route path="laporan" element={<LaporanKader />} />
                            <Route
                                path="broadcast"
                                element={<BroadcastKader />}
                            />
                            <Route path="profile" element={<ProfilKader />} />
                        </Routes>
                    </Suspense>
                </main>
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
