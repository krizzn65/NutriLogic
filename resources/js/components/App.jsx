import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './LandingPage';
import AuthSwitch from './auth/AuthSwitch';
import PageUtama from './PageUtama';
import ForgotPassword from './auth/ForgotPassword';
import { NotFoundPage } from './ui/404-page-not-found';
import { ServerErrorPage } from './ui/500-server-error';
import OfflineIndicator from './ui/OfflineIndicator';
import InstallPrompt from './ui/InstallPrompt';
import PWAUpdatePrompt from './ui/PWAUpdatePrompt';

function App() {
    const location = useLocation();

    return (
        <div className='w-full overflow-hidden font-montserrat'>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthSwitch />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/dashboard/*" element={<PageUtama />} />
                <Route path="*" element={<NotFoundPage />} />
                <Route path="/500" element={<ServerErrorPage />} />
            </Routes>
            
            {/* PWA Components */}
            <OfflineIndicator />
            <InstallPrompt />
            <PWAUpdatePrompt />
        </div>

    );
}

export default App;
