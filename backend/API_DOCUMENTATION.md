# 蘑菇头ERP系统 API 接口文档

## 基本信息

- **基础URL**: `http://localhost:3000`
- **接口格式**: JSON
- **认证方式**: JWT Token

## 通用响应格式

### 成功响应

```json
{
  "data": "响应数据",
  "meta": "元数据(分页等)"
}
```

### 错误响应

```json
{
  "error": "错误信息",
  "status": 400,
  "cause": "详细错误原因(可选)"
}
```

## 认证说明

### JWT Token 使用

- 在请求头中携带: `Authorization: Bearer <token>`
- Token 包含用户信息: `{ id, name, tel, role }`
- 角色类型: `admin`(管理员), `user`(普通用户)

### 权限说明

- 🔓 无需认证
- 🔒 需要登录
- 👑 需要管理员权限

---

## 1. 用户认证模块 (Auth)

### 1.1 用户注册 🔓

**POST** `/auth/register`

**请求体:**

```json
{
  "name": "用户姓名",
  "tel": "13800138000",
  "password": "123456"
}
```

**响应:**

```json
[
  {
    "id": "uuid",
    "name": "用户姓名",
    "tel": "13800138000",
    "role": "user"
  }
]
```

**字段验证:**

- `name`: 不能为空
- `tel`: 必须是有效的手机号格式 (1[3-9]xxxxxxxxx)
- `password`: 至少6位

---

### 1.2 用户登录 🔓

**POST** `/auth/login`

**请求体:**

```json
{
  "tel": "13800138000",
  "password": "123456"
}
```

**响应:**

```json
{
  "user": {
    "id": "uuid",
    "name": "用户姓名",
    "tel": "13800138000",
    "role": "admin"
  },
  "token": "jwt.token.here"
}
```

---

### 1.3 获取当前用户信息 🔒

**GET** `/auth/me`

**响应:**

```json
{
  "id": "uuid",
  "name": "用户姓名",
  "tel": "13800138000",
  "role": "admin"
}
```

---

### 1.4 修改密码 🔒

**PUT** `/auth/password`

**请求体:**

```json
{
  "oldPassword": "旧密码",
  "newPassword": "新密码"
}
```

**响应:**

```json
{
  "message": "密码更新成功"
}
```

---

### 1.5 删除用户 👑

**DELETE** `/auth/users/:id`

**响应:**

```json
{
  "message": "用户删除成功"
}
```

**注意:** 不能删除管理员用户

---

## 2. 商品管理模块 (Commodity)

### 2.1 创建商品 👑

**POST** `/commodities`

**请求体:**

```json
{
  "name": "商品名称",
  "colour": "颜色",
  "size": "尺寸",
  "brand": "品牌",
  "number": 100,
  "presaleNumber": 0,
  "salesVolume": 0,
  "price": 99.99,
  "purchasePrice": 50.00
}
```

**响应:**

```json
{
  "id": 1,
  "name": "商品名称",
  "colour": "颜色",
  "size": "尺寸",
  "brand": "品牌",
  "number": 100,
  "presaleNumber": 0,
  "salesVolume": 0,
  "price": 99.99,
  "purchasePrice": 50.00,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "deletedAt": null
}
```

---

### 2.2 获取商品列表 🔒

**GET** `/commodities`

**查询参数:**

- `name` (可选): 商品名称搜索
- `page` (可选): 页码，默认1
- `limit` (可选): 每页数量，默认10

**响应:**

