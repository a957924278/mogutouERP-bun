import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { purchaseOrderService } from "./purchase-order.service";
import {
  createPurchaseOrderSchema,
  confirmPurchaseOrderSchema,
  getPurchaseOrderByIdSchema,
  deletePurchaseOrderSchema,
} from "./purchase-order.schemas";
import { z } from "zod";

export class PurchaseOrderController {
  async createPurchaseOrder(c: Context) {
    const body = await c.req.json();
    try {
      const validatedData = createPurchaseOrderSchema.parse(body);
      const jwtPayload = c.get('jwtPayload');
      
      if (!jwtPayload?.id) {
        throw new HTTPException(401, {
          message: "无法获取操作员信息",
        });
      }

      const newOrder = await purchaseOrderService.createPurchaseOrder(
        validatedData,
        jwtPayload.id
      );
      return c.json(newOrder, 201);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new HTTPException(400, {
          message: "请求参数验证失败",
          cause: error.errors,
        });
      }
      throw new HTTPException(400, {
        message: error instanceof Error ? error.message : "创建采购订单失败",
      });
    }
  }

  async getAllPurchaseOrders(c: Context) {
    try {
      const page = parseInt(c.req.query("page") || "1");
      const limit = parseInt(c.req.query("limit") || "10");

      const {
        orders,
        total,
        page: currentPage,
        limit: currentLimit,
      } = await purchaseOrderService.getAllPurchaseOrders(page, limit);
      
      return c.json({
        data: orders,
        meta: {
          total,
          page: currentPage,
          limit: currentLimit,
        },
      });
    } catch (error) {
      throw new HTTPException(500, {
        message: error instanceof Error ? error.message : "获取采购订单列表失败",
      });
    }
  }

  async deletePurchaseOrder(c: Context) {
    const { id } = c.req.param();
    try {
      deletePurchaseOrderSchema.parse({ id });
      const jwtPayload = c.get('jwtPayload');
      
      if (!jwtPayload?.id) {
        throw new HTTPException(401, {
          message: "无法获取操作员信息",
        });
      }
      
      const result = await purchaseOrderService.deletePurchaseOrder(id, jwtPayload.id);
      return c.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new HTTPException(400, {
          message: "请求参数验证失败",
          cause: error.errors,
        });
      }
      throw new HTTPException(400, {
        message: error instanceof Error ? error.message : "删除采购订单失败",
      });
    }
  }

  async confirmPurchaseOrder(c: Context) {
    const { id } = c.req.param();
    const body = await c.req.json();
    try {
      getPurchaseOrderByIdSchema.parse({ id });
      const validatedData = confirmPurchaseOrderSchema.parse(body);
      const jwtPayload = c.get('jwtPayload');
      
      if (!jwtPayload?.id) {
        throw new HTTPException(401, {
          message: "无法获取操作员信息",
        });
      }
      
      const updatedOrder = await purchaseOrderService.confirmPurchaseOrder(
        id,
        validatedData.freight || 0,
        jwtPayload.id
      );
      return c.json(updatedOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new HTTPException(400, {
          message: "请求参数验证失败",
          cause: error.errors,
        });
      }
      throw new HTTPException(400, {
        message: error instanceof Error ? error.message : "确认采购订单失败",
      });
    }
  }
}

export const purchaseOrderController = new PurchaseOrderController(); 