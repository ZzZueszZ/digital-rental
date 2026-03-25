import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-slate-50 text-center px-4'>
      <h1 className='text-9xl font-black text-gray-200'>404</h1>
      <p className='text-2xl font-bold text-gray-800 mt-4 md:text-3xl'>
        Oops! Không tìm thấy trang.
      </p>
      <p className='max-w-md mt-4 text-muted-foreground'>
        Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng.
      </p>
      <div className='mt-8'>
        <Link href='/'>
          <Button size='lg'>Về Trang chủ</Button>
        </Link>
      </div>
    </div>
  )
}
