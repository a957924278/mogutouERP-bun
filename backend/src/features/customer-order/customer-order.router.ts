import { Hono } from "hono";
import { customerOrderController } from "./customer-order.controller";
import { requireAuth, requireAdmin } from "../../middleware/jwt.middleware";

const customerOrderRouter = new Hono();

// 创建客户订单 - 需要登录认证和管理员权限
customerOrderRouter.post("/", requireAuth, requireAdmin, (c) => 
  customerOrderController.createCustomerOrder(c)
);

// 获取所有客户订单（支持分页）- 需要登录认证和管理员权限
customerOrderRouter.get("/", requireAuth, requireAdmin, (c) => 
  customerOrderController.getAllCustomerOrders(c)
);

// 确认客户订单 - 需要登录认证和管理员权限
customerOrderRouter.put("/:id/confirm", requireAuth, requireAdmin, (c) => 
  customerOrderController.confirmCustomerOrder(c)
);

// 删除客户订单 - 需要登录认证和管理员权限
customerOrderRouter.delete("/:id", requireAuth, requireAdmin, (c) => 
  customerOrderController.deleteCustomerOrder(c)
);

export { customerOrderRouter }; 