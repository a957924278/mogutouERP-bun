// src/features/auth/auth.schemas.ts
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "用户名不能为空"),
  tel: z.string().regex(/^1[3-9]\d{9}$/, "手机号格式不正确"), // 简单的手机号正则验证
  password: z.string().min(6, "密码至少需要6位"),
});

export const loginSchema = z.object({
  tel: z.string().regex(/^1[3-9]\d{9}$/, "手机号格式不正确"),
  password: z.string().min(1, "密码不能为空"),
});

export const updatePasswordSchema = z.object({
  oldPassword: z.string().min(1, "旧密码不能为空"),
  newPassword: z.string().min(6, "新密码至少需要6位"),
});

// TODO: 根据您的商品、客户订单等模型定义相应的 Zod Schema
