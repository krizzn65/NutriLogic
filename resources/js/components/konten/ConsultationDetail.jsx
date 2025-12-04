import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../lib/api";
import { ArrowLeft, Send, CheckCircle, Clock, User, MoreVertical, Phone, Video, Trash2, AlertTriangle, Paperclip, Image as ImageIcon, FileText, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDataCache } from "../../contexts/DataCacheContext";
import { formatAge } from "../../lib/utils";

export default function ConsultationDetail({ selectedId, onBack, onDeleteSuccess, className = "" }) {
  const { id: paramId } = useParams();
  const id = selectedId || paramId;
  const navigate = useNavigate();
  const { invalidateCache } = useDataCache();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [consultation, setConsultation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);
  const attachMenuRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (id) {
      fetchConsultation(id);
    }
  }, [id]);

  // Auto-refresh to keep online status current
  useEffect(() => {
    if (!id) return;

    // Poll every 30 seconds to refresh online status
    const intervalId = setInterval(() => {
      // Only refresh if document is visible (user is on the page)
      if (document.visibilityState === 'visible') {
        fetchConsultation(id, true); // Pass true to skip loading state
      }
    }, 30000); // 30 seconds

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [consultation?.messages]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target)) {
        setShowAttachMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file maksimal 5MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setShowAttachMenu(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleShareChildData = async () => {
    setShowAttachMenu(false);
    try {
      const response = await api.get(`/parent/consultations/${id}/child-data`);
      const data = response.data.data;

      const text = `Data Kesehatan Anak:
Nama: ${data.name}
Usia: ${formatAge(data.age_months)}
BB: ${data.weight ? data.weight + ' kg' : '-'}
TB: ${data.height ? data.height + ' cm' : '-'}
LK: ${data.head_circumference ? data.head_circumference + ' cm' : '-'}
Catatan: ${data.notes || '-'}`;

      setNewMessage(prev => prev ? prev + '\n\n' + text : text);
    } catch (err) {
      console.error('Failed to fetch child data:', err);
      alert('Gagal mengambil data anak.');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConsultation = async (consultationId, silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
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
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    // Allow sending if there's either a message OR a file
    if (!newMessage.trim() && !selectedFile) {
      return;
    }

    try {
      setSending(true);
      setError(null);

      const formData = new FormData();
      // If there's a message, add it. Otherwise, add a space to satisfy backend validation
      formData.append('message', newMessage.trim() || ' ');
      if (selectedFile) {
        formData.append('attachment', selectedFile);
      }

      const response = await api.post(`/parent/consultations/${id}/messages`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setConsultation(prev => ({
        ...prev,
        messages: [...prev.messages, response.data.data],
      }));

      setNewMessage("");
      removeFile();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Gagal mengirim pesan. Silakan coba lagi.';
      setError(errorMessage);
      console.error('Send message error:', err);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteClick = () => {
    setShowMenu(false);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/parent/consultations/${id}`);

      // Invalidate cache
      invalidateCache('consultations_all');
      invalidateCache('consultations_open');
      invalidateCache('consultations_closed');

      if (onDeleteSuccess) {
        onDeleteSuccess();
      } else {
        navigate('/dashboard/konsultasi');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Gagal menghapus percakapan. Silakan coba lagi.');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 w-full h-full items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Memuat percakapan...</p>
        </div>
      </div>
    );
  }

  if (error && !consultation) {
    return (
      <div className="flex flex-1 w-full h-full items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md mx-4">
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Terjadi Kesalahan</h3>
          <p className="text-slate-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/dashboard/konsultasi')}
              className="px-6 py-2.5 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors font-medium"
            >
              Kembali
            </button>
            <button
              onClick={() => fetchConsultation(id)}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!consultation) return null;

  const isParentMessage = (message) => message.sender_role === 'ibu';

  return (
    <div className={`flex flex-col h-full bg-slate-50 relative overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onBack ? onBack() : navigate('/dashboard/konsultasi')}
              className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center border border-green-200 text-green-700 font-bold text-sm">
                  {consultation.kader?.name?.substring(0, 2).toUpperCase() || 'KD'}
                </div>
                {consultation.kader?.is_online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" title="Kader Online" />
                )}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 leading-tight flex items-center gap-2">
                  {consultation.title}
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Kader: {consultation.kader?.name || 'Petugas'}
                    {consultation.kader?.is_online && (
                      <span className="text-green-600 font-medium ml-1">• Online</span>
                    )}
                  </span>
                  {consultation.status === 'open' ? (
                    <span className="flex items-center gap-1 text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      Aktif
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Selesai
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50"
                >
                  <button
                    onClick={handleDeleteClick}
                    className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Hapus Percakapan
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth">
        <div className="max-w-5xl mx-auto w-full space-y-6">
          <div className="flex justify-center">
            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              {new Date(consultation.created_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          <AnimatePresence initial={false}>
            {consultation.messages.map((message, index) => {
              const isParent = isParentMessage(message);

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${isParent ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${isParent ? 'items-end' : 'items-start'}`}>
                    {message.message && message.message.trim() && (
                      <div
                        className={`px-5 py-3 shadow-sm relative text-sm leading-relaxed ${isParent
                          ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm'
                          : 'bg-white text-slate-800 border border-slate-100 rounded-2xl rounded-tl-sm'
                          }`}
                      >
                        <p className="whitespace-pre-wrap">{message.message}</p>
                      </div>
                    )}

                    {message.attachment_path && message.attachment_type === 'image' && (
                      <div className={`${message.message && message.message.trim() ? 'mt-2' : ''} rounded-xl overflow-hidden border border-slate-200 max-w-xs ${isParent ? 'ml-auto' : 'mr-auto'}`}>
                        <img
                          src={message.attachment_path}
                          alt="Attachment"
                          className="w-full h-auto object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className={`flex items-center gap-1 mt-1.5 text-[10px] font-medium ${isParent ? 'text-blue-900/40' : 'text-slate-400'}`}>
                      {isParent && <span>Anda</span>}
                      {!isParent && <span>{message.sender_name?.split(' ')[0]}</span>}
                      <span>•</span>
                      <span>
                        {new Date(message.created_at).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 p-4 pb-6 sm:p-4 sticky bottom-0 z-10">
        <div className="max-w-5xl mx-auto w-full">
          {consultation.status === 'open' ? (
            <form onSubmit={sendMessage} className="flex items-end gap-2">
              {/* Attachment Button */}
              <div className="relative" ref={attachMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  className={`p-3 rounded-full transition-colors mb-1 ${showAttachMenu ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                  title="Lampirkan"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                <AnimatePresence>
                  {showAttachMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-20"
                    >
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <span>Kirim Gambar</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleShareChildData}
                        className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span>Data Kesehatan</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div
                className="flex-1 relative group"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file && file.type.startsWith('image/')) {
                    if (file.size > 5 * 1024 * 1024) {
                      alert("Ukuran file maksimal 5MB");
                      return;
                    }
                    setSelectedFile(file);
                    setPreviewUrl(URL.createObjectURL(file));
                  }
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-slate-100 rounded-[24px] pointer-events-none"
                  animate={{
                    backgroundColor: (newMessage.trim() || selectedFile) ? "#ffffff" : "#f1f5f9",
                    borderColor: (newMessage.trim() || selectedFile) ? "#bfdbfe" : "transparent",
                    boxShadow: (newMessage.trim() || selectedFile) ? "0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)" : "none",
                    borderWidth: "1px"
                  }}
                />

                <div className="relative flex flex-col">
                  {selectedFile && (
                    <div className="px-4 pt-4 pb-0">
                      <div className="relative inline-block">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="h-20 w-auto rounded-lg border border-slate-200 object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeFile}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-sm"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ketik pesan..."
                    rows="1"
                    className="w-full bg-transparent border-none focus:ring-0 px-5 py-3 text-slate-800 placeholder:text-slate-400 resize-none max-h-32 min-h-[48px] rounded-[24px]"
                    style={{ height: 'auto', minHeight: '48px' }}
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(e);
                      }
                    }}
                    onPaste={(e) => {
                      const items = e.clipboardData?.items;
                      if (items) {
                        for (let i = 0; i < items.length; i++) {
                          if (items[i].type.indexOf("image") !== -1) {
                            const file = items[i].getAsFile();
                            if (file) {
                              if (file.size > 5 * 1024 * 1024) {
                                alert("Ukuran file maksimal 5MB");
                                return;
                              }
                              setSelectedFile(file);
                              setPreviewUrl(URL.createObjectURL(file));
                              e.preventDefault(); // Prevent pasting the image binary string
                            }
                          }
                        }
                      }
                    }}
                    disabled={sending}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={sending || (!newMessage.trim() && !selectedFile)}
                className={`w-12 h-12 flex items-center justify-center rounded-full transition-all mb-1 ${(newMessage.trim() || selectedFile)
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:shadow-blue-300'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5 ml-0.5" />
                )}
              </motion.button>
            </form>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-slate-500 mb-1">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Sesi Selesai</span>
              </div>
              <p className="text-sm text-slate-400">Percakapan ini telah ditutup.</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => !deleting && setShowDeleteModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm relative overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus Percakapan?</h3>
                <p className="text-slate-500 text-sm mb-6">
                  Apakah Anda yakin ingin menghapus percakapan ini? Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    disabled={deleting}
                    className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-medium transition-colors disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deleting}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors shadow-lg shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Menghapus...</span>
                      </>
                    ) : (
                      <span>Hapus</span>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div >
  );
}

