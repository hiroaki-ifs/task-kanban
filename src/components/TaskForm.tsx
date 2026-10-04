'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
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
    <Card>
      <CardHeader>
        <h2 className="text-base font-semibold">{isEditing ? 'タスクを編集' : 'タスクを追加'}</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-title">タイトル</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              aria-invalid={validationError !== null}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-description">説明</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-status">ステータス</Label>
            <NativeSelect
              id="task-status"
              value={status}
              onChange={(event) => setStatus(event.target.value as TaskStatus)}
            >
              {taskStatuses.map((value) => (
                <NativeSelectOption key={value} value={value}>
                  {taskStatusLabels[value]}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
          {validationError && (
            <p role="alert" className="text-sm text-destructive">
              {validationError}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="submit" disabled={submitting}>
              {isEditing ? '保存' : '追加'}
            </Button>
            {isEditing && (
              <Button type="button" variant="outline" onClick={onCancel}>
                キャンセル
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
