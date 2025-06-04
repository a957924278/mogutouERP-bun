// test/auth.test.ts
// 确保您的服务器正在运行，例如在另一个终端中 `bun start`

let userToDeleteGlobal: {
  name: string;
  tel: string;
  password: string;
} = { name: "", tel: "", password: "" };

const AUTH_BASE_URL = "http://localhost:3000"; // 您后端服务的地址

const authTestUser = {
  name: `测试用户_${Date.now()}`, // 每次运行生成唯一用户
  tel: `13${Math.floor(Math.random() * 900000000) + 100000000}`, // 随机生成手机号
  password: "testpassword123",
};

console.dir(authTestUser);

let authToken: string | undefined; // 用于存储登录后获取的 JWT Token

async function runTests() {
  console.log("--- 开始运行鉴权测试 ---");

  // 测试注册
  await testRegister();

  // 测试登录
  await testLogin();

  // 测试访问受保护资源（成功）
  await testProtectedResourceSuccess();

  // 测试访问受保护资源（无权限）
  await testProtectedResourceUnauthorized();

  // 测试更新密码
  await testUpdatePassword();

  // 测试删除用户
  await testDeleteUser();

  // 测试登录已删除用户
  await testLoginDeletedUser();

  console.log("--- 鉴权测试完成 ---");
}

async function testRegister() {
  console.log("\n--- 测试注册 ---");
  try {
    const response = await fetch(`${AUTH_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(authTestUser),
    });

    const data = await response.json();

    if (response.ok && response.status === 201) {
      console.log("注册成功:", data);
      // 可以在这里验证返回的用户信息
    } else {
      console.error("注册失败:", data);
      process.exit(1); // 失败则退出
    }
  } catch (error) {
    console.error("注册请求发送失败:", error);
    process.exit(1);
  }
}

async function testLogin() {
  console.log("\n--- 测试登录 ---");
  try {
    const response = await fetch(`${AUTH_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tel: authTestUser.tel,
        password: authTestUser.password,
      }),
    });

    const data = await response.json();

    if (response.ok && data.token) {
      authToken = data.token;
      console.log("登录成功，获取到Token:", authToken);
    } else {
      console.error("登录失败:", data);
      process.exit(1);
    }
  } catch (error) {
    console.error("登录请求发送失败:", error);
    process.exit(1);
  }
}

async function testProtectedResourceSuccess() {
  console.log("\n--- 测试访问受保护资源（成功） ---");
  if (!authToken) {
    console.error("未获取到认证Token，跳过此测试。");
    return;
  }

  try {
    const response = await fetch(`${AUTH_BASE_URL}/protected-data`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log("访问受保护资源成功:", data);
    } else {
      console.error("访问受保护资源失败:", data);
      process.exit(1);
    }
  } catch (error) {
    console.error("访问受保护资源请求发送失败:", error);
    process.exit(1);
  }
}

async function testProtectedResourceUnauthorized() {
  console.log("\n--- 测试访问受保护资源（无权限） ---");
  try {
    // 不发送 Authorization header 或发送无效 token
    const response = await fetch(`${AUTH_BASE_URL}/protected-data`, {
      method: "GET",
    });

    const data = await response.json();

    if (response.status === 401) {
      // 检查是否返回 401 Unauthorized
      console.log("成功阻止无权限访问:", data);
    } else {
      console.error(`预期 401 状态码，实际收到 ${response.status}:`, data);
      process.exit(1);
    }
  } catch (error) {
    console.error("无权限访问请求发送失败:", error);
    process.exit(1);
  }
}

