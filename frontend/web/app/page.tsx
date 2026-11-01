"use client";

import { useEffect, useState } from "react";
import { TaskFormModal } from "./components/task-form-modal";
import { TaskList } from "./components/task-list";
import { Toast, type ToastKind } from "./components/toast";
import { trpc, type Task } from "./lib/trpc";

interface ToastMessage {
  id: number;
  message: string;
  kind: ToastKind;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [taskBeingEdited, setTaskBeingEdited] = useState<Task | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadTasks() {
      try {
        const loadedTasks = await trpc.listar.query();

        if (isActive) {
          setTasks(loadedTasks);
        }
      } catch (caughtError) {
        if (isActive) {
          setError(
            caughtError instanceof Error
              ? caughtError
              : new Error("Não foi possível carregar as tarefas."),
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadTasks();

    return () => {
      isActive = false;
    };
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
              setIsCreatingTask(true);
            }}
            disabled={isLoading || Boolean(error) || isSubmitting}
          >
            Nova tarefa
          </button>
        </header>

        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          error={error}
          onEdit={(task) => {
            setIsCreatingTask(false);
            setTaskBeingEdited(task);
          }}
        />
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

      {toast && (
        <Toast
          key={toast.id}
          kind={toast.kind}
          message={toast.message}
          onDismiss={() => setToast(null)}
        />
      )}
    </main>
  );
}
