import { tokenStorage } from "./authApi";

const API_BASE_URL = "http://192.168.2.6:8080/api";
// Type definitions
export interface AdminUser {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  studentCode: string;
  major: string;
  year: string;
  class: string;
  phone?: string;
  gender?: "male" | "female" | "other";
  role: "user" | "admin";
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

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

export const adminApi = {
  // Get all users (Admin only)
  getAllUsers: async (): Promise<{ success: boolean; count: number; users: AdminUser[] }> => {
    try {
      const headers = await getAuthHeaders();
      
      console.log("🔄️ Fetching all users (Admin)...");
      
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "GET",
        headers,
      });

      console.log("📥 Response status:", response.status);
      return await handleResponse(response);
    } catch (error) {
      console.error("❌ Get all users error:", error);
      throw error;
    }
  },

  // Get single user (Admin only)
  getUser: async (userId: string): Promise<{ success: boolean; user: AdminUser }> => {
    try {
      const headers = await getAuthHeaders();
      
      console.log(`🔄️ Fetching user ${userId} (Admin)...`);
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "GET",
        headers,
      });

      console.log("📥 Response status:", response.status);
      return await handleResponse(response);
    } catch (error) {
      console.error("❌ Get user error:", error);
      throw error;
    }
  },

  // Delete user (Admin only)
  deleteUser: async (userId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const headers = await getAuthHeaders();
      
      console.log(`🔄️ Deleting user ${userId} (Admin)...`);
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "DELETE",
        headers,
      });

      console.log("📥 Response status:", response.status);
      return await handleResponse(response);
    } catch (error) {
      console.error("❌ Delete user error:", error);
      throw error;
    }
  },

  // Update user status (Admin only)
  updateUserStatus: async (userId: string, isActive: boolean): Promise<{ success: boolean; user: AdminUser }> => {
    try {
      const headers = await getAuthHeaders();
      
      console.log(`🔄️ Updating user ${userId} status to ${isActive} (Admin)...`);
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ isActive }),
      });

      console.log("📥 Response status:", response.status);
      return await handleResponse(response);
    } catch (error) {
      console.error("❌ Update user status error:", error);
      throw error;
    }
  },
}; 