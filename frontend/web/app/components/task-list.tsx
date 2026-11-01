import { TaskCard } from "./task-card";
import type { Task } from "../lib/trpc";

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  error: Error | null;
}

export function TaskList({ tasks, isLoading, error }: TaskListProps) {
  if (isLoading) {
    return (
      <p
        className="rounded-xl border border-blue-100 bg-white p-6 text-slate-600 shadow-sm"
        role="status"
      >
        Carregando tarefas...
      </p>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900"
        role="alert"
      >
        <h2 className="font-semibold">Não foi possível carregar as tarefas.</h2>
        <p className="mt-1 text-sm text-red-800">
          Verifique se o backend está em execução e tente novamente.
        </p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-blue-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-blue-950">
          Nenhuma tarefa encontrada
        </h2>
        <p className="mt-2 text-slate-600">
          Quando houver tarefas cadastradas, elas aparecerão aqui.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="task-list-title">
      <h2 id="task-list-title" className="sr-only">
        Lista de tarefas
      </h2>
      <ul className="space-y-4">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </ul>
    </section>
  );
}
