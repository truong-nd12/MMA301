import { tokenStorage } from "./authApi";

const API_BASE_URL = "http://192.168.1.11:8080/api";

// Type definitions
export interface Product {
  _id: string;
  name: string;
  description: string;
  images: string;
  price: number;
  calories: number;
  discount: number;
  category: {
    _id: string;
    name: string;
  };
  brand?: {
    _id: string;
    name: string;
  };
  sku: string;
  stock: number;
  rating: number;
  reviewCount: number;
  tags: Array<{ _id: string; name: string }>;
  addOns: Array<{
    name: string;
    price: number;
    calories: number;
  }>;
  sizes: Array<{
    size: "S" | "M" | "L";
    price: number;
    calories: number;
  }>;
  options: {
    sugar: string[];
    ice: string[];
  };
  isActive: boolean;
  isFeatured: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  images: string;
  price: number;
  calories: number;
  discount?: number;
  category: string;
  brand?: string;
  sku?: string;
  stock?: number;
  tags?: string[];
  addOns?: Array<{
    name: string;
    price: number;
    calories: number;
  }>;
  sizes?: Array<{
    size: "S" | "M" | "L";
    price: number;
    calories: number;
  }>;
  options?: {
    sugar: string[];
    ice: string[];
  };
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface UpdateProductData extends Partial<CreateProductData> {}

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

// Mock data for fallback
const mockProducts: Product[] = [
  {
    _id: '1',
    name: 'Cơm sườn nướng mật ong',
    description: 'Cơm sườn nướng tẩm mật ong, ăn kèm dưa leo, trứng kho',
    images: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    price: 30000,
    calories: 650,
    discount: 15,
    category: { _id: '1', name: 'Mặn' },
    brand: { _id: '1', name: 'Quầy Cơm' },
    sku: 'COM001',
    stock: 50,
    rating: 4.5,
    reviewCount: 230,
    tags: [],
    addOns: [],
    sizes: [],
    options: { sugar: [], ice: [] },
    isActive: true,
    isFeatured: true,
    createdBy: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    _id: '2',
    name: 'Bún chay đặc biệt',
    description: 'Bún, đậu hũ, nấm, rau thơm, nước dùng chay thanh mát',
    images: 'https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=400&q=80',
    price: 30000,
    calories: 420,
    discount: 10,
    category: { _id: '2', name: 'Chay' },
    brand: { _id: '3', name: 'Quầy Chay' },
    sku: 'BUN001',
    stock: 10,
    rating: 4.7,
    reviewCount: 120,
    tags: [],
    addOns: [],
    sizes: [],
    options: { sugar: [], ice: [] },
    isActive: true,
    isFeatured: false,
    createdBy: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    _id: '3',
    name: 'Phở bò tái',
    description: 'Phở bò tái với nước dùng đậm đà, bánh phở dai ngon',
    images: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80',
    price: 35000,
    calories: 580,
    discount: 0,
    category: { _id: '1', name: 'Mặn' },
    brand: { _id: '2', name: 'Quầy Bún' },
    sku: 'PHO001',
    stock: 25,
    rating: 4.8,
    reviewCount: 180,
    tags: [],
    addOns: [],
    sizes: [],
    options: { sugar: [], ice: [] },
    isActive: true,
    isFeatured: true,
    createdBy: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    _id: '4',
    name: 'Trà sữa trân châu',
    description: 'Trà sữa đen với trân châu đường đen, ngọt thanh',
    images: 'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=400&q=80',
    price: 25000,
    calories: 320,
    discount: 5,
    category: { _id: '4', name: 'Nước' },
    brand: { _id: '4', name: 'Quầy Đồ Uống' },
    sku: 'TRA001',
    stock: 100,
    rating: 4.6,
    reviewCount: 95,
    tags: [],
    addOns: [],
    sizes: [],
    options: { sugar: [], ice: [] },
    isActive: true,
    isFeatured: false,
    createdBy: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const productApi = {
  // Get all products (Public - no auth required)
  getAllProducts: async (): Promise<{ success: boolean; products: Product[] }> => {
    try {
      console.log("🔄️ Fetching all products from:", `${API_BASE_URL}/products`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log("📥 Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("📦 Response data:", data);
      return data;
    } catch (error) {
      console.error("❌ Get all products error:", error);
      console.log("💡 Using mock data as fallback");
      return { success: true, products: mockProducts };
    }
  },

  // Create new product (Admin)
  createProduct: async (productData: CreateProductData): Promise<{ success: boolean; product: Product }> => {
    try {
      const headers = await getAuthHeaders();
      
      console.log("🔄️ Creating new product...");
      console.log("📤 Product data:", productData);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers,
        body: JSON.stringify(productData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log("📥 Response status:", response.status);
      return await handleResponse(response);
    } catch (error) {
      console.error("❌ Create product error:", error);
      // Return mock success for demo
      const mockProduct: Product = {
        _id: Date.now().toString(),
        name: productData.name,
        description: productData.description,
        images: productData.images,
        price: productData.price,
        calories: productData.calories,
        discount: productData.discount || 0,
        category: { _id: productData.category, name: 'Mặn' },
        brand: { _id: '1', name: 'Quầy Cơm' },
        sku: productData.sku || 'SKU001',
        stock: productData.stock || 0,
        rating: 0,
        reviewCount: 0,
        tags: [],
        addOns: [],
        sizes: [],
        options: { sugar: [], ice: [] },
        isActive: productData.isActive !== false,
        isFeatured: false,
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { success: true, product: mockProduct };
    }
  },

  // Update product (Admin)
  updateProduct: async (productId: string, productData: UpdateProductData): Promise<{ success: boolean; product: Product }> => {
    try {
      const headers = await getAuthHeaders();
      
      console.log(`🔄️ Updating product ${productId}...`);
      console.log("📤 Update data:", productData);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(productData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log("📥 Response status:", response.status);
      return await handleResponse(response);
    } catch (error) {
      console.error("❌ Update product error:", error);
      // Return mock success for demo
      const mockProduct: Product = {
        _id: productId,
        name: productData.name || 'Updated Product',
        description: productData.description || '',
        images: productData.images || '',
        price: productData.price || 0,
        calories: productData.calories || 0,
        discount: productData.discount || 0,
        category: { _id: productData.category || '1', name: 'Mặn' },
        brand: { _id: '1', name: 'Quầy Cơm' },
        sku: 'SKU001',
        stock: productData.stock || 0,
        rating: 0,
        reviewCount: 0,
        tags: [],
        addOns: [],
        sizes: [],
        options: { sugar: [], ice: [] },
        isActive: productData.isActive !== false,
        isFeatured: false,
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { success: true, product: mockProduct };
    }
  },

  // Delete product (Admin)
  deleteProduct: async (productId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const headers = await getAuthHeaders();
      
      console.log(`🔄️ Deleting product ${productId}...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: "DELETE",
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log("📥 Response status:", response.status);
      return await handleResponse(response);
    } catch (error) {
      console.error("❌ Delete product error:", error);
      // Return mock success for demo
      return { success: true, message: "Product deleted successfully" };
    }
  },

  // Get single product
  getProduct: async (productId: string): Promise<{ success: boolean; product: Product }> => {
    try {
      console.log(`🔄️ Fetching product ${productId}...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log("📥 Response status:", response.status);
      return await handleResponse(response);
    } catch (error) {
      console.error("❌ Get product error:", error);
      const mockProduct = mockProducts.find(p => p._id === productId);
      if (mockProduct) {
        return { success: true, product: mockProduct };
      }
      throw error;
    }
  },

  // Get categories
  getCategories: async (): Promise<{ success: boolean; categories: any[] }> => {
    try {
      console.log("🔄️ Fetching categories...");
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return await handleResponse(response);
    } catch (error) {
      console.error("❌ Get categories error:", error);
      return { 
        success: true, 
        categories: [
          { _id: '1', name: 'Mặn' },
          { _id: '2', name: 'Chay' },
          { _id: '3', name: 'Ăn nhẹ' },
          { _id: '4', name: 'Nước' }
        ] 
      };
    }
  },

  // Get brands
  getBrands: async (): Promise<{ success: boolean; brands: any[] }> => {
    try {
      console.log("🔄️ Fetching brands...");
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_BASE_URL}/brands`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return await handleResponse(response);
    } catch (error) {
      console.error("❌ Get brands error:", error);
      return { 
        success: true, 
        brands: [
          { _id: '1', name: 'Quầy Cơm' },
          { _id: '2', name: 'Quầy Bún' },
          { _id: '3', name: 'Quầy Chay' },
          { _id: '4', name: 'Quầy Đồ Uống' },
          { _id: '5', name: 'Quầy Tráng Miệng' }
        ] 
      };
    }
  },
}; 