// 兑换码规格
export type CodeSpec = 1 | 3 | 5 | 99 // 99 = SVIP

// 兑换码状态
export type CodeStatus = 0 | 1 | 2 // 0=未激活, 1=已激活, 2=已作废

// 兑换码
export interface ActivationCode {
  code: string
  spec: CodeSpec
  isSvip: boolean
  status: CodeStatus
  deviceId: string | null
  activatedAt: string | null
  createdAt: string
}

// 用户
export interface AppUser {
  deviceId: string
  points: number
  isSvip: boolean
  activatedAt: string
  code: string
}

// 测评
export interface Quiz {
  id: string
  title: string
  description: string
  coverUrl: string
  priceRef: number // 参考价（点数）
  status: 0 | 1 // 0=下线, 1=上线
  sortOrder: number
  createdAt: string
}

// 测评内容
export interface QuizContent {
  quizId: string
  content: QuizContentData
  version: number
  updatedAt: string
}

// 测评内容数据结构
export interface QuizContentData {
  title: string
  coverImage: string
  intro: string
  questions: Question[]
}

// 题目
export interface Question {
  id: string
  type: 'choice' | 'text'
  question: string
  options?: { id: string; text: string }[]
}

// 用户测评记录
export interface UserQuizRecord {
  id: string
  deviceId: string
  quizId: string
  unlockedAt: string
  completedAt: string | null
}

// 设备日志
export interface DeviceLog {
  id: string
  deviceId: string
  code: string
  action: 'activate' | 'unlock' | 'complete' | 'export'
  extra: Record<string, any>
  timestamp: string
}

// API 响应格式
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 用户状态响应
export interface UserStatusResponse {
  deviceId: string
  points: number
  isSvip: boolean
  activatedAt: string
}

// 激活请求
export interface ActivateRequest {
  code: string
  deviceId: string
}

// 解锁请求
export interface UnlockRequest {
  quizId: string
}

// 生成兑换码请求
export interface GenerateCodesRequest {
  spec: CodeSpec
  count: number
}
