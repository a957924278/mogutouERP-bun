import { db } from "../../db";
import { purchaseOrders, purchaseGoods, commodities, users } from "../../db/schema";
import { eq, isNull, and, count } from "drizzle-orm";
import { createPurchaseOrderSchema } from "./purchase-order.schemas";
import { z } from "zod";

type CreatePurchaseOrderData = z.infer<typeof createPurchaseOrderSchema>;

export class PurchaseOrderService {
  async createPurchaseOrder(orderData: CreatePurchaseOrderData, operatorId: string) {
    return await db.transaction(async (tx) => {
      // 1. 验证商品存在性
      for (const goodsItem of orderData.goods) {
        const goodsId = parseInt(goodsItem.id); // Controller已校验格式，这里直接转换

        const commodity = await tx.query.commodities.findFirst({
          where: (table, { eq, isNull, and }) =>
            and(eq(table.id, goodsId), isNull(table.deletedAt)),
        });

        if (!commodity) {
          throw new Error(`商品不存在: ID ${goodsId}`);
        }
      }

      // 2. 创建采购订单
      const newOrder = await tx
        .insert(purchaseOrders)
        .values({
          operator: operatorId,
          remarks: orderData.remarks,
          amount: orderData.amount,
          freight: orderData.freight || 0,
          state: "未完成",
        })
        .returning();

      const order = newOrder[0];

      // 3. 创建采购订单商品关联记录
      for (const goodsItem of orderData.goods) {
        const goodsId = parseInt(goodsItem.id);
        await tx.insert(purchaseGoods).values({
          purchaseOrderId: order.id,
          goodsId: goodsId,
          number: goodsItem.number,
        });
      }

      return order;
    });
  }

  async getAllPurchaseOrders(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;

    // 获取采购订单列表
    const orders = await db
      .select({
        id: purchaseOrders.id,
        operator: purchaseOrders.operator,
        remarks: purchaseOrders.remarks,
        amount: purchaseOrders.amount,
        freight: purchaseOrders.freight,
        state: purchaseOrders.state,
        createdAt: purchaseOrders.createdAt,
        updatedAt: purchaseOrders.updatedAt,
      })
      .from(purchaseOrders)
      .where(isNull(purchaseOrders.deletedAt))
      .offset(offset)
      .limit(limit);

    // 为每个订单获取商品详情和操作员信息
    const ordersWithGoods = await Promise.all(
      orders.map(async (order) => {
        // 获取采购订单商品详情
        const goods = await db
          .select({
            id: commodities.id,
            name: commodities.name,
            colour: commodities.colour,
            size: commodities.size,
            brand: commodities.brand,
            price: commodities.price,
            purchasePrice: commodities.purchasePrice,
            number: purchaseGoods.number,
          })
          .from(purchaseGoods)
          .leftJoin(commodities, eq(purchaseGoods.goodsId, commodities.id))
          .where(
            and(
              eq(purchaseGoods.purchaseOrderId, order.id),
              isNull(purchaseGoods.deletedAt),
              isNull(commodities.deletedAt)
            )
          );

        // 获取操作员信息
        const operator = await db.query.users.findFirst({
          where: (table, { eq, isNull, and }) =>
            and(eq(table.id, order.operator), isNull(table.deletedAt)),
        });

        return {
          ...order,
          operatorName: operator?.name || "未知操作员",
          goods,
        };
      })
    );

    // 获取总数
    const totalCountResult = await db
      .select({ count: count() })
      .from(purchaseOrders)
      .where(isNull(purchaseOrders.deletedAt));
    const total = totalCountResult[0].count;

    return {
      orders: ordersWithGoods,
      total,
      page,
      limit,
    };
  }

  async deletePurchaseOrder(id: string, operatorId: string) {
    const numericId = parseInt(id); // Controller已校验格式，这里直接转换

    return await db.transaction(async (tx) => {
      // 1. 查找采购订单
      const order = await tx.query.purchaseOrders.findFirst({
        where: (table, { eq, isNull, and }) =>
          and(eq(table.id, numericId), isNull(table.deletedAt)),
      });

      if (!order) {
        throw new Error("采购订单不存在");
      }

      // 2. 检查订单状态
      if (order.state === "已完成") {
        throw new Error("已确认的采购订单无法删除");
      }

      // 3. 检查操作者权限：只有订单创建者可以删除订单
      if (order.operator !== operatorId) {
        throw new Error("只有采购订单创建者可以删除订单");
      }

      // 4. 软删除采购订单商品记录
      const orderGoods = await tx.query.purchaseGoods.findMany({
        where: (table, { eq, isNull, and }) =>
          and(eq(table.purchaseOrderId, numericId), isNull(table.deletedAt)),
      });

      for (const goodsItem of orderGoods) {
        await tx
          .update(purchaseGoods)
          .set({
            deletedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(purchaseGoods.id, goodsItem.id));
      }

      // 5. 软删除采购订单
      await tx
        .update(purchaseOrders)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(purchaseOrders.id, numericId));

      return { message: "采购订单删除成功" };
    });
  }

  async confirmPurchaseOrder(id: string, freight: number = 0, operatorId: string) {
    const numericId = parseInt(id); // Controller已校验格式，这里直接转换

    return await db.transaction(async (tx) => {
      // 1. 查找采购订单
      const order = await tx.query.purchaseOrders.findFirst({
        where: (table, { eq, isNull, and }) =>
          and(eq(table.id, numericId), isNull(table.deletedAt)),
      });

      if (!order) {
        throw new Error("采购订单不存在");
      }

      if (order.state === "已完成") {
        throw new Error("采购订单已经确认过了");
      }

      // 2. 检查操作者权限：只有订单创建者可以确认订单
      if (order.operator !== operatorId) {
        throw new Error("只有采购订单创建者可以确认订单");
      }

      // 3. 获取采购订单商品列表
      const orderGoods = await tx.query.purchaseGoods.findMany({
        where: (table, { eq, isNull, and }) =>
          and(eq(table.purchaseOrderId, numericId), isNull(table.deletedAt)),
      });

      // 4. 增加商品库存数量
      for (const goodsItem of orderGoods) {
        const commodity = await tx.query.commodities.findFirst({
          where: (table, { eq, isNull, and }) =>
            and(eq(table.id, goodsItem.goodsId), isNull(table.deletedAt)),
        });

        if (!commodity) {
          throw new Error(`商品不存在: ID ${goodsItem.goodsId}`);
        }

        // 增加库存数量
        await tx
          .update(commodities)
          .set({
            number: commodity.number + goodsItem.number,
            updatedAt: new Date(),
          })
          .where(eq(commodities.id, goodsItem.goodsId));
      }

      // 5. 更新采购订单状态
      const updatedOrder = await tx
        .update(purchaseOrders)
        .set({
          state: "已完成",
          freight: freight,
          updatedAt: new Date(),
        })
        .where(eq(purchaseOrders.id, numericId))
        .returning();

      return updatedOrder[0];
    });
  }
}

export const purchaseOrderService = new PurchaseOrderService(); 