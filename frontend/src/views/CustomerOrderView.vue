<template>
  <div class="customer-order-view">
    <!-- 页面标题和操作按钮 -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">客户订单管理</h1>
      <el-button
        v-if="authStore.isAdmin"
        type="primary"
        @click="showCreateDialog = true"
        :icon="Plus"
      >
        新增订单
      </el-button>
    </div>

    <!-- 筛选栏 -->
    <div class="mb-4 flex items-center space-x-4">
      <el-input
        v-model="searchText"
        placeholder="搜索客户姓名 (仅前端筛选)"
        clearable
        @input="handleLocalSearch"
        style="width: 250px"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      
      <el-select
        v-model="statusFilter"
        placeholder="订单状态"
        clearable
        @change="handleLocalSearch"
        style="width: 150px"
      >
        <el-option label="未完成" value="未完成" />
        <el-option label="已完成" value="已完成" />
      </el-select>
    </div>

    <!-- 订单列表 -->
          <el-table
        v-loading="loading"
        :data="filteredOrders"
        style="width: 100%"
        stripe
      >
      <el-table-column prop="id" label="订单ID" width="100" />
      <el-table-column prop="customerName" label="客户姓名" min-width="120" />
      <el-table-column prop="customerTel" label="客户电话" min-width="150" />
      <el-table-column prop="deliveryAddress" label="送货地址" min-width="200" show-overflow-tooltip />
      <el-table-column prop="deliveryTime" label="送货时间" min-width="180" />
      <el-table-column label="商品详情" min-width="300">
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
              <span v-if="good.price" class="text-green-600 ml-2">¥{{ good.price.toFixed(2) }}</span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="amount" label="订单金额" width="120">
        <template #default="{ row }">
          <span class="font-semibold text-green-600">¥{{ row.amount.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="deposit" label="订金" width="100">
        <template #default="{ row }">
          <span class="text-blue-600">¥{{ row.deposit.toFixed(2) }}</span>
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
            确认订单
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

    <!-- 新增订单对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="新增客户订单"
      width="800px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户姓名" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户电话" prop="tel">
              <el-input v-model="form.tel" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="送货地址" prop="deliveryAddress">
          <el-input
            v-model="form.deliveryAddress"
            type="textarea"
            :rows="2"
          />
        </el-form-item>
        
        <el-form-item label="送货时间" prop="deliveryTime">
          <el-date-picker
            v-model="form.deliveryTime"
            type="datetime"
            placeholder="选择送货时间"
            style="width: 100%"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
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
            <el-form-item label="订金" prop="deposit">
              <el-input-number
                v-model="form.deposit"
                :min="0"
                :precision="2"
                :step="0.01"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="备注" prop="remarks">
          <el-input
            v-model="form.remarks"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        
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
                  :label="`${commodity.name} - ${commodity.brand} (${commodity.colour}/${commodity.size}) ¥${commodity.price}`"
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
          创建订单
        </el-button>
      </template>
    </el-dialog>

    <!-- 确认订单对话框 -->
    <el-dialog
      v-model="showConfirmDialog"
      title="确认订单"
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
          确认订单
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { Plus, Delete } from '@element-plus/icons-vue';
import { useAuthStore } from '@/store/auth';
import {
  getCustomerOrders,
  createCustomerOrder,
  confirmCustomerOrder,
  deleteCustomerOrder,
  type CustomerOrder,
  type CustomerOrderForm,
} from '@/api/customerOrder';
import { getCommodities, type Commodity } from '@/api/commodity';

const authStore = useAuthStore();

const loading = ref(false);
const submitLoading = ref(false);
const confirmLoading = ref(false);
const showCreateDialog = ref(false);
const showConfirmDialog = ref(false);
const formRef = ref<FormInstance>();
const confirmingOrder = ref<CustomerOrder | null>(null);
const confirmFreight = ref(0);

const orders = ref<CustomerOrder[]>([]);
const filteredOrders = ref<CustomerOrder[]>([]);
const commodityOptions = ref<Commodity[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchText = ref('');
const statusFilter = ref('');

const form = reactive<CustomerOrderForm>({
  name: '',
  tel: '',
  deliveryAddress: '',
  deliveryTime: '',
  amount: 0,
  deposit: 0,
  remarks: '',
  goods: [
    {
      id: '',
      number: 1,
    },
  ],
});

const rules: FormRules<CustomerOrderForm> = {
  name: [
    { required: true, message: '请输入客户姓名', trigger: 'blur' },
    { min: 1, max: 50, message: '客户姓名长度在 1 到 50 个字符', trigger: 'blur' },
  ],
  tel: [
    { required: true, message: '请输入客户电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  deliveryAddress: [
    { required: true, message: '请输入送货地址', trigger: 'blur' },
  ],
  deliveryTime: [
    { required: true, message: '请选择送货时间', trigger: 'change' },
  ],
  amount: [
    { required: true, message: '请输入订单金额', trigger: 'blur' },
    { type: 'number', min: 0, message: '订单金额不能小于0', trigger: 'blur' },
  ],
  deposit: [
    { required: true, message: '请输入订金', trigger: 'blur' },
    { type: 'number', min: 0, message: '订金不能小于0', trigger: 'blur' },
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



const fetchOrders = async () => {
  try {
    loading.value = true;
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
    };
    
    const response = await getCustomerOrders(params);
    orders.value = response.data;
    total.value = response.meta.total;
    handleLocalSearch(); // 应用本地筛选
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '获取订单列表失败');
  } finally {
    loading.value = false;
  }
};

const handleLocalSearch = () => {
  let filtered = [...orders.value];
  
  // 按客户姓名筛选
  if (searchText.value) {
    filtered = filtered.filter(order => 
      order.customerName.toLowerCase().includes(searchText.value.toLowerCase())
    );
  }
  
  // 按状态筛选
  if (statusFilter.value) {
    filtered = filtered.filter(order => order.state === statusFilter.value);
  }
  
  filteredOrders.value = filtered;
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

const handleConfirm = (order: CustomerOrder) => {
  confirmingOrder.value = order;
  confirmFreight.value = order.freight;
  showConfirmDialog.value = true;
};

const confirmOrder = async () => {
  if (!confirmingOrder.value) return;
  
  try {
    confirmLoading.value = true;
    await confirmCustomerOrder(confirmingOrder.value.id, confirmFreight.value);
    ElMessage.success('订单确认成功');
    showConfirmDialog.value = false;
    fetchOrders();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '确认失败');
  } finally {
    confirmLoading.value = false;
  }
};

const handleDelete = async (order: CustomerOrder) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除订单 #${order.id} 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    await deleteCustomerOrder(order.id);
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
    await createCustomerOrder(form);
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
    name: '',
    tel: '',
    deliveryAddress: '',
    deliveryTime: '',
    amount: 0,
    deposit: 0,
    remarks: '',
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