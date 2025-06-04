<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full text-center">
      <div class="mb-8">
        <div class="flex justify-center mb-6">
          <img 
            src="@/assets/404_images/404.png" 
            alt="404"
            class="w-64 h-64"
            @error="hideImage"
          >
        </div>
        <h1 class="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 class="text-2xl font-semibold text-gray-700 mb-4">页面未找到</h2>
        <p class="text-gray-500 mb-8">
          抱歉，您访问的页面不存在。可能是页面地址错误或页面已被删除。
        </p>
      </div>
      
      <div class="space-y-4">
        <el-button 
          type="primary" 
          size="large" 
          @click="goHome"
          class="w-full"
        >
          返回首页
        </el-button>
        
        <el-button 
          size="large" 
          @click="goBack"
          class="w-full"
        >
          返回上一页
        </el-button>
      </div>
      
      <div class="mt-8 text-sm text-gray-400">
        <p>如果您认为这是一个错误，请联系系统管理员</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/dashboard');
};

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1);
  } else {
    router.push('/dashboard');
  }
};

const hideImage = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
};
</script>

<style scoped>
.error-page {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 100%;
    height: 100vh;
    background: #eef0fc;
    box-sizing: border-box;
}

.error-box {
    width: 400px;
    background-color: #fff;
    padding: 80px 50px;
    border-radius: 5px;
}

.error-code {
    line-height: 1;
    font-size: 100px;
    font-weight: bold;
    color: var(--el-color-primary);
    margin-bottom: 20px;
    text-align: center;
}

.error-desc {
    font-size: 20px;
    color: #777;
    text-align: center;
}

.error-handle {
    margin-top: 50px;
    text-align: center;
}

.error-btn {
    margin-left: 100px;
}
</style>
