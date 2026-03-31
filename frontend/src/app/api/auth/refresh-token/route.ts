import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const REFRESH_TOKEN_COOKIE = 'refreshToken'
const BASE_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { refreshToken } = body

    if (!refreshToken) {
      return NextResponse.json({ success: false, message: 'Missing refreshToken' }, { status: 400 })
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...BASE_COOKIE_OPTIONS,
      maxAge: 30 * 24 * 60 * 60, // 30 days
    })
    return response
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(REFRESH_TOKEN_COOKIE, '', {
    ...BASE_COOKIE_OPTIONS,
    maxAge: 0,
  })
  return response
}

export async function GET() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value

  if (!refreshToken) {
    return NextResponse.json({ success: false, refreshToken: null }, { status: 404 })
  }

  return NextResponse.json({ success: true, refreshToken })
}
