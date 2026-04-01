import { Router } from 'express'
import { QuizService } from '../services/quizService.js'
import { deviceAuth } from '../middleware/deviceAuth.js'
import { users } from '../services/codeService.js'

export const quizRoutes = Router()
const quizService = new QuizService()

// GET /api/quiz/list - 获取测评列表
quizRoutes.get('/list', async (req, res, next) => {
  try {
    const list = await quizService.getList()
    res.json({
      success: true,
      data: list,
    })
  } catch (error) {
    next(error)
  }
})

// POST /api/quiz/unlock - 解锁测评
quizRoutes.post('/unlock', deviceAuth, async (req, res, next) => {
  try {
    const deviceId = req.headers['x-device-id'] as string
    const { quizId } = req.body
    
    const result = await quizService.unlock(quizId, deviceId)
    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/quiz/:id/token - 获取测评访问 Token
quizRoutes.get('/:id/token', deviceAuth, async (req, res, next) => {
  try {
    const { id } = req.params
    const deviceId = req.headers['x-device-id'] as string
    
    // 验证设备解锁状态（复用 getContent 的校验逻辑）
    const user = users.get(deviceId)
    if (!user) {
      return res.status(401).json({
        success: false,
        error: '用户不存在',
      })
    }
    
    if (!user.isSvip && !user.unlockedQuizzes?.includes(id)) {
      return res.status(403).json({
        success: false,
        error: '未解锁该测评',
      })
    }
    
    // 生成访问 token
    const token = quizService.generateQuizToken(id)
    res.json({
      success: true,
      data: { token },
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/quiz/:id/content - 获取测评内容（需验签+设备校验）
quizRoutes.get('/:id/content', deviceAuth, async (req, res, next) => {
  try {
    const { id } = req.params
    const deviceId = req.headers['x-device-id'] as string
    const token = req.headers['x-quiz-token'] as string
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: '缺少验证Token',
      })
    }
    
    const content = await quizService.getContent(id, deviceId, token)
    res.json({
      success: true,
      data: content,
    })
  } catch (error) {
    next(error)
  }
})

// POST /api/quiz/:id/complete - 标记测评完成
quizRoutes.post('/:id/complete', deviceAuth, async (req, res, next) => {
  try {
    const deviceId = req.headers['x-device-id'] as string
    const { id } = req.params
    
    await quizService.complete(id, deviceId)
    res.json({
      success: true,
    })
  } catch (error) {
    next(error)
  }
})

// POST /api/quiz/:id/export - 记录报告导出
quizRoutes.post('/:id/export', deviceAuth, async (req, res, next) => {
  try {
    const deviceId = req.headers['x-device-id'] as string
    const { id } = req.params
    
    await quizService.logExport(id, deviceId)
    res.json({
      success: true,
    })
  } catch (error) {
    next(error)
  }
})
