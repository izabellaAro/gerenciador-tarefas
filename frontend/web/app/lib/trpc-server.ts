import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../../../backend/src/tarefas/tarefas.router";

const serverUrl =
  process.env.TRPC_SERVER_URL ?? "http://localhost:3030/trpc";

export const serverTrpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: serverUrl,
    }),
  ],
});
