'use client'

import { useEffect, useState } from 'react'

interface Quiz {
  id: string
  title: string
  description: string
  coverUrl: string
  priceRef: number
  status: number
  sortOrder: number
  createdAt: string
}

const mockQuizzes: Quiz[] = [
  { id: '1', title: '心理健康自评量表', description: '通过专业量表评估您的心理健康状态', coverUrl: '', priceRef: 1, status: 1, sortOrder: 1, createdAt: '2026-03-30' },
  { id: '2', title: '性格色彩测试', description: '发现您的性格优势与人际交往风格', coverUrl: '', priceRef: 1, status: 1, sortOrder: 2, createdAt: '2026-03-30' },
  { id: '3', title: '情绪管理能力测评', description: '评估您的情绪识别与调节能力', coverUrl: '', priceRef: 1, status: 1, sortOrder: 3, createdAt: '2026-03-30' },
  { id: '4', title: '压力应对方式测试', description: '了解您的压力应对模式和抗压能力', coverUrl: '', priceRef: 1, status: 0, sortOrder: 4, createdAt: '2026-03-29' },
]

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>(mockQuizzes)
  const [showCreate, setShowCreate] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null)
  
  // 创建/编辑表单
  const [form, setForm] = useState({
    title: '',
    description: '',
    coverUrl: '',
    priceRef: 1,
    sortOrder: 0,
  })

  const handleCreate = () => {
    setEditingQuiz(null)
    setForm({ title: '', description: '', coverUrl: '', priceRef: 1, sortOrder: quizzes.length + 1 })
    setShowCreate(true)
  }

  const handleEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz)
    setForm({
      title: quiz.title,
      description: quiz.description,
      coverUrl: quiz.coverUrl,
      priceRef: quiz.priceRef,
      sortOrder: quiz.sortOrder,
    })
    setShowCreate(true)
  }

  const handleSave = () => {
    if (!form.title) {
      alert('请填写标题')
      return
    }
    
    if (editingQuiz) {
      setQuizzes(prev => prev.map(q => 
        q.id === editingQuiz.id ? { ...q, ...form } : q
      ))
    } else {
      const newQuiz: Quiz = {
        id: Date.now().toString(),
        ...form,
        status: 1,
        createdAt: new Date().toLocaleDateString('zh-CN'),
      }
      setQuizzes(prev => [...prev, newQuiz])
    }
    setShowCreate(false)
  }

  const handleToggleStatus = (quiz: Quiz) => {
    setQuizzes(prev => prev.map(q =>
      q.id === quiz.id ? { ...q, status: q.status === 1 ? 0 : 1 } : q
    ))
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">测评管理</h1>
        <button onClick={handleCreate} className="btn-primary">
          新增测评
        </button>
      </div>

      {/* 列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="card">
            <div className="aspect-[4/3] bg-gray-100 relative">
              {quiz.coverUrl ? (
                <img src={quiz.coverUrl} alt={quiz.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  封面图
                </div>
              )}
              <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${
                quiz.status === 1 ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
              }`}>
                {quiz.status === 1 ? '上线' : '下线'}
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-1">{quiz.title}</h3>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{quiz.description}</p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">参考价：{quiz.priceRef} 点</span>
                <span className="text-gray-400">排序：{quiz.sortOrder}</span>
              </div>
              
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(quiz)}
                  className="flex-1 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleToggleStatus(quiz)}
                  className={`flex-1 py-2 text-sm rounded-lg ${
                    quiz.status === 1
                      ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  {quiz.status === 1 ? '下线' : '上线'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {quizzes.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          暂无测评，点击上方按钮新增
        </div>
      )}

      {/* 创建/编辑弹窗 */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingQuiz ? '编辑测评' : '新增测评'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className="input"
                  placeholder="请输入测评标题"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">简介</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="input min-h-[80px]"
                  placeholder="请输入测评简介"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">封面图URL</label>
                <input
                  type="text"
                  value={form.coverUrl}
                  onChange={(e) => setForm(prev => ({ ...prev, coverUrl: e.target.value }))}
                  className="input"
                  placeholder="https://..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">参考价（点）</label>
                  <input
                    type="number"
                    value={form.priceRef}
                    onChange={(e) => setForm(prev => ({ ...prev, priceRef: parseInt(e.target.value) || 1 }))}
                    min={1}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                    min={0}
                    className="input"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreate(false)}
                className="btn-secondary flex-1"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="btn-primary flex-1"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
