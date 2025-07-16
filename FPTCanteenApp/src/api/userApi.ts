import { User, tokenStorage } from "./authApi";
import { Product } from "./productApi";

import { API_BASE_URL } from "./config";

export interface UpdateProfileData {
  fullName?: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: "male" | "female" | "other";
}

interface UpdateProfileResponse {
  success: boolean;
  user: User;
}

export interface GetFavoritesResponse {
  success: boolean;
  favorites: Product[];
}

export interface Notification {
  _id: string;
  user?: string | null;
  title: string;
  message: string;
  type: "system" | "order" | "promotion" | "custom";
  relatedPromotion?: {
    _id: string;
    title: string;
  };
  read: boolean;
  createdAt: string;
}

export interface GetNotificationsResponse {
  success: boolean;
  count: number;
  notifications: Notification[];
}

// Helper function to handle API response
const handleResponse = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
};

export const userApi = {
  // Update user profile
  updateProfile: async (
    updateData: UpdateProfileData
  ): Promise<UpdateProfileResponse> => {
    try {
      const token = await tokenStorage.getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log("🔄️ Attempting to update profile...");
      console.log("📤 Update data:", updateData);

      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      console.log("📥 Response status:", response.status);
      return await handleResponse(response);
    } catch (error) {
      console.error("❌ Update profile error:", error);
      throw error;
    }
  },
  getFavorites: async (): Promise<GetFavoritesResponse> => {
    const token = await tokenStorage.getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }
    const response = await fetch(`${API_BASE_URL}/users/favorites`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch favorites");

    return await response.json();
  },
  addFavorite: async (productId: string): Promise<{ success: boolean }> => {
    const token = await tokenStorage.getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/users/favorites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to add favorite");
    }

    return await response.json();
  },
  removeFavorite: async (productId: string): Promise<{ success: boolean }> => {
    const token = await tokenStorage.getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(
      `${API_BASE_URL}/users/favorites/${productId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to remove favorite");
    }

    return await response.json();
  },
  getNotifications: async (): Promise<GetNotificationsResponse> => {
    const token = await tokenStorage.getToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${API_BASE_URL}/users/notifications`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch notifications");
    }

    return await response.json();
  },

  deleteNotification: async (
    notificationId: string
  ): Promise<{ success: boolean; message: string }> => {
    const token = await tokenStorage.getToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(
      `${API_BASE_URL}/users/notifications/${notificationId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete notification");
    }

    return await response.json();
  },
};
