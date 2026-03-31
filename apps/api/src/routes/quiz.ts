import { Router } from 'express'
import { QuizService } from '../services/quizService.js'
import { deviceAuth } from '../middleware/deviceAuth.js'

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

// GET /api/quiz/:id/content - 获取测评内容（需验签）
quizRoutes.get('/:id/content', async (req, res, next) => {
  try {
    const { id } = req.params
    const token = req.headers['x-quiz-token'] as string
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: '缺少验证Token',
      })
    }
    
    const content = await quizService.getContent(id, token)
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
