import React, { useState } from "react";
import api from "../../../lib/api";
import { Key, ChevronDown, Check, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";

// User Add/Edit Modal
export function UserModal({ user, role, posyandus, onClose, onSuccess }) {
    const controls = useDragControls();
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        address: user?.address || "",
        rt: user?.rt || "",
        rw: user?.rw || "",
        role: user?.role || role,
        posyandu_id: user?.posyandu?.id || "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [isPosyanduDropdownOpen, setIsPosyanduDropdownOpen] = useState(false);

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
                response = await api.post("/admin/users", formData);
                onSuccess(response.data.password);
            }
        } catch (err) {
            setError(
                err.response?.data?.message || "Gagal menyimpan data user.",
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4">
            <motion.div
                drag="y"
                dragControls={controls}
                dragListener={false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.2 }}
                onDragEnd={(event, info) => {
                    if (info.offset.y > 100) {
                        onClose();
                    }
                }}
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white rounded-t-2xl md:rounded-xl w-full md:max-w-md max-h-[90vh] overflow-y-auto shadow-xl"
            >
                <div
                    className="w-full h-6 flex items-center justify-center md:hidden cursor-grab active:cursor-grabbing pt-2 pb-1"
                    onPointerDown={(e) => controls.start(e)}
                >
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                </div>
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {user ? "Edit Kader" : "Tambah Kader Baru"}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="kader-name"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Nama Lengkap <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="kader-name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="kader-email"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="kader-email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    email: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="kader-phone"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Telepon <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="kader-phone"
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    phone: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="kader-address"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Alamat
                        </label>
                        <textarea
                            id="kader-address"
                            value={formData.address}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    address: e.target.value,
                                })
                            }
                            placeholder="Masukkan alamat lengkap (opsional)"
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label
                                htmlFor="kader-rt"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                RT
                            </label>
                            <input
                                id="kader-rt"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={formData.rt}
                                onChange={(e) => {
                                    const numericValue = e.target.value.replace(
                                        /[^0-9]/g,
                                        "",
                                    );
                                    setFormData({
                                        ...formData,
                                        rt: numericValue,
                                    });
                                }}
                                placeholder="Contoh: 001"
                                maxLength={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="kader-rw"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                RW
                            </label>
                            <input
                                id="kader-rw"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={formData.rw}
                                onChange={(e) => {
                                    const numericValue = e.target.value.replace(
                                        /[^0-9]/g,
                                        "",
                                    );
                                    setFormData({
                                        ...formData,
                                        rw: numericValue,
                                    });
                                }}
                                placeholder="Contoh: 002"
                                maxLength={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="kader-posyandu-selector"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Posyandu <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <button
                                id="kader-posyandu-selector"
                                type="button"
                                onClick={() =>
                                    setIsPosyanduDropdownOpen(
                                        !isPosyanduDropdownOpen,
                                    )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            >
                                <span
                                    className={
                                        !formData.posyandu_id
                                            ? "text-gray-500"
                                            : "text-gray-900"
                                    }
                                >
                                    {formData.posyandu_id
                                        ? posyandus.find(
                                              (p) =>
                                                  p.id ===
                                                  parseInt(
                                                      formData.posyandu_id,
                                                  ),
                                          )?.name || "Posyandu Terpilih"
                                        : "Pilih Posyandu"}
                                </span>
                                <ChevronDown
                                    className={`w-5 h-5 text-gray-400 transition-transform ${isPosyanduDropdownOpen ? "rotate-180" : ""}`}
                                />
                            </button>

                            <AnimatePresence>
                                {isPosyanduDropdownOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() =>
                                                setIsPosyanduDropdownOpen(false)
                                            }
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute z-20 w-full bottom-full mb-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto"
                                        >
                                            {posyandus.map((posyandu) => (
                                                <button
                                                    type="button"
                                                    key={posyandu.id}
                                                    onClick={() => {
                                                        setFormData({
                                                            ...formData,
                                                            posyandu_id:
                                                                posyandu.id,
                                                        });
                                                        setIsPosyanduDropdownOpen(
                                                            false,
                                                        );
                                                    }}
                                                    className="w-full text-left px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between group"
                                                >
                                                    <span
                                                        className={`text-sm ${parseInt(formData.posyandu_id) === posyandu.id ? "text-blue-600 font-medium" : "text-gray-700"}`}
                                                    >
                                                        {posyandu.name}
                                                    </span>
                                                    {parseInt(
                                                        formData.posyandu_id,
                                                    ) === posyandu.id && (
                                                        <Check className="w-4 h-4 text-blue-600" />
                                                    )}
                                                </button>
                                            ))}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

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
                            {submitting ? "Menyimpan..." : "Simpan"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export function ResetPasswordFormModal({ user, onClose, onSuccess }) {
    const controls = useDragControls();
    const [formData, setFormData] = useState({
        password: "",
        password_confirmation: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.password_confirmation) {
            setError("Password dan konfirmasi password tidak cocok.");
            return;
        }

        if (formData.password.length < 8) {
            setError("Password minimal 8 karakter.");
            return;
        }

        const hasUpperCase = /[A-Z]/.test(formData.password);
        const hasLowerCase = /[a-z]/.test(formData.password);
        const hasNumber = /\d/.test(formData.password);

        if (!hasUpperCase || !hasLowerCase || !hasNumber) {
            setError(
                "Password harus mengandung minimal 1 huruf besar, 1 huruf kecil, dan 1 angka.",
            );
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            await api.post(`/admin/users/${user.id}/reset-password`, {
                password: formData.password,
            });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || "Gagal reset password.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-[60] p-0 md:p-4">
            <motion.div
                drag="y"
                dragControls={controls}
                dragListener={false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.2 }}
                onDragEnd={(event, info) => {
                    if (info.offset.y > 100) {
                        onClose();
                    }
                }}
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white rounded-t-2xl md:rounded-xl shadow-xl w-full md:max-w-md overflow-hidden"
            >
                <div
                    className="w-full h-6 flex items-center justify-center md:hidden cursor-grab active:cursor-grabbing pt-2 pb-1"
                    onPointerDown={(e) => controls.start(e)}
                >
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                </div>

                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Reset Password
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Set password baru untuk {user.name}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="reset-kader-password"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Password Baru
                        </label>
                        <div className="relative">
                            <input
                                id="reset-kader-password"
                                type={showPassword ? "text" : "password"}
                                required
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        password: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 text-gray-900"
                                placeholder="Min 8 karakter, 1 huruf besar, 1 huruf kecil, 1 angka"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                ) : (
                                    <Eye className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Password harus mengandung minimal 1 huruf besar, 1
                            huruf kecil, dan 1 angka
                        </p>
                    </div>

                    <div>
                        <label
                            htmlFor="reset-kader-password-confirmation"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Konfirmasi Password
                        </label>
                        <div className="relative">
                            <input
                                id="reset-kader-password-confirmation"
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                value={formData.password_confirmation}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        password_confirmation: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 text-gray-900"
                                placeholder="Ulangi password baru"
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                ) : (
                                    <Eye className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
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
                            {submitting ? "Menyimpan..." : "Simpan Password"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export function ConfirmationModal({
    isOpen,
    title,
    message,
    confirmLabel,
    confirmColor,
    onConfirm,
    onCancel,
}) {
    const controls = useDragControls();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-[60] p-0 md:p-4">
                    <motion.div
                        key="confirmation-modal"
                        drag="y"
                        dragControls={controls}
                        dragListener={false}
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0, bottom: 0.2 }}
                        onDragEnd={(event, info) => {
                            if (info.offset.y > 100) {
                                onCancel();
                            }
                        }}
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%" }}
                        transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 300,
                        }}
                        className="bg-white rounded-t-2xl md:rounded-xl shadow-xl w-full md:max-w-md overflow-hidden"
                    >
                        <div
                            className="w-full h-6 flex items-center justify-center md:hidden cursor-grab active:cursor-grabbing pt-2 pb-1"
                            onPointerDown={(e) => controls.start(e)}
                        >
                            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                        </div>

                        <div className="p-6 text-center pt-2 md:pt-6">
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-${confirmColor}-100 text-${confirmColor}-600`}
                            >
                                <Key className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {title}
                            </h3>
                            <p className="text-gray-600 mb-6">{message}</p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={onCancel}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex-1 md:flex-none"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className={`px-4 py-2 text-white rounded-lg transition-colors font-medium flex-1 md:flex-none bg-${confirmColor}-600 hover:bg-${confirmColor}-700`}
                                >
                                    {confirmLabel}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
