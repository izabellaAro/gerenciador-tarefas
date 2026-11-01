import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../../../backend/src/tarefas/tarefas.router";

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/trpc",
    }),
  ],
});

export type TaskPage = Awaited<ReturnType<typeof trpc.listarPaginado.query>>;
export type Task = TaskPage["items"][number];
export type TaskCursor = TaskPage["proximoCursor"];
