import { db } from "../../db";
import { customerOrders, customerGoods, commodities } from "../../db/schema";
import { eq, isNull, and, count } from "drizzle-orm";
import { createCustomerOrderSchema } from "./customer-order.schemas";
import { z } from "zod";

type CreateOrderData = z.infer<typeof createCustomerOrderSchema>;

export class CustomerOrderService {
  async createCustomerOrder(orderData: CreateOrderData, operatorId: string) {
    return await db.transaction(async (tx) => {
      // 1. 验证商品并增加预售数量
      for (const goodsItem of orderData.goods) {
        const goodsId = parseInt(goodsItem.id); // Controller已校验格式，这里直接转换

        const commodity = await tx.query.commodities.findFirst({
          where: (table, { eq, isNull, and }) =>
            and(eq(table.id, goodsId), isNull(table.deletedAt)),
        });

        if (!commodity) {
          throw new Error(`商品不存在: ID ${goodsId}`);
        }

        // 增加预售数量
        await tx
          .update(commodities)
          .set({
            presaleNumber: commodity.presaleNumber + goodsItem.number,
            updatedAt: new Date(),
          })
          .where(eq(commodities.id, goodsId));
      }

      // 2. 创建订单
      const newOrder = await tx
        .insert(customerOrders)
        .values({
          operator: operatorId,
          customerName: orderData.name,
          customerTel: orderData.tel,
          deliveryAddress: orderData.deliveryAddress,
          deliveryTime: orderData.deliveryTime,
          amount: orderData.amount,
          deposit: orderData.deposit,
          remarks: orderData.remarks,
          state: "未完成",
          freight: 0, // 创建时运费为0
        })
        .returning();

      const order = newOrder[0];

      // 3. 创建订单商品关联记录
      for (const goodsItem of orderData.goods) {
        const goodsId = parseInt(goodsItem.id);
        await tx.insert(customerGoods).values({
          customerOrderId: order.id,
          goodsId: goodsId,
          number: goodsItem.number,
        });
      }

      return order;
    });
  }

