import { Hono } from "hono";
import { commodityController } from "./commodity.controller";
import { requireAuth, requireAdmin } from "../../middleware/jwt.middleware";

const commodityRouter = new Hono();

// 创建商品 - 需要管理员权限
commodityRouter.post("/", requireAuth, requireAdmin, (c) => commodityController.createCommodity(c));

// 获取所有商品（支持分页和搜索）- 普通用户（不包含进价）- 需要登录认证
commodityRouter.get("/", requireAuth, (c) => commodityController.getAllCommodities(c));

// 管理员获取所有商品（包含进价）- 需要管理员权限
// 注意：这个路由必须在 /:id 之前定义，否则 "admin" 会被当作 id 参数
commodityRouter.get("/admin", requireAuth, requireAdmin, (c) => commodityController.getAllCommoditiesForAdmin(c));

// 获取单个商品 - 需要登录认证
commodityRouter.get("/:id", requireAuth, (c) => commodityController.getCommodityById(c));

// 更新商品 - 需要管理员权限
commodityRouter.put("/:id", requireAuth, requireAdmin, (c) => commodityController.updateCommodity(c));

// 删除商品 - 需要管理员权限
commodityRouter.delete("/:id", requireAuth, requireAdmin, (c) => commodityController.deleteCommodity(c));

export { commodityRouter };
