import * as crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import { DeviceLogService } from './deviceLogService.js'
import { users } from './codeService.js'

// 模拟数据库
const quizzes: Map<string, any> = new Map()
const quizContents: Map<string, any> = new Map()
const userQuizRecords: Map<string, any> = new Map() // key: deviceId-quizId

export class QuizService {
  private logService = new DeviceLogService()
  private secretKey = process.env.QUIZ_SECRET || 'jianwei-secret-key'
  
  constructor() {
    // 初始化示例数据
    this.initSampleData()
  }
  
  private initSampleData() {
    // 示例测评
    const sampleQuizzes = [
      {
        id: 'quiz-001',
        title: 'TA喜不喜欢我',
        description: '基于四维情感投入模型，20道场景题精准解析TA的投入程度',
        coverUrl: '',
        priceRef: 1,
        status: 1,
        sortOrder: 1,
        htmlUrl: '/quizzes/ta-love-quiz.html', // 外部HTML测评
        createdAt: new Date().toISOString(),
      },
      {
        id: 'quiz-002',
        title: '性格色彩测试',
        description: '发现您的性格优势与人际交往风格',
        coverUrl: '',
        priceRef: 1,
        status: 1,
        sortOrder: 2,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'quiz-003',
        title: '情绪管理能力测评',
        description: '评估您的情绪识别与调节能力',
        coverUrl: '',
        priceRef: 1,
        status: 1,
        sortOrder: 3,
        createdAt: new Date().toISOString(),
      },
    ]
    
    sampleQuizzes.forEach(q => {
      quizzes.set(q.id, q)
      
      // 如果有 htmlUrl，说明是外部HTML测评，内容通过iframe加载
      if (q.htmlUrl) {
        quizContents.set(q.id, {
          quizId: q.id,
          isExternalHtml: true,
          htmlUrl: q.htmlUrl,
          title: q.title,
          coverImage: q.coverUrl,
          intro: q.description,
          version: 1,
          updatedAt: new Date().toISOString(),
        })
      } else {
        quizContents.set(q.id, {
          quizId: q.id,
          content: {
            title: q.title,
            coverImage: q.coverUrl,
            intro: q.description,
            questions: [
              {
                id: 'q1',
                type: 'choice',
                question: '最近一周，您感到心情愉悦的频率？',
                options: [
                  { id: 'a', text: '几乎没有' },
                  { id: 'b', text: '偶尔' },
                  { id: 'c', text: '经常' },
                  { id: 'd', text: '每天都是' },
                ],
              },
            ],
          },
          version: 1,
          updatedAt: new Date().toISOString(),
        })
      }
    })
  }
  
  async getList() {
    return Array.from(quizzes.values())
      .filter(q => q.status === 1)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  }
  
  async unlock(quizId: string, deviceId: string) {
    const quiz = quizzes.get(quizId)
    if (!quiz) {
      const error = new Error('测评不存在')
      ;(error as any).status = 404
      throw error
    }
    
    // 检查是否已解锁
    const recordKey = `${deviceId}-${quizId}`
    if (userQuizRecords.has(recordKey)) {
      return { unlocked: true, quizId }
    }
    
    // 获取用户信息
    const user = users.get(deviceId)
    if (!user) {
      const error = new Error('用户不存在，请先激活兑换码')
      ;(error as any).status = 400
      throw error
    }
    
    // SVIP 用户不需要扣点
    if (!user.isSvip) {
      if (user.points < quiz.priceRef) {
        const error = new Error('点数不足')
        ;(error as any).status = 400
        throw error
      }
      // 扣减点数
      user.points -= quiz.priceRef
    }
    
    // 初始化已解锁列表
    if (!user.unlockedQuizzes) {
      user.unlockedQuizzes = []
    }
    
    // 添加到已解锁列表
    if (!user.unlockedQuizzes.includes(quizId)) {
      user.unlockedQuizzes.push(quizId)
    }
    
    // 创建解锁记录
    userQuizRecords.set(recordKey, {
      id: uuidv4(),
      deviceId,
      quizId,
      unlockedAt: new Date().toISOString(),
      completedAt: null,
    })
    
    // 更新用户数据
    users.set(deviceId, user)
    
    // 记录日志
    await this.logService.log(deviceId, '', 'unlock', { quizId, deductedPoints: user.isSvip ? 0 : quiz.priceRef })
    
    return { 
      unlocked: true, 
      quizId,
      remainingPoints: user.points,
      isSvip: user.isSvip
    }
  }
  
  async getContent(quizId: string, deviceId: string, token: string) {
    const quiz = quizzes.get(quizId)
    if (!quiz) {
      const error = new Error('测评不存在')
      ;(error as any).status = 404
      throw error
    }
    
    // 验证 HMAC Token
    const expectedToken = this.generateQuizToken(quizId)
    if (token !== expectedToken) {
      const error = new Error('Token 无效或已过期')
      ;(error as any).status = 401
      throw error
    }
    
    // 验证设备解锁状态
    const user = users.get(deviceId)
    if (!user) {
      const error = new Error('用户不存在，请先激活兑换码')
      ;(error as any).status = 401
      throw error
    }
    
    // SVIP 或已解锁才可访问
    if (!user.isSvip && !user.unlockedQuizzes?.includes(quizId)) {
      const error = new Error('未解锁该测评')
      ;(error as any).status = 403
      throw error
    }
    
    return quizContents.get(quizId)
  }
  
  async complete(quizId: string, deviceId: string) {
    const recordKey = `${deviceId}-${quizId}`
    const record = userQuizRecords.get(recordKey)
    
    if (!record) {
      const error = new Error('未解锁该测评')
      ;(error as any).status = 400
      throw error
    }
    
    record.completedAt = new Date().toISOString()
    userQuizRecords.set(recordKey, record)
    
    // 记录日志
    await this.logService.log(deviceId, '', 'complete', { quizId })
    
    return { completed: true }
  }
  
  async logExport(quizId: string, deviceId: string) {
    await this.logService.log(deviceId, '', 'export', { quizId })
    return { logged: true }
  }
  
  // 生成测评访问 Token
  generateQuizToken(quizId: string): string {
    const timestamp = Date.now()
    const data = `${quizId}:${timestamp}`
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(data)
      .digest('hex')
    return `${timestamp}.${signature}`
  }
}
