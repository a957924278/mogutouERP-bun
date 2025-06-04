<template>
	<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
		<div class="max-w-md w-full text-center">
			<div class="mb-8">
				<div class="flex justify-center mb-6">
					<div class="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center">
						<el-icon class="text-6xl text-red-500">
							<Lock />
						</el-icon>
					</div>
				</div>
				<h1 class="text-6xl font-bold text-gray-900 mb-4">403</h1>
				<h2 class="text-2xl font-semibold text-gray-700 mb-4">访问被拒绝</h2>
				<p class="text-gray-500 mb-8">
					抱歉，您没有权限访问此页面。请联系管理员获取相应权限。
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
			
			<div class="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
				<div class="flex items-center">
					<el-icon class="text-yellow-600 mr-2">
						<Warning />
					</el-icon>
					<p class="text-sm text-yellow-700">
						当前用户角色: {{ authStore.user?.role === 'admin' ? '管理员' : '普通用户' }}
					</p>
				</div>
				<p class="text-xs text-yellow-600 mt-2">
					此页面需要管理员权限才能访问
				</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Lock, Warning } from '@element-plus/icons-vue';
import { useAuthStore } from '@/store/auth';

const router = useRouter();
const authStore = useAuthStore();

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
</script>


