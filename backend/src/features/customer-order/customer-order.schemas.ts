import { z } from "zod";

// 订单商品项模式
export const orderGoodsItemSchema = z.object({
  id: z.string().regex(/^\d+$/, "商品ID必须是数字"),
  number: z.number().int().positive("商品数量必须是正整数"),
});

// 创建客户订单模式
export const createCustomerOrderSchema = z.object({
  remarks: z.string().optional(),
  amount: z.number().positive("订单总金额必须是正数"),
  name: z.string().min(1, "客户姓名不能为空"),
  tel: z.string().regex(/^1[3-9]\d{9}$/, "请输入有效的手机号码"),
  deliveryAddress: z.string().min(1, "送货地址不能为空"),
  deliveryTime: z.string().min(1, "送货时间不能为空"),
  deposit: z.number().min(0, "定金不能为负数"),
  goods: z.array(orderGoodsItemSchema).min(1, "至少需要一个商品"),
});

// 确认订单模式
export const confirmOrderSchema = z.object({
  freight: z.number().min(0, "运费不能为负数"),
});

// 获取订单ID模式
export const getOrderByIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "订单ID必须是数字"),
});

// 删除订单模式
export const deleteOrderSchema = z.object({
  id: z.string().regex(/^\d+$/, "订单ID必须是数字"),
}); 