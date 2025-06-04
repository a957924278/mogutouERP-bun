// test/commodity.test.ts
// 确保您的服务器正在运行，例如在另一个终端中 `bun start`

const COMMODITY_BASE_URL = "http://localhost:3000"; // 您后端服务的地址

// 预设的测试用户
const commodityTestUser = {
  tel: "13800138001",
  password: "userpassword",
};

const commodityAdminUser = {
  tel: "13800138000", 
  password: "adminpassword",
};

let userToken: string | undefined; // 普通用户token
let adminToken: string | undefined; // 管理员token
let createdCommodityId: number | undefined; // 创建的商品ID，用于后续测试

// 测试商品数据
const testCommodity = {
  name: `测试商品_${Date.now()}`,
  colour: "红色",
  size: "大",
  brand: "测试品牌",
  price: 299.99,
  purchasePrice: 199.99,
  number: 100,
  presaleNumber: 10,
  salesVolume: 0,
};

async function runCommodityTests() {
  console.log("--- 开始运行商品管理测试 ---");

  // 准备工作：登录获取tokens
  await loginUser();
  await loginAdmin();

  // 测试创建商品
  await testCreateCommodity();

  // 测试获取商品列表（普通用户）
  await testGetCommoditiesAsUser();

  // 测试获取商品列表（管理员）
  await testGetCommoditiesAsAdmin();

  // 测试获取单个商品
  await testGetCommodityById();

  // 测试更新商品
  await testUpdateCommodity();

  // 测试删除商品
  await testDeleteCommodity();

  // 权限测试
  await testPermissions();

  // 参数验证测试
  await testValidation();

  console.log("--- 商品管理测试完成 ---");
}

async function loginUser() {
  console.log("\n--- 登录普通用户 ---");
  try {
    const response = await fetch(`${COMMODITY_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commodityTestUser),
    });

    const data = await response.json();

    if (response.ok && data.token) {
      userToken = data.token;
      console.log("普通用户登录成功");
    } else {
      console.error("普通用户登录失败:", data);
      process.exit(1);
    }
  } catch (error) {
    console.error("普通用户登录请求失败:", error);
    process.exit(1);
  }
}

async function loginAdmin() {
  console.log("\n--- 登录管理员用户 ---");
  try {
    const response = await fetch(`${COMMODITY_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commodityAdminUser),
    });

    const data = await response.json();

    if (response.ok && data.token) {
      adminToken = data.token;
      console.log("管理员用户登录成功");
    } else {
      console.error("管理员用户登录失败:", data);
      process.exit(1);
    }
  } catch (error) {
    console.error("管理员用户登录请求失败:", error);
    process.exit(1);
  }
}

