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

export const removeRefreshTokenCookie = async () => {
  if (typeof window === 'undefined') return

  await fetch('/api/auth/refresh-token', { method: 'DELETE', credentials: 'same-origin' })
}
