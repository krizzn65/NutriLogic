import React, { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAUpdatePrompt() {
    const [needRefresh, setNeedRefresh] = useState(false);
    const [updateSW, setUpdateSW] = useState(null);
    const [swRegistered, setSwRegistered] = useState(false);

    useEffect(() => {
        // Dynamic import untuk PWA register
        const initPWA = async () => {
            try {
                const { registerSW } = await import('virtual:pwa-register');
                
                const updateServiceWorker = registerSW({
                    onNeedRefresh() {
                        setNeedRefresh(true);
                    },
                    onOfflineReady() {
                        // App siap untuk offline
                    },
                    onRegistered(r) {
                        setSwRegistered(true);
                        // Cek update setiap jam
                        if (r) {
                            setInterval(() => r.update(), 60 * 60 * 1000);
                        }
                    },
                });

                setUpdateSW(() => updateServiceWorker);
            } catch (e) {
                // PWA tidak tersedia (development mode)
            }
        };

        initPWA();
    }, []);

    const handleUpdate = () => {
        if (updateSW) {
            updateSW(true);
        }
    };

    const handleDismiss = () => {
        setNeedRefresh(false);
    };

    return (
        <AnimatePresence>
            {needRefresh && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl shadow-2xl p-4 z-[9999]"
                >
                    <button 
                        onClick={handleDismiss}
                        className="absolute top-3 right-3 p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <RefreshCw className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold">Update Tersedia</h3>
                            <p className="text-sm opacity-90 mt-1">
                                Versi baru NutriLogic sudah tersedia
                            </p>
                            <button
                                onClick={handleUpdate}
                                className="mt-3 px-4 py-2 bg-white text-emerald-600 text-sm font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
                            >
                                Update Sekarang
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
