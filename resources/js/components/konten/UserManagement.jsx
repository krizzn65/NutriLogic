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
                console.error("Users fetch error:", err);
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
            console.error("Posyandus fetch error:", err);
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
        return (
            <div className="p-4 md:p-10 w-full h-full bg-gray-50">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
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
                                            colSpan={6}
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
                        onSuccess={(password) => {
                            setShowModal(false);
                            fetchUsers(activeTab, { forceRefresh: true });
                            if (password) {
                                setNewPassword(password);
                                setShowPasswordModal(true);
                            }
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
