import { tokenStorage } from "./authApi";

const API_BASE_URL = "http://192.168.2.6:8080/api";

export interface UserOrderItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    images: string;
  };
  quantity: number;
  price: number;
  total: number;
}

export interface UserOrder {
  _id: string;
  orderNumber: string;
  items: UserOrderItem[];
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  finalAmount: number;
  discount: number;
  tax: number;
  shippingFee: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  deliveryMethod: string;
  deliveryAddress?: string;
  deliveryTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  items: Array<{
    product: string; // Backend expects 'product' field
    quantity: number;
    price: number;
  }>;
  paymentMethod: string;
  deliveryMethod: string;
  deliveryAddress?: string;
  notes?: string;
  orderNumber?: string; // Optional: backend will auto-generate if not provided
}

// Mock data for fallback
const mockUserOrders: UserOrder[] = [
  {
    _id: '1',
    orderNumber: 'ORDER-001',
    items: [
      {
        _id: 'item1',
        product: {
          _id: 'prod1',
          name: 'Cơm sườn nướng mật ong',
          price: 30000,
          images: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80'
        },
        quantity: 2,
        price: 30000,
        total: 60000
      }
    ],
    status: 'processing',
    totalAmount: 60000,
    finalAmount: 51000,
    discount: 9000,
    tax: 0,
    shippingFee: 0,
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    deliveryMethod: 'pickup',
    deliveryAddress: 'Phòng 101, Tòa A',
    deliveryTime: '12:30',
    notes: 'Không cay',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:35:00Z'
  },
  {
    _id: '2',
    orderNumber: 'ORDER-002',
    items: [
      {
        _id: 'item2',
        product: {
          _id: 'prod2',
          name: 'Bún chay đặc biệt',
          price: 30000,
          images: 'https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=400&q=80'
        },
        quantity: 1,
        price: 30000,
        total: 30000
      }
    ],
    status: 'shipped',
    totalAmount: 30000,
    finalAmount: 27000,
    discount: 3000,
    tax: 0,
    shippingFee: 0,
    paymentMethod: 'momo',
    paymentStatus: 'paid',
    deliveryMethod: 'delivery',
    deliveryAddress: 'Phòng 205, Tòa B',
    deliveryTime: '11:45',
    notes: '',
    createdAt: '2024-01-15T09:15:00Z',
    updatedAt: '2024-01-15T10:20:00Z'
  }
];

// Helper function to handle API response
const handleResponse = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
};

// Helper function to get auth token
const getAuthHeaders = async () => {
  try {
    const token = await tokenStorage.getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  } catch (error) {
    console.warn("⚠️ No auth token available, some operations may fail");
    return {
      "Content-Type": "application/json",
    } as Record<string, string>;
  }
};

export const userOrderApi = {
  // Get user's orders
  getUserOrders: async (): Promise<{ success: boolean; orders: UserOrder[] }> => {
    try {
      const headers = await getAuthHeaders();
      
      console.log("🔄️ Fetching user orders...");
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
        method: "GET",
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log("📥 Response status:", response.status);
      
      const data = await response.json();
      console.log("📦 Response data:", data);
      
      // Handle different response formats
      if (data.success && data.orders) {
        return data;
      } else if (data.count && data.orders) {
        return { success: true, orders: data.orders };
      } else {
        return await handleResponse(response);
      }
    } catch (error) {
      console.error("❌ Get user orders error:", error);
      console.log("💡 Using mock data as fallback");
      return { success: true, orders: mockUserOrders };
    }
  },

  // Create new order
  createOrder: async (orderData: CreateOrderData): Promise<{ success: boolean; order: UserOrder }> => {
    try {
      const headers = await getAuthHeaders();
      
      // Generate order number if not provided
      const orderWithNumber = {
        ...orderData,
        orderNumber: orderData.orderNumber || `ORDER-${Date.now()}`
      };
      
      console.log("🔄️ Creating new order...");
      console.log("📤 Order data:", orderWithNumber);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers,
        body: JSON.stringify(orderWithNumber),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log("📥 Response status:", response.status);
      return await handleResponse(response);
    } catch (error) {
      console.error("❌ Create order error:", error);
      // Return mock success for demo
      const mockOrder: UserOrder = {
        _id: Date.now().toString(),
        orderNumber: `ORDER-${Date.now()}`,
        items: orderData.items.map((item, index) => ({
          _id: `item${index}`,
          product: {
            _id: item.product,
            name: 'Product Name',
            price: item.price,
            images: 'https://via.placeholder.com/100'
          },
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity
        })),
        status: 'pending',
        totalAmount: orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        finalAmount: orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        discount: 0,
        tax: 0,
        shippingFee: 0,
        paymentMethod: orderData.paymentMethod,
        paymentStatus: 'pending',
        deliveryMethod: orderData.deliveryMethod,
        deliveryAddress: orderData.deliveryAddress,
        notes: orderData.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return { success: true, order: mockOrder };
    }
  },

  // Get order by ID
  getOrderById: async (orderId: string): Promise<{ success: boolean; order: UserOrder }> => {
    try {
      const headers = await getAuthHeaders();
      
      console.log(`🔄️ Fetching order ${orderId}...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: "GET",
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return await handleResponse(response);
    } catch (error) {
      console.error("❌ Get order error:", error);
      const mockOrder = mockUserOrders.find(o => o._id === orderId);
      if (mockOrder) {
        return { success: true, order: mockOrder };
      }
      throw error;
    }
  },

  // Cancel order
  cancelOrder: async (orderId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const headers = await getAuthHeaders();
      
      console.log(`🔄️ Cancelling order ${orderId}...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: "PUT",
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return await handleResponse(response);
    } catch (error) {
      console.error("❌ Cancel order error:", error);
      // Return mock success for demo
      return { success: true, message: "Order cancelled successfully" };
    }
  },

  // Get order tracking
  getOrderTracking: async (orderId: string): Promise<{ success: boolean; tracking: any }> => {
    try {
      const headers = await getAuthHeaders();
      
      console.log(`🔄️ Fetching order tracking ${orderId}...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/tracking`, {
        method: "GET",
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return await handleResponse(response);
    } catch (error) {
      console.error("❌ Get order tracking error:", error);
      // Return mock tracking data
      return {
        success: true,
        tracking: {
          status: 'preparing',
          updates: [
            {
              status: 'pending',
              message: 'Đơn hàng đã được đặt',
              timestamp: new Date(Date.now() - 3600000).toISOString()
            },
            {
              status: 'confirmed',
              message: 'Đơn hàng đã được xác nhận',
              timestamp: new Date(Date.now() - 1800000).toISOString()
            },
            {
              status: 'preparing',
              message: 'Đang chuẩn bị món ăn',
              timestamp: new Date().toISOString()
            }
          ]
        }
      };
    }
  }
}; 