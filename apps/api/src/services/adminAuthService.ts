import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const JWT_SECRET = process.env.JWT_SECRET || 'jianwei-admin-secret-key-change-in-production'
const SALT_ROUNDS = 10

// 从环境变量获取初始 admin 账号密码
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@jianweiixinli.com'
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || ''

export class AdminAuthService {
  /**
   * 校验密码
   * 如果没有设置密码 hash，说明还未初始化，返回 false
   */
  async validatePassword(password: string): Promise<boolean> {
    if (!ADMIN_PASSWORD_HASH) {
      return false
    }
    return bcrypt.compare(password, ADMIN_PASSWORD_HASH)
  }

  /**
   * 校验邮箱
   */
  validateEmail(email: string): boolean {
    return email === ADMIN_EMAIL
  }

  /**
   * 生成 JWT Token
   */
  generateToken(email: string): string {
    return jwt.sign(
      { email, role: 'admin', iat: Math.floor(Date.now() / 1000) },
      JWT_SECRET,
      { expiresIn: '24h' }
    )
  }

  /**
   * 验证 JWT Token
   */
  verifyToken(token: string): { email: string; role: string } | null {
    try {
      return jwt.verify(token, JWT_SECRET) as { email: string; role: string }
    } catch {
      return null
    }
  }

  /**
   * 生成密码 hash（供首次设置使用）
   * 运维人员可以使用这个方法来生成 hash
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS)
  }
}
