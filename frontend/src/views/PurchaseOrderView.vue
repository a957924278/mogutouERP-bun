<template>
  <div class="purchase-order-view">
    <!-- 页面标题和操作按钮 -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">采购订单管理</h1>
      <el-button
        v-if="authStore.isAdmin"
        type="primary"
        @click="showCreateDialog = true"
        :icon="Plus"
      >
        新增采购订单
      </el-button>
    </div>



    <!-- 订单列表 -->
    <el-table
      v-loading="loading"
      :data="orders"
      style="width: 100%"
      stripe
    >
      <el-table-column prop="id" label="订单ID" width="100" />
      <el-table-column prop="remarks" label="备注" min-width="200" show-overflow-tooltip />
      <el-table-column label="商品详情" min-width="400">
        <template #default="{ row }">
          <div class="space-y-1">
            <div
              v-for="(good, index) in row.goods"
              :key="index"
              class="text-sm"
            >
              {{ good.name || `商品ID: ${good.id}` }} × {{ good.number }}
              <span v-if="good.colour" class="text-gray-500">({{ good.colour }})</span>
              <span v-if="good.size" class="text-gray-500">{{ good.size }}</span>
              <span v-if="good.purchasePrice" class="text-blue-600 ml-2">¥{{ good.purchasePrice.toFixed(2) }}</span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="amount" label="订单金额" width="120">
        <template #default="{ row }">
          <span class="font-semibold text-blue-600">¥{{ row.amount.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="freight" label="运费" width="100">
        <template #default="{ row }">
          <span class="text-orange-600">¥{{ row.freight.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="state" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.state === '已完成' ? 'success' : 'warning'">
            {{ row.state }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="operatorName" label="操作员" width="120" />
      <el-table-column prop="createdAt" label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="authStore.isAdmin"
        label="操作"
        width="180"
        fixed="right"
      >
        <template #default="{ row }">
          <el-button
            v-if="row.state === '未完成' && row.operator === authStore.user?.id"
            type="success"
            size="small"
            @click="handleConfirm(row)"
          >
            确认采购
          </el-button>
          <el-button
            v-if="row.operator === authStore.user?.id"
            type="danger"
            size="small"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
          <span v-if="row.operator !== authStore.user?.id" class="text-gray-400 text-sm">
            非本人创建
          </span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="flex justify-center mt-6">
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

    <!-- 新增采购订单对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="新增采购订单"
      width="800px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="备注" prop="remarks">
          <el-input
            v-model="form.remarks"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单金额" prop="amount">
              <el-input-number
                v-model="form.amount"
                :min="0"
                :precision="2"
                :step="0.01"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="运费" prop="freight">
              <el-input-number
                v-model="form.freight"
                :min="0"
                :precision="2"
                :step="0.01"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="商品列表" prop="goods">
          <div class="w-full">
            <div
              v-for="(good, index) in form.goods"
              :key="index"
              class="flex items-center space-x-2 mb-3 p-3 border border-gray-200 rounded"
            >
              <el-select
                v-model="good.id"
                placeholder="选择商品"
                style="width: 300px"
              >
                <el-option
                  v-for="commodity in commodityOptions"
                  :key="commodity.id"
                  :label="`${commodity.name} - ${commodity.brand} (${commodity.colour}/${commodity.size})`"
                  :value="commodity.id.toString()"
                />
              </el-select>
              
              <el-input-number
                v-model="good.number"
                :min="1"
                placeholder="数量"
                style="width: 120px"
              />
              
              <el-button
                type="danger"
                size="small"
                @click="removeGood(index)"
                :icon="Delete"
              >
                删除
              </el-button>
            </div>
            
            <el-button
              type="primary"
              @click="addGood"
              :icon="Plus"
              class="mb-3"
            >
              添加商品
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          创建采购订单
        </el-button>
      </template>
    </el-dialog>

    <!-- 确认采购订单对话框 -->
    <el-dialog
      v-model="showConfirmDialog"
      title="确认采购订单"
      width="400px"
    >
      <el-form label-width="80px">
        <el-form-item label="运费">
          <el-input-number
            v-model="confirmFreight"
            :min="0"
            :precision="2"
            :step="0.01"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showConfirmDialog = false">取消</el-button>
        <el-button type="primary" :loading="confirmLoading" @click="confirmOrder">
          确认采购订单
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { Plus, Delete } from '@element-plus/icons-vue';
import { useAuthStore } from '@/store/auth';
import {
  getPurchaseOrders,
  createPurchaseOrder,
  confirmPurchaseOrder,
  deletePurchaseOrder,
  type PurchaseOrder,
  type PurchaseOrderForm,
} from '@/api/purchaseOrder';
import { getCommodities, type Commodity } from '@/api/commodity';

const authStore = useAuthStore();

const loading = ref(false);
const submitLoading = ref(false);
const confirmLoading = ref(false);
const showCreateDialog = ref(false);
const showConfirmDialog = ref(false);
const formRef = ref<FormInstance>();
const confirmingOrder = ref<PurchaseOrder | null>(null);
const confirmFreight = ref(0);

const orders = ref<PurchaseOrder[]>([]);
const commodityOptions = ref<Commodity[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

const form = reactive<PurchaseOrderForm>({
  remarks: '',
  amount: 0,
  freight: 0,
  goods: [
    {
      id: '',
      number: 1,
    },
  ],
});

const rules: FormRules<PurchaseOrderForm> = {
  amount: [
    { required: true, message: '请输入订单金额', trigger: 'blur' },
    { type: 'number', min: 0, message: '订单金额不能小于0', trigger: 'blur' },
  ],
  freight: [
    { required: true, message: '请输入运费', trigger: 'blur' },
    { type: 'number', min: 0, message: '运费不能小于0', trigger: 'blur' },
  ],
  goods: [
    {
      type: 'array',
      required: true,
      min: 1,
      message: '至少需要添加一个商品',
      trigger: 'change',
    },
  ],
};

const totalAmount = computed(() => {
  return form.goods.reduce((sum, good) => {
    return sum + (good.quantity * good.price || 0);
  }, 0);
});

const fetchOrders = async () => {
  try {
    loading.value = true;
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
    };
    
    const response = await getPurchaseOrders(params);
    orders.value = response.data;
    total.value = response.meta.total;
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '获取采购订单列表失败');
  } finally {
    loading.value = false;
  }
};

const fetchCommodities = async () => {
  try {
    const response = await getCommodities({ limit: 1000 });
    commodityOptions.value = response.data;
  } catch (error) {
    ElMessage.error('获取商品列表失败');
  }
};



const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  fetchOrders();
};

const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  fetchOrders();
};

const handleConfirm = (order: PurchaseOrder) => {
  confirmingOrder.value = order;
  confirmFreight.value = order.freight;
  showConfirmDialog.value = true;
};

const confirmOrder = async () => {
  if (!confirmingOrder.value) return;
  
  try {
    confirmLoading.value = true;
    await confirmPurchaseOrder(confirmingOrder.value.id, confirmFreight.value);
    ElMessage.success('采购订单确认成功');
    showConfirmDialog.value = false;
    fetchOrders();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '确认失败');
  } finally {
    confirmLoading.value = false;
  }
};

const handleDelete = async (order: PurchaseOrder) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除采购订单 #${order.id} 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    await deletePurchaseOrder(order.id);
    ElMessage.success('删除成功');
    fetchOrders();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error instanceof Error ? error.message : '删除失败');
    }
  }
};

const addGood = () => {
  form.goods.push({
    id: '',
    number: 1,
  });
};

const removeGood = (index: number) => {
  if (form.goods.length > 1) {
    form.goods.splice(index, 1);
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    
    // 验证商品是否都已选择
    const invalidGoods = form.goods.some(good => 
      !good.id || good.number <= 0
    );
    
    if (invalidGoods) {
      ElMessage.error('请完善所有商品信息');
      return;
    }
    
    submitLoading.value = true;
    await createPurchaseOrder(form);
    ElMessage.success('创建成功');
    showCreateDialog.value = false;
    fetchOrders();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '创建失败');
  } finally {
    submitLoading.value = false;
  }
};

const resetForm = () => {
  formRef.value?.resetFields();
  Object.assign(form, {
    remarks: '',
    amount: 0,
    freight: 0,
    goods: [
      {
        id: '',
        number: 1,
      },
    ],
  });
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN');
};

onMounted(() => {
  fetchOrders();
  fetchCommodities();
});
</script> 