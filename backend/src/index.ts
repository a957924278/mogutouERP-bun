import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { requireAuth } from "./middleware/jwt.middleware"; // 确保已导入

// 导入认证路由
import { authRouter } from "./features/auth/auth.router";
import { commodityRouter } from "./features/commodity/commodity.router";
import { customerOrderRouter } from "./features/customer-order/customer-order.router";
import { purchaseOrderRouter } from "./features/purchase-order/purchase-order.router";

const app = new Hono();

// 全局中间件
app.use(logger()); // 请求日志
app.use(cors()); // 跨域处理

// 错误处理中间件
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    // 处理 Hono 自己的 HTTP 异常，并确保返回 JSON 格式
    return c.json(
      {
        error: err.message,
        status: err.status,
        // 如果 HTTPException 包含 cause，也一并返回
        ...(err.cause ? { cause: err.cause } : {}),
      },
      err.status,
    );
  }
  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});

app.get("/", (c) => c.text("mogutouERP Backend is running!"));
app.route("/auth", authRouter); // 注册认证相关的路由
app.route("/commodities", commodityRouter); // 注册商品相关的路由
app.route("/customer-orders", customerOrderRouter); // 注册客户订单相关的路由
app.route("/purchase-orders", purchaseOrderRouter); // 注册采购订单相关的路由

app.get("/health", (c) => c.text("OK"));

console.log(`Server running on http://localhost:3000`);

// 示例：受保护的路由
app.get("/protected-data", requireAuth, (c) => {
  const jwtPayload = c.get("jwtPayload"); // 获取 JWT payload
  return c.json({
    message: "您已成功访问受保护的数据！",
    user: jwtPayload, // payload 包含用户ID和名称
    // ...其他敏感数据，但请注意不要直接返回敏感信息
  });
});

export default app;
