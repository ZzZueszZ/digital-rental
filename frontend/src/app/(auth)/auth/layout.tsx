export default function AuthInnerLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <section className='w-full'>{children}</section>
}
