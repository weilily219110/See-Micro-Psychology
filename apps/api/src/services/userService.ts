import { users } from './codeService.js'

export class UserService {
  async getStatus(deviceId: string) {
    const user = users.get(deviceId)
    
    if (!user) {
      return {
        deviceId,
        points: 0,
        isSvip: false,
        activatedAt: null,
        unlockedQuizzes: [],
      }
    }
    
    return {
      deviceId: user.deviceId,
      points: user.points,
      isSvip: user.isSvip,
      activatedAt: user.activatedAt,
      unlockedQuizzes: user.unlockedQuizzes || [],
    }
  }
  
  async getUnlockedQuizzes(deviceId: string): Promise<string[]> {
    const user = users.get(deviceId)
    if (!user) return []
    
    return user.unlockedQuizzes || []
  }
}