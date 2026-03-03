import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import api from "../../lib/api";
import { useDataCache } from "../../contexts/DataCacheContext";
import {
    UserCog,
    Users,
    Plus,
    Edit2,
    Power,
    Key,
    Building2,
    ChevronDown,
    Check,
    Search,
    X,
    Clock3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GenericListSkeleton from "../loading/GenericListSkeleton";
import PageHeader from "../ui/PageHeader";
import SuccessModal from "../ui/SuccessModal";
import EmptyState from "../ui/EmptyState";
import ErrorState from "../ui/ErrorState";
import {
    UserModal,
    ResetPasswordFormModal,
    ConfirmationModal,
} from "./user-management/UserManagementModals";
import logger from "../../lib/logger";

export default function UserManagement() {
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [users, setUsers] = useState([]);
    const [posyandus, setPosyandus] = useState([]);

    // Get current logged-in user for self-edit protection
    const [currentUser] = useState(() => {
        const userData = localStorage.getItem("nutrilogic_user");
        return userData ? JSON.parse(userData) : null;
    });

    // Determine initial tab based on current route
    const getInitialTab = () => {
        return "kader";
    };

    const [activeTab, setActiveTab] = useState(getInitialTab());
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [resetPasswordModal, setResetPasswordModal] = useState({
        isOpen: false,
        user: null,
    });
    const [successModal, setSuccessModal] = useState({
        isOpen: false,
        title: "",
        message: "",
    });
    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        confirmLabel: "",
        confirmColor: "blue",
        onConfirm: () => {},
    });

    // Filter state
    const [searchTerm, setSearchTerm] = useState("");
    const [filterPosyandu, setFilterPosyandu] = useState("");
    const [isPosyanduFilterOpen, setIsPosyanduFilterOpen] = useState(false);
    const [selectedUserIds, setSelectedUserIds] = useState([]);

    // Filtered users based on search and posyandu
    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            // Search filter
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                !searchTerm ||
                user.name?.toLowerCase().includes(searchLower) ||
                user.email?.toLowerCase().includes(searchLower) ||
                user.phone?.includes(searchTerm);

            // Posyandu filter
            const matchesPosyandu =
                !filterPosyandu ||
                user.posyandu?.id === parseInt(filterPosyandu);

            return matchesSearch && matchesPosyandu;
        });
    }, [users, searchTerm, filterPosyandu]);

    const activityTimeline = useMemo(() => {
        const events = [];

        users.forEach((user) => {
            if (user?.created_at) {
                events.push({
                    id: `create-${user.id}`,
                    date: user.created_at,
                    label: `${user.name} ditambahkan sebagai kader`,
                    tone: "blue",
                });
            }

            if (
                user?.updated_at &&
                user.updated_at !== user.created_at &&
                user?.is_active !== undefined
            ) {
                events.push({
                    id: `status-${user.id}`,
                    date: user.updated_at,
                    label: `${user.name} saat ini ${user.is_active ? "aktif" : "nonaktif"}`,
                    tone: user.is_active ? "green" : "red",
                });
            }
        });

        return events
            .filter((event) => event.date)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 6);
    }, [users]);

    const isAllFilteredSelected =
        filteredUsers.length > 0 &&
        filteredUsers.every((user) => selectedUserIds.includes(user.id));

    const toggleSelectUser = (userId) => {
        setSelectedUserIds((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId],
        );
    };

    const toggleSelectAllFiltered = () => {
        if (isAllFilteredSelected) {
            setSelectedUserIds((prev) =>
                prev.filter(
                    (id) => !filteredUsers.some((user) => user.id === id),
                ),
            );
            return;
        }

        setSelectedUserIds((prev) => [
            ...new Set([...prev, ...filteredUsers.map((user) => user.id)]),
        ]);
    };

    // Data caching
    const { getCachedData, setCachedData, invalidateCache } = useDataCache();
    const activeUsersRequestId = React.useRef(0);

    const fetchUsers = useCallback(
        async (
            targetTab,
            { forceRefresh = false, showLoader = false } = {},
        ) => {
            const cacheKey = `admin_users_${targetTab}`;

            if (!forceRefresh) {
                const cachedUsers = getCachedData(cacheKey);
                if (cachedUsers) {
                    setUsers(cachedUsers);
                    setLoading(false);
                    return;
                }
            }

            if (showLoader) {
                setLoading(true);
            }

            setError(null);
            const params = { role: targetTab };
            const requestId = ++activeUsersRequestId.current;

            try {
                const response = await api.get("/admin/users", { params });

                if (activeUsersRequestId.current !== requestId) {
                    return;
                }

                setUsers(response.data.data);
                setCachedData(cacheKey, response.data.data);
            } catch (err) {
                if (activeUsersRequestId.current !== requestId) {
                    return;
                }

                const errorMessage =
                    err.response?.data?.message || "Gagal memuat data user.";
                setError(errorMessage);
                logger.error("Users fetch error:", err);
            } finally {
                if (activeUsersRequestId.current === requestId) {
                    setLoading(false);
                }
            }
        },
        [getCachedData, setCachedData],
    );

    useEffect(() => {
        fetchPosyandus();
    }, []);

    // No longer need to update activeTab based on route for orang-tua
    // Kader is the only tab now

    useEffect(() => {
        const cacheKey = `admin_users_${activeTab}`;
        const cachedUsers = getCachedData(cacheKey);

        if (cachedUsers) {
            setUsers(cachedUsers);
            setLoading(false);
        } else {
            setLoading(true);
        }

        fetchUsers(activeTab, {
            forceRefresh: true,
            showLoader: !cachedUsers,
        });
    }, [activeTab, fetchUsers, getCachedData]);

    useEffect(() => {
        setSelectedUserIds((prev) =>
            prev.filter((id) => filteredUsers.some((user) => user.id === id)),
        );
    }, [filteredUsers]);

    const fetchPosyandus = async (forceRefresh = false) => {
        // Check cache first (skip if forceRefresh)
        if (!forceRefresh) {
            const cachedPosyandus = getCachedData("admin_posyandus");
            if (cachedPosyandus) {
                setPosyandus(cachedPosyandus);
                return;
            }
        }

        try {
            const response = await api.get("/admin/posyandus");
            setPosyandus(response.data.data);
            setCachedData("admin_posyandus", response.data.data);
        } catch (err) {
            logger.error("Posyandus fetch error:", err);
        }
    };

    const handleTabChange = (tab) => {
        if (tab === activeTab) return;

        const cacheKey = `admin_users_${tab}`;
        const cachedUsers = getCachedData(cacheKey);

        if (cachedUsers) {
            setUsers(cachedUsers);
            setLoading(false);
        } else {
            setLoading(true);
        }

        setActiveTab(tab);
    };

    const handleAddNew = () => {
        setEditingUser(null);
        setShowModal(true);
    };

    const handleEdit = (user) => {
        // Prevent admin from editing own account
        if (currentUser && user.id === currentUser.id) {
            alert("Anda tidak dapat mengedit akun Anda sendiri.");
            return;
        }

        setEditingUser(user);
        setShowModal(true);
    };

    const handleToggleActive = (user) => {
        // Prevent admin from disabling own account
        if (currentUser && user.id === currentUser.id) {
            alert("Anda tidak dapat menonaktifkan akun Anda sendiri.");
            return;
        }

        const action = user.is_active ? "nonaktifkan" : "aktifkan";

        setConfirmationModal({
            isOpen: true,
            title: `Konfirmasi ${action === "nonaktifkan" ? "Nonaktifkan" : "Aktifkan"}`,
            message: `Apakah Anda yakin ingin ${action} pengguna ${user.name}?`,
            confirmLabel: `Ya, ${action === "nonaktifkan" ? "Nonaktifkan" : "Aktifkan"}`,
            confirmColor: user.is_active ? "red" : "green",
            onConfirm: async () => {
                // Optimistic update
                const previousUsers = [...users];
                setUsers((prev) =>
                    prev.map((u) =>
                        u.id === user.id
                            ? { ...u, is_active: !u.is_active }
                            : u,
                    ),
                );

                // Close modal
                setConfirmationModal((prev) => ({ ...prev, isOpen: false }));

                try {
                    await api.patch(`/admin/users/${user.id}/toggle-active`);
                    invalidateCache(`admin_users_${activeTab}`);
                    invalidateCache("admin_dashboard");
                    fetchUsers(activeTab, { forceRefresh: true });
                } catch (err) {
                    setUsers(previousUsers);
                    alert(
                        err.response?.data?.message ||
                            "Gagal mengubah status user.",
                    );
                }
            },
        });
    };

    const handleBulkToggleActive = (targetActive) => {
        const usersToUpdate = filteredUsers.filter((user) => {
            if (!selectedUserIds.includes(user.id)) return false;
            if (currentUser && user.id === currentUser.id) return false;
            return user.is_active !== targetActive;
        });

        if (usersToUpdate.length === 0) {
            alert("Tidak ada user valid untuk aksi massal ini.");
            return;
        }

        const actionLabel = targetActive ? "aktifkan" : "nonaktifkan";
        const idsToUpdate = usersToUpdate.map((user) => user.id);

        setConfirmationModal({
            isOpen: true,
            title: `Konfirmasi ${targetActive ? "Aktifkan" : "Nonaktifkan"} Massal`,
            message: `Anda akan ${actionLabel} ${idsToUpdate.length} pengguna terpilih. Lanjutkan?`,
            confirmLabel: `Ya, ${targetActive ? "Aktifkan" : "Nonaktifkan"} Semua`,
            confirmColor: targetActive ? "green" : "red",
            onConfirm: async () => {
                const previousUsers = [...users];

                setUsers((prev) =>
                    prev.map((user) =>
                        idsToUpdate.includes(user.id)
                            ? { ...user, is_active: targetActive }
                            : user,
                    ),
                );
                setConfirmationModal((prev) => ({ ...prev, isOpen: false }));

                try {
                    await Promise.all(
                        idsToUpdate.map((userId) =>
                            api.patch(`/admin/users/${userId}/toggle-active`),
                        ),
                    );
                    setSelectedUserIds([]);
                    invalidateCache(`admin_users_${activeTab}`);
                    invalidateCache("admin_dashboard");
                    fetchUsers(activeTab, { forceRefresh: true });
                    setSuccessModal({
                        isOpen: true,
                        title: "Aksi Massal Berhasil",
                        message: `${idsToUpdate.length} pengguna berhasil diperbarui.`,
                    });
                } catch (err) {
                    setUsers(previousUsers);
                    alert(
                        err.response?.data?.message ||
                            "Gagal menjalankan aksi massal.",
                    );
                }
            },
        });
    };

    const formatTimelineDate = (isoDate) => {
        try {
            return new Date(isoDate).toLocaleString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "-";
        }
    };

    const handleResetPassword = (user) => {
        // Prevent admin from resetting own password through this endpoint
        if (currentUser && user.id === currentUser.id) {
            alert(
                "Gunakan fitur ubah password di profil untuk mengubah password Anda sendiri.",
            );
            return;
        }

        setResetPasswordModal({
            isOpen: true,
            user: user,
        });
    };

    if (loading) {
        return <GenericListSkeleton itemCount={8} />;
    }

    return (
        <div className="flex flex-col flex-1 w-full h-full bg-gray-50/50 overflow-hidden font-montserrat">
            <PageHeader
                title="Manajemen Kader"
                subtitle="Kelola data kader posyandu"
            />

            <div className="flex-1 overflow-auto p-6 space-y-6">
                {/* Tabs with Add Button */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between border-b border-gray-200"
                >
                    <div className="flex gap-2">
                        <button className="px-4 py-2 font-medium transition-colors flex items-center gap-2 text-blue-600 border-b-2 border-blue-600">
                            <UserCog className="w-4 h-4" />
                            Kader
                        </button>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="hidden md:flex px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:scale-95 transition-all items-center gap-2 shadow-sm mb-0.5"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Kader
                    </button>
                </motion.div>

                {/* Error State */}
                {error && (
                    <ErrorState
                        message={error}
                        onRetry={() =>
                            fetchUsers(activeTab, {
                                forceRefresh: true,
                                showLoader: true,
                            })
                        }
                    />
                )}

                {/* Search and Filter */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="flex flex-col md:flex-row gap-3"
                >
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nama, email, atau telepon..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            aria-label="Cari kader berdasarkan nama, email, atau telepon"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                aria-label="Hapus pencarian"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Posyandu Filter */}
                    <div className="relative w-full md:w-64">
                        <button
                            type="button"
                            onClick={() =>
                                setIsPosyanduFilterOpen(!isPosyanduFilterOpen)
                            }
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-left flex items-center justify-between focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            aria-label="Buka filter posyandu"
                            aria-haspopup="listbox"
                            aria-expanded={isPosyanduFilterOpen}
                            aria-controls="user-management-posyandu-filter"
                        >
                            <span className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-gray-400" />
                                <span
                                    className={
                                        !filterPosyandu
                                            ? "text-gray-400"
                                            : "text-gray-900"
                                    }
                                >
                                    {filterPosyandu
                                        ? posyandus.find(
                                              (p) =>
                                                  p.id ===
                                                  parseInt(filterPosyandu),
                                          )?.name || "Posyandu"
                                        : "Semua Posyandu"}
                                </span>
                            </span>
                            <ChevronDown
                                className={`w-4 h-4 text-gray-400 transition-transform ${isPosyanduFilterOpen ? "rotate-180" : ""}`}
                            />
                        </button>

                        <AnimatePresence>
                            {isPosyanduFilterOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() =>
                                            setIsPosyanduFilterOpen(false)
                                        }
                                    />
                                    <motion.div
                                        id="user-management-posyandu-filter"
                                        role="listbox"
                                        aria-label="Daftar posyandu"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFilterPosyandu("");
                                                setIsPosyanduFilterOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between"
                                            aria-label="Tampilkan semua posyandu"
                                        >
                                            <span
                                                className={`text-sm ${!filterPosyandu ? "text-blue-600 font-medium" : "text-gray-700"}`}
                                            >
                                                Semua Posyandu
                                            </span>
                                            {!filterPosyandu && (
                                                <Check className="w-4 h-4 text-blue-600" />
                                            )}
                                        </button>
                                        {posyandus.map((posyandu) => (
                                            <button
                                                type="button"
                                                key={posyandu.id}
                                                onClick={() => {
                                                    setFilterPosyandu(
                                                        posyandu.id.toString(),
                                                    );
                                                    setIsPosyanduFilterOpen(
                                                        false,
                                                    );
                                                }}
                                                className="w-full text-left px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between"
                                                aria-label={`Filter posyandu ${posyandu.name}`}
                                            >
                                                <span
                                                    className={`text-sm ${parseInt(filterPosyandu) === posyandu.id ? "text-blue-600 font-medium" : "text-gray-700"}`}
                                                >
                                                    {posyandu.name}
                                                </span>
                                                {parseInt(filterPosyandu) ===
                                                    posyandu.id && (
                                                    <Check className="w-4 h-4 text-blue-600" />
                                                )}
                                            </button>
                                        ))}
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Activity Timeline */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                    className="bg-white rounded-lg border border-gray-200 p-4"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Clock3 className="w-4 h-4 text-blue-600" />
                        <h3 className="text-sm font-semibold text-gray-800">
                            Aktivitas Terbaru
                        </h3>
                    </div>
                    {activityTimeline.length === 0 ? (
                        <p className="text-sm text-gray-500">
                            Belum ada aktivitas terbaru untuk ditampilkan.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {activityTimeline.map((event) => (
                                <div
                                    key={event.id}
                                    className="flex items-start gap-2 text-sm"
                                >
                                    <span
                                        className={`mt-1.5 h-2 w-2 rounded-full ${
                                            event.tone === "green"
                                                ? "bg-green-500"
                                                : event.tone === "red"
                                                  ? "bg-red-500"
                                                  : "bg-blue-500"
                                        }`}
                                    />
                                    <div>
                                        <p className="text-gray-800">
                                            {event.label}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatTimelineDate(event.date)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Bulk Actions */}
                {selectedUserIds.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-wrap items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3"
                    >
                        <p className="text-sm font-medium text-blue-900">
                            {selectedUserIds.length} user dipilih
                        </p>
                        <button
                            onClick={() => handleBulkToggleActive(true)}
                            className="px-3 py-1.5 text-xs font-medium rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                        >
                            Aktifkan Massal
                        </button>
                        <button
                            onClick={() => handleBulkToggleActive(false)}
                            className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                        >
                            Nonaktifkan Massal
                        </button>
                        <button
                            onClick={() => setSelectedUserIds([])}
                            className="px-3 py-1.5 text-xs font-medium rounded-md bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                            Batal Pilihan
                        </button>
                    </motion.div>
                )}

                {/* Mobile View (Cards) */}
                <div className="md:hidden flex flex-col gap-4">
                    {filteredUsers.length === 0 ? (
                        <EmptyState
                            className="bg-white"
                            icon={Users}
                            title={
                                searchTerm || filterPosyandu
                                    ? "Tidak ada hasil"
                                    : "Tidak ada data kader"
                            }
                            description={
                                searchTerm || filterPosyandu
                                    ? "Coba ubah filter pencarian Anda."
                                    : "Belum ada data yang tersedia."
                            }
                            action={
                                searchTerm || filterPosyandu ? (
                                    <button
                                        onClick={() => {
                                            setSearchTerm("");
                                            setFilterPosyandu("");
                                        }}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        Reset Filter
                                    </button>
                                ) : null
                            }
                        />
                    ) : (
                        filteredUsers.map((user, index) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    delay: index * 0.05,
                                    duration: 0.3,
                                }}
                                className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-4"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <label className="inline-flex items-center gap-2 text-xs text-gray-500 mb-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedUserIds.includes(
                                                    user.id,
                                                )}
                                                onChange={() =>
                                                    toggleSelectUser(user.id)
                                                }
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            Pilih user
                                        </label>
                                        <h3 className="font-bold text-gray-900">
                                            {user.name}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {user.email}
                                        </p>
                                    </div>
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            user.is_active
                                                ? "bg-green-100 text-green-800"
                                                : "bg-gray-100 text-gray-800"
                                        }`}
                                    >
                                        {user.is_active ? "Aktif" : "Nonaktif"}
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <span className="w-20 text-gray-400">
                                            Telepon
                                        </span>
                                        <span className="font-medium text-gray-900">
                                            {user.phone}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-20 text-gray-400">
                                            Posyandu
                                        </span>
                                        <span className="font-medium text-gray-900 flex items-center gap-1">
                                            {user.posyandu ? (
                                                <>
                                                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                                                    {user.posyandu.name}
                                                </>
                                            ) : (
                                                "-"
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                                    <button
                                        onClick={() =>
                                            handleResetPassword(user)
                                        }
                                        className="p-2 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors flex items-center gap-2 text-xs font-medium"
                                    >
                                        <Key className="w-4 h-4" />
                                        Reset Pass
                                    </button>
                                    <button
                                        onClick={() => handleEdit(user)}
                                        className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-2 text-xs font-medium"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleToggleActive(user)}
                                        className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-medium ${
                                            user.is_active
                                                ? "text-red-600 bg-red-50 hover:bg-red-100"
                                                : "text-green-600 bg-green-50 hover:bg-green-100"
                                        }`}
                                    >
                                        <Power className="w-4 h-4" />
                                        {user.is_active
                                            ? "Nonaktifkan"
                                            : "Aktifkan"}
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Desktop View (Table) */}
                <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 w-10">
                                        <input
                                            type="checkbox"
                                            checked={isAllFilteredSelected}
                                            onChange={toggleSelectAllFiltered}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            aria-label="Pilih semua user yang terlihat"
                                        />
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                                        Nama
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                                        Email
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                                        Telepon
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                                        Posyandu
                                    </th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">
                                        Status
                                    </th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="py-8 text-center"
                                        >
                                            <div className="text-gray-500">
                                                {searchTerm || filterPosyandu
                                                    ? "Tidak ada hasil untuk filter ini"
                                                    : "Tidak ada data kader"}
                                            </div>
                                            {(searchTerm || filterPosyandu) && (
                                                <button
                                                    onClick={() => {
                                                        setSearchTerm("");
                                                        setFilterPosyandu("");
                                                    }}
                                                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    Reset Filter
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user, index) => (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                delay: index * 0.05,
                                                duration: 0.3,
                                            }}
                                            className="border-b border-gray-100 hover:bg-gray-50"
                                        >
                                            <td className="py-3 px-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUserIds.includes(
                                                        user.id,
                                                    )}
                                                    onChange={() =>
                                                        toggleSelectUser(
                                                            user.id,
                                                        )
                                                    }
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    aria-label={`Pilih user ${user.name}`}
                                                />
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="font-medium text-gray-800">
                                                    {user.name}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {user.email}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {user.phone}
                                            </td>
                                            <td className="py-3 px-4">
                                                {user.posyandu ? (
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        <Building2 className="w-4 h-4 text-gray-500" />
                                                        {user.posyandu.name}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">
                                                        -
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        user.is_active
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-gray-100 text-gray-800"
                                                    }`}
                                                >
                                                    {user.is_active
                                                        ? "Aktif"
                                                        : "Nonaktif"}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() =>
                                                            handleEdit(user)
                                                        }
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleResetPassword(
                                                                user,
                                                            )
                                                        }
                                                        className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                                                        title="Reset Password"
                                                    >
                                                        <Key className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleToggleActive(
                                                                user,
                                                            )
                                                        }
                                                        className={`p-1.5 rounded transition-colors ${
                                                            user.is_active
                                                                ? "text-red-600 hover:bg-red-50"
                                                                : "text-green-600 hover:bg-green-50"
                                                        }`}
                                                        title={
                                                            user.is_active
                                                                ? "Nonaktifkan"
                                                                : "Aktifkan"
                                                        }
                                                    >
                                                        <Power className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Mobile FAB */}
            <button
                onClick={handleAddNew}
                className="md:hidden fixed bottom-24 right-4 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 active:scale-90 transition-all z-40"
            >
                <Plus className="w-6 h-6" />
            </button>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <UserModal
                        user={editingUser}
                        role={activeTab}
                        posyandus={posyandus}
                        onClose={() => setShowModal(false)}
                        onSuccess={() => {
                            setShowModal(false);
                            fetchUsers(activeTab, { forceRefresh: true });
                            setSuccessModal({
                                isOpen: true,
                                title: editingUser
                                    ? "Data Kader Diperbarui"
                                    : "Kader Berhasil Ditambahkan",
                                message:
                                    "Perubahan data kader berhasil disimpan. Password tidak ditampilkan di aplikasi.",
                            });
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Reset Password Form Modal */}
            <AnimatePresence>
                {resetPasswordModal.isOpen && (
                    <ResetPasswordFormModal
                        user={resetPasswordModal.user}
                        onClose={() =>
                            setResetPasswordModal({ isOpen: false, user: null })
                        }
                        onSuccess={() => {
                            setResetPasswordModal({
                                isOpen: false,
                                user: null,
                            });
                            setSuccessModal({
                                isOpen: true,
                                title: "Password Berhasil Direset",
                                message:
                                    "Password user telah berhasil diperbarui.",
                            });
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Success Modal */}
            <SuccessModal
                isOpen={successModal.isOpen}
                onClose={() =>
                    setSuccessModal({ isOpen: false, title: "", message: "" })
                }
                title={successModal.title}
                message={successModal.message}
            />

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmationModal.isOpen}
                title={confirmationModal.title}
                message={confirmationModal.message}
                confirmLabel={confirmationModal.confirmLabel}
                confirmColor={confirmationModal.confirmColor}
                onConfirm={confirmationModal.onConfirm}
                onCancel={() =>
                    setConfirmationModal((prev) => ({ ...prev, isOpen: false }))
                }
            />
        </div>
    );
}
