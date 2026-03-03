"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    motion,
    AnimatePresence,
    useMotionValue,
    useTransform,
} from "framer-motion";
import { Icon } from "@iconify/react";
import { login, fetchMe } from "../../lib/auth";
import api from "../../lib/api";
import logger from "../../lib/logger";

// ---- Extracted OUTSIDE the main component so they have stable references ----

function GlassInput({ icon, error, children, className = "" }) {
    const [focused, setFocused] = useState(false);
    return (
        <motion.div
            className={`relative ${focused ? "z-10" : ""} ${className}`}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
            <div
                className={`relative flex items-center overflow-hidden rounded-xl border transition-all duration-300 ${
                    error
                        ? "border-red-500/40 bg-red-500/10"
                        : focused
                          ? "border-[#00BFEF]/60 bg-white/60 shadow-[0_0_15px_rgba(0,191,239,0.15)]"
                          : "border-white/40 bg-white/40 hover:border-white/60"
                }`}
            >
                <div
                    className={`absolute left-3.5 transition-all duration-300 ${
                        focused
                            ? "text-[#00BFEF]"
                            : error
                              ? "text-red-400"
                              : "text-gray-400"
                    }`}
                >
                    <Icon icon={icon} className="w-[18px] h-[18px]" />
                </div>
                {React.Children.map(children, (child) => {
                    if (!child) return null;
                    if (child.type === "input" || child.type === "textarea") {
                        return React.cloneElement(child, {
                            onFocus: (e) => {
                                setFocused(true);
                                child.props.onFocus?.(e);
                            },
                            onBlur: (e) => {
                                setFocused(false);
                                child.props.onBlur?.(e);
                            },
                            className: `w-full bg-transparent text-gray-800 placeholder:text-gray-400 outline-none transition-all duration-300 ${
                                child.type === "textarea"
                                    ? "pl-11 pr-3 py-3 text-sm resize-none min-h-[80px] font-[inherit]"
                                    : "pl-11 pr-3 h-11 text-sm"
                            } ${child.props.className || ""}`,
                        });
                    }
                    return child;
                })}
                {focused && (
                    <motion.div
                        className="absolute inset-0 bg-[#00BFEF]/[0.03] -z-10 rounded-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />
                )}
            </div>
        </motion.div>
    );
}

