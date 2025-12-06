import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import { useDataCache } from "../../contexts/DataCacheContext";
import { UserCog, Users, Plus, Edit2, Power, Key, Building2 } from "lucide-react";
import GenericListSkeleton from "../loading/GenericListSkeleton";

export default function UserManagement() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [users, setUsers] = useState([]);
    const [posyandus, setPosyandus] = useState([]);
    const [activeTab, setActiveTab] = useState("kader");
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState(null);

    // Data caching
    const { getCachedData, setCachedData, invalidateCache } = useDataCache();

    useEffect(() => {
        fetchPosyandus();
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [activeTab]);

    const fetchPosyandus = async () => {
        // Check cache first
        const cachedPosyandus = getCachedData('admin_posyandus');
        if (cachedPosyandus) {
            setPosyandus(cachedPosyandus);
            return;
        }

        try {
            const response = await api.get('/admin/posyandus');
            setPosyandus(response.data.data);
            setCachedData('admin_posyandus', response.data.data);
        } catch (err) {
            console.error('Posyandus fetch error:', err);
        }
    };

    const fetchUsers = async () => {
        // Check cache first based on activeTab
        const cacheKey = `admin_users_${activeTab}`;
        const cachedUsers = getCachedData(cacheKey);
        if (cachedUsers) {
            setUsers(cachedUsers);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const params = { role: activeTab };
            const response = await api.get('/admin/users', { params });
            setUsers(response.data.data);
            setCachedData(cacheKey, response.data.data);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Gagal memuat data user.';
            setError(errorMessage);
            console.error('Users fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNew = () => {
        setEditingUser(null);
        setShowModal(true);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setShowModal(true);
    };

    const handleToggleActive = async (user) => {
        const action = user.is_active ? 'nonaktifkan' : 'aktifkan';
        if (!window.confirm(`Apakah Anda yakin ingin ${action} user ${user.name}?`)) {
            return;
        }

        try {
            await api.patch(`/admin/users/${user.id}/toggle-active`);
            invalidateCache(`admin_users_${activeTab}`);
            invalidateCache('admin_dashboard');
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal mengubah status user.');
        }
    };

    const handleResetPassword = async (user) => {
        if (!window.confirm(`Apakah Anda yakin ingin reset password untuk ${user.name}?`)) {
            return;
        }

        try {
            const response = await api.post(`/admin/users/${user.id}/reset-password`);
            setNewPassword(response.data.password);
            setShowPasswordModal(true);
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal reset password.');
        }
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
        <div className="flex flex-1 w-full h-full overflow-auto">
            <div className="p-4 md:p-10 w-full h-full bg-gray-50 flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Manajemen Pengguna</h1>
                        <p className="text-gray-600 mt-2">Kelola data kader dan orang tua</p>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Tambah {activeTab === 'kader' ? 'Kader' : 'Orang Tua'}
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('kader')}
                        className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${activeTab === 'kader'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        <UserCog className="w-4 h-4" />
                        Kader
                    </button>
                    <button
                        onClick={() => setActiveTab('ibu')}
                        className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${activeTab === 'ibu'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        <Users className="w-4 h-4" />
                        Orang Tua
                    </button>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">{error}</p>
                        <button
                            onClick={fetchUsers}
                            className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                            Coba Lagi
                        </button>
                    </div>
                )}

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Nama</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Telepon</th>
                                    {activeTab === 'kader' && (
                                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Posyandu</th>
                                    )}
                                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={activeTab === 'kader' ? 6 : 5} className="py-8 text-center text-gray-500">
                                            Tidak ada data user
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <span className="font-medium text-gray-800">{user.name}</span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                                            <td className="py-3 px-4 text-sm text-gray-600">{user.phone}</td>
                                            {activeTab === 'kader' && (
                                                <td className="py-3 px-4">
                                                    {user.posyandu ? (
                                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                                            <Building2 className="w-4 h-4 text-gray-500" />
                                                            {user.posyandu.name}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">-</span>
                                                    )}
                                                </td>
                                            )}
                                            <td className="py-3 px-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {user.is_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleResetPassword(user)}
                                                        className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                                                        title="Reset Password"
                                                    >
                                                        <Key className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleActive(user)}
                                                        className={`p-1.5 rounded transition-colors ${user.is_active
                                                            ? 'text-red-600 hover:bg-red-50'
                                                            : 'text-green-600 hover:bg-green-50'
                                                            }`}
                                                        title={user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                                    >
                                                        <Power className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <UserModal
                    user={editingUser}
                    role={activeTab}
                    posyandus={posyandus}
                    onClose={() => setShowModal(false)}
                    onSuccess={(password) => {
                        setShowModal(false);
                        fetchUsers();
                        if (password) {
                            setNewPassword(password);
                            setShowPasswordModal(true);
                        }
                    }}
                />
            )}

            {/* Password Display Modal */}
            {showPasswordModal && (
                <PasswordModal
                    password={newPassword}
                    onClose={() => {
                        setShowPasswordModal(false);
                        setNewPassword(null);
                    }}
                />
            )}
        </div>
    );
}

// User Add/Edit Modal
function UserModal({ user, role, posyandus, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        role: user?.role || role,
        posyandu_id: user?.posyandu?.id || '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            let response;
            if (user) {
                response = await api.put(`/admin/users/${user.id}`, formData);
                onSuccess(null);
            } else {
                response = await api.post('/admin/users', formData);
                onSuccess(response.data.password);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menyimpan data user.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {user ? 'Edit User' : `Tambah ${role === 'kader' ? 'Kader' : 'Orang Tua'} Baru`}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Lengkap <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Telepon <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {formData.role === 'kader' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Posyandu <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                value={formData.posyandu_id}
                                onChange={(e) => setFormData({ ...formData, posyandu_id: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Pilih Posyandu</option>
                                {posyandus.map((posyandu) => (
                                    <option key={posyandu.id} value={posyandu.id}>
                                        {posyandu.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={submitting}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            disabled={submitting}
                        >
                            {submitting ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Password Display Modal
function PasswordModal({ password, onClose }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Password Baru</h2>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800 mb-2">
                            <strong>Penting:</strong> Simpan password ini dengan aman. Password tidak akan ditampilkan lagi.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password:
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={password}
                                readOnly
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-lg"
                            />
                            <button
                                onClick={handleCopy}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                {copied ? 'Tersalin!' : 'Salin'}
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
