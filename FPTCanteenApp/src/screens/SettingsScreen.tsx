import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { ThemedView } from "../components/ThemedView";
import { ThemedText } from "../components/ThemedText";
import { aiService } from "../services/aiService";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const [aiType, setAiType] = useState<"local" | "gemini">("local");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Tự động enable Gemini nếu có API key trong service
      if (aiService.isGeminiEnabled()) {
        setAiType("gemini");
      } else {
        setAiType("local");
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const handleAiTypeChange = (type: "local" | "gemini") => {
    setAiType(type);

    switch (type) {
      case "local":
        aiService.setUseLocalAI(true);
        break;
      case "gemini":
        aiService.enableGemini();
        break;
    }
  };

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      { text: "Đăng xuất", style: "destructive" },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Xóa tài khoản",
      "Hành động này không thể hoàn tác. Bạn có chắc chắn?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", style: "destructive" },
      ]
    );
  };

  const getAiTypeDescription = () => {
    switch (aiType) {
      case "local":
        return "AI thông minh chạy offline, không cần internet";
      case "gemini":
        return "AI miễn phí từ Google Gemini (60 requests/phút)";
      default:
        return "";
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ThemedText style={styles.title}>Cài đặt</ThemedText>

        {/* AI Configuration Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>🤖 AI Assistant</ThemedText>

          <View style={styles.aiTypeContainer}>
            <ThemedText style={styles.settingLabel}>Loại AI:</ThemedText>
            <ThemedText style={styles.aiDescription}>
              {getAiTypeDescription()}
            </ThemedText>

            <View style={styles.aiOptions}>
              <TouchableOpacity
                style={[
                  styles.aiOption,
                  aiType === "local" && styles.aiOptionActive,
                ]}
                onPress={() => handleAiTypeChange("local")}
              >
                <ThemedText
                  style={[
                    styles.aiOptionText,
                    aiType === "local" && styles.aiOptionTextActive,
                  ]}
                >
                  🏠 Local AI
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.aiOption,
                  aiType === "gemini" && styles.aiOptionActive,
                ]}
                onPress={() => handleAiTypeChange("gemini")}
              >
                <ThemedText
                  style={[
                    styles.aiOptionText,
                    aiType === "gemini" && styles.aiOptionTextActive,
                  ]}
                >
                  🤖 Google Gemini (Free)
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>🔔 Thông báo</ThemedText>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <ThemedText style={styles.settingLabel}>Thông báo đẩy</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Nhận thông báo về đơn hàng và khuyến mãi
              </ThemedText>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={notificationsEnabled ? "#f5dd4b" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>🎨 Giao diện</ThemedText>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <ThemedText style={styles.settingLabel}>Chế độ tối</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Giao diện tối để bảo vệ mắt
              </ThemedText>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={darkModeEnabled ? "#f5dd4b" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>🔒 Bảo mật</ThemedText>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <ThemedText style={styles.settingLabel}>
                Đăng nhập sinh trắc học
              </ThemedText>
              <ThemedText style={styles.settingDescription}>
                Sử dụng vân tay hoặc Face ID
              </ThemedText>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={biometricEnabled ? "#f5dd4b" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>👤 Tài khoản</ThemedText>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingContent}>
              <ThemedText style={styles.settingLabel}>
                Thông tin cá nhân
              </ThemedText>
              <ThemedText style={styles.settingDescription}>
                Cập nhật thông tin cá nhân
              </ThemedText>
            </View>
            <ThemedText style={styles.chevron}>›</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingContent}>
              <ThemedText style={styles.settingLabel}>Đổi mật khẩu</ThemedText>
              <ThemedText style={styles.settingDescription}>
                Thay đổi mật khẩu tài khoản
              </ThemedText>
            </View>
            <ThemedText style={styles.chevron}>›</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
            <View style={styles.settingContent}>
              <ThemedText style={[styles.settingLabel, styles.dangerText]}>
                Đăng xuất
              </ThemedText>
            </View>
            <ThemedText style={styles.chevron}>›</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleDeleteAccount}
          >
            <View style={styles.settingContent}>
              <ThemedText style={[styles.settingLabel, styles.dangerText]}>
                Xóa tài khoản
              </ThemedText>
              <ThemedText style={styles.settingDescription}>
                Xóa vĩnh viễn tài khoản
              </ThemedText>
            </View>
            <ThemedText style={styles.chevron}>›</ThemedText>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>ℹ️ Thông tin</ThemedText>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingContent}>
              <ThemedText style={styles.settingLabel}>Phiên bản</ThemedText>
              <ThemedText style={styles.settingValue}>1.0.0</ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingContent}>
              <ThemedText style={styles.settingLabel}>
                Điều khoản sử dụng
              </ThemedText>
            </View>
            <ThemedText style={styles.chevron}>›</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingContent}>
              <ThemedText style={styles.settingLabel}>
                Chính sách bảo mật
              </ThemedText>
            </View>
            <ThemedText style={styles.chevron}>›</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: "#666",
  },
  settingValue: {
    fontSize: 14,
    color: "#007AFF",
  },
  chevron: {
    fontSize: 18,
    color: "#999",
  },
  dangerText: {
    color: "#FF3B30",
  },
  aiTypeContainer: {
    marginBottom: 20,
  },
  aiDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  aiOptions: {
    flexDirection: "row",
    gap: 10,
  },
  aiOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    alignItems: "center",
  },
  aiOptionActive: {
    borderColor: "#007AFF",
    backgroundColor: "#007AFF10",
  },
  aiOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  aiOptionTextActive: {
    color: "#007AFF",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  saveButton: {
    backgroundColor: "#007AFF",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "500",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
});
