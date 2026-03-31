'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { exportReport } from '@/lib/api'

// 模拟报告数据 - 实际应从 API 获取
const generateReport = (quizId: string) => ({
  quizTitle: '心理健康自评量表',
  date: new Date().toLocaleDateString('zh-CN'),
  score: 78,
  level: '良好',
  summary: '您的心理健康状态总体良好，具备较好的情绪调节能力和自我认知。建议继续保持积极乐观的心态，适当进行放松训练。',
  suggestions: [
    '保持规律作息，确保充足睡眠',
    '每天进行30分钟有氧运动',
    '尝试冥想或深呼吸放松练习',
    '与朋友家人保持良好社交关系',
  ],
  dimensions: [
    { name: '情绪稳定性', score: 82, max: 100 },
    { name: '自我认知', score: 75, max: 100 },
    { name: '人际交往', score: 80, max: 100 },
    { name: '压力应对', score: 72, max: 100 },
  ],
})

export default function ReportPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string
  const reportRef = useRef<HTMLDivElement>(null)
  
  const [report] = useState(generateReport(quizId))
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    // 记录导出
    exportReport(quizId).catch(console.error)
  }, [quizId])

  const handleExport = async () => {
    setExporting(true)
    try {
      // 等待 DOM 更新
      await new Promise(resolve => setTimeout(resolve, 100))
      
      if (!reportRef.current) return

      // 使用 html2canvas 导出（需要引入库）
      // 这里先使用原生 canvas 方案
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // 设置 canvas 尺寸
      canvas.width = reportRef.current.offsetWidth * 2
      canvas.height = reportRef.current.offsetHeight * 2
      ctx.scale(2, 2)

      // 绘制背景
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 绘制标题
      ctx.fillStyle = '#1f2937'
      ctx.font = 'bold 24px sans-serif'
      ctx.fillText(report.quizTitle, 20, 40)

      // 绘制日期
      ctx.fillStyle = '#6b7280'
      ctx.font = '14px sans-serif'
      ctx.fillText(`测评日期：${report.date}`, 20, 65)

      // 绘制分隔线
      ctx.strokeStyle = '#e5e7eb'
      ctx.beginPath()
      ctx.moveTo(20, 80)
      ctx.lineTo(reportRef.current.offsetWidth - 20, 80)
      ctx.stroke()

      // 绘制综合评分
      ctx.fillStyle = '#1f2937'
      ctx.font = 'bold 18px sans-serif'
      ctx.fillText('综合评分', 20, 110)
      
      ctx.fillStyle = '#0ea5e9'
      ctx.font = 'bold 48px sans-serif'
      ctx.fillText(`${report.score}`, 20, 170)
      
      ctx.fillStyle = '#6b7280'
      ctx.font = '16px sans-serif'
      ctx.fillText(`/${report.level}`, 90, 170)

      // 绘制维度得分
      let y = 210
      report.dimensions.forEach(dim => {
        ctx.fillStyle = '#1f2937'
        ctx.font = '14px sans-serif'
        ctx.fillText(dim.name, 20, y)
        
        // 进度条背景
        ctx.fillStyle = '#e5e7eb'
        ctx.fillRect(100, y - 12, 150, 12)
        
        // 进度条
        ctx.fillStyle = '#0ea5e9'
        ctx.fillRect(100, y - 12, (dim.score / dim.max) * 150, 12)
        
        // 分数
        ctx.fillStyle = '#6b7280'
        ctx.fillText(`${dim.score}`, 260, y)
        
        y += 30
      })

      // 绘制总结
      y += 20
      ctx.fillStyle = '#1f2937'
      ctx.font = 'bold 16px sans-serif'
      ctx.fillText('测评总结', 20, y)
      
      ctx.fillStyle = '#4b5563'
      ctx.font = '14px sans-serif'
      const summaryLines = report.summary.split('')
      let line = ''
      let lineY = y + 25
      summaryLines.forEach(char => {
        if (ctx.measureText(line + char).width > reportRef.current.offsetWidth - 40) {
          ctx.fillText(line, 20, lineY)
          line = char
          lineY += 22
        } else {
          line += char
        }
      })
      ctx.fillText(line, 20, lineY)

      // 绘制建议
      lineY += 35
      ctx.fillStyle = '#1f2937'
      ctx.font = 'bold 16px sans-serif'
      ctx.fillText('改善建议', 20, lineY)
      
      ctx.fillStyle = '#4b5563'
      ctx.font = '14px sans-serif'
      lineY += 25
      report.suggestions.forEach((sug, i) => {
        ctx.fillText(`${i + 1}. ${sug}`, 20, lineY)
        lineY += 22
      })

      // 绘制版权信息
      lineY += 20
      ctx.fillStyle = '#9ca3af'
      ctx.font = '12px sans-serif'
      ctx.fillText('© 见微心理 | jianweiixinli.com', 20, lineY)

      // 下载
      const link = document.createElement('a')
      link.download = `见微心理_报告_${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('导出失败:', error)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <header className="bg-white shadow-sm mb-6">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => router.push('/plaza')} className="text-gray-600 hover:text-gray-900">
            ← 返回广场
          </button>
          <h1 className="text-xl font-bold text-gray-900">测评报告</h1>
          <div />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4">
        {/* 可导出区域 */}
        <div ref={reportRef} className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{report.quizTitle}</h2>
            <p className="text-gray-500 mt-1">测评日期：{report.date}</p>
          </div>

          <div className="border-t border-gray-100 pt-6 mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary-600">{report.score}</div>
                <div className="text-gray-500 mt-1">综合评分 · {report.level}</div>
              </div>
            </div>
          </div>

          {/* 维度得分 */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">各维度得分</h3>
            <div className="space-y-4">
              {report.dimensions.map((dim) => (
                <div key={dim.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{dim.name}</span>
                    <span className="text-gray-500">{dim.score}分</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div 
                      className="h-2 bg-primary-500 rounded-full transition-all"
                      style={{ width: `${(dim.score / dim.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 总结 */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">测评总结</h3>
            <p className="text-gray-600 leading-relaxed">{report.summary}</p>
          </div>

          {/* 建议 */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">改善建议</h3>
            <ul className="space-y-2">
              {report.suggestions.map((sug, i) => (
                <li key={i} className="flex items-start text-gray-600">
                  <span className="text-primary-500 mr-2">{i + 1}.</span>
                  {sug}
                </li>
              ))}
            </ul>
          </div>

          {/* 版权信息 */}
          <div className="text-center text-sm text-gray-400 pt-4 border-t border-gray-100">
            © 见微心理 | jianweiixinli.com
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => router.push('/plaza')}
            className="btn-secondary flex-1"
          >
            返回广场
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="btn-primary flex-1"
          >
            {exporting ? '导出中...' : '导出图片'}
          </button>
        </div>
      </main>
    </div>
  )
}
