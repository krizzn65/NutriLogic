import React from "react"
import { Inbox } from "lucide-react"
import { cn } from "@/lib/utils"

export default function EmptyState({
  title = "Belum ada data",
  description = "Data akan muncul di sini ketika sudah tersedia.",
  icon: Icon = Inbox,
  action = null,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/60 p-6 text-center",
        className,
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white border border-slate-200">
        <Icon className="h-6 w-6 text-slate-400" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
