// API cho quản lý món ăn
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  desc: string;
  image: string;
  vendorId: string;
  days: string[];
  category: string;
  type: string;
  status: 'available' | 'almost_out' | 'out';
  servingTime: string;
  rating: number;
  reviewCount: number;
  isPopular: boolean;
  isNew: boolean;
  studentDiscount: number;
  estimatedWaitTime: string;
  calories: number;
  spicyLevel: number;
  availableQuantity?: number;
  maxQuantity?: number;
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

export interface Order {
  id: string;
  foodName: string;
  foodId: string;
  quantity: number;
  total: number;
  status: 'preparing' | 'delivering' | 'delivered' | 'cancelled';
  canEdit: boolean;
  createdAt: string;
  userId: string;
}

// Mock data
let mockMenuItems: MenuItem[] = [
  {
    id: "1",
    name: "Cơm sườn nướng mật ong",
    price: 30000,
    originalPrice: 35000,
    desc: "Cơm sườn nướng tẩm mật ong, ăn kèm dưa leo, trứng kho",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
    vendorId: "v1",
    days: ["T2", "T3", "T4"],
    category: "man",
    type: "com",
    status: "available",
    servingTime: "11:00 - 13:00",
    rating: 4.5,
    reviewCount: 230,
    isPopular: true,
    isNew: false,
    studentDiscount: 15,
    estimatedWaitTime: "5-10 phút",
    calories: 650,
    spicyLevel: 1,
    availableQuantity: 50,
    maxQuantity: 100,
  },
  {
    id: "2",
    name: "Bún chay đặc biệt",
    price: 30000,
    originalPrice: 30000,
    desc: "Bún, đậu hũ, nấm, rau thơm, nước dùng chay thanh mát",
    image: "https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=400&q=80",
    vendorId: "v3",
    days: ["T2", "T5", "T6"],
    category: "chay",
    type: "bun",
    status: "almost_out",
    servingTime: "11:00 - 13:00",
    rating: 4.7,
    reviewCount: 120,
    isPopular: false,
    isNew: true,
    studentDiscount: 10,
    estimatedWaitTime: "3-7 phút",
    calories: 420,
    spicyLevel: 0,
    availableQuantity: 10,
    maxQuantity: 80,
  },
];

let mockOrders: Order[] = [
  {
    id: "1",
    foodName: "Cơm sườn nướng mật ong",
    foodId: "1",
    quantity: 2,
    total: 60000,
    status: "preparing",
    canEdit: true,
    createdAt: "2024-06-01T10:00:00Z",
    userId: "user1",
  },
  {
    id: "2",
    foodName: "Bún chay đặc biệt",
    foodId: "2",
    quantity: 1,
    total: 30000,
    status: "delivering",
    canEdit: false,
    createdAt: "2024-06-01T09:30:00Z",
    userId: "user2",
  },
  {
    id: "3",
    foodName: "Cơm sườn nướng mật ong",
    foodId: "1",
    quantity: 1,
    total: 30000,
    status: "delivered",
    canEdit: false,
    createdAt: "2024-05-31T18:00:00Z",
    userId: "user3",
  },
];

