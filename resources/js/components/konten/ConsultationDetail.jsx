import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../lib/api";

export default function ConsultationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [consultation, setConsultation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (id) {
      fetchConsultation(id);
    }
  }, [id]);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    scrollToBottom();
  }, [consultation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConsultation = async (consultationId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/parent/consultations/${consultationId}`);
      setConsultation(response.data.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Anda tidak memiliki akses untuk melihat konsultasi ini.');
      } else if (err.response?.status === 404) {
        setError('Konsultasi tidak ditemukan.');
      } else {
        const errorMessage = err.response?.data?.message || 'Gagal memuat data konsultasi. Silakan coba lagi.';
        setError(errorMessage);
      }
      console.error('Consultation fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      return;
    }

    try {
      setSending(true);
      setError(null);

      const response = await api.post(`/parent/consultations/${id}/messages`, {
        message: newMessage.trim(),
      });

      // Add new message to consultation messages
      setConsultation(prev => ({
        ...prev,
        messages: [...prev.messages, response.data.data],
      }));

      setNewMessage("");
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Anda tidak memiliki akses untuk mengirim pesan di konsultasi ini.');
      } else if (err.response?.status === 404) {
        setError('Konsultasi tidak ditemukan.');
      } else {
        const errorMessage = err.response?.data?.message || 'Gagal mengirim pesan. Silakan coba lagi.';
        setError(errorMessage);
      }
      console.error('Send message error:', err);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-1 w-full h-full overflow-auto">
        <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat data konsultasi...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !consultation) {
    return (
      <div className="flex flex-1 w-full h-full overflow-auto">
        <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-800 font-medium mb-2">Terjadi Kesalahan</p>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => navigate('/dashboard/konsultasi')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Kembali ke List
                </button>
                <button
                  onClick={() => fetchConsultation(id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return null;
  }

  const isParentMessage = (message) => {
    return message.sender_role === 'ibu';
  };

  return (
    <div className="flex flex-1 w-full h-full overflow-hidden flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 md:p-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate('/dashboard/konsultasi')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">{consultation.title}</h1>
          </div>
        </div>

        {/* Info Bar */}
        <div className="flex items-center gap-4 text-sm">
          {consultation.child && (
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{consultation.child.full_name}</span>
            </div>
          )}
          {consultation.kader && (
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Kader: {consultation.kader.name}</span>
            </div>
          )}
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
            consultation.status === 'open'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {consultation.status === 'open' ? 'Aktif' : 'Selesai'}
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 p-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Chat Messages Section */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4"
      >
        {consultation.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-600">Belum ada pesan</p>
              <p className="text-sm text-gray-500 mt-2">Mulai percakapan dengan mengirim pesan pertama</p>
            </div>
          </div>
        ) : (
          consultation.messages.map((message) => {
            const isParent = isParentMessage(message);
            
            return (
              <div
                key={message.id}
                className={`flex ${isParent ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[70%] ${isParent ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    isParent ? 'bg-blue-500' : 'bg-gray-400'
                  }`}>
                    <span className="text-white font-semibold text-sm">
                      {message.sender_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Message Bubble */}
                  <div className="flex flex-col">
                    <div className={`px-4 py-2 rounded-lg ${
                      isParent
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                    </div>
                    <div className={`mt-1 text-xs text-gray-500 ${isParent ? 'text-right' : 'text-left'}`}>
                      {formatDate(message.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      {consultation.status === 'open' && (
        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={sendMessage} className="flex gap-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Tulis pesan..."
              rows={2}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              disabled={sending}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Kirim</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {consultation.status === 'closed' && (
        <div className="bg-gray-100 border-t border-gray-200 p-4 text-center">
          <p className="text-sm text-gray-600">Konsultasi ini sudah ditutup</p>
        </div>
      )}
    </div>
  );
}

