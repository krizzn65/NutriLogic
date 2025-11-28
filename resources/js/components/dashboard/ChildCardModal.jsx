import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import CreditCard from '../credit-card-1';
import logoScroll from '../../assets/logo_scroll.svg';
import { assets } from '../../assets/assets';

export default function ChildCardModal({ isOpen, onClose, child }) {
    if (!child) return null;

    // Helper to format date for card expiry
    const getFormattedDate = (dateString) => {
        if (!dateString) return "00/00";
        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${month}/${year}`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-transparent flex flex-col items-center"
                    >
                        <button
                            onClick={onClose}
                            className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-md"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="w-full aspect-[1.586/1] shadow-2xl rounded-xl overflow-hidden">
                            <CreditCard
                                cardNumber={child.nik ? child.nik.replace(/(\d{4})(?=\d)/g, '$1 ') : "0000 0000 0000 0000"}
                                cardHolder={child.full_name || "NAMA ANAK"}
                                expiryDate={getFormattedDate(child.birth_date)}
                                cvv={child.gender === 'L' ? '001' : child.gender === 'P' ? '002' : 'XXX'}
                                variant="gradient"
                                labelName="NAMA ANAK"
                                labelExpiry="TGL LAHIR"
                                brandLogo={logoScroll}
                                chipImage={child.gender === 'L' ? assets.kepala_bayi : child.gender === 'P' ? assets.kepala_bayi_cewe : null}
                            />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
