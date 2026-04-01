'use client'

import { useState } from 'react'
import { activateCode, getUserStatus, getDeviceId } from '@/lib/api'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 16) {
      setError('兑换码长度应为16位')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const deviceId = await getDeviceId()
      await activateCode(code, deviceId)
      router.push('/plaza')
    } catch (err) {
      setError(err instanceof Error ? err.message : '激活失败，请检查兑换码')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">见微心理</h1>
          <p className="text-gray-600">探索心灵，见微知著</p>
        </div>
        
        <div className="card p-8">
          <form onSubmit={handleActivate}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                输入兑换码
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="请输入16位兑换码"
                maxLength={16}
                className="input text-center text-2xl tracking-widest font-mono"
              />
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading || code.length !== 16}
              className="btn-primary w-full"
            >
              {loading ? '激活中...' : '激活'}
            </button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              兑换码来源：小红书/咸鱼<br/>
              激活后仅限当前设备使用
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

