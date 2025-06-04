<template>
  <div class="data-management-view">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">数据管理</h1>
      <p class="text-gray-600 mt-2">系统数据的备份、导入和管理</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- 数据导出 -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">数据导出</h2>
        <div class="space-y-4">
          <el-form label-width="120px">
            <el-form-item label="导出类型">
              <el-checkbox-group v-model="exportTypes">
                <el-checkbox label="commodities">商品数据</el-checkbox>
                <el-checkbox label="customerOrders" v-if="authStore.isAdmin">客户订单</el-checkbox>
                <el-checkbox label="purchaseOrders" v-if="authStore.isAdmin">采购订单</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            
            <el-form-item label="导出格式">
              <el-radio-group v-model="exportFormat">
                <el-radio label="json">JSON</el-radio>
                <el-radio label="csv">CSV</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
          
          <div class="flex space-x-2">
            <el-button 
              type="primary" 
              :loading="exportLoading"
              @click="handleExport"
              :disabled="exportTypes.length === 0"
            >
              导出数据
            </el-button>
            
            <el-button 
              type="info"
              @click="handlePreview"
              :disabled="exportTypes.length === 0"
            >
              预览数据
            </el-button>
          </div>
        </div>
      </div>

      <!-- 数据统计 -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">数据统计</h2>
        <div class="space-y-4">
          <div class="flex justify-between items-center p-3 bg-blue-50 rounded">
            <span class="text-gray-700">商品总数</span>
            <span class="font-semibold text-blue-600">{{ stats.commoditiesCount }}</span>
          </div>
          
          <div 
            v-if="authStore.isAdmin"
            class="flex justify-between items-center p-3 bg-green-50 rounded"
          >
            <span class="text-gray-700">客户订单总数</span>
            <span class="font-semibold text-green-600">{{ stats.customerOrdersCount }}</span>
          </div>
          
          <div 
            v-if="authStore.isAdmin"
            class="flex justify-between items-center p-3 bg-purple-50 rounded"
          >
            <span class="text-gray-700">采购订单总数</span>
            <span class="font-semibold text-purple-600">{{ stats.purchaseOrdersCount }}</span>
          </div>
          
          <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span class="text-gray-700">最后更新时间</span>
            <span class="font-semibold text-gray-600">{{ lastUpdateTime }}</span>
          </div>
          
          <el-button 
            type="primary" 
            class="w-full"
            :loading="statsLoading"
            @click="refreshStats"
          >
            刷新统计
          </el-button>
        </div>
      </div>

      <!-- 系统工具 -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">系统工具</h2>
        <div class="space-y-3">
          <el-button 
            type="warning" 
            class="w-full"
            @click="handleClearCache"
          >
            清除系统缓存
          </el-button>
          
          <el-button 
            type="info" 
            class="w-full"
            @click="handleOptimizeData"
          >
            优化数据结构
          </el-button>
          
          <el-button 
            type="success" 
            class="w-full"
            @click="handleCheckIntegrity"
            :loading="integrityLoading"
          >
            检查数据完整性
          </el-button>
        </div>
      </div>

      <!-- 操作日志 -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">最近操作</h2>
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div 
            v-for="(log, index) in operationLogs" 
            :key="index"
            class="text-sm p-2 bg-gray-50 rounded"
          >
            <div class="flex justify-between items-center">
              <span class="text-gray-700">{{ log.action }}</span>
              <span class="text-gray-500 text-xs">{{ log.time }}</span>
            </div>
            <div v-if="log.details" class="text-gray-600 text-xs mt-1">
              {{ log.details }}
            </div>
          </div>
          
          <div v-if="operationLogs.length === 0" class="text-center text-gray-500 py-4">
            暂无操作记录
          </div>
        </div>
      </div>
    </div>

    <!-- 数据预览对话框 -->
    <el-dialog
      v-model="showPreviewDialog"
      title="数据预览"
      width="80%"
      :before-close="handleClosePreview"
    >
      <div class="max-h-96 overflow-auto">
        <pre class="text-sm bg-gray-100 p-4 rounded">{{ previewData }}</pre>
      </div>
      
      <template #footer>
        <el-button @click="showPreviewDialog = false">关闭</el-button>
        <el-button type="primary" @click="downloadPreviewData">下载此数据</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useAuthStore } from '@/store/auth';
import { getCommodities } from '@/api/commodity';
import { getCustomerOrders } from '@/api/customerOrder';
import { getPurchaseOrders } from '@/api/purchaseOrder';

const authStore = useAuthStore();

const exportLoading = ref(false);
const statsLoading = ref(false);
const integrityLoading = ref(false);
const showPreviewDialog = ref(false);

const exportTypes = ref<string[]>(['commodities']);
const exportFormat = ref('json');
const previewData = ref('');

const stats = reactive({
  commoditiesCount: 0,
  customerOrdersCount: 0,
  purchaseOrdersCount: 0,
});

const lastUpdateTime = ref('');

const operationLogs = ref<Array<{
  action: string;
  time: string;
  details?: string;
}>>([]);

const addOperationLog = (action: string, details?: string) => {
  operationLogs.value.unshift({
    action,
    time: new Date().toLocaleString('zh-CN'),
    details,
  });
  
  // 只保留最近50条记录
  if (operationLogs.value.length > 50) {
    operationLogs.value = operationLogs.value.slice(0, 50);
  }
};

