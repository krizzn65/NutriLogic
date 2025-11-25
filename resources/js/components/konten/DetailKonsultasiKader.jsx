import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";

export default function DetailKonsultasiKader() {
    const { id } = useParams();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const [consultation, setConsultation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
        fetchConsultationDetail();
    }, [id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchConsultationDetail = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.get(`/kader/consultations/${id}`);
            setConsultation(response.data.data.consultation);
            setMessages(response.data.data.messages);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Gagal memuat detail konsultasi.';
            setError(errorMessage);
            console.error('Consultation detail fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            const response = await api.post(`/kader/consultations/${id}/messages`, {
                message: newMessage
            });

            setMessages([...messages, response.data.data]);
            setNewMessage("");
        } catch (err) {
            alert('Gagal mengirim pesan. Silakan coba lagi.');
        } finally {
            setSending(false);
        }
    };

    const handleClose = async () => {
        if (!window.confirm('Apakah Anda yakin ingin menutup konsultasi ini?')) return;

        try {
            await api.put(`/kader/consultations/${id}/close`);
            navigate('/dashboard/konsultasi');
        } catch (err) {
            alert('Gagal menutup konsultasi.');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-1 w-full h-full items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat konsultasi...</p>
                </div>
            </div>
        );
    }

    if (error || !consultation) {
        return (
            <div className="flex flex-1 w-full h-full items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error || 'Konsultasi tidak ditemukan'}</p>
                    <button
                        onClick={() => navigate('/dashboard/konsultasi')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Kembali
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 w-full h-full overflow-hidden bg-gray-50">
            <div className="flex flex-col w-full h-full">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard/konsultasi')}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">{consultation.title}</h2>
                            <p className="text-sm text-gray-600">
                                {consultation.parent?.name}
                                {consultation.child && ` • Anak: ${consultation.child.full_name}`}
                            </p>
                        </div>
                    </div>
                    {consultation.status === 'open' && (
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
                        >
                            Tandai Selesai
                        </button>
                    )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => {
                        const isKader = message.sender_id !== consultation.parent_id;

                        return (
                            <div
                                key={message.id}
                                className={`flex ${isKader ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-md ${isKader ? 'order-2' : 'order-1'}`}>
                                    <div
                                        className={`rounded-lg p-3 ${isKader
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white border border-gray-200 text-gray-900'
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                                    </div>
                                    <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${isKader ? 'justify-end' : 'justify-start'}`}>
                                        <span>{message.sender?.name || 'Unknown'}</span>
                                        <span>•</span>
                                        <span>
                                            {new Date(message.created_at).toLocaleString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                {consultation.status === 'open' && (
                    <div className="bg-white border-t border-gray-200 p-4">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Ketik pesan Anda..."
                                rows="2"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                disabled={sending}
                            />
                            <button
                                type="submit"
                                disabled={sending || !newMessage.trim()}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {sending ? 'Mengirim...' : 'Kirim'}
                            </button>
                        </form>
                    </div>
                )}

                {consultation.status === 'closed' && (
                    <div className="bg-gray-100 border-t border-gray-200 p-4 text-center text-gray-600">
                        Konsultasi ini telah ditutup
                    </div>
                )}
            </div>
        </div>
    );
}
