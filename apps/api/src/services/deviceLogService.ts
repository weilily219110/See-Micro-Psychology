import { v4 as uuidv4 } from 'uuid'

// 模拟数据库
const logs: any[] = []

export class DeviceLogService {
  async log(
    deviceId: string,
    code: string,
    action: 'activate' | 'unlock' | 'complete' | 'export',
    extra: Record<string, any> = {}
  ) {
    const entry = {
      id: uuidv4(),
      deviceId,
      code,
      action,
      extra,
      timestamp: new Date().toISOString(),
    }
    logs.push(entry)
    return entry
  }
  
  async getByDevice(deviceId: string) {
    return logs.filter(l => l.deviceId === deviceId)
  }
  
  async getByAction(action: string) {
    return logs.filter(l => l.action === action)
  }
}
