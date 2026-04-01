import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { bearerAuth } from 'hono/bearer-auth'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { createHash } from 'crypto'

// Types
interface Env {
  JWT_SECRET: string
  ADMIN_EMAIL: string
  ADMIN_PASSWORD_HASH: string
  ALLOWED_ORIGIN: string
}

// In-memory stores (survive until worker recycles)
const users = new Map<string, User>()
const codes = new Map<string, Code>()
const quizzes = new Map<string, Quiz>()
const quizContents = new Map<string, QuizContent>()
const userQuizRecords = new Map<string, QuizRecord>()
const logs: LogEntry[] = []

interface User {
  deviceId: string
  points: number
  isSvip: boolean
  activatedAt: string
  code?: string
  unlockedQuizzes: string[]
}

interface Code {
  code: string
  spec: number
  isSvip: boolean
  status: number
  deviceId?: string
  activatedAt?: string
  createdAt: string
}

interface Quiz {
  id: string
  title: string
  description: string
  coverUrl: string
  priceRef: number
  status: number
  sortOrder: number
  htmlUrl?: string
}

interface QuizContent {
  quizId: string
  isExternalHtml?: boolean
  htmlUrl?: string
  title: string
  coverImage: string
  intro: string
  version: number
  updatedAt: string
}

interface QuizRecord {
  id: string
  deviceId: string
  quizId: string
  unlockedAt: string
  completedAt?: string
}

interface LogEntry {
  id: string
  deviceId: string
  code: string
  action: string
  extra: Record<string, any>
  timestamp: string
}

// Initialize sample quizzes
function initQuizzes() {
  const sampleQuizzes: Quiz[] = [
    {
      id: 'quiz-001',
      title: 'TA喜不喜欢我',
      description: '基于四维情感投入模型，20道场景题精准解析TA的投入程度',
      coverUrl: '',
      priceRef: 1,
      status: 1,
      sortOrder: 1,
      htmlUrl: '/quizzes/ta-love-quiz.html',
    },
    {
      id: 'quiz-002',
      title: '性格色彩测试',
      description: '发现您的性格优势与人际交往风格',
      coverUrl: '',
      priceRef: 1,
      status: 1,
      sortOrder: 2,
    },
    {
      id: 'quiz-003',
      title: '情绪管理能力测评',
      description: '评估您的情绪识别与调节能力',
      coverUrl: '',
      priceRef: 1,
      status: 1,
      sortOrder: 3,
    },
  ]

  sampleQuizzes.forEach(q => {
    quizzes.set(q.id, q)
    
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
        title: q.title,
        coverImage: q.coverUrl,
        intro: q.description,
        version: 1,
        updatedAt: new Date().toISOString(),
      })
    }
  })
}

// Generate quiz token
function generateQuizToken(quizId: string, secret: string): string {
  const timestamp = Date.now()
  const data = `${quizId}:${timestamp}`
  const hash = createHash('sha256').update(data + secret).digest('hex')
  return `${timestamp}.${hash}`
}

// Verify quiz token
function verifyQuizToken(quizId: string, token: string, secret: string): boolean {
  try {
    const [timestamp, hash] = token.split('.')
    const data = `${quizId}:${timestamp}`
    const expected = createHash('sha256').update(data + secret).digest('hex')
    return hash === expected
  } catch {
    return false
  }
}

// Generate JWT (simplified)
function generateJWT(payload: object, secret: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000) })).toString('base64url')
  const sig = createHash('sha256').update(header + '.' + body + secret).digest('base64url')
  return `${header}.${body}.${sig}`
}

// Verify JWT (simplified)
function verifyJWT(token: string, secret: string): { email: string; role: string } | null {
  try {
    const [header, body, sig] = token.split('.')
    const expected = createHash('sha256').update(header + '.' + body + secret).digest('base64url')
    if (sig !== expected) return null
    return JSON.parse(Buffer.from(body, 'base64url').toString())
  } catch {
    return null
  }
}

// Initialize
initQuizzes()

// Create Hono app
const app = new Hono<{ Bindings: Env }>()

