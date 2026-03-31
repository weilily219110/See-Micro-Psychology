import { v4 as uuidv4 } from 'uuid'
import { CodeService } from './codeService.js'

// 模拟数据库
const quizzes: Map<string, any> = new Map()
const stats = {
  totalActivations: 0,
  totalUnlocks: 0,
  totalCompletions: 0,
}

export class AdminService {
  private codeService = new CodeService()
  
  async generateCodes(spec: number, count: number) {
    const codes: string[] = []
    const isSvip = spec === 99
    
    for (let i = 0; i < count; i++) {
      const code = await this.codeService.createCode(spec, isSvip)
      codes.push(code)
    }
    
    return { codes, spec, count }
  }
  
  async listCodes(status?: string, page: number = 1, limit: number = 20) {
    // 实际应从数据库查询
    return {
      items: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    }
  }
  
  async invalidateCode(code: string) {
    // 实际应更新数据库
    return { success: true }
  }
  
  async listQuizzes() {
    return Array.from(quizzes.values())
  }
  
  async createQuiz(data: any) {
    const quiz = {
      id: uuidv4(),
      ...data,
      status: 1,
      sortOrder: data.sortOrder || 0,
      createdAt: new Date().toISOString(),
    }
    quizzes.set(quiz.id, quiz)
    return quiz
  }
  
  async updateQuiz(id: string, data: any) {
    const quiz = quizzes.get(id)
    if (!quiz) {
      const error = new Error('测评不存在')
      ;(error as any).status = 404
      throw error
    }
    
    const updated = { ...quiz, ...data, id }
    quizzes.set(id, updated)
    return updated
  }
  
  async getStats() {
    return {
      totalActivations: stats.totalActivations,
      totalUnlocks: stats.totalUnlocks,
      totalCompletions: stats.totalCompletions,
    }
  }
}
