import { v4 as uuidv4 } from 'uuid'
import { DeviceLogService } from './deviceLogService.js'

// 模拟数据库 - 生产环境替换为 PostgreSQL
const codes: Map<string, any> = new Map()
const users: Map<string, any> = new Map()

export class CodeService {
  private logService = new DeviceLogService()
  
  // 激活兑换码
  async activate(code: string, deviceId: string) {
    const upperCode = code.toUpperCase()
    
    // 查找兑换码
    const codeData = codes.get(upperCode)
    if (!codeData) {
      const error = new Error('兑换码不存在')
      ;(error as any).status = 400
      throw error
    }
    
    // 检查状态
    if (codeData.status === 1) {
      if (codeData.deviceId === deviceId) {
        const error = new Error('该设备已激活此码')
        ;(error as any).status = 400
        throw error
      }
      const error = new Error('兑换码已被使用')
      ;(error as any).status = 400
      throw error
    }
    
    if (codeData.status === 2) {
      const error = new Error('兑换码已作废')
      ;(error as any).status = 400
      throw error
    }
    
    // 激活
    codeData.status = 1
    codeData.deviceId = deviceId
    codeData.activatedAt = new Date().toISOString()
    codes.set(upperCode, codeData)
    
    // 创建或更新用户
    let user = users.get(deviceId)
    if (!user) {
      user = {
        deviceId,
        points: 0,
        isSvip: false,
        activatedAt: new Date().toISOString(),
        code: upperCode,
      }
    }
    
    if (codeData.isSvip) {
      user.isSvip = true
      user.points = 999 // SVIP 大点数
    } else {
      user.points += codeData.spec
    }
    
    users.set(deviceId, user)
    
    // 记录日志
    await this.logService.log(deviceId, upperCode, 'activate', {
      spec: codeData.spec,
      isSvip: codeData.isSvip,
    })
    
    return {
      points: user.points,
      isSvip: user.isSvip,
      activatedAt: user.activatedAt,
    }
  }
  
  // 内部方法：创建兑换码（供 AdminService 调用）
  async createCode(spec: number, isSvip: boolean): Promise<string> {
    const code = this.generateCode()
    codes.set(code, {
      code,
      spec,
      isSvip,
      status: 0, // 未激活
      deviceId: null,
      activatedAt: null,
      createdAt: new Date().toISOString(),
    })
    return code
  }
  
  // 生成16位兑换码
  private generateCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 16; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }
}
