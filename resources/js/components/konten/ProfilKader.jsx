import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import PageHeader from "../dashboard/PageHeader";

export default function ProfilKader() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    });

    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await api.get('/kader/profile');
            setProfile(response.data.data);
            setFormData({
                name: response.data.data.name,
                email: response.data.data.email,
                phone: response.data.data.phone || "",
            });
        } catch (err) {
            setError('Gagal memuat profil.');
            console.error('Profile fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await api.put('/kader/profile', formData);
            setProfile(prev => ({ ...prev, ...response.data.data }));
            setSuccess('Profil berhasil diperbarui!');
            setIsEditing(false);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Gagal memperbarui profil.';
            setError(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (passwordData.new_password !== passwordData.new_password_confirmation) {
            setError('Konfirmasi password tidak sesuai.');
            return;
        }

        setChangingPassword(true);
        setError(null);
        setSuccess(null);

        try {
            await api.put('/kader/profile/password', passwordData);
            setSuccess('Password berhasil diubah!');
            setPasswordData({
                current_password: "",
                new_password: "",
                new_password_confirmation: "",
            });
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Gagal mengubah password.';
            setError(errorMessage);
        } finally {
            setChangingPassword(false);
        }
    };

    const handleCancelEdit = () => {
        setFormData({
            name: profile.name,
            email: profile.email,
            phone: profile.phone || "",
        });
        setIsEditing(false);
        setError(null);
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    if (loading) {
        return (
            <div className="flex flex-1 w-full h-full items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat profil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-1 w-full h-full overflow-auto">
            <div className="p-4 md:p-10 w-full max-w-4xl mx-auto bg-gray-50 flex flex-col gap-6">
                <PageHeader title="Profil Saya" subtitle="Portal Kader" showProfile={false} />

                {/* Success/Error Alerts */}
                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                        {success}
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Profile Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-6 mb-6">
                        <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                            {profile && getInitials(profile.name)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{profile?.name}</h2>
                            <p className="text-gray-600">{profile?.role === 'kader' ? 'Kader Posyandu' : profile?.role}</p>
                            {profile?.posyandu && (
                                <p className="text-sm text-gray-500 mt-1">📍 {profile.posyandu.name}</p>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nama Lengkap <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nomor Telepon
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Role
                                </label>
                                <input
                                    type="text"
                                    value={profile?.role === 'kader' ? 'Kader Posyandu' : profile?.role}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {isEditing ? (
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    disabled={saving}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                                >
                                    Batal
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                                Edit Profil
                            </button>
                        )}
                    </form>
                </div>

                {/* Change Password Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Ubah Password</h3>

                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password Saat Ini <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                name="current_password"
                                value={passwordData.current_password}
                                onChange={handlePasswordChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password Baru <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                name="new_password"
                                value={passwordData.new_password}
                                onChange={handlePasswordChange}
                                required
                                minLength="8"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">Minimal 8 karakter</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Konfirmasi Password Baru <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                name="new_password_confirmation"
                                value={passwordData.new_password_confirmation}
                                onChange={handlePasswordChange}
                                required
                                minLength="8"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={changingPassword}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {changingPassword ? 'Mengubah Password...' : 'Ubah Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
