<template>
	<div class="flex flex-col w-screen h-screen overflow-auto">
		<!-- Header section -->
		<div
			class="flex justify-between items-center h-1/15 border-b border-gray-200 box-border bg-[#242F42] text-1xl text-white">
			<!-- 折叠按钮 -->
			<div class="flex items-center h-full pl-5">
				<div class="cursor-pointer opacity-50 hover:opacity-80 text-[22px]" @click="collapseChange" title="切换侧边栏">
					<el-icon v-if="sidebar.isCollapsed">
						<Expand />
					</el-icon>
					<el-icon v-else>
						<Fold />
					</el-icon>
				</div>
			</div>
			
			<!-- 用户信息和操作 -->
			<div class="flex items-center pr-[50px] space-x-4">
				<!-- 用户信息 -->
				<div class="flex items-center space-x-2">
					<el-icon><User /></el-icon>
					<span class="text-sm">{{ authStore.user?.name }}</span>
					<el-tag 
						:type="authStore.user?.role === 'admin' ? 'danger' : 'info'" 
						size="small"
					>
						{{ authStore.user?.role === 'admin' ? '管理员' : '普通用户' }}
					</el-tag>
				</div>
				
				<!-- 全屏按钮 -->
				<div class="cursor-pointer flex items-center" @click="setFullScreen" title="全屏">
					<el-tooltip content="全屏" placement="bottom">
						<el-icon size="20px">
							<FullScreen />
						</el-icon>
					</el-tooltip>
				</div>
				
				<!-- 退出登录 -->
				<div class="cursor-pointer flex items-center" @click="handleLogout" title="退出登录">
					<el-tooltip content="退出登录" placement="bottom">
						<el-icon size="20px">
							<SwitchButton />
						</el-icon>
					</el-tooltip>
				</div>
			</div>
		</div>
		<!-- sidebar and main content -->
		<div class="flex flex-row h-14/15">
			<el-menu
				class="w-40 shrink-0 overflow-y-auto"
				:default-active="onRoutes"
				:collapse="sidebar.isCollapsed"
				router
				background-color="#324157"
				text-color="#BFCBD9">
				<template v-for="item in filteredMenuData">
					<template v-if="item.children">
						<el-sub-menu :index="item.path" :key="item.path">

							<template #title>
								<el-icon>
									<component :is="item.meta?.icon"></component>
								</el-icon>
								<span>{{ item.meta?.title }}</span>
							</template>

							<el-menu-item v-for="subItem in item.children" :key="subItem.path" :index="subItem.path">
								{{ subItem.meta?.title }}
							</el-menu-item>

						</el-sub-menu>
					</template>
					<template v-else>
						<el-menu-item :index="item.path" :key="item.path">
							<el-icon>
								<component :is="item.meta?.icon"></component>
							</el-icon>
							<span>{{ item.meta?.title }}</span>
						</el-menu-item>
					</template>
				</template>
			</el-menu>
			<!-- Main content view -->
			<div class="flex-1 overflow-y-auto p-4 bg-gray-100">
				<router-view />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Expand, Fold, FullScreen, User, SwitchButton } from '@element-plus/icons-vue';
import { useSidebarStore } from '../store/sidebar';
import { useAuthStore } from '../store/auth';
import { routes } from '../router/index';

const menuData = routes[0]?.children?.filter(item => item.path !== '') ?? [];

const route = useRoute();
const router = useRouter();
const sidebar = useSidebarStore();
const authStore = useAuthStore();

const onRoutes = computed(() => {
	return route.path;
});

// 根据用户权限过滤菜单
const filteredMenuData = computed(() => {
	return menuData.filter(item => {
		// 检查是否在侧边栏显示
		if (!item.meta?.showInSidebar) return false;
		
		// 检查权限
		if (item.meta?.permissions) {
			const permissions = item.meta.permissions as string[];
			if (permissions.includes('admin') && !authStore.isAdmin) {
				return false;
			}
		}
		
		return true;
	});
});

const collapseChange = () => {
    sidebar.toggleSidebar();
};

const setFullScreen = () => {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        document.body.requestFullscreen.call(document.body);
    }
};

const handleLogout = async () => {
	try {
		await ElMessageBox.confirm(
			'确定要退出登录吗？',
			'退出确认',
			{
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
			}
		);
		
		authStore.clearToken();
		ElMessage.success('已退出登录');
		router.push('/login');
	} catch {
		// 用户取消
	}
};
</script>
