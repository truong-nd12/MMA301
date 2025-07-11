import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { Ionicons } from "@expo/vector-icons";
import { authApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
// import NetworkDebug from "../components/NetworkDebug"; // BƯỚC 1: Xóa import

const { width } = Dimensions.get("window");

const LoginScreen = ({ navigation }: any) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Lỗi", "Email không hợp lệ");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.login({
        email: email.trim(),
        password: password.trim(),
      });

      if (response.success) {
        // Sử dụng AuthContext để login
        await login(response.user, response.token);

        Alert.alert(
          "Đăng nhập thành công",
          `Chào mừng ${response.user.fullName}!`
        );
        // Navigation sẽ tự động thay đổi nhờ AuthStack
      } else {
        Alert.alert("Lỗi", "Đăng nhập thất bại");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      Alert.alert(
        "Đăng nhập thất bại",
        error.message || "Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f5f6fa" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Animatable.View
        animation="fadeInRight"
        duration={700}
        style={styles.container}
      >
        {/* <NetworkDebug apiUrl="http://localhost:8080/api" /> */}{" "}
        {/* BƯỚC 2: Xóa component */}
        <Text style={styles.title}>Đăng nhập</Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="mail-outline"
            size={22}
            color="#aaa"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#aaa"
            editable={!isLoading}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={22}
            color="#aaa"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secure}
            placeholderTextColor="#aaa"
            editable={!isLoading}
          />
          <TouchableOpacity onPress={() => setSecure(!secure)}>
            <Ionicons
              name={secure ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#aaa"
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          activeOpacity={0.8}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Đăng nhập</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.link}>
            Chưa có tài khoản?{" "}
            <Text style={{ color: "#007AFF", fontWeight: "bold" }}>
              Đăng ký
            </Text>
          </Text>
        </TouchableOpacity>
      </Animatable.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#222",
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#eee",
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    width: "100%",
    height: 52,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#222",
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 18,
    width: "100%",
    shadowColor: "#007AFF",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  link: {
    color: "#8E8E93",
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default LoginScreen;
