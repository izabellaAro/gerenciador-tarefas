import { connection } from "next/server";
import { TaskManager } from "./components/task-manager";
import { serverTrpc } from "./lib/trpc-server";
import type { Task } from "./lib/trpc";

export const instant = false;

export default async function Home() {
  await connection();
  let tasks: Task[] = [];
  let initialLoadFailed = false;

  try {
    tasks = await serverTrpc.listar.query();
  } catch (error) {
    console.error("Failed to load tasks during server rendering.", error);
    initialLoadFailed = true;
  }

  return (
    <TaskManager initialTasks={tasks} initialLoadFailed={initialLoadFailed} />
  );
}
