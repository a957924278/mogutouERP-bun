import { z } from "zod";

// 采购商品项模式
export const purchaseGoodsItemSchema = z.object({
  id: z.string().regex(/^\d+$/, "商品ID必须是数字"),
  number: z.number().int().positive("商品数量必须是正整数"),
});

// 创建采购订单模式
export const createPurchaseOrderSchema = z.object({
  remarks: z.string().optional(),
  amount: z.number().positive("订单总金额必须是正数"),
  freight: z.number().min(0, "运费不能为负数").default(0),
  goods: z.array(purchaseGoodsItemSchema).min(1, "至少需要一个商品"),
});

// 确认采购订单模式
export const confirmPurchaseOrderSchema = z.object({
  freight: z.number().min(0, "运费不能为负数").optional(),
});

// 获取采购订单ID模式
export const getPurchaseOrderByIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "采购订单ID必须是数字"),
});

// 删除采购订单模式
export const deletePurchaseOrderSchema = z.object({
  id: z.string().regex(/^\d+$/, "采购订单ID必须是数字"),
}); 