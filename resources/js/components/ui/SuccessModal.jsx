import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X } from "lucide-react";

export default function SuccessModal({ isOpen, onClose, title, message }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                    >
                        {/* Success Icon Header */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 text-center border-b border-green-100">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                                className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4"
                            >
                                <CheckCircle className="w-12 h-12 text-white" />
                            </motion.div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                {title || "Berhasil!"}
                            </h3>
                            <p className="text-gray-600">
                                {message || "Operasi berhasil dilakukan"}
                            </p>
                        </div>

                        {/* Action Button */}
                        <div className="p-6">
                            <button
                                onClick={onClose}
                                className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-green-500/30"
                            >
                                OK
                            </button>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