  async getAllCustomerOrders(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;

    // 获取订单列表
    const orders = await db
      .select({
        id: customerOrders.id,
        operator: customerOrders.operator,
        customerName: customerOrders.customerName,
        customerTel: customerOrders.customerTel,
        deliveryAddress: customerOrders.deliveryAddress,
        deliveryTime: customerOrders.deliveryTime,
        amount: customerOrders.amount,
        deposit: customerOrders.deposit,
        remarks: customerOrders.remarks,
        state: customerOrders.state,
        freight: customerOrders.freight,
        createdAt: customerOrders.createdAt,
        updatedAt: customerOrders.updatedAt,
      })
      .from(customerOrders)
      .where(isNull(customerOrders.deletedAt))
      .offset(offset)
      .limit(limit);

    // 为每个订单获取商品详情和操作员信息
    const ordersWithGoods = await Promise.all(
      orders.map(async (order) => {
        // 获取订单商品详情
        const goods = await db
          .select({
            id: commodities.id,
            name: commodities.name,
            colour: commodities.colour,
            size: commodities.size,
            brand: commodities.brand,
            price: commodities.price,
            number: customerGoods.number,
          })
          .from(customerGoods)
          .leftJoin(commodities, eq(customerGoods.goodsId, commodities.id))
          .where(
            and(
              eq(customerGoods.customerOrderId, order.id),
              isNull(customerGoods.deletedAt),
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
      .from(customerOrders)
      .where(isNull(customerOrders.deletedAt));
    const total = totalCountResult[0].count;

    return {
      orders: ordersWithGoods,
      total,
      page,
      limit,
    };
  }

  async deleteCustomerOrder(id: string, operatorId: string) {
    const numericId = parseInt(id);

    return await db.transaction(async (tx) => {
      // 1. 查找订单
      const order = await tx.query.customerOrders.findFirst({
        where: (table, { eq, isNull, and }) =>
          and(eq(table.id, numericId), isNull(table.deletedAt)),
      });

      if (!order) {
        throw new Error("订单不存在");
      }

      // 2. 检查订单状态
      if (order.state === "已完成") {
        throw new Error("已确认的订单无法删除");
      }

      // 3. 检查操作者权限：只有订单创建者可以删除订单
      if (order.operator !== operatorId) {
        throw new Error("只有订单创建者可以删除订单");
      }

      // 4. 获取订单商品列表，恢复预售数量
      const orderGoods = await tx.query.customerGoods.findMany({
        where: (table, { eq, isNull, and }) =>
          and(eq(table.customerOrderId, numericId), isNull(table.deletedAt)),
      });

      for (const goodsItem of orderGoods) {
        const commodity = await tx.query.commodities.findFirst({
          where: (table, { eq, isNull, and }) =>
            and(eq(table.id, goodsItem.goodsId), isNull(table.deletedAt)),
        });

        if (commodity) {
          // 恢复预售数量
          await tx
            .update(commodities)
            .set({
              presaleNumber: Math.max(0, commodity.presaleNumber - goodsItem.number),
              updatedAt: new Date(),
            })
            .where(eq(commodities.id, goodsItem.goodsId));
        }

        // 软删除订单商品记录
        await tx
          .update(customerGoods)
          .set({
            deletedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(customerGoods.id, goodsItem.id));
      }

      // 5. 软删除订单
      await tx
        .update(customerOrders)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(customerOrders.id, numericId));

      return { message: "订单删除成功" };
    });
  }

  async confirmCustomerOrder(id: string, freight: number, operatorId: string) {
    const numericId = parseInt(id); // Controller已校验格式，这里直接转换

    return await db.transaction(async (tx) => {
      // 1. 查找订单
      const order = await tx.query.customerOrders.findFirst({
        where: (table, { eq, isNull, and }) =>
          and(eq(table.id, numericId), isNull(table.deletedAt)),
      });

      if (!order) {
        throw new Error("订单不存在");
      }

      if (order.state === "已完成") {
        throw new Error("订单已经确认过了");
      }

      // 2. 检查操作者权限：只有订单创建者可以确认订单
      if (order.operator !== operatorId) {
        throw new Error("只有订单创建者可以确认订单");
      }

      // 3. 获取订单商品列表
      const orderGoods = await tx.query.customerGoods.findMany({
        where: (table, { eq, isNull, and }) =>
          and(eq(table.customerOrderId, numericId), isNull(table.deletedAt)),
      });

      // 4. 检查库存并更新商品数据
      for (const goodsItem of orderGoods) {
        const commodity = await tx.query.commodities.findFirst({
          where: (table, { eq, isNull, and }) =>
            and(eq(table.id, goodsItem.goodsId), isNull(table.deletedAt)),
        });

        if (!commodity) {
          throw new Error(`商品不存在: ID ${goodsItem.goodsId}`);
        }

        // 检查库存是否充足
        if (commodity.number < goodsItem.number) {
          throw new Error(
            `商品 "${commodity.name}" 库存不足，当前库存: ${commodity.number}，需要: ${goodsItem.number}`
          );
        }

        // 减少预售数量、库存数量，增加销量
        await tx
          .update(commodities)
          .set({
            presaleNumber: Math.max(0, commodity.presaleNumber - goodsItem.number),
            number: commodity.number - goodsItem.number,
            salesVolume: commodity.salesVolume + goodsItem.number,
            updatedAt: new Date(),
          })
          .where(eq(commodities.id, goodsItem.goodsId));
      }

      // 5. 更新订单状态
      const updatedOrder = await tx
        .update(customerOrders)
        .set({
          state: "已完成",
          freight: freight,
          updatedAt: new Date(),
        })
        .where(eq(customerOrders.id, numericId))
        .returning();

      return updatedOrder[0];
    });
  }
}

export const customerOrderService = new CustomerOrderService(); 