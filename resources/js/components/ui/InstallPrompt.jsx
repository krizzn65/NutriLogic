import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Cek apakah sudah terinstall
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            
            // Tampilkan prompt setelah 5 detik jika belum pernah dismiss
            const dismissed = localStorage.getItem('pwa-install-dismissed');
            const dismissedTime = dismissed ? parseInt(dismissed) : 0;
            const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
            
            // Tampilkan lagi setelah 3 hari
            if (!dismissed || daysSinceDismissed > 1) {
                setTimeout(() => setShowPrompt(true), 3000); // 5 detik
            }
        };

        const installedHandler = () => {
            setIsInstalled(true);
            setShowPrompt(false);
        };

        window.addEventListener('beforeinstallprompt', handler);
        window.addEventListener('appinstalled', installedHandler);
        
        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            window.removeEventListener('appinstalled', installedHandler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            setIsInstalled(true);
        }
        
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    };

    if (isInstalled || !showPrompt) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl p-5 z-[9999]"
            >
                <button 
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="w-4 h-4 text-gray-400" />
                </button>
                
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                        <Smartphone className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 pt-1">
                        <h3 className="font-bold text-gray-900 text-lg">Install NutriLogic</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Akses lebih cepat langsung dari home screen perangkat Anda
                        </p>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={handleInstall}
                                className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                            >
                                <Download className="w-4 h-4" />
                                Install
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="px-4 py-2.5 text-gray-600 text-sm font-semibold hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Nanti
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
