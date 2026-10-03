'use client'

import { useEffect, useState } from 'react'
import TaskCard from '@/components/TaskCard'
import TaskForm from '@/components/TaskForm'
import { createTask, deleteTask, fetchTasks, updateTask } from '@/lib/tasks'
import { taskStatusLabels, taskStatuses, type Task, type TaskInput } from '@/types/task'

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchTasks()
      .then((fetchedTasks) => {
        if (cancelled) return
        setTasks(fetchedTasks)
        setLoaded(true)
      })
      .catch(() => {
        if (!cancelled) setError('タスクの取得に失敗しました')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleSubmit = async (input: TaskInput): Promise<boolean> => {
    setError(null)
    try {
      if (editingTask) {
        const updatedTask = await updateTask(editingTask.id, input)
        setTasks((current) =>
          current.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
        )
        setEditingTask(null)
      } else {
        const createdTask = await createTask(input)
        setTasks((current) => [...current, createdTask])
      }
      return true
    } catch {
      setError(editingTask ? 'タスクの更新に失敗しました' : 'タスクの追加に失敗しました')
      return false
    }
  }

  const handleDelete = async (task: Task) => {
    if (!window.confirm(`「${task.title}」を削除しますか？`)) return
    setError(null)
    try {
      await deleteTask(task.id)
      setTasks((current) => current.filter((currentTask) => currentTask.id !== task.id))
      if (editingTask?.id === task.id) setEditingTask(null)
    } catch {
      setError('タスクの削除に失敗しました')
    }
  }

  if (loading) return <p>読み込み中…</p>

  return (
    <div className="flex w-full flex-col gap-6">
      {error && (
        <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {loaded && (
        <>
          <TaskForm
            key={editingTask?.id ?? 'new'}
            task={editingTask ?? undefined}
            onSubmit={handleSubmit}
            onCancel={() => setEditingTask(null)}
          />
          <div className="grid gap-4 md:grid-cols-3">
            {taskStatuses.map((status) => {
              const columnTasks = tasks.filter((task) => task.status === status)
              return (
                <section
                  key={status}
                  aria-label={taskStatusLabels[status]}
                  className="flex flex-col gap-3 rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800"
                >
                  <h2 className="font-semibold">{taskStatusLabels[status]}</h2>
                  {columnTasks.length === 0 ? (
                    <p className="text-sm text-zinc-500">タスクがありません</p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {columnTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onEdit={setEditingTask}
                          onDelete={handleDelete}
                        />
                      ))}
                    </ul>
                  )}
                </section>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
