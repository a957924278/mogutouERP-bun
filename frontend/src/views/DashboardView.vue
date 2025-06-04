<template>
  <div class="dashboard-view">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">仪表盘</h1>
      <p class="text-gray-600 mt-2">欢迎回来，{{ authStore.user?.name }}！</p>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100">
            <el-icon class="text-blue-600 text-xl">
              <Goods />
            </el-icon>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">商品总数</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.totalCommodities }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-100">
            <el-icon class="text-green-600 text-xl">
              <ShoppingCart />
            </el-icon>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">客户订单</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.totalCustomerOrders }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-purple-100">
            <el-icon class="text-purple-600 text-xl">
              <ShoppingBag />
            </el-icon>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">采购订单</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.totalPurchaseOrders }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-yellow-100">
            <el-icon class="text-yellow-600 text-xl">
              <User />
            </el-icon>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">当前角色</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ authStore.user?.role === 'admin' ? '管理员' : '普通用户' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速访问 -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">快速访问</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <router-link
          to="/commodities"
          class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <el-icon class="text-blue-600 text-xl mr-3">
            <Goods />
          </el-icon>
          <span class="text-gray-700">商品管理</span>
        </router-link>

        <router-link
          v-if="authStore.isAdmin"
          to="/customer-orders"
          class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <el-icon class="text-green-600 text-xl mr-3">
            <ShoppingCart />
          </el-icon>
          <span class="text-gray-700">客户订单</span>
        </router-link>

        <router-link
          v-if="authStore.isAdmin"
          to="/purchase-orders"
          class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <el-icon class="text-purple-600 text-xl mr-3">
            <ShoppingBag />
          </el-icon>
          <span class="text-gray-700">采购订单</span>
        </router-link>

        <router-link
          to="/stock"
          class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <el-icon class="text-orange-600 text-xl mr-3">
            <DataAnalysis />
          </el-icon>
          <span class="text-gray-700">库存查询</span>
        </router-link>
      </div>
    </div>

    <!-- 系统信息 -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">系统信息</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 class="text-sm font-medium text-gray-600 mb-2">用户信息</h3>
          <dl class="space-y-1">
            <div class="flex justify-between">
              <dt class="text-sm text-gray-500">姓名:</dt>
              <dd class="text-sm text-gray-900">{{ authStore.user?.name }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-sm text-gray-500">角色:</dt>
              <dd class="text-sm text-gray-900">
                {{ authStore.user?.role === 'admin' ? '管理员' : '普通用户' }}
              </dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-sm text-gray-500">登录时间:</dt>
              <dd class="text-sm text-gray-900">{{ loginTime }}</dd>
            </div>
          </dl>
        </div>

        <div>
          <h3 class="text-sm font-medium text-gray-600 mb-2">系统状态</h3>
          <dl class="space-y-1">
            <div class="flex justify-between">
              <dt class="text-sm text-gray-500">API状态:</dt>
              <dd class="text-sm">
                <el-tag :type="apiStatus === 'online' ? 'success' : 'danger'" size="small">
                  {{ apiStatus === 'online' ? '在线' : '离线' }}
                </el-tag>
              </dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-sm text-gray-500">版本:</dt>
              <dd class="text-sm text-gray-900">v1.0.0</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-sm text-gray-500">最后更新:</dt>
              <dd class="text-sm text-gray-900">{{ new Date().toLocaleDateString('zh-CN') }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { 
  Goods, 
  ShoppingCart, 
  ShoppingBag, 
  DataAnalysis, 
  User 
} from '@element-plus/icons-vue';
import { useAuthStore } from '@/store/auth';
import { getCommodities } from '@/api/commodity';
import { getCustomerOrders } from '@/api/customerOrder';
import { getPurchaseOrders } from '@/api/purchaseOrder';

const authStore = useAuthStore();

const stats = ref({
  totalCommodities: 0,
  totalCustomerOrders: 0,
  totalPurchaseOrders: 0,
});

const apiStatus = ref<'online' | 'offline'>('offline');
const loginTime = ref('');

const fetchStats = async () => {
  try {
    // 获取商品统计
    const commoditiesRes = await getCommodities({ limit: 1 });
    stats.value.totalCommodities = commoditiesRes.meta.total;

    // 如果是管理员，获取订单统计
    if (authStore.isAdmin) {
      const customerOrdersRes = await getCustomerOrders({ limit: 1 });
      stats.value.totalCustomerOrders = customerOrdersRes.meta.total;

      const purchaseOrdersRes = await getPurchaseOrders({ limit: 1 });
      stats.value.totalPurchaseOrders = purchaseOrdersRes.meta.total;
    }

    apiStatus.value = 'online';
  } catch (error) {
    console.error('获取统计数据失败:', error);
    apiStatus.value = 'offline';
  }
};

onMounted(() => {
  fetchStats();
  loginTime.value = new Date().toLocaleString('zh-CN');
});
</script>
