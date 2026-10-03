import type { Database } from '@/types/database'

export type TaskStatus = 'todo' | 'doing' | 'done'

export type Task = Omit<Database['public']['Tables']['tasks']['Row'], 'status'> & {
  status: TaskStatus
}

export type TaskInput = {
  title: string
  description: string
  status: TaskStatus
}

export const taskStatuses: readonly TaskStatus[] = ['todo', 'doing', 'done']

export const taskStatusLabels: Record<TaskStatus, string> = {
  todo: '未着手',
  doing: '進行中',
  done: '完了',
}

export const maxTitleLength = 100
