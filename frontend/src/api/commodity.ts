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

export interface Commodity {
  id: number;
  name: string;
  colour: string;
  size: string;
  brand: string;
  number: number;
  presaleNumber: number;
  salesVolume: number;
  price: number;
  purchasePrice?: number; // 普通用户看不到采购价格
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CommodityForm {
  name: string;
  colour: string;
  size: string;
  brand: string;
  number: number;
  presaleNumber?: number;
  salesVolume?: number;
  price: number;
  purchasePrice: number;
}

export interface CommodityListParams {
  page?: number;
  limit?: number;
  name?: string;
}

export interface CommodityListResponse {
  data: Commodity[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

// 创建商品 (管理员)
export const createCommodity = async (commodityForm: CommodityForm) => {
  return request('/commodities', {
    method: 'POST',
    body: JSON.stringify(commodityForm),
  });
};

// 获取商品列表 (普通用户) - 不含采购价格
export const getCommodities = async (params?: CommodityListParams): Promise<CommodityListResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.name) searchParams.append('name', params.name);
  
  const url = `/commodities${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
  return request(url);
};

// 管理员获取商品列表 - 包含采购价格
export const getAdminCommodities = async (params?: CommodityListParams): Promise<CommodityListResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.name) searchParams.append('name', params.name);
  
  const url = `/commodities/admin${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
  return request(url);
};

// 获取单个商品
export const getCommodity = async (id: number): Promise<Commodity> => {
  return request(`/commodities/${id}`);
};

// 更新商品 (管理员)
export const updateCommodity = async (id: number, commodityForm: Partial<CommodityForm>) => {
  return request(`/commodities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(commodityForm),
  });
};

// 删除商品 (管理员)
export const deleteCommodity = async (id: number) => {
  return request(`/commodities/${id}`, {
    method: 'DELETE',
  });
}; 