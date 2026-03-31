import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from './components/Sidebar'

export const metadata: Metadata = {
  title: '见微心理 - 管理后台',
  description: '见微心理管理后台',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-100">
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-64">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
