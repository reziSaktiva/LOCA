function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export const env = {
  supabase: {
    url: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    publishableKey: requireEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
  },
  database: {
    url: requireEnv('DATABASE_URL'),
  },
} as const
