// src/features/auth/auth.router.ts
import { Hono } from "hono";
import { authController } from "./auth.controller";
import { requireAuth } from "@/middleware/jwt.middleware"; // 导入 JWT 中间件

export const authRouter = new Hono();

// 注册路由 (无需登录或鉴权)
authRouter.post("/register", authController.register);

// 登录路由 (无需登录或鉴权)
authRouter.post("/login", authController.login);

// 获取当前用户信息的路由 (需要鉴权)
authRouter.get("/me", requireAuth, authController.getCurrentUser);

// 更新用户密码 (需要鉴权)
authRouter.put("/password", requireAuth, authController.updatePassword);

// 删除用户 (需要admin权限，且不能删除admin)
authRouter.delete("/users/:id", requireAuth, authController.deleteUser);
