# 数据库迁移说明

## 客户订单系统重构

### 修改内容

#### 1. 商品表(commodities) - 修复null值问题

- `number` 字段：添加 `.notNull()` 约束
- `presaleNumber` 字段：添加 `.notNull()` 约束  
- `salesVolume` 字段：添加 `.notNull()` 约束

#### 2. 客户订单表(customer_orders) - 重大结构变更

- **移除字段**：`customer` (原先引用users表)
- **新增字段**：
  - `customer_name` (text, not null) - 客户姓名
  - `customer_tel` (text, not null) - 客户电话
- **修改字段**：
  - `freight` 字段：添加默认值0和 `.notNull()` 约束

#### 3. 索引调整

- 移除：`customer_orders_customer_idx`
- 新增：`customer_orders_customer_name_idx`
- 新增：`customer_orders_customer_tel_idx`

### 业务逻辑变更

1. **客户不再是系统用户**：客户信息直接存储在订单中，不在users表中创建记录
2. **角色明确**：
   - `admin` = 管理员/操作员（完全权限）
   - `user` = 工作人员（受限权限）
3. **简化查询**：订单列表查询不再需要复杂的用户表联接

### 数据迁移步骤（如果已有数据）

1. 为customer_orders表添加新字段
2. 从现有customer字段对应的users记录中复制客户信息到新字段
3. 移除customer字段和相关索引
4. 清理不再需要的客户用户记录（role='user'且为客户的记录）

### 注意事项

- 此修改是破坏性的，需要谨慎处理现有数据
- 建议在开发环境先完整测试
- 生产环境部署前请务必备份数据
