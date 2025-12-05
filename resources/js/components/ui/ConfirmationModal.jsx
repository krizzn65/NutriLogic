import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "./dialog";
import { AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Ya, Lanjutkan",
    cancelText = "Batal",
    variant = "primary", // 'primary', 'danger', 'warning'
    isLoading = false
}) {
    const getIcon = () => {
        switch (variant) {
            case 'danger':
                return <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />;
            case 'warning':
                return <HelpCircle className="w-12 h-12 text-amber-500 mb-4" />;
            case 'success':
                return <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />;
            default:
                return <HelpCircle className="w-12 h-12 text-blue-500 mb-4" />;
        }
    };

    const getButtonColor = () => {
        switch (variant) {
            case 'danger':
                return "bg-red-600 hover:bg-red-700 focus:ring-red-500";
            case 'warning':
                return "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500";
            case 'success':
                return "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500";
            default:
                return "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] text-center flex flex-col items-center p-8 bg-white border-none shadow-2xl rounded-2xl">
                {getIcon()}

                <DialogHeader className="mb-2">
                    <DialogTitle className="text-xl font-bold text-center text-slate-900">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-center text-slate-500 mt-2">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex flex-col sm:flex-row gap-3 w-full mt-6 sm:justify-center">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-white font-medium shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${getButtonColor()}`}
                    >
                        {isLoading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Memproses...
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
