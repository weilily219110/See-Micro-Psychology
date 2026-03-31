import { Router } from 'express'
import { AdminService } from '../services/adminService.js'

export const adminRoutes = Router()
const adminService = new AdminService()

// POST /api/admin/code/generate - 生成兑换码
adminRoutes.post('/code/generate', async (req, res, next) => {
  try {
    const { spec, count = 1 } = req.body
    
    const codes = await adminService.generateCodes(spec, count)
    res.json({
      success: true,
      data: codes,
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/admin/code/list - 码列表
adminRoutes.get('/code/list', async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    
    const result = await adminService.listCodes(
      status as string | undefined,
      Number(page),
      Number(limit)
    )
    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error)
  }
})

// POST /api/admin/code/invalidate - 作废码
adminRoutes.post('/code/invalidate', async (req, res, next) => {
  try {
    const { code } = req.body
    
    await adminService.invalidateCode(code)
    res.json({
      success: true,
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/admin/quiz/list - 测评列表
adminRoutes.get('/quiz/list', async (req, res, next) => {
  try {
    const list = await adminService.listQuizzes()
    res.json({
      success: true,
      data: list,
    })
  } catch (error) {
    next(error)
  }
})

// POST /api/admin/quiz/create - 新增测评
adminRoutes.post('/quiz/create', async (req, res, next) => {
  try {
    const quiz = await adminService.createQuiz(req.body)
    res.json({
      success: true,
      data: quiz,
    })
  } catch (error) {
    next(error)
  }
})

// PUT /api/admin/quiz/:id - 编辑测评
adminRoutes.put('/quiz/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const quiz = await adminService.updateQuiz(id, req.body)
    res.json({
      success: true,
      data: quiz,
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/admin/stats/overview - 数据概览
adminRoutes.get('/stats/overview', async (req, res, next) => {
  try {
    const stats = await adminService.getStats()
    res.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    next(error)
  }
})
