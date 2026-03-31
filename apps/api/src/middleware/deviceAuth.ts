import { Request, Response, NextFunction } from 'express'

export function deviceAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const deviceId = req.headers['x-device-id'] as string
  
  if (!deviceId) {
    return res.status(401).json({
      success: false,
      error: '缺少设备标识',
    })
  }
  
  next()
}