```json
{
  "data": [
    {
      "id": 1,
      "name": "商品名称",
      "colour": "颜色",
      "size": "尺寸",
      "brand": "品牌",
      "number": 100,
      "presaleNumber": 0,
      "salesVolume": 0,
      "price": 99.99,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

**注意:** 普通用户看不到采购价格(`purchasePrice`)

---

### 2.3 管理员获取商品列表 👑

**GET** `/commodities/admin`

**查询参数:** 同2.2

**响应:** 包含所有字段，包括`purchasePrice`

---

### 2.4 获取单个商品 🔒

**GET** `/commodities/:id`

**响应:**

```json
{
  "id": 1,
  "name": "商品名称",
  "colour": "颜色",
  "size": "尺寸",
  "brand": "品牌",
  "number": 100,
  "presaleNumber": 0,
  "salesVolume": 0,
  "price": 99.99,
  "purchasePrice": 50.00,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "deletedAt": null
}
```

---

### 2.5 更新商品 👑

**PUT** `/commodities/:id`

**请求体:** (所有字段可选)

```json
{
  "name": "新商品名称",
  "price": 109.99
}
```

**响应:** 更新后的商品信息

---

### 2.6 删除商品 👑

**DELETE** `/commodities/:id`

**响应:**

```json
{
  "message": "商品删除成功"
}
```

---

## 3. 客户订单模块 (Customer Order)

### 3.1 创建客户订单 👑

**POST** `/customer-orders`

**请求体:**

```json
{
  "remarks": "订单备注(可选)",
  "amount": 299.99,
  "name": "客户姓名",
  "tel": "13800138000",
  "deliveryAddress": "送货地址",
  "deliveryTime": "2024-01-01 10:00",
  "deposit": 100.00,
  "goods": [
    {
      "id": "1",
      "number": 2
    },
    {
      "id": "3",
      "number": 1
    }
  ]
}
```

**响应:**

```json
{
  "id": 1,
  "operator": "操作员ID",
  "customerName": "客户姓名",
  "customerTel": "13800138000",
  "deliveryAddress": "送货地址",
  "deliveryTime": "2024-01-01 10:00",
  "amount": 299.99,
  "deposit": 100.00,
  "remarks": "订单备注",
  "state": "未完成",
  "freight": 0,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "deletedAt": null
}
```

**字段说明:**

- 创建订单时会自动增加商品的预售数量
- 订单状态默认为"未完成"
- 运费在确认时设定

---

### 3.2 获取客户订单列表 👑

**GET** `/customer-orders`

**查询参数:**

- `page` (可选): 页码，默认1
- `limit` (可选): 每页数量，默认10

**响应:**

```json
{
  "data": [
    {
      "id": 1,
      "operator": "操作员ID",
      "operatorName": "操作员姓名",
      "customerName": "客户姓名",
      "customerTel": "13800138000",
      "deliveryAddress": "送货地址",
      "deliveryTime": "2024-01-01 10:00",
      "amount": 299.99,
      "deposit": 100.00,
      "remarks": "订单备注",
      "state": "未完成",
      "freight": 0,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "goods": [
        {
          "id": 1,
          "name": "商品名称",
          "colour": "颜色",
          "size": "尺寸",
          "brand": "品牌",
          "price": 99.99,
          "number": 2
        }
      ]
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10
  }
}
```

---

### 3.3 确认客户订单 👑

**PUT** `/customer-orders/:id/confirm`

**请求体:**

```json
{
  "freight": 20.00
}
```

**响应:** 更新后的订单信息

**操作说明:**

- 检查商品库存是否充足
- 减少商品库存数量和预售数量
- 增加商品销量
- 更新订单状态为"已完成"
- 只有订单创建者可以确认

---

### 3.4 删除客户订单 👑

**DELETE** `/customer-orders/:id`

**响应:**

```json
{
  "message": "订单删除成功"
}
```

**操作说明:**

- 恢复商品预售数量
- 已确认订单无法删除
- 只有订单创建者可以删除

---

## 4. 采购订单模块 (Purchase Order)

### 4.1 创建采购订单 👑

**POST** `/purchase-orders`

**请求体:**

```json
{
  "remarks": "采购备注(可选)",
  "amount": 1000.00,
  "freight": 50.00,
  "goods": [
    {
      "id": "1",
      "number": 20
    },
    {
      "id": "2",
      "number": 10
    }
  ]
}
```

**响应:**

```json
{
  "id": 1,
  "operator": "操作员ID",
  "remarks": "采购备注",
  "amount": 1000.00,
  "freight": 50.00,
  "state": "未完成",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "deletedAt": null
}
```

---

### 4.2 获取采购订单列表 👑

**GET** `/purchase-orders`

**查询参数:**

- `page` (可选): 页码，默认1
- `limit` (可选): 每页数量，默认10

**响应:**

```json
{
  "data": [
    {
      "id": 1,
      "operator": "操作员ID",
      "operatorName": "操作员姓名",
      "remarks": "采购备注",
      "amount": 1000.00,
      "freight": 50.00,
      "state": "未完成",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "goods": [
        {
          "id": 1,
          "name": "商品名称",
          "colour": "颜色",
          "size": "尺寸",
          "brand": "品牌",
          "price": 99.99,
          "purchasePrice": 50.00,
          "number": 20
        }
      ]
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10
  }
}
```

---

### 4.3 确认采购订单 👑

**PUT** `/purchase-orders/:id/confirm`

**请求体:**

```json
{
  "freight": 60.00
}
```

**响应:** 更新后的订单信息

**操作说明:**

- 增加商品库存数量
- 更新订单状态为"已完成"
- 只有订单创建者可以确认

---

### 4.4 删除采购订单 👑

**DELETE** `/purchase-orders/:id`

**响应:**

```json
{
  "message": "采购订单删除成功"
}
```

**操作说明:**

- 已确认订单无法删除
- 只有订单创建者可以删除

---

## 5. 其他接口

### 5.1 健康检查 🔓

**GET** `/health`

**响应:** `OK`

---

### 5.2 首页 🔓

**GET** `/`

**响应:** `mogutouERP Backend is running!`

---

### 5.3 受保护数据示例 🔒

**GET** `/protected-data`

**响应:**

```json
{
  "message": "您已成功访问受保护的数据！",
  "user": {
    "id": "uuid",
    "name": "用户姓名",
    "tel": "13800138000",
    "role": "admin"
  }
}
```

---

## 6. 错误码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权/登录失效 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 7. 业务规则说明

### 用户角色

- `admin`: 管理员，拥有所有权限
- `user`: 普通用户，权限受限

### 订单状态

- `未完成`: 订单已创建，未确认
- `已完成`: 订单已确认，库存已更新

### 商品库存管理

- `number`: 实际库存数量
- `presaleNumber`: 预售数量（已下单但未确认）
- `salesVolume`: 累计销量

### 权限控制

- 只有订单创建者可以确认/删除自己的订单
- 管理员可以查看采购价格，普通用户不能
- 所有订单相关操作需要管理员权限

---

## 8. 开发环境

- **框架**: Hono.js
- **数据库**: SQLite + Drizzle ORM
- **认证**: JWT
- **运行时**: Bun
- **端口**: 3000
