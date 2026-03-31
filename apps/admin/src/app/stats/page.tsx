'use client'

import { useEffect, useState } from 'react'

interface Stats {
  totalActivations: number
  totalUnlocks: number
  totalCompletions: number
  todayActivations: number
  todayUnlocks: number
}

const mockStats: Stats = {
  totalActivations: 1256,
  totalUnlocks: 3892,
  totalCompletions: 2156,
  todayActivations: 23,
  todayUnlocks: 89,
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats>(mockStats)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 实际从 API 获取
    // fetch('/api/admin/stats/overview')
  }, [])

  const statCards = [
    {
      label: '累计激活数',
      value: stats.totalActivations,
      today: stats.todayActivations,
      icon: '🎫',
      color: 'blue',
    },
    {
      label: '累计解锁次数',
      value: stats.totalUnlocks,
      today: stats.todayUnlocks,
      icon: '🔓',
      color: 'green',
    },
    {
      label: '累计完成测评',
      value: stats.totalCompletions,
      today: 0,
      icon: '✅',
      color: 'purple',
    },
  ]

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">数据概览</h1>
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <span className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${colorMap[card.color]}`}>
                {card.icon}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {card.value.toLocaleString()}
            </div>
            <div className="text-gray-500 text-sm">{card.label}</div>
            {card.today > 0 && (
              <div className="text-xs text-green-600 mt-2">
                今日 +{card.today}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 最近激活记录 */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-900">最近激活记录</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">兑换码</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">规格</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">设备</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">激活时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-6 py-4 text-sm font-mono text-gray-900">ABCD1234EFGH5678</td>
                <td className="px-6 py-4 text-sm text-gray-600">3次卡</td>
                <td className="px-6 py-4 text-sm text-gray-600 font-mono">a1b2c3d4...</td>
                <td className="px-6 py-4 text-sm text-gray-600">2026-03-31 23:45</td>
                <td className="px-6 py-4"><span className="badge badge-success">已激活</span></td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-mono text-gray-900">IJKL9012MNOP3456</td>
                <td className="px-6 py-4 text-sm text-gray-600">SVIP</td>
                <td className="px-6 py-4 text-sm text-gray-600 font-mono">e5f6g7h8...</td>
                <td className="px-6 py-4 text-sm text-gray-600">2026-03-31 23:30</td>
                <td className="px-6 py-4"><span className="badge badge-success">已激活</span></td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-mono text-gray-900">QRST7890UVWX1234</td>
                <td className="px-6 py-4 text-sm text-gray-600">1次卡</td>
                <td className="px-6 py-4 text-sm text-gray-600 font-mono">i9j0k1l2...</td>
                <td className="px-6 py-4 text-sm text-gray-600">2026-03-31 23:15</td>
                <td className="px-6 py-4"><span className="badge badge-success">已激活</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