async function testCreateCommodity() {
  console.log("\n--- 测试创建商品 ---");
  
  if (!adminToken) {
    console.error("未获取到管理员Token，跳过此测试");
    return;
  }

  try {
    const response = await fetch(`${COMMODITY_BASE_URL}/commodities`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`,
      },
      body: JSON.stringify(testCommodity),
    });

    const data = await response.json();

    if (response.ok && response.status === 201) {
      console.log("创建商品成功:", data);
      createdCommodityId = data.id;
      
      // 验证返回的数据
      if (data.name === testCommodity.name && data.price === testCommodity.price) {
        console.log("返回数据验证成功");
      } else {
        console.error("返回数据验证失败");
        process.exit(1);
      }
    } else {
      console.error("创建商品失败:", data);
      process.exit(1);
    }
  } catch (error) {
    console.error("创建商品请求失败:", error);
    process.exit(1);
  }
}

async function testGetCommoditiesAsUser() {
  console.log("\n--- 测试获取商品列表（普通用户）---");
  
  if (!userToken) {
    console.error("未获取到用户Token，跳过此测试");
    return;
  }

  try {
    const response = await fetch(`${COMMODITY_BASE_URL}/commodities?page=1&limit=10`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${userToken}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log("获取商品列表成功，商品数量:", data.data?.length || 0);
      
      // 验证返回格式
      if (data.data && Array.isArray(data.data) && data.meta) {
        console.log("返回数据格式验证成功");
        
        // 验证普通用户看不到进价
        if (data.data.length > 0) {
          const firstItem = data.data[0];
          if (firstItem.purchasePrice === undefined) {
            console.log("普通用户权限验证成功：无法看到进价");
          } else {
            console.error("权限验证失败：普通用户可以看到进价");
            process.exit(1);
          }
        }
      } else {
        console.error("返回数据格式验证失败");
        process.exit(1);
      }
    } else {
      console.error("获取商品列表失败:", data);
      process.exit(1);
    }
  } catch (error) {
    console.error("获取商品列表请求失败:", error);
    process.exit(1);
  }
}

async function testGetCommoditiesAsAdmin() {
  console.log("\n--- 测试获取商品列表（管理员）---");
  
  if (!adminToken) {
    console.error("未获取到管理员Token，跳过此测试");
    return;
  }

  try {
    const response = await fetch(`${COMMODITY_BASE_URL}/commodities/admin?page=1&limit=10`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${adminToken}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log("管理员获取商品列表成功，商品数量:", data.data?.length || 0);
      
      // 验证管理员可以看到进价
      if (data.data && data.data.length > 0) {
        const firstItem = data.data[0];
        if (firstItem.purchasePrice !== undefined) {
          console.log("管理员权限验证成功：可以看到进价");
        } else {
          console.error("权限验证失败：管理员无法看到进价");
          process.exit(1);
        }
      }
    } else {
      console.error("管理员获取商品列表失败:", data);
      process.exit(1);
    }
  } catch (error) {
    console.error("管理员获取商品列表请求失败:", error);
    process.exit(1);
  }
}

async function testGetCommodityById() {
  console.log("\n--- 测试获取单个商品 ---");
  
  if (!userToken || !createdCommodityId) {
    console.error("缺少必要条件，跳过此测试");
    return;
  }

  try {
    const response = await fetch(`${COMMODITY_BASE_URL}/commodities/${createdCommodityId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${userToken}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log("获取单个商品成功:", data.name);
      console.dir(data);
      console.log(createdCommodityId)
      
      // 验证返回的商品ID正确
      if (data.id === createdCommodityId) {
        console.log("商品ID验证成功");
      } else {
        console.error("商品ID验证失败");
        process.exit(1);
      }
    } else {
      console.error("获取单个商品失败:", data);
      process.exit(1);
    }
  } catch (error) {
    console.error("获取单个商品请求失败:", error);
    process.exit(1);
  }
}

async function testUpdateCommodity() {
  console.log("\n--- 测试更新商品 ---");
  
  if (!adminToken || !createdCommodityId) {
    console.error("缺少必要条件，跳过此测试");
    return;
  }

  const updateData = {
    name: `更新后的商品_${Date.now()}`,
    price: 399.99,
  };

  try {
    const response = await fetch(`${COMMODITY_BASE_URL}/commodities/${createdCommodityId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`,
      },
      body: JSON.stringify(updateData),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("更新商品成功:", data.name);
      
      // 验证更新的数据
      if (data.name === updateData.name && data.price === updateData.price) {
        console.log("更新数据验证成功");
      } else {
        console.error("更新数据验证失败");
        process.exit(1);
      }
    } else {
      console.error("更新商品失败:", data);
      process.exit(1);
    }
  } catch (error) {
    console.error("更新商品请求失败:", error);
    process.exit(1);
  }
}

async function testDeleteCommodity() {
  console.log("\n--- 测试删除商品 ---");
  
  if (!adminToken || !createdCommodityId) {
    console.error("缺少必要条件，跳过此测试");
    return;
  }

  try {
    const response = await fetch(`${COMMODITY_BASE_URL}/commodities/${createdCommodityId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${adminToken}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log("删除商品成功:", data.message);
    } else {
      console.error("删除商品失败:", data);
      process.exit(1);
    }
  } catch (error) {
    console.error("删除商品请求失败:", error);
    process.exit(1);
  }
}

async function testPermissions() {
  console.log("\n--- 测试权限控制 ---");

  // 测试无token访问
  await testNoTokenAccess();
  
  // 测试普通用户访问管理员接口
  await testUserAccessAdminEndpoint();
  
  // 测试普通用户尝试创建商品
  await testUserCreateCommodity();
}

async function testNoTokenAccess() {
  console.log("\n--- 测试无token访问 ---");
  
  try {
    const response = await fetch(`${COMMODITY_BASE_URL}/commodities`, {
      method: "GET",
    });

    const data = await response.json();

    if (response.status === 401) {
      console.log("无token访问被正确拒绝:", data.message);
    } else {
      console.error(`预期401状态码，实际收到${response.status}:`, data);
      process.exit(1);
    }
  } catch (error) {
    console.error("无token访问请求失败:", error);
    process.exit(1);
  }
}

async function testUserAccessAdminEndpoint() {
  console.log("\n--- 测试普通用户访问管理员接口 ---");
  
  if (!userToken) {
    console.error("未获取到用户Token，跳过此测试");
    return;
  }

  try {
    const response = await fetch(`${COMMODITY_BASE_URL}/commodities/admin`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${userToken}`,
      },
    });

    const data = await response.json();

    if (response.status === 403) {
      console.log("普通用户访问管理员接口被正确拒绝:", data.message);
    } else {
      console.error(`预期403状态码，实际收到${response.status}:`, data);
      process.exit(1);
    }
  } catch (error) {
    console.error("普通用户访问管理员接口请求失败:", error);
    process.exit(1);
  }
}

