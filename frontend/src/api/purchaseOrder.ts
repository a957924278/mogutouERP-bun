const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// 请求拦截器
const request = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '请求失败' }));
    throw new Error(error.error || error.message || '请求失败');
  }
  
  return response.json();
};

export interface PurchaseOrderGood {
  id: string;
  number: number;
  // 返回时会包含商品信息
  name?: string;
  colour?: string;
  size?: string;
  brand?: string;
  price?: number;
  purchasePrice?: number;
}

export interface PurchaseOrder {
  id: number;
  operator: string;
  operatorName?: string;
  remarks?: string;
  amount: number;
  freight: number;
  state: '未完成' | '已完成';
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  goods: PurchaseOrderGood[];
}

export interface PurchaseOrderForm {
  remarks?: string;
  amount: number;
  freight: number;
  goods: Array<{
    id: string;
    number: number;
  }>;
}

export interface PurchaseOrderListParams {
  page?: number;
  limit?: number;
}

export interface PurchaseOrderListResponse {
  data: PurchaseOrder[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

// 创建采购订单 (管理员)
export const createPurchaseOrder = async (orderForm: PurchaseOrderForm) => {
  return request('/purchase-orders', {
    method: 'POST',
    body: JSON.stringify(orderForm),
  });
};

// 获取采购订单列表 (管理员)
export const getPurchaseOrders = async (params?: PurchaseOrderListParams): Promise<PurchaseOrderListResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  
  const url = `/purchase-orders${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
  return request(url);
};

// 确认采购订单 (仅创建者)
export const confirmPurchaseOrder = async (id: number, freight: number) => {
  return request(`/purchase-orders/${id}/confirm`, {
    method: 'PUT',
    body: JSON.stringify({ freight }),
  });
};

// 删除采购订单 (仅创建者)
export const deletePurchaseOrder = async (id: number) => {
  return request(`/purchase-orders/${id}`, {
    method: 'DELETE',
  });
}; 