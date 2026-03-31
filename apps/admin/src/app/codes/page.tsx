'use client'

import { useEffect, useState } from 'react'

interface Code {
  code: string
  spec: number
  isSvip: boolean
  status: number
  deviceId: string | null
  activatedAt: string | null
  createdAt: string
}

const mockCodes: Code[] = [
  { code: 'ABCD1234EFGH5678', spec: 3, isSvip: false, status: 1, deviceId: 'a1b2c3d4e5f6', activatedAt: '2026-03-31 23:45:00', createdAt: '2026-03-30 10:00:00' },
  { code: 'IJKL9012MNOP3456', spec: 99, isSvip: true, status: 1, deviceId: 'e5f6g7h8i9j0', activatedAt: '2026-03-31 23:30:00', createdAt: '2026-03-30 10:00:00' },
  { code: 'QRST7890UVWX1234', spec: 1, isSvip: false, status: 1, deviceId: 'i9j0k1l2m3n4', activatedAt: '2026-03-31 23:15:00', createdAt: '2026-03-30 10:00:00' },
  { code: 'YZAB5678CDEF9012', spec: 5, isSvip: false, status: 0, deviceId: null, activatedAt: null, createdAt: '2026-03-30 10:00:00' },
  { code: 'GHIJ3456KLMN7890', spec: 3, isSvip: false, status: 2, deviceId: 'k1l2m3n4o5p6', activatedAt: '2026-03-29 15:20:00', createdAt: '2026-03-28 10:00:00' },
]

const specMap: Record<number, { label: string; className: string }> = {
  1: { label: '1次卡', className: 'badge-info' },
  3: { label: '3次卡', className: 'badge-info' },
  5: { label: '5次卡', className: 'badge-info' },
  99: { label: 'SVIP', className: 'badge-success' },
}

const statusMap: Record<number, { label: string; className: string }> = {
  0: { label: '未激活', className: 'badge-warning' },
  1: { label: '已激活', className: 'badge-success' },
  2: { label: '已作废', className: 'badge-error' },
}

export default function CodesPage() {
  const [codes, setCodes] = useState<Code[]>(mockCodes)
  const [filter, setFilter] = useState<'all' | '0' | '1' | '2'>('all')
  const [showGenerate, setShowGenerate] = useState(false)
  const [generateSpec, setGenerateSpec] = useState(1)
  const [generateCount, setGenerateCount] = useState(10)
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const filteredCodes = filter === 'all' 
    ? codes 
    : codes.filter(c => c.status === parseInt(filter))

  const handleGenerate = async () => {
    setLoading(true)
    // 模拟生成
    await new Promise(resolve => setTimeout(resolve, 1000))
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const newCodes: string[] = []
    for (let i = 0; i < generateCount; i++) {
      let code = ''
      for (let j = 0; j < 16; j++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      newCodes.push(code)
    }
    setGeneratedCodes(newCodes)
    setLoading(false)
  }

  const handleInvalidate = async (code: string) => {
    if (!confirm('确定要作废此兑换码？')) return
    setCodes(prev => prev.map(c => 
      c.code === code ? { ...c, status: 2 } : c
    ))
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">兑换码管理</h1>
        <button
          onClick={() => setShowGenerate(true)}
          className="btn-primary"
        >
          生成兑换码
        </button>
      </div>

      {/* 筛选 */}
      <div className="flex gap-2 mb-6">
        {[
          { value: 'all', label: '全部' },
          { value: '0', label: '未激活' },
          { value: '1', label: '已激活' },
          { value: '2', label: '已作废' },
        ].map((item) => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value as typeof filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === item.value
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 表格 */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">兑换码</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">规格</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">设备ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">激活时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">创建时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCodes.map((code) => (
                <tr key={code.code} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">{code.code}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${specMap[code.spec]?.className}`}>
                      {specMap[code.spec]?.label || code.spec}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${statusMap[code.status]?.className}`}>
                      {statusMap[code.status]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">
                    {code.deviceId ? `${code.deviceId.slice(0, 8)}...` : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {code.activatedAt || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{code.createdAt}</td>
                  <td className="px-6 py-4">
                    {code.status === 0 && (
                      <button
                        onClick={() => handleInvalidate(code.code)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        作废
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 生成弹窗 */}
      {showGenerate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">生成兑换码</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">规格</label>
                <select
                  value={generateSpec}
                  onChange={(e) => setGenerateSpec(parseInt(e.target.value))}
                  className="input"
                >
                  <option value={1}>1次卡</option>
                  <option value={3}>3次卡</option>
                  <option value={5}>5次卡</option>
                  <option value={99}>SVIP</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">数量</label>
                <input
                  type="number"
                  value={generateCount}
                  onChange={(e) => setGenerateCount(Math.max(1, parseInt(e.target.value) || 1))}
                  min={1}
                  max={100}
                  className="input"
                />
              </div>
            </div>

            {generatedCodes.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg max-h-48 overflow-y-auto">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  已生成 {generatedCodes.length} 个兑换码：
                </div>
                <div className="space-y-1">
                  {generatedCodes.map((code) => (
                    <div key={code} className="font-mono text-sm text-gray-600">
                      {code}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowGenerate(false); setGeneratedCodes([]) }}
                className="btn-secondary flex-1"
              >
                关闭
              </button>
              {generatedCodes.length === 0 ? (
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? '生成中...' : '生成'}
                </button>
              ) : (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedCodes.join('\n'))
                    alert('已复制到剪贴板')
                  }}
                  className="btn-primary flex-1"
                >
                  复制全部
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
