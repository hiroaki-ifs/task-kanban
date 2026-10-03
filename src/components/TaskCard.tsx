import type { Task } from '@/types/task'

type TaskCardProps = {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <li className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <h3 className="break-words font-medium">{task.title}</h3>
      {task.description && (
        <p className="whitespace-pre-wrap break-words text-sm text-zinc-600 dark:text-zinc-400">
          {task.description}
        </p>
      )}
      <div className="flex gap-2 text-sm">
        <button
          type="button"
          aria-label={`${task.title}を編集`}
          onClick={() => onEdit(task)}
          className="rounded border border-zinc-300 px-2 py-0.5 dark:border-zinc-600"
        >
          編集
        </button>
        <button
          type="button"
          aria-label={`${task.title}を削除`}
          onClick={() => onDelete(task)}
          className="rounded border border-red-300 px-2 py-0.5 text-red-600 dark:border-red-700"
        >
          削除
        </button>
      </div>
    </li>
  )
}
