import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { codeRoutes } from './routes/code.js'
import { userRoutes } from './routes/user.js'
import { quizRoutes } from './routes/quiz.js'
import { adminRoutes } from './routes/admin.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()
const PORT = process.env.PORT || 3001

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 中间件
app.use(cors())
app.use(express.json())

// 静态文件服务（测评HTML）
app.use('/quizzes', express.static(path.join(__dirname, 'public/quizzes')))

// 路由
app.use('/api/code', codeRoutes)
app.use('/api/user', userRoutes)
app.use('/api/quiz', quizRoutes)
app.use('/api/admin', adminRoutes)

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 错误处理
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 API server running on port ${PORT}`)
})

export default app
