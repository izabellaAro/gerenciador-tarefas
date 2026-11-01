import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../../../backend/src/tarefas/tarefas.router";

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/trpc",
    }),
  ],
});

export type Task = Awaited<ReturnType<typeof trpc.listar.query>>[number];
