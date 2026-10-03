'use client'

import { useState } from 'react'
import {
  maxTitleLength,
  taskStatusLabels,
  taskStatuses,
  type Task,
  type TaskInput,
  type TaskStatus,
} from '@/types/task'

type TaskFormProps = {
  task?: Task
  onSubmit: (input: TaskInput) => Promise<boolean>
  onCancel?: () => void
}

export default function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const isEditing = task !== undefined
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'todo')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (trimmedTitle.length === 0) {
      setValidationError('タイトルを入力してください')
      return
    }
    if (trimmedTitle.length > maxTitleLength) {
      setValidationError(`タイトルは${maxTitleLength}文字以内で入力してください`)
      return
    }
    setValidationError(null)
    setSubmitting(true)
    const succeeded = await onSubmit({ title: trimmedTitle, description, status })
    setSubmitting(false)
    if (succeeded && !isEditing) {
      setTitle('')
      setDescription('')
      setStatus('todo')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
    >
      <h2 className="text-lg font-semibold">{isEditing ? 'タスクを編集' : 'タスクを追加'}</h2>
      <label className="flex flex-col gap-1 text-sm">
        タイトル
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-800"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        説明
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-800"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        ステータス
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as TaskStatus)}
          className="rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-800"
        >
          {taskStatuses.map((value) => (
            <option key={value} value={value}>
              {taskStatusLabels[value]}
            </option>
          ))}
        </select>
      </label>
      {validationError && (
        <p role="alert" className="text-sm text-red-600">
          {validationError}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-foreground px-4 py-1.5 text-sm text-background disabled:opacity-50"
        >
          {isEditing ? '保存' : '追加'}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-zinc-300 px-4 py-1.5 text-sm dark:border-zinc-600"
          >
            キャンセル
          </button>
        )}
      </div>
    </form>
  )
}
