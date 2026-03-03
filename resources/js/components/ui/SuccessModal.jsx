import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X } from "lucide-react";

const SUCCESS_AUTO_DISMISS_MS = 5000;

export default function SuccessModal({
    isOpen,
    onClose,
    title,
    message,
    duration = SUCCESS_AUTO_DISMISS_MS,
}) {
    useEffect(() => {
        if (!isOpen || duration <= 0) {
            return;
        }

        const timer = window.setTimeout(() => {
            onClose?.();
        }, duration);

        return () => window.clearTimeout(timer);
    }, [duration, isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.2 }}
                    className="fixed top-4 right-4 left-4 sm:left-auto z-[10000] pointer-events-auto sm:w-[360px] sm:max-w-[90vw]"
                    role="status"
                    aria-live="polite"
                >
                    <div className="w-full rounded-xl border border-emerald-100 bg-emerald-50 shadow-lg px-4 py-3">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 leading-5">
                                    {title || "Berhasil!"}
                                </p>
                                <p className="text-sm text-gray-700 leading-5">
                                    {message || "Operasi berhasil dilakukan"}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="rounded-md p-1 text-gray-500 hover:bg-white/70 hover:text-gray-700 transition-colors"
                                aria-label="Tutup notifikasi sukses"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
