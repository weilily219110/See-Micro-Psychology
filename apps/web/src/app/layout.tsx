import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '见微心理 - 探索心灵，见微知著',
  description: '付费解锁制心理测评平台',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  )
}
