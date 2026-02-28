import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { ServerErrorPage } from "./ui/500-server-error";

const LandingPage = lazy(() => import("./LandingPage"));
const AuthSwitch = lazy(() => import("./auth/AuthSwitch"));
const PageUtama = lazy(() => import("./PageUtama"));
const ForgotPassword = lazy(() => import("./auth/ForgotPassword"));
const NotFoundPage = lazy(() =>
    import("./ui/404-page-not-found").then((module) => ({
        default: module.NotFoundPage,
    })),
);
const OfflineIndicator = lazy(() => import("./ui/OfflineIndicator"));
const InstallPrompt = lazy(() => import("./ui/InstallPrompt"));
const PWAUpdatePrompt = lazy(() => import("./ui/PWAUpdatePrompt"));

const AppRouteLoader = () => (
    <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="text-center">
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
            <p className="text-sm font-medium text-slate-600">
                Memuat halaman...
            </p>
        </div>
    </div>
);

function App() {
    return (
        <div className="w-full overflow-hidden font-montserrat">
            <Suspense fallback={<AppRouteLoader />}>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/auth" element={<AuthSwitch />} />
                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />
                    <Route path="/dashboard/*" element={<PageUtama />} />
                    <Route path="*" element={<NotFoundPage />} />
                    <Route path="/500" element={<ServerErrorPage />} />
                </Routes>
            </Suspense>

            <Suspense fallback={null}>
                <OfflineIndicator />
                <InstallPrompt />
                <PWAUpdatePrompt />
            </Suspense>
        </div>
    );
}

export default App;
