// src/features/commodity/commodity.service.ts
import { db } from "../../db";
import { commodities } from "../../db/schema";
import { InferInsertModel, eq, like, isNull, count, and } from "drizzle-orm";

type NewCommodity = InferInsertModel<typeof commodities>;

export class CommodityService {
  async createCommodity(
    commodityData: Omit<
      NewCommodity,
      "id" | "createdAt" | "updatedAt" | "deletedAt"
    >,
  ) {
    const result = await db
      .insert(commodities)
      .values(commodityData)
      .returning();
    if (!result || result.length === 0) {
      throw new Error("创建商品失败");
    }
    return result[0];
  }

  async getCommodityById(id: string) {
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      throw new Error("商品ID格式不正确");
    }


    const commodity = await db
      .query
      .commodities
      .findFirst({
        where: (table, { eq, isNull }) =>
          and(eq(table.id, numericId), isNull(table.deletedAt)),
        // 注意！ and() 和 && 不一样！
      });

    if (!commodity) {
      throw new Error("商品不存在");
    }
    return commodity;
  }

  // 普通用户获取商品列表（不包含进价）
  async getAllCommodities(name?: string, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    let query = db
      .select({
        id: commodities.id,
        name: commodities.name,
        colour: commodities.colour,
        size: commodities.size,
        brand: commodities.brand,
        number: commodities.number,
        presaleNumber: commodities.presaleNumber,
        salesVolume: commodities.salesVolume,
        price: commodities.price,
        createdAt: commodities.createdAt,
        updatedAt: commodities.updatedAt,
      })
      .from(commodities)
      .where(isNull(commodities.deletedAt))
      .$dynamic();

    if (name) {
      query = query.where(like(commodities.name, `%${name}%`));
    }

    const commodityList = await query.offset(offset).limit(limit);

    // 获取总数，用于分页
    const totalCountResult = await db
      .select({ count: count() })
      .from(commodities)
      .where(isNull(commodities.deletedAt));
    const total = totalCountResult[0].count;

    return {
      commodities: commodityList,
      total,
      page,
      limit,
    };
  }

  // 管理员获取商品列表（包含进价）
  async getAllCommoditiesForAdmin(name?: string, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    let query = db
      .select()
      .from(commodities)
      .where(isNull(commodities.deletedAt))
      .$dynamic();

    if (name) {
      query = query.where(like(commodities.name, `%${name}%`));
    }

    const commodityList = await query.offset(offset).limit(limit);

    // 获取总数，用于分页
    const totalCountResult = await db
      .select({ count: count() })
      .from(commodities)
      .where(isNull(commodities.deletedAt));
    const total = totalCountResult[0].count;

    return {
      commodities: commodityList,
      total,
      page,
      limit,
    };
  }

  async updateCommodity(
    id: string,
    commodityData: Partial<
      Omit<NewCommodity, "id" | "createdAt" | "updatedAt" | "deletedAt">
    >,
  ) {
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      throw new Error("商品ID格式不正确");
    }

    const result = await db
      .update(commodities)
      .set({ ...commodityData, updatedAt: new Date() })
      .where(eq(commodities.id, numericId))
      .returning();
    if (!result || result.length === 0) {
      throw new Error("更新商品失败或商品不存在");
    }
    return result[0];
  }

  async deleteCommodity(id: string) {
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      throw new Error("商品ID格式不正确");
    }

    const result = await db
      .update(commodities)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(commodities.id, numericId))
      .returning();
    if (!result || result.length === 0) {
      throw new Error("删除商品失败或商品不存在");
    }
    return { message: "商品删除成功" };
  }
}

export const commodityService = new CommodityService();
