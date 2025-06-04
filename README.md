# 蘑菇头ERP系统 - Monorepo

一个基于Vue 3 + Hono + Bun的现代化ERP系统，采用Monorepo架构管理前后端代码。

## 📁 **项目结构**

```
mogutou-erp-monorepo/
├── frontend/                 # Vue 3前端应用
│   ├── src/                 # 前端源码
│   ├── public/              # 静态资源
│   ├── package.json         # 前端依赖
│   └── vite.config.ts       # Vite配置
├── backend/                 # Hono后端API
│   ├── src/                 # 后端源码
│   ├── drizzle/             # 数据库迁移
│   ├── package.json         # 后端依赖
│   └── test/                # 测试文件
├── package.json             # 工作空间配置
└── README.md               # 项目说明
```

## 🚀 **快速开始**

该项目使用运行时bun管理前后端。

### 启动准备

```bash
bun i
bun run db:init
bun run dev
```

还需要创建一个初始的管理员用户+普通用户（创建用户写到了测试里边实在是不好意思orz
```
bun run backend\test\auth.test.ts
```

管理员用户是13800138000, adminpassword
普通用户是13800138001, userpassword

### 访问应用
- 前端：http://localhost:5173
- 后端：http://localhost:3000

### 构建项目

```bash
bun run build:frontend
bun run build:backend
```

```bash
bun run build
```

## 📚 **技术栈**

### 前端 (frontend/)
- **框架**: Vue 3 + TypeScript
- **UI库**: Element Plus
- **CSS**: Tailwind CSS
- **状态管理**: Pinia
- **构建工具**: Vite

### 后端 (backend/)
- **框架**: Hono
- **运行时**: Bun
- **数据库**: SQLite + Drizzle ORM
- **认证**: JWT
- **校验**: Zod

## 📖 **详细文档**

- [前端开发文档](./README_FRONTEND.md)
- [后端API文档](./README_backend.md)
- [API接口文档](./API_DOCUMENTATION.md)

## 🚦 **项目状态**

- ✅ 基础架构完成 (95%)
- ✅ 用户认证系统 (90%)  
- ✅ 商品管理系统 (95%)
- ✅ 订单管理系统 (95%)
- ⏳ 数据统计报表 (0%)