import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, LogOut } from 'lucide-react';
import { logoutWithApi } from '../../lib/auth';
import logoScroll from '../../assets/logo_scroll.svg';

export default function MaintenancePage() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logoutWithApi();
        navigate('/auth');
    };

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <section className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
            {/* Main Content - Perfectly Centered */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <div className="flex flex-col items-center text-center -mt-16">
                    {/* Logo */}
                    <img
                        src={logoScroll}
                        alt="NutriLogic Logo"
                        className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 object-contain"
                    />

                    {/* Text - close to logo */}
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-center w-full max-w-md px-4 -mt-20">
                        Sistem sedang dalam pemeliharaan untuk peningkatan layanan.
                        Mohon maaf atas ketidaknyamanan ini.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap justify-center gap-4 mt-8">
                        <button
                            onClick={handleGoHome}
                            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm hover:shadow-md"
                        >
                            <Home className="w-4 h-4" />
                            Ke Beranda
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-xl font-medium hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>

                    {/* Copyright */}
                    <p className="text-sm text-slate-400 dark:text-slate-500 text-center mt-8">
                        ©{new Date().getFullYear()} NutriLogic. Terima kasih atas kesabaran Anda.
                    </p>
                </div>
            </div>

            {/* Large background text - MAINTENANCE */}
            <div
                className="bg-gradient-to-b from-slate-400/20 via-slate-300/10 to-transparent dark:from-slate-600/20 dark:via-slate-700/10 bg-clip-text text-transparent leading-none absolute left-1/2 -translate-x-1/2 bottom-8 font-extrabold tracking-tighter pointer-events-none select-none text-center px-4"
                style={{
                    fontSize: 'clamp(3rem, 12vw, 10rem)',
                    maxWidth: '95vw'
                }}
            >
                MAINTENANCE
            </div>
        </section>
    );
}
