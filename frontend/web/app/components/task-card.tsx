import type { Task } from "../lib/trpc";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
});

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <li className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <article>
        <h2 className="text-lg font-semibold text-blue-950">{task.titulo}</h2>
        {task.descricao && (
          <p className="mt-2 whitespace-pre-wrap text-slate-600">
            {task.descricao}
          </p>
        )}
        <p className="mt-4 text-sm text-slate-500">
          Criada em {dateFormatter.format(new Date(task.dataCriacao))}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-800 transition-colors hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
            onClick={() => onEdit(task)}
          >
            Editar tarefa
          </button>
          <button
            type="button"
            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:outline-none"
            onClick={() => onDelete(task)}
          >
            Excluir tarefa
          </button>
        </div>
      </article>
    </li>
  );
}
