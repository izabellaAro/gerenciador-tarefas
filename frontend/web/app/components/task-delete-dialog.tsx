"use client";

import { useEffect } from "react";
import type { Task } from "../lib/trpc";

interface TaskDeleteDialogProps {
  task: Task;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<boolean>;
}

export function TaskDeleteDialog({
  task,
  isDeleting,
  onClose,
  onConfirm,
}: TaskDeleteDialogProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isDeleting) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDeleting, onClose]);

  async function handleConfirm() {
    const wasDeleted = await onConfirm();

    if (wasDeleted) {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-slate-950/40 p-4">
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-task-title"
        aria-describedby="delete-task-description"
      >
        <h2 id="delete-task-title" className="text-xl font-bold text-blue-950">
          Excluir tarefa?
        </h2>
        <p id="delete-task-description" className="mt-3 text-slate-600">
          A tarefa <strong>{task.titulo}</strong> será excluída permanentemente.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-800 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-red-400"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Excluindo..." : "Excluir tarefa"}
          </button>
        </div>
      </div>
    </div>
  );
}
