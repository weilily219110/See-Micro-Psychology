import { Router } from 'express'
import { CodeService } from '../services/codeService.js'

export const codeRoutes = Router()
const codeService = new CodeService()

// POST /api/code/activate - 激活兑换码
codeRoutes.post('/activate', async (req, res, next) => {
  try {
    const { code, deviceId } = req.body
    
    if (!code || !deviceId) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数',
      })
    }
    
    const result = await codeService.activate(code, deviceId)
    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error)
  }
})
