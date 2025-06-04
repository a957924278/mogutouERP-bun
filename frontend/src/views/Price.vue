<template>
  <div class="price-view">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">价格查询</h1>
      <p class="text-gray-600 mt-2">查看商品的销售价格信息</p>
    </div>

    <!-- 搜索栏 -->
    <div class="mb-4">
      <el-input
        v-model="searchText"
        placeholder="搜索商品名称"
        clearable
        @input="handleSearch"
        style="width: 300px"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 商品价格列表 -->
    <div class="bg-white rounded-lg shadow">
      <el-table
        v-loading="loading"
        :data="commodities"
        style="width: 100%"
        stripe
      >
        <el-table-column prop="id" label="商品ID" width="100" />
        <el-table-column prop="name" label="商品名称" min-width="200" />
              <el-table-column prop="brand" label="品牌" width="120" />
      <el-table-column prop="colour" label="颜色" width="100" />
      <el-table-column prop="size" label="尺寸" width="100" />
      <el-table-column prop="price" label="销售价格" width="150">
        <template #default="{ row }">
          <span class="text-2xl font-bold text-green-600">¥{{ row.price.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="库存状态" width="120">
        <template #default="{ row }">
          <el-tag 
            :type="row.number > 10 ? 'success' : row.number > 0 ? 'warning' : 'danger'"
            size="small"
          >
            {{ row.number > 10 ? '充足' : row.number > 0 ? '偏少' : '缺货' }}
          </el-tag>
        </template>
      </el-table-column>
        <el-table-column prop="updatedAt" label="价格更新时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.updatedAt) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex justify-center py-4">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 价格统计信息 -->
    <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100">
            <el-icon class="text-blue-600 text-xl">
              <TrendCharts />
            </el-icon>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">平均价格</p>
            <p class="text-2xl font-semibold text-gray-900">¥{{ averagePrice.toFixed(2) }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-100">
            <el-icon class="text-green-600 text-xl">
              <ArrowUp />
            </el-icon>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">最高价格</p>
            <p class="text-2xl font-semibold text-gray-900">¥{{ maxPrice.toFixed(2) }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-red-100">
            <el-icon class="text-red-600 text-xl">
              <ArrowDown />
            </el-icon>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">最低价格</p>
            <p class="text-2xl font-semibold text-gray-900">¥{{ minPrice.toFixed(2) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, TrendCharts, ArrowUp, ArrowDown } from '@element-plus/icons-vue';
import { getCommodities, type Commodity } from '@/api/commodity';

const loading = ref(false);
const commodities = ref<Commodity[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchText = ref('');

// 价格统计
const averagePrice = computed(() => {
  if (commodities.value.length === 0) return 0;
  const sum = commodities.value.reduce((acc, item) => acc + item.price, 0);
  return sum / commodities.value.length;
});

const maxPrice = computed(() => {
  if (commodities.value.length === 0) return 0;
  return Math.max(...commodities.value.map(item => item.price));
});

const minPrice = computed(() => {
  if (commodities.value.length === 0) return 0;
  return Math.min(...commodities.value.map(item => item.price));
});

const fetchCommodities = async () => {
  try {
    loading.value = true;
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      name: searchText.value || undefined,
    };
    
    const response = await getCommodities(params);
    commodities.value = response.data;
    total.value = response.meta.total;
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '获取商品价格失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchCommodities();
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchCommodities();
};

const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  fetchCommodities();
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN');
};

onMounted(() => {
  fetchCommodities();
});
</script>

