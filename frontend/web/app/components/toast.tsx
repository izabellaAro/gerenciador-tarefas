"use client";

import { useEffect } from "react";

export type ToastKind = "success" | "error";

interface ToastProps {
  kind: ToastKind;
  message: string;
  onDismiss: () => void;
}

const toastClasses: Record<ToastKind, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-red-200 bg-red-50 text-red-900",
};

export function Toast({ kind, message, onDismiss }: ToastProps) {
  useEffect(() => {
    const timeoutId = window.setTimeout(onDismiss, 5_000);
    return () => window.clearTimeout(timeoutId);
  }, [onDismiss]);

  return (
    <div
      className={`fixed right-4 bottom-4 z-20 flex max-w-sm items-center gap-3 rounded-xl border p-4 shadow-lg ${toastClasses[kind]}`}
      role={kind === "error" ? "alert" : "status"}
    >
      <p className="text-sm font-medium">{message}</p>
      <button
        type="button"
        className="ml-auto rounded px-2 py-1 text-sm font-bold focus-visible:ring-2 focus-visible:ring-current focus-visible:outline-none"
        onClick={onDismiss}
        aria-label="Fechar mensagem"
      >
        ×
      </button>
    </div>
  );
}
