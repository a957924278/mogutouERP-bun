import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle", // 迁移文件输出目录
  driver: "turso", // Drizzle ORM 官方推荐的 SQLite 驱动标识
  dbCredentials: {
    url: "./mogutou.db", // SQLite 数据库文件路径
  },
} satisfies Config;
