"use client";

import { useEffect, useState, type FormEvent } from "react";
interface TaskFormModalProps {
  heading: string;
  description: string;
  submitLabel: string;
  savingLabel: string;
  initialValues: {
    titulo: string;
    descricao: string;
  };
  isSubmitting: boolean;
  onClose: () => void;
  onSave: (values: { titulo: string; descricao: string }) => Promise<boolean>;
}

export function TaskFormModal({
  heading,
  description,
  submitLabel,
  savingLabel,
  initialValues,
  isSubmitting,
  onClose,
  onSave,
}: TaskFormModalProps) {
  const [titulo, setTitulo] = useState(initialValues.titulo);
  const [descricao, setDescricao] = useState(initialValues.descricao);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSubmitting, onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = titulo.trim();

    if (!trimmedTitle) {
      setValidationError("Informe um título para a tarefa.");
      return;
    }

    setValidationError(null);
    const wasSaved = await onSave({ titulo: trimmedTitle, descricao });

    if (wasSaved) {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-slate-950/40 p-4">
      <div
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="task-form-title" className="text-xl font-bold text-blue-950">
              {heading}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {description}
            </p>
          </div>
          <button
            type="button"
            className="rounded-md px-2 py-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Fechar formulário"
          >
            ×
          </button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              className="block text-sm font-semibold text-slate-700"
              htmlFor="task-title"
            >
              Título
            </label>
            <input
              id="task-title"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              disabled={isSubmitting}
              aria-describedby={validationError ? "task-title-error" : undefined}
            />
            {validationError && (
              <p id="task-title-error" className="mt-2 text-sm text-red-700">
                {validationError}
              </p>
            )}
          </div>

          <div>
            <label
              className="block text-sm font-semibold text-slate-700"
              htmlFor="task-description"
            >
              Descrição
            </label>
            <textarea
              id="task-description"
              className="mt-2 min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-blue-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? savingLabel : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
