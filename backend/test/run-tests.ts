// test/run-tests.ts
// 运行所有测试的主脚本

import { createDefaultUser } from "../scripts/createAdmin";

const RUN_TESTS_BASE_URL = "http://localhost:3000";

async function checkServerStatus() {
  console.log("检查服务器状态...");
  try {
    const response = await fetch(`${RUN_TESTS_BASE_URL}/health`, {
      method: "GET",
    });
    
    if (response.ok) {
      console.log("✅ 服务器运行正常");
      return true;
    } else {
      console.error("❌ 服务器响应异常");
      return false;
    }
  } catch (error) {
    console.error("❌ 无法连接到服务器，请确保服务器正在运行:");
    console.error("   运行: bun run dev");
    console.error("   或: bun start");
    return false;
  }
}

async function runTestFile(testFile: string, testName: string) {
  console.log(`\n🔄 运行${testName}...`);
  
  try {
    const childProcess = Bun.spawn(["bun", "run", testFile], {
      cwd: process.cwd(),
      stdio: ["inherit", "inherit", "inherit"],
    });
    
    const exitCode = await childProcess.exited;
    
    if (exitCode === 0) {
      console.log(`✅ ${testName}完成`);
      return true;
    } else {
      console.error(`❌ ${testName}失败，退出码: ${exitCode}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ ${testName}运行失败:`, error);
    return false;
  }
}

async function runAllTests() {
  // 测试前先创建一个固定的普通用户和管理员
  console.log("🔄 创建默认用户...");
  await createDefaultUser();

  console.log("🚀 开始运行完整测试套件\n");
  
  // 检查服务器状态
  const serverOk = await checkServerStatus();
  if (!serverOk) {
    process.exit(1);
  }

  console.log("\n" + "=".repeat(50));
  console.log("🔐 运行认证模块测试");
  console.log("=".repeat(50));
  
  const authTestSuccess = await runTestFile("test/auth.test.ts", "认证模块测试");
  if (!authTestSuccess) {
    process.exit(1);
  }

  console.log("\n" + "=".repeat(50));
  console.log("📦 运行商品模块测试");
  console.log("=".repeat(50));
  
  const commodityTestSuccess = await runTestFile("test/commodity.test.ts", "商品模块测试");
  if (!commodityTestSuccess) {
    process.exit(1);
  }

  console.log("\n" + "=".repeat(50));
  console.log("🎉 所有测试完成！");
  console.log("=".repeat(50));
}

// 运行测试
runAllTests().catch((error) => {
  console.error("测试套件运行失败:", error);
  process.exit(1);
}); 