// src/features/auth/auth.service.ts
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, comparePassword } from "@/utils/password";
import { InferInsertModel } from "drizzle-orm";
import { sign } from "hono/jwt";
import { eq } from "drizzle-orm";

type NewUser = InferInsertModel<typeof users>;

export class AuthService {
  private readonly jwtSecret: string;

  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in environment variables.");
    }
    this.jwtSecret = secret;
  }
  async register(userData: Omit<NewUser, "id" | "createdAt" | "role">) {
    // 排除自动生成字段
    // 检查手机号是否已存在
    const existingUser = await db.query.users.findFirst({
      where: (table, { eq, and, isNull }) =>
        and(eq(table.tel, userData.tel), isNull(table.deletedAt)),
    });
    if (existingUser) {
      throw new Error("手机号已注册");
    }

    const hashedPassword = await hashPassword(userData.password);
    const newUser = {
      ...userData,
      id: crypto.randomUUID(),
      password: hashedPassword,
      role: "user",
    };
    // 使用uuid生成id
    const result = await db.insert(users).values(newUser).returning({
      id: users.id,
      name: users.name,
      tel: users.tel,
      role: users.role,
    });

    if (!result) {
      throw new Error("注册用户失败");
    }
    return result;
  }

  async login(tel: string, passwordPlain: string) {
    const user = await db.query.users.findFirst({
      where: (table, { eq }) => eq(table.tel, tel),
    });

    if (!user) {
      throw new Error("账号不存在");
    }

    if (user.deletedAt) {
      throw new Error("用户已注销");
    }

    const isValidPassword = await comparePassword(passwordPlain, user.password);
    if (!isValidPassword) {
      throw new Error("密码错误");
    }

    const payload = {
      id: user.id,
      name: user.name,
      tel: user.tel,
      role: user.role,
    };

    const token = await sign(payload, this.jwtSecret);
    return { user, token };
  }

  async updatePassword(
    id: string,
    oldPasswordPlain: string,
    newPasswordPlain: string,
  ) {
    const user = await db.query.users.findFirst({
      where: (table, { eq }) => eq(table.id, id),
    });

    if (!user) {
      throw new Error("用户不存在");
    }

    if (user.deletedAt) {
      throw new Error("用户已注销");
    }

    const isValidPassword = await comparePassword(
      oldPasswordPlain,
      user.password,
    );
    if (!isValidPassword) {
      throw new Error("旧密码不正确");
    }

    const newHashedPassword = await hashPassword(newPasswordPlain);

    const result = await db
      .update(users)
      .set({ password: newHashedPassword, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning({ id: users.id });

    if (!result || result.length === 0) {
      throw new Error("更新密码失败");
    }
    return result[0];
  }

  async deleteUser(userId: string) {
    const userToDelete = await db.query.users.findFirst({
      where: (table, { eq }) => eq(table.id, userId),
    });

    if (!userToDelete) {
      throw new Error("用户不存在");
    }

    if (userToDelete.role === "admin") {
      throw new Error("不能删除管理员用户");
    }

    const result = await db
      .update(users)
      .set({ updatedAt: new Date(), deletedAt: new Date() })
      .where(eq(users.id, userId))
      .returning({ id: users.id });

    if (!result || result.length === 0) {
      throw new Error("删除用户失败");
    }
  }

  async createAdminUser(userData: Omit<NewUser, "id" | "createdAt" | "role">) {
    const existingUser = await db.query.users.findFirst({
      where: (table, { eq }) => eq(table.tel, userData.tel),
    });

    if (existingUser) {
      throw new Error("手机号已注册");
    }

    const hashedPassword = await hashPassword(userData.password);
    const newAdminUser = {
      ...userData,
      id: crypto.randomUUID(),
      password: hashedPassword,
      role: "admin", // 直接设置为 admin 角色
    };

    const result = await db.insert(users).values(newAdminUser).returning({
      id: users.id,
      name: users.name,
      tel: users.tel,
      role: users.role,
    });

    if (!result) {
      throw new Error("创建管理员用户失败");
    }
    return result;
  }
}

export const authService = new AuthService();
