import type { Task } from "../lib/trpc";

interface TaskCardProps {
  task: Task;
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
});

export function TaskCard({ task }: TaskCardProps) {
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
      </article>
    </li>
  );
}