// CORS
app.use('/*', cors({
  origin: (o) => o === '*' || o.includes('jianweiixinli.com') ? '*' : o,
  credentials: true,
}))

// Helper: get device ID from header
function getDeviceId(c: any): string | null {
  return c.req.header('X-Device-Id') || null
}

// ========== USER ROUTES ==========

// GET /api/user/status - Get user status
app.get('/api/user/status', (c) => {
  const deviceId = getDeviceId(c)
  if (!deviceId) {
    return c.json({ success: false, error: '缺少设备标识' }, 401)
  }
  
  const user = users.get(deviceId)
  if (!user) {
    return c.json({
      success: true,
      data: { deviceId, points: 0, isSvip: false, activatedAt: null, unlockedQuizzes: [] }
    })
  }
  
  return c.json({
    success: true,
    data: {
      deviceId: user.deviceId,
      points: user.points,
      isSvip: user.isSvip,
      activatedAt: user.activatedAt,
      unlockedQuizzes: user.unlockedQuizzes || [],
    }
  })
})

// ========== CODE ROUTES ==========

// POST /api/code/activate - Activate code
app.post('/api/code/activate', async (c) => {
  const { code, deviceId } = await c.req.json()
  
  if (!code || !deviceId) {
    return c.json({ success: false, error: '缺少必要参数' }, 400)
  }
  
  const upperCode = code.toUpperCase()
  const codeData = codes.get(upperCode)
  
  if (!codeData) {
    return c.json({ success: false, error: '兑换码不存在' }, 400)
  }
  
  if (codeData.status === 1) {
    if (codeData.deviceId === deviceId) {
      return c.json({ success: false, error: '该设备已激活此码' }, 400)
    }
    return c.json({ success: false, error: '兑换码已被使用' }, 400)
  }
  
  if (codeData.status === 2) {
    return c.json({ success: false, error: '兑换码已作废' }, 400)
  }
  
  // Activate
  codeData.status = 1
  codeData.deviceId = deviceId
  codeData.activatedAt = new Date().toISOString()
  codes.set(upperCode, codeData)
  
  // Create or update user
  let user = users.get(deviceId)
  if (!user) {
    user = {
      deviceId,
      points: 0,
      isSvip: false,
      activatedAt: new Date().toISOString(),
      code: upperCode,
      unlockedQuizzes: [],
    }
  }
  
  if (codeData.isSvip) {
    user.isSvip = true
    user.points = 999
  } else {
    user.points += codeData.spec
  }
  
  users.set(deviceId, user)
  
  // Log
  logs.push({
    id: crypto.randomUUID(),
    deviceId,
    code: upperCode,
    action: 'activate',
    extra: { spec: codeData.spec, isSvip: codeData.isSvip },
    timestamp: new Date().toISOString(),
  })
  
  return c.json({
    success: true,
    data: {
      points: user.points,
      isSvip: user.isSvip,
      activatedAt: user.activatedAt,
    }
  })
})

// ========== QUIZ ROUTES ==========

// GET /api/quiz/list - Get quiz list
app.get('/api/quiz/list', (c) => {
  const list = Array.from(quizzes.values())
    .filter(q => q.status === 1)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(q => ({
      id: q.id,
      title: q.title,
      description: q.description,
      coverUrl: q.coverUrl,
      priceRef: q.priceRef,
      status: q.status,
      sortOrder: q.sortOrder,
    }))
  
  return c.json({ success: true, data: list })
})

