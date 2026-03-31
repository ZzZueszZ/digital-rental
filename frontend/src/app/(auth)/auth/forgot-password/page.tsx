'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ArrowRight, KeyRound, Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Routers from '@/constants/routers'
import { authService } from '@/services/auth'

// Step 1: Email schema
const emailSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
})

// Step 2: New password schema
const resetSchema = z
  .object({
    newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  })

type EmailFormValues = z.infer<typeof emailSchema>
type ResetFormValues = z.infer<typeof resetSchema>

const OTP_LENGTH = 6
const COUNTDOWN_SECONDS = 60

// ── OTP Input Component ──────────────────────────────────────────
function OtpInput({
  value,
  onChange,
}: {
  value: string
  onChange: (val: string) => void
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, char: string) => {
    if (!/^\d?$/.test(char)) return
    const arr = value.split('')
    arr[index] = char
    const next = arr.join('').slice(0, OTP_LENGTH)
    onChange(next)
    if (char && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    onChange(pasted)
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1)
    inputRefs.current[focusIdx]?.focus()
  }

  return (
    <div className='flex gap-3 justify-center'>
      {Array.from({ length: OTP_LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el }}
          type='text'
          inputMode='numeric'
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className='w-12 h-14 rounded-xl border-2 border-white/10 bg-zinc-900/50 text-center text-xl font-bold text-white outline-none transition-all focus:border-[#ff8c5a] focus:bg-zinc-900 focus:ring-2 focus:ring-[#ff8c5a]/20'
        />
      ))}
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Step 1 form
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  })

  // Step 2 form
  const resetForm = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  // ── Countdown timer ──
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [countdown])

  // ── Step 1: send OTP ──
  const handleSendOtp = async (values: EmailFormValues) => {
    try {
      const res = await authService.forgotPassword({ email: values.email })
      if (res.data.success) {
        toast.success('Mã OTP đã được gửi đến email của bạn')
        setEmail(values.email)
        setStep(2)
        setCountdown(COUNTDOWN_SECONDS)
      } else {
        toast.error(res.data.message || 'Không thể gửi OTP')
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại')
    }
  }

  // ── Resend OTP ──
  const handleResendOtp = useCallback(async () => {
    if (countdown > 0) return
    try {
      const res = await authService.forgotPassword({ email })
      if (res.data.success) {
        toast.success('Đã gửi lại mã OTP')
        setCountdown(COUNTDOWN_SECONDS)
        setOtp('')
      } else {
        toast.error(res.data.message || 'Không thể gửi lại OTP')
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra')
    }
  }, [countdown, email])

  // ── Step 2: reset password ──
  const handleResetPassword = async (values: ResetFormValues) => {
    if (otp.length < OTP_LENGTH) {
      toast.error('Vui lòng nhập đầy đủ mã OTP')
      return
    }
    try {
      const res = await authService.resetPassword({
        email,
        otpCode: otp,
        newPassword: values.newPassword,
      })
      if (res.data.success) {
        toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.')
        router.push(Routers.LOGIN)
      } else {
        toast.error(res.data.message || 'Đặt lại mật khẩu thất bại')
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại')
    }
  }

  return (
    <div className='min-h-screen bg-[#0c0c0c] flex flex-col'>
      {/* Top Navigation */}
      <div className='p-6 flex items-center relative z-10'>
        <Link href={Routers.LOGIN}>
          <Button
            variant='outline'
            size='icon'
            className='rounded-full h-12 w-12 border-white/10 hover:bg-white/5 bg-transparent text-white focus-visible:ring-[#ff8c5a]'
          >
            <ChevronLeft className='h-6 w-6' />
          </Button>
        </Link>
      </div>

      <main className='flex-1 flex items-center px-4 pb-12'>
        <div className='max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center'>
          {/* ── Left: Hero ── */}
          <div className='hidden lg:flex flex-col items-start justify-center relative pl-8'>
            <div className='space-y-4 mb-8'>
              <h1 className='text-6xl font-bold tracking-tight text-white leading-[1.1]'>
                {step === 1 ? 'Quên mật khẩu?' : 'Đặt lại mật khẩu'}
              </h1>
              <p className='text-2xl text-zinc-400 font-medium'>
                {step === 1
                  ? 'Nhập email để nhận mã xác thực'
                  : 'Nhập mã OTP và mật khẩu mới'}
              </p>
            </div>
            <div className='relative w-full max-w-lg'>
              <Image
                src='/images/auth-login-hero.png'
                alt='Reset password illustration'
                width={600}
                height={500}
                className='w-full h-auto object-contain scale-110'
                priority
              />
            </div>
          </div>

          {/* ── Right: Form ── */}
          <div className='w-full max-w-md mx-auto lg:mx-0'>
            {step === 1 ? (
              /* ===== STEP 1: Enter Email ===== */
              <div>
                {/* Mobile heading */}
                <div className='lg:hidden space-y-4 mb-8 text-center'>
                  <h1 className='text-4xl font-bold tracking-tight text-white'>
                    Quên mật khẩu?
                  </h1>
                  <p className='text-lg text-zinc-400'>Nhập email để nhận mã xác thực OTP</p>
                </div>

                <form onSubmit={emailForm.handleSubmit(handleSendOtp)} className='space-y-6'>
                  <div className='space-y-2'>
                    <label className='text-base font-bold text-white'>Email</label>
                    <Input
                      placeholder='Nhập địa chỉ email của bạn'
                      type='email'
                      {...emailForm.register('email')}
                      className='h-14 bg-zinc-900/50 border-white/10 text-white rounded-xl focus-visible:bg-zinc-900 focus-visible:ring-1 focus-visible:ring-[#ff8c5a] text-base px-5'
                    />
                    {emailForm.formState.errors.email && (
                      <p className='text-sm text-red-500 font-medium'>
                        {emailForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type='submit'
                    className='w-full h-14 text-lg font-bold bg-[#ff8c5a] hover:bg-[#ff6b3a] text-black rounded-xl shadow-[0_0_15px_rgba(255,140,90,0.3)] transition-all active:scale-[0.98] gap-2'
                    disabled={emailForm.formState.isSubmitting}
                  >
                    {emailForm.formState.isSubmitting ? (
                      'Đang gửi...'
                    ) : (
                      <>
                        Gửi mã OTP
                        <ArrowRight className='w-5 h-5' />
                      </>
                    )}
                  </Button>
                </form>

                <p className='mt-10 text-center text-base font-medium text-zinc-400'>
                  Nhớ mật khẩu?{' '}
                  <Link
                    href={Routers.LOGIN}
                    className='text-white border-b-2 border-white font-bold hover:text-[#ff8c5a] hover:border-[#ff8c5a] transition-all pb-0.5 ml-1'
                  >
                    Đăng nhập
                  </Link>
                </p>
              </div>
            ) : (
              /* ===== STEP 2: OTP + New Password ===== */
              <div>
                {/* Mobile heading */}
                <div className='lg:hidden space-y-4 mb-8 text-center'>
                  <h1 className='text-4xl font-bold tracking-tight text-white'>
                    Đặt lại mật khẩu
                  </h1>
                </div>

                {/* OTP info */}
                <div className='mb-8'>
                  <h2 className='text-2xl font-bold text-white hidden lg:block'>
                    Chúng tôi đã gửi mã OTP
                  </h2>
                  <p className='text-sm text-zinc-400 mt-2'>
                    Nhập mã xác thực đã gửi đến{' '}
                    <span className='font-bold text-zinc-200'>{email}</span>
                    <button
                      onClick={() => { setStep(1); setOtp('') }}
                      className='text-[#ff8c5a] font-bold ml-2 hover:underline underline-offset-4'
                    >
                      Sửa
                    </button>
                  </p>
                </div>

                <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className='space-y-6'>
                  {/* OTP Boxes */}
                  <div className='space-y-3'>
                    <OtpInput value={otp} onChange={setOtp} />

                    {/* Resend row */}
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-zinc-500'>
                        Không nhận được mã?{' '}
                        <button
                          type='button'
                          onClick={handleResendOtp}
                          disabled={countdown > 0}
                          className={`font-bold underline underline-offset-4 transition-colors ${
                            countdown > 0
                              ? 'text-zinc-700 cursor-not-allowed'
                              : 'text-white hover:text-[#ff8c5a]'
                          }`}
                        >
                          Gửi lại
                        </button>
                      </span>
                      {countdown > 0 && (
                        <span className='flex items-center gap-1.5 text-zinc-500 tabular-nums'>
                          <span className='w-2 h-2 rounded-full bg-zinc-700 animate-pulse' />
                          {countdown}s
                        </span>
                      )}
                    </div>
                  </div>

                  {/* New password */}
                  <div className='space-y-2'>
                    <label className='text-base font-bold text-white'>Mật khẩu mới</label>
                    <div className='relative'>
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder='Tối thiểu 6 ký tự'
                        {...resetForm.register('newPassword')}
                        className='h-14 bg-zinc-900/50 border-white/10 text-white rounded-xl focus-visible:bg-zinc-900 focus-visible:ring-1 focus-visible:ring-[#ff8c5a] text-base px-5 pr-12'
                      />
                      <button
                        type='button'
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className='absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition'
                      >
                        {showNewPassword ? <EyeOff className='size-5' /> : <Eye className='size-5' />}
                      </button>
                    </div>
                    {resetForm.formState.errors.newPassword && (
                      <p className='text-sm text-red-500 font-medium'>
                        {resetForm.formState.errors.newPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div className='space-y-2'>
                    <label className='text-base font-bold text-white'>Xác nhận mật khẩu</label>
                    <div className='relative'>
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder='Nhập lại mật khẩu mới'
                        {...resetForm.register('confirmPassword')}
                        className='h-14 bg-zinc-900/50 border-white/10 text-white rounded-xl focus-visible:bg-zinc-900 focus-visible:ring-1 focus-visible:ring-[#ff8c5a] text-base px-5 pr-12'
                      />
                      <button
                        type='button'
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className='absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition'
                      >
                        {showConfirmPassword ? <EyeOff className='size-5' /> : <Eye className='size-5' />}
                      </button>
                    </div>
                    {resetForm.formState.errors.confirmPassword && (
                      <p className='text-sm text-red-500 font-medium'>
                        {resetForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <Button
                    type='submit'
                    className='w-full h-14 text-lg font-bold bg-[#ff8c5a] hover:bg-[#ff6b3a] text-black rounded-xl shadow-[0_0_15px_rgba(255,140,90,0.3)] transition-all active:scale-[0.98] gap-2'
                    disabled={resetForm.formState.isSubmitting}
                  >
                    {resetForm.formState.isSubmitting ? (
                      'Đang xử lý...'
                    ) : (
                      <>
                        <KeyRound className='w-5 h-5' />
                        Đặt lại mật khẩu
                      </>
                    )}
                  </Button>
                </form>

                <p className='mt-10 text-center text-base font-medium text-zinc-400'>
                  Nhớ mật khẩu?{' '}
                  <Link
                    href={Routers.LOGIN}
                    className='text-white border-b-2 border-white font-bold hover:text-[#ff8c5a] hover:border-[#ff8c5a] transition-all pb-0.5 ml-1'
                  >
                    Đăng nhập
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
