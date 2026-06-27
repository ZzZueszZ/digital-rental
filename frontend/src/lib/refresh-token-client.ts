export const persistRefreshTokenCookie = async (refreshToken: string) => {
  if (typeof window === 'undefined') return

  const response = await fetch('/api/auth/refresh-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
    credentials: 'same-origin',
  })

  if (!response.ok) {
    throw new Error('Failed to store refresh token')
  }
}

export const getRefreshTokenCookie = async () => {
  if (typeof window === 'undefined') return null

  const response = await fetch('/api/auth/refresh-token', {
    method: 'GET',
    credentials: 'same-origin',
  })

  if (!response.ok) return null

  const data = (await response.json()) as {
    success?: boolean
    refreshToken?: string | null
  }

  return data.success ? data.refreshToken ?? null : null
}

export const removeRefreshTokenCookie = async () => {
  if (typeof window === 'undefined') return

  await fetch('/api/auth/refresh-token', { method: 'DELETE', credentials: 'same-origin' })
}
