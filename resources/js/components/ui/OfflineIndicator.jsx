import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OfflineIndicator() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <AnimatePresence>
            {!isOnline && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-amber-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 z-[9999]"
                >
                    <WifiOff className="w-5 h-5 flex-shrink-0" />
                    <div>
                        <p className="font-semibold text-sm">Tidak ada koneksi internet</p>
                        <p className="text-xs opacity-90">Beberapa fitur mungkin tidak tersedia</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
