import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// globals を有効にしていないため、テストごとの DOM 破棄を明示する（テスト間の独立性のため）
afterEach(() => {
  cleanup()
})
