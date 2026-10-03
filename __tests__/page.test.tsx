import { expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Page from '@/app/page'
import { fetchTasks } from '@/lib/tasks'

vi.mock('@/lib/tasks')

test('Page renders the heading', async () => {
  vi.mocked(fetchTasks).mockResolvedValue([])
  render(<Page />)
  expect(screen.getByRole('heading', { level: 1 })).toBeDefined()
  await screen.findByRole('region', { name: '未着手' })
})
