// src/features/auth/auth.controller.ts
import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { authService } from "./auth.service";
import {
  registerSchema,
  loginSchema,
  updatePasswordSchema,
} from "./auth.schemas";
import { z } from "zod";
import { db } from "@/db";

export class AuthController {
  async register(c: Context) {
    const body = await c.req.json();
    try {
      const validatedData = registerSchema.parse(body);
      const newUser = await authService.register(validatedData);
      return c.json(newUser, 201); // 201 Created
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new HTTPException(400, {
          message: "请求参数验证失败",
          cause: error.errors,
        });
      }
      throw new HTTPException(400, {
        message: error instanceof Error ? error.message : "注册失败",
      });
    }
  }

  async login(c: Context) {
    const body = await c.req.json();
    try {
      const validatedData = loginSchema.parse(body);
      const { user, token } = await authService.login(
        validatedData.tel,
        validatedData.password,
      );
      return c.json({
        user: {
          id: user.id,
          name: user.name,
          tel: user.tel,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new HTTPException(400, {
          message: "请求参数验证失败",
          cause: error.errors,
        });
      }
      throw new HTTPException(401, {
        message: error instanceof Error ? error.message : "登录失败",
      }); // 401 Unauthorized
    }
  }

  async getCurrentUser(c: Context) {
    const jwtPayload = c.get("jwtPayload"); // 获得 JWT 中间件解析出的 payload
    if (!jwtPayload || !jwtPayload.id) {
      throw new HTTPException(401, { message: "未授权或用户信息缺失" });
    }

    const user = await db.query.users.findFirst({
      where: (table, { eq }) => eq(table.id, jwtPayload.id),
      columns: {
        id: true,
        name: true,
        tel: true,
        role: true,
      },
    });

    if (!user) {
      throw new HTTPException(404, { message: "用户不存在" });
    }

    return c.json({
      id: user.id,
      name: user.name,
      tel: user.tel,
      role: user.role,
    });
  }

  async updatePassword(c: Context) {
    const id = c.get("jwtPayload").id; // 从 JWT Payload 中获取用户 ID
    const body = await c.req.json();
    try {
      const validatedData = updatePasswordSchema.parse(body); // 重用 loginSchema 验证tel和password，虽然这里只需要password
      await authService.updatePassword(
        id,
        validatedData.oldPassword,
        validatedData.newPassword,
      );
      return c.json({ message: "密码更新成功" }, 200);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new HTTPException(400, {
          message: "请求参数验证失败",
          cause: error.errors,
        });
      }
      throw new HTTPException(400, {
        message: error instanceof Error ? error.message : "密码更新失败",
      });
    }
  }

  async deleteUser(c: Context) {
    const jwtPayload = c.get("jwtPayload");
    if (!jwtPayload || !jwtPayload.id || jwtPayload.role !== "admin") {
      throw new HTTPException(403, { message: "无权限操作" });
    }

    const { id } = c.req.param();
    try {
      await authService.deleteUser(id);
      return c.json({ message: "用户删除成功" });
    } catch (error) {
      throw new HTTPException(400, {
        message: error instanceof Error ? error.message : "删除用户失败",
      });
    }
  }
}

export const authController = new AuthController();
