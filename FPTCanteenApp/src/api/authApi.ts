import AsyncStorage from "@react-native-async-storage/async-storage";

// --- API Configuration ---

// Để không phải đổi IP LAN, hãy dùng public URL (ngrok, cloud, ...)
// Đổi URL này thành URL ngrok/public của bạn khi cần, ví dụ:
// const API_BASE_URL = "https://your-ngrok-url.ngrok-free.app/api";
// Hoặc dùng biến môi trường nếu build production
// IMPORTANT: Nếu test trên thiết bị thật, hãy thay 'localhost' bằng IP LAN của máy tính.
// Ví dụ: http://192.168.1.100:8080/api
const API_BASE_URL = "http://192.168.2.6:8080/api";


// --- Type Definitions ---
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  studentCode: string;
  major: string;
  year: string;
  class: string;
  phone?: string;
  gender?: "male" | "female" | "other";
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  studentCode: string;
  major: string;
  year: string;
  class: string;
  phone?: string;
  gender?: string;
  avatar?: string;
  favorites: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface ApiError {
  success: false;
  message: string;
}

// Helper function để handle API response
const handleResponse = async (response: Response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

// Helper function để debug network issues
const debugNetworkError = (error: any, url: string) => {
  console.log("🔍 Network Debug Info:");
  console.log("URL:", url);
  console.log("Error type:", error.name);
  console.log("Error message:", error.message);
  console.log("Full error:", error);

  if (error.message === "Network request failed") {
    console.log("❌ Possible causes:");
    console.log("1. Backend server not running");
    console.log("2. Wrong URL/IP address");
    console.log("3. CORS issues");
    console.log("4. Firewall blocking request");
    console.log("💡 Try: Check if backend is running on localhost:8080");
  }
};

// Authentication API functions
export const authApi = {
  // Đăng nhập
  login: async (loginData: LoginData): Promise<AuthResponse> => {
    try {
      console.log("🔑 Attempting login to:", `${API_BASE_URL}/auth/login`);
      console.log("📤 Login data:", {
        email: loginData.email,
        password: "***",
      });

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      console.log("📥 Response status:", response.status);
      console.log("📥 Response ok:", response.ok);

      return await handleResponse(response);
    } catch (error) {
      console.error("❌ Login error:", error);
      debugNetworkError(error, `${API_BASE_URL}/auth/login`);
      throw error;
    }
  },

  // Đăng ký
  register: async (registerData: RegisterData): Promise<AuthResponse> => {
    try {
      console.log(
        "📝 Attempting register to:",
        `${API_BASE_URL}/auth/register`
      );
      console.log("📤 Register data:", { ...registerData, password: "***" });

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      });

      console.log("📥 Response status:", response.status);
      console.log("📥 Response ok:", response.ok);

      return await handleResponse(response);
    } catch (error) {
      console.error("❌ Register error:", error);
      debugNetworkError(error, `${API_BASE_URL}/auth/register`);
      throw error;
    }
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: async (
    token: string
  ): Promise<{ success: boolean; user: User }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      return await handleResponse(response);
    } catch (error) {
      console.error("Get current user error:", error);
      throw error;
    }
  },
};

// Storage functions cho token
export const tokenStorage = {
  setToken: async (token: string) => {
    try {
      await AsyncStorage.setItem("authToken", token);
    } catch (error) {
      console.error("Error saving token:", error);
    }
  },

  getToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem("authToken");
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  },

  removeToken: async () => {
    try {
      await AsyncStorage.removeItem("authToken");
    } catch (error) {
      console.error("Error removing token:", error);
    }
  },

  setUser: async (user: User) => {
    try {
      await AsyncStorage.setItem("userData", JSON.stringify(user));
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  },

  getUser: async (): Promise<User | null> => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  },

  removeUser: async () => {
    try {
      await AsyncStorage.removeItem("userData");
    } catch (error) {
      console.error("Error removing user data:", error);
    }
  },
};
