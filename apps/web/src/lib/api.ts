import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.jianweiixinli.com'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加设备指纹
api.interceptors.request.use(async (config) => {
  const deviceId = await getDeviceId()
  config.headers['X-Device-Id'] = deviceId
  return config
})

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 设备未激活，跳转首页
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  }
)

// 兑换码激活
export async function activateCode(code: string, deviceId: string) {
  const response = await api.post('/api/code/activate', { code, deviceId })
  return response.data
}

// 获取用户状态
export async function getUserStatus() {
  const response = await api.get('/api/user/status')
  return response.data
}

// 获取测评广场列表
export async function getQuizList() {
  const response = await api.get('/api/quiz/list')
  return response.data
}

// 解锁测评
export async function unlockQuiz(quizId: string) {
  const response = await api.post('/api/quiz/unlock', { quizId })
  return response.data
}

// 获取测评内容
export async function getQuizContent(quizId: string, token: string) {
  const response = await api.get(`/api/quiz/${quizId}/content`, {
    headers: { 'X-Quiz-Token': token },
  })
  return response.data
}

// 标记测评完成
export async function completeQuiz(quizId: string) {
  const response = await api.post(`/api/quiz/${quizId}/complete`)
  return response.data
}

// 记录报告导出
export async function exportReport(quizId: string) {
  const response = await api.post(`/api/quiz/${quizId}/export`)
  return response.data
}

// 设备指纹生成
export async function getDeviceId(): Promise<string> {
  if (typeof window === 'undefined') return ''
  
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
  ].join('|')
  
  const encoder = new TextEncoder()
  const data = encoder.encode(components)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export { api }
