import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { customerOrderService } from "./customer-order.service";
import {
  createCustomerOrderSchema,
  confirmOrderSchema,
  getOrderByIdSchema,
  deleteOrderSchema,
} from "./customer-order.schemas";
import { z } from "zod";

export class CustomerOrderController {
  async createCustomerOrder(c: Context) {
    const body = await c.req.json();
    try {
      const validatedData = createCustomerOrderSchema.parse(body);
      const jwtPayload = c.get('jwtPayload');
      
      if (!jwtPayload?.id) {
        throw new HTTPException(401, {
          message: "无法获取操作员信息",
        });
      }

      const newOrder = await customerOrderService.createCustomerOrder(
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
        message: error instanceof Error ? error.message : "创建订单失败",
      });
    }
  }

  async getAllCustomerOrders(c: Context) {
    try {
      const page = parseInt(c.req.query("page") || "1");
      const limit = parseInt(c.req.query("limit") || "10");

      const {
        orders,
        total,
        page: currentPage,
        limit: currentLimit,
      } = await customerOrderService.getAllCustomerOrders(page, limit);
      
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
        message: error instanceof Error ? error.message : "获取订单列表失败",
      });
    }
  }

  async deleteCustomerOrder(c: Context) {
    const { id } = c.req.param();
    try {
      deleteOrderSchema.parse({ id });
      const jwtPayload = c.get('jwtPayload');
      
      if (!jwtPayload?.id) {
        throw new HTTPException(401, {
          message: "无法获取操作员信息",
        });
      }
      
      const result = await customerOrderService.deleteCustomerOrder(id, jwtPayload.id);
      return c.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new HTTPException(400, {
          message: "请求参数验证失败",
          cause: error.errors,
        });
      }
      throw new HTTPException(400, {
        message: error instanceof Error ? error.message : "删除订单失败",
      });
    }
  }

  async confirmCustomerOrder(c: Context) {
    const { id } = c.req.param();
    const body = await c.req.json();
    try {
      getOrderByIdSchema.parse({ id });
      const validatedData = confirmOrderSchema.parse(body);
      const jwtPayload = c.get('jwtPayload');
      
      if (!jwtPayload?.id) {
        throw new HTTPException(401, {
          message: "无法获取操作员信息",
        });
      }
      
      const updatedOrder = await customerOrderService.confirmCustomerOrder(
        id,
        validatedData.freight,
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
        message: error instanceof Error ? error.message : "确认订单失败",
      });
    }
  }
}

export const customerOrderController = new CustomerOrderController(); 