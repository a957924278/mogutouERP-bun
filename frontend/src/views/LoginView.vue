<template>
	<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
		<div class="max-w-md w-full space-y-8">
			<div>
				<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
					登录到您的账户
				</h2>
			</div>
			<el-form
				ref="loginFormRef"
				:model="loginForm"
				:rules="rules"
				class="mt-8 space-y-6"
				@submit.prevent="handleLogin"
			>
				<div class="rounded-md shadow-sm -space-y-px">
					<el-form-item prop="tel">
						<el-input
							v-model="loginForm.tel"
							placeholder="手机号"
							prefix-icon="Phone"
							size="large"
							class="relative block w-full"
						/>
					</el-form-item>
					
					<el-form-item prop="password">
						<el-input
							v-model="loginForm.password"
							type="password"
							placeholder="密码"
							prefix-icon="Lock"
							size="large"
							class="relative block w-full"
							show-password
						/>
					</el-form-item>
				</div>

				<div>
					<el-button
						type="primary"
						size="large"
						:loading="loading"
						@click="handleLogin"
						class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
					>
						{{ loading ? '登录中...' : '登录' }}
					</el-button>
				</div>

				<div class="flex items-center justify-between">
					<div class="text-sm">
						<span class="text-gray-600">还没有账户？</span>
						<el-button type="text" @click="showRegister = true">注册</el-button>
					</div>
				</div>
			</el-form>
		</div>

		<!-- 注册对话框 -->
		<el-dialog
			v-model="showRegister"
			title="用户注册"
			width="400px"
			@close="resetRegisterForm"
		>
			<el-form
				ref="registerFormRef"
				:model="registerForm"
				:rules="registerRules"
				label-width="80px"
			>
				<el-form-item label="姓名" prop="name">
					<el-input v-model="registerForm.name" />
				</el-form-item>
				
				<el-form-item label="手机号" prop="tel">
					<el-input v-model="registerForm.tel" />
				</el-form-item>
				
				<el-form-item label="密码" prop="password">
					<el-input
						v-model="registerForm.password"
						type="password"
						show-password
					/>
				</el-form-item>
			</el-form>
			
			<template #footer>
				<el-button @click="showRegister = false">取消</el-button>
				<el-button type="primary" :loading="registerLoading" @click="handleRegister">
					注册
				</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { useAuthStore } from '@/store/auth';
import { login, register, getCurrentUser } from '@/api/auth';
import type { LoginForm, RegisterForm } from '@/store/auth';

const router = useRouter();
const authStore = useAuthStore();

const loginFormRef = ref<FormInstance>();
const registerFormRef = ref<FormInstance>();
const loading = ref(false);
const registerLoading = ref(false);
const showRegister = ref(false);

const loginForm = reactive<LoginForm>({
	tel: '',
	password: '',
});

const registerForm = reactive<RegisterForm>({
	name: '',
	tel: '',
	password: '',
});

const rules: FormRules = {
	tel: [
		{ required: true, message: '请输入手机号', trigger: 'blur' },
		{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' },
	],
	password: [
		{ required: true, message: '请输入密码', trigger: 'blur' },
		{ min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' },
	],
};

const registerRules: FormRules = {
	name: [
		{ required: true, message: '请输入姓名', trigger: 'blur' },
		{ min: 1, max: 50, message: '姓名长度在 1 到 50 个字符', trigger: 'blur' },
	],
	tel: [
		{ required: true, message: '请输入手机号', trigger: 'blur' },
		{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' },
	],
	password: [
		{ required: true, message: '请输入密码', trigger: 'blur' },
		{ min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' },
	],
};

const handleLogin = async () => {
	if (!loginFormRef.value) return;
	
	try {
		await loginFormRef.value.validate();
		loading.value = true;
		
		const response = await login(loginForm);
		
		if (response.token) {
			authStore.setToken(response.token);
			
			// 获取用户信息
			const userInfo = await getCurrentUser();
			authStore.setUser(userInfo);
			
			ElMessage.success('登录成功');
			router.push('/dashboard');
		}
	} catch (error) {
		ElMessage.error(error instanceof Error ? error.message : '登录失败');
	} finally {
		loading.value = false;
	}
};

const handleRegister = async () => {
	if (!registerFormRef.value) return;
	
	try {
		await registerFormRef.value.validate();
		registerLoading.value = true;
		
		await register(registerForm);
		
		ElMessage.success('注册成功，请登录');
		showRegister.value = false;
		resetRegisterForm();
	} catch (error) {
		ElMessage.error(error instanceof Error ? error.message : '注册失败');
	} finally {
		registerLoading.value = false;
	}
};

const resetRegisterForm = () => {
	registerFormRef.value?.resetFields();
	Object.assign(registerForm, {
		name: '',
		tel: '',
		password: '',
	});
};
</script>


