import { User } from "./authApi";
import { tokenStorage } from "./authApi";

const API_BASE_URL = "http://192.168.1.2:8080/api"; // ✅ Using your computer's IP

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
};
