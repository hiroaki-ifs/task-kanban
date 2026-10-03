import { beforeEach, describe, expect, test, vi } from 'vitest'
import { createTask, deleteTask, fetchTasks, updateTask } from '@/lib/tasks'
import type { Task } from '@/types/task'

type QueryResult = { data: unknown; error: { message: string } | null }

const { from, builder } = vi.hoisted(() => {
  const builder = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    single: vi.fn(),
    result: { data: null, error: null } as QueryResult,
    then(resolve: (value: QueryResult) => unknown) {
      return Promise.resolve(builder.result).then(resolve)
    },
  }
  return { from: vi.fn(), builder }
})

vi.mock('@/lib/supabase', () => ({ supabase: { from } }))

const sampleTask: Task = {
  id: 'task-1',
  title: '買い物',
  description: '牛乳を買う',
  status: 'todo',
  created_at: '2026-10-04T00:00:00Z',
}

const setResult = (result: QueryResult) => {
  builder.result = result
}

beforeEach(() => {
  vi.clearAllMocks()
  from.mockReturnValue(builder)
  for (const method of ['select', 'insert', 'update', 'delete', 'eq', 'order', 'single'] as const) {
    builder[method].mockReturnValue(builder)
  }
  setResult({ data: null, error: null })
})

describe('fetchTasks', () => {
  test('タスクがあるとき、作成日時の昇順で取得したタスク一覧を返す', async () => {
    setResult({ data: [sampleTask], error: null })

    const tasks = await fetchTasks()

    expect(from).toHaveBeenCalledWith('tasks')
    expect(builder.order).toHaveBeenCalledWith('created_at', { ascending: true })
    expect(tasks).toEqual([sampleTask])
  })

  test('タスクが 0 件のとき、空配列を返す', async () => {
    setResult({ data: [], error: null })

    expect(await fetchTasks()).toEqual([])
  })

  test('Supabase がエラーを返したとき、エラーを throw する', async () => {
    setResult({ data: null, error: { message: '取得に失敗' } })

    await expect(fetchTasks()).rejects.toThrow('取得に失敗')
  })
})

describe('createTask', () => {
  const input = { title: '買い物', description: '牛乳を買う', status: 'todo' as const }

  test('入力を insert し、作成されたタスクを返す', async () => {
    setResult({ data: sampleTask, error: null })

    const task = await createTask(input)

    expect(from).toHaveBeenCalledWith('tasks')
    expect(builder.insert).toHaveBeenCalledWith(input)
    expect(task).toEqual(sampleTask)
  })

  test('Supabase がエラーを返したとき、エラーを throw する', async () => {
    setResult({ data: null, error: { message: '追加に失敗' } })

    await expect(createTask(input)).rejects.toThrow('追加に失敗')
  })
})

describe('updateTask', () => {
  const input = { title: '更新後', description: '', status: 'doing' as const }

  test('指定 id のタスクを update し、更新後のタスクを返す', async () => {
    const updated = { ...sampleTask, ...input }
    setResult({ data: updated, error: null })

    const task = await updateTask('task-1', input)

    expect(builder.update).toHaveBeenCalledWith(input)
    expect(builder.eq).toHaveBeenCalledWith('id', 'task-1')
    expect(task).toEqual(updated)
  })

  test('Supabase がエラーを返したとき、エラーを throw する', async () => {
    setResult({ data: null, error: { message: '更新に失敗' } })

    await expect(updateTask('task-1', input)).rejects.toThrow('更新に失敗')
  })
})

describe('deleteTask', () => {
  test('指定 id のタスクを delete する', async () => {
    await deleteTask('task-1')

    expect(from).toHaveBeenCalledWith('tasks')
    expect(builder.delete).toHaveBeenCalled()
    expect(builder.eq).toHaveBeenCalledWith('id', 'task-1')
  })

  test('Supabase がエラーを返したとき、エラーを throw する', async () => {
    setResult({ data: null, error: { message: '削除に失敗' } })

    await expect(deleteTask('task-1')).rejects.toThrow('削除に失敗')
  })
})
