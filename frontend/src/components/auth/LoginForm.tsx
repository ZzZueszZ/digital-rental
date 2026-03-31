'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Eye, EyeOff, Mail } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { loginSchema, type LoginRequest, type LoginResponse } from '@/schemas/auth/login'
import { authService } from '@/services/auth'
import { useAuthStore } from '@/store/auth'
import { persistRefreshTokenCookie } from '@/lib/refresh-token-client'
import { AUTH_ME_QUERY_KEY } from '@/constants/query-keys'
import Routers from '@/constants/routers'
import { getValidRedirectUrl } from '@/lib/utils'
import { Role } from '@/constants/enum/role'

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)
  const [isResendingActivation, setIsResendingActivation] = useState(false)

  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const setAccessToken = useAuthStore((state) => state.setAccessToken)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const handleResendActivation = async () => {
    if (!pendingEmail) return
    setIsResendingActivation(true)
    try {
      const res = await authService.resendActivation({ email: pendingEmail })
      if (res.data.success) {
        toast.success('Email kích hoạt đã được gửi lại. Vui lòng kiểm tra hộp thư.')
      } else {
        toast.error(res.data.message || 'Không thể gửi lại email kích hoạt')
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setIsResendingActivation(false)
    }
  }

  const onSubmit = async (values: LoginRequest) => {
    setPendingEmail(null)
    try {
      const { data } = await authService.login(values)
      const payload = data.data as LoginResponse

      await persistRefreshTokenCookie(payload.refreshToken)
      setAccessToken(payload.accessToken)
      queryClient.setQueryData(AUTH_ME_QUERY_KEY, payload.user)

      toast.success(data.message || 'Đăng nhập thành công')

      const redirectUrl = getValidRedirectUrl(searchParams)
      if (redirectUrl) {
        window.location.href = redirectUrl
        return
      }

      const roles = payload.user.roles ?? []
      if (roles.includes(Role.SUPER_ADMIN) || roles.includes(Role.ADMIN)) {
        window.location.href = Routers.ADMIN
      } else if (roles.includes(Role.STAFF)) {
        window.location.href = Routers.STAFF
      } else {
        window.location.href = Routers.HOME
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string }; status?: number }; message?: string }
      const message =
        err?.response?.data?.message || err?.message || 'Đăng nhập thất bại, thử lại'
      const statusCode = err?.response?.status

      // Check for PENDING account (403 or message contains activation-related text)
      if (
        statusCode === 403 ||
        message.toLowerCase().includes('chưa kích hoạt') ||
        message.toLowerCase().includes('pending') ||
        message.toLowerCase().includes('activate')
      ) {
        setPendingEmail(values.email)
      }

      toast.error(message)
    }
  }

  return (
    <div className='w-full max-w-md mx-auto lg:mx-0'>
      {/* Pending Activation Banner */}
      {pendingEmail && (
        <div className='mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl'>
          <div className='flex items-start gap-3'>
            <Mail className='w-5 h-5 text-amber-600 shrink-0 mt-0.5' />
            <div className='flex-1'>
              <p className='text-sm font-semibold text-amber-900'>
                Tài khoản chưa được kích hoạt
              </p>
              <p className='text-xs text-amber-700 mt-1'>
                Vui lòng kiểm tra email <span className='font-bold'>{pendingEmail}</span> để kích hoạt tài khoản.
              </p>
              <button
                onClick={handleResendActivation}
                disabled={isResendingActivation}
                className='mt-2 text-sm font-bold text-amber-800 hover:text-amber-900 underline underline-offset-4 transition-colors disabled:opacity-50'
              >
                {isResendingActivation ? 'Đang gửi...' : 'Gửi lại email kích hoạt'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header for Mobile only */}
      <div className='lg:hidden space-y-4 mb-8 text-center'>
        <h1 className='text-4xl font-bold tracking-tight text-slate-900'>Chào Mừng Trở Lại</h1>
        <p className='text-lg text-slate-500'>Đăng nhập vào tài khoản của bạn</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        <div className='space-y-2'>
          <label className='text-base font-bold text-slate-900'>Email</label>
          <Input
            placeholder='Nhập địa chỉ email của bạn'
            type='email'
            {...register('email')}
            className='h-14 bg-slate-100/80 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-slate-200 text-base px-5'
          />
          {errors.email && (
            <p className='text-sm text-red-500 font-medium'>{errors.email.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <label className='text-base font-bold text-slate-900'>Mật khẩu</label>
          <div className='relative'>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder='Nhập mật khẩu của bạn'
              {...register('password')}
              className='h-14 bg-slate-100/80 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-slate-200 text-base px-5 pr-12'
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition'
            >
              {showPassword ? <EyeOff className='size-5' /> : <Eye className='size-5' />}
            </button>
          </div>
          {errors.password && (
            <p className='text-sm text-red-500 font-medium'>{errors.password.message}</p>
          )}
        </div>

        <div className='flex justify-end -mt-1'>
          <Link
            href={Routers.FORGOT_PASSWORD}
            className='text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors'
          >
            Quên mật khẩu?
          </Link>
        </div>

        <Button
          type='submit'
          className='w-full h-14 text-lg font-bold bg-slate-900 hover:bg-black text-white rounded-xl shadow-lg transition-all active:scale-[0.98]'
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>

      {/* Divider */}
      <div className='relative my-10 text-center'>
        <div className='absolute inset-0 flex items-center'>
          <div className='w-full border-t border-slate-200'></div>
        </div>
        <span className='relative bg-white px-4 text-sm font-medium text-slate-400 uppercase tracking-widest'>
          Hoặc
        </span>
      </div>

      {/* Social Login */}
      <div className='space-y-4'>
        <Button
          variant='outline'
          className='w-full h-14 justify-center gap-3 rounded-xl border-slate-200 text-slate-900 font-bold hover:bg-slate-50 transition-all'
        >
          <Image
            src='https://www.svgrepo.com/show/475656/google-color.svg'
            width={20}
            height={20}
            alt='Google'
          />
          Tiếp tục với Google
        </Button>
        <Button className='w-full h-14 justify-center gap-3 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold transition-all shadow-md'>
          <svg className='w-5 h-5 fill-current' viewBox='0 0 24 24'>
            <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
          </svg>
          Tiếp tục với Facebook
        </Button>
      </div>

      <p className='mt-10 text-center text-base font-medium text-slate-500'>
        Chưa có tài khoản?{' '}
        <Link
          href={Routers.REGISTER}
          className='text-slate-900 border-b-2 border-slate-900 font-bold hover:text-black hover:border-black transition-all pb-0.5 ml-1'
        >
          Đăng ký ngay
        </Link>
      </p>
    </div>
  )
}
