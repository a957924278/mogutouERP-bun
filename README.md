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

## 🎯 **新架构优势**

### 1. **统一依赖管理**
- 所有包依赖在根级别统一管理
- 避免版本冲突
- 简化CI/CD流程

### 2. **开发体验优化**
- 一键启动前后端服务
- 统一的脚本命令
- 类型安全的跨包引用

### 3. **构建优化**
- 并行构建前后端
- 共享构建缓存
- 独立部署支持

### 4. **维护效率**
- 单仓库版本控制
- 统一的代码规范
- 简化项目配置

## 🚦 **项目状态**

- ✅ 基础架构完成 (95%)
- ✅ 用户认证系统 (90%)  
- ✅ 商品管理系统 (95%)
- ✅ 订单管理系统 (95%)
- ⏳ 数据统计报表 (0%)

## 📝 **贡献指南**

1. Clone项目：`git clone <repo-url>`
2. 安装依赖：`npm install`
3. 创建分支：`git checkout -b feature/your-feature`
4. 提交更改：`git commit -am 'Add some feature'`
5. 推送分支：`git push origin feature/your-feature`
6. 创建PR

## 📄 **许可证**

私有项目，请勿未经授权使用。
