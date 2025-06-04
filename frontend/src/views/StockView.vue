<template>
	<div class="stock-view">
		<div class="mb-6">
			<h1 class="text-2xl font-bold text-gray-900">库存查询</h1>
			<p class="text-gray-600 mt-2">查看商品的库存状态和销售情况</p>
		</div>

		<!-- 搜索和筛选栏 -->
		<div class="mb-4 flex items-center space-x-4">
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
			
			<el-select
				v-model="stockFilter"
				placeholder="库存状态"
				clearable
				@change="handleSearch"
				style="width: 150px"
			>
				<el-option label="充足 (>10)" value="sufficient" />
				<el-option label="偏少 (1-10)" value="low" />
				<el-option label="缺货 (0)" value="out" />
			</el-select>
		</div>

		<!-- 库存统计卡片 -->
		<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center">
					<div class="p-3 rounded-full bg-green-100">
						<el-icon class="text-green-600 text-xl">
							<CircleCheck />
						</el-icon>
					</div>
					<div class="ml-4">
						<p class="text-sm font-medium text-gray-600">库存充足</p>
						<p class="text-2xl font-semibold text-green-600">{{ sufficientCount }}</p>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center">
					<div class="p-3 rounded-full bg-yellow-100">
						<el-icon class="text-yellow-600 text-xl">
							<Warning />
						</el-icon>
					</div>
					<div class="ml-4">
						<p class="text-sm font-medium text-gray-600">库存偏少</p>
						<p class="text-2xl font-semibold text-yellow-600">{{ lowStockCount }}</p>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center">
					<div class="p-3 rounded-full bg-red-100">
						<el-icon class="text-red-600 text-xl">
							<CircleClose />
						</el-icon>
					</div>
					<div class="ml-4">
						<p class="text-sm font-medium text-gray-600">缺货商品</p>
						<p class="text-2xl font-semibold text-red-600">{{ outOfStockCount }}</p>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center">
					<div class="p-3 rounded-full bg-blue-100">
						<el-icon class="text-blue-600 text-xl">
							<Box />
						</el-icon>
					</div>
					<div class="ml-4">
						<p class="text-sm font-medium text-gray-600">总库存量</p>
						<p class="text-2xl font-semibold text-blue-600">{{ totalStock }}</p>
					</div>
				</div>
			</div>
		</div>

		<!-- 库存列表 -->
		<div class="bg-white rounded-lg shadow">
			<el-table
				v-loading="loading"
				:data="commodities"
				style="width: 100%"
				stripe
				:row-class-name="getRowClassName"
			>
				      <el-table-column prop="id" label="商品ID" width="100" />
      <el-table-column prop="name" label="商品名称" min-width="150" />
      <el-table-column prop="brand" label="品牌" width="120" />
      <el-table-column prop="colour" label="颜色" width="100" />
      <el-table-column prop="size" label="尺寸" width="100" />
      <el-table-column prop="number" label="当前库存" width="120" sortable>
        <template #default="{ row }">
          <span class="text-lg font-semibold">{{ row.number }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="presaleNumber" label="预售数量" width="120">
        <template #default="{ row }">
          <span class="text-orange-600">{{ row.presaleNumber || 0 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="salesVolume" label="已销售" width="120">
        <template #default="{ row }">
          <span class="text-blue-600">{{ row.salesVolume || 0 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="可用库存" width="120">
        <template #default="{ row }">
          <span class="text-green-600 font-semibold">
            {{ row.number - (row.presaleNumber || 0) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="库存状态" width="120">
        <template #default="{ row }">
          <el-tag 
            :type="getStockStatusType(row.number)"
            size="small"
          >
            {{ getStockStatusText(row.number) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="销售价格" width="120">
        <template #default="{ row }">
          ¥{{ row.price.toFixed(2) }}
        </template>
      </el-table-column>
				<el-table-column prop="updatedAt" label="更新时间" width="180">
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
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { 
  Search, 
  CircleCheck, 
  Warning, 
  CircleClose, 
  Box 
} from '@element-plus/icons-vue';
import { getCommodities, type Commodity } from '@/api/commodity';

const loading = ref(false);
const commodities = ref<Commodity[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchText = ref('');
const stockFilter = ref<'sufficient' | 'low' | 'out' | ''>('');

// 库存统计
const sufficientCount = computed(() => {
  return commodities.value.filter(item => item.number > 10).length;
});

const lowStockCount = computed(() => {
  return commodities.value.filter(item => item.number > 0 && item.number <= 10).length;
});

const outOfStockCount = computed(() => {
  return commodities.value.filter(item => item.number === 0).length;
});

const totalStock = computed(() => {
  return commodities.value.reduce((sum, item) => sum + item.number, 0);
});

const getStockStatusType = (number: number) => {
  if (number > 10) return 'success';
  if (number > 0) return 'warning';
  return 'danger';
};

const getStockStatusText = (number: number) => {
  if (number > 10) return '充足';
  if (number > 0) return '偏少';
  return '缺货';
};

const getRowClassName = ({ row }: { row: Commodity }) => {
  if (row.number === 0) return 'danger-row';
  if (row.number <= 10) return 'warning-row';
  return '';
};

const fetchCommodities = async () => {
  try {
    loading.value = true;
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      name: searchText.value || undefined,
    };
    
    const response = await getCommodities(params);
    let filteredCommodities = response.data;
    
    // 客户端过滤库存状态
    if (stockFilter.value) {
      filteredCommodities = response.data.filter(item => {
        switch (stockFilter.value) {
          case 'sufficient':
            return item.number > 10;
          case 'low':
            return item.number > 0 && item.number <= 10;
          case 'out':
            return item.number === 0;
          default:
            return true;
        }
      });
    }
    
    commodities.value = filteredCommodities;
    total.value = filteredCommodities.length;
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '获取库存信息失败');
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

<style scoped>
:deep(.el-table .danger-row) {
  background-color: #fef0f0;
}

:deep(.el-table .warning-row) {
  background-color: #fdf6ec;
}
</style>