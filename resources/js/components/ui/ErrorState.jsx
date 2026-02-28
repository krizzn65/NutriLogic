import React from "react"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ErrorState({
  title = "Terjadi kesalahan",
  message = "Gagal memuat data. Silakan coba lagi.",
  onRetry,
  retryLabel = "Coba Lagi",
  className,
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-red-200 bg-red-50 p-4 text-center",
        className,
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle className="h-5 w-5 text-red-600" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-semibold text-red-800">{title}</h3>
      <p className="mt-1 text-sm text-red-700">{message}</p>
      {onRetry ? (
        <button
          onClick={onRetry}
          className="mt-3 inline-flex items-center rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  )
}
