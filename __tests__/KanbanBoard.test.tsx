import { beforeEach, describe, expect, test, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import KanbanBoard from '@/components/KanbanBoard'
import { createTask, deleteTask, fetchTasks, updateTask } from '@/lib/tasks'
import type { Task } from '@/types/task'

vi.mock('@/lib/tasks')

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  title: '買い物',
  description: '牛乳を買う',
  status: 'todo',
  created_at: '2026-10-04T00:00:00Z',
  ...overrides,
})

const column = (name: string) => screen.getByRole('region', { name })

const renderBoard = async (tasks: Task[] = []) => {
  vi.mocked(fetchTasks).mockResolvedValue(tasks)
  const user = userEvent.setup()
  render(<KanbanBoard />)
  await screen.findByRole('region', { name: '未着手' })
  return user
}

const fillTitle = async (user: ReturnType<typeof userEvent.setup>, title: string) => {
  const input = screen.getByLabelText('タイトル')
  await user.clear(input)
  if (title) {
    await user.click(input)
    await user.paste(title)
  }
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.spyOn(window, 'confirm').mockReturnValue(true)
})

describe('一覧表示', () => {
  test('タスクがあるとき、ステータスごとの列にタイトルと説明が表示される', async () => {
    await renderBoard([
      makeTask({ id: '1', title: 'タスクA', description: '説明A', status: 'todo' }),
      makeTask({ id: '2', title: 'タスクB', status: 'doing' }),
      makeTask({ id: '3', title: 'タスクC', status: 'done' }),
    ])

    expect(within(column('未着手')).getByText('タスクA')).toBeDefined()
    expect(within(column('未着手')).getByText('説明A')).toBeDefined()
    expect(within(column('進行中')).getByText('タスクB')).toBeDefined()
    expect(within(column('完了')).getByText('タスクC')).toBeDefined()
  })

  test('タスクが 0 件のとき、各列に「タスクがありません」と表示される', async () => {
    await renderBoard([])

    expect(within(column('未着手')).getByText('タスクがありません')).toBeDefined()
    expect(within(column('進行中')).getByText('タスクがありません')).toBeDefined()
    expect(within(column('完了')).getByText('タスクがありません')).toBeDefined()
  })

  test('取得に失敗したとき、エラーメッセージが表示される', async () => {
    vi.mocked(fetchTasks).mockRejectedValue(new Error('network'))
    render(<KanbanBoard />)

    expect((await screen.findByRole('alert')).textContent).toContain('タスクの取得に失敗しました')
  })
})

describe('追加', () => {
  test('タイトルと説明とステータスを入力して追加すると、再取得せず即座に該当の列に表示される', async () => {
    const user = await renderBoard([])
    vi.mocked(createTask).mockResolvedValue(
      makeTask({ id: 'new', title: '新規タスク', description: '詳細', status: 'doing' }),
    )

    await fillTitle(user, '新規タスク')
    await user.type(screen.getByLabelText('説明'), '詳細')
    await user.selectOptions(screen.getByLabelText('ステータス'), '進行中')
    await user.click(screen.getByRole('button', { name: '追加' }))

    expect(await within(column('進行中')).findByText('新規タスク')).toBeDefined()
    expect(createTask).toHaveBeenCalledWith({
      title: '新規タスク',
      description: '詳細',
      status: 'doing',
    })
    expect(fetchTasks).toHaveBeenCalledTimes(1)
  })

  test('追加に成功すると、入力フォームが空に戻る', async () => {
    const user = await renderBoard([])
    vi.mocked(createTask).mockResolvedValue(makeTask({ title: '新規タスク' }))

    await fillTitle(user, '新規タスク')
    await user.click(screen.getByRole('button', { name: '追加' }))
    await screen.findByText('新規タスク')

    expect((screen.getByLabelText('タイトル') as HTMLInputElement).value).toBe('')
  })

  test.each([
    ['空', ''],
    ['空白のみ', '   '],
  ])('タイトルが%sのとき、エラーを表示し追加しない', async (_label, title) => {
    const user = await renderBoard([])

    if (title) await user.type(screen.getByLabelText('タイトル'), title)
    await user.click(screen.getByRole('button', { name: '追加' }))

    expect((await screen.findByRole('alert')).textContent).toContain('タイトルを入力してください')
    expect(createTask).not.toHaveBeenCalled()
  })

  test('タイトルがちょうど 100 文字のとき、追加できる', async () => {
    const user = await renderBoard([])
    const title = 'あ'.repeat(100)
    vi.mocked(createTask).mockResolvedValue(makeTask({ title }))

    await fillTitle(user, title)
    await user.click(screen.getByRole('button', { name: '追加' }))

    expect(await screen.findByText(title)).toBeDefined()
    expect(createTask).toHaveBeenCalledTimes(1)
  })

  test('タイトルが 101 文字のとき、エラーを表示し追加しない', async () => {
    const user = await renderBoard([])

    await fillTitle(user, 'あ'.repeat(101))
    await user.click(screen.getByRole('button', { name: '追加' }))

    expect((await screen.findByRole('alert')).textContent).toContain(
      'タイトルは100文字以内で入力してください',
    )
    expect(createTask).not.toHaveBeenCalled()
  })

  test('追加に失敗したとき、エラーを表示し一覧は変わらない', async () => {
    const user = await renderBoard([makeTask({ title: '既存タスク' })])
    vi.mocked(createTask).mockRejectedValue(new Error('network'))

    await fillTitle(user, '失敗するタスク')
    await user.click(screen.getByRole('button', { name: '追加' }))

    expect((await screen.findByRole('alert')).textContent).toContain('タスクの追加に失敗しました')
    expect(screen.queryByText('失敗するタスク', { selector: 'h3' })).toBeNull()
    expect(screen.getByText('既存タスク')).toBeDefined()
  })
})