function delay(ms: number): Promise<void> {
  return new Promise<void>((resolve: () => void) => setTimeout(resolve, ms));
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

// Menu Management APIs
export const getMenuItems = async (): Promise<MenuItem[]> => {
  try {
    const response = await apiCall('/products');
    return response.products.map((product: any) => ({
      id: product._id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      desc: product.description || '',
      image: product.images?.[0] || 'https://via.placeholder.com/300x200',
      vendorId: product.vendor || 'v1',
      days: ['T2', 'T3', 'T4', 'T5', 'T6'],
      category: product.category || 'man',
      type: product.type || 'com',
      status: product.status || 'available',
      servingTime: '11:00 - 13:00',
      rating: 4.5,
      reviewCount: Math.floor(Math.random() * 100) + 10,
      isPopular: Math.random() > 0.7,
      isNew: Math.random() > 0.8,
      studentDiscount: 10,
      estimatedWaitTime: '5-10 phút',
      calories: product.calories || 500,
      spicyLevel: product.spicyLevel || 0,
      availableQuantity: product.availableQuantity || 50,
      maxQuantity: product.maxQuantity || 100,
    }));
  } catch (error) {
    console.warn('Failed to fetch menu items from API, using mock data:', error);
    await delay(500);
    return mockMenuItems;
  }
};

export const getMenuItem = async (id: string): Promise<MenuItem | undefined> => {
  try {
    const response = await apiCall(`/products/${id}`);
    const product = response.product;
    return {
      id: product._id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      desc: product.description || '',
      image: product.images?.[0] || 'https://via.placeholder.com/300x200',
      vendorId: product.vendor || 'v1',
      days: ['T2', 'T3', 'T4', 'T5', 'T6'],
      category: product.category || 'man',
      type: product.type || 'com',
      status: product.status || 'available',
      servingTime: '11:00 - 13:00',
      rating: 4.5,
      reviewCount: Math.floor(Math.random() * 100) + 10,
      isPopular: Math.random() > 0.7,
      isNew: Math.random() > 0.8,
      studentDiscount: 10,
      estimatedWaitTime: '5-10 phút',
      calories: product.calories || 500,
      spicyLevel: product.spicyLevel || 0,
      availableQuantity: product.availableQuantity || 50,
      maxQuantity: product.maxQuantity || 100,
    };
  } catch (error) {
    console.warn('Failed to fetch menu item from API, using mock data:', error);
    await delay(300);
    return mockMenuItems.find(item => item.id === id);
  }
};

export const createMenuItem = async (item: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
  await delay(800);
  const newItem: MenuItem = {
    ...item,
    id: Date.now().toString(),
  };
  mockMenuItems.push(newItem);
  return newItem;
};

export const updateMenuItem = async (id: string, updates: Partial<MenuItem>): Promise<MenuItem | undefined> => {
  await delay(600);
  const index = mockMenuItems.findIndex(item => item.id === id);
  if (index !== -1) {
    mockMenuItems[index] = { ...mockMenuItems[index], ...updates };
    return mockMenuItems[index];
  }
  return undefined;
};

export const deleteMenuItem = async (id: string): Promise<boolean> => {
  await delay(400);
  const index = mockMenuItems.findIndex(item => item.id === id);
  if (index !== -1) {
    mockMenuItems.splice(index, 1);
    return true;
  }
  return false;
};

export const updateMenuItemStatus = async (id: string, status: MenuItem['status']): Promise<MenuItem | undefined> => {
  await delay(300);
  const index = mockMenuItems.findIndex(item => item.id === id);
  if (index !== -1) {
    mockMenuItems[index].status = status;
    return mockMenuItems[index];
  }
  return undefined;
};

export const updateMenuItemQuantity = async (id: string, availableQuantity: number): Promise<MenuItem | undefined> => {
  await delay(300);
  const index = mockMenuItems.findIndex(item => item.id === id);
  if (index !== -1) {
    mockMenuItems[index].availableQuantity = availableQuantity;
    // Auto update status based on quantity
    if (availableQuantity === 0) {
      mockMenuItems[index].status = 'out';
    } else if (availableQuantity <= 10) {
      mockMenuItems[index].status = 'almost_out';
    } else {
      mockMenuItems[index].status = 'available';
    }
    return mockMenuItems[index];
  }
  return undefined;
};

// Order Statistics APIs
export const getOrderStats = async (dateRange?: { start: string; end: string }): Promise<OrderStats> => {
  await delay(1000);
  
  // Filter orders by date range if provided
  let filteredOrders = mockOrders;
  if (dateRange) {
    filteredOrders = mockOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      return orderDate >= startDate && orderDate <= endDate;
    });
  }

  // Calculate basic stats
  const totalOrders = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Orders by day
  const ordersByDay: { [key: string]: number } = {};
  filteredOrders.forEach(order => {
    const day = new Date(order.createdAt).toLocaleDateString('vi-VN', { weekday: 'short' });
    ordersByDay[day] = (ordersByDay[day] || 0) + 1;
  });

  // Orders by hour
  const ordersByHour: { [key: string]: number } = {};
  filteredOrders.forEach(order => {
    const hour = new Date(order.createdAt).getHours().toString().padStart(2, '0');
    ordersByHour[hour] = (ordersByHour[hour] || 0) + 1;
  });

  // Top selling items
  const itemStats: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
  filteredOrders.forEach(order => {
    if (!itemStats[order.foodId]) {
      itemStats[order.foodId] = { name: order.foodName, quantity: 0, revenue: 0 };
    }
    itemStats[order.foodId].quantity += order.quantity;
    itemStats[order.foodId].revenue += order.total;
  });

  const topSellingItems = Object.entries(itemStats)
    .map(([id, stats]) => ({ id, ...stats }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Peak hours
  const peakHours = Object.entries(ordersByHour)
    .map(([hour, orderCount]) => ({ hour, orderCount }))
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, 5);

  return {
    totalOrders,
    totalRevenue,
    averageOrderValue,
    ordersByDay,
    ordersByHour,
    topSellingItems,
    peakHours,
  };
};

export const getOrdersByDateRange = async (startDate: string, endDate: string): Promise<Order[]> => {
  await delay(500);
  return mockOrders.filter(order => {
    const orderDate = new Date(order.createdAt);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return orderDate >= start && orderDate <= end;
  });
};

export const getTopSellingItems = async (limit: number = 10): Promise<Array<{ id: string; name: string; quantity: number; revenue: number }>> => {
  await delay(600);
  const itemStats: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
  
  mockOrders.forEach(order => {
    if (!itemStats[order.foodId]) {
      itemStats[order.foodId] = { name: order.foodName, quantity: 0, revenue: 0 };
    }
    itemStats[order.foodId].quantity += order.quantity;
    itemStats[order.foodId].revenue += order.total;
  });

  return Object.entries(itemStats)
    .map(([id, stats]) => ({ id, ...stats }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
}; 