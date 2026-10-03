import KanbanBoard from "@/components/KanbanBoard";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">タスクカンバン</h1>
      <KanbanBoard />
    </main>
  );
}
