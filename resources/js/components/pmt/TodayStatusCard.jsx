import React, { useState, useEffect, memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import api from '../../lib/api';
import TodayStatusSkeleton from './TodayStatusSkeleton';

const TodayStatusCard = memo(function TodayStatusCard({ childId, childName, onSuccess }) {
    const [status, setStatus] = useState(null);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const statusOptions = [
        {
            value: 'consumed',
            label: 'Habis',
            icon: CheckCircle,
            color: 'bg-green-600 hover:bg-green-700 active:bg-green-800',
            textColor: 'text-green-800',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-300',
            emoji: '✓',
            hoverBorder: 'hover:border-green-400'
        },
        {
            value: 'partial',
            label: 'Sebagian',
            icon: AlertCircle,
            color: 'bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800',
            textColor: 'text-yellow-800',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-300',
            emoji: '~',
            hoverBorder: 'hover:border-yellow-400'
        },
        {
            value: 'refused',
            label: 'Tidak Mau',
            icon: XCircle,
            color: 'bg-red-600 hover:bg-red-700 active:bg-red-800',
            textColor: 'text-red-800',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-300',
            emoji: '✗',
            hoverBorder: 'hover:border-red-400'
        },
    ];

    useEffect(() => {
        if (childId) {
            fetchTodayStatus();
        }
    }, [childId]);

    const fetchTodayStatus = async () => {
        setLoading(true);
        try {
            const today = new Date();
            const response = await api.get(`/pmt-logs/child/${childId}`, {
                params: {
                    month: today.getMonth() + 1,
                    year: today.getFullYear(),
                }
            });

            const logs = response.data.data || [];
            const todayDate = today.toISOString().split('T')[0];
            const todayLog = logs.find(log => log.date === todayDate);

            if (todayLog) {
                setStatus(todayLog.status);
                setNotes(todayLog.notes || '');
            } else {
                setStatus(null);
                setNotes('');
            }
        } catch (error) {
            console.error('Error fetching today status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusClick = useCallback(async (selectedStatus) => {
        setSubmitting(true);
        setError(null);

        try {
            await api.post('/pmt-logs', {
                child_id: childId,
                date: new Date().toISOString().split('T')[0],
                status: selectedStatus,
                notes: notes || null,
            });

            setStatus(selectedStatus);
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error('Error saving PMT status:', err);
            setError(err.response?.data?.message || 'Gagal menyimpan status. Silakan coba lagi.');
        } finally {
            setSubmitting(false);
        }
    }, [childId, notes, onSuccess]);

    const handleNotesChange = useCallback(async (newNotes) => {
        setNotes(newNotes);

        // Auto-save notes if status already set
        if (status) {
            try {
                await api.post('/pmt-logs', {
                    child_id: childId,
                    date: new Date().toISOString().split('T')[0],
                    status: status,
                    notes: newNotes || null,
                });
            } catch (err) {
                console.error('Error saving notes:', err);
            }
        }
    }, [childId, status]);

    if (loading) {
        return <TodayStatusSkeleton />;
    }

    const selectedOption = statusOptions.find(opt => opt.value === status);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-2xl shadow-xl p-6 md:p-10 border-2 transition-all ${selectedOption
                ? `${selectedOption.bgColor} ${selectedOption.borderColor}`
                : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300'
                }`}
        >
            {/* Question */}
            <div className="text-center mb-6 md:mb-8 space-y-2">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                    Apakah <span className="text-blue-600">{childName}</span> sudah makan PMT hari ini?
                </h3>
                <p className="text-sm md:text-base text-gray-600 font-medium">
                    {new Date().toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </p>
            </div>

            {/* Status Buttons - Enhanced with better visual indicators and mobile optimization */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                {statusOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = status === option.value;

                    return (
                        <motion.button
                            key={option.value}
                            whileHover={{ scale: isSelected ? 1 : 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleStatusClick(option.value)}
                            disabled={submitting}
                            aria-label={`Status PMT: ${option.label}`}
                            aria-pressed={isSelected}
                            className={`relative p-5 md:p-7 rounded-2xl border-2 transition-all duration-200 min-h-[120px] md:min-h-[140px] focus:outline-none focus:ring-4 focus:ring-blue-600 focus:ring-offset-2 ${isSelected
                                ? `${option.color} text-white border-transparent shadow-xl`
                                : `bg-white text-gray-700 border-gray-200 ${option.hoverBorder} hover:shadow-lg`
                                } disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation`}
                            style={{ minWidth: '44px', minHeight: '44px' }}
                        >
                            {isSelected && (
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                    className="absolute -top-3 -right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-gray-100"
                                >
                                    <CheckCircle className={`w-5 h-5 ${option.textColor}`} />
                                </motion.div>
                            )}

                            <div className="flex flex-col items-center gap-2 md:gap-3">
                                <motion.div 
                                    className={`text-4xl md:text-5xl ${isSelected ? 'scale-110' : ''} transition-transform`}
                                    animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                                    transition={{ duration: 0.3 }}
                                >
                                    {option.emoji}
                                </motion.div>
                                <Icon className={`w-7 h-7 md:w-9 md:h-9 ${isSelected ? 'text-white' : option.textColor} transition-colors`} />
                                <span className={`font-bold text-base md:text-lg ${isSelected ? 'text-white' : 'text-gray-800'} transition-colors`}>
                                    {option.label}
                                </span>
                            </div>

                            {/* Ripple effect on hover for unselected buttons */}
                            {!isSelected && (
                                <motion.div
                                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 hover:opacity-30 transition-opacity pointer-events-none"
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Notes Section */}
            {status && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-8"
                >
                    <label 
                        htmlFor="pmt-notes"
                        className="block text-sm md:text-base font-semibold text-gray-800 mb-3"
                    >
                        Catatan <span className="text-gray-500 text-sm font-normal">(Opsional)</span>
                    </label>
                    <textarea
                        id="pmt-notes"
                        value={notes}
                        onChange={(e) => handleNotesChange(e.target.value)}
                        placeholder="Contoh: Anak makan dengan lahap, suka sekali"
                        rows={3}
                        maxLength={500}
                        aria-label="Catatan PMT (opsional)"
                        aria-describedby="pmt-notes-counter"
                        className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-600 focus:ring-offset-2 focus:border-blue-600 focus:outline-none transition-all resize-none shadow-sm"
                    />
                    <div 
                        id="pmt-notes-counter"
                        className="text-xs text-gray-500 mt-2 text-right font-medium"
                        aria-live="polite"
                    >
                        {notes.length}/500
                    </div>
                </motion.div>
            )}

            {/* Error Message */}
            {error && (
                <div 
                    role="alert"
                    aria-live="assertive"
                    className="mt-6 bg-red-50 border-2 border-red-300 text-red-800 px-5 py-4 rounded-xl text-sm md:text-base font-semibold shadow-sm"
                >
                    {error}
                </div>
            )}

            {/* Success Message */}
            {status && !error && (
                <motion.div
                    role="status"
                    aria-live="polite"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-6 ${selectedOption.bgColor} border-2 ${selectedOption.borderColor} ${selectedOption.textColor} px-5 py-4 rounded-xl text-sm md:text-base font-bold text-center`}
                >
                    ✓ Status PMT hari ini sudah tercatat
                </motion.div>
            )}
        </motion.div>
    );
});

export default TodayStatusCard;
