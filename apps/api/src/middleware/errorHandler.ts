import { Request, Response, NextFunction } from 'express'

export function errorHandler(
  err: Error & { status?: number; code?: string },
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err.message)
  
  const status = err.status || 500
  const message = err.message || 'Internal server error'
  
  res.status(status).json({
    success: false,
    error: message,
    code: err.code,
  })
}
