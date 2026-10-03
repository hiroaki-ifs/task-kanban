export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabasePublishableKey) {
    console.log('[Supabase] 未接続: 環境変数が未設定です (.env.local を確認してください)')
    return
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/health`, {
      headers: { apikey: supabasePublishableKey },
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) {
      console.log(`[Supabase] 接続失敗: HTTP ${response.status} (${supabaseUrl})`)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.log(`[Supabase] 接続失敗: ${message}`)
  }
}
