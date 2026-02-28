import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../lib/api";
import { useDataCache } from "../../contexts/DataCacheContext";
import {
    Search,
    Plus,
    MessageSquare,
    CheckCircle,
    Trash2,
    AlertTriangle,
    Archive,
    ArchiveRestore,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useVirtualizer } from "@tanstack/react-virtual";
import ConsultationDetail from "./ConsultationDetail";
import ConsultationListSkeleton from "../loading/ConsultationListSkeleton";
import PageHeader from "../ui/PageHeader";
import EmptyState from "../ui/EmptyState";
import { Skeleton } from "../ui/Skeleton";
import ErrorState from "../ui/ErrorState";
import { useConsultationRealtime } from "../../lib/consultationRealtime";

const TAG_OPTIONS = [
    { key: "", label: "Tanpa Kategori" },
    { key: "gizi", label: "Gizi" },
    { key: "imunisasi", label: "Imunisasi" },
    { key: "stunting", label: "Stunting" },
    { key: "mpasi", label: "MPASI" },
    { key: "lainnya", label: "Lainnya" },
];

const TAG_STYLES = {
    gizi: "bg-emerald-50 text-emerald-700 border-emerald-100",
    imunisasi: "bg-blue-50 text-blue-700 border-blue-100",
    stunting: "bg-orange-50 text-orange-700 border-orange-100",
    mpasi: "bg-purple-50 text-purple-700 border-purple-100",
    lainnya: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function ConsultationList() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [consultations, setConsultations] = useState([]);
    const [filterStatus, setFilterStatus] = useState("all");
    const [deletingId, setDeletingId] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [archivedConsultationIds, setArchivedConsultationIds] = useState([]);
    const [consultationTags, setConsultationTags] = useState({});
    const navigate = useNavigate();
    const { getCachedData, setCachedData, invalidateCache } = useDataCache();
    const listParentRef = useRef(null);

    useEffect(() => {
        fetchConsultations(filterStatus);
    }, [filterStatus]);

    useEffect(() => {
        try {
            const archivedRaw = localStorage.getItem(
                "parent_consultation_archives",
            );
            const tagsRaw = localStorage.getItem("parent_consultation_tags");

            if (archivedRaw) {
                const parsed = JSON.parse(archivedRaw);
                if (Array.isArray(parsed)) {
                    setArchivedConsultationIds(parsed);
                }
            }
            if (tagsRaw) {
                const parsed = JSON.parse(tagsRaw);
                if (parsed && typeof parsed === "object") {
                    setConsultationTags(parsed);
                }
            }
        } catch (err) {
            console.error(
                "Failed to load consultation archive/tag state:",
                err,
            );
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(
            "parent_consultation_archives",
            JSON.stringify(archivedConsultationIds),
        );
    }, [archivedConsultationIds]);

    useEffect(() => {
        localStorage.setItem(
            "parent_consultation_tags",
            JSON.stringify(consultationTags),
        );
    }, [consultationTags]);

    const fetchConsultations = async (status = "all", silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }
            setError(null);

            const apiStatus = status === "archived" ? "all" : status;
            const cacheKey = `consultations_${apiStatus}`;
            const cachedData = getCachedData(cacheKey);
            if (cachedData && !silent) {
                setConsultations(cachedData);
                setLoading(false);
                return;
            }

            const params = apiStatus !== "all" ? { status: apiStatus } : {};
            const response = await api.get("/parent/consultations", { params });
            const data = response.data.data;
            setConsultations(data);
            setCachedData(cacheKey, data);
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                "Gagal memuat data konsultasi. Silakan coba lagi.";
            setError(errorMessage);
            console.error("Consultations fetch error:", err);
        } finally {
            if (!silent) {
                setLoading(false);
            } else {
                setRefreshing(false);
            }
        }
    };

    useConsultationRealtime({
        role: "parent",
        status: filterStatus === "archived" ? "all" : filterStatus,
        onSync: (silent) => {
            if (document.visibilityState === "visible") {
                fetchConsultations(filterStatus, silent);
            }
        },
    });

    const handleDeleteClick = (e, consultationId) => {
        e.stopPropagation();
        setDeleteModal({ show: true, id: consultationId });
    };

    const confirmDelete = async () => {
        const deleteId = deleteModal.id;
        if (!deleteId) return;

        try {
            setDeletingId(deleteId);
            setDeleteModal({ show: false, id: null }); // Close modal immediately

            await api.delete(`/parent/consultations/${deleteId}`);

            // Remove from local state immediately
            setConsultations((prev) => prev.filter((c) => c.id !== deleteId));

            // Invalidate cache
            invalidateCache("consultations_all");
            invalidateCache("consultations_open");
            invalidateCache("consultations_closed");

            // If the deleted consultation was currently selected, navigate back to list
            if (id && parseInt(id) === deleteId) {
                navigate("/dashboard/konsultasi");
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert("Gagal menghapus percakapan.");
        } finally {
            setDeletingId(null);
        }
    };

    const getTimeAgo = (date) => {
        const now = new Date();
        const past = new Date(date);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Baru saja";
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}j`;
        if (diffDays < 7) return `${diffDays}h`;
        return past.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
        });
    };

    const isArchived = (consultationId) =>
        archivedConsultationIds.includes(consultationId);

    const toggleArchive = (event, consultationId) => {
        event.stopPropagation();
        setArchivedConsultationIds((prev) =>
            prev.includes(consultationId)
                ? prev.filter((id) => id !== consultationId)
                : [...prev, consultationId],
        );
    };

    const updateTag = (event, consultationId) => {
        event.stopPropagation();
        const tag = event.target.value;
        setConsultationTags((prev) => ({
            ...prev,
            [consultationId]: tag,
        }));
    };

    const filteredConsultations = useMemo(() => {
        return consultations.filter((consultation) => {
            const keyword = searchQuery.toLowerCase();
            const matchesSearch =
                (consultation.title || "").toLowerCase().includes(keyword) ||
                (consultation.kader?.name || "")
                    .toLowerCase()
                    .includes(keyword);

            const archived = isArchived(consultation.id);
            const matchesArchive =
                filterStatus === "archived" ? archived : !archived;

            const matchesStatus =
                filterStatus === "all" ||
                filterStatus === "archived" ||
                consultation.status === filterStatus;

            return matchesSearch && matchesArchive && matchesStatus;
        });
    }, [consultations, searchQuery, filterStatus, archivedConsultationIds]);

    const consultationVirtualizer = useVirtualizer({
        count: filteredConsultations.length,
        getScrollElement: () => listParentRef.current,
        estimateSize: () => 152,
        overscan: 8,
    });

    const renderConsultationItem = (consultation) => (
        <div
            key={consultation.id}
            onClick={() => navigate(`/dashboard/konsultasi/${consultation.id}`)}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/dashboard/konsultasi/${consultation.id}`);
                }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Buka konsultasi ${consultation.title || "tanpa judul"}`}
            className={`group p-4 hover:bg-slate-50 cursor-pointer transition-colors relative border-b border-slate-100 ${
                id && parseInt(id) === consultation.id
                    ? "bg-blue-50/60 hover:bg-blue-50"
                    : ""
            }`}
        >
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold text-sm border border-blue-200">
                        {consultation.kader?.name
                            ?.substring(0, 2)
                            .toUpperCase() || "KD"}
                    </div>
                    {consultation.kader?.is_online && (
                        <div
                            className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"
                            title="Online"
                        />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="mb-1 flex items-start justify-between gap-2">
                        <h3 className="flex-1 min-w-0 text-sm font-bold text-slate-800 truncate pr-1">
                            {consultation.title || "Konsultasi Tanpa Judul"}
                        </h3>
                        <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] text-slate-400">
                                {getTimeAgo(consultation.updated_at)}
                            </span>
                            <button
                                onClick={(e) =>
                                    toggleArchive(e, consultation.id)
                                }
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200 transition-all md:opacity-0 md:scale-95 md:pointer-events-none md:group-hover:opacity-100 md:group-hover:scale-100 md:group-hover:pointer-events-auto md:group-focus-within:opacity-100 md:group-focus-within:scale-100 md:group-focus-within:pointer-events-auto"
                                title={
                                    isArchived(consultation.id)
                                        ? "Kembalikan dari arsip"
                                        : "Arsipkan"
                                }
                                aria-label={
                                    isArchived(consultation.id)
                                        ? "Kembalikan konsultasi dari arsip"
                                        : "Arsipkan konsultasi"
                                }
                            >
                                {isArchived(consultation.id) ? (
                                    <ArchiveRestore className="w-3.5 h-3.5" />
                                ) : (
                                    <Archive className="w-3.5 h-3.5" />
                                )}
                            </button>
                            <button
                                onClick={(e) =>
                                    handleDeleteClick(e, consultation.id)
                                }
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all md:opacity-0 md:scale-95 md:pointer-events-none md:group-hover:opacity-100 md:group-hover:scale-100 md:group-hover:pointer-events-auto md:group-focus-within:opacity-100 md:group-focus-within:scale-100 md:group-focus-within:pointer-events-auto"
                                title="Hapus"
                                aria-label="Hapus konsultasi"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {consultationTags[consultation.id] && (
                        <span
                            className={`inline-flex mb-2 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                TAG_STYLES[consultationTags[consultation.id]] ||
                                TAG_STYLES.lainnya
                            }`}
                        >
                            {
                                TAG_OPTIONS.find(
                                    (opt) =>
                                        opt.key ===
                                        consultationTags[consultation.id],
                                )?.label
                            }
                        </span>
                    )}

                    <div className="flex justify-between items-end">
                        <p className="text-xs text-slate-500 line-clamp-1 mr-2">
                            {consultation.last_message ? (
                                <>
                                    <span className="font-medium text-slate-700">
                                        {
                                            consultation.last_message.sender_name.split(
                                                " ",
                                            )[0]
                                        }{" "}
                                        :
                                    </span>
                                    {consultation.last_message
                                        .attachment_type === "image" ? (
                                        <span className="flex items-center gap-1 text-slate-500">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="12"
                                                height="12"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <rect
                                                    width="18"
                                                    height="18"
                                                    x="3"
                                                    y="3"
                                                    rx="2"
                                                    ry="2"
                                                />
                                                <circle cx="9" cy="9" r="2" />
                                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                            </svg>
                                            Foto
                                        </span>
                                    ) : (
                                        " " + consultation.last_message.message
                                    )}
                                </>
                            ) : (
                                <span className="italic text-slate-400">
                                    Belum ada pesan
                                </span>
                            )}
                        </p>

                        {/* Unread Badge */}
                        {consultation.unread_count > 0 ? (
                            <div
                                className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-green-500 flex-shrink-0"
                                title={`${consultation.unread_count} pesan belum dibaca`}
                            >
                                <span className="text-[10px] font-bold text-white">
                                    {consultation.unread_count}
                                </span>
                            </div>
                        ) : consultation.status === "closed" ? (
                            <CheckCircle
                                className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"
                                title="Selesai"
                            />
                        ) : null}
                    </div>

                    <div className="mt-2">
                        <select
                            value={consultationTags[consultation.id] || ""}
                            onChange={(e) => updateTag(e, consultation.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            aria-label={`Kategori konsultasi ${consultation.title || consultation.id}`}
                        >
                            {TAG_OPTIONS.map((tagOption) => (
                                <option
                                    key={tagOption.key || "none"}
                                    value={tagOption.key}
                                >
                                    {tagOption.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading && consultations.length === 0) {
        return <ConsultationListSkeleton />;
    }

    return (
        <div className="flex flex-col h-full w-full bg-white overflow-hidden">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative z-50 flex-shrink-0"
            >
                <PageHeader
                    title="Konsultasi"
                    subtitle="Tanya Ahli Gizi"
                    showProfile={true}
                />
            </motion.div>

            <div className="flex flex-1 h-full overflow-hidden">
                {/* Sidebar List */}
                <div
                    className={`flex-col h-full bg-white border-r border-slate-200 md:w-[400px] flex-shrink-0 ${id ? "hidden md:flex" : "flex w-full"}`}
                >
                    {/* Header Section */}
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-4">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-xl font-bold text-slate-800">
                                Konsultasi
                            </h1>
                            <div className="flex items-center gap-2">
                                {refreshing && (
                                    <div
                                        className="w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin"
                                        title="Memperbarui..."
                                    />
                                )}
                                <button
                                    onClick={() =>
                                        navigate("/dashboard/konsultasi/create")
                                    }
                                    className="hidden md:block p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm"
                                    title="Buat Konsultasi Baru"
                                    aria-label="Buat konsultasi baru"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari konsultasi atau kader..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                aria-label="Cari konsultasi atau kader"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex gap-1 bg-slate-200/50 p-1 rounded-lg w-full">
                            {["all", "open", "closed", "archived"].map(
                                (status) => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status)}
                                        aria-pressed={filterStatus === status}
                                        className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all duration-200 capitalize ${
                                            filterStatus === status
                                                ? "bg-white text-slate-800 shadow-sm"
                                                : "text-slate-500 hover:text-slate-700"
                                        }`}
                                    >
                                        {status === "all"
                                            ? "Semua"
                                            : status === "open"
                                              ? "Aktif"
                                              : status === "closed"
                                                ? "Selesai"
                                                : "Arsip"}
                                    </button>
                                ),
                            )}
                        </div>
                    </div>

                    {/* List Content */}
                    <div ref={listParentRef} className="flex-1 overflow-y-auto">
                        {error && (
                            <div className="p-4 border-b border-slate-200 bg-white">
                                <ErrorState
                                    title="Gagal memuat konsultasi"
                                    message={error}
                                    onRetry={() =>
                                        fetchConsultations(filterStatus)
                                    }
                                />
                            </div>
                        )}
                        {loading ? (
                            <div className="p-4 space-y-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="flex gap-3 items-center"
                                    >
                                        <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredConsultations.length === 0 ? (
                            <EmptyState
                                className="m-6 h-[calc(16rem-3rem)]"
                                icon={MessageSquare}
                                title={
                                    searchQuery
                                        ? "Tidak ada hasil pencarian"
                                        : filterStatus === "archived"
                                          ? "Belum ada konsultasi terarsip"
                                          : "Belum ada percakapan"
                                }
                                description={
                                    searchQuery
                                        ? "Coba kata kunci lain atau hapus filter pencarian."
                                        : filterStatus === "archived"
                                          ? "Konsultasi yang Anda arsipkan akan tampil di sini."
                                          : "Mulai konsultasi baru untuk berdiskusi dengan kader."
                                }
                            />
                        ) : (
                            <div
                                style={{
                                    height: `${consultationVirtualizer.getTotalSize()}px`,
                                    position: "relative",
                                }}
                            >
                                {consultationVirtualizer
                                    .getVirtualItems()
                                    .map((virtualItem) => {
                                        const consultation =
                                            filteredConsultations[
                                                virtualItem.index
                                            ];
                                        if (!consultation) return null;

                                        return (
                                            <div
                                                key={consultation.id}
                                                data-index={virtualItem.index}
                                                ref={
                                                    consultationVirtualizer.measureElement
                                                }
                                                style={{
                                                    position: "absolute",
                                                    top: 0,
                                                    left: 0,
                                                    width: "100%",
                                                    transform: `translateY(${virtualItem.start}px)`,
                                                }}
                                            >
                                                {renderConsultationItem(
                                                    consultation,
                                                )}
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </div>

                    {/* Mobile Floating Add Button */}
                    <button
                        onClick={() => navigate("/dashboard/konsultasi/create")}
                        className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all z-40 flex items-center justify-center active:scale-95"
                        title="Buat Konsultasi Baru"
                        aria-label="Buat konsultasi baru"
                    >
                        <Plus className="w-8 h-8" />
                    </button>
                </div>

                {/* Main Content (Detail or Placeholder) */}
                <div
                    className={`flex-1 flex-col h-full bg-slate-50 relative ${id ? "flex" : "hidden md:flex"}`}
                >
                    {/* Background Pattern Overlay */}
                    <div
                        className="absolute inset-0 opacity-[0.06] pointer-events-none"
                        style={{
                            backgroundImage:
                                'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                        }}
                    />

                    {id ? (
                        <ConsultationDetail
                            selectedId={id}
                            onBack={() => navigate("/dashboard/konsultasi")}
                            onDeleteSuccess={() => {
                                navigate("/dashboard/konsultasi");
                                fetchConsultations(filterStatus);
                            }}
                            onConsultationViewed={() => {
                                // Refresh list to update unread counts after viewing
                                fetchConsultations(filterStatus, true);
                            }}
                            className="h-full z-10"
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 z-10">
                            <div className="w-80 h-80 mb-6 relative">
                                <div className="absolute inset-0 bg-blue-100/50 rounded-full blur-3xl opacity-50 animate-pulse" />
                                <img
                                    src="/images/chat-placeholder.png?v=2"
                                    alt="Select Chat"
                                    className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
                                />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-800 mb-3">
                                NutriLogic Web
                            </h2>
                            <p className="text-slate-500 max-w-md text-lg leading-relaxed">
                                Kirim dan terima pesan konsultasi dengan kader
                                kesehatan secara real-time. Pilih percakapan di
                                sebelah kiri untuk memulai.
                            </p>
                            <div className="mt-8 flex items-center gap-2 text-slate-400 text-sm font-medium bg-white/50 px-4 py-2 rounded-full border border-slate-100">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span>Status Kader Real-time</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Delete Confirmation Modal (List Level) */}
                <AnimatePresence>
                    {deleteModal.show && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                                onClick={() =>
                                    setDeleteModal({ show: false, id: null })
                                }
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-white rounded-2xl shadow-xl w-full max-w-sm max-h-[90vh] overflow-y-auto relative z-50"
                            >
                                <div className="p-6 text-center">
                                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertTriangle className="w-8 h-8 text-red-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-2">
                                        Hapus Percakapan?
                                    </h3>
                                    <p className="text-slate-500 text-sm mb-6">
                                        Apakah Anda yakin ingin menghapus
                                        percakapan ini? Tindakan ini tidak dapat
                                        dibatalkan.
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() =>
                                                setDeleteModal({
                                                    show: false,
                                                    id: null,
                                                })
                                            }
                                            className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-medium transition-colors"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            onClick={confirmDelete}
                                            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors shadow-lg shadow-red-200"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
