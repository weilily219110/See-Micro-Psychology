'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { href: '/stats', label: '数据概览', icon: '📊' },
  { href: '/codes', label: '兑换码管理', icon: '🎫' },
  { href: '/quizzes', label: '测评管理', icon: '📝' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">见微心理</h1>
        <p className="text-sm text-gray-400 mt-1">管理后台</p>
      </div>
      
      <nav className="p-4">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
        <div className="text-sm text-gray-400">
          <div>Admin</div>
          <button className="text-gray-400 hover:text-white mt-2 text-sm">
            退出登录
          </button>
        </div>
      </div>
    </aside>
  )
}
