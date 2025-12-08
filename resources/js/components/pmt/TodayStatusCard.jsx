import React, { useState, useEffect, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const todayDate = `${year}-${month}-${day}`;

            // Find today's log - handle both "2025-12-07" and "2025-12-07T00:00:00.000000Z" formats
            const todayLog = logs.find(log => {
                const logDate = log.date?.split('T')[0]; // Extract YYYY-MM-DD part
                return logDate === todayDate;
            });

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
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            await api.post('/pmt-logs', {
                child_id: childId,
                date: dateStr,
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
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;

                await api.post('/pmt-logs', {
                    child_id: childId,
                    date: dateStr,
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
            className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8"
        >
            {/* Question */}
            <div className="text-center mb-8 space-y-2">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                    Apakah <span className="text-blue-600">{childName}</span> sudah makan PMT?
                </h3>
                <p className="text-gray-500 font-medium">
                    {new Date().toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    })}
                </p>
            </div>

            {/* Status Buttons */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 mb-8">
                {statusOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = status === option.value;

                    return (
                        <motion.button
                            key={option.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleStatusClick(option.value)}
                            disabled={submitting}
                            className={`relative p-3 md:p-6 rounded-2xl border transition-all duration-200 flex flex-col items-center gap-1 md:gap-3 ${isSelected
                                ? `${option.bgColor} ${option.textColor} ${option.borderColor} ring-2 ring-offset-2 ring-blue-100`
                                : 'bg-white border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {isSelected && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-2 right-2 md:top-3 md:right-3"
                                >
                                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                                </motion.div>
                            )}

                            <Icon className={`w-6 h-6 md:w-8 md:h-8 ${isSelected ? option.textColor : 'text-gray-400'}`} />
                            <span className="font-semibold text-xs md:text-lg text-center leading-tight">{option.label}</span>
                        </motion.button>
                    );
                })}
            </div>

            {/* Notes Section */}
            <AnimatePresence>
                {status && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-gray-50 rounded-2xl p-4 md:p-6">
                            <label
                                htmlFor="pmt-notes"
                                className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                                Catatan Tambahan
                            </label>
                            <textarea
                                id="pmt-notes"
                                value={notes}
                                onChange={(e) => handleNotesChange(e.target.value)}
                                placeholder="Contoh: Anak sangat suka menunya..."
                                rows={2}
                                maxLength={500}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 focus:outline-none transition-all resize-none"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Message */}
            <AnimatePresence>
                {status && !error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 flex items-center justify-center gap-2 text-green-600 bg-green-50 py-3 px-4 rounded-xl text-sm font-medium"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Data berhasil disimpan
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
});

export default TodayStatusCard;
