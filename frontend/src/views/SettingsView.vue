<template>
	<div class="settings-view">
		<div class="mb-6">
			<h1 class="text-2xl font-bold text-gray-900">系统设置</h1>
			<p class="text-gray-600 mt-2">管理系统配置和用户信息</p>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<!-- 密码修改 -->
			<div class="bg-white rounded-lg shadow p-6">
				<h2 class="text-lg font-semibold text-gray-900 mb-4">修改密码</h2>
				<el-form
					ref="passwordFormRef"
					:model="passwordForm"
					:rules="passwordRules"
					label-width="100px"
				>
					<el-form-item label="当前密码" prop="oldPassword">
						<el-input
							v-model="passwordForm.oldPassword"
							type="password"
							show-password
						/>
					</el-form-item>
					
					<el-form-item label="新密码" prop="newPassword">
						<el-input
							v-model="passwordForm.newPassword"
							type="password"
							show-password
						/>
					</el-form-item>
					
					<el-form-item label="确认密码" prop="confirmPassword">
						<el-input
							v-model="passwordForm.confirmPassword"
							type="password"
							show-password
						/>
					</el-form-item>
					
					<el-form-item>
						<el-button
							type="primary"
							:loading="passwordLoading"
							@click="handlePasswordUpdate"
						>
							修改密码
						</el-button>
					</el-form-item>
				</el-form>
			</div>

			<!-- 用户信息 -->
			<div class="bg-white rounded-lg shadow p-6">
				<h2 class="text-lg font-semibold text-gray-900 mb-4">个人信息</h2>
				<div class="space-y-4">
					<div class="flex justify-between items-center">
						<span class="text-gray-600">姓名:</span>
						<span class="font-medium">{{ authStore.user?.name }}</span>
					</div>
					
					<div class="flex justify-between items-center">
						<span class="text-gray-600">手机号:</span>
						<span class="font-medium">{{ authStore.user?.tel }}</span>
					</div>
					
					<div class="flex justify-between items-center">
						<span class="text-gray-600">角色:</span>
						<el-tag 
							:type="authStore.user?.role === 'admin' ? 'danger' : 'info'" 
							size="small"
						>
							{{ authStore.user?.role === 'admin' ? '管理员' : '普通用户' }}
						</el-tag>
					</div>
					
					<div class="flex justify-between items-center">
						<span class="text-gray-600">用户ID:</span>
						<span class="font-mono text-sm">{{ authStore.user?.id }}</span>
					</div>
				</div>
			</div>

			<!-- 系统信息 -->
			<div class="bg-white rounded-lg shadow p-6">
				<h2 class="text-lg font-semibold text-gray-900 mb-4">系统信息</h2>
				<div class="space-y-4">
					<div class="flex justify-between items-center">
						<span class="text-gray-600">系统版本:</span>
						<span class="font-medium">v1.0.0</span>
					</div>
					
					<div class="flex justify-between items-center">
						<span class="text-gray-600">构建时间:</span>
						<span class="font-medium">{{ new Date().toLocaleDateString('zh-CN') }}</span>
					</div>
					
					<div class="flex justify-between items-center">
						<span class="text-gray-600">API状态:</span>
						<el-tag :type="apiStatus === 'online' ? 'success' : 'danger'" size="small">
							{{ apiStatus === 'online' ? '在线' : '离线' }}
						</el-tag>
					</div>
				</div>
			</div>

			<!-- 快速操作 -->
			<div class="bg-white rounded-lg shadow p-6">
				<h2 class="text-lg font-semibold text-gray-900 mb-4">快速操作</h2>
				<div class="space-y-3">
					<el-button 
						type="primary" 
						class="w-full" 
						@click="checkApiStatus"
						:loading="statusLoading"
					>
						检查API状态
					</el-button>
					
					<el-button 
						type="warning" 
						class="w-full" 
						@click="handleClearCache"
					>
						清除缓存
					</el-button>
					
					<el-button 
						type="info" 
						class="w-full" 
						@click="handleExportData"
					>
						导出数据
					</el-button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { useAuthStore } from '@/store/auth';
import { updatePassword } from '@/api/auth';

const authStore = useAuthStore();

const passwordFormRef = ref<FormInstance>();
const passwordLoading = ref(false);
const statusLoading = ref(false);
const apiStatus = ref<'online' | 'offline'>('online');

const passwordForm = reactive({
	oldPassword: '',
	newPassword: '',
	confirmPassword: '',
});

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
	if (value !== passwordForm.newPassword) {
		callback(new Error('两次输入密码不一致'));
	} else {
		callback();
	}
};

const passwordRules: FormRules = {
	oldPassword: [
		{ required: true, message: '请输入当前密码', trigger: 'blur' },
	],
	newPassword: [
		{ required: true, message: '请输入新密码', trigger: 'blur' },
		{ min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' },
	],
	confirmPassword: [
		{ required: true, message: '请确认新密码', trigger: 'blur' },
		{ validator: validateConfirmPassword, trigger: 'blur' },
	],
};

const handlePasswordUpdate = async () => {
	if (!passwordFormRef.value) return;
	
	try {
		await passwordFormRef.value.validate();
		passwordLoading.value = true;
		
		await updatePassword(passwordForm.oldPassword, passwordForm.newPassword);
		
		ElMessage.success('密码修改成功');
		
		// 清空表单
		passwordForm.oldPassword = '';
		passwordForm.newPassword = '';
		passwordForm.confirmPassword = '';
		passwordFormRef.value.resetFields();
	} catch (error) {
		ElMessage.error(error instanceof Error ? error.message : '密码修改失败');
	} finally {
		passwordLoading.value = false;
	}
};

const checkApiStatus = async () => {
	try {
		statusLoading.value = true;
		
		// 尝试获取用户信息来检查API状态
		const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/health`);
		
		if (response.ok) {
			apiStatus.value = 'online';
			ElMessage.success('API服务正常');
		} else {
			apiStatus.value = 'offline';
			ElMessage.warning('API服务异常');
		}
	} catch (error) {
		apiStatus.value = 'offline';
		ElMessage.error('无法连接到API服务');
	} finally {
		statusLoading.value = false;
	}
};

const handleClearCache = () => {
	try {
		// 清除localStorage中的缓存
		const keysToKeep = ['auth-store']; // 保留认证信息
		const allKeys = Object.keys(localStorage);
		
		allKeys.forEach(key => {
			if (!keysToKeep.includes(key)) {
				localStorage.removeItem(key);
			}
		});
		
		ElMessage.success('缓存清除成功');
	} catch (error) {
		ElMessage.error('缓存清除失败');
	}
};

const handleExportData = () => {
	try {
		const data = {
			exportTime: new Date().toISOString(),
			user: authStore.user,
			systemInfo: {
				version: 'v1.0.0',
				userAgent: navigator.userAgent,
			},
		};
		
		const dataStr = JSON.stringify(data, null, 2);
		const blob = new Blob([dataStr], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		
		const link = document.createElement('a');
		link.href = url;
		link.download = `erp-data-export-${new Date().toISOString().split('T')[0]}.json`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		
		URL.revokeObjectURL(url);
		ElMessage.success('数据导出成功');
	} catch (error) {
		ElMessage.error('数据导出失败');
	}
};

onMounted(() => {
	checkApiStatus();
});
</script>