function ErrorAlert({ message }) {
    return (
        <AnimatePresence mode="wait">
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="w-full overflow-hidden mb-3"
                >
                    <div className="px-3.5 py-2.5 bg-red-500/10 border border-red-300/40 rounded-xl text-red-500 text-xs font-medium flex items-center gap-2.5 backdrop-blur-sm">
                        <Icon
                            icon="solar:danger-circle-bold-duotone"
                            className="text-base flex-shrink-0"
                        />
                        <span>{message}</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function LightBeamBorder() {
    return (
        <div className="absolute -inset-[1px] rounded-2xl overflow-hidden pointer-events-none">
            <motion.div
                className="absolute top-0 left-0 h-[2px] w-[40%] bg-gradient-to-r from-transparent via-[#00BFEF] to-transparent opacity-40"
                animate={{ left: ["-40%", "100%"] }}
                transition={{
                    duration: 3,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatDelay: 1,
                }}
            />
            <motion.div
                className="absolute top-0 right-0 h-[40%] w-[2px] bg-gradient-to-b from-transparent via-[#00BFEF] to-transparent opacity-40"
                animate={{ top: ["-40%", "100%"] }}
                transition={{
                    duration: 3,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatDelay: 1,
                    delay: 0.75,
                }}
            />
            <motion.div
                className="absolute bottom-0 right-0 h-[2px] w-[40%] bg-gradient-to-r from-transparent via-[#00BFEF] to-transparent opacity-40"
                animate={{ right: ["-40%", "100%"] }}
                transition={{
                    duration: 3,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatDelay: 1,
                    delay: 1.5,
                }}
            />
            <motion.div
                className="absolute bottom-0 left-0 h-[40%] w-[2px] bg-gradient-to-b from-transparent via-[#00BFEF] to-transparent opacity-40"
                animate={{ bottom: ["-40%", "100%"] }}
                transition={{
                    duration: 3,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatDelay: 1,
                    delay: 2.25,
                }}
            />
            {[
                "top-0 left-0",
                "top-0 right-0",
                "bottom-0 right-0",
                "bottom-0 left-0",
            ].map((pos, i) => (
                <motion.div
                    key={i}
                    className={`absolute ${pos} h-[6px] w-[6px] rounded-full bg-[#00BFEF]/30 blur-[2px]`}
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{
                        duration: 2 + i * 0.3,
                        repeat: Infinity,
                        repeatType: "mirror",
                        delay: i * 0.4,
                    }}
                />
            ))}
        </div>
    );
}

// ---- Main Component ----

export default function AuthSwitch() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showSignUpPassword, setShowSignUpPassword] = useState(false);
    const navigate = useNavigate();

    const [signUpData, setSignUpData] = useState({
        name: "",
        email: "",
        phone: "",
        posyandu_id: "",
        rt: "",
        rw: "",
        address: "",
        password: "",
        confirmPassword: "",
    });
    const [signUpError, setSignUpError] = useState("");
    const [signUpLoading, setSignUpLoading] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [posyandus, setPosyandus] = useState([]);
    const [isPosyanduDropdownOpen, setIsPosyanduDropdownOpen] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useTransform(mouseY, [-300, 300], [6, -6]);
    const rotateY = useTransform(mouseX, [-300, 300], [-6, 6]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left - rect.width / 2);
        mouseY.set(e.clientY - rect.top - rect.height / 2);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    useEffect(() => {
        const fetchPosyandus = async () => {
            try {
                const response = await api.get("/posyandus");
                setPosyandus(response.data.data || response.data || []);
            } catch (err) {
                logger.error("Failed to fetch posyandus:", err);
            }
        };
        fetchPosyandus();
    }, []);

    const validatePassword = (pwd) => {
        if (pwd.length < 8) return "Password minimal 8 karakter.";
        const hasUpperCase = /[A-Z]/.test(pwd);
        const hasLowerCase = /[a-z]/.test(pwd);
        const hasNumber = /\d/.test(pwd);
        if (!hasUpperCase || !hasLowerCase || !hasNumber) {
            return "Password harus mengandung minimal 1 huruf besar, 1 huruf kecil, dan 1 angka.";
        }
        return null;
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return "Format email tidak valid.";
        if (email.includes(".."))
            return "Email tidak boleh mengandung titik ganda berturut-turut.";
        if (email.startsWith(".") || email.endsWith("."))
            return "Email tidak boleh diawali atau diakhiri dengan titik.";
        return null;
    };

    const validatePhone = (phone) => {
        const phoneRegex = /^(08|62)\d{8,13}$/;
        if (!phoneRegex.test(phone))
            return "Format nomor telepon tidak valid. Gunakan format 08xxxxxxxxxx atau 62xxxxxxxxxx.";
        return null;
    };

    const handleSignIn = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(identifier, password);
            const user = await fetchMe();

            if (user.role === "ibu") {
                navigate("/dashboard");
            } else if (user.role === "kader" || user.role === "admin") {
                navigate("/dashboard");
            } else {
                navigate("/dashboard");
            }
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                "Login gagal. Periksa kembali nomor telepon/nama dan password Anda.";
            const statusCode = err.response?.status;

            if (statusCode === 429) {
                setError(errorMessage);
            } else {
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setSignUpError("");
        setFieldErrors({});

        if (
            !signUpData.name ||
            !signUpData.email ||
            !signUpData.phone ||
            !signUpData.posyandu_id ||
            !signUpData.rt ||
            !signUpData.rw ||
            !signUpData.address ||
            !signUpData.password ||
            !signUpData.confirmPassword
        ) {
            setSignUpError("Semua field wajib diisi.");
            return;
        }

        const emailError = validateEmail(signUpData.email);
        if (emailError) {
            setSignUpError(emailError);
            setFieldErrors({ email: true });
            return;
        }

        const phoneError = validatePhone(signUpData.phone);
        if (phoneError) {
            setSignUpError(phoneError);
            setFieldErrors({ phone: true });
            return;
        }

        const passwordError = validatePassword(signUpData.password);
        if (passwordError) {
            setSignUpError(passwordError);
            setFieldErrors({ password: true });
            return;
        }

        if (signUpData.password !== signUpData.confirmPassword) {
            setSignUpError("Password dan konfirmasi password tidak cocok.");
            setFieldErrors({ confirmPassword: true });
            return;
        }

        setSignUpLoading(true);

        try {
            await api.post("/register", {
                name: signUpData.name,
                email: signUpData.email,
                phone: signUpData.phone,
                posyandu_id: signUpData.posyandu_id,
                rt: signUpData.rt,
                rw: signUpData.rw,
                address: signUpData.address,
                password: signUpData.password,
                password_confirmation: signUpData.confirmPassword,
                role: "ibu",
            });

            await login(signUpData.phone, signUpData.password);
            navigate("/dashboard");
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                "Registrasi gagal. Silakan coba lagi.";
            const errors = err.response?.data?.errors;
            if (errors) {
                const errFields = {};
                Object.keys(errors).forEach((field) => {
                    errFields[field] = true;
                });
                setFieldErrors(errFields);
                const fieldErrorMessages = Object.values(errors).flat();
                setSignUpError(fieldErrorMessages.join(" "));
            } else {
                setSignUpError(errorMessage);
            }
        } finally {
            setSignUpLoading(false);
        }
    };

    return (
        <motion.div
            className="min-h-screen w-screen relative overflow-hidden flex items-center justify-center"
            style={{ background: "#f0f7ff" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#00BFEF]/10 via-[#e0f4ff]/50 to-[#f0f7ff]" />

            <div
                className="absolute inset-0 opacity-[0.015] mix-blend-multiply"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    backgroundSize: "200px 200px",
                }}
            />

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vh] h-[50vh] rounded-b-[50%] bg-[#00BFEF]/8 blur-[80px]" />
            <motion.div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vh] h-[50vh] rounded-b-full bg-[#00BFEF]/8 blur-[60px]"
                animate={{
                    opacity: [0.1, 0.25, 0.1],
                    scale: [0.98, 1.02, 0.98],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    repeatType: "mirror",
                }}
            />

            <motion.div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80vh] h-[70vh] rounded-t-full bg-[#00BFEF]/8 blur-[60px]"
                animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.08, 1] }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    repeatType: "mirror",
                    delay: 1,
                }}
            />

            <div className="absolute left-1/4 top-1/4 w-80 h-80 bg-[#00BFEF]/8 rounded-full blur-[100px] animate-pulse opacity-50" />
            <div
                className="absolute right-1/4 bottom-1/4 w-80 h-80 bg-[#00BFEF]/6 rounded-full blur-[100px] animate-pulse opacity-50"
                style={{ animationDelay: "1s" }}
            />

            {/* Back Button */}
            <motion.button
                onClick={() => navigate("/")}
                className="fixed top-5 left-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/50 backdrop-blur-2xl border border-white/50 text-gray-600 hover:text-[#00BFEF] hover:bg-white/70 hover:border-[#00BFEF]/30 transition-all duration-300 text-sm font-medium shadow-lg shadow-[#00BFEF]/10"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ scale: 1.05, x: -3 }}
                whileTap={{ scale: 0.95 }}
            >
                <Icon icon="mdi:arrow-left" className="w-4 h-4" />
                <span>Kembali</span>
            </motion.button>

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-[420px] relative z-10 px-4 my-6"
                style={{ perspective: 1500 }}
            >
                <motion.div
                    className="relative"
                    style={{ rotateX, rotateY }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    whileHover={{ z: 10 }}
                >
                    <div className="relative group">
                        <motion.div
                            className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-700"
                            animate={{
                                boxShadow: [
                                    "0 0 20px 5px rgba(0,191,239,0.06)",
                                    "0 0 35px 10px rgba(0,191,239,0.12)",
                                    "0 0 20px 5px rgba(0,191,239,0.06)",
                                ],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                                repeatType: "mirror",
                            }}
                        />

                        <LightBeamBorder />

                        <div className="absolute -inset-[0.5px] rounded-2xl bg-gradient-to-r from-[#00BFEF]/[0.05] via-[#00BFEF]/[0.1] to-[#00BFEF]/[0.05] opacity-0 group-hover:opacity-70 transition-opacity duration-500" />

                        {/* Glass card */}
                        <div className="relative bg-white/55 backdrop-blur-2xl rounded-2xl border border-white/50 shadow-2xl shadow-[#00BFEF]/10 overflow-hidden">
                            <div
                                className="absolute inset-0 opacity-[0.03]"
                                style={{
                                    backgroundImage: `linear-gradient(135deg, #00BFEF 0.5px, transparent 0.5px), linear-gradient(45deg, #00BFEF 0.5px, transparent 0.5px)`,

                                    backgroundSize: "30px 30px",
                                }}
                            />

                            <div
                                className={`relative p-6 ${isSignUp ? "max-h-[85vh] overflow-y-auto" : ""}`}
                                style={
                                    isSignUp
                                        ? {
                                              scrollbarWidth: "thin",
                                              scrollbarColor:
                                                  "rgba(0,191,239,0.3) rgba(0,0,0,0.03)",
                                          }
                                        : {}
                                }
                            >
                                {/* ===== SIGN IN VIEW ===== */}
                                <div
                                    style={{
                                        display: isSignUp ? "none" : "block",
                                    }}
                                >
                                    {/* Header */}
                                    <div className="text-center space-y-1.5 mb-6">
                                        <div className="mx-auto w-12 h-12 rounded-full border border-[#00BFEF]/20 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#00BFEF]/10 to-[#e0f4ff]">
                                            <Icon
                                                icon="mdi:heart-pulse"
                                                className="text-[#00BFEF] text-xl"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-50" />
                                        </div>

                                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-gray-800 to-gray-600">
                                            Selamat Datang
                                        </h1>

                                        <p className="text-gray-400 text-xs">
                                            Masuk ke akun NutriLogic Anda
                                        </p>
                                    </div>

                                    {/* Login Form */}
                                    <form
                                        onSubmit={handleSignIn}
                                        className="space-y-3.5"
                                        autoComplete="off"
                                    >
                                        <ErrorAlert message={error} />

                                        <GlassInput icon="mdi:email-outline">
                                            <input
                                                type="text"
                                                placeholder="Email atau No. Telepon"
                                                autoComplete="off"
                                                value={identifier}
                                                onChange={(e) =>
                                                    setIdentifier(
                                                        e.target.value.trim(),
                                                    )
                                                }
                                                required
                                                disabled={loading}
                                            />
                                        </GlassInput>

                                        <div className="relative">
                                            <GlassInput icon="material-symbols:lock">
                                                <input
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    placeholder="Password"
                                                    autoComplete="new-password"
                                                    value={password}
                                                    onChange={(e) =>
                                                        setPassword(
                                                            e.target.value.trim(),
                                                        )
                                                    }
                                                    required
                                                    disabled={loading}
                                                    className="!pr-10"
                                                />
                                            </GlassInput>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword,
                                                    )
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00BFEF] transition-colors duration-300 z-10"
                                                disabled={loading}
                                            >
                                                <Icon
                                                    icon={
                                                        showPassword
                                                            ? "mdi:eye-off"
                                                            : "mdi:eye"
                                                    }
                                                    className="w-[18px] h-[18px]"
                                                />
                                            </button>
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    navigate("/forgot-password")
                                                }
                                                className="text-xs text-gray-400 hover:text-[#00BFEF] transition-colors duration-200"
                                            >
                                                Lupa Password?
                                            </button>
                                        </div>

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            disabled={loading}
                                            className="w-full relative group/button mt-2"
                                        >
                                            <div className="absolute inset-0 bg-[#00BFEF]/20 rounded-xl blur-lg opacity-0 group-hover/button:opacity-70 transition-opacity duration-300" />
                                            <div className="relative overflow-hidden bg-gradient-to-r from-[#00BFEF] to-[#0088c2] text-white font-semibold h-11 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg shadow-[#00BFEF]/20">
                                                {loading && (
                                                    <motion.div
                                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                                        animate={{
                                                            x: [
                                                                "-100%",
                                                                "100%",
                                                            ],
                                                        }}
                                                        transition={{
                                                            duration: 1.5,
                                                            ease: "easeInOut",
                                                            repeat: Infinity,
                                                            repeatDelay: 0.5,
                                                        }}
                                                    />
                                                )}
                                                <AnimatePresence mode="wait">
                                                    {loading ? (
                                                        <motion.div
                                                            key="loading"
                                                            initial={{
                                                                opacity: 0,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                            }}
                                                            exit={{
                                                                opacity: 0,
                                                            }}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <div className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                                                            <span className="text-sm">
                                                                Memproses...
                                                            </span>
                                                        </motion.div>
                                                    ) : (
                                                        <motion.span
                                                            key="text"
                                                            initial={{
                                                                opacity: 0,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                            }}
                                                            exit={{
                                                                opacity: 0,
                                                            }}
                                                            className="flex items-center gap-1.5 text-sm"
                                                        >
                                                            Masuk
                                                            <Icon
                                                                icon="mdi:arrow-right"
                                                                className="w-4 h-4 group-hover/button:translate-x-1 transition-transform duration-300"
                                                            />
                                                        </motion.span>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </motion.button>

                                        <div className="relative flex items-center my-4">
                                            <div className="flex-grow border-t border-gray-300/40" />
                                            <span className="mx-3 text-[11px] text-gray-400">
                                                atau
                                            </span>
                                            <div className="flex-grow border-t border-gray-300/40" />
                                        </div>

                                        <p className="text-center text-xs text-gray-500">
                                            Belum punya akun?{" "}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsSignUp(true);
                                                    setError("");
                                                }}
                                                className="relative inline-block group/signup"
                                            >
                                                <span className="relative z-10 text-[#00BFEF] group-hover/signup:text-[#00BFEF]/70 transition-colors duration-300 font-semibold">
                                                    Daftar Sekarang
                                                </span>
                                                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#00BFEF] group-hover/signup:w-full transition-all duration-300" />
                                            </button>
                                        </p>
                                    </form>
                                </div>

                                {/* ===== SIGN UP VIEW ===== */}
                                <div
                                    style={{
                                        display: isSignUp ? "block" : "none",
                                    }}
                                >
                                    {/* Header */}
                                    <div className="text-center space-y-1.5 mb-5">
                                        <div className="mx-auto w-12 h-12 rounded-full border border-[#00BFEF]/20 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#00BFEF]/10 to-[#e0f4ff]">
                                            <Icon
                                                icon="mdi:account-plus"
                                                className="text-[#00BFEF] text-xl"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-50" />
                                        </div>

                                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-gray-800 to-gray-600">
                                            Buat Akun
                                        </h1>

                                        <p className="text-gray-400 text-xs">
                                            Bergabung dengan keluarga NutriLogic
                                        </p>
                                    </div>

                                    {/* Registration Form */}
                                    <form
                                        onSubmit={handleSignUp}
                                        className="space-y-2.5"
                                        autoComplete="off"
                                    >
                                        <ErrorAlert message={signUpError} />

                                        <GlassInput
                                            icon="mdi:account"
                                            error={fieldErrors.name}
                                        >
                                            <input
                                                type="text"
                                                placeholder="Nama Lengkap"
                                                autoComplete="name"
                                                value={signUpData.name}
                                                onChange={(e) =>
                                                    setSignUpData({
                                                        ...signUpData,
                                                        name: e.target.value.trim(),
                                                    })
                                                }
                                                required
                                                disabled={signUpLoading}
                                            />
                                        </GlassInput>

                                        <GlassInput
                                            icon="mdi:email"
                                            error={fieldErrors.email}
                                        >
                                            <input
                                                type="email"
                                                placeholder="Email"
                                                autoComplete="email"
                                                value={signUpData.email}
                                                onChange={(e) =>
                                                    setSignUpData({
                                                        ...signUpData,
                                                        email: e.target.value.trim(),
                                                    })
                                                }
                                                required
                                                disabled={signUpLoading}
                                            />
                                        </GlassInput>

                                        <GlassInput
                                            icon="fluent:phone-16-filled"
                                            error={fieldErrors.phone}
                                        >
                                            <input
                                                type="tel"
                                                placeholder="No. Telepon (08xxxxxxxxxx)"
                                                autoComplete="tel"
                                                value={signUpData.phone}
                                                onChange={(e) =>
                                                    setSignUpData({
                                                        ...signUpData,
                                                        phone: e.target.value.trim(),
                                                    })
                                                }
                                                required
                                                disabled={signUpLoading}
                                            />
                                        </GlassInput>

                                        {/* Posyandu Dropdown */}
                                        <div className="relative">
                                            <button
                                                type="button"
                                                id="signup-posyandu-button"
                                                aria-haspopup="listbox"
                                                aria-expanded={
                                                    isPosyanduDropdownOpen
                                                }
                                                className={`relative flex items-center overflow-visible rounded-xl border transition-all duration-300 cursor-pointer ${
                                                    fieldErrors.posyandu_id
                                                        ? "border-red-500/40 bg-red-500/10"
                                                        : isPosyanduDropdownOpen
                                                          ? "border-[#00BFEF]/60 bg-white/60 shadow-[0_0_15px_rgba(0,191,239,0.15)]"
                                                          : "border-white/40 bg-white/40 hover:border-white/60"
                                                }`}
                                                onClick={() =>
                                                    !signUpLoading &&
                                                    setIsPosyanduDropdownOpen(
                                                        !isPosyanduDropdownOpen,
                                                    )
                                                }
                                                disabled={signUpLoading}
                                            >
                                                <div
                                                    className={`absolute left-3.5 transition-all duration-300 ${
                                                        isPosyanduDropdownOpen
                                                            ? "text-[#00BFEF]"
                                                            : fieldErrors.posyandu_id
                                                              ? "text-red-400"
                                                              : "text-gray-400"
                                                    }`}
                                                >
                                                    <Icon
                                                        icon="mdi:hospital-building"
                                                        className="w-[18px] h-[18px]"
                                                    />
                                                </div>
                                                <div className="w-full pl-11 pr-10 h-11 flex items-center">
                                                    <span
                                                        className={`text-sm ${signUpData.posyandu_id ? "text-gray-800 font-medium" : "text-gray-400"}`}
                                                    >
                                                        {signUpData.posyandu_id
                                                            ? posyandus.find(
                                                                  (p) =>
                                                                      p.id ===
                                                                      parseInt(
                                                                          signUpData.posyandu_id,
                                                                      ),
                                                              )?.name ||
                                                              "Pilih Posyandu"
                                                            : "Pilih Lokasi Posyandu"}
                                                    </span>
                                                </div>
                                                <div className="absolute right-3 text-gray-400">
                                                    <Icon
                                                        icon="mdi:chevron-down"
                                                        className="w-5 h-5 transition-transform duration-300"
                                                        style={{
                                                            transform:
                                                                isPosyanduDropdownOpen
                                                                    ? "rotate(180deg)"
                                                                    : "rotate(0deg)",
                                                        }}
                                                    />
                                                </div>
                                            </button>

                                            <AnimatePresence>
                                                {isPosyanduDropdownOpen && (
                                                    <>
                                                        <div
                                                            className="fixed inset-0 z-10"
                                                            onClick={() =>
                                                                setIsPosyanduDropdownOpen(
                                                                    false,
                                                                )
                                                            }
                                                        />
                                                        <motion.div
                                                            initial={{
                                                                opacity: 0,
                                                                y: -8,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                y: 0,
                                                            }}
                                                            exit={{
                                                                opacity: 0,
                                                                y: -8,
                                                            }}
                                                            transition={{
                                                                duration: 0.2,
                                                            }}
                                                            className="absolute top-full left-0 right-0 mt-1.5 bg-white/70 backdrop-blur-2xl border border-white/50 rounded-xl shadow-xl shadow-[#00BFEF]/10 max-h-[180px] overflow-y-auto z-20"
                                                            style={{
                                                                scrollbarWidth:
                                                                    "thin",
                                                                scrollbarColor:
                                                                    "rgba(0,191,239,0.3) rgba(0,0,0,0.03)",
                                                            }}
                                                        >
                                                            {posyandus.length ===
                                                            0 ? (
                                                                <div className="px-4 py-3 text-gray-400 text-sm">
                                                                    Memuat data
                                                                    posyandu...
                                                                </div>
                                                            ) : (
                                                                posyandus.map(
                                                                    (
                                                                        posyandu,
                                                                    ) => (
                                                                        <button
                                                                            type="button"
                                                                            key={
                                                                                posyandu.id
                                                                            }
                                                                            onClick={() => {
                                                                                setSignUpData(
                                                                                    {
                                                                                        ...signUpData,
                                                                                        posyandu_id:
                                                                                            posyandu.id,
                                                                                    },
                                                                                );
                                                                                setIsPosyanduDropdownOpen(
                                                                                    false,
                                                                                );
                                                                            }}
                                                                            className={`w-full text-left px-4 py-2.5 cursor-pointer flex items-center justify-between transition-all duration-200 hover:bg-[#00BFEF]/5 ${
                                                                                parseInt(
                                                                                    signUpData.posyandu_id,
                                                                                ) ===
                                                                                posyandu.id
                                                                                    ? "bg-[#00BFEF]/10"
                                                                                    : ""
                                                                            }`}
                                                                        >
                                                                            <span
                                                                                className={`text-sm ${
                                                                                    parseInt(
                                                                                        signUpData.posyandu_id,
                                                                                    ) ===
                                                                                    posyandu.id
                                                                                        ? "text-[#00BFEF] font-semibold"
                                                                                        : "text-gray-600"
                                                                                }`}
                                                                            >
                                                                                {
                                                                                    posyandu.name
                                                                                }
                                                                            </span>
                                                                            {parseInt(
                                                                                signUpData.posyandu_id,
                                                                            ) ===
                                                                                posyandu.id && (
                                                                                <Icon
                                                                                    icon="mdi:check"
                                                                                    className="text-[#00BFEF] text-lg"
                                                                                />
                                                                            )}
                                                                        </button>
                                                                    ),
                                                                )
                                                            )}
                                                        </motion.div>
                                                    </>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* RT & RW */}
                                        <div className="flex gap-2.5">
                                            <GlassInput
                                                icon="mdi:home-group"
                                                error={fieldErrors.rt}
                                                className="flex-1"
                                            >
                                                <input
                                                    type="text"
                                                    placeholder="RT"
                                                    autoComplete="off"
                                                    value={signUpData.rt}
                                                    onChange={(e) =>
                                                        setSignUpData({
                                                            ...signUpData,
                                                            rt: e.target.value.trim(),
                                                        })
                                                    }
                                                    required
                                                    disabled={signUpLoading}
                                                    maxLength={5}
                                                />
                                            </GlassInput>
                                            <GlassInput
                                                icon="mdi:home-city"
                                                error={fieldErrors.rw}
                                                className="flex-1"
                                            >
                                                <input
                                                    type="text"
                                                    placeholder="RW"
                                                    autoComplete="off"
                                                    value={signUpData.rw}
                                                    onChange={(e) =>
                                                        setSignUpData({
                                                            ...signUpData,
                                                            rw: e.target.value.trim(),
                                                        })
                                                    }
                                                    required
                                                    disabled={signUpLoading}
                                                    maxLength={5}
                                                />
                                            </GlassInput>
                                        </div>

                                        {/* Alamat */}
                                        <GlassInput
                                            icon="mdi:map-marker"
                                            error={fieldErrors.address}
                                        >
                                            <textarea
                                                placeholder="Alamat Lengkap"
                                                autoComplete="street-address"
                                                value={signUpData.address}
                                                onChange={(e) =>
                                                    setSignUpData({
                                                        ...signUpData,
                                                        address: e.target.value,
                                                    })
                                                }
                                                required
                                                disabled={signUpLoading}
                                                rows={2}
                                            />
                                        </GlassInput>

                                        {/* Password */}
                                        <div className="relative">
                                            <GlassInput
                                                icon="material-symbols:lock"
                                                error={fieldErrors.password}
                                            >
                                                <input
                                                    type={
                                                        showSignUpPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    placeholder="Password"
                                                    autoComplete="new-password"
                                                    value={signUpData.password}
                                                    onChange={(e) =>
                                                        setSignUpData({
                                                            ...signUpData,
                                                            password:
                                                                e.target.value.trim(),
                                                        })
                                                    }
                                                    required
                                                    disabled={signUpLoading}
                                                    className="!pr-10"
                                                />
                                            </GlassInput>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowSignUpPassword(
                                                        !showSignUpPassword,
                                                    )
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00BFEF] transition-colors duration-300 z-10"
                                                disabled={signUpLoading}
                                            >
                                                <Icon
                                                    icon={
                                                        showSignUpPassword
                                                            ? "mdi:eye-off"
                                                            : "mdi:eye"
                                                    }
                                                    className="w-[18px] h-[18px]"
                                                />
                                            </button>
                                        </div>

                                        {/* Konfirmasi Password */}
                                        <div className="relative">
                                            <GlassInput
                                                icon="material-symbols:lock-outline"
                                                error={
                                                    fieldErrors.confirmPassword
                                                }
                                            >
                                                <input
                                                    type={
                                                        showConfirmPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    placeholder="Konfirmasi Password"
                                                    autoComplete="new-password"
                                                    value={
                                                        signUpData.confirmPassword
                                                    }
                                                    onChange={(e) =>
                                                        setSignUpData({
                                                            ...signUpData,
                                                            confirmPassword:
                                                                e.target.value.trim(),
                                                        })
                                                    }
                                                    required
                                                    disabled={signUpLoading}
                                                    className="!pr-10"
                                                />
                                            </GlassInput>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        !showConfirmPassword,
                                                    )
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00BFEF] transition-colors duration-300 z-10"
                                                disabled={signUpLoading}
                                            >
                                                <Icon
                                                    icon={
                                                        showConfirmPassword
                                                            ? "mdi:eye-off"
                                                            : "mdi:eye"
                                                    }
                                                    className="w-[18px] h-[18px]"
                                                />
                                            </button>
                                        </div>

                                        <p className="text-[11px] text-gray-400 text-center">
                                            Min. 8 karakter, mengandung huruf
                                            besar, huruf kecil, dan angka
                                        </p>

                                        {/* Register Button */}
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            disabled={signUpLoading}
                                            className="w-full relative group/button mt-1"
                                        >
                                            <div className="absolute inset-0 bg-[#00BFEF]/20 rounded-xl blur-lg opacity-0 group-hover/button:opacity-70 transition-opacity duration-300" />
                                            <div className="relative overflow-hidden bg-gradient-to-r from-[#00BFEF] to-[#0088c2] text-white font-semibold h-11 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg shadow-[#00BFEF]/20">
                                                {signUpLoading && (
                                                    <motion.div
                                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                                        animate={{
                                                            x: [
                                                                "-100%",
                                                                "100%",
                                                            ],
                                                        }}
                                                        transition={{
                                                            duration: 1.5,
                                                            ease: "easeInOut",
                                                            repeat: Infinity,
                                                            repeatDelay: 0.5,
                                                        }}
                                                    />
                                                )}
                                                <AnimatePresence mode="wait">
                                                    {signUpLoading ? (
                                                        <motion.div
                                                            key="loading"
                                                            initial={{
                                                                opacity: 0,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                            }}
                                                            exit={{
                                                                opacity: 0,
                                                            }}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <div className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                                                            <span className="text-sm">
                                                                Memproses...
                                                            </span>
                                                        </motion.div>
                                                    ) : (
                                                        <motion.span
                                                            key="text"
                                                            initial={{
                                                                opacity: 0,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                            }}
                                                            exit={{
                                                                opacity: 0,
                                                            }}
                                                            className="flex items-center gap-1.5 text-sm"
                                                        >
                                                            Daftar
                                                            <Icon
                                                                icon="mdi:arrow-right"
                                                                className="w-4 h-4 group-hover/button:translate-x-1 transition-transform duration-300"
                                                            />
                                                        </motion.span>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </motion.button>

                                        <div className="relative flex items-center my-3">
                                            <div className="flex-grow border-t border-gray-300/40" />
                                            <span className="mx-3 text-[11px] text-gray-400">
                                                atau
                                            </span>
                                            <div className="flex-grow border-t border-gray-300/40" />
                                        </div>

                                        <p className="text-center text-xs text-gray-500">
                                            Sudah punya akun?{" "}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsSignUp(false);
                                                    setSignUpError("");
                                                    setFieldErrors({});
                                                }}
                                                className="relative inline-block group/signin"
                                            >
                                                <span className="relative z-10 text-[#00BFEF] group-hover/signin:text-[#00BFEF]/70 transition-colors duration-300 font-semibold">
                                                    Masuk
                                                </span>
                                                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#00BFEF] group-hover/signin:w-full transition-all duration-300" />
                                            </button>
                                        </p>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
