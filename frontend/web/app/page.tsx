"use client";

import { useEffect, useState } from "react";
import { TaskList } from "./components/task-list";
import { trpc, type Task } from "./lib/trpc";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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

  return (
    <main className="flex flex-1 bg-linear-to-br from-blue-50 via-slate-50 to-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold tracking-wide text-blue-700 uppercase">
            Gerenciador de tarefas
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-blue-950 sm:text-4xl">
            Minhas tarefas
          </h1>
          <p className="mt-2 text-base text-slate-600">
            Acompanhe tudo o que precisa ser feito.
          </p>
        </header>

        <TaskList tasks={tasks} isLoading={isLoading} error={error} />
      </div>
    </main>
  );
}
