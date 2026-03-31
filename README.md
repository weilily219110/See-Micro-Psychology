# See Micro Psychology (见微心理)

付费解锁制心理测评平台，面向小红书/咸鱼用户。

## 技术栈

- **前端**: Next.js 14 + Tailwind CSS + TypeScript
- **后端**: Node.js + Express + TypeScript
- **数据库**: PostgreSQL + Redis
- **部署**: Vercel (前端) + Railway (后端)

## 项目结构

```
See-Micro-Psychology/
├── apps/
│   ├── web/          # 前端应用
│   └── api/         # 后端 API
├── packages/
│   └── shared/      # 共享类型定义
└── docs/            # 需求文档
```

## 功能模块

- ✅ 兑换码激活体系（1/3/5次卡 + SVIP）
- ✅ 设备指纹防盗版
- ✅ 测评广场展示与解锁
- ✅ 测评 iframe 容器
- ✅ 报告查看与图片导出
- ✅ 管理后台（码管理 + 测评管理 + 数据概览）

## 开发

```bash
# 安装依赖
npm install

# 启动前端开发服务器
npm run dev:web

# 启动后端开发服务器
npm run dev:api
```

## 相关链接

- 前端: https://jianweiixinli.com
- 管理后台: https://admin.jianweiixinli.com
