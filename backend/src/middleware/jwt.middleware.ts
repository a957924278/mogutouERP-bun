import { jwt } from "hono/jwt";
import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("JWT_SECRET is not defined in environment variables.");
}

// `jwt` 函数用于创建一个 JWT 中间件
// 它会检查请求头中的 Authorization: Bearer <token>
// 并将解码后的 payload 存储在 c.get('jwtPayload') 中

// 普通用户认证中间件（只需要登录即可）
export const requireAuth = jwt({
  secret: jwtSecret,
});

// 管理员权限验证中间件
// 需要先通过 authMiddleware 验证JWT，然后检查用户角色
export const requireAdmin = async (c: Context, next: Next) => {
  const payload = c.get('jwtPayload');
  
  if (!payload) {
    throw new HTTPException(401, {
      message: "需要登录认证",
    });
  }

  // 检查用户角色是否为管理员
  if (payload.role !== 'admin') {
    throw new HTTPException(403, {
      message: "需要管理员权限",
    });
  }

  await next();
};