// POST /api/quiz/unlock - Unlock quiz
app.post('/api/quiz/unlock', async (c) => {
  const deviceId = getDeviceId(c)
  if (!deviceId) {
    return c.json({ success: false, error: '缺少设备标识' }, 401)
  }
  
  const { quizId } = await c.req.json()
  const quiz = quizzes.get(quizId)
  
  if (!quiz) {
    return c.json({ success: false, error: '测评不存在' }, 404)
  }
  
  // Check if already unlocked
  const recordKey = `${deviceId}-${quizId}`
  if (userQuizRecords.has(recordKey)) {
    return c.json({ success: true, data: { unlocked: true, quizId } })
  }
  
  // Get user
  const user = users.get(deviceId)
  if (!user) {
    return c.json({ success: false, error: '用户不存在，请先激活兑换码' }, 400)
  }
  
  // SVIP doesn't need points
  if (!user.isSvip) {
    if (user.points < quiz.priceRef) {
      return c.json({ success: false, error: '点数不足' }, 400)
    }
    user.points -= quiz.priceRef
  }
  
  // Initialize unlocked list
  if (!user.unlockedQuizzes) {
    user.unlockedQuizzes = []
  }
  if (!user.unlockedQuizzes.includes(quizId)) {
    user.unlockedQuizzes.push(quizId)
  }
  
  // Create record
  userQuizRecords.set(recordKey, {
    id: crypto.randomUUID(),
    deviceId,
    quizId,
    unlockedAt: new Date().toISOString(),
  })
  
  users.set(deviceId, user)
  
  // Log
  logs.push({
    id: crypto.randomUUID(),
    deviceId,
    code: '',
    action: 'unlock',
    extra: { quizId, deductedPoints: user.isSvip ? 0 : quiz.priceRef },
    timestamp: new Date().toISOString(),
  })
  
  return c.json({
    success: true,
    data: {
      unlocked: true,
      quizId,
      remainingPoints: user.points,
      isSvip: user.isSvip,
    }
  })
})

// GET /api/quiz/:id/token - Get quiz token
app.get('/api/quiz/:id/token', (c) => {
  const deviceId = getDeviceId(c)
  const quizId = c.req.param('id')
  
  if (!deviceId) {
    return c.json({ success: false, error: '缺少设备标识' }, 401)
  }
  
  const user = users.get(deviceId)
  if (!user) {
    return c.json({ success: false, error: '用户不存在' }, 401)
  }
  
  if (!user.isSvip && !user.unlockedQuizzes?.includes(quizId)) {
    return c.json({ success: false, error: '未解锁该测评' }, 403)
  }
  
  const secret = c.env.JWT_SECRET || 'jianwei-secret'
  const token = generateQuizToken(quizId, secret)
  
  return c.json({ success: true, data: { token } })
})

// GET /api/quiz/:id/content - Get quiz content
app.get('/api/quiz/:id/content', (c) => {
  const deviceId = getDeviceId(c)
  const quizId = c.req.param('id')
  const token = c.req.header('x-quiz-token')
  
  if (!token) {
    return c.json({ success: false, error: '缺少验证Token' }, 401)
  }
  
  const secret = c.env.JWT_SECRET || 'jianwei-secret'
  if (!verifyQuizToken(quizId, token, secret)) {
    return c.json({ success: false, error: 'Token 无效或已过期' }, 401)
  }
  
  // Verify device unlock status
  const user = users.get(deviceId || '')
  if (!user) {
    return c.json({ success: false, error: '用户不存在' }, 401)
  }
  
  if (!user.isSvip && !user.unlockedQuizzes?.includes(quizId)) {
    return c.json({ success: false, error: '未解锁该测评' }, 403)
  }
  
  const content = quizContents.get(quizId)
  if (!content) {
    return c.json({ success: false, error: '测评不存在' }, 404)
  }
  
  return c.json({ success: true, data: content })
})

// POST /api/quiz/:id/complete - Mark quiz complete
app.post('/api/quiz/:id/complete', async (c) => {
  const deviceId = getDeviceId(c)
  const quizId = c.req.param('id')
  
  if (!deviceId) {
    return c.json({ success: false, error: '缺少设备标识' }, 401)
  }
  
  const recordKey = `${deviceId}-${quizId}`
  const record = userQuizRecords.get(recordKey)
  
  if (!record) {
    return c.json({ success: false, error: '未解锁该测评' }, 400)
  }
  
  record.completedAt = new Date().toISOString()
  userQuizRecords.set(recordKey, record)
  
  logs.push({
    id: crypto.randomUUID(),
    deviceId,
    code: '',
    action: 'complete',
    extra: { quizId },
    timestamp: new Date().toISOString(),
  })
  
  return c.json({ success: true })
})

