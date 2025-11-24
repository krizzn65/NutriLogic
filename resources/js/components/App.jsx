import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import AuthSwitch from './auth/AuthSwitch';
import PageUtama from './PageUtama';
import ForgotPassword from './auth/ForgotPassword';

function App() {
    return (
        <div className='w-full overflow-hidden font-montserrat'>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthSwitch />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/dashboard/*" element={<PageUtama />} />
            </Routes>
        </div>
        
    );
}

export default App;
