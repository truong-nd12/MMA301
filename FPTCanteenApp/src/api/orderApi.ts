// API cho quản lý đơn hàng và thống kê
export type OrderStatus =
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  foodName: string;
  total: number;
  status: OrderStatus;
  canEdit: boolean;
  createdAt: string;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByDay: { [key: string]: number };
  ordersByHour: { [key: string]: number };
  topSellingItems: Array<{
    id: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  peakHours: Array<{
    hour: string;
    orderCount: number;
  }>;
}

const API_BASE_URL = 'http://192.168.1.11:8080/api';

import AsyncStorage from "@react-native-async-storage/async-storage";

// Helper function to handle API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = await AsyncStorage.getItem('authToken');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// Mock data for fallback
const mockOrders: Order[] = [
  {
    id: "1",
    foodName: "Cơm gà",
    total: 35000,
    status: "processing",
    canEdit: true,
    createdAt: "2024-06-01T10:00:00Z",
  },
  {
    id: "2",
    foodName: "Bún bò",
    total: 40000,
    status: "shipped",
    canEdit: false,
    createdAt: "2024-06-01T09:30:00Z",
  },
  {
    id: "3",
    foodName: "Phở bò",
    total: 30000,
    status: "delivered",
    canEdit: false,
    createdAt: "2024-05-31T18:00:00Z",
  },
];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Order Management APIs
export const getOrders = async (userId: string): Promise<Order[]> => {
  try {
    const response = await apiCall('/orders');
    return response.orders.map((order: any) => ({
      id: order._id,
      foodName: order.items?.[0]?.product?.name || 'Unknown',
      total: order.finalAmount,
      status: order.status,
      canEdit: order.status === 'preparing',
      createdAt: order.createdAt,
    }));
  } catch (error) {
    console.warn('Failed to fetch orders from API, using mock data:', error);
    await delay(700);
    return mockOrders;
  }
};

export const getOrderDetail = async (
  orderId: string
): Promise<Order | undefined> => {
  try {
    const response = await apiCall(`/orders/${orderId}`);
    const order = response.order;
    return {
      id: order._id,
      foodName: order.items?.[0]?.product?.name || 'Unknown',
      total: order.finalAmount,
      status: order.status,
      canEdit: order.status === 'preparing',
      createdAt: order.createdAt,
    };
  } catch (error) {
    console.warn('Failed to fetch order detail from API, using mock data:', error);
    await delay(500);
    return mockOrders.find((o) => o.id === orderId);
  }
};

export const cancelOrder = async (
  orderId: string
): Promise<Order | undefined> => {
  try {
    const response = await apiCall(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'cancelled' }),
    });
    const order = response.order;
    return {
      id: order._id,
      foodName: order.items?.[0]?.product?.name || 'Unknown',
      total: order.finalAmount,
      status: order.status,
      canEdit: false,
      createdAt: order.createdAt,
    };
  } catch (error) {
    console.warn('Failed to cancel order via API, using mock data:', error);
    await delay(500);
    const idx = mockOrders.findIndex((o) => o.id === orderId);
    if (idx !== -1) {
      mockOrders[idx].status = "cancelled";
      mockOrders[idx].canEdit = false;
      return mockOrders[idx];
    }
    return undefined;
  }
};

