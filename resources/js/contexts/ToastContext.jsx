import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const DEFAULT_DURATION = 5000;
const MAX_TOASTS = 4;

const ToastContext = createContext(null);

function ToastIcon({ type }) {
    if (type === "success") {
        return <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />;
    }

    if (type === "error") {
        return <AlertCircle className="h-5 w-5 text-red-600" aria-hidden="true" />;
    }

    return <Info className="h-5 w-5 text-blue-600" aria-hidden="true" />;
}

function ToastItem({ toast, onClose }) {
    const isError = toast.type === "error";
    const containerClass = isError
        ? "border-red-100 bg-red-50"
        : toast.type === "success"
            ? "border-emerald-100 bg-emerald-50"
            : "border-blue-100 bg-blue-50";

    return (
        <div
            role="status"
            aria-live="polite"
            className={`w-full rounded-xl border shadow-lg backdrop-blur-sm px-4 py-3 ${containerClass}`}
        >
            <div className="flex items-start gap-3">
                <ToastIcon type={toast.type} />
                <div className="flex-1 min-w-0">
                    {toast.title && (
                        <p className="text-sm font-semibold text-gray-900 leading-5">{toast.title}</p>
                    )}
                    <p className="text-sm text-gray-700 leading-5">{toast.message}</p>
                </div>
                <button
                    type="button"
                    onClick={() => onClose(toast.id)}
                    className="rounded-md p-1 text-gray-500 hover:bg-white/70 hover:text-gray-700 transition-colors"
                    aria-label="Tutup notifikasi"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const push = useCallback((toast) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const duration = toast.duration ?? DEFAULT_DURATION;
        const nextToast = {
            id,
            type: toast.type ?? "info",
            title: toast.title ?? "",
            message: toast.message ?? "",
            duration,
        };

        setToasts((prev) => [nextToast, ...prev].slice(0, MAX_TOASTS));

        if (duration > 0) {
            window.setTimeout(() => {
                dismiss(id);
            }, duration);
        }
    }, [dismiss]);

    const api = useMemo(() => ({
        show: (message, options = {}) => push({ message, ...options }),
        success: (message, options = {}) => push({ message, ...options, type: "success" }),
        error: (message, options = {}) => push({ message, ...options, type: "error" }),
        info: (message, options = {}) => push({ message, ...options, type: "info" }),
        dismiss,
    }), [dismiss, push]);

    return (
        <ToastContext.Provider value={api}>
            {children}
            <div className="fixed top-4 right-4 left-4 sm:left-auto z-[10000] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto sm:w-[360px] sm:max-w-[90vw] sm:ml-auto">
                        <ToastItem toast={toast} onClose={dismiss} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }

    return context;
}
