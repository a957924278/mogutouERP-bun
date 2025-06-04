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

export interface CustomerOrderGood {
  id: string;
  number: number;
  // 返回时会包含商品信息
  name?: string;
  colour?: string;
  size?: string;
  brand?: string;
  price?: number;
}

export interface CustomerOrder {
  id: number;
  operator: string;
  operatorName?: string;
  customerName: string;
  customerTel: string;
  deliveryAddress: string;
  deliveryTime: string;
  amount: number;
  deposit: number;
  remarks?: string;
  state: '未完成' | '已完成';
  freight: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  goods: CustomerOrderGood[];
}

export interface CustomerOrderForm {
  remarks?: string;
  amount: number;
  name: string;
  tel: string;
  deliveryAddress: string;
  deliveryTime: string;
  deposit: number;
  goods: Array<{
    id: string;
    number: number;
  }>;
}

export interface CustomerOrderListParams {
  page?: number;
  limit?: number;
}

export interface CustomerOrderListResponse {
  data: CustomerOrder[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

// 创建客户订单 (管理员)
export const createCustomerOrder = async (orderForm: CustomerOrderForm) => {
  return request('/customer-orders', {
    method: 'POST',
    body: JSON.stringify(orderForm),
  });
};

// 获取客户订单列表 (管理员)
export const getCustomerOrders = async (params?: CustomerOrderListParams): Promise<CustomerOrderListResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  
  const url = `/customer-orders${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
  return request(url);
};

// 确认客户订单 (仅创建者)
export const confirmCustomerOrder = async (id: number, freight: number) => {
  return request(`/customer-orders/${id}/confirm`, {
    method: 'PUT',
    body: JSON.stringify({ freight }),
  });
};

// 删除客户订单 (仅创建者)
export const deleteCustomerOrder = async (id: number) => {
  return request(`/customer-orders/${id}`, {
    method: 'DELETE',
  });
}; 