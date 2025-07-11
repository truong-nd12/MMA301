import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { authApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

const { width } = Dimensions.get("window");

// Component InputField được đơn giản hóa
// Nó được giữ tách biệt để tránh lỗi bàn phím tự ẩn
interface InputFieldProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  iconName: keyof typeof Ionicons.glyphMap;
  secureTextEntry?: boolean;
  onToggleSecure?: () => void;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}

const InputField: React.FC<InputFieldProps> = ({
  placeholder,
  value,
  onChangeText,
  iconName,
  secureTextEntry,
  onToggleSecure,
  keyboardType = "default",
  autoCapitalize = "sentences",
}) => {
  return (
    <View style={styles.inputContainer}>
      <Ionicons name={iconName} size={22} color="#aaa" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
      {onToggleSecure && (
        <TouchableOpacity onPress={onToggleSecure}>
          <Ionicons
            name={secureTextEntry ? "eye-off-outline" : "eye-outline"}
            size={22}
            color="#aaa"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const RegisterScreen = ({ navigation }: any) => {
  const { login } = useAuth();

  // State cho các trường input
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");
  const [className, setClassName] = useState("");

  // State cho giao diện
  const [secure, setSecure] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    // Validate required fields
    if (
      !email ||
      !password ||
      !confirmPassword ||
      !fullName ||
      !username ||
      !studentCode ||
      !major ||
      !year ||
      !className
    ) {
      Alert.alert(
        "Thông tin chưa đủ",
        "Vui lòng điền đầy đủ các trường có dấu *"
      );
      return;
    }

    // ... (Các bước validation khác giữ nguyên)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert(
        "Email không hợp lệ",
        "Vui lòng nhập một địa chỉ email đúng định dạng."
      );
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(
        "Mật khẩu không khớp",
        "Mật khẩu và mật khẩu xác nhận phải giống nhau."
      );
      return;
    }
    if (password.length < 6) {
      Alert.alert("Mật khẩu quá ngắn", "Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (studentCode.length !== 6) {
      Alert.alert(
        "Mã sinh viên không hợp lệ",
        "Mã sinh viên phải có đúng 6 ký tự."
      );
      return;
    }

    setIsLoading(true);

    // Đảm bảo loading indicator hiển thị ít nhất 1 giây
    const minimumPromise = new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const registerData = {
        username: username.trim(),
        email: email.trim(),
        password: password.trim(),
        fullName: fullName.trim(),
        studentCode: studentCode.trim(),
        major: major.trim(),
        year: year.trim(),
        class: className.trim(),
        phone: phone.trim() || undefined,
        gender: "other" as const,
      };

      const [response] = await Promise.all([
        authApi.register(registerData),
        minimumPromise,
      ]);

      if (response.success) {
        await login(response.user, response.token);
        Alert.alert(
          "Đăng ký thành công",
          `Chào mừng ${response.user.fullName}!`
        );
      }
    } catch (error: any) {
      Alert.alert(
        "Đăng ký thất bại",
        error.message || "Có lỗi xảy ra, vui lòng thử lại sau."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={28} color="#222" />
          </TouchableOpacity>
          <Text style={styles.title}>Tạo tài khoản</Text>
          <Text style={styles.subtitle}>
            Điền thông tin của bạn để bắt đầu.
          </Text>
        </View>

        <View style={styles.form}>
          <InputField
            placeholder="Họ và tên *"
            value={fullName}
            onChangeText={setFullName}
            iconName="person-outline"
            autoCapitalize="words"
          />
          <InputField
            placeholder="Tên đăng nhập *"
            value={username}
            onChangeText={setUsername}
            iconName="at-outline"
            autoCapitalize="none"
          />
          <InputField
            placeholder="Email *"
            value={email}
            onChangeText={setEmail}
            iconName="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <InputField
            placeholder="Mã sinh viên (6 số) *"
            value={studentCode}
            onChangeText={setStudentCode}
            iconName="card-outline"
            keyboardType="numeric"
          />
          <InputField
            placeholder="Chuyên ngành *"
            value={major}
            onChangeText={setMajor}
            iconName="school-outline"
            autoCapitalize="words"
          />
          <InputField
            placeholder="Năm học (1-4) *"
            value={year}
            onChangeText={setYear}
            iconName="calendar-outline"
            keyboardType="numeric"
          />
          <InputField
            placeholder="Lớp *"
            value={className}
            onChangeText={setClassName}
            iconName="people-outline"
            autoCapitalize="words"
          />
          <InputField
            placeholder="Số điện thoại"
            value={phone}
            onChangeText={setPhone}
            iconName="call-outline"
            keyboardType="phone-pad"
          />
          <InputField
            placeholder="Mật khẩu *"
            value={password}
            onChangeText={setPassword}
            iconName="lock-closed-outline"
            secureTextEntry={secure}
            onToggleSecure={() => setSecure(!secure)}
          />
          <InputField
            placeholder="Xác nhận mật khẩu *"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            iconName="lock-closed-outline"
            secureTextEntry={secureConfirm}
            onToggleSecure={() => setSecureConfirm(!secureConfirm)}
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Đăng ký</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          style={styles.loginLink}
        >
          <Text style={styles.linkText}>
            Đã có tài khoản? <Text style={styles.linkBold}>Đăng nhập ngay</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// --- Giao diện mới, đơn giản và sạch sẽ ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    width: "100%",
    marginBottom: 32,
    alignItems: "center",
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 0,
    top: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#222",
    textAlign: "center",
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
    paddingHorizontal: 16,
    height: 56,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    width: "100%",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  loginLink: {
    marginTop: 24,
    alignItems: "center",
  },
  linkText: {
    color: "#8E8E93",
    fontSize: 16,
  },
  linkBold: {
    color: "#007AFF",
    fontWeight: "bold",
  },
});

export default RegisterScreen;