async function testUserCreateCommodity() {
  console.log("\n--- 测试普通用户尝试创建商品 ---");
  
  if (!userToken) {
    console.error("未获取到用户Token，跳过此测试");
    return;
  }

  try {
    const response = await fetch(`${COMMODITY_BASE_URL}/commodities`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${userToken}`,
      },
      body: JSON.stringify(testCommodity),
    });

    const data = await response.json();

    if (response.status === 403) {
      console.log("普通用户创建商品被正确拒绝:", data.message);
    } else {
      console.error(`预期403状态码，实际收到${response.status}:`, data);
      process.exit(1);
    }
  } catch (error) {
    console.error("普通用户创建商品请求失败:", error);
    process.exit(1);
  }
}

async function testValidation() {
  console.log("\n--- 测试参数验证 ---");

  if (!adminToken) {
    console.error("未获取到管理员Token，跳过此测试");
    return;
  }

  // 测试缺少必需字段
  await testMissingFields();
  
  // 测试无效数据类型
  await testInvalidDataTypes();
  
  // 测试无效ID格式
  await testInvalidIdFormat();
}

async function testMissingFields() {
  console.log("\n--- 测试缺少必需字段 ---");
  
  const invalidCommodity = {
    name: "测试商品",
    // 缺少必需字段: colour, size, brand, price, purchasePrice
  };

  try {
    const response = await fetch(`${COMMODITY_BASE_URL}/commodities`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`,
      },
      body: JSON.stringify(invalidCommodity),
    });

    const data = await response.json();

    if (response.status === 400) {
      console.log("缺少必需字段验证成功:", data.message);
    } else {
      console.error(`预期400状态码，实际收到${response.status}:`, data);
      process.exit(1);
    }
  } catch (error) {
    console.error("缺少必需字段测试请求失败:", error);
    process.exit(1);
  }
}

async function testInvalidDataTypes() {
  console.log("\n--- 测试无效数据类型 ---");
  
  const invalidCommodity = {
    name: "测试商品",
    colour: "红色",
    size: "大",
    brand: "测试品牌",
    price: "不是数字", // 应该是number
    purchasePrice: 199.99,
  };

  try {
    const response = await fetch(`${COMMODITY_BASE_URL}/commodities`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`,
      },
      body: JSON.stringify(invalidCommodity),
    });

    const data = await response.json();

    if (response.status === 400) {
      console.log("无效数据类型验证成功:", data.message);
    } else {
      console.error(`预期400状态码，实际收到${response.status}:`, data);
      process.exit(1);
    }
  } catch (error) {
    console.error("无效数据类型测试请求失败:", error);
    process.exit(1);
  }
}

async function testInvalidIdFormat() {
  console.log("\n--- 测试无效ID格式 ---");
  
  if (!userToken) {
    console.error("未获取到用户Token，跳过此测试");
    return;
  }

  try {
    const response = await fetch(`${COMMODITY_BASE_URL}/commodities/invalid-id`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${userToken}`,
      },
    });

    const data = await response.json();

    if (response.status === 400) {
      console.log("无效ID格式验证成功:", data.message);
    } else {
      console.error(`预期400状态码，实际收到${response.status}:`, data);
      process.exit(1);
    }
  } catch (error) {
    console.error("无效ID格式测试请求失败:", error);
    process.exit(1);
  }
}

// 运行所有测试
runCommodityTests().catch((err) => {
  console.error("商品测试过程中发生未捕获的错误:", err);
  process.exit(1);
});

// 导出函数使其成为模块
export { runCommodityTests };