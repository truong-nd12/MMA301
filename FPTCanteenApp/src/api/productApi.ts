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
  const token = await tokenStorage.getToken();
  if (!token) {
    throw new Error("No authentication token found");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const productApi = {
  // Get all products (Admin)
  getAllProducts: async (): Promise<{ success: boolean; products: Product[] }> => {
    try {
      const headers = await getAuthHeaders();
      
      console.log("🔄️ Fetching all products...");
      
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: "GET",
        headers,
      });

      console.log("📥 Response status:", response.status);
      return await handleResponse(response);
    } catch (error) {
      console.error("❌ Get all products error:", error);
      throw error;
    }
  },

  // Create new product (Admin)
  createProduct: async (productData: CreateProductData): Promise<{ success: boolean; product: Product }> => {
    try {
      const headers = await getAuthHeaders();
      
      console.log("🔄️ Creating new product...");
      console.log("📤 Product data:", productData);
      
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers,
        body: JSON.stringify(productData),
      });

      console.log("📥 Response status:", response.status);
      return await handleResponse(response);
    } catch (error) {
      console.error("❌ Create product error:", error);
      throw error;
    }
  },

  // Update product (Admin)
  updateProduct: async (productId: string, productData: UpdateProductData): Promise<{ success: boolean; product: Product }> => {
    try {
      const headers = await getAuthHeaders();
      
      console.log(`🔄️ Updating product ${productId}...`);
      console.log("📤 Update data:", productData);
      
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(productData),
      });

      console.log("📥 Response status:", response.status);
      return await handleResponse(response);
    } catch (error) {
      console.error("❌ Update product error:", error);
      throw error;
    }
  },

  // Delete product (Admin)
  deleteProduct: async (productId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const headers = await getAuthHeaders();
      
      console.log(`🔄️ Deleting product ${productId}...`);
      
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: "DELETE",
        headers,
      });

      console.log("📥 Response status:", response.status);
      return await handleResponse(response);
    } catch (error) {
      console.error("❌ Delete product error:", error);
      throw error;
    }
  },

  // Get single product
  getProduct: async (productId: string): Promise<{ success: boolean; product: Product }> => {
    try {
      console.log(`🔄️ Fetching product ${productId}...`);
      
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: "GET",
      });

      console.log("📥 Response status:", response.status);
      return await handleResponse(response);
    } catch (error) {
      console.error("❌ Get product error:", error);
      throw error;
    }
  },
}; 