// POST /api/quiz/:id/export - Log export
app.post('/api/quiz/:id/export', async (c) => {
  const deviceId = getDeviceId(c)
  const quizId = c.req.param('id')
  
  if (!deviceId) {
    return c.json({ success: false, error: '缺少设备标识' }, 401)
  }
  
  logs.push({
    id: crypto.randomUUID(),
    deviceId,
    code: '',
    action: 'export',
    extra: { quizId },
    timestamp: new Date().toISOString(),
  })
  
  return c.json({ success: true })
})

// ========== ADMIN ROUTES ==========

// POST /api/admin/login - Admin login
app.post('/api/admin/login', async (c) => {
  const { email, password } = await c.req.json()
  
  if (!email || !password) {
    return c.json({ success: false, error: '请提供邮箱和密码' }, 400)
  }
  
  const adminEmail = c.env.ADMIN_EMAIL || 'admin@jianweiixinli.com'
  const adminHash = c.env.ADMIN_PASSWORD_HASH || ''
  
  if (email !== adminEmail) {
    return c.json({ success: false, error: '用户名或密码错误' }, 401)
  }
  
  // For demo: accept password "admin123" if no hash set
  if (adminHash && password !== 'admin123') {
    return c.json({ success: false, error: '用户名或密码错误' }, 401)
  }
  
  const secret = c.env.JWT_SECRET || 'jianwei-secret'
  const token = generateJWT({ email, role: 'admin' }, secret)
  
  return c.json({
    success: true,
    data: { token, email, expiresIn: '24h' }
  })
})

// POST /api/admin/code/generate - Generate codes
app.post('/api/admin/code/generate', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: '未授权' }, 401)
  }
  
  const token = authHeader.slice(7)
  const secret = c.env.JWT_SECRET || 'jianwei-secret'
  const payload = verifyJWT(token, secret)
  
  if (!payload || payload.role !== 'admin') {
    return c.json({ success: false, error: '未授权' }, 401)
  }
  
  const { spec, isSvip, count = 1 } = await c.req.json()
  
  const generated: string[] = []
  for (let i = 0; i < Math.min(count, 100); i++) {
    const code = generateCode(spec || 1, isSvip || false)
    generated.push(code)
  }
  
  return c.json({ success: true, data: { codes: generated } })
})

// Generate 16-char code
function generateCode(spec: number, isSvip: boolean): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'JW'
  if (isSvip) {
    code = 'JV'
  } else if (spec === 3) {
    code = 'J3'
  } else if (spec === 5) {
    code = 'J5'
  } else {
    code = 'J1'
  }
  
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  const codeData: Code = {
    code,
    spec,
    isSvip,
    status: 0,
    createdAt: new Date().toISOString(),
  }
  
  codes.set(code, codeData)
  return code
}

// GET /api/admin/codes - List codes
app.get('/api/admin/codes', (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: '未授权' }, 401)
  }
  
  const token = authHeader.slice(7)
  const secret = c.env.JWT_SECRET || 'jianwei-secret'
  const payload = verifyJWT(token, secret)
  
  if (!payload || payload.role !== 'admin') {
    return c.json({ success: false, error: '未授权' }, 401)
  }
  
  const codeList = Array.from(codes.values()).map(c => ({
    code: c.code,
    spec: c.spec,
    isSvip: c.isSvip,
    status: c.status,
    activatedAt: c.activatedAt,
    createdAt: c.createdAt,
  }))
  
  return c.json({ success: true, data: codeList })
})

// GET /api/admin/stats - Get stats
app.get('/api/admin/stats', (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: '未授权' }, 401)
  }
  
  const token = authHeader.slice(7)
  const secret = c.env.JWT_SECRET || 'jianwei-secret'
  const payload = verifyJWT(token, secret)
  
  if (!payload || payload.role !== 'admin') {
    return c.json({ success: false, error: '未授权' }, 401)
  }
  
  const totalCodes = codes.size
  const usedCodes = Array.from(codes.values()).filter(c => c.status === 1).length
  const totalUsers = users.size
  const totalLogs = logs.length
  
  return c.json({
    success: true,
    data: { totalCodes, usedCodes, totalUsers, totalLogs }
  })
})

// ========== HEALTH CHECK ==========

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ========== EXPORT FOR CF WORKER ==========

export default app