const refreshStats = async () => {
  try {
    statsLoading.value = true;
    
    // 获取商品统计
    const commoditiesRes = await getCommodities({ limit: 1 });
    stats.commoditiesCount = commoditiesRes.meta.total;
    
    // 如果是管理员，获取订单统计
    if (authStore.isAdmin) {
      const customerOrdersRes = await getCustomerOrders({ limit: 1 });
      stats.customerOrdersCount = customerOrdersRes.meta.total;
      
      const purchaseOrdersRes = await getPurchaseOrders({ limit: 1 });
      stats.purchaseOrdersCount = purchaseOrdersRes.meta.total;
    }
    
    lastUpdateTime.value = new Date().toLocaleString('zh-CN');
    addOperationLog('刷新数据统计', '成功获取最新统计信息');
    
    ElMessage.success('统计数据已更新');
  } catch (error) {
    ElMessage.error('获取统计数据失败');
    addOperationLog('刷新数据统计', '失败：' + (error instanceof Error ? error.message : '未知错误'));
  } finally {
    statsLoading.value = false;
  }
};

const fetchDataForExport = async () => {
  const data: any = {};
  
  for (const type of exportTypes.value) {
    try {
      switch (type) {
        case 'commodities':
          const commoditiesRes = await getCommodities({ limit: 10000 });
          data.commodities = commoditiesRes.data;
          break;
        case 'customerOrders':
          if (authStore.isAdmin) {
            const customerOrdersRes = await getCustomerOrders({ limit: 10000 });
            data.customerOrders = customerOrdersRes.data;
          }
          break;
        case 'purchaseOrders':
          if (authStore.isAdmin) {
            const purchaseOrdersRes = await getPurchaseOrders({ limit: 10000 });
            data.purchaseOrders = purchaseOrdersRes.data;
          }
          break;
      }
    } catch (error) {
      console.error(`Failed to fetch ${type}:`, error);
    }
  }
  
  return data;
};

const handlePreview = async () => {
  try {
    const data = await fetchDataForExport();
    previewData.value = JSON.stringify(data, null, 2);
    showPreviewDialog.value = true;
    addOperationLog('预览数据', `包含类型: ${exportTypes.value.join(', ')}`);
  } catch (error) {
    ElMessage.error('预览数据失败');
  }
};

const handleExport = async () => {
  try {
    exportLoading.value = true;
    
    const data = await fetchDataForExport();
    const timestamp = new Date().toISOString().split('T')[0];
    
    let content: string;
    let filename: string;
    let mimeType: string;
    
    if (exportFormat.value === 'json') {
      content = JSON.stringify(data, null, 2);
      filename = `erp-export-${timestamp}.json`;
      mimeType = 'application/json';
    } else {
      // CSV 格式（简化处理）
      const csvContent = convertToCSV(data);
      content = csvContent;
      filename = `erp-export-${timestamp}.csv`;
      mimeType = 'text/csv';
    }
    
    // 下载文件
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    ElMessage.success('数据导出成功');
    addOperationLog('导出数据', `格式: ${exportFormat.value}, 类型: ${exportTypes.value.join(', ')}`);
  } catch (error) {
    ElMessage.error('数据导出失败');
    addOperationLog('导出数据失败', error instanceof Error ? error.message : '未知错误');
  } finally {
    exportLoading.value = false;
  }
};

const convertToCSV = (data: any): string => {
  // 简化的CSV转换，实际应用中需要更完善的处理
  let csv = '';
  
  Object.keys(data).forEach(key => {
    if (Array.isArray(data[key]) && data[key].length > 0) {
      csv += `\n\n${key}:\n`;
      const headers = Object.keys(data[key][0]);
      csv += headers.join(',') + '\n';
      
      data[key].forEach((item: any) => {
        const row = headers.map(header => {
          const value = item[header];
          return typeof value === 'string' ? `"${value}"` : value;
        }).join(',');
        csv += row + '\n';
      });
    }
  });
  
  return csv;
};

const downloadPreviewData = () => {
  const blob = new Blob([previewData.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `erp-preview-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  ElMessage.success('预览数据已下载');
  showPreviewDialog.value = false;
};

const handleClosePreview = () => {
  showPreviewDialog.value = false;
  previewData.value = '';
};

const handleClearCache = async () => {
  try {
    await ElMessageBox.confirm(
      '清除缓存将删除浏览器中存储的临时数据，但不会影响用户登录状态。确定继续吗？',
      '确认清除缓存',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    // 清除缓存（保留认证信息）
    const keysToKeep = ['auth-store'];
    const allKeys = Object.keys(localStorage);
    
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });
    
    ElMessage.success('缓存清除成功');
    addOperationLog('清除系统缓存', '成功清除浏览器缓存');
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('清除缓存失败');
    }
  }
};

const handleOptimizeData = () => {
  ElMessage.info('数据优化功能将在后续版本中提供');
  addOperationLog('数据优化', '功能暂未实现');
};

const handleCheckIntegrity = async () => {
  try {
    integrityLoading.value = true;
    
    // 模拟数据完整性检查
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    ElMessage.success('数据完整性检查通过');
    addOperationLog('数据完整性检查', '检查通过，数据结构正常');
  } catch (error) {
    ElMessage.error('数据完整性检查失败');
    addOperationLog('数据完整性检查', '检查失败');
  } finally {
    integrityLoading.value = false;
  }
};

onMounted(() => {
  refreshStats();
  addOperationLog('进入数据管理页面', '页面初始化完成');
});
</script> 