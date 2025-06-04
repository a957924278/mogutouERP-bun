// src/db/schema.ts
import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  real,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// 仅users使用uuid作为主键，其余表全部使用自增主键
// 用户表（系统用户：admin=管理员/操作员，user=受限权限工作人员）
export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    tel: text("tel").notNull(), // 电话作为唯一的用户标识
    role: text("role").notNull(), // 角色
    password: text("password").notNull(), // 存储加密后的密码
    createdAt: integer("created_at", { mode: "timestamp" }).default(
      sql`(current_timestamp)`,
    ),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(
      sql`(current_timestamp)`,
    ),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (table) => [
    uniqueIndex("tel_unique_active_idx")
      .on(table.tel)
      .where(sql`deleted_at IS NULL`),
  ],
);

// TODO: 根据您的 Go 项目中的 models/commodity.go 定义其他表，例如 commodities, customerOrders, purchaseOrders 等

// 商品表
export const commodities = sqliteTable(
  "commodities",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    colour: text("colour").notNull(),
    size: text("size").notNull(),
    brand: text("brand").notNull(),
    number: integer("number").default(0).notNull(),
    presaleNumber: integer("presale_number").default(0).notNull(),
    salesVolume: integer("sales_volume").default(0).notNull(),
    price: real("price").notNull(),
    purchasePrice: real("purchase_price").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(
      sql`(current_timestamp)`,
    ),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(
      sql`(current_timestamp)`,
    ),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (table) => [
    index("name_idx").on(table.name),
    index("colour_idx").on(table.colour),
    index("size_idx").on(table.size),
    index("brand_idx").on(table.brand),
  ],
);

// customerOrders 客户订单表
export const customerOrders = sqliteTable(
  "customer_orders",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    operator: text("operator") // 操作员 ID，对应 users.id
      .notNull()
      .references(() => users.id),
    customerName: text("customer_name").notNull(), // 客户姓名
    customerTel: text("customer_tel").notNull(), // 客户电话
    deliveryAddress: text("delivery_address").notNull(), // 送货地址
    deliveryTime: text("delivery_time").notNull(), // 送货时间
    amount: real("amount").notNull(), // 订单总金额
    deposit: real("deposit").notNull(), // 订单定金
    remarks: text("remarks"), // 备注
    state: text("state").notNull().default("未完成"), // 订单状态
    freight: real("freight").default(0).notNull(), // 运费
    createdAt: integer("created_at", { mode: "timestamp" }).default(
      sql`(current_timestamp)`,
    ),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(
      sql`(current_timestamp)`,
    ),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (table) => [
    index("customer_orders_operator_idx").on(table.operator),
    index("customer_orders_customer_name_idx").on(table.customerName),
    index("customer_orders_customer_tel_idx").on(table.customerTel),
    index("customer_orders_delivery_address_idx").on(table.deliveryAddress),
    index("customer_orders_delivery_time_idx").on(table.deliveryTime),
    index("customer_orders_amount_idx").on(table.amount),
    index("customer_orders_freight_idx").on(table.freight),
    index("customer_orders_deposit_idx").on(table.deposit),
    index("customer_orders_state_idx").on(table.state),
  ],
);

// CustormerGoods 客户订单详细商品表
export const customerGoods = sqliteTable(
  "customer_goods",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    customerOrderId: integer("customer_order_id")
      .notNull()
      .references(() => customerOrders.id),
    goodsId: integer("goods_id")
      .notNull()
      .references(() => commodities.id),
    number: integer("number").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(
      sql`(current_timestamp)`,
    ),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(
      sql`(current_timestamp)`,
    ),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (table) => [
    index("customer_goods_number_idx").on(table.number),
    uniqueIndex("customer_goods_unique").on(
      table.customerOrderId,
      table.goodsId,
    ),
  ],
);

// PurchaseOrders 采购订单表
export const purchaseOrders = sqliteTable(
  "purchase_orders",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    operator: text("operator") // 操作员 ID，对应 users.id
      .notNull()
      .references(() => users.id),
    remarks: text("remarks"),
    amount: real("amount").notNull(), // 订单总金额
    freight: real("freight").notNull(), // 运费
    state: text("state").notNull().default("未完成"), // 订单状态
    createdAt: integer("created_at", { mode: "timestamp" }).default(
      sql`(current_timestamp)`,
    ),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(
      sql`(current_timestamp)`,
    ),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (table) => [
    index("purchase_orders_operator_id_idx").on(table.operator),
    index("purchase_orders_amount_idx").on(table.amount),
    index("purchase_orders_state_idx").on(table.state),
  ],
);

// PurchaseGoods 采购订单详细商品表
export const purchaseGoods = sqliteTable(
  "purchase_goods",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    purchaseOrderId: integer("purchase_order_id")
      .notNull()
      .references(() => purchaseOrders.id),
    goodsId: integer("goods_id")
      .notNull()
      .references(() => commodities.id),
    number: integer("number").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(
      sql`(current_timestamp)`,
    ),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(
      sql`(current_timestamp)`,
    ),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (table) => [
    index("purchase_goods_number_idx").on(table.number),
    uniqueIndex("purchase_goods_unique").on(
      table.purchaseOrderId,
      table.goodsId,
    ),
  ],
);
