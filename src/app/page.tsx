import KanbanBoard from "@/components/KanbanBoard";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">タスクカンバン</h1>
        <p className="text-sm text-muted-foreground">タスクを未着手・進行中・完了で管理します</p>
      </header>
      <KanbanBoard />
    </main>
  );
}