async function testUpdatePassword() {
  console.log("\n--- 测试更新密码 ---");
  if (!authToken) {
    console.error("未获取到认证Token，跳过此测试。");
    return;
  }

  const newPassword = "newSafepassword456";
  const oldPassword = authTestUser.password; // 使用注册时设置的密码作为旧密码

  try {
    const response = await fetch(`${AUTH_BASE_URL}/auth/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        oldPassword: oldPassword,
        newPassword: newPassword,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("密码更新成功:", data);
      // 可以选择更新 authTestUser.password 以便后续测试使用新密码
      authTestUser.password = newPassword;
    } else {
      console.error("密码更新失败:", data);
      process.exit(1);
    }
  } catch (error) {
    console.error("更新密码请求发送失败:", error);
    process.exit(1);
  }
}

// 预设的 admin 用户用于测试
const authAdminUser = {
  tel: "13800138000",
  password: "adminpassword",
};

let adminAuthToken: string | undefined; // 用于存储管理员的 JWT Token

async function loginAdmin() {
  console.log("\n--- 登录 Admin 用户 ---");
  try {
    const response = await fetch(`${AUTH_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tel: authAdminUser.tel,
        password: authAdminUser.password,
      }),
    });

    const data = await response.json();

    if (response.ok && data.token) {
      adminAuthToken = data.token;
      console.log("Admin 登录成功，获取到Token:", adminAuthToken);
    } else {
      console.error("Admin 登录失败:", data);
      process.exit(1);
    }
  } catch (error) {
    console.error("Admin 登录请求发送失败:", error);
    process.exit(1);
  }
}

async function testDeleteUser() {
  console.log("\n--- 测试删除用户 ---\n");

  await loginAdmin();
  if (!adminAuthToken) {
    console.error("未获取到 Admin 认证Token，跳过此测试。");
    return;
  }

  // 为了测试删除用户, 我们需要创建一个新的普通用户来删除 (确保其不是 Admin)
  const userToDelete = {
    name: `待删除用户_${Date.now()}`,
    tel: `13${Math.floor(Math.random() * 900000000) + 100000000}`,
    password: "todeletepassword",
  };

  try {
    // 注册待删除用户
    const registerResponse = await fetch(`${AUTH_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userToDelete),
    });
    const registeredUser = await registerResponse.json();
    if (!registerResponse.ok || registerResponse.status !== 201) {
      console.error("注册待删除用户失败:", registeredUser);
      process.exit(1);
    }
    console.log("成功注册待删除用户，ID:", registeredUser[0].id);
    const userIdToDelete = registeredUser[0].id;

    // 使用 Admin 用户的 token 删除测试注册的用户
    const deleteResponse = await fetch(
      `${AUTH_BASE_URL}/auth/users/${userIdToDelete}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminAuthToken}`, // 使用 Admin 的 token
        },
      },
    );

    const data = await deleteResponse.json();

    if (deleteResponse.ok) {
      console.log("删除用户成功:", data);
      // 将已删除用户的信息保存到全局变量以供后续测试使用
      userToDeleteGlobal = userToDelete;
    } else {
      console.error("删除用户失败:", data);
      process.exit(1);
    }
  } catch (error) {
    console.error("删除用户请求发送失败:", error);
    process.exit(1);
  }
}

async function testLoginDeletedUser() {
  console.log("\n--- 测试登录已删除用户 ---");

  // 检查是否有已删除的用户信息
  if (!userToDeleteGlobal || userToDeleteGlobal.name === "") {
    console.error("未找到已删除用户信息，跳过此测试。");
    return;
  }

  const deletedUserCredentials = userToDeleteGlobal;

  try {
    const response = await fetch(`${AUTH_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tel: deletedUserCredentials.tel,
        password: deletedUserCredentials.password,
      }),
    });

    const data = await response.json();

    // 预期登录失败，应该返回错误状态码和"用户已注销"的错误信息
    if (!response.ok && data.error && data.error.includes("用户已注销")) {
      console.log("已删除用户登录被正确拒绝:", data);
    } else if (response.ok) {
      console.error("错误：已删除用户仍然可以登录:", data);
      process.exit(1);
    } else {
      console.error("已删除用户登录失败，但错误信息不符合预期:", data);
      process.exit(1);
    }
  } catch (error) {
    console.error("登录已删除用户请求发送失败:", error);
    process.exit(1);
  }
}

// 运行所有测试
runTests().catch((err) => {
  console.error("测试过程中发生未捕获的错误:", err);
  process.exit(1);
});

// 导出函数使其成为模块
export { runTests };
