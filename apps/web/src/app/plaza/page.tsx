'use client'

import { useEffect, useState } from 'react'
import { getQuizList, getUserStatus, unlockQuiz } from '@/lib/api'

interface Quiz {
  id: string
  title: string
  description: string
  coverUrl: string
  priceRef: number
  status: number
  sortOrder: number
}

interface UserStatus {
  deviceId: string
  points: number
  isSvip: boolean
  activatedAt: string
}

export default function PlazaPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [unlockingId, setUnlockingId] = useState<string | null>(null)
  const [confirmUnlock, setConfirmUnlock] = useState<Quiz | null>(null)
  const [unlockedIds, setUnlockedIds] = useState<string[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [quizRes, statusRes] = await Promise.all([
        getQuizList(),
        getUserStatus(),
      ])
      setQuizzes(quizRes.data.filter((q: Quiz) => q.status === 1))
      setUserStatus(statusRes.data)
    } catch (error) {
      console.error('加载失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnlock = async (quiz: Quiz) => {
    if (!confirmUnlock) return
    
    setUnlockingId(quiz.id)
    try {
      await unlockQuiz(quiz.id)
      // 解锁成功后，更新本地已解锁列表
      setUnlockedIds(prev => [...prev, quiz.id])
      // 刷新用户状态（获取最新点数）
      await loadData()
      setConfirmUnlock(null)
    } catch (error) {
      console.error('解锁失败:', error)
    } finally {
      setUnlockingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  const isSvip = userStatus?.isSvip || false

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">见微心理</h1>
            <div className="text-right">
              {isSvip ? (
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  SVIP · 全部解锁
                </span>
              ) : (
                <div className="text-sm">
                  <span className="text-gray-500">剩余点数</span>
                  <span className="ml-1 text-lg font-bold text-primary-600">
                    {userStatus?.points || 0}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 测评广场 */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-lg font-medium text-gray-700 mb-4">测评广场</h2>
        
        {quizzes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            暂无测评
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => {
              const isUnlocked = isSvip || unlockedIds.includes(quiz.id)
              
              return (
                <div key={quiz.id} className="card">
                  <div className="aspect-[4/3] bg-gray-100 relative">
                    {quiz.coverUrl ? (
                      <img
                        src={quiz.coverUrl}
                        alt={quiz.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        封面图
                      </div>
                    )}
                    
                    {isUnlocked && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs rounded">
                        已解锁
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1">{quiz.title}</h3>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                      {quiz.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      {isUnlocked ? (
                        <button
                          onClick={() => window.location.href = `/quiz/${quiz.id}`}
                          className="btn-primary text-sm py-2"
                        >
                          开始测评
                        </button>
                      ) : isSvip ? (
                        <button
                          onClick={() => window.location.href = `/quiz/${quiz.id}`}
                          className="btn-primary text-sm py-2"
                        >
                          开始测评
                        </button>
                      ) : (
                        <>
                          <span className="text-sm text-gray-500">
                            需 <span className="font-medium text-primary-600">{quiz.priceRef} 点</span>
                          </span>
                          <button
                            onClick={() => setConfirmUnlock(quiz)}
                            className="btn-secondary text-sm py-2"
                          >
                            解锁
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* 解锁确认弹窗 */}
      {confirmUnlock && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-2">确认解锁</h3>
            <p className="text-gray-600 mb-4">
              解锁「{confirmUnlock.title}」需消耗 {confirmUnlock.priceRef} 点
            </p>
            <p className="text-sm text-amber-600 mb-4">
              ⚠️ 解锁后无法退款，请确认
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmUnlock(null)}
                className="btn-secondary flex-1"
              >
                取消
              </button>
              <button
                onClick={() => handleUnlock(confirmUnlock)}
                disabled={unlockingId === confirmUnlock.id}
                className="btn-primary flex-1"
              >
                {unlockingId === confirmUnlock.id ? '解锁中...' : '确认解锁'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
