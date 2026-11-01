"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TaskDeleteDialog } from "./task-delete-dialog";
import { TaskFormModal } from "./task-form-modal";
import { TaskList } from "./task-list";
import { Toast, type ToastKind } from "./toast";
import { trpc, type Task, type TaskCursor } from "../lib/trpc";

interface ToastMessage {
  id: number;
  message: string;
  kind: ToastKind;
}

interface TaskManagerProps {
  initialTasks: Task[];
  initialNextCursor: TaskCursor;
  initialLoadFailed: boolean;
}

export function TaskManager({
  initialTasks,
  initialNextCursor,
  initialLoadFailed,
}: TaskManagerProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [taskBeingEdited, setTaskBeingEdited] = useState<Task | null>(null);
  const [taskBeingDeleted, setTaskBeingDeleted] = useState<Task | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingMoreRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMoreRef.current) {
      return;
    }

    loadingMoreRef.current = true;
    setIsLoadingMore(true);
    setLoadMoreError(false);

    try {
      const page = await trpc.listarPaginado.query({ cursor: nextCursor });
      setTasks((currentTasks) => {
        const existingIds = new Set(currentTasks.map((task) => task.id));
        return [
          ...currentTasks,
          ...page.items.filter((task) => !existingIds.has(task.id)),
        ];
      });
      setNextCursor(page.proximoCursor);
    } catch {
      setLoadMoreError(true);
    } finally {
      loadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, [nextCursor]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !nextCursor || initialLoadFailed) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [initialLoadFailed, loadMore, nextCursor]);

  useEffect(() => {
    const updateScrollToTopVisibility = () => {
      setShowScrollToTop(window.scrollY > 300);
    };

    updateScrollToTopVisibility();
    window.addEventListener("scroll", updateScrollToTopVisibility, {
      passive: true,
    });
    return () => window.removeEventListener("scroll", updateScrollToTopVisibility);
  }, []);

  async function saveTask({
    titulo,
    descricao,
  }: {
    titulo: string;
    descricao: string;
  }) {
    if (!taskBeingEdited) {
      return false;
    }

    setIsSubmitting(true);

    try {
      const updatedTask = await trpc.atualizar.mutate({
        id: taskBeingEdited.id,
        titulo,
        descricao,
      });

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task,
        ),
      );
      setToast({
        id: Date.now(),
        kind: "success",
        message: "Tarefa atualizada com sucesso.",
      });
      return true;
    } catch {
      setToast({
        id: Date.now(),
        kind: "error",
        message: "Não foi possível atualizar a tarefa. Tente novamente.",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function createTask({
    titulo,
    descricao,
  }: {
    titulo: string;
    descricao: string;
  }) {
    setIsSubmitting(true);

    try {
      const trimmedDescription = descricao.trim();
      const createdTask = await trpc.criar.mutate({
        titulo,
        ...(trimmedDescription && { descricao: trimmedDescription }),
      });

      setTasks((currentTasks) => [...currentTasks, createdTask]);
      setToast({
        id: Date.now(),
        kind: "success",
        message: "Tarefa criada com sucesso.",
      });
      return true;
    } catch {
      setToast({
        id: Date.now(),
        kind: "error",
        message: "Não foi possível criar a tarefa. Tente novamente.",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteTask() {
    if (!taskBeingDeleted) {
      return false;
    }

    setIsSubmitting(true);

    try {
      const deletedTask = await trpc.remover.mutate({
        id: taskBeingDeleted.id,
      });

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== deletedTask.id),
      );
      setToast({
        id: Date.now(),
        kind: "success",
        message: "Tarefa excluída com sucesso.",
      });
      return true;
    } catch {
      setToast({
        id: Date.now(),
        kind: "error",
        message: "Não foi possível excluir a tarefa. Tente novamente.",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1 bg-linear-to-br from-blue-50 via-slate-50 to-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-semibold tracking-wide text-blue-700 uppercase">
              Gerenciador de tarefas
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-blue-950 sm:text-4xl">
              Minhas tarefas
            </h1>
            <p className="mt-2 text-base text-slate-600">
              Acompanhe tudo o que precisa ser feito.
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
            onClick={() => {
              setTaskBeingEdited(null);
              setTaskBeingDeleted(null);
              setIsCreatingTask(true);
            }}
            disabled={initialLoadFailed || isSubmitting}
          >
            Nova tarefa
          </button>
        </header>

        <TaskList
          tasks={tasks}
          isLoading={false}
          error={
            initialLoadFailed
              ? new Error("Não foi possível carregar as tarefas.")
              : null
          }
          onEdit={(task) => {
            setIsCreatingTask(false);
            setTaskBeingDeleted(null);
            setTaskBeingEdited(task);
          }}
          onDelete={(task) => {
            setIsCreatingTask(false);
            setTaskBeingEdited(null);
            setTaskBeingDeleted(task);
          }}
        />

        {!initialLoadFailed && nextCursor && (
          <div ref={sentinelRef} className="py-6 text-center">
            {isLoadingMore && (
              <p className="text-sm text-slate-600" role="status">
                Carregando mais tarefas...
              </p>
            )}
            {loadMoreError && !isLoadingMore && (
              <div role="alert">
                <p className="text-sm text-red-700">
                  Não foi possível carregar mais tarefas.
                </p>
                <button
                  type="button"
                  className="mt-2 text-sm font-semibold text-blue-700 hover:text-blue-800 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
                  onClick={() => void loadMore()}
                >
                  Tentar novamente
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {taskBeingEdited && (
        <TaskFormModal
          key={taskBeingEdited.id}
          heading="Editar tarefa"
          description="Atualize as informações da sua tarefa."
          submitLabel="Salvar alterações"
          savingLabel="Salvando..."
          initialValues={{
            titulo: taskBeingEdited.titulo,
            descricao: taskBeingEdited.descricao ?? "",
          }}
          isSubmitting={isSubmitting}
          onClose={() => setTaskBeingEdited(null)}
          onSave={saveTask}
        />
      )}

      {isCreatingTask && (
        <TaskFormModal
          key="create-task"
          heading="Nova tarefa"
          description="Preencha as informações da sua nova tarefa."
          submitLabel="Criar tarefa"
          savingLabel="Criando..."
          initialValues={{ titulo: "", descricao: "" }}
          isSubmitting={isSubmitting}
          onClose={() => setIsCreatingTask(false)}
          onSave={createTask}
        />
      )}

      {taskBeingDeleted && (
        <TaskDeleteDialog
          key={taskBeingDeleted.id}
          task={taskBeingDeleted}
          isDeleting={isSubmitting}
          onClose={() => setTaskBeingDeleted(null)}
          onConfirm={deleteTask}
        />
      )}

      {toast && (
        <Toast
          key={toast.id}
          kind={toast.kind}
          message={toast.message}
          onDismiss={() => setToast(null)}
        />
      )}

      {showScrollToTop && (
        <button
          type="button"
          className="fixed right-6 bottom-6 rounded-full bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Voltar ao topo"
        >
          ↑ Topo
        </button>
      )}
    </main>
  );
}