describe('編集', () => {
  test('編集して保存すると、再取得せず即座に新しい内容と列で表示される', async () => {
    const user = await renderBoard([makeTask({ title: '買い物', status: 'todo' })])
    vi.mocked(updateTask).mockResolvedValue(makeTask({ title: '買い物（更新）', status: 'done' }))

    await user.click(screen.getByRole('button', { name: '買い物を編集' }))
    await fillTitle(user, '買い物（更新）')
    await user.selectOptions(screen.getByLabelText('ステータス'), '完了')
    await user.click(screen.getByRole('button', { name: '保存' }))

    expect(await within(column('完了')).findByText('買い物（更新）')).toBeDefined()
    expect(within(column('未着手')).queryByText('買い物')).toBeNull()
    expect(updateTask).toHaveBeenCalledWith('task-1', {
      title: '買い物（更新）',
      description: '牛乳を買う',
      status: 'done',
    })
    expect(fetchTasks).toHaveBeenCalledTimes(1)
  })

  test('編集ボタンを押すと、既存の内容が入力済みの編集フォームに切り替わる（順方向）', async () => {
    const user = await renderBoard([makeTask()])

    await user.click(screen.getByRole('button', { name: '買い物を編集' }))

    expect((screen.getByLabelText('タイトル') as HTMLInputElement).value).toBe('買い物')
    expect((screen.getByLabelText('説明') as HTMLTextAreaElement).value).toBe('牛乳を買う')
    expect(screen.getByRole('button', { name: '保存' })).toBeDefined()
    expect(screen.queryByRole('button', { name: '追加' })).toBeNull()
  })

  test('編集をキャンセルすると、内容は変わらず追加フォームに戻る（逆方向）', async () => {
    const user = await renderBoard([makeTask()])

    await user.click(screen.getByRole('button', { name: '買い物を編集' }))
    await fillTitle(user, '変更するはずだった')
    await user.click(screen.getByRole('button', { name: 'キャンセル' }))

    expect(updateTask).not.toHaveBeenCalled()
    expect(screen.getByText('買い物')).toBeDefined()
    expect(screen.getByRole('button', { name: '追加' })).toBeDefined()
    expect(screen.queryByRole('button', { name: '保存' })).toBeNull()
  })

  test('編集でタイトルを空にして保存すると、エラーを表示し更新しない', async () => {
    const user = await renderBoard([makeTask()])

    await user.click(screen.getByRole('button', { name: '買い物を編集' }))
    await fillTitle(user, '')
    await user.click(screen.getByRole('button', { name: '保存' }))

    expect((await screen.findByRole('alert')).textContent).toContain('タイトルを入力してください')
    expect(updateTask).not.toHaveBeenCalled()
  })

  test('更新に失敗したとき、エラーを表示し一覧の内容は変わらない', async () => {
    const user = await renderBoard([makeTask()])
    vi.mocked(updateTask).mockRejectedValue(new Error('network'))

    await user.click(screen.getByRole('button', { name: '買い物を編集' }))
    await fillTitle(user, '更新するはずだった')
    await user.click(screen.getByRole('button', { name: '保存' }))

    expect((await screen.findByRole('alert')).textContent).toContain('タスクの更新に失敗しました')
    expect(within(column('未着手')).getByText('買い物')).toBeDefined()
  })
})

describe('削除', () => {
  test('削除ボタンを押すと確認ダイアログが表示され、OK を選ぶと再取得せず即座に一覧から消える', async () => {
    const user = await renderBoard([makeTask({ title: '買い物' })])
    vi.mocked(deleteTask).mockResolvedValue(undefined)

    await user.click(screen.getByRole('button', { name: '買い物を削除' }))

    expect(window.confirm).toHaveBeenCalledTimes(1)
    expect(deleteTask).toHaveBeenCalledWith('task-1')
    expect(await within(column('未着手')).findByText('タスクがありません')).toBeDefined()
    expect(screen.queryByText('買い物')).toBeNull()
    expect(fetchTasks).toHaveBeenCalledTimes(1)
  })

  test('確認ダイアログでキャンセルすると、削除されず API も呼ばれない', async () => {
    vi.mocked(window.confirm).mockReturnValue(false)
    const user = await renderBoard([makeTask({ title: '買い物' })])

    await user.click(screen.getByRole('button', { name: '買い物を削除' }))

    expect(window.confirm).toHaveBeenCalledTimes(1)
    expect(deleteTask).not.toHaveBeenCalled()
    expect(screen.getByText('買い物')).toBeDefined()
  })

  test('削除に失敗したとき、エラーを表示しタスクは一覧に残る', async () => {
    const user = await renderBoard([makeTask({ title: '買い物' })])
    vi.mocked(deleteTask).mockRejectedValue(new Error('network'))

    await user.click(screen.getByRole('button', { name: '買い物を削除' }))

    expect((await screen.findByRole('alert')).textContent).toContain('タスクの削除に失敗しました')
    expect(screen.getByText('買い物')).toBeDefined()
  })

  test('編集中のタスクを削除すると、編集フォームが追加フォームに戻る', async () => {
    const user = await renderBoard([makeTask({ title: '買い物' })])
    vi.mocked(deleteTask).mockResolvedValue(undefined)

    await user.click(screen.getByRole('button', { name: '買い物を編集' }))
    await user.click(screen.getByRole('button', { name: '買い物を削除' }))

    expect(await screen.findByRole('button', { name: '追加' })).toBeDefined()
    expect(screen.queryByRole('button', { name: '保存' })).toBeNull()
  })
})
