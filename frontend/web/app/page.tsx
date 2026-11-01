import { connection } from "next/server";
import { TaskManager } from "./components/task-manager";
import { serverTrpc } from "./lib/trpc-server";
import type { Task, TaskCursor } from "./lib/trpc";

export const instant = false;

export default async function Home() {
  await connection();
  let tasks: Task[] = [];
  let nextCursor: TaskCursor = null;
  let initialLoadFailed = false;

  try {
    const page = await serverTrpc.listarPaginado.query({});
    tasks = page.items;
    nextCursor = page.proximoCursor;
  } catch (error) {
    console.error("Failed to load tasks during server rendering.", error);
    initialLoadFailed = true;
  }

  return (
    <TaskManager
      initialTasks={tasks}
      initialNextCursor={nextCursor}
      initialLoadFailed={initialLoadFailed}
    />
  );
}
