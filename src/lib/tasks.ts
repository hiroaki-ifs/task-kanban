import { supabase } from '@/lib/supabase'
import type { Task, TaskInput } from '@/types/task'

// DB の status 列は text 型のため、check 制約で保証されている値として Task に変換する
const toTask = (row: { status: string } & Omit<Task, 'status'>): Task => ({
  ...row,
  status: row.status as Task['status'],
})

export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return data.map(toTask)
}

export async function createTask(input: TaskInput): Promise<Task> {
  const { data, error } = await supabase.from('tasks').insert(input).select().single()
  if (error) throw new Error(error.message)
  return toTask(data)
}

export async function updateTask(id: string, input: TaskInput): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return toTask(data)
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
