'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getQuizContent, getQuizToken, completeQuiz, getUserStatus } from '@/lib/api'

interface Question {
  id: string
  type: 'choice' | 'text'
  question: string
  options?: { id: string; text: string }[]
}

interface QuizContent {
  title: string
  coverImage: string
  intro: string
  questions: Question[]
}

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string
  
  const [step, setStep] = useState<'intro' | 'testing' | 'complete'>('intro')
  const [content, setContent] = useState<QuizContent | null>(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    loadQuiz()
  }, [quizId])

  const loadQuiz = async () => {
    try {
      // 先获取测评访问 Token
      const tokenData = await getQuizToken(quizId)
      const token = tokenData.data?.token
      
      if (!token) {
        throw new Error('获取测评Token失败')
      }
      
      // 获取测评内容
      const data = await getQuizContent(quizId, token)
      setContent(data.content || data.data?.content)
      
      // 获取用户状态确认已解锁（作为备用校验）
      const status = await getUserStatus()
      if (!status.data?.isSvip && !status.data?.unlockedQuizzes?.includes(quizId)) {
        router.push('/plaza')
      }
    } catch (error) {
      console.error('加载测评失败:', error)
      router.push('/plaza')
    } finally {
      setLoading(false)
    }
  }

  const handleStart = () => {
    setStep('testing')
  }

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleNext = () => {
    if (content && currentQ < content.questions.length - 1) {
      setCurrentQ(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentQ > 0) {
      setCurrentQ(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await completeQuiz(quizId)
      setStep('complete')
    } catch (error) {
      console.error('提交失败:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">测评不存在</div>
      </div>
    )
  }

  // 引导页
  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900">见微心理</h1>
          </div>
        </header>
        
        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="card">
            <div className="aspect-video bg-gray-100 relative">
              {content.coverImage ? (
                <img src={content.coverImage} alt={content.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  封面图
                </div>
              )}
            </div>
            
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{content.title}</h2>
              <p className="text-gray-600 mb-6">{content.intro}</p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-500 mb-1">测评包含</div>
                <div className="text-lg font-medium text-gray-900">
                  {content.questions.length} 道题目
                </div>
              </div>
              
              <button onClick={handleStart} className="btn-primary w-full">
                开始测评
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // 答题页
  if (step === 'testing') {
    const question = content.questions[currentQ]
    const isLast = currentQ === content.questions.length - 1
    const hasAnswer = !!answers[question.id]

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-medium text-gray-900">{content.title}</h1>
              <span className="text-sm text-gray-500">
                {currentQ + 1} / {content.questions.length}
              </span>
            </div>
            {/* 进度条 */}
            <div className="mt-2 h-1 bg-gray-200 rounded-full">
              <div 
                className="h-1 bg-primary-500 rounded-full transition-all"
                style={{ width: `${((currentQ + 1) / content.questions.length) * 100}%` }}
              />
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="card p-6">
            <div className="mb-6">
              <span className="text-sm text-primary-600 font-medium">
                第 {currentQ + 1} 题
              </span>
              <h2 className="text-xl font-medium text-gray-900 mt-1">
                {question.question}
              </h2>
            </div>

            {question.type === 'choice' && question.options && (
              <div className="space-y-3">
                {question.options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleAnswer(question.id, opt.id)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      answers[question.id] === opt.id
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium">{opt.id}. </span>
                    {opt.text}
                  </button>
                ))}
              </div>
            )}

            {question.type === 'text' && (
              <textarea
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
                placeholder="请输入您的回答..."
                className="input min-h-[120px]"
              />
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={handlePrev}
                disabled={currentQ === 0}
                className="btn-secondary flex-1"
              >
                上一题
              </button>
              
              {isLast ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || Object.keys(answers).length < content.questions.length}
                  className="btn-primary flex-1"
                >
                  {submitting ? '提交中...' : '提交答案'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!hasAnswer}
                  className="btn-primary flex-1"
                >
                  下一题
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    )
  }

  // 完成页
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">见微心理</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">测评完成！</h2>
          <p className="text-gray-600 mb-6">
            感谢您完成本次测评，点击下方按钮查看您的专属报告
          </p>
          
          <button
            onClick={() => router.push(`/quiz/${quizId}/report`)}
            className="btn-primary"
          >
            查看报告
          </button>
        </div>
      </main>
    </div>
  )
}