// Tạo đơn hàng mới
export const createOrder = async (orderData: any): Promise<any> => {
  const response = await apiCall('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
  return response.order;
};

// Lấy danh sách đơn hàng của user hiện tại
export const getUserOrders = async (): Promise<Order[]> => {
  const response = await apiCall('/orders');
  // Lọc đơn của user hiện tại nếu backend trả về tất cả (nếu backend đã filter thì bỏ bước này)
  return response.orders.map((order: any) => ({
    id: order._id,
    foodName: order.items?.[0]?.product?.name || 'Unknown',
    total: order.finalAmount,
    status: order.status,
    canEdit: order.status === 'processing',
    createdAt: order.createdAt,
  }));
};

// Statistics APIs
export const getOrderStats = async (dateRange?: { start: string; end: string }): Promise<OrderStats> => {
  try {
    const params = dateRange ? `?startDate=${dateRange.start}&endDate=${dateRange.end}` : '';
    const response = await apiCall(`/orders/stats${params}`);
    const stats = response.stats;
    
    // Transform backend data to match frontend interface
    const ordersByDay: { [key: string]: number } = {};
    stats.ordersByDay.forEach((day: any) => {
      const date = new Date(day.day);
      const dayName = date.toLocaleDateString('vi-VN', { weekday: 'short' });
      ordersByDay[dayName] = day.count;
    });

    const ordersByHour: { [key: string]: number } = {};
    stats.ordersByHour.forEach((hour: any) => {
      ordersByHour[hour.hour] = hour.count;
    });

    const peakHours = stats.ordersByHour
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5)
      .map((hour: any) => ({
        hour: hour.hour.split(':')[0],
        orderCount: hour.count,
      }));

    return {
      totalOrders: stats.totalOrders,
      totalRevenue: stats.totalRevenue,
      averageOrderValue: stats.averageOrderValue,
      ordersByDay,
      ordersByHour,
      topSellingItems: stats.topSellingItems.map((item: any) => ({
        id: item.productId,
        name: item.productName,
        quantity: item.quantity,
        revenue: item.revenue,
      })),
      peakHours,
    };
  } catch (error) {
    console.warn('Failed to fetch order stats from API, using mock data:', error);
    await delay(1000);
    
    // Return mock statistics
    return {
      totalOrders: 15,
      totalRevenue: 450000,
      averageOrderValue: 30000,
      ordersByDay: {
        'T2': 3,
        'T3': 5,
        'T4': 4,
        'T5': 6,
        'T6': 2,
      },
      ordersByHour: {
        '10': 2,
        '11': 4,
        '12': 6,
        '13': 3,
      },
      topSellingItems: [
        { id: '1', name: 'Cơm sườn nướng mật ong', quantity: 25, revenue: 750000 },
        { id: '2', name: 'Bún chay đặc biệt', quantity: 18, revenue: 540000 },
        { id: '3', name: 'Phở bò', quantity: 15, revenue: 450000 },
      ],
      peakHours: [
        { hour: '12', orderCount: 6 },
        { hour: '11', orderCount: 4 },
        { hour: '13', orderCount: 3 },
        { hour: '10', orderCount: 2 },
      ],
    };
  }
};

export const getOrdersByDateRange = async (startDate: string, endDate: string): Promise<Order[]> => {
  try {
    const response = await apiCall(`/orders/date-range?startDate=${startDate}&endDate=${endDate}`);
    return response.orders.map((order: any) => ({
      id: order._id,
      foodName: order.items?.[0]?.product?.name || 'Unknown',
      total: order.finalAmount,
      status: order.status,
      canEdit: order.status === 'preparing',
      createdAt: order.createdAt,
    }));
  } catch (error) {
    console.warn('Failed to fetch orders by date range from API, using mock data:', error);
    await delay(500);
    return mockOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return orderDate >= start && orderDate <= end;
    });
  }
};

export const getTopSellingItems = async (limit: number = 10): Promise<Array<{ id: string; name: string; quantity: number; revenue: number }>> => {
  try {
    const response = await apiCall(`/orders/top-selling?limit=${limit}`);
    return response.items.map((item: any) => ({
      id: item.productId,
      name: item.productName,
      quantity: item.quantity,
      revenue: item.revenue,
    }));
  } catch (error) {
    console.warn('Failed to fetch top selling items from API, using mock data:', error);
    await delay(600);
    return [
      { id: '1', name: 'Cơm sườn nướng mật ong', quantity: 25, revenue: 750000 },
      { id: '2', name: 'Bún chay đặc biệt', quantity: 18, revenue: 540000 },
      { id: '3', name: 'Phở bò', quantity: 15, revenue: 450000 },
    ];
  }
};
