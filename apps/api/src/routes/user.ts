import { Router } from 'express'
import { UserService } from '../services/userService.js'

export const userRoutes = Router()
const userService = new UserService()

// GET /api/user/status - 获取用户状态
userRoutes.get('/status', async (req, res, next) => {
  try {
    const deviceId = req.headers['x-device-id'] as string
    
    if (!deviceId) {
      return res.status(401).json({
        success: false,
        error: '缺少设备标识',
      })
    }
    
    const status = await userService.getStatus(deviceId)
    res.json({
      success: true,
      data: status,
    })
  } catch (error) {
    next(error)
  }
})
