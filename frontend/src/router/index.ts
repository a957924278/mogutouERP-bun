import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { 
  DataAnalysis, 
  Setting, 
  Goods, 
  ShoppingCart, 
  ShoppingBag 
} from '@element-plus/icons-vue';
import { useAuthStore } from '@/store/auth';

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("@/views/Layout.vue"),
    children: [
      {
        path: "",
        name: "dashboardRedirect",
        redirect: "/dashboard",
      },
      {
        path: "dashboard",
        name: "dashboard",
        component: () => import("@/views/DashboardView.vue"),
        meta: {
          title: "仪表盘",
          icon: DataAnalysis,
          requiresAuth: true,
          showInSidebar: true,
        },
      },
      {
        path: 'commodities',
        name: 'commodities',
        component: () => import('@/views/CommodityView.vue'),
        meta: {
          title: "商品管理",
          icon: Goods,
          requiresAuth: true,
          showInSidebar: true,
        },
      },
      {
        path: 'customer-orders',
        name: 'customer-orders',
        component: () => import('@/views/CustomerOrderView.vue'),
        meta: {
          title: "客户订单",
          icon: ShoppingCart,
          requiresAuth: true,
          showInSidebar: true,
          permissions: ["admin"],
        },
      },
      {
        path: 'purchase-orders',
        name: 'purchase-orders',
        component: () => import('@/views/PurchaseOrderView.vue'),
        meta: {
          title: "采购订单",
          icon: ShoppingBag,
          requiresAuth: true,
          showInSidebar: true,
          permissions: ["admin"],
        },
      },
      {
        path: 'price',
        name: 'price',
        component: () => import('@/views/Price.vue'),
        meta: {
          title: "价格查询",
          icon: DataAnalysis,
          requiresAuth: true,
          showInSidebar: true,
        },
      },
      {
        path: 'stock',
        name: 'stock',
        component: () => import('@/views/StockView.vue'),
        meta: {
          title: "库存查询",
          icon: DataAnalysis,
          requiresAuth: true,
          showInSidebar: true,
        },
      },
      {
        path: "settings",
        name: "settings",
        component: () => import("@/views/SettingsView.vue"),
        meta: {
          title: "系统设置",
          icon: Setting,
          requiresAuth: true,
          showInSidebar: true,
          permissions: ["admin"],
        },
      },
      {
        path: "data-management",
        name: "data-management",
        component: () => import("@/views/DataManagementView.vue"),
        meta: {
          title: "数据管理",
          icon: DataAnalysis,
          requiresAuth: true,
          showInSidebar: true,
          permissions: ["admin"],
        },
      },
    ],
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/LoginView.vue"),
    meta: {
      title: "登录",
      guestOnly: true,
    },
  },
  {
    path: "/403",
    name: "403",
    component: () => import("@/views/403.vue"),
    meta: {
      title: "无权限访问",
    },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "404",
    component: () => import("@/views/404.vue"),
    meta: {
      title: "页面未找到",
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

router.beforeEach((to, _from, next) => {
  NProgress.start();
  
  const authStore = useAuthStore();
  
  // 检查是否需要认证
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
    return;
  }
  
  // 检查是否是仅游客访问的页面（如登录页）
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    next('/dashboard');
    return;
  }
  
  // 检查权限
  if (to.meta.permissions && authStore.isAuthenticated) {
    const permissions = to.meta.permissions as string[];
    if (permissions.includes('admin') && !authStore.isAdmin) {
      next('/403');
      return;
    }
  }
  
  next();
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
