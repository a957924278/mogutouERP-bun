// src/features/commodity/commodity.schemas.ts
import { z } from "zod";

export const createCommoditySchema = z.object({
  name: z.string().min(1, "商品名称不能为空"),
  colour: z.string().min(1, "颜色不能为空"),
  size: z.string().min(1, "尺寸不能为空"),
  brand: z.string().min(1, "品牌不能为空"),
  number: z.number().int().min(0, "库存不能为负数").default(0),
  presaleNumber: z.number().int().min(0, "预售数量不能为负数").default(0),
  salesVolume: z.number().int().min(0, "销量不能为负数").default(0),
  price: z.number().positive("价格必须是正数"),
  purchasePrice: z.number().positive("采购价格必须是正数"),
});

export const updateCommoditySchema = z.object({
  name: z.string().min(1, "商品名称不能为空").optional(),
  colour: z.string().min(1, "颜色不能为空").optional(),
  size: z.string().min(1, "尺寸不能为空").optional(),
  brand: z.string().min(1, "品牌不能为空").optional(),
  number: z.number().int().min(0, "库存不能为负数").optional(),
  presaleNumber: z.number().int().min(0, "预售数量不能为负数").optional(),
  salesVolume: z.number().int().min(0, "销量不能为负数").optional(),
  price: z.number().positive("价格必须是正数").optional(),
  purchasePrice: z.number().positive("采购价格必须是正数").optional(),
});

export const getCommodityByIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "商品ID必须是数字"),
});

export const deleteCommoditySchema = z.object({
  id: z.string().regex(/^\d+$/, "商品ID必须是数字"),
});
