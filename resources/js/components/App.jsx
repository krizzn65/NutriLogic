import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './Header';
import AuthSwitch from './auth';
import Dashboard from './Dashboard';

function App() {
    return (
        <div className='w-full overflow-hidden'>
            <Routes>
                <Route path="/" element={<Header />} />
                <Route path="/auth" element={<AuthSwitch />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </div>
        
    );
}

export default App;
