import { Hono } from "hono";
import { purchaseOrderController } from "./purchase-order.controller";
import { requireAuth, requireAdmin } from "../../middleware/jwt.middleware";

const purchaseOrderRouter = new Hono();

// 创建采购订单 - 需要登录认证和管理员权限
purchaseOrderRouter.post("/", requireAuth, requireAdmin, (c) => 
  purchaseOrderController.createPurchaseOrder(c)
);

// 获取所有采购订单（支持分页）- 需要登录认证和管理员权限
purchaseOrderRouter.get("/", requireAuth, requireAdmin, (c) => 
  purchaseOrderController.getAllPurchaseOrders(c)
);

// 确认采购订单 - 需要登录认证和管理员权限
purchaseOrderRouter.put("/:id/confirm", requireAuth, requireAdmin, (c) => 
  purchaseOrderController.confirmPurchaseOrder(c)
);

// 删除采购订单 - 需要登录认证和管理员权限
purchaseOrderRouter.delete("/:id", requireAuth, requireAdmin, (c) => 
  purchaseOrderController.deletePurchaseOrder(c)
);

export { purchaseOrderRouter }; 