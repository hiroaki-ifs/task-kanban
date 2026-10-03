import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    // threads pool timed out on startup in this environment; forks works
    pool: 'forks',
    setupFiles: ['./vitest.setup.ts'],
    // src/lib/supabase.ts は環境変数が無いと import 時に throw するためダミー値を設定
    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'test-publishable-key',
    },
  },
})
