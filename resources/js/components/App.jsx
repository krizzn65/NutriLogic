import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './LandingPage';
import AuthSwitch from './auth/AuthSwitch';
import PageUtama from './PageUtama';
import ForgotPassword from './auth/ForgotPassword';

function App() {
    const location = useLocation();
    
    return (
        <div className='w-full overflow-hidden font-montserrat'>
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/auth" element={<AuthSwitch />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/dashboard/*" element={<PageUtama />} />
                </Routes>
            </AnimatePresence>
        </div>
        
    );
}

export default App;
