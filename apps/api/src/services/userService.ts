// 模拟数据库
const users: Map<string, any> = new Map()

export class UserService {
  async getStatus(deviceId: string) {
    const user = users.get(deviceId)
    
    if (!user) {
      return {
        deviceId,
        points: 0,
        isSvip: false,
        activatedAt: null,
      }
    }
    
    return {
      deviceId: user.deviceId,
      points: user.points,
      isSvip: user.isSvip,
      activatedAt: user.activatedAt,
    }
  }
  
  async getUnlockedQuizzes(deviceId: string): Promise<string[]> {
    const user = users.get(deviceId)
    if (!user) return []
    
    // 实际应从 user_quiz_record 表查询
    return user.unlockedQuizzes || []
  }
}
