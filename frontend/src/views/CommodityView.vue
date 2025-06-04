<template>
  <div class="commodity-view">
    <!-- 页面标题和操作按钮 -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">商品管理</h1>
      <el-button
        v-if="authStore.isAdmin"
        type="primary"
        @click="showCreateDialog = true"
        :icon="Plus"
      >
        新增商品
      </el-button>
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

    <!-- 商品列表 -->
    <el-table
      v-loading="loading"
      :data="commodities"
      style="width: 100%"
      stripe
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="商品名称" min-width="150" />
      <el-table-column prop="brand" label="品牌" width="120" />
      <el-table-column prop="colour" label="颜色" width="100" />
      <el-table-column prop="size" label="尺寸" width="100" />
      <el-table-column prop="number" label="库存数量" width="120">
        <template #default="{ row }">
          <span class="font-semibold">{{ row.number }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="presaleNumber" label="预售数量" width="120">
        <template #default="{ row }">
          <span class="text-orange-600">{{ row.presaleNumber || 0 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="salesVolume" label="销售量" width="100">
        <template #default="{ row }">
          <span class="text-blue-600">{{ row.salesVolume || 0 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="销售价格" width="120">
        <template #default="{ row }">
          <span class="text-green-600 font-semibold">¥{{ row.price.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="authStore.isAdmin"
        prop="purchasePrice"
        label="采购价格"
        width="120"
      >
        <template #default="{ row }">
          <span class="text-purple-600">¥{{ (row.purchasePrice || 0).toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="authStore.isAdmin"
        label="操作"
        width="150"
        fixed="right"
      >
        <template #default="{ row }">
          <el-button
            type="primary"
            size="small"
            @click="handleEdit(row)"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
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

    <!-- 新增/编辑商品对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingCommodity ? '编辑商品' : '新增商品'"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        
        <el-form-item label="品牌" prop="brand">
          <el-input v-model="form.brand" />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="颜色" prop="colour">
              <el-input v-model="form.colour" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="尺寸" prop="size">
              <el-input v-model="form.size" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="库存数量" prop="number">
          <el-input-number
            v-model="form.number"
            :min="0"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="预售数量" prop="presaleNumber">
              <el-input-number
                v-model="form.presaleNumber"
                :min="0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="销售量" prop="salesVolume">
              <el-input-number
                v-model="form.salesVolume"
                :min="0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="销售价格" prop="price">
              <el-input-number
                v-model="form.price"
                :min="0"
                :precision="2"
                :step="0.01"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="采购价格" prop="purchasePrice">
              <el-input-number
                v-model="form.purchasePrice"
                :min="0"
                :precision="2"
                :step="0.01"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          {{ editingCommodity ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { Plus, Search } from '@element-plus/icons-vue';
import { useAuthStore } from '@/store/auth';
import {
  getCommodities,
  getAdminCommodities,
  createCommodity,
  updateCommodity,
  deleteCommodity,
  type Commodity,
  type CommodityForm,
} from '@/api/commodity';

const authStore = useAuthStore();

const loading = ref(false);
const submitLoading = ref(false);
const showCreateDialog = ref(false);
const editingCommodity = ref<Commodity | null>(null);
const formRef = ref<FormInstance>();

const commodities = ref<Commodity[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchText = ref('');

const form = reactive<CommodityForm>({
  name: '',
  brand: '',
  colour: '',
  size: '',
  number: 0,
  presaleNumber: 0,
  salesVolume: 0,
  price: 0,
  purchasePrice: 0,
});

const rules: FormRules<CommodityForm> = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 1, max: 100, message: '商品名称长度在 1 到 100 个字符', trigger: 'blur' },
  ],
  brand: [
    { required: true, message: '请输入品牌', trigger: 'blur' },
  ],
  colour: [
    { required: true, message: '请输入颜色', trigger: 'blur' },
  ],
  size: [
    { required: true, message: '请输入尺寸', trigger: 'blur' },
  ],
  number: [
    { required: true, message: '请输入库存数量', trigger: 'blur' },
    { type: 'number', min: 0, message: '库存数量不能小于0', trigger: 'blur' },
  ],
  price: [
    { required: true, message: '请输入销售价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '销售价格不能小于0', trigger: 'blur' },
  ],
  purchasePrice: [
    { required: true, message: '请输入采购价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '采购价格不能小于0', trigger: 'blur' },
  ],
};

const fetchCommodities = async () => {
  try {
    loading.value = true;
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      name: searchText.value || undefined,
    };
    
    // 根据用户角色调用不同的API
    const response = authStore.isAdmin 
      ? await getAdminCommodities(params)
      : await getCommodities(params);
    
    commodities.value = response.data;
    total.value = response.meta.total;
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '获取商品列表失败');
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

const handleEdit = (commodity: Commodity) => {
  editingCommodity.value = commodity;
  Object.assign(form, {
    name: commodity.name,
    brand: commodity.brand,
    colour: commodity.colour,
    size: commodity.size,
    number: commodity.number,
    presaleNumber: commodity.presaleNumber || 0,
    salesVolume: commodity.salesVolume || 0,
    price: commodity.price,
    purchasePrice: commodity.purchasePrice || 0,
  });
  showCreateDialog.value = true;
};

const handleDelete = async (commodity: Commodity) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除商品 "${commodity.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    await deleteCommodity(commodity.id);
    ElMessage.success('删除成功');
    fetchCommodities();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error instanceof Error ? error.message : '删除失败');
    }
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    submitLoading.value = true;
    
    if (editingCommodity.value) {
      await updateCommodity(editingCommodity.value.id, form);
      ElMessage.success('更新成功');
    } else {
      await createCommodity(form);
      ElMessage.success('创建成功');
    }
    
    showCreateDialog.value = false;
    fetchCommodities();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '操作失败');
  } finally {
    submitLoading.value = false;
  }
};

const resetForm = () => {
  formRef.value?.resetFields();
  editingCommodity.value = null;
  Object.assign(form, {
    name: '',
    brand: '',
    colour: '',
    size: '',
    number: 0,
    presaleNumber: 0,
    salesVolume: 0,
    price: 0,
    purchasePrice: 0,
  });
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN');
};

// 监听搜索文本变化，实现防抖搜索
let searchTimer: ReturnType<typeof setTimeout>;
watch(searchText, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    handleSearch();
  }, 300);
});

onMounted(() => {
  fetchCommodities();
});
</script> 