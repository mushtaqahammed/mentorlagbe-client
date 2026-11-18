"use client"

import { AlertCircle, CheckCircle2, Info, X } from "lucide-react"

import { cn } from "@/lib/utils"

export type ToastItem = {
  id: number
  variant: "success" | "error" | "info"
  title: string
  description?: string
}

export function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[]
  onDismiss: (id: number) => void
}) {
  if (toasts.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const Icon =
          toast.variant === "success"
            ? CheckCircle2
            : toast.variant === "error"
              ? AlertCircle
              : Info

        return (
          <div
            key={toast.id}
            role={toast.variant === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border p-4 shadow-2xl shadow-black/40 backdrop-blur-xl",
              toast.variant === "success" &&
                "border-lime-400/30 bg-neutral-900/95",
              toast.variant === "error" &&
                "border-rose-400/30 bg-neutral-900/95",
              toast.variant === "info" && "border-white/15 bg-neutral-900/95"
            )}
          >
            <Icon
              className={cn(
                "mt-0.5 size-5 shrink-0",
                toast.variant === "success" && "text-lime-400",
                toast.variant === "error" && "text-rose-400",
                toast.variant === "info" && "text-sky-400"
              )}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">{toast.title}</p>
              {toast.description && (
                <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="rounded-md p-1 text-neutral-500 transition-colors hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-lime-400/60 focus-visible:outline-none"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
