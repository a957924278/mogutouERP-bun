// src/features/commodity/commodity.controller.ts
import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { commodityService } from "./commodity.service";
import {
  createCommoditySchema,
  updateCommoditySchema,
  getCommodityByIdSchema,
  deleteCommoditySchema,
} from "./commodity.schemas";
import { z } from "zod";

export class CommodityController {
  async createCommodity(c: Context) {
    const body = await c.req.json();
    try {
      const validatedData = createCommoditySchema.parse(body);
      const newCommodity = await commodityService.createCommodity(validatedData);
      return c.json(newCommodity, 201);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new HTTPException(400, {
          message: "请求参数验证失败",
          cause: error.errors,
        });
      }
      throw new HTTPException(400, {
        message: error instanceof Error ? error.message : "创建商品失败",
      });
    }
  }

  async getCommodityById(c: Context) {
    const { id } = c.req.param();
    try {
      getCommodityByIdSchema.parse({ id }); // 验证ID格式
      const commodity = await commodityService.getCommodityById(id);
      return c.json(commodity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new HTTPException(400, {
          message: "请求参数验证失败",
          cause: error.errors,
        });
      }
      throw new HTTPException(404, {
        message: error instanceof Error ? error.message : "商品不存在",
      });
    }
  }

  async getAllCommodities(c: Context) {
    try {
      const name = c.req.query("name");
      const page = parseInt(c.req.query("page") || "1");
      const limit = parseInt(c.req.query("limit") || "10");

      const {
        commodities,
        total,
        page: currentPage,
        limit: currentLimit,
      } = await commodityService.getAllCommodities(name, page, limit);
      return c.json({
        data: commodities,
        meta: {
          total,
          page: currentPage,
          limit: currentLimit,
        },
      });
    } catch (error) {
      throw new HTTPException(500, {
        message: error instanceof Error ? error.message : "获取商品列表失败",
      });
    }
  }

  async getAllCommoditiesForAdmin(c: Context) {
    try {
      const name = c.req.query("name");
      const page = parseInt(c.req.query("page") || "1");
      const limit = parseInt(c.req.query("limit") || "10");

      const {
        commodities,
        total,
        page: currentPage,
        limit: currentLimit,
      } = await commodityService.getAllCommoditiesForAdmin(name, page, limit);
      return c.json({
        data: commodities,
        meta: {
          total,
          page: currentPage,
          limit: currentLimit,
        },
      });
    } catch (error) {
      throw new HTTPException(500, {
        message: error instanceof Error ? error.message : "获取商品列表失败",
      });
    }
  }

  async updateCommodity(c: Context) {
    const { id } = c.req.param();
    const body = await c.req.json();
    try {
      getCommodityByIdSchema.parse({ id }); // 验证ID格式
      const validatedData = updateCommoditySchema.parse(body);
      const updatedCommodity = await commodityService.updateCommodity(
        id,
        validatedData,
      );
      return c.json(updatedCommodity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new HTTPException(400, {
          message: "请求参数验证失败",
          cause: error.errors,
        });
      }
      throw new HTTPException(400, {
        message: error instanceof Error ? error.message : "更新商品失败",
      });
    }
  }

  async deleteCommodity(c: Context) {
    const { id } = c.req.param();
    try {
      deleteCommoditySchema.parse({ id }); // 验证ID格式
      const result = await commodityService.deleteCommodity(id);
      return c.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new HTTPException(400, {
          message: "请求参数验证失败",
          cause: error.errors,
        });
      }
      throw new HTTPException(400, {
        message: error instanceof Error ? error.message : "删除商品失败",
      });
    }
  }
}

export const commodityController = new CommodityController();
